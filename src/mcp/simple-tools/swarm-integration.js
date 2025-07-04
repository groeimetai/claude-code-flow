// Simple integration to add MCP tools to swarm execution
import { loadSimpleTools } from './index.js';

// Hook to inject MCP tools into swarm context
export function injectMCPTools(swarmContext) {
  const logger = swarmContext.logger || console;
  
  try {
    // Load all MCP tools
    const mcpTools = loadSimpleTools(logger);
    
    // Add tools to swarm context
    if (!swarmContext.tools) {
      swarmContext.tools = {};
    }
    
    // Register each tool
    mcpTools.forEach(tool => {
      swarmContext.tools[tool.name] = tool;
      logger.info(`Registered MCP tool: ${tool.name}`);
    });
    
    // Add tool executor
    swarmContext.executeMCPTool = async (toolName, input) => {
      const tool = swarmContext.tools[toolName];
      if (!tool) {
        throw new Error(`MCP tool not found: ${toolName}`);
      }
      
      logger.info(`Executing MCP tool: ${toolName}`, input);
      return await tool.execute(input);
    };
    
    // Add tool discovery
    swarmContext.getMCPTools = () => {
      return mcpTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }));
    };
    
    logger.info(`Successfully injected ${mcpTools.length} MCP tools into swarm context`);
    return true;
  } catch (error) {
    logger.error('Failed to inject MCP tools:', error);
    return false;
  }
}

// Middleware for swarm strategies to use MCP tools
export function createMCPToolMiddleware(logger) {
  return {
    beforeSwarmStart: (context) => {
      logger.info('Adding MCP tools to swarm...');
      injectMCPTools(context);
    },
    
    onAgentCreated: (agent) => {
      // Give agents access to MCP tools
      agent.mcpTools = agent.swarmContext?.tools || {};
      agent.executeMCPTool = agent.swarmContext?.executeMCPTool;
    },
    
    onTaskAssigned: (task, agent) => {
      // Check if task requires MCP tools
      if (task.requiresMCPTools || task.type === 'cognitive-analysis') {
        agent.logger.info(`Task ${task.id} may use MCP tools`);
      }
    }
  };
}

// Strategy extensions for MCP-enhanced swarms
export const MCPStrategyExtensions = {
  'cognitive-research': {
    description: 'Research using cognitive triangulation',
    tools: ['cognitive_triangulation/analyze_codebase', 'cognitive_triangulation/query_relationships'],
    setup: (swarmContext) => {
      swarmContext.strategy = 'research';
      swarmContext.mcpEnabled = true;
      swarmContext.defaultTools = ['cognitive_triangulation/analyze_codebase'];
    }
  },
  
  'neural-development': {
    description: 'Development with neural swarm coordination',
    tools: ['ruv_swarm/init', 'ruv_swarm/spawn_cognitive_agent'],
    setup: (swarmContext) => {
      swarmContext.strategy = 'development';
      swarmContext.mcpEnabled = true;
      swarmContext.defaultTools = ['ruv_swarm/init'];
    }
  },
  
  'autonomous-analysis': {
    description: 'Analysis using decentralized autonomous agents',
    tools: ['daa/create_agent', 'daa/execute_mrap'],
    setup: (swarmContext) => {
      swarmContext.strategy = 'analysis';
      swarmContext.mcpEnabled = true;
      swarmContext.defaultTools = ['daa/create_agent'];
    }
  }
};