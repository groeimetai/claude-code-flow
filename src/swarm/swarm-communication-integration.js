/**
 * SwarmCommunicationIntegration - Integrates the new communication system with existing swarm implementation
 * 
 * Provides hooks and adapters to enable inter-swarm communication in the current system
 */

import { getGlobalMessageBus, MessageTypes, MessagePriority } from './message-bus.js';
import { getGlobalKnowledgeBase, KnowledgeTypes, ConfidenceLevels } from './shared-knowledge.js';
import { getGlobalCoordinationProtocol, TaskStates, ResourceTypes } from './coordination-protocol.js';
import { createMonitorCLI } from './swarm-monitor.js';

class SwarmCommunicationIntegration {
  constructor(options = {}) {
    this.enableCommunication = options.enableCommunication !== false;
    this.enableKnowledgeSharing = options.enableKnowledgeSharing !== false;
    this.enableTaskCoordination = options.enableTaskCoordination !== false;
    this.enableMonitoring = options.enableMonitoring !== false;
    
    // System components
    this.messageBus = getGlobalMessageBus();
    this.knowledgeBase = getGlobalKnowledgeBase();
    this.coordinationProtocol = getGlobalCoordinationProtocol();
    this.monitor = this.enableMonitoring ? createMonitorCLI() : null;
    
    // Swarm tracking
    this.registeredSwarms = new Map();
  }
  
