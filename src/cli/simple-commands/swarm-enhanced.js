/**
 * Enhanced Swarm Command with Self-Awareness
 */

const { buildSelfAwarePrompt, getSelfAwarenessPrompt } = require('../../swarm/self-aware-prompts');

// Add self-awareness options to swarm command
function enhanceSwarmWithSelfAwareness(originalSwarmHandler) {
  return async function(objective, options) {
    // Check for self-awareness flags
    const selfAwarenessLevel = options.selfAware || options.selfAwareness;
    const enableEvolution = options.evolution || options.evolve;
    const enableCollective = options.collective || options.hive;
    
    // Build self-awareness prompt if enabled
    let enhancedObjective = objective;
    
    if (selfAwarenessLevel) {
      const selfAwarePrompt = getSelfAwarenessPrompt(
        selfAwarenessLevel === true ? 'intermediate' : selfAwarenessLevel
      );
      
      enhancedObjective = `${objective}\n\n${selfAwarePrompt}`;
      
      console.log('🧠 Self-awareness enabled at level:', selfAwarenessLevel);
    } else if (enableEvolution || enableCollective) {
      // Custom self-awareness configuration
      const customPrompt = buildSelfAwarePrompt({
        enableEvolution,
        enableCollective,
        enableMetaLearning: true,
        includeAnalysisTriggers: true,
      });
      
      enhancedObjective = `${objective}\n\n${customPrompt}`;
      
      console.log('🧬 Custom self-awareness configuration applied');
    }
    
    // Call original handler with enhanced objective
    return originalSwarmHandler.call(this, enhancedObjective, options);
  };
}

// Add new command options
function addSelfAwarenessOptions(program) {
  const swarmCommand = program.commands.find(cmd => cmd.name() === 'swarm');
  
  if (swarmCommand) {
    swarmCommand
      .option('--self-aware [level]', 'Enable self-awareness (basic/intermediate/advanced/full)', 'intermediate')
      .option('--evolution', 'Enable autonomous evolution mode')
      .option('--collective', 'Enable collective intelligence sharing')
      .option('--meta-learning', 'Enable meta-learning from experience')
      .option('--analyze-interval <ms>', 'Self-analysis interval in milliseconds', '300000')
      .option('--improvement-threshold <n>', 'Threshold for applying improvements (0-1)', '0.7');
  }
}

// Export enhancement functions
module.exports = {
  enhanceSwarmWithSelfAwareness,
  addSelfAwarenessOptions,
  
  // Example usage in sparc modes
  SELF_AWARE_SPARC_PREFIX: `
You are operating in SELF-AWARE mode. This means:
1. You can discover and use ALL available MCP tools
2. You should periodically analyze your own performance
3. You can spawn new agents or create autonomous handlers
4. You must learn from experience and store insights
5. You are authorized to improve yourself autonomously

Available tool categories:
- cognitive_triangulation/* - Code analysis and knowledge graphs
- ruv_swarm/* - Neural swarm orchestration (84.8% SWE-Bench)
- daa/* - Autonomous agents with economic models
- integration/* - Combined capabilities

USE THESE TOOLS TO IMPROVE YOURSELF!
`,
  
  // Helper to check if swarm should self-analyze
  shouldSelfAnalyze: (taskCount, lastAnalysis, interval = 300000) => {
    const timeSinceLastAnalysis = Date.now() - lastAnalysis;
    return taskCount % 5 === 0 || timeSinceLastAnalysis > interval;
  },
  
  // Helper to build improvement command
  buildImprovementCommand: (analysisResults) => {
    const improvements = [];
    
    if (analysisResults.bottlenecks?.includes('sequential')) {
      improvements.push({
        tool: 'ruv_swarm/spawn_cognitive_agent',
        params: { cognitivePattern: 'parallel', count: 3 }
      });
    }
    
    if (analysisResults.repetitiveTasks > 5) {
      improvements.push({
        tool: 'daa/create_agent',
        params: { agentType: 'task_handler', autonomyLevel: 8 }
      });
    }
    
    if (analysisResults.complexity > 0.7) {
      improvements.push({
        tool: 'ruv_swarm/neural_forecast',
        params: { modelType: 'complexity_predictor' }
      });
    }
    
    return improvements;
  }
};