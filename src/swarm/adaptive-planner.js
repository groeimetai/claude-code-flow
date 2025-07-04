/**
 * Adaptive Goal Planner
 * Dynamically adjusts objectives based on validation results and learns from patterns
 */

import { GoalValidationSystem } from './goal-validator.js';
import { ProgressCalculator } from './progress-calculator.js';
import { Logger } from '../core/logger.js';
const logger = new Logger({ component: 'AdaptiveGoalPlanner' });
import fs from 'node:fs/promises';
import path from 'node:path';

export class AdaptiveGoalPlanner {
  constructor() {
    this.validator = new GoalValidationSystem();
    this.progressCalculator = new ProgressCalculator();
    this.learningHistory = new Map();
    this.successPatterns = new Map();
    this.failurePatterns = new Map();
    this.planCache = new Map();
  }

  /**
   * Plan next iteration based on validation results
   */
  async planNextIteration(goal, projectPath, previousResults = null) {
    // Get current progress
    const currentProgress = await this.progressCalculator.calculateProgress(projectPath, goal, previousResults);
    
    // Analyze what's missing
    const missingComponents = await this.analyzeMissingComponents(currentProgress, goal);
    
    // Learn from previous attempts
    const patterns = this.analyzePatterns(goal, previousResults);
    
    // Generate adaptive plan
    const plan = {
      iteration: (previousResults?.iteration || 0) + 1,
      objective: this.generateObjective(goal, currentProgress, missingComponents),
      swarms: this.selectSwarms(missingComponents, patterns),
      estimatedTime: this.estimateTime(missingComponents),
      confidence: this.calculateConfidence(currentProgress, patterns),
      strategy: this.selectStrategy(currentProgress, patterns),
      checkpoints: this.defineCheckpoints(missingComponents),
      fallbackPlans: this.generateFallbacks(missingComponents, patterns)
    };

    // Cache successful plans
    if (currentProgress.overallProgress > 70) {
      this.cachePlan(goal.description, plan);
    }

    return plan;
  }

  /**
   * Analyze what components are missing
   */
  async analyzeMissingComponents(progress, goal) {
    const missing = {
      critical: [],
      important: [],
      optional: [],
      byCategory: {}
    };

    // Get validation details
    if (progress.metrics.validation && progress.metrics.validation.missing) {
      const validationMissing = progress.metrics.validation.missing;
      missing.critical.push(...validationMissing.critical);
      missing.important.push(...validationMissing.important);
      missing.optional.push(...validationMissing.optional);
    }

    // Analyze each metric category
    for (const [category, data] of Object.entries(progress.metrics)) {
      if (data && typeof data.percentage === 'number') {
        missing.byCategory[category] = {
          percentage: data.percentage,
          gap: 100 - data.percentage,
          issues: this.identifyCategoryIssues(category, data)
        };
      }
    }

    // Priority mapping based on goal type
    const priorities = this.getPrioritiesForGoal(goal);
    
    // Reorder based on priorities
    missing.prioritized = this.prioritizeMissing(missing, priorities);

    return missing;
  }