  /**
   * Enhance existing swarm with communication capabilities
   */
  enhanceSwarm(swarmInstance, swarmId, metadata = {}) {
    if (!this.enableCommunication) {
      return swarmInstance;
    }
    
    // Generate swarm ID if not provided
    const actualSwarmId = swarmId || `swarm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Register swarm with message bus
    this.messageBus.registerSwarm(actualSwarmId, {
      ...metadata,
      capabilities: metadata.capabilities || ['general'],
      strategy: metadata.strategy || 'auto'
    });
    
    // Register capabilities with coordination protocol
    this.coordinationProtocol.registerSwarmCapabilities(actualSwarmId, {
      capabilities: metadata.capabilities || ['general'],
      expertise: metadata.expertise || 5,
      priority: metadata.priority || 'normal'
    });
    
    // Track registration
    this.registeredSwarms.set(actualSwarmId, {
      instance: swarmInstance,
      metadata,
      registeredAt: Date.now()
    });
    
    // Create enhanced swarm object
    const enhancedSwarm = {
      ...swarmInstance,
      swarmId: actualSwarmId,
      
      // Communication methods
      broadcast: (type, data, priority) => this.broadcast(actualSwarmId, type, data, priority),
      subscribe: (pattern, handler, options) => this.subscribe(actualSwarmId, pattern, handler, options),
      
      // Knowledge sharing methods
      shareDiscovery: (discovery) => this.shareDiscovery(actualSwarmId, discovery),
      searchKnowledge: (query, options) => this.searchKnowledge(query, options),
      
      // Task coordination methods
      claimTask: (taskId, bid) => this.claimTask(actualSwarmId, taskId, bid),
      releaseTask: (taskId, reason) => this.releaseTask(actualSwarmId, taskId, reason),
      completeTask: (taskId, results) => this.completeTask(actualSwarmId, taskId, results),
      
      // Help methods
      requestHelp: (helpData) => this.requestHelp(actualSwarmId, helpData),
      provideHelp: (requestId, helpData) => this.provideHelp(actualSwarmId, requestId, helpData),
      
      // Resource sharing
      shareResource: (resource) => this.shareResource(actualSwarmId, resource),
      getSharedResource: (resourceId) => this.getSharedResource(resourceId),
      
      // Progress tracking
      updateProgress: (taskId, progress) => this.updateProgress(actualSwarmId, taskId, progress),
      
      // Cleanup method
      shutdown: () => this.unregisterSwarm(actualSwarmId)
    };
    
    return enhancedSwarm;
  }
  
  /**
   * Integrate with existing swarm executor
   */
  integrateWithExecutor(executeSwarmFn) {
    return async (objective, options = {}) => {
      // Generate swarm ID
      const swarmId = `swarm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Register swarm
      if (this.enableCommunication) {
        this.messageBus.registerSwarm(swarmId, {
          objective,
          strategy: options.strategy || 'auto',
          mode: options.mode || 'centralized'
        });
      }
      
      // Create task if coordination is enabled
      if (this.enableTaskCoordination) {
        await this.coordinationProtocol.createTask({
          title: objective,
          description: `Swarm execution: ${objective}`,
          type: 'swarm_execution',
          priority: options.priority || 'normal',
          createdBy: swarmId
        });
      }
      
      try {
        // Execute original swarm function
        const result = await executeSwarmFn(objective, options);
        
        // Share results as knowledge
        if (this.enableKnowledgeSharing && result) {
          await this.knowledgeBase.addKnowledge({
            type: KnowledgeTypes.SOLUTION,
            title: `Solution: ${objective}`,
            content: JSON.stringify(result),
            swarmId,
            confidence: ConfidenceLevels.HIGH,
            metadata: {
              targetDir: result.targetDir,
              files: result.files
            }
          });
        }
        
        // Mark swarm as completed
        if (this.enableCommunication) {
          this.messageBus.unregisterSwarm(swarmId, 'completed');
        }
        
        return result;
      } catch (error) {
        // Share error as knowledge
        if (this.enableKnowledgeSharing) {
          await this.knowledgeBase.addKnowledge({
            type: KnowledgeTypes.ERROR,
            title: `Error: ${objective}`,
            content: error.message,
            swarmId,
            confidence: ConfidenceLevels.HIGH,
            metadata: {
              stack: error.stack
            }
          });
        }
        
        // Mark swarm as failed
        if (this.enableCommunication) {
          this.messageBus.unregisterSwarm(swarmId, 'failed');
        }
        
        throw error;
      }
    };
  }
  
  /**
   * Wrap swarm command handler
   */
  wrapSwarmCommand(originalHandler) {
    return async function enhancedSwarmHandler(objective, options) {
      const integration = new SwarmCommunicationIntegration({
        enableCommunication: options.communication !== false,
        enableKnowledgeSharing: options.knowledge !== false,
        enableTaskCoordination: options.coordination !== false,
        enableMonitoring: options.monitor || options.ui
      });
      
      // Start monitor if requested
      if (integration.enableMonitoring && integration.monitor) {
        integration.monitor.start();
      }
      
      try {
        // Create wrapped executor
        const wrappedExecutor = integration.integrateWithExecutor(
          async (obj, opts) => originalHandler.call(this, obj, opts)
        );
        
        // Execute with enhancements
        const result = await wrappedExecutor(objective, options);
        
        return result;
      } finally {
        // Stop monitor if it was started
        if (integration.enableMonitoring && integration.monitor) {
          integration.monitor.stop();
        }
      }
    };
  }
  
  // Communication wrapper methods
  
  broadcast(swarmId, type, data, priority = MessagePriority.NORMAL) {
    return this.messageBus.publish({
      type,
      swarmId,
      data,
      priority
    });
  }
  
  subscribe(swarmId, pattern, handler, options = {}) {
    return this.messageBus.subscribe(pattern, handler, {
      ...options,
      swarmId
    });
  }
  
  // Knowledge sharing wrapper methods
  
  async shareDiscovery(swarmId, discovery) {
    return this.knowledgeBase.addKnowledge({
      type: KnowledgeTypes.DISCOVERY,
      swarmId,
      ...discovery
    });
  }
  
  async searchKnowledge(query, options = {}) {
    return this.knowledgeBase.search(query, options);
  }
  
  // Task coordination wrapper methods
  
  async claimTask(swarmId, taskId, bid) {
    return this.coordinationProtocol.claimTask(swarmId, taskId, bid);
  }
  
  async releaseTask(swarmId, taskId, reason) {
    return this.coordinationProtocol.releaseTask(swarmId, taskId, reason);
  }
  
  async completeTask(swarmId, taskId, results) {
    return this.coordinationProtocol.completeTask(swarmId, taskId, results);
  }
  
  // Help system wrapper methods
  
  async requestHelp(swarmId, helpData) {
    return this.coordinationProtocol.requestHelp(swarmId, helpData);
  }
  
  async provideHelp(swarmId, requestId, helpData) {
    return this.coordinationProtocol.provideHelp(requestId, {
      ...helpData,
      helperId: swarmId
    });
  }
  
  // Resource sharing wrapper methods
  
  async shareResource(swarmId, resource) {
    return this.coordinationProtocol.shareResource(swarmId, resource);
  }
  
  async getSharedResource(resourceId) {
    return this.coordinationProtocol.getSharedResource(resourceId);
  }
  
  // Progress tracking
  
  async updateProgress(swarmId, taskId, progress) {
    return this.messageBus.broadcastProgress(swarmId, {
      taskId,
      progress
    });
  }
  
  // Cleanup
  
  unregisterSwarm(swarmId) {
    this.registeredSwarms.delete(swarmId);
    this.messageBus.unregisterSwarm(swarmId);
  }
  
  /**
   * Get communication statistics
   */
  getStatistics() {
    return {
      registeredSwarms: this.registeredSwarms.size,
      messageStats: this.messageBus.messages.size,
      knowledgeStats: this.knowledgeBase.getStatistics(),
      coordinationStats: this.coordinationProtocol.getStatistics()
    };
  }
}

