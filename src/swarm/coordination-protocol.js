/**
 * SwarmCoordinationProtocol - Task claiming, progress broadcasting, and resource sharing
 * 
 * Implements distributed coordination patterns for swarm collaboration
 */

import crypto from 'node:crypto';
import { getGlobalMessageBus, MessageTypes, MessagePriority } from './message-bus.js';
import { getGlobalKnowledgeBase, KnowledgeTypes, ConfidenceLevels } from './shared-knowledge.js';

// Task states
export const TaskStates = {
  AVAILABLE: 'available',
  CLAIMED: 'claimed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  BLOCKED: 'blocked',
  CANCELLED: 'cancelled'
};

// Resource types
export const ResourceTypes = {
  CODE: 'code',
  CONFIG: 'config',
  DATA: 'data',
  MODEL: 'model',
  ARTIFACT: 'artifact',
  DOCUMENTATION: 'documentation',
  TEST: 'test',
  DEPENDENCY: 'dependency'
};

// Coordination strategies
export const CoordinationStrategies = {
  FIRST_COME: 'first_come',         // First swarm to claim gets the task
  BEST_FIT: 'best_fit',             // Task assigned to most capable swarm
  LOAD_BALANCED: 'load_balanced',   // Distribute evenly
  PRIORITY_BASED: 'priority_based', // Based on swarm priority
  AUCTION: 'auction'                // Swarms bid for tasks
};

