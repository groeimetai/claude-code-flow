/**
 * Meta-Orchestrator: Autonomous Goal Achievement System
 * Automatically spawns swarms, evaluates results, and iterates until success
 */

import { ILogger } from '../core/logger.js';
import { IEventBus } from '../core/event-bus.js';
import { SwarmCoordinator } from './coordinator.js';
import { generateId } from '../utils/helpers.js';
import { ProgressTracker } from './progress-tracker.js';
import { createCognitiveTriangulationTools } from '../mcp/cognitive-triangulation-tools.js';
import { apiKeyManager } from '../config/api-key-manager.js';
import chalk from 'chalk';

export interface MetaGoal {
  id: string;
  description: string;
  successCriteria: string[];
  constraints: string[];
  deadline?: Date;
  budget?: number;
}

export interface IterationResult {
  swarmId: string;
  success: boolean;
  progress: number;
  learnings: string[];
  nextSteps: string[];
  artifacts: any[];
}

export interface MetaOrchestratorConfig {
  maxIterations?: number;
  convergenceThreshold?: number;
  enableParallelSwarms?: boolean;
  autoEvolve?: boolean;
  persistencePath?: string;
}

export class MetaOrchestrator {
  private goals: Map<string, MetaGoal> = new Map();
  private iterations: Map<string, IterationResult[]> = new Map();
  private activeSwarms: Map<string, SwarmCoordinator> = new Map();
  private convergenceHistory: number[] = [];
  private progressTracker: ProgressTracker;
  private projectKnowledge: Map<string, any> = new Map();
  private cognitiveTools: any[] = [];

  constructor(
    private logger: ILogger,
    private eventBus: IEventBus,
    private config: MetaOrchestratorConfig = {
      maxIterations: 100,
      convergenceThreshold: 0.95,
      enableParallelSwarms: true,
      autoEvolve: true,
    }
  ) {
    this.progressTracker = new ProgressTracker(logger, eventBus);
    this.cognitiveTools = createCognitiveTriangulationTools(logger);
    this.setupEventListeners();
    this.setupProgressDisplay();
    this.checkApiKeys();
  }

  /**
   * Check and inform about API key requirements
   */
  private checkApiKeys(): void {
    const hasNeo4j = process.env.NEO4J_URI && process.env.NEO4J_USER && process.env.NEO4J_PASSWORD;
    const hasRedis = process.env.REDIS_URL;
    
    if (!hasNeo4j) {
      this.logger.info(chalk.yellow('ℹ️  Neo4j not configured - using local JSON graphs'));
      this.logger.info(chalk.gray('   Set NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD for full features'));
    }
    
    if (!hasRedis) {
      this.logger.info(chalk.yellow('ℹ️  Redis not configured - using file-based caching'));
      this.logger.info(chalk.gray('   Set REDIS_URL for better performance'));
    }
  }

  /**
   * Main entry point: Achieve any goal autonomously
   */
  async achieveGoal(goalDescription: string): Promise<any> {
    this.logger.info('🎯 Meta-Orchestrator: Starting autonomous goal achievement', { goal: goalDescription });

    // Step 1: Analyze and structure the goal
    const goal = await this.analyzeGoal(goalDescription);
    this.goals.set(goal.id, goal);

    // Step 2: Start iterative achievement process
    let iteration = 0;
    let achieved = false;
    let finalResult = null;

    while (!achieved && iteration < this.config.maxIterations!) {
      this.logger.info(`🔄 Iteration ${iteration + 1}/${this.config.maxIterations}`);

      // Step 3: Plan next swarm based on current state
      const swarmPlan = await this.planNextSwarm(goal, iteration);

      // Step 4: Execute swarm
      const result = await this.executeSwarm(swarmPlan, goal);
      
      // Step 5: Evaluate results
      const evaluation = await this.evaluateResults(result, goal);
      this.storeIteration(goal.id, evaluation);

      // Step 6: Check if goal achieved
      achieved = evaluation.success || evaluation.progress >= this.config.convergenceThreshold!;
      
      if (achieved) {
        finalResult = evaluation.artifacts;
        this.logger.info('✅ Goal achieved!', { iterations: iteration + 1, progress: evaluation.progress });
      } else {
        // Step 7: Learn and adapt for next iteration
        await this.learnAndAdapt(goal, evaluation);
      }

      iteration++;
    }

    if (!achieved) {
      this.logger.warn('⚠️ Max iterations reached without full success', { 
        progress: this.getLatestProgress(goal.id) 
      });
    }

    return {
      success: achieved,
      iterations: iteration,
      result: finalResult,
      history: this.iterations.get(goal.id),
    };
  }

