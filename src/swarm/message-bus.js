/**
 * SwarmMessageBus - Inter-swarm communication system
 * 
 * Provides pub/sub messaging, persistent storage, and lifecycle management
 * for swarm coordination and knowledge sharing.
 */

import EventEmitter from 'node:events';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

// Message types
export const MessageTypes = {
  // Lifecycle events
  SWARM_STARTED: 'swarm:started',
  SWARM_COMPLETED: 'swarm:completed',
  SWARM_FAILED: 'swarm:failed',
  SWARM_PAUSED: 'swarm:paused',
  SWARM_RESUMED: 'swarm:resumed',
  
  // Coordination messages
  TASK_CLAIMED: 'task:claimed',
  TASK_RELEASED: 'task:released',
  TASK_COMPLETED: 'task:completed',
  HELP_REQUEST: 'help:request',
  HELP_RESPONSE: 'help:response',
  
  // Knowledge sharing
  DISCOVERY_SHARED: 'discovery:shared',
  SOLUTION_FOUND: 'solution:found',
  ERROR_ENCOUNTERED: 'error:encountered',
  
  // Resource sharing
  CODE_SHARED: 'code:shared',
  CONFIG_SHARED: 'config:shared',
  ARTIFACT_CREATED: 'artifact:created',
  
  // Progress updates
  PROGRESS_UPDATE: 'progress:update',
  METRICS_UPDATE: 'metrics:update',
  STATUS_CHANGE: 'status:change'
};

// Message priorities
export const MessagePriority = {
  CRITICAL: 'critical',
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low'
};

