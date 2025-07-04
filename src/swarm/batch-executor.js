#!/usr/bin/env node
/**
 * Batch Executor for Swarm-of-Swarms
 * Collects and executes similar tasks from multiple swarms in parallel
 */

import { EventEmitter } from 'node:events';
import { spawn } from 'node:child_process';
import { generateId } from '../utils/helpers.js';

export class SwarmBatchExecutor extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      maxBatchSize: config.maxBatchSize || 20,
      maxConcurrentBatches: config.maxConcurrentBatches || 5,
      batchCollectionTimeout: config.batchCollectionTimeout || 3000,
      retryAttempts: config.retryAttempts || 2,
      priorityLevels: ['critical', 'high', 'normal', 'low', 'background'],
      ...config
    };
    
    this.taskQueues = new Map(); // Grouped by task type
    this.activeBatches = new Map();
    this.completedBatches = new Map();
    this.retryQueue = [];
    
    this.collectionTimers = new Map();
    this.stats = {
      totalBatches: 0,
      successfulBatches: 0,
      failedBatches: 0,
      totalTasks: 0,
      tasksPerBatch: []
    };
  }

  /**
   * Initialize the batch executor
   */
  async initialize() {
    console.log('🚀 Initializing Swarm Batch Executor...');
    
    // Setup periodic stats reporting
    this.statsInterval = setInterval(() => {
      this.reportStats();
    }, 30000); // Every 30 seconds
    
    this.emit('initialized');
  }

  /**
   * Submit a task for batch execution
   */
  async submitTask(task) {
    const taskId = generateId('batch-task');
    const enhancedTask = {
      ...task,
      id: taskId,
      submittedAt: Date.now(),
      status: 'queued',
      attempts: 0
    };
    
    // Get or create queue for this task type
    const taskType = this.getTaskType(task);
    if (!this.taskQueues.has(taskType)) {
      this.taskQueues.set(taskType, {
        type: taskType,
        tasks: [],
        priority: this.getTaskPriority(task)
      });
    }
    
    const queue = this.taskQueues.get(taskType);
    queue.tasks.push(enhancedTask);
    
    console.log(`📥 Task ${taskId} queued for batch execution (type: ${taskType})`);
    
    // Check if we should start batch collection
    this.checkBatchCollection(taskType);
    
    // Return promise that resolves when task completes
    return new Promise((resolve, reject) => {
      enhancedTask.resolve = resolve;
      enhancedTask.reject = reject;
    });
  }

  /**
   * Submit multiple tasks from a swarm
   */
  async submitSwarmTasks(swarmId, tasks) {
    console.log(`🐝 Received ${tasks.length} tasks from swarm ${swarmId}`);
    
    const promises = tasks.map(task => {
      return this.submitTask({
        ...task,
        swarmId,
        metadata: {
          ...task.metadata,
          swarmId
        }
      });
    });
    
    return Promise.all(promises);
  }

  /**
   * Check if batch collection should start
   */
  checkBatchCollection(taskType) {
    const queue = this.taskQueues.get(taskType);
    if (!queue) return;
    
    // Start collection if:
    // 1. Queue has enough tasks for a batch
    // 2. High priority tasks in queue
    // 3. Collection timer not already running
    
    const shouldCollect = 
      queue.tasks.length >= this.config.maxBatchSize ||
      queue.priority === 'critical' ||
      (queue.priority === 'high' && queue.tasks.length >= 5);
    
    if (shouldCollect && !this.collectionTimers.has(taskType)) {
      this.startBatchCollection(taskType);
    } else if (!this.collectionTimers.has(taskType) && queue.tasks.length > 0) {
      // Start timer for eventual collection
      const timer = setTimeout(() => {
        this.startBatchCollection(taskType);
      }, this.config.batchCollectionTimeout);
      
      this.collectionTimers.set(taskType, timer);
    }
  }

  /**
   * Start collecting tasks for batch execution
   */
  async startBatchCollection(taskType) {
    // Clear any existing timer
    if (this.collectionTimers.has(taskType)) {
      clearTimeout(this.collectionTimers.get(taskType));
      this.collectionTimers.delete(taskType);
    }
    
    const queue = this.taskQueues.get(taskType);
    if (!queue || queue.tasks.length === 0) return;
    
    // Wait if too many active batches
    if (this.activeBatches.size >= this.config.maxConcurrentBatches) {
      console.log(`⏳ Delaying batch for ${taskType} - max concurrent batches reached`);
      setTimeout(() => this.checkBatchCollection(taskType), 1000);
      return;
    }
    
    // Collect tasks for batch
    const batchSize = Math.min(queue.tasks.length, this.config.maxBatchSize);
    const batchTasks = queue.tasks.splice(0, batchSize);
    const batchId = generateId('batch');
    
    const batch = {
      id: batchId,
      type: taskType,
      tasks: batchTasks,
      priority: queue.priority,
      startTime: Date.now(),
      status: 'executing'
    };
    
    this.activeBatches.set(batchId, batch);
    
    console.log(`📦 Starting batch ${batchId} with ${batchTasks.length} ${taskType} tasks`);
    
    try {
      await this.executeBatch(batch);
    } catch (error) {
      console.error(`❌ Batch ${batchId} failed:`, error);
      this.handleBatchFailure(batch, error);
    }
  }

  /**
   * Execute a batch of similar tasks
   */
  async executeBatch(batch) {
    const { id: batchId, type, tasks } = batch;
    
    this.emit('batchStarted', { batchId, type, taskCount: tasks.length });
    
    try {
      // Execute based on task type
      let results;
      switch (type) {
        case 'code_generation':
          results = await this.executeCodeGenerationBatch(tasks);
          break;
        case 'code_analysis':
          results = await this.executeCodeAnalysisBatch(tasks);
          break;
        case 'testing':
          results = await this.executeTestingBatch(tasks);
          break;
        case 'documentation':
          results = await this.executeDocumentationBatch(tasks);
          break;
        case 'research':
          results = await this.executeResearchBatch(tasks);
          break;
        case 'optimization':
          results = await this.executeOptimizationBatch(tasks);
          break;
        default:
          results = await this.executeGenericBatch(tasks);
      }
      
      // Process results
      const endTime = Date.now();
      batch.endTime = endTime;
      batch.duration = endTime - batch.startTime;
      batch.status = 'completed';
      batch.results = results;
      
      // Resolve task promises
      tasks.forEach((task, index) => {
        const result = results[index];
        if (result.success) {
          task.resolve(result.data);
        } else {
          task.reject(result.error);
        }
      });
      
      // Update stats
      this.stats.totalBatches++;
      this.stats.successfulBatches++;
      this.stats.totalTasks += tasks.length;
      this.stats.tasksPerBatch.push(tasks.length);
      
      // Move to completed
      this.activeBatches.delete(batchId);
      this.completedBatches.set(batchId, batch);
      
      console.log(`✅ Batch ${batchId} completed in ${batch.duration}ms`);
      
      this.emit('batchCompleted', {
        batchId,
        type,
        taskCount: tasks.length,
        duration: batch.duration,
        successRate: results.filter(r => r.success).length / results.length
      });
      
      // Check if more tasks are waiting
      if (this.taskQueues.get(type)?.tasks.length > 0) {
        this.checkBatchCollection(type);
      }
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Execute code generation batch
   */
  async executeCodeGenerationBatch(tasks) {
    console.log(`💻 Generating code for ${tasks.length} tasks in parallel`);
    
    // Group by target language/framework
    const groups = this.groupTasksByAttribute(tasks, 'language');
    
    const results = [];
    
    for (const [language, groupTasks] of groups.entries()) {
      // Create combined prompt for efficiency
      const combinedPrompt = this.createCombinedCodePrompt(groupTasks, language);
      
      try {
        const response = await this.executeClaudeCommand({
          prompt: combinedPrompt,
          maxTokens: 4000 * groupTasks.length,
          temperature: 0.3,
          metadata: {
            batchType: 'code_generation',
            language,
            taskCount: groupTasks.length
          }
        });
        
        // Parse response and distribute to tasks
        const parsedResults = this.parseCodeGenerationResponse(response, groupTasks);
        results.push(...parsedResults);
        
      } catch (error) {
        // Mark all tasks in group as failed
        groupTasks.forEach(() => {
          results.push({ success: false, error });
        });
      }
    }
    
    return results;
  }

  /**
   * Execute code analysis batch
   */
  async executeCodeAnalysisBatch(tasks) {
    console.log(`🔍 Analyzing code for ${tasks.length} tasks in parallel`);
    
    // Group by analysis type
    const groups = this.groupTasksByAttribute(tasks, 'analysisType');
    
    const results = [];
    
    for (const [analysisType, groupTasks] of groups.entries()) {
      const files = groupTasks.map(t => t.data.file).filter(Boolean);
      
      if (files.length > 0) {
        try {
          // Batch analyze files
          const analysisResults = await this.performBatchAnalysis(files, analysisType);
          
          groupTasks.forEach((task, index) => {
            results.push({
              success: true,
              data: analysisResults[index] || analysisResults[0]
            });
          });
          
        } catch (error) {
          groupTasks.forEach(() => {
            results.push({ success: false, error });
          });
        }
      }
    }
    
    return results;
  }

  /**
   * Execute testing batch
   */
  async executeTestingBatch(tasks) {
    console.log(`🧪 Running tests for ${tasks.length} tasks in parallel`);
    
    // Group by test type
    const groups = this.groupTasksByAttribute(tasks, 'testType');
    
    const results = [];
    
    for (const [testType, groupTasks] of groups.entries()) {
      try {
        // Create test suite for batch
        const testSuite = this.createBatchTestSuite(groupTasks, testType);
        
        // Execute tests in parallel
        const testResults = await this.executeBatchTests(testSuite);
        
        // Map results back to tasks
        groupTasks.forEach((task, index) => {
          results.push({
            success: testResults[index].passed,
            data: testResults[index]
          });
        });
        
      } catch (error) {
        groupTasks.forEach(() => {
          results.push({ success: false, error });
        });
      }
    }
    
    return results;
  }

  /**
   * Execute documentation batch
   */
  async executeDocumentationBatch(tasks) {
    console.log(`📚 Generating documentation for ${tasks.length} tasks`);
    
    // Create unified documentation request
    const docRequest = {
      files: tasks.map(t => t.data.file),
      format: tasks[0].data.format || 'markdown',
      includeExamples: true,
      includeAPI: true
    };
    
    try {
      const documentation = await this.generateBatchDocumentation(docRequest);
      
      return tasks.map((task, index) => ({
        success: true,
        data: {
          content: documentation.sections[index],
          format: docRequest.format
        }
      }));
      
    } catch (error) {
      return tasks.map(() => ({ success: false, error }));
    }
  }

  /**
   * Execute research batch
   */
  async executeResearchBatch(tasks) {
    console.log(`🔬 Conducting research for ${tasks.length} tasks`);
    
    // Group by research domain
    const domains = this.groupTasksByAttribute(tasks, 'domain');
    
    const results = [];
    
    for (const [domain, domainTasks] of domains.entries()) {
      try {
        // Parallel research across multiple sources
        const researchPromises = domainTasks.map(task => 
          this.conductResearch(task.data.query, domain)
        );
        
        const researchResults = await Promise.all(researchPromises);
        
        researchResults.forEach(result => {
          results.push({ success: true, data: result });
        });
        
      } catch (error) {
        domainTasks.forEach(() => {
          results.push({ success: false, error });
        });
      }
    }
    
    return results;
  }

  /**
   * Execute optimization batch
   */
  async executeOptimizationBatch(tasks) {
    console.log(`⚡ Optimizing ${tasks.length} components`);
    
    // Analyze all components together for better optimization
    const components = tasks.map(t => ({
      id: t.id,
      code: t.data.code,
      type: t.data.componentType,
      metrics: t.data.currentMetrics
    }));
    
    try {
      const optimizationPlan = await this.createOptimizationPlan(components);
      
      // Apply optimizations in parallel
      const optimizedComponents = await this.applyOptimizations(
        components,
        optimizationPlan
      );
      
      return tasks.map((task, index) => ({
        success: true,
        data: {
          optimizedCode: optimizedComponents[index].code,
          improvements: optimizedComponents[index].improvements,
          metrics: optimizedComponents[index].metrics
        }
      }));
      
    } catch (error) {
      return tasks.map(() => ({ success: false, error }));
    }
  }

  /**
   * Execute generic batch
   */
  async executeGenericBatch(tasks) {
    console.log(`📋 Executing ${tasks.length} generic tasks`);
    
    // Execute tasks in parallel with concurrency limit
    const concurrencyLimit = 5;
    const results = [];
    
    for (let i = 0; i < tasks.length; i += concurrencyLimit) {
      const batch = tasks.slice(i, i + concurrencyLimit);
      
      const batchPromises = batch.map(task => 
        this.executeGenericTask(task)
          .then(data => ({ success: true, data }))
          .catch(error => ({ success: false, error }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Handle batch failure
   */
  handleBatchFailure(batch, error) {
    batch.status = 'failed';
    batch.error = error;
    batch.endTime = Date.now();
    batch.duration = batch.endTime - batch.startTime;
    
    // Update stats
    this.stats.totalBatches++;
    this.stats.failedBatches++;
    
    // Move to completed with failed status
    this.activeBatches.delete(batch.id);
    this.completedBatches.set(batch.id, batch);
    
    // Handle retry logic
    batch.tasks.forEach(task => {
      task.attempts++;
      
      if (task.attempts < this.config.retryAttempts) {
        console.log(`🔄 Queuing task ${task.id} for retry (attempt ${task.attempts + 1})`);
        this.retryQueue.push(task);
      } else {
        console.error(`❌ Task ${task.id} failed after ${task.attempts} attempts`);
        task.reject(error);
      }
    });
    
    this.emit('batchFailed', {
      batchId: batch.id,
      type: batch.type,
      taskCount: batch.tasks.length,
      error: error.message
    });
    
    // Process retry queue
    if (this.retryQueue.length > 0) {
      setTimeout(() => this.processRetryQueue(), 5000);
    }
  }

  /**
   * Process retry queue
   */
  async processRetryQueue() {
    const tasks = this.retryQueue.splice(0, this.config.maxBatchSize);
    
    if (tasks.length === 0) return;
    
    console.log(`♻️ Processing ${tasks.length} retry tasks`);
    
    // Re-submit tasks
    for (const task of tasks) {
      const taskType = this.getTaskType(task);
      
      if (!this.taskQueues.has(taskType)) {
        this.taskQueues.set(taskType, {
          type: taskType,
          tasks: [],
          priority: this.getTaskPriority(task)
        });
      }
      
      this.taskQueues.get(taskType).tasks.push(task);
    }
    
    // Trigger batch collection for affected types
    const affectedTypes = new Set(tasks.map(t => this.getTaskType(t)));
    affectedTypes.forEach(type => this.checkBatchCollection(type));
  }

  /**
   * Helper: Group tasks by attribute
   */
  groupTasksByAttribute(tasks, attribute) {
    const groups = new Map();
    
    tasks.forEach(task => {
      const key = task.data[attribute] || 'default';
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(task);
    });
    
    return groups;
  }

  /**
   * Helper: Get task type
   */
  getTaskType(task) {
    return task.type || task.data?.type || 'generic';
  }

  /**
   * Helper: Get task priority
   */
  getTaskPriority(task) {
    return task.priority || task.data?.priority || 'normal';
  }

  /**
   * Report statistics
   */
  reportStats() {
    const avgTasksPerBatch = this.stats.tasksPerBatch.length > 0
      ? (this.stats.tasksPerBatch.reduce((a, b) => a + b, 0) / this.stats.tasksPerBatch.length).toFixed(2)
      : 0;
    
    const successRate = this.stats.totalBatches > 0
      ? ((this.stats.successfulBatches / this.stats.totalBatches) * 100).toFixed(2)
      : 0;
    
    console.log(`📊 Batch Executor Stats:`);
    console.log(`  Total Batches: ${this.stats.totalBatches}`);
    console.log(`  Success Rate: ${successRate}%`);
    console.log(`  Total Tasks: ${this.stats.totalTasks}`);
    console.log(`  Avg Tasks/Batch: ${avgTasksPerBatch}`);
    console.log(`  Active Batches: ${this.activeBatches.size}`);
    console.log(`  Queued Tasks: ${Array.from(this.taskQueues.values()).reduce((sum, q) => sum + q.tasks.length, 0)}`);
    console.log(`  Retry Queue: ${this.retryQueue.length}`);
  }

  /**
   * Get current state
   */
  getState() {
    return {
      stats: this.stats,
      activeBatches: Array.from(this.activeBatches.values()).map(b => ({
        id: b.id,
        type: b.type,
        taskCount: b.tasks.length,
        status: b.status,
        duration: Date.now() - b.startTime
      })),
      queuedTasks: Array.from(this.taskQueues.entries()).map(([type, queue]) => ({
        type,
        count: queue.tasks.length,
        priority: queue.priority
      })),
      retryQueueSize: this.retryQueue.length
    };
  }

  /**
   * Shutdown executor
   */
  async shutdown() {
    console.log('🛑 Shutting down Swarm Batch Executor...');
    
    // Clear intervals
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
    
    // Clear collection timers
    this.collectionTimers.forEach(timer => clearTimeout(timer));
    this.collectionTimers.clear();
    
    // Wait for active batches to complete
    if (this.activeBatches.size > 0) {
      console.log(`⏳ Waiting for ${this.activeBatches.size} active batches to complete...`);
      
      // Set a timeout for graceful shutdown
      const shutdownTimeout = setTimeout(() => {
        console.warn('⚠️ Forcing shutdown after timeout');
        this.activeBatches.forEach(batch => {
          this.handleBatchFailure(batch, new Error('Forced shutdown'));
        });
      }, 30000);
      
      // Wait for batches to complete
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (this.activeBatches.size === 0) {
            clearInterval(checkInterval);
            clearTimeout(shutdownTimeout);
            resolve();
          }
        }, 100);
      });
    }
    
    // Final stats
    this.reportStats();
    
    this.emit('shutdown');
  }

  // === Simulation methods (replace with actual implementations) ===

  async executeClaudeCommand(options) {
    // Simulate Claude command execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, response: 'Simulated response' };
  }

  createCombinedCodePrompt(tasks, language) {
    return `Generate ${language} code for ${tasks.length} components`;
  }

  parseCodeGenerationResponse(response, tasks) {
    return tasks.map(() => ({
      success: true,
      data: { code: '// Generated code', language: 'javascript' }
    }));
  }

  async performBatchAnalysis(files, analysisType) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return files.map(file => ({
      file,
      analysis: { complexity: 10, issues: [] }
    }));
  }

  createBatchTestSuite(tasks, testType) {
    return { tasks, testType, suite: 'batch-test-suite' };
  }

  async executeBatchTests(testSuite) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return testSuite.tasks.map(() => ({
      passed: true,
      duration: 100,
      assertions: 5
    }));
  }

  async generateBatchDocumentation(request) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      sections: request.files.map(file => `# Documentation for ${file}`)
    };
  }

  async conductResearch(query, domain) {
    await new Promise(resolve => setTimeout(resolve, 700));
    return {
      query,
      domain,
      findings: ['Finding 1', 'Finding 2'],
      sources: ['Source 1', 'Source 2']
    };
  }

  async createOptimizationPlan(components) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      strategy: 'performance',
      targets: components.map(c => c.id)
    };
  }

  async applyOptimizations(components, plan) {
    await new Promise(resolve => setTimeout(resolve, 900));
    return components.map(c => ({
      ...c,
      code: `// Optimized: ${c.code}`,
      improvements: ['Reduced complexity', 'Improved performance'],
      metrics: { performance: 90, complexity: 5 }
    }));
  }

  async executeGenericTask(task) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { taskId: task.id, result: 'Completed' };
  }
}

// Export for use in swarm-of-swarms
export default SwarmBatchExecutor;