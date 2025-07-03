/**
 * Progress Tracking System for Meta-Orchestrator
 * Provides real-time visibility into swarm execution progress
 */

import { ILogger } from '../core/logger.js';
import { IEventBus } from '../core/event-bus.js';
import { generateId } from '../utils/helpers.js';

export interface ProgressUpdate {
  id: string;
  timestamp: Date;
  iteration: number;
  phase: string;
  progress: number;
  message: string;
  details?: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface IterationProgress {
  iteration: number;
  startTime: Date;
  endTime?: Date;
  phases: PhaseProgress[];
  overall: number;
  status: 'active' | 'completed' | 'failed';
}

export interface PhaseProgress {
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  messages: string[];
  subTasks?: SubTaskProgress[];
}

export interface SubTaskProgress {
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

export class ProgressTracker {
  private iterations: Map<number, IterationProgress> = new Map();
  private currentIteration?: number;
  private updateCallbacks: ((update: ProgressUpdate) => void)[] = [];
  private progressHistory: ProgressUpdate[] = [];
  private startTime: Date;

  constructor(
    private logger: ILogger,
    private eventBus: IEventBus,
  ) {
    this.startTime = new Date();
    this.setupEventListeners();
  }

  /**
   * Start tracking a new iteration
   */
  startIteration(iteration: number, phases: string[]): void {
    this.currentIteration = iteration;
    
    const iterationProgress: IterationProgress = {
      iteration,
      startTime: new Date(),
      phases: phases.map(name => ({
        name,
        status: 'pending',
        progress: 0,
        messages: [],
      })),
      overall: 0,
      status: 'active',
    };

    this.iterations.set(iteration, iterationProgress);
    
    this.emitUpdate({
      id: generateId(),
      timestamp: new Date(),
      iteration,
      phase: 'iteration_start',
      progress: 0,
      message: `Starting iteration ${iteration}`,
      status: 'in_progress',
    });
  }

  /**
   * Update phase progress
   */
  updatePhase(phase: string, progress: number, message?: string, subTasks?: SubTaskProgress[]): void {
    if (!this.currentIteration) return;

    const iteration = this.iterations.get(this.currentIteration);
    if (!iteration) return;

    const phaseObj = iteration.phases.find(p => p.name === phase);
    if (!phaseObj) return;

    // Update phase
    phaseObj.progress = progress;
    if (message) {
      phaseObj.messages.push(message);
    }
    if (subTasks) {
      phaseObj.subTasks = subTasks;
    }

    // Update status based on progress
    if (progress === 0 && phaseObj.status === 'pending') {
      phaseObj.status = 'active';
      phaseObj.startTime = new Date();
    } else if (progress >= 100) {
      phaseObj.status = 'completed';
      phaseObj.endTime = new Date();
    }

    // Calculate overall progress
    this.updateOverallProgress(iteration);

    // Emit update
    this.emitUpdate({
      id: generateId(),
      timestamp: new Date(),
      iteration: this.currentIteration,
      phase,
      progress,
      message: message || `${phase} progress: ${progress}%`,
      details: { subTasks },
      status: phaseObj.status === 'completed' ? 'completed' : 'in_progress',
    });
  }

  /**
   * Mark phase as failed
   */
  failPhase(phase: string, error: string): void {
    if (!this.currentIteration) return;

    const iteration = this.iterations.get(this.currentIteration);
    if (!iteration) return;

    const phaseObj = iteration.phases.find(p => p.name === phase);
    if (!phaseObj) return;

    phaseObj.status = 'failed';
    phaseObj.endTime = new Date();
    phaseObj.messages.push(`ERROR: ${error}`);

    this.emitUpdate({
      id: generateId(),
      timestamp: new Date(),
      iteration: this.currentIteration,
      phase,
      progress: phaseObj.progress,
      message: `Failed: ${error}`,
      status: 'failed',
    });
  }

  /**
   * Complete current iteration
   */
  completeIteration(success: boolean, summary?: string): void {
    if (!this.currentIteration) return;

    const iteration = this.iterations.get(this.currentIteration);
    if (!iteration) return;

    iteration.endTime = new Date();
    iteration.status = success ? 'completed' : 'failed';

    this.emitUpdate({
      id: generateId(),
      timestamp: new Date(),
      iteration: this.currentIteration,
      phase: 'iteration_complete',
      progress: iteration.overall,
      message: summary || `Iteration ${this.currentIteration} ${success ? 'completed' : 'failed'}`,
      status: success ? 'completed' : 'failed',
    });
  }

