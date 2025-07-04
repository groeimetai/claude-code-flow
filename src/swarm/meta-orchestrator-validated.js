/**
 * Enhanced Meta-Orchestrator with Real Goal Validation
 * Uses actual validation instead of arbitrary progress calculations
 */

import { MetaOrchestrator } from './meta-orchestrator.js';
import { GoalValidationSystem } from './goal-validator.js';
import { ProgressCalculator } from './progress-calculator.js';
import { AdaptiveGoalPlanner } from './adaptive-planner.js';
import { logger } from '../core/logger.js';
import chalk from 'chalk';
import path from 'node:path';

export class ValidatedMetaOrchestrator extends MetaOrchestrator {
  constructor(logger, eventBus, config = {}) {
    super(logger, eventBus, {
      ...config,
      convergenceThreshold: 0.90 // 90% validation required
    });
    
    this.validator = new GoalValidationSystem();
    this.progressCalculator = new ProgressCalculator();
    this.adaptivePlanner = new AdaptiveGoalPlanner();
    this.validationHistory = new Map();
    this.projectPath = process.cwd();
  }

  /**
   * Override analyzeGoal to use real criteria parsing
   */
  async analyzeGoal(goalDescription) {
    this.logger.info('🔍 Analyzing goal with validation system...');
    
    // Get base goal structure
    const baseGoal = await super.analyzeGoal(goalDescription);
    
    // Parse into concrete criteria
    const criteria = await this.validator.parseGoal(goalDescription);
    
    // Count total validation points
    let totalCriteria = 0;
    for (const category of Object.values(criteria)) {
      totalCriteria += category.length;
    }
    
    this.logger.info(`📋 Identified ${totalCriteria} concrete success criteria across ${Object.keys(criteria).length} categories`);
    
    // Enhanced goal with validation criteria
    return {
      ...baseGoal,
      validationCriteria: criteria,
      totalValidationPoints: totalCriteria,
      requiredCategories: this.getRequiredCategories(goalDescription)
    };
  }

  /**
   * Override planNextSwarm to use adaptive planning
   */
  async planNextSwarm(goal, iteration) {
    this.logger.info('📊 Planning next iteration with adaptive planner...');
    
    // Get previous results
    const previousResults = this.getIterationHistory(goal.id);
    
    // Use adaptive planner
    const adaptivePlan = await this.adaptivePlanner.planNextIteration(
      goal,
      this.projectPath,
      previousResults
    );
    
    // Log the plan
    this.logger.info(`🎯 Adaptive plan confidence: ${adaptivePlan.confidence}%`);
    this.logger.info(`⏱️  Estimated time: ${adaptivePlan.estimatedTime.formatted}`);
    
    // Convert to swarm plan format
    return {
      objective: adaptivePlan.objective,
      config: {
        strategy: adaptivePlan.strategy.type,
        mode: adaptivePlan.strategy.mode,
        maxAgents: adaptivePlan.strategy.maxAgents || 8,
        parallel: adaptivePlan.strategy.parallel,
        enableSelfAwareness: true,
        enableEvolution: true,
        // Add specific agents based on adaptive plan
        agents: adaptivePlan.swarms.map(s => s.type)
      },
      iterationContext: {
        number: iteration,
        previousResults,
        goal,
        adaptivePlan,
        checkpoints: adaptivePlan.checkpoints,
        fallbacks: adaptivePlan.fallbackPlans
      }
    };
  }

  /**
   * Override evaluateResults to use real validation
   */
  async evaluateResults(swarmResult, goal) {
    this.logger.info('✅ Evaluating results with real validation...');
    
    // Run actual validation
    const validationResults = await this.validator.validateGoal(
      this.projectPath,
      goal.validationCriteria
    );
    
    // Calculate real progress
    const progressData = await this.progressCalculator.calculateProgress(
      this.projectPath,
      goal,
      this.getLastProgress(goal.id)
    );
    
    // Generate validation report
    const validationReport = this.validator.generateReport(validationResults);
    this.logger.info('\n' + validationReport);
    
    // Store validation history
    this.validationHistory.set(goal.id, {
      iteration: this.getIterationCount(goal.id),
      validation: validationResults,
      progress: progressData,
      timestamp: new Date()
    });
    
    // Extract learnings from validation
    const learnings = this.extractValidationLearnings(validationResults, progressData);
    
    // Get next steps from adaptive planner
    const nextSteps = progressData.nextSteps.map(step => step.action);
    
    return {
      swarmId: swarmResult.swarmId,
      success: progressData.isComplete,
      progress: progressData.overallProgress / 100, // Convert to 0-1 scale
      learnings,
      nextSteps,
      artifacts: swarmResult.result?.artifacts || [],
      validationDetails: validationResults,
      progressDetails: progressData
    };
  }

