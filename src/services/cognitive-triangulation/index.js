import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import neo4j from 'neo4j-driver';
import Database from 'better-sqlite3';
import { EntityScout } from './entity-scout.js';
import { processFileAnalysis } from './file-analysis-worker.js';
import { processRelationshipResolution } from './relationship-worker.js';
import { processGraphBuilding } from './graph-building-worker.js';
import { GraphBuilder } from './graph-builder.js';
import { Logger } from '../../utils/logger.js';

export class CognitiveTriangulationService {
  constructor(config = {}) {
    this.logger = new Logger('CognitiveTriangulation');
    this.config = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      neo4j: {
        uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
        user: process.env.NEO4J_USER || 'neo4j',
        password: process.env.NEO4J_PASSWORD || 'test1234',
      },
      sqlite: {
        path: process.env.SQLITE_PATH || './cognitive-triangulation.db',
      },
      llm: {
        provider: process.env.LLM_PROVIDER || 'deepseek',
        apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || process.env.CLAUDE_API_KEY,
      },
      ...config
    };
    
    this.isInitialized = false;
  }
  
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize Redis connection
      this.redis = new Redis(this.config.redis);
      await this.redis.ping();
      this.logger.info('Redis connected');
      
      // Initialize Neo4j driver
      this.neo4jDriver = neo4j.driver(
        this.config.neo4j.uri,
        neo4j.auth.basic(this.config.neo4j.user, this.config.neo4j.password)
      );
      await this.neo4jDriver.verifyConnectivity();
      this.logger.info('Neo4j connected');
      
      // Initialize SQLite
      this.sqlite = new Database(this.config.sqlite.path);
      this.initializeSQLiteSchema();
      this.logger.info('SQLite initialized');
      
      // Initialize queues
      this.queues = {
        fileAnalysis: new Queue('file-analysis', { connection: this.redis }),
        relationshipResolution: new Queue('relationship-resolution', { connection: this.redis }),
        graphBuilding: new Queue('graph-building', { connection: this.redis }),
      };
      
      // Initialize services
      this.entityScout = new EntityScout(this.logger);
      this.graphBuilder = new GraphBuilder(this.neo4jDriver, this.logger);
      
      this.isInitialized = true;
      this.logger.info('Cognitive Triangulation Service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize:', error);
      throw error;
    }
  }
  
  initializeSQLiteSchema() {
    // Create tables for POIs, relationships, and outbox pattern
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS pois (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        start_line INTEGER,
        end_line INTEGER,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_poi_id INTEGER,
        target_poi_id INTEGER,
        type TEXT NOT NULL,
        confidence REAL DEFAULT 1.0,
        evidence TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_poi_id) REFERENCES pois(id),
        FOREIGN KEY (target_poi_id) REFERENCES pois(id)
      );
      
      CREATE TABLE IF NOT EXISTS outbox (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed BOOLEAN DEFAULT FALSE
      );
      
      CREATE INDEX IF NOT EXISTS idx_pois_file ON pois(file_path);
      CREATE INDEX IF NOT EXISTS idx_relationships_source ON relationships(source_poi_id);
      CREATE INDEX IF NOT EXISTS idx_outbox_processed ON outbox(processed);
    `);
  }
  
  async analyzeProject(projectPath, options = {}) {
    await this.initialize();
    
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    this.logger.info(`Starting analysis ${analysisId} for ${projectPath}`);
    
    // Phase 1: Discover files
    const files = await this.entityScout.discoverFiles(projectPath, {
      includePatterns: options.includePatterns || ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
      excludePatterns: options.excludePatterns || ['node_modules/**', 'dist/**', 'build/**'],
    });
    
    this.logger.info(`Discovered ${files.length} files`);
    
    // Phase 2: Queue files for analysis
    const jobs = [];
    for (const file of files) {
      const job = await this.queues.fileAnalysis.add('analyze-file', {
        analysisId,
        filePath: file.path,
        content: file.content,
      });
      jobs.push(job);
    }
    
    // Start workers if not already running
    this.startWorkers();
    
    return {
      analysisId,
      status: 'processing',
      totalFiles: files.length,
      message: `Analysis started. ${files.length} files queued for processing.`,
    };
  }
  
  startWorkers() {
    // File Analysis Worker
    if (!this.fileAnalysisWorker) {
      this.fileAnalysisWorker = new Worker(
        'file-analysis',
        async (job) => {
          const result = await processFileAnalysis(job);
          
          // Store POIs in SQLite
          const stmt = this.sqlite.prepare(`
            INSERT INTO pois (file_path, name, type, start_line, end_line, metadata)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          
          for (const poi of result.pois) {
            stmt.run(
              result.filePath,
              poi.name,
              poi.type,
              poi.startLine,
              poi.endLine,
              JSON.stringify(poi.metadata || {})
            );
          }
          
          // Queue for relationship resolution
          await this.queues.relationshipResolution.add('resolve-relationships', {
            analysisId: result.analysisId,
            filePath: result.filePath,
            pois: result.pois,
          });
          
          return { processed: result.count };
        },
        { connection: this.redis }
      );
    }
    
    // Relationship Resolution Worker
    if (!this.relationshipWorker) {
      this.relationshipWorker = new Worker(
        'relationship-resolution',
        async (job) => {
          const result = await processRelationshipResolution(job);
          
          // Store relationships and queue for graph building
          for (const rel of result.relationships) {
            await this.queues.graphBuilding.add('build-graph', {
              analysisId: result.analysisId,
              relationship: rel,
            });
          }
          
          return { processed: result.count };
        },
        { connection: this.redis }
      );
    }
    
    // Graph Building Worker
    if (!this.graphBuildingWorker) {
      this.graphBuildingWorker = new Worker(
        'graph-building',
        async (job) => {
          const { analysisId, relationship } = job.data;
          
          // Create nodes and relationships in Neo4j
          await this.graphBuilder.createPOINode(relationship.source, analysisId);
          await this.graphBuilder.createPOINode(relationship.target, analysisId);
          await this.graphBuilder.createRelationship(
            relationship.source,
            relationship.target,
            relationship
          );
          
          return { processed: 1 };
        },
        { connection: this.redis }
      );
    }
  }
  
  async extractPOIs(filePath, content) {
    // This would use the LLM to extract POIs
    // For now, a simplified version
    const pois = [];
    
    // Simple regex-based extraction as fallback
    const functionRegex = /(?:function|const|let|var)\s+(\w+)\s*(?:=\s*)?(?:\([^)]*\)\s*=>|\([^)]*\)\s*{|function\s*\([^)]*\)\s*{)/g;
    const classRegex = /class\s+(\w+)(?:\s+extends\s+\w+)?\s*{/g;
    
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      pois.push({
        name: match[1],
        type: 'function',
        startLine: content.substring(0, match.index).split('\n').length,
        endLine: null, // Would be calculated properly
      });
    }
    
    while ((match = classRegex.exec(content)) !== null) {
      pois.push({
        name: match[1],
        type: 'class',
        startLine: content.substring(0, match.index).split('\n').length,
        endLine: null,
      });
    }
    
    return pois;
  }
  
  async getAnalysisStatus(analysisId) {
    const stats = {
      filesProcessed: 0,
      poisExtracted: 0,
      relationshipsFound: 0,
    };
    
    // Query SQLite for stats
    const poiCount = this.sqlite.prepare('SELECT COUNT(*) as count FROM pois').get();
    stats.poisExtracted = poiCount.count;
    
    const relCount = this.sqlite.prepare('SELECT COUNT(*) as count FROM relationships').get();
    stats.relationshipsFound = relCount.count;
    
    return {
      analysisId,
      status: 'processing',
      stats,
    };
  }
  
  async queryGraph(cypherQuery) {
    const session = this.neo4jDriver.session();
    try {
      const result = await session.run(cypherQuery);
      return {
        records: result.records.map(record => record.toObject()),
      };
    } finally {
      await session.close();
    }
  }
  
  async shutdown() {
    if (this.redis) await this.redis.quit();
    if (this.neo4jDriver) await this.neo4jDriver.close();
    if (this.sqlite) this.sqlite.close();
    this.logger.info('Cognitive Triangulation Service shut down');
  }
}

// Singleton instance
let instance = null;

export function getCognitiveTriangulationService() {
  if (!instance) {
    instance = new CognitiveTriangulationService();
  }
  return instance;
}