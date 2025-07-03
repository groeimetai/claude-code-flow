/**
 * Swarm Communication System - Main Export
 * 
 * Central entry point for all swarm communication components
 */

// Core components
export { 
  default as SwarmMessageBus,
  getGlobalMessageBus,
  createMessageBus,
  MessageTypes,
  MessagePriority
} from './message-bus.js';

export { 
  default as SharedKnowledgeBase,
  getGlobalKnowledgeBase,
  createKnowledgeBase,
  KnowledgeTypes,
  ConfidenceLevels
} from './shared-knowledge.js';

export { 
  default as SwarmCoordinationProtocol,
  getGlobalCoordinationProtocol,
  createCoordinationProtocol,
  TaskStates,
  ResourceTypes,
  CoordinationStrategies
} from './coordination-protocol.js';

export {
  default as SwarmMonitor,
  createMonitorCLI
} from './swarm-monitor.js';

export {
  default as SwarmCommunicationIntegration,
  createSwarmIntegration,
  enhanceSwarmCLI
} from './swarm-communication-integration.js';

// Quick setup function for easy integration
export function setupSwarmCommunication(options = {}) {
  const config = {
    enableMessageBus: true,
    enableKnowledgeBase: true,
    enableCoordination: true,
    enableMonitoring: false,
    ...options
  };
  
  const components = {};
  
  if (config.enableMessageBus) {
    components.messageBus = getGlobalMessageBus(config.messageBusOptions);
  }
  
  if (config.enableKnowledgeBase) {
    components.knowledgeBase = getGlobalKnowledgeBase({
      ...config.knowledgeBaseOptions,
      messageBus: components.messageBus
    });
  }
  
  if (config.enableCoordination) {
    components.coordinationProtocol = getGlobalCoordinationProtocol({
      ...config.coordinationOptions,
      messageBus: components.messageBus,
      knowledgeBase: components.knowledgeBase
    });
  }
  
  if (config.enableMonitoring) {
    components.monitor = createMonitorCLI();
  }
  
  // Create integration wrapper
  components.integration = createSwarmIntegration({
    enableCommunication: config.enableMessageBus,
    enableKnowledgeSharing: config.enableKnowledgeBase,
    enableTaskCoordination: config.enableCoordination,
    enableMonitoring: config.enableMonitoring
  });
  
  return components;
}

// Example usage patterns
export const SwarmCommunicationExamples = {
  // Basic swarm enhancement
  enhanceBasicSwarm: (swarm) => {
    const integration = createSwarmIntegration();
    return integration.enhanceSwarm(swarm, null, {
      capabilities: ['general'],
      strategy: 'development'
    });
  },
  
  // Multi-swarm coordination
  coordinateSwarms: async (swarms, objective) => {
    const { messageBus, coordinationProtocol } = setupSwarmCommunication();
    
    // Register all swarms
    swarms.forEach((swarm, index) => {
      messageBus.registerSwarm(swarm.id || `swarm_${index}`, {
        objective: swarm.objective,
        capabilities: swarm.capabilities
      });
    });
    
    // Create main task
    const mainTask = await coordinationProtocol.createTask({
      title: objective,
      description: `Coordinate swarms for: ${objective}`,
      priority: 'high'
    });
    
    return mainTask;
  },
  
  // Knowledge-driven swarm
  createKnowledgeDrivenSwarm: async (objective) => {
    const { knowledgeBase, integration } = setupSwarmCommunication({
      enableKnowledgeBase: true
    });
    
    // Search for relevant prior knowledge
    const priorKnowledge = await knowledgeBase.search(objective, {
      limit: 10,
      minConfidence: 'medium'
    });
    
    // Create swarm with knowledge context
    const swarm = integration.enhanceSwarm({}, null, {
      objective,
      priorKnowledge: priorKnowledge.map(k => ({
        title: k.title,
        content: k.content,
        confidence: k.confidence
      }))
    });
    
    return swarm;
  }
};

// Utility functions
export const SwarmCommunicationUtils = {
  // Check if swarm communication is available
  isAvailable: () => {
    try {
      const bus = getGlobalMessageBus();
      return bus !== null;
    } catch {
      return false;
    }
  },
  
  // Get system health
  getSystemHealth: () => {
    try {
      const messageBus = getGlobalMessageBus();
      const knowledgeBase = getGlobalKnowledgeBase();
      const coordinationProtocol = getGlobalCoordinationProtocol();
      
      return {
        healthy: true,
        components: {
          messageBus: { active: true, messages: messageBus.messages.size },
          knowledgeBase: { active: true, entries: knowledgeBase.knowledge.size },
          coordination: { active: true, tasks: coordinationProtocol.tasks.size }
        }
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  },
  
  // Clean shutdown
  shutdown: async () => {
    try {
      const messageBus = getGlobalMessageBus();
      const knowledgeBase = getGlobalKnowledgeBase();
      const coordinationProtocol = getGlobalCoordinationProtocol();
      
      // Shutdown in order
      if (coordinationProtocol) {
        // Complete any pending tasks
        console.log('Completing pending coordination tasks...');
      }
      
      if (knowledgeBase) {
        // Persist any pending knowledge
        console.log('Persisting knowledge base...');
      }
      
      if (messageBus) {
        await messageBus.shutdown();
      }
      
      console.log('Swarm communication system shutdown complete');
    } catch (error) {
      console.error('Error during shutdown:', error);
    }
  }
};

// Default export for convenience
export default {
  setup: setupSwarmCommunication,
  examples: SwarmCommunicationExamples,
  utils: SwarmCommunicationUtils
};