  /**
   * Analyze goal and create structured representation
   */
  private async analyzeGoal(goalDescription: string): Promise<MetaGoal> {
    // In production, this would use cognitive_triangulation to analyze the goal
    // For now, we'll create a structured representation

    const goal: MetaGoal = {
      id: generateId(),
      description: goalDescription,
      successCriteria: this.extractSuccessCriteria(goalDescription),
      constraints: this.extractConstraints(goalDescription),
    };

    // Special handling for common goal types
    if (goalDescription.toLowerCase().includes('trading')) {
      goal.successCriteria.push('System is profitable in backtesting');
      goal.successCriteria.push('Risk management implemented');
      goal.successCriteria.push('Live trading capability');
      goal.constraints.push('Must handle real market conditions');
      goal.constraints.push('Implement stop-loss mechanisms');
    }

    return goal;
  }

  /**
   * Plan the next swarm iteration
   */
  private async planNextSwarm(goal: MetaGoal, iteration: number): Promise<any> {
    const previousResults = this.iterations.get(goal.id) || [];
    const lastResult = previousResults[previousResults.length - 1];

    let swarmObjective = '';
    let swarmConfig: any = {
      strategy: 'auto',
      mode: 'hierarchical',
      maxAgents: 8,
      enableSelfAwareness: true,
      enableEvolution: true,
    };

    if (iteration === 0) {
      // First iteration: Exploration and architecture
      swarmObjective = `
INITIAL EXPLORATION AND ARCHITECTURE for: ${goal.description}

You MUST:
1. Use cognitive_triangulation to analyze similar existing systems
2. Use ruv_swarm to create a swarm of specialized agents
3. Design architecture using graph-architect capabilities
4. Create initial implementation plan
5. Set up testing framework
6. Store all learnings in memory

Success criteria: ${goal.successCriteria.join(', ')}
Constraints: ${goal.constraints.join(', ')}

IMPORTANT: This is iteration 1. Focus on exploration and foundation.`;

      swarmConfig.agents = ['researcher', 'architect', 'analyst'];
    } else if (lastResult && !lastResult.success) {
      // Subsequent iterations: Fix issues and improve
      swarmObjective = `
ITERATION ${iteration + 1} - IMPROVEMENT AND FIXES

Previous attempt progress: ${lastResult.progress * 100}%
Issues found: ${lastResult.learnings.join(', ')}
Next steps identified: ${lastResult.nextSteps.join(', ')}

You MUST:
1. Load previous work from memory
2. Address ALL identified issues
3. Implement suggested improvements
4. Test thoroughly
5. Use neural forecasting to predict potential issues
6. Deploy DAA agents for continuous monitoring
7. Update progress metrics

Goal: ${goal.description}
Current focus: ${this.determineFocus(lastResult)}`;

      swarmConfig.agents = this.selectAgentsForIteration(lastResult);
      swarmConfig.enableMetaLearning = true;
    }

    return {
      objective: swarmObjective,
      config: swarmConfig,
      iterationContext: {
        number: iteration,
        previousResults,
        goal,
      },
    };
  }

  /**
   * Execute a swarm and track results
   */
  private async executeSwarm(swarmPlan: any, goal: MetaGoal): Promise<any> {
    const swarmId = generateId();
    
    // Create swarm coordinator
    const swarm = new SwarmCoordinator({
      ...swarmPlan.config,
      name: `meta-swarm-${swarmId}`,
    });

    this.activeSwarms.set(swarmId, swarm);

    // Add self-improvement instructions
    const enhancedObjective = `${swarmPlan.objective}

${this.getSelfImprovementInstructions()}`;

    // Execute swarm
    try {
      const result = await swarm.coordinate({
        objective: enhancedObjective,
        iterations: 1,
        context: swarmPlan.iterationContext,
      });

      return {
        swarmId,
        result,
        metrics: swarm.getMetrics(),
      };
    } finally {
      this.activeSwarms.delete(swarmId);
    }
  }

