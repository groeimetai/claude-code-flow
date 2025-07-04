// Proxy to real Cognitive Triangulation Pipeline MCP server
// This connects to the actual running service instead of using stubs

import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';

const execAsync = promisify(exec);

export class CognitiveTriangulationProxy {
  constructor(logger) {
    this.logger = logger;
    this.baseUrl = process.env.COGNITIVE_TRIANGULATION_URL || 'http://localhost:3010';
    this.mcpPort = process.env.COGNITIVE_TRIANGULATION_MCP_PORT || 3011;
  }
  
  // Check if the real service is running
  async isServiceRunning() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  // Start the service if not running
  async ensureServiceRunning() {
    if (await this.isServiceRunning()) {
      this.logger.info('Cognitive Triangulation service is already running');
      return true;
    }
    
    this.logger.info('Starting Cognitive Triangulation service...');
    
    try {
      // Try to start the service
      const ctPath = process.env.COGNITIVE_TRIANGULATION_PATH || 
                    '/Users/nielsvanderwerf/Projects/cognitive-triangulation-pipeline-mcp/Cognitive-Triangulation-Pipeline';
      
      await execAsync(`cd ${ctPath} && npm run start:services`, {
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      // Wait for service to be ready
      for (let i = 0; i < 30; i++) {
        if (await this.isServiceRunning()) {
          this.logger.info('Cognitive Triangulation service started successfully');
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      throw new Error('Service did not start in time');
    } catch (error) {
      this.logger.error('Failed to start Cognitive Triangulation service:', error);
      return false;
    }
  }
  
  // Create MCP tools that proxy to the real service
  createProxyTools() {
    return [
      {
        name: 'cognitive_triangulation/analyze_codebase',
        description: 'Analyze codebase structure and create knowledge graph (requires running service)',
        inputSchema: {
          type: 'object',
          properties: {
            directory: { type: 'string', description: 'Directory to analyze' },
            includePatterns: { type: 'array', items: { type: 'string' } },
            excludePatterns: { type: 'array', items: { type: 'string' } },
            maxDepth: { type: 'number', default: 10 }
          },
          required: ['directory']
        },
        execute: async (input) => {
          // Ensure service is running
          if (!await this.ensureServiceRunning()) {
            return {
              success: false,
              error: 'Cognitive Triangulation service is not running. Please start it manually or configure the environment.'
            };
          }
          
          try {
            // Call the real API
            const response = await fetch(`${this.baseUrl}/api/analyze`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectPath: input.directory,
                includePatterns: input.includePatterns,
                excludePatterns: input.excludePatterns
              })
            });
            
            if (!response.ok) {
              throw new Error(`API returned ${response.status}`);
            }
            
            const result = await response.json();
            
            return {
              success: true,
              analysisId: result.analysisId,
              status: result.status,
              message: 'Analysis started. Use cognitive_triangulation/get_status to check progress.',
              graphUrl: `${this.baseUrl}/graph/${result.analysisId}`
            };
          } catch (error) {
            this.logger.error('Failed to analyze codebase:', error);
            return {
              success: false,
              error: error.message
            };
          }
        }
      },
      
      {
        name: 'cognitive_triangulation/get_status',
        description: 'Get status of ongoing analysis',
        inputSchema: {
          type: 'object',
          properties: {
            analysisId: { type: 'string', description: 'Analysis ID from analyze_codebase' }
          },
          required: ['analysisId']
        },
        execute: async (input) => {
          try {
            const response = await fetch(`${this.baseUrl}/api/analysis/${input.analysisId}/status`);
            
            if (!response.ok) {
              throw new Error(`API returned ${response.status}`);
            }
            
            const status = await response.json();
            
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
            query: { type: 'string', description: 'Cypher query to execute' },
            analysisId: { type: 'string', description: 'Optional: specific analysis context' }
          },
          required: ['query']
        },
        execute: async (input) => {
          try {
            const response = await fetch(`${this.baseUrl}/api/graph/query`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                cypher: input.query,
                analysisId: input.analysisId
              })
            });
            
            if (!response.ok) {
              throw new Error(`API returned ${response.status}`);
            }
            
            const result = await response.json();
            
            return {
              success: true,
              results: result.results,
              visualizationUrl: result.visualizationUrl
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
}

// Export function to create proxy tools
export function createCognitiveTriangulationProxyTools(logger) {
  const proxy = new CognitiveTriangulationProxy(logger);
  return proxy.createProxyTools();
}