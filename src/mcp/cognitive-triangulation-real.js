import { getCognitiveTriangulationService } from '../services/cognitive-triangulation/index.js';

export function createRealCognitiveTriangulationTools(logger) {
  const service = getCognitiveTriangulationService();
  
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
          
          const result = await service.analyzeProject(input.directory, {
            includePatterns: input.includePatterns,
            excludePatterns: input.excludePatterns,
          });
          
          return {
            success: true,
            ...result,
            neo4jUrl: 'http://localhost:7474',
            message: `Analysis started. View progress at http://localhost:7474 (neo4j/test1234)`
          };
        } catch (error) {
          logger.error('Analysis failed:', error);
          
          if (error.message.includes('ECONNREFUSED')) {
            return {
              success: false,
              error: 'Services not running. Please run: docker-compose up -d',
              instructions: [
                '1. cd claude-flow-enhanced',
                '2. docker-compose up -d',
                '3. Wait for services to start',
                '4. Try again'
              ]
            };
          }
          
          return {
            success: false,
            error: error.message
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