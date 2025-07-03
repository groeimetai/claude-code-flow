/**
 * Cognitive Triangulation MCP Tools for Claude-Flow
 * Provides advanced code analysis and knowledge graph capabilities
 */

import { MCPTool, MCPContext } from '../utils/types.js';
import { ILogger } from '../core/logger.js';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export interface CognitiveTriangulationContext extends MCPContext {
  cognitiveTriangulationPath?: string;
}

/**
 * Creates Cognitive Triangulation tools for MCP
 */
export function createCognitiveTriangulationTools(logger: ILogger): MCPTool[] {
  const tools: MCPTool[] = [];

  // Analyze Codebase Tool
  tools.push({
    name: 'cognitive_triangulation/analyze_codebase',
    description: 'Analyze an entire codebase using cognitive triangulation to build a comprehensive knowledge graph of code relationships, dependencies, and architecture patterns',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the project directory to analyze',
        },
        outputPath: {
          type: 'string',
          description: 'Path where to store the analysis results (optional)',
        },
        includePatterns: {
          type: 'array',
          items: { type: 'string' },
          description: 'File patterns to include in analysis (e.g., "*.js", "*.ts")',
        },
        excludePatterns: {
          type: 'array',
          items: { type: 'string' },
          description: 'File patterns to exclude from analysis',
        },
      },
      required: ['projectPath'],
    },
    handler: async (input: any, context?: CognitiveTriangulationContext) => {
      try {
        const { projectPath, outputPath, includePatterns, excludePatterns } = input;
        
        // Validate project path
        if (!existsSync(projectPath)) {
          throw new Error(`Project path does not exist: ${projectPath}`);
        }

        logger.info('Starting cognitive triangulation analysis', { projectPath });

        // Find the cognitive triangulation executable
        const cognitiveTriangulationPath = context?.cognitiveTriangulationPath || 
          findCognitiveTriangulationPath();

        if (!cognitiveTriangulationPath) {
          throw new Error('Cognitive Triangulation Pipeline not found. Please ensure it is installed.');
        }

        // Build command arguments
        const args = ['analyze', projectPath];
        
        if (outputPath) {
          args.push('--output', outputPath);
        }
        
        if (includePatterns?.length) {
          args.push('--include', includePatterns.join(','));
        }
        
        if (excludePatterns?.length) {
          args.push('--exclude', excludePatterns.join(','));
        }

        // Execute the analysis
        const result = execSync(`${cognitiveTriangulationPath} ${args.join(' ')}`, {
          encoding: 'utf8',
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        });

        logger.info('Cognitive triangulation analysis completed');

        // Parse and return the results
        try {
          return JSON.parse(result);
        } catch {
          // If not JSON, return as structured response
          return {
            success: true,
            output: result,
            projectPath,
            message: 'Analysis completed successfully',
          };
        }
      } catch (error) {
        logger.error('Cognitive triangulation analysis failed', error);
        throw error;
      }
    },
  });

  // Extract POIs Tool
  tools.push({
    name: 'cognitive_triangulation/extract_pois',
    description: 'Extract Points of Interest (POIs) from specific files using cognitive triangulation, identifying functions, classes, methods, and other significant code structures',
    inputSchema: {
      type: 'object',
      properties: {
        filePaths: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of file paths to analyze for POIs',
        },
        poiTypes: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['function', 'class', 'method', 'interface', 'type', 'variable', 'import', 'export'],
          },
          description: 'Types of POIs to extract (optional, defaults to all)',
        },
        includeContext: {
          type: 'boolean',
          description: 'Include surrounding context for each POI',
          default: false,
        },
      },
      required: ['filePaths'],
    },
    handler: async (input: any, context?: CognitiveTriangulationContext) => {
      try {
        const { filePaths, poiTypes, includeContext } = input;
        
        // Validate file paths
        const validPaths = filePaths.filter((path: string) => existsSync(path));
        if (validPaths.length === 0) {
          throw new Error('No valid file paths provided');
        }

        logger.info('Extracting POIs', { fileCount: validPaths.length });

        const cognitiveTriangulationPath = context?.cognitiveTriangulationPath || 
          findCognitiveTriangulationPath();

        if (!cognitiveTriangulationPath) {
          throw new Error('Cognitive Triangulation Pipeline not found');
        }

        // Build command
        const args = ['extract-pois'];
        args.push(...validPaths);
        
        if (poiTypes?.length) {
          args.push('--types', poiTypes.join(','));
        }
        
        if (includeContext) {
          args.push('--context');
        }

        const result = execSync(`${cognitiveTriangulationPath} ${args.join(' ')}`, {
          encoding: 'utf8',
          maxBuffer: 10 * 1024 * 1024,
        });

        logger.info('POI extraction completed');

        try {
          return JSON.parse(result);
        } catch {
          return {
            success: true,
            output: result,
            filesAnalyzed: validPaths.length,
          };
        }
      } catch (error) {
        logger.error('POI extraction failed', error);
        throw error;
      }
    },
  });

  // Query Relationships Tool
  tools.push({
    name: 'cognitive_triangulation/query_relationships',
    description: 'Query code relationships and dependencies using the cognitive triangulation knowledge graph',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language query about code relationships',
        },
        scope: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Limit query to specific files',
            },
            directories: {
              type: 'array',
              items: { type: 'string' },
              description: 'Limit query to specific directories',
            },
          },
        },
        depth: {
          type: 'number',
          description: 'Maximum depth of relationship traversal',
          default: 3,
        },
      },
      required: ['query'],
    },
    handler: async (input: any, context?: CognitiveTriangulationContext) => {
      try {
        const { query, scope, depth } = input;
        
        logger.info('Querying relationships', { query });

        const cognitiveTriangulationPath = context?.cognitiveTriangulationPath || 
          findCognitiveTriangulationPath();

        if (!cognitiveTriangulationPath) {
          throw new Error('Cognitive Triangulation Pipeline not found');
        }

        const args = ['query', query];
        
        if (scope?.files?.length) {
          args.push('--files', scope.files.join(','));
        }
        
        if (scope?.directories?.length) {
          args.push('--dirs', scope.directories.join(','));
        }
        
        if (depth !== undefined) {
          args.push('--depth', depth.toString());
        }

        const result = execSync(`${cognitiveTriangulationPath} ${args.join(' ')}`, {
          encoding: 'utf8',
          maxBuffer: 10 * 1024 * 1024,
        });

        logger.info('Relationship query completed');

        try {
          return JSON.parse(result);
        } catch {
          return {
            success: true,
            query,
            results: result,
          };
        }
      } catch (error) {
        logger.error('Relationship query failed', error);
        throw error;
      }
    },
  });

  // Build Knowledge Graph Tool
  tools.push({
    name: 'cognitive_triangulation/build_graph',
    description: 'Build or update the cognitive triangulation knowledge graph for a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the project directory',
        },
        graphPath: {
          type: 'string',
          description: 'Path where to store the knowledge graph',
        },
        incremental: {
          type: 'boolean',
          description: 'Perform incremental update instead of full rebuild',
          default: false,
        },
        format: {
          type: 'string',
          enum: ['neo4j', 'json', 'graphml'],
          description: 'Output format for the knowledge graph',
          default: 'neo4j',
        },
      },
      required: ['projectPath'],
    },
    handler: async (input: any, context?: CognitiveTriangulationContext) => {
      try {
        const { projectPath, graphPath, incremental, format } = input;
        
        if (!existsSync(projectPath)) {
          throw new Error(`Project path does not exist: ${projectPath}`);
        }

        logger.info('Building knowledge graph', { projectPath, incremental });

        const cognitiveTriangulationPath = context?.cognitiveTriangulationPath || 
          findCognitiveTriangulationPath();

        if (!cognitiveTriangulationPath) {
          throw new Error('Cognitive Triangulation Pipeline not found');
        }

        const args = ['build-graph', projectPath];
        
        if (graphPath) {
          args.push('--output', graphPath);
        }
        
        if (incremental) {
          args.push('--incremental');
        }
        
        if (format) {
          args.push('--format', format);
        }

        const result = execSync(`${cognitiveTriangulationPath} ${args.join(' ')}`, {
          encoding: 'utf8',
          maxBuffer: 10 * 1024 * 1024,
        });

        logger.info('Knowledge graph built successfully');

        try {
          return JSON.parse(result);
        } catch {
          return {
            success: true,
            projectPath,
            format,
            message: 'Knowledge graph built successfully',
            output: result,
          };
        }
      } catch (error) {
        logger.error('Knowledge graph build failed', error);
        throw error;
      }
    },
  });

  // Cleanup Graph Tool  
  tools.push({
    name: 'cognitive_triangulation/cleanup_graph',
    description: 'Clean up orphaned nodes and relationships in the knowledge graph',
    inputSchema: {
      type: 'object',
      properties: {
        graphPath: {
          type: 'string',
          description: 'Path to the knowledge graph to clean',
        },
        dryRun: {
          type: 'boolean',
          description: 'Preview what would be cleaned without making changes',
          default: false,
        },
      },
    },
    handler: async (input: any, context?: CognitiveTriangulationContext) => {
      try {
        const { graphPath, dryRun } = input;
        
        logger.info('Cleaning knowledge graph', { graphPath, dryRun });

        const cognitiveTriangulationPath = context?.cognitiveTriangulationPath || 
          findCognitiveTriangulationPath();

        if (!cognitiveTriangulationPath) {
          throw new Error('Cognitive Triangulation Pipeline not found');
        }

        const args = ['cleanup'];
        
        if (graphPath) {
          args.push('--graph', graphPath);
        }
        
        if (dryRun) {
          args.push('--dry-run');
        }

        const result = execSync(`${cognitiveTriangulationPath} ${args.join(' ')}`, {
          encoding: 'utf8',
          maxBuffer: 10 * 1024 * 1024,
        });

        logger.info('Graph cleanup completed');

        try {
          return JSON.parse(result);
        } catch {
          return {
            success: true,
            dryRun,
            message: 'Graph cleanup completed',
            output: result,
          };
        }
      } catch (error) {
        logger.error('Graph cleanup failed', error);
        throw error;
      }
    },
  });

  return tools;
}

/**
 * Attempts to find the cognitive triangulation executable
 */
function findCognitiveTriangulationPath(): string | null {
  // Check common locations
  const possiblePaths = [
    // Global npm install
    '/usr/local/bin/cognitive-triangulation-mcp',
    '/usr/bin/cognitive-triangulation-mcp',
    // Local project
    join(process.cwd(), 'node_modules/.bin/cognitive-triangulation-mcp'),
    // Relative to claude-code-flow
    join(__dirname, '../../../cognitive-triangulation-pipeline-mcp/bin/cognitive-triangulation-mcp'),
    // Check if it's in PATH
    'cognitive-triangulation-mcp',
  ];

  for (const path of possiblePaths) {
    try {
      execSync(`which ${path}`, { encoding: 'utf8' });
      return path;
    } catch {
      // Continue checking other paths
    }
  }

  // Check environment variable
  if (process.env.COGNITIVE_TRIANGULATION_PATH) {
    return process.env.COGNITIVE_TRIANGULATION_PATH;
  }

  return null;
}