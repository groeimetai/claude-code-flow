import { getCognitiveTriangulationService } from './index.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Logger } from '../../utils/logger.js';

const execAsync = promisify(exec);

export class CognitiveTriangulationAutoManager {
  constructor() {
    this.logger = new Logger('CT-AutoManager');
    this.isStarting = false;
    this.startPromise = null;
    this.healthCheckInterval = null;
  }
  
  async ensureServicesRunning() {
    // If already starting, wait for that to complete
    if (this.startPromise) {
      return await this.startPromise;
    }
    
    // Check if services are healthy
    if (await this.areServicesHealthy()) {
      return true;
    }
    
    // Start services
    this.startPromise = this.startServices();
    const result = await this.startPromise;
    this.startPromise = null;
    
    return result;
  }
  
  async areServicesHealthy() {
    try {
      const service = getCognitiveTriangulationService();
      await service.initialize();
      
      // Try a simple query to verify everything works
      await service.queryGraph('RETURN 1 as test LIMIT 1');
      
      return true;
    } catch (error) {
      if (error.message.includes('ECONNREFUSED') || 
          error.message.includes('connect') ||
          error.message.includes('Neo4j')) {
        return false;
      }
      // Other errors might be query errors, not connection errors
      return true;
    }
  }
  
  async startServices() {
    this.logger.info('Auto-starting Cognitive Triangulation services...');
    
    try {
      // Check if Docker is running
      try {
        await execAsync('docker info');
      } catch (error) {
        this.logger.warn('Docker is not running. Cognitive Triangulation requires Docker.');
        return false;
      }
      
      // Check if services are already running
      const psResult = await execAsync('docker ps --format "table {{.Names}}\t{{.Status}}"');
      const runningContainers = psResult.stdout;
      
      if (runningContainers.includes('redis') && runningContainers.includes('neo4j')) {
        this.logger.info('Services are already running');
        return true;
      }
      
      // Start services using docker-compose
      this.logger.info('Starting Redis and Neo4j via docker-compose...');
      
      const projectRoot = process.cwd();
      await execAsync('docker-compose up -d', { cwd: projectRoot });
      
      // Wait for services to be ready
      this.logger.info('Waiting for services to be ready...');
      
      for (let i = 0; i < 60; i++) {
        if (await this.areServicesHealthy()) {
          this.logger.info('Services are ready!');
          
          // Start health monitoring
          this.startHealthMonitoring();
          
          return true;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (i % 10 === 0) {
          this.logger.info(`Still waiting... (${i}s)`);
        }
      }
      
      throw new Error('Services did not start in time');
    } catch (error) {
      this.logger.error('Failed to start services:', error.message);
      
      // Provide helpful error messages
      if (error.message.includes('docker-compose: command not found')) {
        this.logger.error('Docker Compose is not installed. Please install Docker Desktop.');
      } else if (error.message.includes('Cannot connect to the Docker daemon')) {
        this.logger.error('Docker is not running. Please start Docker Desktop.');
      }
      
      return false;
    }
  }
  
  startHealthMonitoring() {
    // Monitor health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      if (!await this.areServicesHealthy()) {
        this.logger.warn('Services appear to be down, attempting restart...');
        await this.startServices();
      }
    }, 30000);
  }
  
  async stopServices() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    try {
      await execAsync('docker-compose down');
      this.logger.info('Services stopped');
    } catch (error) {
      this.logger.error('Failed to stop services:', error.message);
    }
  }
  
  // Get Neo4j connection info for users
  getNeo4jInfo() {
    return {
      url: 'http://localhost:7474',
      username: 'neo4j',
      password: 'test1234',
      message: 'Open Neo4j Browser to explore the knowledge graph'
    };
  }
  
  // Create project-specific view in Neo4j
  async createProjectView(analysisId, projectName) {
    const service = getCognitiveTriangulationService();
    
    try {
      // Create a saved query for this project
      await service.queryGraph(`
        CREATE (q:SavedQuery {
          id: $analysisId,
          name: $projectName,
          description: 'Knowledge graph for ' + $projectName,
          query: 'MATCH (n:POI {analysisId: "' + $analysisId + '"}) RETURN n',
          createdAt: datetime()
        })
      `, { analysisId, projectName });
      
      this.logger.info(`Created project view for ${projectName}`);
    } catch (error) {
      this.logger.warn('Could not create project view:', error.message);
    }
  }
}

// Singleton
let instance = null;

export function getAutoManager() {
  if (!instance) {
    instance = new CognitiveTriangulationAutoManager();
  }
  return instance;
}