  /**
   * Generate adaptive objective for next swarm
   */
  generateObjective(goal, progress, missing) {
    const lines = [`ADAPTIVE ITERATION ${progress.iteration || 1} - TARGETED IMPROVEMENTS`];
    
    // Current status
    lines.push(`\nCurrent Progress: ${progress.overallProgress.toFixed(1)}%`);
    
    if (progress.momentum && progress.momentum.trend) {
      lines.push(`Momentum: ${progress.momentum.trend} (${progress.momentum.change > 0 ? '+' : ''}${progress.momentum.change.toFixed(1)}%)`);
    }

    // Primary focus
    lines.push('\nPRIMARY FOCUS:');
    if (missing.critical.length > 0) {
      lines.push('⚠️ CRITICAL COMPONENTS MISSING - These MUST be implemented:');
      for (const item of missing.critical.slice(0, 3)) {
        lines.push(`  • ${item.component}: ${item.reason}`);
        if (item.hints && item.hints.length > 0) {
          lines.push(`    Hint: ${item.hints[0]}`);
        }
      }
    } else if (missing.important.length > 0) {
      lines.push('📋 Important improvements needed:');
      for (const item of missing.important.slice(0, 3)) {
        lines.push(`  • ${item.component}`);
      }
    } else {
      lines.push('✨ Polish and optimization phase');
    }

    // Specific tasks by category
    lines.push('\nSPECIFIC TASKS:');
    
    // Group tasks by swarm type
    const tasksBySwarm = this.groupTasksBySwarmType(missing);
    for (const [swarmType, tasks] of Object.entries(tasksBySwarm)) {
      if (tasks.length > 0) {
        lines.push(`\n${swarmType.toUpperCase()} TASKS:`);
        for (const task of tasks.slice(0, 5)) {
          lines.push(`- ${task}`);
        }
      }
    }

    // Success criteria for this iteration
    lines.push('\nSUCCESS CRITERIA FOR THIS ITERATION:');
    const targetProgress = Math.min(100, progress.overallProgress + 20);
    lines.push(`- Achieve ${targetProgress}% overall progress`);
    
    if (missing.critical.length > 0) {
      lines.push(`- Implement at least ${Math.ceil(missing.critical.length / 2)} critical components`);
    }
    
    if (progress.metrics.tests && progress.metrics.tests.metrics.failing > 0) {
      lines.push(`- Fix all ${progress.metrics.tests.metrics.failing} failing tests`);
    }

    // Memory instructions
    lines.push('\nIMPORTANT INSTRUCTIONS:');
    lines.push('1. Load previous work from memory before starting');
    lines.push('2. Store all decisions and implementations in memory');
    lines.push('3. Use cognitive triangulation to analyze existing patterns');
    lines.push('4. Deploy DAA agents for autonomous subtasks');
    lines.push('5. Validate progress using the goal validation system');

    // Original goal reminder
    lines.push(`\nORIGINAL GOAL: ${goal.description}`);

    return lines.join('\n');
  }

  /**
   * Select appropriate swarms based on missing components
   */
  selectSwarms(missing, patterns) {
    const swarms = [];
    const swarmTypes = new Set();

    // Map missing components to swarm types
    const componentToSwarm = {
      'profit calculation': 'coder',
      'backtesting': 'analyst',
      'risk management': 'security-review',
      'api endpoints': 'coder',
      'authentication': 'security-review',
      'tests': 'tester',
      'documentation': 'documenter',
      'performance': 'optimizer',
      'deployment': 'devops'
    };

    // Check critical components first
    for (const item of missing.critical) {
      const swarmType = this.getSwarmTypeForComponent(item.component, componentToSwarm);
      if (swarmType && !swarmTypes.has(swarmType)) {
        swarms.push({
          type: swarmType,
          priority: 'critical',
          focus: item.component,
          estimatedTime: '30-60min'
        });
        swarmTypes.add(swarmType);
      }
    }

    // Add swarms based on category gaps
    for (const [category, data] of Object.entries(missing.byCategory)) {
      if (data.gap > 30) {
        const swarmType = this.getCategorySwarm(category);
        if (swarmType && !swarmTypes.has(swarmType)) {
          swarms.push({
            type: swarmType,
            priority: data.gap > 50 ? 'high' : 'medium',
            focus: `Improve ${category} (current: ${data.percentage.toFixed(1)}%)`,
            estimatedTime: '20-40min'
          });
          swarmTypes.add(swarmType);
        }
      }
    }

    // Add coordinator swarm if multiple swarms needed
    if (swarms.length > 2) {
      swarms.unshift({
        type: 'coordinator',
        priority: 'critical',
        focus: 'Orchestrate parallel improvements',
        estimatedTime: '45-90min'
      });
    }

    // Learn from successful patterns
    if (patterns.successful.length > 0) {
      const successfulSwarmTypes = patterns.successful
        .flatMap(p => p.swarms)
        .filter(s => !swarmTypes.has(s));
      
      for (const swarmType of successfulSwarmTypes.slice(0, 2)) {
        swarms.push({
          type: swarmType,
          priority: 'low',
          focus: 'Apply successful patterns',
          estimatedTime: '15-30min'
        });
      }
    }

    return swarms;
  }

