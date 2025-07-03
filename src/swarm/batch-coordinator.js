#!/usr/bin/env node
/**
 * Batch Tool Coordinator for Swarm-of-Swarms
 * Enables efficient parallel execution through batch operations
 */

import { EventEmitter } from 'events';
import { generateId } from '../utils/helpers.js';

export class BatchToolCoordinator extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      maxBatchSize: config.maxBatchSize || 10,
      batchTimeout: config.batchTimeout || 5000,
      maxConcurrentBatches: config.maxConcurrentBatches || 3,
      enableTodoWrite: config.enableTodoWrite !== false,
      enableParallelFiles: config.enableParallelFiles !== false,
      ...config
    };
    
    this.pendingOperations = new Map();
    this.activeBatches = new Map();
    this.operationQueues = {
      todoWrite: [],
      fileRead: [],
      fileWrite: [],
      search: [],
      analysis: []
    };
    
    this.batchTimers = new Map();
    this.stats = {
      totalBatches: 0,
      totalOperations: 0,
      batchedOperations: 0,
      timesSaved: 0
    };
  }

  /**
   * Initialize the batch coordinator
   */
  async initialize() {
    console.log('🔄 Initializing Batch Tool Coordinator...');
    
    // Setup batch processing timers
    Object.keys(this.operationQueues).forEach(type => {
      this.setupBatchTimer(type);
    });
    
    this.emit('initialized');
  }

  /**
   * Queue an operation for batch processing
   */
  async queueOperation(operation) {
    const { type, swarmId, data, priority = 'normal' } = operation;
    const operationId = generateId('batch-op');
    
    const queuedOp = {
      id: operationId,
      swarmId,
      type,
      data,
      priority,
      timestamp: Date.now(),
      promise: null,
      resolve: null,
      reject: null
    };
    
    // Create promise for operation completion
    const promise = new Promise((resolve, reject) => {
      queuedOp.resolve = resolve;
      queuedOp.reject = reject;
    });
    queuedOp.promise = promise;
    
    // Add to appropriate queue
    if (this.operationQueues[type]) {
      this.operationQueues[type].push(queuedOp);
      this.pendingOperations.set(operationId, queuedOp);
      
      // Check if we should process immediately
      if (this.shouldProcessImmediately(type)) {
        await this.processBatch(type);
      }
    } else {
      throw new Error(`Unknown operation type: ${type}`);
    }
    
    return promise;
  }

  /**
   * Queue TodoWrite operations for coordination
   */
  async queueTodoWrite(swarmId, todos) {
    if (!this.config.enableTodoWrite) {
      return this.executeTodoWriteDirect(todos);
    }
    
    return this.queueOperation({
      type: 'todoWrite',
      swarmId,
      data: { todos },
      priority: 'high'
    });
  }

  /**
   * Queue parallel file operations
   */
  async queueFileOperations(swarmId, operations) {
    if (!this.config.enableParallelFiles) {
      return this.executeFileOperationsDirect(operations);
    }
    
    const promises = operations.map(op => {
      return this.queueOperation({
        type: op.type === 'read' ? 'fileRead' : 'fileWrite',
        swarmId,
        data: op,
        priority: op.priority || 'normal'
      });
    });
    
    return Promise.all(promises);
  }

  /**
   * Queue search operations (Glob/Grep)
   */
  async queueSearchOperations(swarmId, searches) {
    const promises = searches.map(search => {
      return this.queueOperation({
        type: 'search',
        swarmId,
        data: search,
        priority: 'normal'
      });
    });
    
    return Promise.all(promises);
  }

  /**
   * Queue analysis operations
   */
  async queueAnalysisOperations(swarmId, analyses) {
    const promises = analyses.map(analysis => {
      return this.queueOperation({
        type: 'analysis',
        swarmId,
        data: analysis,
        priority: analysis.priority || 'low'
      });
    });
    
    return Promise.all(promises);
  }

  /**
   * Process a batch of operations
   */
  async processBatch(type) {
    const queue = this.operationQueues[type];
    if (queue.length === 0) return;
    
    // Clear existing timer
    if (this.batchTimers.has(type)) {
      clearTimeout(this.batchTimers.get(type));
      this.batchTimers.delete(type);
    }
    
    // Get operations to process
    const batchSize = Math.min(queue.length, this.config.maxBatchSize);
    const batch = queue.splice(0, batchSize);
    const batchId = generateId('batch');
    
    console.log(`📦 Processing batch ${batchId} with ${batch.length} ${type} operations`);
    
    this.activeBatches.set(batchId, {
      type,
      operations: batch,
      startTime: Date.now()
    });
    
    try {
      // Execute batch based on type
      let results;
      switch (type) {
        case 'todoWrite':
          results = await this.executeTodoWriteBatch(batch);
          break;
        case 'fileRead':
          results = await this.executeFileReadBatch(batch);
          break;
        case 'fileWrite':
          results = await this.executeFileWriteBatch(batch);
          break;
        case 'search':
          results = await this.executeSearchBatch(batch);
          break;
        case 'analysis':
          results = await this.executeAnalysisBatch(batch);
          break;
        default:
          throw new Error(`Unknown batch type: ${type}`);
      }
      
      // Resolve promises
      batch.forEach((op, index) => {
        if (results[index].success) {
          op.resolve(results[index].data);
        } else {
          op.reject(results[index].error);
        }
        this.pendingOperations.delete(op.id);
      });
      
      // Update stats
      this.stats.totalBatches++;
      this.stats.batchedOperations += batch.length;
      this.stats.timesSaved += batch.length - 1; // All but one operation saved time
      
      const duration = Date.now() - this.activeBatches.get(batchId).startTime;
      console.log(`✅ Batch ${batchId} completed in ${duration}ms`);
      
      this.emit('batchCompleted', {
        batchId,
        type,
        operationCount: batch.length,
        duration
      });
      
    } catch (error) {
      console.error(`❌ Batch ${batchId} failed:`, error);
      
      // Reject all operations in batch
      batch.forEach(op => {
        op.reject(error);
        this.pendingOperations.delete(op.id);
      });
      
      this.emit('batchFailed', {
        batchId,
        type,
        error
      });
      
    } finally {
      this.activeBatches.delete(batchId);
      
      // Setup next timer if queue not empty
      if (this.operationQueues[type].length > 0) {
        this.setupBatchTimer(type);
      }
    }
  }

  /**
   * Execute TodoWrite batch
   */
  async executeTodoWriteBatch(batch) {
    // Merge all todos from different swarms
    const mergedTodos = [];
    const swarmTodoMap = new Map();
    
    batch.forEach(op => {
      const { swarmId, data } = op;
      const { todos } = data;
      
      todos.forEach(todo => {
        const enhancedTodo = {
          ...todo,
          id: `${swarmId}_${todo.id}`,
          metadata: {
            swarmId,
            originalId: todo.id,
            batchId: batch[0].id
          }
        };
        mergedTodos.push(enhancedTodo);
        
        if (!swarmTodoMap.has(swarmId)) {
          swarmTodoMap.set(swarmId, []);
        }
        swarmTodoMap.get(swarmId).push(enhancedTodo);
      });
    });
    
    try {
      // Execute single TodoWrite with all todos
      console.log(`📝 Writing ${mergedTodos.length} todos from ${batch.length} swarms`);
      
      // Simulate TodoWrite execution
      // In real implementation, this would call the actual TodoWrite tool
      await this.simulateTodoWrite(mergedTodos);
      
      // Return success for each operation with their respective todos
      return batch.map(op => ({
        success: true,
        data: {
          todos: swarmTodoMap.get(op.swarmId),
          merged: true,
          totalTodos: mergedTodos.length
        }
      }));
      
    } catch (error) {
      return batch.map(() => ({
        success: false,
        error
      }));
    }
  }

  /**
   * Execute file read batch
   */
  async executeFileReadBatch(batch) {
    // Group by similar paths for efficient reading
    const pathGroups = new Map();
    
    batch.forEach(op => {
      const { path, options = {} } = op.data;
      const key = `${path}_${JSON.stringify(options)}`;
      
      if (!pathGroups.has(key)) {
        pathGroups.set(key, []);
      }
      pathGroups.get(key).push(op);
    });
    
    console.log(`📖 Reading ${pathGroups.size} unique files for ${batch.length} operations`);
    
    const results = new Map();
    
    // Read each unique file once
    for (const [key, ops] of pathGroups.entries()) {
      const { path, options } = ops[0].data;
      
      try {
        // Simulate file read
        const content = await this.simulateFileRead(path, options);
        
        ops.forEach(op => {
          results.set(op.id, {
            success: true,
            data: content
          });
        });
      } catch (error) {
        ops.forEach(op => {
          results.set(op.id, {
            success: false,
            error
          });
        });
      }
    }
    
    // Return results in original order
    return batch.map(op => results.get(op.id));
  }

  /**
   * Execute file write batch
   */
  async executeFileWriteBatch(batch) {
    // Group writes by directory for efficient operation
    const dirGroups = new Map();
    
    batch.forEach(op => {
      const { path } = op.data;
      const dir = path.substring(0, path.lastIndexOf('/'));
      
      if (!dirGroups.has(dir)) {
        dirGroups.set(dir, []);
      }
      dirGroups.get(dir).push(op);
    });
    
    console.log(`✍️ Writing ${batch.length} files across ${dirGroups.size} directories`);
    
    // Execute writes in parallel per directory
    const writePromises = [];
    
    for (const [dir, ops] of dirGroups.entries()) {
      const dirPromise = this.executeDirectoryWrites(dir, ops);
      writePromises.push(dirPromise);
    }
    
    const dirResults = await Promise.all(writePromises);
    
    // Flatten results
    const results = new Map();
    dirResults.forEach(dirResult => {
      dirResult.forEach((result, opId) => {
        results.set(opId, result);
      });
    });
    
    return batch.map(op => results.get(op.id));
  }

  /**
   * Execute search batch (Glob/Grep)
   */
  async executeSearchBatch(batch) {
    // Group by search type and pattern for efficiency
    const searchGroups = new Map();
    
    batch.forEach(op => {
      const { type, pattern, path = '.' } = op.data;
      const key = `${type}_${pattern}_${path}`;
      
      if (!searchGroups.has(key)) {
        searchGroups.set(key, {
          type,
          pattern,
          path,
          operations: []
        });
      }
      searchGroups.get(key).operations.push(op);
    });
    
    console.log(`🔍 Executing ${searchGroups.size} unique searches for ${batch.length} operations`);
    
    const results = new Map();
    
    // Execute each unique search once
    for (const [key, group] of searchGroups.entries()) {
      try {
        const searchResults = await this.simulateSearch(group);
        
        group.operations.forEach(op => {
          results.set(op.id, {
            success: true,
            data: searchResults
          });
        });
      } catch (error) {
        group.operations.forEach(op => {
          results.set(op.id, {
            success: false,
            error
          });
        });
      }
    }
    
    return batch.map(op => results.get(op.id));
  }

  /**
   * Execute analysis batch
   */
  async executeAnalysisBatch(batch) {
    // Group similar analyses
    const analysisGroups = new Map();
    
    batch.forEach(op => {
      const { type, target } = op.data;
      const key = `${type}_${target}`;
      
      if (!analysisGroups.has(key)) {
        analysisGroups.set(key, []);
      }
      analysisGroups.get(key).push(op);
    });
    
    console.log(`🔬 Running ${analysisGroups.size} analysis groups for ${batch.length} operations`);
    
    // Execute analyses in parallel
    const analysisPromises = [];
    
    for (const [key, ops] of analysisGroups.entries()) {
      const promise = this.executeAnalysisGroup(ops);
      analysisPromises.push(promise);
    }
    
    const groupResults = await Promise.all(analysisPromises);
    
    // Flatten results
    const results = new Map();
    groupResults.forEach(groupResult => {
      groupResult.forEach((result, opId) => {
        results.set(opId, result);
      });
    });
    
    return batch.map(op => results.get(op.id));
  }

  /**
   * Helper: Execute writes for a directory
   */
  async executeDirectoryWrites(dir, operations) {
    const results = new Map();
    
    try {
      // Ensure directory exists
      await this.simulateDirectoryCreate(dir);
      
      // Write files in parallel
      const writePromises = operations.map(async op => {
        try {
          await this.simulateFileWrite(op.data.path, op.data.content);
          results.set(op.id, { success: true, data: { written: true } });
        } catch (error) {
          results.set(op.id, { success: false, error });
        }
      });
      
      await Promise.all(writePromises);
      
    } catch (error) {
      // Directory creation failed, fail all operations
      operations.forEach(op => {
        results.set(op.id, { success: false, error });
      });
    }
    
    return results;
  }

  /**
   * Helper: Execute analysis group
   */
  async executeAnalysisGroup(operations) {
    const results = new Map();
    
    // Get shared analysis data
    const { type, target } = operations[0].data;
    
    try {
      const analysisResult = await this.simulateAnalysis(type, target);
      
      // Apply specific filters/transforms for each operation
      operations.forEach(op => {
        const filtered = this.applyAnalysisFilter(analysisResult, op.data.filter);
        results.set(op.id, {
          success: true,
          data: filtered
        });
      });
      
    } catch (error) {
      operations.forEach(op => {
        results.set(op.id, { success: false, error });
      });
    }
    
    return results;
  }

  /**
   * Determine if batch should be processed immediately
   */
  shouldProcessImmediately(type) {
    const queue = this.operationQueues[type];
    
    // Process immediately if:
    // 1. Queue is at max batch size
    // 2. High priority operation in queue
    // 3. No active batches of this type
    
    if (queue.length >= this.config.maxBatchSize) {
      return true;
    }
    
    if (queue.some(op => op.priority === 'critical')) {
      return true;
    }
    
    const hasActiveBatch = Array.from(this.activeBatches.values())
      .some(batch => batch.type === type);
    
    return !hasActiveBatch && queue.length > 0;
  }

  /**
   * Setup batch processing timer
   */
  setupBatchTimer(type) {
    if (this.batchTimers.has(type)) {
      clearTimeout(this.batchTimers.get(type));
    }
    
    const timer = setTimeout(() => {
      this.processBatch(type);
    }, this.config.batchTimeout);
    
    this.batchTimers.set(type, timer);
  }

  /**
   * Get current statistics
   */
  getStats() {
    const queueSizes = {};
    Object.entries(this.operationQueues).forEach(([type, queue]) => {
      queueSizes[type] = queue.length;
    });
    
    return {
      ...this.stats,
      pendingOperations: this.pendingOperations.size,
      activeBatches: this.activeBatches.size,
      queueSizes,
      efficiency: this.stats.totalOperations > 0 
        ? (this.stats.batchedOperations / this.stats.totalOperations * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Shutdown coordinator
   */
  async shutdown() {
    console.log('🛑 Shutting down Batch Tool Coordinator...');
    
    // Clear all timers
    this.batchTimers.forEach(timer => clearTimeout(timer));
    this.batchTimers.clear();
    
    // Process remaining operations
    const remainingTypes = Object.keys(this.operationQueues)
      .filter(type => this.operationQueues[type].length > 0);
    
    if (remainingTypes.length > 0) {
      console.log(`⚠️ Processing ${remainingTypes.length} remaining operation types...`);
      
      const promises = remainingTypes.map(type => this.processBatch(type));
      await Promise.allSettled(promises);
    }
    
    console.log('📊 Final stats:', this.getStats());
    
    this.emit('shutdown');
  }

  // === Simulation methods (replace with actual tool calls) ===
  
  async simulateTodoWrite(todos) {
    // Simulate TodoWrite execution
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, todosWritten: todos.length };
  }

  async simulateFileRead(path, options) {
    // Simulate file read
    await new Promise(resolve => setTimeout(resolve, 50));
    return `Content of ${path}`;
  }

  async simulateFileWrite(path, content) {
    // Simulate file write
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true };
  }

  async simulateDirectoryCreate(dir) {
    // Simulate directory creation
    await new Promise(resolve => setTimeout(resolve, 20));
    return { success: true };
  }

  async simulateSearch(searchGroup) {
    // Simulate search operation
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      type: searchGroup.type,
      pattern: searchGroup.pattern,
      results: [`match1.js`, `match2.js`]
    };
  }

  async simulateAnalysis(type, target) {
    // Simulate analysis operation
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      type,
      target,
      metrics: { complexity: 10, coverage: 80 }
    };
  }

  applyAnalysisFilter(result, filter) {
    // Apply filter to analysis results
    if (!filter) return result;
    
    // Simple filter implementation
    return {
      ...result,
      filtered: true
    };
  }

  async executeTodoWriteDirect(todos) {
    // Direct execution without batching
    return this.simulateTodoWrite(todos);
  }

  async executeFileOperationsDirect(operations) {
    // Direct execution without batching
    const promises = operations.map(op => {
      if (op.type === 'read') {
        return this.simulateFileRead(op.path, op.options);
      } else {
        return this.simulateFileWrite(op.path, op.content);
      }
    });
    
    return Promise.all(promises);
  }
}

// Export for use in swarm-of-swarms
export default BatchToolCoordinator;