/**
 * Export integration utilities
 */
export {
  SwarmCommunicationIntegration,
  
  // Re-export core components for direct access
  getGlobalMessageBus,
  getGlobalKnowledgeBase,
  getGlobalCoordinationProtocol,
  createMonitorCLI,
  
  // Re-export types and constants
  MessageTypes,
  MessagePriority,
  KnowledgeTypes,
  ConfidenceLevels,
  TaskStates,
  ResourceTypes
};

/**
 * Create a pre-configured integration instance
 */
export function createSwarmIntegration(options = {}) {
  return new SwarmCommunicationIntegration(options);
}

/**
 * Enhance the existing swarm command in the CLI
 */
export function enhanceSwarmCLI() {
  // This would be called from the main CLI setup
  const integration = new SwarmCommunicationIntegration({
    enableCommunication: true,
    enableKnowledgeSharing: true,
    enableTaskCoordination: true,
    enableMonitoring: true
  });
  
  // Add new CLI commands
  return {
    'swarm:monitor': () => {
      const monitor = createMonitorCLI();
      monitor.start();
      
      // Keep process alive
      process.on('SIGINT', () => {
        monitor.stop();
        process.exit(0);
      });
    },
    
    'swarm:knowledge': async (query) => {
      const results = await integration.searchKnowledge(query);
      console.log(`Found ${results.length} knowledge entries:`);
      results.forEach(entry => {
        console.log(`\n- ${entry.title}`);
        console.log(`  Type: ${entry.type}, Confidence: ${entry.confidence}`);
        console.log(`  ${entry.content.substring(0, 100)}...`);
      });
    },
    
    'swarm:status': () => {
      const stats = integration.getStatistics();
      console.log('Swarm Communication Status:');
      console.log(`  Active Swarms: ${stats.registeredSwarms}`);
      console.log(`  Messages: ${stats.messageStats}`);
      console.log(`  Knowledge Entries: ${stats.knowledgeStats.totalEntries}`);
      console.log(`  Active Tasks: ${stats.coordinationStats.tasksByState.in_progress || 0}`);
    }
  };
}

export default SwarmCommunicationIntegration;