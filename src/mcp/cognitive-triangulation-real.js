import { getCognitiveTriangulationService } from '../services/cognitive-triangulation/index.js';
import { getAutoManager } from '../services/cognitive-triangulation/auto-manager.js';

export function createRealCognitiveTriangulationTools(logger) {
  const service = getCognitiveTriangulationService();
  const autoManager = getAutoManager();
  
  return [
    {
      name: 'cognitive_triangulation/analyze_codebase',
      description: 'Analyze codebase structure and create knowledge graph in Neo4j',
      inputSchema: {
        type: 'object',
        properties: {
          directory: { type: 'string', description: 'Directory to analyze' },
          includePatterns: { 
            type: 'array', 
            items: { type: 'string' },
            default: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx']
          },
          excludePatterns: { 
            type: 'array', 
            items: { type: 'string' },
            default: ['**/node_modules/**', '**/dist/**']
          },
        },
        required: ['directory']
      },
      execute: async (input) => {
        try {
          logger.info('Starting real Cognitive Triangulation analysis:', input.directory);
          
          // Auto-start services if needed
          logger.info('Ensuring services are running...');
          const servicesReady = await autoManager.ensureServicesRunning();
          
          if (!servicesReady) {
            return {
              success: false,
              error: 'Could not start required services automatically',
              instructions: 'Please ensure Docker is installed and running'
            };
          }
          
          // Services are ready, proceed with analysis
          const result = await service.analyzeProject(input.directory, {
            includePatterns: input.includePatterns,
            excludePatterns: input.excludePatterns,
          });
          
          // Extract project name from directory
          const projectName = input.directory.split('/').pop() || 'project';
          
          // Create project view in Neo4j
          await autoManager.createProjectView(result.analysisId, projectName);
          
          // Get Neo4j info
          const neo4jInfo = autoManager.getNeo4jInfo();
          
          return {
            success: true,
            ...result,
            neo4j: neo4jInfo,
            message: `Analysis started! Each project gets its own graph (analysisId: ${result.analysisId}). View in Neo4j Browser.`,
            tip: 'Claude automatically started Neo4j and Redis for you. The knowledge graph is being built in the background.'
          };
        } catch (error) {
          logger.error('Analysis failed:', error);
          
          return {
            success: false,
            error: error.message,
            tip: 'Check if Docker is running'
          };
        }
      }
    },
    
    {
      name: 'cognitive_triangulation/get_status',
      description: 'Get status of cognitive triangulation analysis',
      inputSchema: {
        type: 'object',
        properties: {
          analysisId: { type: 'string', description: 'Analysis ID from analyze_codebase' }
        },
        required: ['analysisId']
      },
      execute: async (input) => {
        try {
          const status = await service.getAnalysisStatus(input.analysisId);
          return {
            success: true,
            ...status
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    },
    
    {
      name: 'cognitive_triangulation/query_graph',
      description: 'Query the knowledge graph with Cypher',
      inputSchema: {
        type: 'object',
        properties: {
          query: { 
            type: 'string', 
            description: 'Cypher query (e.g., MATCH (n:POI) RETURN n LIMIT 10)'
          }
        },
        required: ['query']
      },
      execute: async (input) => {
        try {
          const results = await service.queryGraph(input.query);
          return {
            success: true,
            results: results.records,
            count: results.records.length,
            neo4jUrl: 'http://localhost:7474',
            hint: 'View results visually in Neo4j Browser'
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            hint: error.message.includes('no such table') ? 
              'Make sure services are running: docker-compose up -d' : undefined
          };
        }
      }
    },
    
    {
      name: 'cognitive_triangulation/extract_pois',
      description: 'Extract points of interest from specific files',
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string' },
          content: { type: 'string', description: 'Optional: provide content directly' }
        },
        required: ['filePath']
      },
      execute: async (input) => {
        try {
          // This would use the full extraction logic
          logger.info('Extracting POIs from:', input.filePath);
          
          // For now, use the service's extraction
          const pois = await service.extractPOIs(input.filePath, input.content || '');
          
          return {
            success: true,
            filePath: input.filePath,
            pois,
            count: pois.length
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    }
  ];
}