  /**
   * Get current progress summary
   */
  getProgressSummary(): {
    totalIterations: number;
    currentIteration?: number;
    currentPhase?: string;
    overallProgress: number;
    elapsedTime: number;
    estimatedTimeRemaining?: number;
    iterations: IterationProgress[];
  } {
    const currentIter = this.currentIteration ? this.iterations.get(this.currentIteration) : undefined;
    const currentPhase = currentIter?.phases.find(p => p.status === 'active');
    
    // Calculate overall progress across all iterations
    const allIterations = Array.from(this.iterations.values());
    const overallProgress = allIterations.length > 0
      ? allIterations.reduce((sum, iter) => sum + iter.overall, 0) / allIterations.length
      : 0;

    // Estimate time remaining based on average iteration time
    const completedIterations = allIterations.filter(i => i.status === 'completed');
    let estimatedTimeRemaining: number | undefined;
    
    if (completedIterations.length > 0 && currentIter) {
      const avgIterationTime = completedIterations.reduce((sum, iter) => {
        const duration = (iter.endTime!.getTime() - iter.startTime.getTime());
        return sum + duration;
      }, 0) / completedIterations.length;

      const remainingIterations = this.iterations.size - completedIterations.length;
      estimatedTimeRemaining = avgIterationTime * remainingIterations;
    }

    return {
      totalIterations: this.iterations.size,
      currentIteration: this.currentIteration,
      currentPhase: currentPhase?.name,
      overallProgress,
      elapsedTime: Date.now() - this.startTime.getTime(),
      estimatedTimeRemaining,
      iterations: allIterations,
    };
  }

  /**
   * Get detailed progress for a specific iteration
   */
  getIterationDetails(iteration: number): IterationProgress | undefined {
    return this.iterations.get(iteration);
  }

  /**
   * Subscribe to progress updates
   */
  onProgress(callback: (update: ProgressUpdate) => void): () => void {
    this.updateCallbacks.push(callback);
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index >= 0) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get progress history
   */
  getHistory(limit?: number): ProgressUpdate[] {
    if (limit) {
      return this.progressHistory.slice(-limit);
    }
    return [...this.progressHistory];
  }

  /**
   * Create a formatted progress report
   */
  generateReport(): string {
    const summary = this.getProgressSummary();
    const lines: string[] = [
      '=== Meta-Orchestrator Progress Report ===',
      '',
      `Total Iterations: ${summary.totalIterations}`,
      `Current Iteration: ${summary.currentIteration || 'N/A'}`,
      `Current Phase: ${summary.currentPhase || 'N/A'}`,
      `Overall Progress: ${summary.overallProgress.toFixed(1)}%`,
      `Elapsed Time: ${this.formatDuration(summary.elapsedTime)}`,
    ];

    if (summary.estimatedTimeRemaining) {
      lines.push(`Estimated Time Remaining: ${this.formatDuration(summary.estimatedTimeRemaining)}`);
    }

    lines.push('', '=== Iteration Details ===');

    for (const iteration of summary.iterations) {
      lines.push('', `Iteration ${iteration.iteration}: ${iteration.status} (${iteration.overall.toFixed(1)}%)`);
      
      for (const phase of iteration.phases) {
        const statusIcon = this.getStatusIcon(phase.status);
        lines.push(`  ${statusIcon} ${phase.name}: ${phase.progress.toFixed(1)}%`);
        
        if (phase.subTasks && phase.subTasks.length > 0) {
          for (const subTask of phase.subTasks) {
            const subIcon = this.getStatusIcon(subTask.status);
            lines.push(`    ${subIcon} ${subTask.name}: ${subTask.progress.toFixed(1)}%`);
          }
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Private helper methods
   */
  private updateOverallProgress(iteration: IterationProgress): void {
    const totalPhases = iteration.phases.length;
    const progressSum = iteration.phases.reduce((sum, phase) => sum + phase.progress, 0);
    iteration.overall = totalPhases > 0 ? progressSum / totalPhases : 0;
  }

  private emitUpdate(update: ProgressUpdate): void {
    this.progressHistory.push(update);
    
    // Notify callbacks
    for (const callback of this.updateCallbacks) {
      try {
        callback(update);
      } catch (error) {
        this.logger.error('Progress callback error', error);
      }
    }

    // Emit event
    this.eventBus.emit('meta-orchestrator-progress', update);
  }

  private setupEventListeners(): void {
    // Listen for swarm-level progress updates
    this.eventBus.on('swarm-progress', (data) => {
      if (this.currentIteration !== undefined && data.phase) {
        this.updatePhase(data.phase, data.progress || 0, data.message);
      }
    });

    this.eventBus.on('swarm-error', (data) => {
      if (this.currentIteration !== undefined && data.phase) {
        this.failPhase(data.phase, data.error);
      }
    });
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return '✅';
      case 'active': return '🔄';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '•';
    }
  }
}