  /**
   * Override progress checking to use real metrics
   */
  checkCriteriaMet(criteria, result) {
    // This is now handled by the validation system
    // We don't do simple keyword matching anymore
    if (result.validationDetails) {
      const validationItem = result.validationDetails.details.find(
        d => d.description.toLowerCase().includes(criteria.toLowerCase())
      );
      return validationItem ? validationItem.success : false;
    }
    
    // Fallback to original implementation
    return super.checkCriteriaMet(criteria, result);
  }

  /**
   * Override progress display to show real metrics
   */
  setupProgressDisplay() {
    super.setupProgressDisplay();
    
    // Add validation-specific displays
    this.eventBus.on('validation-update', (data) => {
      console.log(chalk.blue('\n📊 Validation Update:'));
      console.log(chalk.gray(`  Categories validated: ${data.categoriesChecked}`));
      console.log(chalk.green(`  ✅ Passed: ${data.passed}`));
      console.log(chalk.red(`  ❌ Failed: ${data.failed}`));
      
      if (data.criticalFailures && data.criticalFailures.length > 0) {
        console.log(chalk.red('\n  ⚠️  Critical failures:'));
        data.criticalFailures.forEach(failure => {
          console.log(chalk.red(`    - ${failure}`));
        });
      }
    });
    
    this.eventBus.on('progress-metrics', (data) => {
      console.log(chalk.cyan('\n📈 Progress Metrics:'));
      console.log(chalk.gray(`  Code Quality: ${data.code?.percentage?.toFixed(1) || 0}%`));
      console.log(chalk.gray(`  Test Coverage: ${data.tests?.percentage?.toFixed(1) || 0}%`));
      console.log(chalk.gray(`  Documentation: ${data.documentation?.percentage?.toFixed(1) || 0}%`));
      console.log(chalk.gray(`  Performance: ${data.performance?.percentage?.toFixed(1) || 0}%`));
      console.log(chalk.gray(`  Deployment Ready: ${data.deployment?.percentage?.toFixed(1) || 0}%`));
    });
    
    this.eventBus.on('bottleneck-detected', (data) => {
      console.log(chalk.yellow(`\n⚠️  Bottleneck detected: ${data.area}`));
      console.log(chalk.yellow(`   ${data.issue}`));
      console.log(chalk.gray(`   Impact: ${data.impact}`));
    });
  }

  /**
   * New method: Monitor checkpoints during execution
   */
  async monitorCheckpoints(swarmId, checkpoints) {
    if (!checkpoints || checkpoints.length === 0) return;
    
    const checkInterval = setInterval(async () => {
      const swarm = this.activeSwarms.get(swarmId);
      if (!swarm) {
        clearInterval(checkInterval);
        return;
      }
      
      // Check progress against checkpoints
      const currentProgress = await this.progressCalculator.calculateProgress(
        this.projectPath,
        this.goals.get(Array.from(this.goals.keys())[0])
      );
      
      for (const checkpoint of checkpoints) {
        if (!checkpoint.reached && this.isCheckpointReached(checkpoint, currentProgress)) {
          checkpoint.reached = true;
          this.logger.info(`✅ Checkpoint reached: ${checkpoint.milestone}`);
          this.eventBus.emit('checkpoint-reached', checkpoint);
          
          // Run checkpoint validation
          if (checkpoint.validation) {
            this.logger.info(`🔍 Running checkpoint validation: ${checkpoint.validation}`);
            // Trigger validation
          }
        }
      }
    }, 30000); // Check every 30 seconds
    
    // Store interval for cleanup
    this.checkpointMonitors = this.checkpointMonitors || new Map();
    this.checkpointMonitors.set(swarmId, checkInterval);
  }

  /**
   * Override executeSwarm to add checkpoint monitoring
   */
  async executeSwarm(swarmPlan, goal) {
    const result = await super.executeSwarm(swarmPlan, goal);
    
    // Start checkpoint monitoring if available
    if (swarmPlan.iterationContext && swarmPlan.iterationContext.checkpoints) {
      this.monitorCheckpoints(result.swarmId, swarmPlan.iterationContext.checkpoints);
    }
    
    // Clean up checkpoint monitor
    if (this.checkpointMonitors && this.checkpointMonitors.has(result.swarmId)) {
      clearInterval(this.checkpointMonitors.get(result.swarmId));
      this.checkpointMonitors.delete(result.swarmId);
    }
    
    return result;
  }

  /**
   * New method: Apply fallback plans when needed
   */
  async applyFallbackPlan(goal, currentProgress, fallbackPlan) {
    this.logger.warn(`🔄 Applying fallback plan: ${fallbackPlan.plan}`);
    
    // Create fallback swarm
    const fallbackSwarmPlan = {
      objective: `FALLBACK PLAN: ${fallbackPlan.plan}\n\nTrigger: ${fallbackPlan.trigger}\n\nOriginal goal: ${goal.description}`,
      config: fallbackPlan.swarmConfig,
      iterationContext: {
        isFallback: true,
        trigger: fallbackPlan.trigger,
        currentProgress
      }
    };
    
    return this.executeSwarm(fallbackSwarmPlan, goal);
  }