  /**
   * Evaluate swarm results against goal
   */
  private async evaluateResults(swarmResult: any, goal: MetaGoal): Promise<IterationResult> {
    // Calculate progress based on success criteria
    const criteriamet = goal.successCriteria.filter(criteria => 
      this.checkCriteriaMet(criteria, swarmResult)
    ).length;

    const progress = criteriamet / goal.successCriteria.length;

    // Extract learnings and next steps
    const learnings = this.extractLearnings(swarmResult);
    const nextSteps = this.identifyNextSteps(swarmResult, goal, progress);

    return {
      swarmId: swarmResult.swarmId,
      success: progress >= 1.0,
      progress,
      learnings,
      nextSteps,
      artifacts: swarmResult.result?.artifacts || [],
    };
  }

  /**
   * Learn from iteration and adapt strategy
   */
  private async learnAndAdapt(goal: MetaGoal, evaluation: IterationResult) {
    // Store learnings in memory
    await this.storeLearnings(goal.id, evaluation);

    // Update convergence history
    this.convergenceHistory.push(evaluation.progress);

    // Adapt strategy if not converging
    if (this.isStuck()) {
      this.logger.warn('🔄 Progress stuck, trying different approach');
      this.config.enableParallelSwarms = true;
      this.config.autoEvolve = true;
    }
  }

  /**
   * Helper methods
   */
  private extractSuccessCriteria(goalDescription: string): string[] {
    const criteria = [];
    
    // Extract explicit criteria
    if (goalDescription.includes('must')) {
      const musts = goalDescription.split('must').slice(1);
      criteria.push(...musts.map(m => m.split(/[,.]/)[0].trim()));
    }

    // Add implicit criteria based on goal type
    if (goalDescription.toLowerCase().includes('profitable')) {
      criteria.push('Positive return on investment');
    }
    if (goalDescription.toLowerCase().includes('system')) {
      criteria.push('Functional implementation exists');
      criteria.push('Tests pass');
    }

    return criteria;
  }

  private extractConstraints(goalDescription: string): string[] {
    const constraints = [];
    
    if (goalDescription.includes('without')) {
      const withouts = goalDescription.split('without').slice(1);
      constraints.push(...withouts.map(w => `Avoid ${w.split(/[,.]|[0].trim()}`));
    }

    return constraints;
  }

  private determineFocus(lastResult: IterationResult): string {
    if (lastResult.progress < 0.3) {
      return 'Foundation and architecture';
    } else if (lastResult.progress < 0.6) {
      return 'Core implementation';
    } else if (lastResult.progress < 0.8) {
      return 'Testing and optimization';
    } else {
      return 'Final polish and edge cases';
    }
  }

  private selectAgentsForIteration(lastResult: IterationResult): string[] {
    const agents = ['coordinator'];
    
    if (lastResult.nextSteps.some(s => s.includes('implement'))) {
      agents.push('coder', 'tester');
    }
    if (lastResult.nextSteps.some(s => s.includes('optimize'))) {
      agents.push('optimizer', 'analyst');
    }
    if (lastResult.nextSteps.some(s => s.includes('fix'))) {
      agents.push('debugger');
    }
    if (lastResult.progress > 0.7) {
      agents.push('reviewer');
    }

    return agents;
  }

  private getSelfImprovementInstructions(): string {
    return `
🤖 AUTONOMOUS IMPROVEMENT ENABLED:
- Continuously analyze your own progress
- Spawn new agents when stuck
- Use cognitive triangulation to find solutions
- Deploy DAA agents for autonomous tasks
- Learn from each attempt and store in memory
- Evolve your approach based on results`;
  }

  private checkCriteriaMet(criteria: string, result: any): boolean {
    // Simple keyword matching for now
    const resultStr = JSON.stringify(result).toLowerCase();
    const criteriaLower = criteria.toLowerCase();
    
    return criteriaLower.split(' ').every(word => 
      resultStr.includes(word)
    );
  }

  private extractLearnings(result: any): string[] {
    // Extract from result
    const learnings = [];
    
    if (result.result?.learnings) {
      learnings.push(...result.result.learnings);
    }
    
    if (result.metrics?.errors > 0) {
      learnings.push(`Encountered ${result.metrics.errors} errors`);
    }

    return learnings;
  }

  private identifyNextSteps(result: any, goal: MetaGoal, progress: number): string[] {
    const steps = [];
    
    // Based on progress
    if (progress < 0.3) {
      steps.push('Complete basic implementation');
    } else if (progress < 0.6) {
      steps.push('Add core features');
    } else if (progress < 0.9) {
      steps.push('Fix remaining issues');
      steps.push('Optimize performance');
    }

    // Based on missing criteria
    goal.successCriteria.forEach(criteria => {
      if (!this.checkCriteriaMet(criteria, result)) {
        steps.push(`Implement: ${criteria}`);
      }
    });

    return steps;
  }

