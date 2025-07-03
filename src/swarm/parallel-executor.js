#!/usr/bin/env node
/**
 * True Parallel Executor for Claude Flow
 * Uses worker threads or child processes for real parallelism
 */

import { Worker } from 'worker_threads';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';

export class ParallelExecutor extends EventEmitter {
  constructor(config = {}) {
    super();
    this.maxWorkers = config.maxWorkers || 4;
    this.activeWorkers = new Map();
    this.taskQueue = [];
    this.results = new Map();
  }

  /**
   * Execute multiple Claude commands in parallel
   * @param {Array} tasks - Array of {id, command, args} objects
   */
  async executeParallel(tasks) {
    console.log(`🚀 Executing ${tasks.length} tasks with up to ${this.maxWorkers} parallel workers`);
    
    // Add all tasks to queue
    this.taskQueue = [...tasks];
    
    // Start workers up to maxWorkers limit
    const workers = [];
    for (let i = 0; i < Math.min(this.maxWorkers, tasks.length); i++) {
      workers.push(this.startWorker());
    }
    
    // Wait for all tasks to complete
    await Promise.all(workers);
    
    return this.results;
  }

  async startWorker() {
    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (!task) break;
      
      console.log(`🔄 Worker starting task: ${task.id}`);
      
      try {
        const result = await this.executeTask(task);
        this.results.set(task.id, result);
        this.emit('taskComplete', { task, result });
      } catch (error) {
        console.error(`❌ Task ${task.id} failed:`, error.message);
        this.results.set(task.id, { error: error.message });
        this.emit('taskError', { task, error });
      }
    }
  }

  executeTask(task) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // Spawn claude process
      const proc = spawn('claude', task.args, {
        env: {
          ...process.env,
          CLAUDE_PARALLEL_TASK_ID: task.id,
          CLAUDE_PARALLEL_MODE: 'true'
        }
      });
      
      let stdout = '';
      let stderr = '';
      
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      proc.on('close', (code) => {
        const duration = Date.now() - startTime;
        console.log(`✅ Task ${task.id} completed in ${duration}ms`);
        
        resolve({
          taskId: task.id,
          exitCode: code,
          stdout,
          stderr,
          duration,
          success: code === 0
        });
      });
      
      proc.on('error', (err) => {
        reject(err);
      });
      
      // Timeout after 5 minutes
      setTimeout(() => {
        proc.kill('SIGTERM');
        reject(new Error(`Task ${task.id} timed out`));
      }, 5 * 60 * 1000);
    });
  }
}

// Example usage for achieve command
export function createParallelSwarm(agents) {
  const tasks = agents.map((agent, index) => ({
    id: `agent_${index}_${agent.name.replace(/\s+/g, '_')}`,
    command: 'claude',
    args: [
      agent.prompt,
      '--dangerously-skip-permissions',
      '--no-interactive'
    ]
  }));
  
  const executor = new ParallelExecutor({ maxWorkers: 4 });
  return executor.executeParallel(tasks);
}