  /**
   * Helper methods
   */
  getRequiredCategories(goalDescription) {
    const required = ['validation']; // Always required
    const desc = goalDescription.toLowerCase();
    
    if (desc.includes('test')) required.push('tests');
    if (desc.includes('document')) required.push('documentation');
    if (desc.includes('secure')) required.push('security');
    if (desc.includes('deploy')) required.push('deployment');
    if (desc.includes('fast') || desc.includes('performan')) required.push('performance');
    
    return required;
  }

  extractValidationLearnings(validationResults, progressData) {
    const learnings = [];
    
    // Learn from validation failures
    for (const detail of validationResults.details) {
      if (!detail.success) {
        learnings.push(`Failed: ${detail.description} - ${detail.message}`);
      }
    }
    
    // Learn from bottlenecks
    if (progressData.bottlenecks) {
      for (const bottleneck of progressData.bottlenecks) {
        learnings.push(`Bottleneck in ${bottleneck.area}: ${bottleneck.issue}`);
      }
    }
    
    // Learn from low-scoring categories
    for (const [category, data] of Object.entries(progressData.metrics)) {
      if (data && data.percentage < 50) {
        learnings.push(`Low ${category} score: ${data.percentage.toFixed(1)}%`);
      }
    }
    
    return learnings;
  }

  getIterationHistory(goalId) {
    const iterations = this.iterations.get(goalId) || [];
    const validations = this.validationHistory.get(goalId);
    
    return {
      iterations,
      lastValidation: validations,
      history: iterations.map((iter, idx) => ({
        ...iter,
        progressBefore: idx > 0 ? iterations[idx - 1].progress * 100 : 0,
        progressAfter: iter.progress * 100,
        swarms: iter.swarms || [],
        timeSpent: iter.duration || 0
      }))
    };
  }

  getLastProgress(goalId) {
    const history = this.validationHistory.get(goalId);
    return history ? history.progress : null;
  }

  getIterationCount(goalId) {
    const iterations = this.iterations.get(goalId) || [];
    return iterations.length;
  }

  isCheckpointReached(checkpoint, currentProgress) {
    // Simple implementation - can be enhanced
    const completedTasks = currentProgress.metrics.validation.passed || 0;
    return completedTasks >= checkpoint.target;
  }

  /**
   * Override final report to include validation details
   */
  async generateFinalReport(goal, achieved, finalResult) {
    const validationHistory = this.validationHistory.get(goal.id);
    const iterations = this.iterations.get(goal.id) || [];
    
    const report = [
      '🎯 Goal Achievement Report',
      '=========================',
      '',
      `Goal: ${goal.description}`,
      `Status: ${achieved ? '✅ ACHIEVED' : '❌ NOT ACHIEVED'}`,
      `Iterations: ${iterations.length}`,
      '',
      '📊 Final Validation Results:',
      '---------------------------'
    ];
    
    if (validationHistory && validationHistory.validation) {
      const val = validationHistory.validation;
      report.push(`Overall: ${val.overall.percentage.toFixed(1)}% (${val.overall.passed}/${val.overall.total})`);
      
      for (const [category, stats] of Object.entries(val.categories)) {
        if (stats.total > 0) {
          const pct = (stats.passed / stats.total) * 100;
          report.push(`${category}: ${pct.toFixed(1)}% (${stats.passed}/${stats.total})`);
        }
      }
    }
    
    if (validationHistory && validationHistory.progress) {
      const prog = validationHistory.progress;
      report.push('', '📈 Progress Metrics:', '-------------------');
      
      for (const [metric, data] of Object.entries(prog.metrics)) {
        if (data && data.percentage !== undefined) {
          report.push(`${metric}: ${data.percentage.toFixed(1)}%`);
        }
      }
      
      if (prog.bottlenecks && prog.bottlenecks.length > 0) {
        report.push('', '⚠️ Remaining Bottlenecks:', '------------------------');
        for (const bottleneck of prog.bottlenecks) {
          report.push(`- ${bottleneck.area}: ${bottleneck.issue}`);
        }
      }
    }
    
    report.push('', '📝 Summary:', '-----------');
    if (achieved) {
      report.push('All validation criteria have been met!');
      report.push('The goal has been successfully achieved.');
    } else {
      report.push('Some validation criteria were not met.');
      report.push('Consider running additional iterations or adjusting the goal.');
    }
    
    return report.join('\n');
  }
}

/**
 * Factory function to create validated orchestrator
 */
export function createValidatedMetaOrchestrator(logger, eventBus, config) {
  return new ValidatedMetaOrchestrator(logger, eventBus, config);
}