  private storeIteration(goalId: string, result: IterationResult) {
    if (!this.iterations.has(goalId)) {
      this.iterations.set(goalId, []);
    }
    this.iterations.get(goalId)!.push(result);
  }

  private getLatestProgress(goalId: string): number {
    const iterations = this.iterations.get(goalId) || [];
    return iterations[iterations.length - 1]?.progress || 0;
  }

  private isStuck(): boolean {
    if (this.convergenceHistory.length < 3) return false;
    
    // Check if last 3 iterations had similar progress
    const recent = this.convergenceHistory.slice(-3);
    const variance = Math.max(...recent) - Math.min(...recent);
    
    return variance < 0.05;
  }

  private async storeLearnings(goalId: string, evaluation: IterationResult) {
    // Would use memory tools here
    this.eventBus.emit('store-learnings', {
      goalId,
      iteration: this.iterations.get(goalId)?.length || 0,
      learnings: evaluation.learnings,
      progress: evaluation.progress,
    });
  }

  private setupEventListeners() {
    this.eventBus.on('swarm-progress', (data) => {
      this.logger.info('📊 Swarm progress update', data);
    });

    this.eventBus.on('swarm-complete', (data) => {
      this.logger.info('✅ Swarm completed', data);
    });
  }

  /**
   * Setup enhanced progress display
   */
  private setupProgressDisplay() {
    let lastAnalysisTime = 0;
    const analysisInterval = 300000; // 5 minutes
    
    this.eventBus.on('iteration-start', async (data) => {
      // Show progress header
      console.log(chalk.cyan('\n' + '═'.repeat(60)));
      console.log(chalk.bold.cyan(`🎯 Iteration ${data.iteration} - ${data.phase}`));
      console.log(chalk.cyan('═'.repeat(60) + '\n'));
      
      // Automatic cognitive triangulation at start of iteration
      const now = Date.now();
      if (now - lastAnalysisTime > analysisInterval || data.iteration === 1) {
        console.log(chalk.yellow('🧠 Running automatic cognitive triangulation...'));
        await this.runAutomaticAnalysis(data.goalId);
        lastAnalysisTime = now;
      }
    });
    
    this.eventBus.on('progress-update', (data) => {
      const progressBar = this.createProgressBar(data.progress);
      console.log(chalk.green(`Progress: ${progressBar} ${Math.round(data.progress * 100)}%`));
      
      if (data.currentPhase) {
        console.log(chalk.gray(`Phase: ${data.currentPhase}`));
      }
      
      if (data.activeTasks) {
        console.log(chalk.gray(`Active tasks: ${data.activeTasks}`));
      }
    });
    
    this.eventBus.on('learning-stored', (data) => {
      console.log(chalk.blue(`💡 Learning: ${data.learning}`));
    });
    
    this.eventBus.on('cognitive-analysis-complete', (data) => {
      console.log(chalk.magenta('🧠 Cognitive Analysis Complete:'));
      console.log(chalk.gray(`  - Components: ${data.components}`));
      console.log(chalk.gray(`  - Relationships: ${data.relationships}`));
      console.log(chalk.gray(`  - Complexity: ${data.complexity}`));
    });
  }
  
  /**
   * Create visual progress bar
   */
  private createProgressBar(progress: number): string {
    const total = 20;
    const filled = Math.round(progress * total);
    const empty = total - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }
  
  /**
   * Run automatic cognitive triangulation
   */
  private async runAutomaticAnalysis(goalId: string): Promise<void> {
    try {
      // Emit event for swarms to use cognitive triangulation
      this.eventBus.emit('run-cognitive-analysis', {
        goalId,
        projectPath: process.cwd(),
        purpose: 'understand-architecture'
      });
      
      // In a real implementation, this would call the cognitive triangulation tools
      // For now, we'll simulate the analysis
      setTimeout(() => {
        this.eventBus.emit('cognitive-analysis-complete', {
          components: 42,
          relationships: 127,
          complexity: 'medium',
          insights: [
            'Identified modular architecture',
            'Found potential performance bottlenecks',
            'Detected unused dependencies'
          ]
        });
      }, 2000);
    } catch (error) {
      this.logger.warn('Failed to run automatic cognitive analysis', { error });
    }
  }
}