  /**
   * Select strategy based on current state
   */
  selectStrategy(progress, patterns) {
    // If very low progress, need exploration
    if (progress.overallProgress < 20) {
      return {
        type: 'exploration',
        mode: 'distributed',
        description: 'Broad exploration to understand requirements',
        parallel: true,
        maxAgents: 8
      };
    }

    // If stuck (low momentum), try different approach
    if (progress.momentum && progress.momentum.trend === 'declining') {
      return {
        type: 'pivot',
        mode: 'hierarchical',
        description: 'Change approach due to lack of progress',
        parallel: false,
        maxAgents: 5
      };
    }

    // If making good progress, continue focused
    if (progress.overallProgress > 60) {
      return {
        type: 'refinement',
        mode: 'centralized',
        description: 'Focused improvements on remaining issues',
        parallel: true,
        maxAgents: 4
      };
    }

    // Default: balanced approach
    return {
      type: 'balanced',
      mode: 'mesh',
      description: 'Balanced approach with multiple perspectives',
      parallel: true,
      maxAgents: 6
    };
  }

  /**
   * Define checkpoints for progress monitoring
   */
  defineCheckpoints(missing) {
    const checkpoints = [];
    const totalItems = missing.critical.length + missing.important.length;
    
    // Early checkpoint (25% of tasks)
    checkpoints.push({
      milestone: 'early-progress',
      target: Math.ceil(totalItems * 0.25),
      description: 'Initial implementation started',
      validation: 'Run basic validation checks',
      failureAction: 'Reassess approach and get help'
    });

    // Mid checkpoint (50% of tasks)
    checkpoints.push({
      milestone: 'halfway',
      target: Math.ceil(totalItems * 0.5),
      description: 'Core functionality implemented',
      validation: 'Run comprehensive tests',
      failureAction: 'Focus on critical items only'
    });

    // Late checkpoint (75% of tasks)
    checkpoints.push({
      milestone: 'nearly-complete',
      target: Math.ceil(totalItems * 0.75),
      description: 'Most features working',
      validation: 'Full integration testing',
      failureAction: 'Prioritize remaining critical items'
    });

    // Final checkpoint
    checkpoints.push({
      milestone: 'complete',
      target: totalItems,
      description: 'All planned improvements done',
      validation: 'Complete goal validation',
      failureAction: 'Document remaining issues for next iteration'
    });

    return checkpoints;
  }

  /**
   * Generate fallback plans
   */
  generateFallbacks(missing, patterns) {
    const fallbacks = [];

    // Fallback for critical components
    if (missing.critical.length > 0) {
      fallbacks.push({
        trigger: 'Critical components still missing after 30 minutes',
        plan: 'Spawn specialized coder swarm focused only on critical features',
        swarmConfig: {
          type: 'development',
          mode: 'centralized',
          agents: ['coder', 'architect', 'tester'],
          focus: 'critical-only'
        }
      });
    }

    // Fallback for test failures
    if (missing.byCategory.tests && missing.byCategory.tests.gap > 30) {
      fallbacks.push({
        trigger: 'Tests still failing after implementation',
        plan: 'Deploy debugging swarm with root cause analysis',
        swarmConfig: {
          type: 'debugging',
          mode: 'hierarchical',
          agents: ['debugger', 'tester', 'analyst'],
          focus: 'test-fixes'
        }
      });
    }

    // Fallback for performance issues
    if (missing.byCategory.performance && missing.byCategory.performance.gap > 40) {
      fallbacks.push({
        trigger: 'Performance targets not met',
        plan: 'Run optimization swarm with profiling',
        swarmConfig: {
          type: 'optimization',
          mode: 'mesh',
          agents: ['optimizer', 'analyst', 'architect'],
          focus: 'performance'
        }
      });
    }

    // General fallback
    fallbacks.push({
      trigger: 'Overall progress increase less than 10%',
      plan: 'Pivot to different approach using successful patterns',
      swarmConfig: {
        type: 'research',
        mode: 'distributed',
        agents: ['researcher', 'architect', 'analyst'],
        focus: 'alternative-solutions'
      }
    });

    return fallbacks;
  }

