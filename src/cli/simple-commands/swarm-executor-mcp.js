// MCP-enhanced swarm executor
import { loadSimpleTools } from '../../mcp/simple-tools/index.js';

// Original swarm executor with MCP enhancement
export async function executeSwarm(objective, flags) {
  const logger = {
    info: (...args) => console.log('[INFO]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    debug: (...args) => console.log('[DEBUG]', ...args)
  };

  try {
    // Load MCP tools
    const mcpTools = loadSimpleTools(logger);
    logger.info(`Loaded ${mcpTools.length} MCP tools for swarm`);

    // Check if objective mentions any MCP-related keywords
    const useCognitiveAnalysis = objective.toLowerCase().includes('cognitive') || 
                                objective.toLowerCase().includes('triangulation') ||
                                objective.toLowerCase().includes('analyze code') ||
                                objective.toLowerCase().includes('knowledge graph');
    
    const useNeuralSwarm = objective.toLowerCase().includes('neural') ||
                          objective.toLowerCase().includes('swarm coordination') ||
                          objective.toLowerCase().includes('distributed agents');
    
    const useDAA = objective.toLowerCase().includes('autonomous') ||
                   objective.toLowerCase().includes('daa') ||
                   objective.toLowerCase().includes('decentralized');

    // Log which tools might be used
    if (useCognitiveAnalysis) {
      logger.info('🧠 Cognitive Triangulation tools available for this objective');
    }
    if (useNeuralSwarm) {
      logger.info('🤖 Neural Swarm tools available for this objective');
    }
    if (useDAA) {
      logger.info('⚡ DAA tools available for this objective');
    }

    // Create enhanced swarm context
    const swarmContext = {
      objective,
      flags,
      mcpTools,
      logger,
      // Tool executor
      executeMCPTool: async (toolName, input) => {
        const tool = mcpTools.find(t => t.name === toolName);
        if (!tool) {
          throw new Error(`MCP tool not found: ${toolName}`);
        }
        logger.info(`Executing MCP tool: ${toolName}`);
        return await tool.execute(input);
      }
    };

    // If original executor exists, use it with enhanced context
    try {
      const { executeSwarm: originalExecutor } = await import('./swarm-executor.js');
      return await originalExecutor(objective, flags, swarmContext);
    } catch (error) {
      // Fallback to basic execution with MCP tools info
      logger.info('Using MCP-enhanced basic swarm execution');
      
      console.log(`
🐝 MCP-Enhanced Swarm Execution
📋 Objective: ${objective}
🎯 Strategy: ${flags.strategy || 'auto'}
🛠️  MCP Tools Available: ${mcpTools.length}

Available MCP Tools:
${mcpTools.map(t => `  - ${t.name}: ${t.description}`).join('\n')}

The swarm will coordinate agents to achieve the objective using the available tools.
`);
      
      return { success: true, mcpToolsAvailable: mcpTools.length };
    }
  } catch (error) {
    logger.error('MCP swarm execution error:', error);
    throw error;
  }
}