class SwarmCoordinationProtocol {
  constructor(options = {}) {
    this.protocolId = options.protocolId || `protocol_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    this.strategy = options.strategy || CoordinationStrategies.FIRST_COME;
    this.enableAuction = options.enableAuction || false;
    this.auctionDuration = options.auctionDuration || 5000; // 5 seconds
    
    // Task management
    this.tasks = new Map();
    this.taskClaims = new Map();
    this.taskHistory = new Map();
    
    // Resource sharing
    this.sharedResources = new Map();
    this.resourceRequests = new Map();
    
    // Swarm capabilities
    this.swarmCapabilities = new Map();
    this.swarmWorkload = new Map();
    
    // Help requests
    this.helpRequests = new Map();
    this.helpResponses = new Map();
    
    // Integration with other systems
    this.messageBus = options.messageBus || getGlobalMessageBus();
    this.knowledgeBase = options.knowledgeBase || getGlobalKnowledgeBase();
    
    // Initialize
    this.initialize();
  }
  
  async initialize() {
    // Subscribe to coordination messages
    this.messageBus.subscribe(
      MessageTypes.TASK_CLAIMED,
      (msg) => this.handleTaskClaim(msg),
      { priority: MessagePriority.CRITICAL }
    );
    
    this.messageBus.subscribe(
      MessageTypes.TASK_RELEASED,
      (msg) => this.handleTaskRelease(msg),
      { priority: MessagePriority.HIGH }
    );
    
    this.messageBus.subscribe(
      MessageTypes.TASK_COMPLETED,
      (msg) => this.handleTaskCompletion(msg),
      { priority: MessagePriority.HIGH }
    );
    
    this.messageBus.subscribe(
      MessageTypes.HELP_REQUEST,
      (msg) => this.handleHelpRequest(msg),
      { priority: MessagePriority.HIGH }
    );
    
    this.messageBus.subscribe(
      MessageTypes.HELP_RESPONSE,
      (msg) => this.handleHelpResponse(msg),
      { priority: MessagePriority.HIGH }
    );
    
    this.messageBus.subscribe(
      MessageTypes.CODE_SHARED,
      (msg) => this.handleResourceShared(msg),
      { priority: MessagePriority.NORMAL }
    );
    
    this.messageBus.subscribe(
      MessageTypes.PROGRESS_UPDATE,
      (msg) => this.handleProgressUpdate(msg),
      { priority: MessagePriority.NORMAL }
    );
    
    console.log(`🤝 Coordination protocol initialized with ${this.strategy} strategy`);
  }
  
  /**
   * Register swarm capabilities
   */
  registerSwarmCapabilities(swarmId, capabilities) {
    this.swarmCapabilities.set(swarmId, {
      ...capabilities,
      registeredAt: Date.now()
    });
    
    // Initialize workload tracking
    if (!this.swarmWorkload.has(swarmId)) {
      this.swarmWorkload.set(swarmId, {
        activeTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        totalWorkTime: 0,
        lastActive: Date.now()
      });
    }
    
    return true;
  }
  
  /**
   * Create a new task
   */
  async createTask(taskData) {
    const task = {
      id: taskData.id || crypto.randomBytes(8).toString('hex'),
      title: taskData.title,
      description: taskData.description,
      type: taskData.type,
      priority: taskData.priority || 'normal',
      requirements: taskData.requirements || {},
      dependencies: taskData.dependencies || [],
      state: TaskStates.AVAILABLE,
      createdAt: Date.now(),
      createdBy: taskData.createdBy,
      metadata: taskData.metadata || {}
    };
    
    this.tasks.set(task.id, task);
    
    // Announce task availability
    await this.messageBus.publish({
      type: 'task:available',
      data: task,
      priority: MessagePriority.HIGH
    });
    
    // Start auction if enabled
    if (this.enableAuction && this.strategy === CoordinationStrategies.AUCTION) {
      this.startTaskAuction(task);
    }
    
    return task;
  }
  
  /**
   * Claim a task
   */
  async claimTask(swarmId, taskId, bid = null) {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    if (task.state !== TaskStates.AVAILABLE) {
      throw new Error(`Task ${taskId} is not available (state: ${task.state})`);
    }
    
    // Check dependencies
    if (task.dependencies.length > 0) {
      const unmetDependencies = task.dependencies.filter(depId => {
        const depTask = this.tasks.get(depId);
        return !depTask || depTask.state !== TaskStates.COMPLETED;
      });
      
      if (unmetDependencies.length > 0) {
        throw new Error(`Task has unmet dependencies: ${unmetDependencies.join(', ')}`);
      }
    }
    
    // Apply coordination strategy
    const canClaim = await this.applyCoordinationStrategy(swarmId, task, bid);
    
    if (!canClaim) {
      throw new Error('Task claim denied by coordination strategy');
    }
    
    // Update task state
    task.state = TaskStates.CLAIMED;
    task.claimedBy = swarmId;
    task.claimedAt = Date.now();
    
    // Record claim
    this.taskClaims.set(taskId, {
      swarmId,
      timestamp: Date.now(),
      bid
    });
    
    // Update swarm workload
    const workload = this.swarmWorkload.get(swarmId);
    if (workload) {
      workload.activeTasks++;
      workload.lastActive = Date.now();
    }
    
    // Broadcast claim
    await this.messageBus.claimTask(swarmId, taskId, task);
    
    return task;
  }
  
  /**
   * Apply coordination strategy
   */
  async applyCoordinationStrategy(swarmId, task, bid) {
    switch (this.strategy) {
      case CoordinationStrategies.FIRST_COME:
        return true; // First to claim gets it
        
      case CoordinationStrategies.BEST_FIT:
        return this.isBestFit(swarmId, task);
        
      case CoordinationStrategies.LOAD_BALANCED:
        return this.isLoadBalanced(swarmId);
        
      case CoordinationStrategies.PRIORITY_BASED:
        return this.checkPriority(swarmId, task);
        
      case CoordinationStrategies.AUCTION:
        return this.processBid(swarmId, task.id, bid);
        
      default:
        return true;
    }
  }
  
  /**
   * Check if swarm is best fit for task
   */
  isBestFit(swarmId, task) {
    const capabilities = this.swarmCapabilities.get(swarmId);
    
    if (!capabilities) {
      return false;
    }
    
    // Check required capabilities
    if (task.requirements.capabilities) {
      const hasAllCapabilities = task.requirements.capabilities.every(cap => 
        capabilities.capabilities && capabilities.capabilities.includes(cap)
      );
      
      if (!hasAllCapabilities) {
        return false;
      }
    }
    
    // Check expertise level
    if (task.requirements.minExpertise) {
      const expertise = capabilities.expertise || 0;
      if (expertise < task.requirements.minExpertise) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Check load balancing
   */
  isLoadBalanced(swarmId) {
    const workload = this.swarmWorkload.get(swarmId);
    
    if (!workload) {
      return true;
    }
    
    // Calculate average workload
    let totalActive = 0;
    let activeSwarms = 0;
    
    for (const [id, wl] of this.swarmWorkload.entries()) {
      if (Date.now() - wl.lastActive < 5 * 60 * 1000) { // Active in last 5 minutes
        totalActive += wl.activeTasks;
        activeSwarms++;
      }
    }
    
    const avgWorkload = activeSwarms > 0 ? totalActive / activeSwarms : 0;
    
    // Allow claim if below average or within threshold
    return workload.activeTasks <= avgWorkload + 1;
  }
  
  /**
   * Check priority-based assignment
   */
  checkPriority(swarmId, task) {
    const capabilities = this.swarmCapabilities.get(swarmId);
    
    if (!capabilities) {
      return false;
    }
    
    // High priority tasks require high priority swarms
    if (task.priority === 'critical' || task.priority === 'high') {
      return capabilities.priority === 'high' || capabilities.priority === 'critical';
    }
    
    return true;
  }
  
  /**
   * Start task auction
   */
  startTaskAuction(task) {
    const auctionId = `auction_${task.id}`;
    
    this.taskAuctions = this.taskAuctions || new Map();
    this.taskAuctions.set(auctionId, {
      task,
      bids: new Map(),
      startTime: Date.now(),
      endTime: Date.now() + this.auctionDuration
    });
    
    // Schedule auction completion
    setTimeout(() => this.completeAuction(auctionId), this.auctionDuration);
    
    // Announce auction
    this.messageBus.publish({
      type: 'task:auction_started',
      data: {
        task,
        auctionId,
        duration: this.auctionDuration
      },
      priority: MessagePriority.HIGH
    });
  }
  
  /**
   * Process bid for task
   */
  processBid(swarmId, taskId, bid) {
    if (!this.taskAuctions) {
      return false;
    }
    
    const auctionId = `auction_${taskId}`;
    const auction = this.taskAuctions.get(auctionId);
    
    if (!auction || Date.now() > auction.endTime) {
      return false;
    }
    
    // Record bid
    auction.bids.set(swarmId, {
      swarmId,
      bid: bid || 0,
      timestamp: Date.now()
    });
    
    return true;
  }
  
  /**
   * Complete auction and assign task
   */
  async completeAuction(auctionId) {
    const auction = this.taskAuctions.get(auctionId);
    
    if (!auction) {
      return;
    }
    
    // Find winning bid
    let winner = null;
    let highestBid = -1;
    
    for (const [swarmId, bidData] of auction.bids.entries()) {
      if (bidData.bid > highestBid) {
        highestBid = bidData.bid;
        winner = swarmId;
      }
    }
    
    if (winner) {
      // Assign task to winner
      try {
        await this.claimTask(winner, auction.task.id);
        
        // Announce winner
        this.messageBus.publish({
          type: 'task:auction_completed',
          data: {
            auctionId,
            winner,
            bid: highestBid,
            taskId: auction.task.id
          },
          priority: MessagePriority.HIGH
        });
      } catch (error) {
        console.error('Failed to assign task to auction winner:', error);
      }
    }
    
    // Clean up auction
    this.taskAuctions.delete(auctionId);
  }
  
  /**
   * Release a task
   */
  async releaseTask(swarmId, taskId, reason = '') {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    if (task.claimedBy !== swarmId) {
      throw new Error(`Task ${taskId} not claimed by swarm ${swarmId}`);
    }
    
    // Update task state
    task.state = TaskStates.AVAILABLE;
    delete task.claimedBy;
    delete task.claimedAt;
    
    // Update workload
    const workload = this.swarmWorkload.get(swarmId);
    if (workload) {
      workload.activeTasks = Math.max(0, workload.activeTasks - 1);
    }
    
    // Record in history
    this.addToTaskHistory(taskId, {
      action: 'released',
      swarmId,
      reason,
      timestamp: Date.now()
    });
    
    // Broadcast release
    await this.messageBus.releaseTask(swarmId, taskId, reason);
    
    return task;
  }
  
  /**
   * Mark task as completed
   */
  async completeTask(swarmId, taskId, results = {}) {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    if (task.claimedBy !== swarmId) {
      throw new Error(`Task ${taskId} not claimed by swarm ${swarmId}`);
    }
    
    // Update task state
    task.state = TaskStates.COMPLETED;
    task.completedAt = Date.now();
    task.results = results;
    
    // Calculate work time
    const workTime = task.completedAt - task.claimedAt;
    
    // Update workload
    const workload = this.swarmWorkload.get(swarmId);
    if (workload) {
      workload.activeTasks = Math.max(0, workload.activeTasks - 1);
      workload.completedTasks++;
      workload.totalWorkTime += workTime;
    }
    
    // Record in history
    this.addToTaskHistory(taskId, {
      action: 'completed',
      swarmId,
      workTime,
      results,
      timestamp: Date.now()
    });
    
    // Share learnings
    if (results.learnings) {
      await this.knowledgeBase.addKnowledge({
        type: KnowledgeTypes.SOLUTION,
        title: `Solution for: ${task.title}`,
        content: results.learnings,
        swarmId,
        confidence: ConfidenceLevels.HIGH,
        metadata: {
          taskId,
          workTime,
          taskType: task.type
        }
      });
    }
    
    // Broadcast completion
    await this.messageBus.publish({
      type: MessageTypes.TASK_COMPLETED,
      swarmId,
      data: {
        taskId,
        task,
        results,
        workTime
      },
      priority: MessagePriority.HIGH
    });
    
    // Check for dependent tasks
    await this.checkDependentTasks(taskId);
    
    return task;
  }
  
  /**
   * Check and unlock dependent tasks
   */
  async checkDependentTasks(completedTaskId) {
    for (const [taskId, task] of this.tasks.entries()) {
      if (task.state === TaskStates.BLOCKED && 
          task.dependencies.includes(completedTaskId)) {
        
        // Check if all dependencies are met
        const unmetDeps = task.dependencies.filter(depId => {
          const depTask = this.tasks.get(depId);
          return !depTask || depTask.state !== TaskStates.COMPLETED;
        });
        
        if (unmetDeps.length === 0) {
          // Unlock task
          task.state = TaskStates.AVAILABLE;
          
          // Announce availability
          await this.messageBus.publish({
            type: 'task:available',
            data: task,
            priority: MessagePriority.HIGH
          });
        }
      }
    }
  }
  
  /**
   * Request help
   */
  async requestHelp(swarmId, helpData) {
    const request = {
      id: crypto.randomBytes(8).toString('hex'),
      swarmId,
      type: helpData.type || 'general',
      description: helpData.description,
      context: helpData.context,
      urgency: helpData.urgency || 'normal',
      timestamp: Date.now()
    };
    
    this.helpRequests.set(request.id, request);
    
    // Broadcast help request
    await this.messageBus.requestHelp(swarmId, request);
    
    // Search knowledge base for solutions
    const solutions = await this.knowledgeBase.search(request.description, {
      type: KnowledgeTypes.SOLUTION,
      limit: 5
    });
    
    if (solutions.length > 0) {
      // Automatically provide knowledge-based help
      this.provideHelp(request.id, {
        helperId: 'knowledge-base',
        type: 'knowledge',
        solutions
      });
    }
    
    return request;
  }
  
  /**
   * Provide help
   */
  async provideHelp(requestId, helpData) {
    const request = this.helpRequests.get(requestId);
    
    if (!request) {
      throw new Error(`Help request ${requestId} not found`);
    }
    
    const response = {
      id: crypto.randomBytes(8).toString('hex'),
      requestId,
      helperId: helpData.helperId,
      type: helpData.type || 'solution',
      content: helpData.content || helpData.solutions,
      timestamp: Date.now()
    };
    
    // Record response
    if (!this.helpResponses.has(requestId)) {
      this.helpResponses.set(requestId, []);
    }
    this.helpResponses.get(requestId).push(response);
    
    // Broadcast help response
    await this.messageBus.publish({
      type: MessageTypes.HELP_RESPONSE,
      data: {
        request,
        response
      },
      priority: MessagePriority.HIGH
    });
    
    return response;
  }
  
  /**
   * Share resource
   */
  async shareResource(swarmId, resource) {
    const sharedResource = {
      id: resource.id || crypto.randomBytes(8).toString('hex'),
      type: resource.type || ResourceTypes.ARTIFACT,
      name: resource.name,
      content: resource.content,
      metadata: resource.metadata || {},
      sharedBy: swarmId,
      sharedAt: Date.now()
    };
    
    this.sharedResources.set(sharedResource.id, sharedResource);
    
    // Broadcast based on resource type
    const messageType = {
      [ResourceTypes.CODE]: MessageTypes.CODE_SHARED,
      [ResourceTypes.CONFIG]: MessageTypes.CONFIG_SHARED,
      [ResourceTypes.ARTIFACT]: MessageTypes.ARTIFACT_CREATED
    }[resource.type] || MessageTypes.ARTIFACT_CREATED;
    
    await this.messageBus.publish({
      type: messageType,
      swarmId,
      data: sharedResource,
      priority: MessagePriority.NORMAL
    });
    
    // Store in knowledge base if valuable
    if (resource.type === ResourceTypes.CODE || resource.type === ResourceTypes.CONFIG) {
      await this.knowledgeBase.addKnowledge({
        type: KnowledgeTypes.PATTERN,
        title: resource.name,
        content: resource.description || `Shared ${resource.type}: ${resource.name}`,
        swarmId,
        confidence: ConfidenceLevels.HIGH,
        metadata: {
          resourceId: sharedResource.id,
          resourceType: resource.type
        }
      });
    }
    
    return sharedResource;
  }
  
  /**
   * Get shared resource
   */
  getSharedResource(resourceId) {
    return this.sharedResources.get(resourceId);
  }
  
  /**
   * Search shared resources
   */
  searchSharedResources(query) {
    const results = [];
    
    for (const resource of this.sharedResources.values()) {
      if (resource.name.toLowerCase().includes(query.toLowerCase()) ||
          (resource.metadata.tags && resource.metadata.tags.some(tag => 
            tag.toLowerCase().includes(query.toLowerCase())))) {
        results.push(resource);
      }
    }
    
    return results;
  }
  
  /**
   * Add to task history
   */
  addToTaskHistory(taskId, entry) {
    if (!this.taskHistory.has(taskId)) {
      this.taskHistory.set(taskId, []);
    }
    
    this.taskHistory.get(taskId).push(entry);
  }
  
  /**
   * Handle task claim message
   */
  async handleTaskClaim(message) {
    const { taskId } = message.data;
    const task = this.tasks.get(taskId);
    
    if (task && task.state === TaskStates.AVAILABLE) {
      // Another swarm claimed it
      task.state = TaskStates.CLAIMED;
      task.claimedBy = message.swarmId;
      task.claimedAt = message.timestamp;
    }
  }
  
  /**
   * Handle task release message
   */
  async handleTaskRelease(message) {
    const { taskId, reason } = message.data;
    const task = this.tasks.get(taskId);
    
    if (task && task.claimedBy === message.swarmId) {
      task.state = TaskStates.AVAILABLE;
      delete task.claimedBy;
      delete task.claimedAt;
      
      this.addToTaskHistory(taskId, {
        action: 'released',
        swarmId: message.swarmId,
        reason,
        timestamp: message.timestamp
      });
    }
  }
  
  /**
   * Handle task completion message
   */
  async handleTaskCompletion(message) {
    const { taskId, results } = message.data;
    const task = this.tasks.get(taskId);
    
    if (task) {
      task.state = TaskStates.COMPLETED;
      task.completedAt = message.timestamp;
      task.results = results;
      
      // Check dependent tasks
      await this.checkDependentTasks(taskId);
    }
  }
  
  /**
   * Handle help request message
   */
  async handleHelpRequest(message) {
    const request = message.data;
    this.helpRequests.set(request.id, request);
    
    // Notify relevant swarms based on capabilities
    // This would typically trigger AI agents to evaluate if they can help
  }
  
  /**
   * Handle help response message
   */
  async handleHelpResponse(message) {
    const { request, response } = message.data;
    
    if (!this.helpResponses.has(request.id)) {
      this.helpResponses.set(request.id, []);
    }
    
    this.helpResponses.get(request.id).push(response);
  }
  
  /**
   * Handle resource shared message
   */
  async handleResourceShared(message) {
    const resource = message.data;
    this.sharedResources.set(resource.id, resource);
  }
  
  /**
   * Handle progress update
   */
  async handleProgressUpdate(message) {
    const { taskId, progress } = message.data;
    const task = this.tasks.get(taskId);
    
    if (task) {
      task.progress = progress;
      task.lastProgressUpdate = message.timestamp;
    }
  }
  
  /**
   * Get coordination statistics
   */
  getStatistics() {
    const stats = {
      totalTasks: this.tasks.size,
      tasksByState: {},
      swarmWorkloads: {},
      helpRequests: this.helpRequests.size,
      sharedResources: this.sharedResources.size,
      averageWorkTime: 0
    };
    
    // Count tasks by state
    for (const task of this.tasks.values()) {
      stats.tasksByState[task.state] = (stats.tasksByState[task.state] || 0) + 1;
    }
    
    // Calculate workloads and average work time
    let totalWorkTime = 0;
    let completedTasks = 0;
    
    for (const [swarmId, workload] of this.swarmWorkload.entries()) {
      stats.swarmWorkloads[swarmId] = {
        active: workload.activeTasks,
        completed: workload.completedTasks,
        failed: workload.failedTasks,
        avgWorkTime: workload.completedTasks > 0 ? 
          workload.totalWorkTime / workload.completedTasks : 0
      };
      
      totalWorkTime += workload.totalWorkTime;
      completedTasks += workload.completedTasks;
    }
    
    stats.averageWorkTime = completedTasks > 0 ? totalWorkTime / completedTasks : 0;
    
    return stats;
  }
}

// Singleton instance
let globalCoordinationProtocol = null;

/**
 * Get or create the global coordination protocol
 */
export function getGlobalCoordinationProtocol(options = {}) {
  if (!globalCoordinationProtocol) {
    globalCoordinationProtocol = new SwarmCoordinationProtocol(options);
  }
  return globalCoordinationProtocol;
}

/**
 * Create a new coordination protocol instance
 */
export function createCoordinationProtocol(options = {}) {
  return new SwarmCoordinationProtocol(options);
}

export default SwarmCoordinationProtocol;