  /**
   * Analyze patterns from previous attempts
   */
  analyzePatterns(goal, previousResults) {
    const patterns = {
      successful: [],
      failed: [],
      insights: []
    };

    if (!previousResults || !previousResults.history) {
      return patterns;
    }

    // Analyze each previous iteration
    for (const iteration of previousResults.history) {
      const progressGain = iteration.progressAfter - iteration.progressBefore;
      
      if (progressGain > 10) {
        patterns.successful.push({
          swarms: iteration.swarms,
          gain: progressGain,
          approach: iteration.approach,
          timeSpent: iteration.timeSpent
        });
      } else if (progressGain < 5) {
        patterns.failed.push({
          swarms: iteration.swarms,
          issue: iteration.failureReason || 'Low progress',
          approach: iteration.approach
        });
      }
    }

    // Extract insights
    if (patterns.successful.length > 0) {
      const avgGain = patterns.successful.reduce((sum, p) => sum + p.gain, 0) / patterns.successful.length;
      patterns.insights.push(`Successful iterations average ${avgGain.toFixed(1)}% progress gain`);
      
      // Most successful swarm types
      const swarmCounts = {};
      patterns.successful.forEach(p => {
        p.swarms.forEach(s => {
          swarmCounts[s] = (swarmCounts[s] || 0) + 1;
        });
      });
      const topSwarm = Object.entries(swarmCounts).sort((a, b) => b[1] - a[1])[0];
      if (topSwarm) {
        patterns.insights.push(`Most successful swarm type: ${topSwarm[0]}`);
      }
    }

    // Store patterns for learning
    this.updateLearningHistory(goal.description, patterns);

    return patterns;
  }

  /**
   * Calculate confidence in the plan
   */
  calculateConfidence(progress, patterns) {
    let confidence = 50; // Base confidence

    // Adjust based on current progress
    if (progress.overallProgress > 70) confidence += 20;
    else if (progress.overallProgress > 50) confidence += 10;
    else if (progress.overallProgress < 20) confidence -= 10;

    // Adjust based on momentum
    if (progress.momentum) {
      if (progress.momentum.trend === 'improving') confidence += 15;
      else if (progress.momentum.trend === 'declining') confidence -= 15;
    }

    // Adjust based on patterns
    if (patterns.successful.length > patterns.failed.length) confidence += 10;
    else if (patterns.failed.length > patterns.successful.length * 2) confidence -= 20;

    // Adjust based on bottlenecks
    if (progress.bottlenecks) {
      const criticalBottlenecks = progress.bottlenecks.filter(b => b.severity === 'critical').length;
      confidence -= criticalBottlenecks * 10;
    }

    // Ensure within bounds
    return Math.max(10, Math.min(90, confidence));
  }

  /**
   * Estimate time for completing missing components
   */
  estimateTime(missing) {
    const timeEstimates = {
      critical: 45, // minutes per critical component
      important: 30,
      optional: 15
    };

    let totalMinutes = 0;
    totalMinutes += missing.critical.length * timeEstimates.critical;
    totalMinutes += missing.important.length * timeEstimates.important;
    totalMinutes += missing.optional.length * timeEstimates.optional;

    // Add overhead for coordination
    if (missing.critical.length + missing.important.length > 5) {
      totalMinutes += 30; // Coordination overhead
    }

    // Format as readable time
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return {
      totalMinutes,
      formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      confidence: this.getTimeConfidence(missing)
    };
  }