class SwarmMessageBus extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.busId = options.busId || `bus_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    this.persistencePath = options.persistencePath || './swarm-messages';
    this.maxMessageAge = options.maxMessageAge || 24 * 60 * 60 * 1000; // 24 hours
    this.enablePersistence = options.enablePersistence !== false;
    this.enableCompression = options.enableCompression || false;
    
    // In-memory message store for fast access
    this.messages = new Map();
    this.subscriptions = new Map();
    this.swarmRegistry = new Map();
    
    // Message queue for async processing
    this.messageQueue = [];
    this.processing = false;
    
    // Initialize persistence
    if (this.enablePersistence) {
      this.initializePersistence();
    }
    
    // Start message processor
    this.startMessageProcessor();
    
    // Cleanup old messages periodically
    this.cleanupInterval = setInterval(() => this.cleanupOldMessages(), 60 * 60 * 1000); // Every hour
  }
  
  async initializePersistence() {
    try {
      await fs.mkdir(this.persistencePath, { recursive: true });
      
      // Load existing messages
      const messageFiles = await fs.readdir(this.persistencePath);
      for (const file of messageFiles) {
        if (file.endsWith('.json')) {
          try {
            const content = await fs.readFile(path.join(this.persistencePath, file), 'utf-8');
            const message = JSON.parse(content);
            
            // Only load messages that aren't too old
            if (Date.now() - message.timestamp < this.maxMessageAge) {
              this.messages.set(message.id, message);
            }
          } catch (error) {
            console.error(`Failed to load message ${file}:`, error);
          }
        }
      }
      
      console.log(`📨 Loaded ${this.messages.size} messages from persistence`);
    } catch (error) {
      console.error('Failed to initialize persistence:', error);
    }
  }
  
  /**
   * Register a swarm with the message bus
   */
  registerSwarm(swarmId, metadata = {}) {
    const swarmInfo = {
      id: swarmId,
      registeredAt: Date.now(),
      status: 'active',
      ...metadata
    };
    
    this.swarmRegistry.set(swarmId, swarmInfo);
    
    // Broadcast swarm registration
    this.publish({
      type: MessageTypes.SWARM_STARTED,
      swarmId,
      data: swarmInfo,
      priority: MessagePriority.HIGH
    });
    
    return swarmInfo;
  }
  
  /**
   * Unregister a swarm
   */
  unregisterSwarm(swarmId, reason = 'completed') {
    const swarmInfo = this.swarmRegistry.get(swarmId);
    if (swarmInfo) {
      swarmInfo.status = 'inactive';
      swarmInfo.unregisteredAt = Date.now();
      swarmInfo.reason = reason;
      
      // Broadcast swarm unregistration
      const messageType = reason === 'failed' ? MessageTypes.SWARM_FAILED : MessageTypes.SWARM_COMPLETED;
      this.publish({
        type: messageType,
        swarmId,
        data: swarmInfo,
        priority: MessagePriority.HIGH
      });
      
      // Remove from registry after a delay (for cleanup)
      setTimeout(() => {
        this.swarmRegistry.delete(swarmId);
      }, 5 * 60 * 1000); // 5 minutes
    }
  }
  
  /**
   * Subscribe to messages
   */
  subscribe(pattern, handler, options = {}) {
    const subscriptionId = crypto.randomBytes(8).toString('hex');
    const subscription = {
      id: subscriptionId,
      pattern: pattern instanceof RegExp ? pattern : new RegExp(pattern),
      handler,
      priority: options.priority || MessagePriority.NORMAL,
      filter: options.filter || (() => true),
      swarmId: options.swarmId
    };
    
    this.subscriptions.set(subscriptionId, subscription);
    
    // Send any relevant historical messages
    if (options.sendHistory) {
      this.sendHistoricalMessages(subscription);
    }
    
    return subscriptionId;
  }
  
  /**
   * Unsubscribe from messages
   */
  unsubscribe(subscriptionId) {
    return this.subscriptions.delete(subscriptionId);
  }
  
  /**
   * Publish a message
   */
  async publish(message) {
    // Ensure message has required fields
    const fullMessage = {
      id: crypto.randomBytes(8).toString('hex'),
      timestamp: Date.now(),
      priority: MessagePriority.NORMAL,
      ...message
    };
    
    // Add to message store
    this.messages.set(fullMessage.id, fullMessage);
    
    // Queue for processing
    this.messageQueue.push(fullMessage);
    
    // Persist if enabled
    if (this.enablePersistence) {
      this.persistMessage(fullMessage);
    }
    
    // Process queue
    this.processMessageQueue();
    
    return fullMessage.id;
  }
  
  /**
   * Process message queue
   */
  async processMessageQueue() {
    if (this.processing || this.messageQueue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    try {
      while (this.messageQueue.length > 0) {
        // Sort by priority
        this.messageQueue.sort((a, b) => {
          const priorityOrder = {
            [MessagePriority.CRITICAL]: 0,
            [MessagePriority.HIGH]: 1,
            [MessagePriority.NORMAL]: 2,
            [MessagePriority.LOW]: 3
          };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        
        const message = this.messageQueue.shift();
        
        // Find matching subscriptions
        const matchingSubscriptions = Array.from(this.subscriptions.values())
          .filter(sub => sub.pattern.test(message.type) && sub.filter(message))
          .sort((a, b) => {
            const priorityOrder = {
              [MessagePriority.CRITICAL]: 0,
              [MessagePriority.HIGH]: 1,
              [MessagePriority.NORMAL]: 2,
              [MessagePriority.LOW]: 3
            };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          });
        
        // Deliver to subscribers
        for (const subscription of matchingSubscriptions) {
          try {
            await subscription.handler(message);
          } catch (error) {
            console.error(`Error in message handler ${subscription.id}:`, error);
            
            // Publish error message
            this.publish({
              type: MessageTypes.ERROR_ENCOUNTERED,
              data: {
                originalMessage: message,
                error: error.message,
                subscriptionId: subscription.id
              },
              priority: MessagePriority.HIGH
            });
          }
        }
      }
    } finally {
      this.processing = false;
    }
  }
  
  /**
   * Start message processor
   */
  startMessageProcessor() {
    // Process messages every 100ms
    this.processorInterval = setInterval(() => {
      this.processMessageQueue();
    }, 100);
  }
  
  /**
   * Persist message to disk
   */
  async persistMessage(message) {
    try {
      const filename = `${message.timestamp}_${message.id}.json`;
      const filepath = path.join(this.persistencePath, filename);
      
      let content = JSON.stringify(message, null, 2);
      
      if (this.enableCompression) {
        // TODO: Add compression support
        // const zlib = await import('zlib');
        // content = await promisify(zlib.gzip)(content);
      }
      
      await fs.writeFile(filepath, content);
    } catch (error) {
      console.error('Failed to persist message:', error);
    }
  }
  
  /**
   * Send historical messages to a new subscriber
   */
  async sendHistoricalMessages(subscription) {
    const relevantMessages = Array.from(this.messages.values())
      .filter(msg => subscription.pattern.test(msg.type) && subscription.filter(msg))
      .sort((a, b) => a.timestamp - b.timestamp);
    
    for (const message of relevantMessages) {
      try {
        await subscription.handler({ ...message, historical: true });
      } catch (error) {
        console.error('Error sending historical message:', error);
      }
    }
  }
  
  /**
   * Clean up old messages
   */
  async cleanupOldMessages() {
    const cutoffTime = Date.now() - this.maxMessageAge;
    let cleaned = 0;
    
    // Clean from memory
    for (const [id, message] of this.messages.entries()) {
      if (message.timestamp < cutoffTime) {
        this.messages.delete(id);
        cleaned++;
      }
    }
    
    // Clean from disk
    if (this.enablePersistence) {
      try {
        const files = await fs.readdir(this.persistencePath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const timestamp = parseInt(file.split('_')[0]);
            if (timestamp < cutoffTime) {
              await fs.unlink(path.join(this.persistencePath, file));
              cleaned++;
            }
          }
        }
      } catch (error) {
        console.error('Error cleaning up old messages:', error);
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old messages`);
    }
  }
  
  /**
   * Get messages by type pattern
   */
  getMessagesByType(typePattern, options = {}) {
    const pattern = typePattern instanceof RegExp ? typePattern : new RegExp(typePattern);
    const limit = options.limit || 100;
    const since = options.since || 0;
    
    const messages = Array.from(this.messages.values())
      .filter(msg => pattern.test(msg.type) && msg.timestamp >= since)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    
    return messages;
  }
  
  /**
   * Get swarm status
   */
  getSwarmStatus(swarmId) {
    return this.swarmRegistry.get(swarmId);
  }
  
  /**
   * Get all active swarms
   */
  getActiveSwarms() {
    return Array.from(this.swarmRegistry.values())
      .filter(swarm => swarm.status === 'active');
  }
  
  /**
   * Broadcast progress update
   */
  broadcastProgress(swarmId, progress) {
    return this.publish({
      type: MessageTypes.PROGRESS_UPDATE,
      swarmId,
      data: progress,
      priority: MessagePriority.NORMAL
    });
  }
  
  /**
   * Request help from other swarms
   */
  requestHelp(swarmId, helpData) {
    return this.publish({
      type: MessageTypes.HELP_REQUEST,
      swarmId,
      data: helpData,
      priority: MessagePriority.HIGH
    });
  }
  
  /**
   * Share a discovery
   */
  shareDiscovery(swarmId, discovery) {
    return this.publish({
      type: MessageTypes.DISCOVERY_SHARED,
      swarmId,
      data: discovery,
      priority: MessagePriority.HIGH
    });
  }
  
  /**
   * Claim a task
   */
  claimTask(swarmId, taskId, taskData = {}) {
    return this.publish({
      type: MessageTypes.TASK_CLAIMED,
      swarmId,
      data: { taskId, ...taskData },
      priority: MessagePriority.HIGH
    });
  }
  
  /**
   * Release a task
   */
  releaseTask(swarmId, taskId, reason = '') {
    return this.publish({
      type: MessageTypes.TASK_RELEASED,
      swarmId,
      data: { taskId, reason },
      priority: MessagePriority.HIGH
    });
  }
  
  /**
   * Shutdown the message bus
   */
  async shutdown() {
    clearInterval(this.cleanupInterval);
    clearInterval(this.processorInterval);
    
    // Process remaining messages
    await this.processMessageQueue();
    
    // Clear subscriptions
    this.subscriptions.clear();
    
    console.log(`📨 Message bus ${this.busId} shutdown complete`);
  }
}

// Singleton instance for global access
let globalMessageBus = null;

/**
 * Get or create the global message bus instance
 */
export function getGlobalMessageBus(options = {}) {
  if (!globalMessageBus) {
    globalMessageBus = new SwarmMessageBus(options);
  }
  return globalMessageBus;
}

/**
 * Create a new message bus instance
 */
export function createMessageBus(options = {}) {
  return new SwarmMessageBus(options);
}

export default SwarmMessageBus;