  /**
   * Helper methods
   */
  identifyCategoryIssues(category, data) {
    const issues = [];

    switch (category) {
      case 'tests':
        if (data.metrics) {
          if (data.metrics.failing > 0) issues.push(`${data.metrics.failing} tests failing`);
          if (data.metrics.coverage < 70) issues.push(`Low coverage: ${data.metrics.coverage}%`);
          if (data.metrics.testFiles === 0) issues.push('No test files found');
        }
        break;
        
      case 'code':
        if (data.metrics) {
          if (data.metrics.complexity > 20) issues.push('High complexity');
          if (data.metrics.techDebt > 0.2) issues.push('High technical debt');
          if (data.metrics.coverage < 50) issues.push('Poor test coverage');
        }
        break;
        
      case 'documentation':
        if (data.metrics) {
          if (!data.metrics.readme) issues.push('Missing README.md');
          if (!data.metrics.apiDocs) issues.push('Missing API documentation');
          if (data.metrics.codeDocs < 30) issues.push('Insufficient code comments');
        }
        break;
        
      case 'performance':
        if (data.metrics) {
          if (!data.metrics.hasPerformanceTests) issues.push('No performance tests');
          const optimizations = Object.values(data.metrics.optimization).filter(v => v).length;
          if (optimizations < 2) issues.push('Few optimizations implemented');
        }
        break;
        
      case 'deployment':
        if (data.metrics) {
          if (!data.metrics.dockerfile) issues.push('No Dockerfile');
          if (!data.metrics.cicd) issues.push('No CI/CD pipeline');
          if (!data.metrics.monitoring) issues.push('No monitoring setup');
        }
        break;
    }

    return issues;
  }

  getPrioritiesForGoal(goal) {
    const description = goal.description.toLowerCase();
    
    if (description.includes('trading') || description.includes('profitable')) {
      return {
        validation: 1,
        tests: 2,
        code: 3,
        performance: 4,
        documentation: 5,
        deployment: 6
      };
    }
    
    if (description.includes('api')) {
      return {
        validation: 1,
        documentation: 2,
        tests: 3,
        code: 4,
        deployment: 5,
        performance: 6
      };
    }
    
    // Default priorities
    return {
      validation: 1,
      code: 2,
      tests: 3,
      documentation: 4,
      performance: 5,
      deployment: 6
    };
  }

  prioritizeMissing(missing, priorities) {
    const prioritized = [];
    
    // Add all items with their priority scores
    for (const item of missing.critical) {
      prioritized.push({ ...item, score: 1000 }); // Critical always highest
    }
    
    for (const [category, data] of Object.entries(missing.byCategory)) {
      const priority = priorities[category] || 10;
      const gap = data.gap || 0;
      const score = (10 - priority) * 10 + gap;
      
      for (const issue of data.issues || []) {
        prioritized.push({
          component: issue,
          category,
          score,
          gap
        });
      }
    }
    
    // Sort by score
    return prioritized.sort((a, b) => b.score - a.score);
  }

  getSwarmTypeForComponent(component, mapping) {
    const componentLower = component.toLowerCase();
    
    for (const [key, swarmType] of Object.entries(mapping)) {
      if (componentLower.includes(key)) {
        return swarmType;
      }
    }
    
    // Default mappings
    if (componentLower.includes('implement')) return 'coder';
    if (componentLower.includes('test')) return 'tester';
    if (componentLower.includes('document')) return 'documenter';
    if (componentLower.includes('optimize')) return 'optimizer';
    if (componentLower.includes('secure')) return 'security-review';
    
    return 'analyst'; // Default
  }

  getCategorySwarm(category) {
    const categorySwarms = {
      'validation': 'coder',
      'code': 'coder',
      'tests': 'tester',
      'documentation': 'documenter',
      'performance': 'optimizer',
      'deployment': 'devops'
    };
    
    return categorySwarms[category] || 'analyst';
  }

  groupTasksBySwarmType(missing) {
    const tasksBySwarm = {
      coder: [],
      tester: [],
      documenter: [],
      optimizer: [],
      devops: [],
      analyst: []
    };

    // Group critical tasks
    for (const item of missing.critical) {
      const swarmType = this.getSwarmTypeForComponent(item.component, {});
      if (tasksBySwarm[swarmType]) {
        tasksBySwarm[swarmType].push(item.component);
      }
    }

    // Group by category
    for (const [category, data] of Object.entries(missing.byCategory)) {
      if (data.gap > 20) {
        const swarmType = this.getCategorySwarm(category);
        if (tasksBySwarm[swarmType] && data.issues) {
          tasksBySwarm[swarmType].push(...data.issues);
        }
      }
    }

    // Remove empty groups
    for (const [swarmType, tasks] of Object.entries(tasksBySwarm)) {
      if (tasks.length === 0) {
        delete tasksBySwarm[swarmType];
      }
    }

    return tasksBySwarm;
  }

  getTimeConfidence(missing) {
    const totalTasks = missing.critical.length + missing.important.length + missing.optional.length;
    
    if (totalTasks < 5) return 'high';
    if (totalTasks < 10) return 'medium';
    return 'low';
  }

  updateLearningHistory(goalType, patterns) {
    if (!this.learningHistory.has(goalType)) {
      this.learningHistory.set(goalType, {
        attempts: 0,
        successfulPatterns: [],
        failedPatterns: []
      });
    }
    
    const history = this.learningHistory.get(goalType);
    history.attempts++;
    
    if (patterns.successful.length > 0) {
      history.successfulPatterns.push(...patterns.successful);
    }
    
    if (patterns.failed.length > 0) {
      history.failedPatterns.push(...patterns.failed);
    }
    
    // Keep only recent patterns (last 10)
    history.successfulPatterns = history.successfulPatterns.slice(-10);
    history.failedPatterns = history.failedPatterns.slice(-10);
  }

  cachePlan(goalDescription, plan) {
    const key = this.getGoalKey(goalDescription);
    this.planCache.set(key, {
      plan,
      timestamp: Date.now(),
      success: true
    });
    
    // Keep cache size manageable
    if (this.planCache.size > 50) {
      const oldestKey = [...this.planCache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.planCache.delete(oldestKey);
    }
  }

  getGoalKey(goalDescription) {
    // Simple key generation based on goal type
    const lower = goalDescription.toLowerCase();
    if (lower.includes('trading')) return 'trading-system';
    if (lower.includes('api')) return 'rest-api';
    if (lower.includes('website')) return 'web-app';
    return 'general';
  }

  /**
   * Get a suggested plan from cache if available
   */
  getSuggestedPlan(goal) {
    const key = this.getGoalKey(goal.description);
    const cached = this.planCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < 86400000) { // 24 hours
      return cached.plan;
    }
    
    return null;
  }

  /**
   * Generate a report of the adaptive plan
   */
  generateReport(plan, progress) {
    const lines = [
      '🎯 Adaptive Goal Plan',
      '====================',
      '',
      `Iteration: ${plan.iteration}`,
      `Current Progress: ${progress.overallProgress.toFixed(1)}%`,
      `Confidence: ${plan.confidence}%`,
      `Estimated Time: ${plan.estimatedTime.formatted}`,
      '',
      'Strategy:',
      `---------`,
      `Type: ${plan.strategy.type}`,
      `Mode: ${plan.strategy.mode}`,
      `Description: ${plan.strategy.description}`,
      '',
      'Planned Swarms:',
      '---------------'
    ];

    for (const swarm of plan.swarms) {
      lines.push(`[${swarm.priority.toUpperCase()}] ${swarm.type}`);
      lines.push(`  Focus: ${swarm.focus}`);
      lines.push(`  Time: ${swarm.estimatedTime}`);
    }

    if (plan.checkpoints.length > 0) {
      lines.push('\nCheckpoints:');
      lines.push('------------');
      for (const checkpoint of plan.checkpoints) {
        lines.push(`• ${checkpoint.milestone}: ${checkpoint.description}`);
        lines.push(`  Target: ${checkpoint.target} tasks completed`);
      }
    }

    if (plan.fallbackPlans.length > 0) {
      lines.push('\nFallback Plans:');
      lines.push('---------------');
      for (const fallback of plan.fallbackPlans) {
        lines.push(`• Trigger: ${fallback.trigger}`);
        lines.push(`  Action: ${fallback.plan}`);
      }
    }

    return lines.join('\n');
  }
}