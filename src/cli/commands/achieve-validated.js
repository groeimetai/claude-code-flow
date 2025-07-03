/**
 * Enhanced Achieve Command with Real Goal Validation
 * Uses actual validation instead of arbitrary progress
 */

export async function handleAchieveValidatedCommand(goal, options) {
  console.log('\n🎯 Claude-Flow Validated Meta-Orchestrator: Real Goal Achievement\n');
  console.log('Goal:', goal);
  console.log('─'.repeat(60));
  
  // Import dependencies dynamically
  const { createValidatedMetaOrchestrator } = await import('../../swarm/meta-orchestrator-validated.js');
  const { Logger } = await import('../../core/logger.js');
  const { EventBus } = await import('../../core/event-bus.js');
  const ora = await import('ora');
  const chalk = await import('chalk');
  
  const spinner = ora.default('Initializing Validated Meta-Orchestrator...').start();
  
  try {
    // Initialize components
    const logger = new Logger({ 
      level: options.verbose ? 'debug' : 'info',
      format: 'pretty' 
    });
    const eventBus = new EventBus();
    
    // Create validated meta-orchestrator
    const orchestrator = createValidatedMetaOrchestrator(logger, eventBus, {
      maxIterations: parseInt(options.maxIterations || '10'),
      convergenceThreshold: parseFloat(options.convergence || '0.90'), // 90% validation required
      enableParallelSwarms: options.parallel,
      autoEvolve: options.evolve !== false,
    });
    
    // Set up enhanced progress monitoring
    let currentIteration = 0;
    let currentProgress = 0;
    let validationStats = { passed: 0, total: 0 };
    
    eventBus.on('iteration-start', (data) => {
      currentIteration = data.iteration;
      spinner.text = `Iteration ${currentIteration}: ${data.phase}`;
    });
    
    eventBus.on('progress-update', (data) => {
      currentProgress = data.progress;
      spinner.text = `Iteration ${currentIteration}: ${Math.round(currentProgress * 100)}% validated`;
    });
    
    eventBus.on('validation-update', (data) => {
      validationStats = { passed: data.passed, total: data.total };
      console.log(chalk.default.blue(`\n📊 Validation: ${data.passed}/${data.total} criteria passed`));
      if (data.criticalFailures && data.criticalFailures.length > 0) {
        console.log(chalk.default.red('⚠️  Critical failures:'));
        data.criticalFailures.forEach(f => console.log(chalk.default.red(`   - ${f}`)));
      }
      spinner.start();
    });
    
    eventBus.on('progress-metrics', (data) => {
      if (options.verbose) {
        console.log(chalk.default.cyan('\n📈 Real Metrics:'));
        console.log(chalk.default.gray(`  Code Quality: ${data.code?.percentage?.toFixed(1) || 0}%`));
        console.log(chalk.default.gray(`  Test Coverage: ${data.tests?.percentage?.toFixed(1) || 0}%`));
        console.log(chalk.default.gray(`  Documentation: ${data.documentation?.percentage?.toFixed(1) || 0}%`));
        spinner.start();
      }
    });
    
    eventBus.on('bottleneck-detected', (data) => {
      console.log(chalk.default.yellow(`\n⚠️  Bottleneck: ${data.area} - ${data.issue}`));
      spinner.start();
    });
    
    eventBus.on('checkpoint-reached', (data) => {
      console.log(chalk.default.green(`\n✅ Checkpoint: ${data.milestone}`));
      spinner.start();
    });
    
    eventBus.on('swarm-spawned', (data) => {
      console.log(chalk.default.green(`\n✨ Spawned ${data.type} swarm: ${data.objective?.split('\n')[0]}`));
      spinner.start();
    });
    
    eventBus.on('learning-stored', (data) => {
      if (options.verbose) {
        console.log(chalk.default.blue(`\n💡 Learning: ${data.learning}`));
      }
    });
    
    spinner.text = 'Analyzing goal and creating concrete validation criteria...';
    
    // Start autonomous achievement with validation
    const result = await orchestrator.achieveGoal(goal);
    
    spinner.stop();
    
    // Display comprehensive results
    console.log('\n' + '═'.repeat(60) + '\n');
    
    if (result.success) {
      console.log(chalk.default.bold.green('✅ GOAL ACHIEVED WITH VALIDATION!'));
      console.log(`Iterations required: ${result.iterations}`);
      console.log(`Validation: ${validationStats.passed}/${validationStats.total} criteria passed`);
      
      if (result.result && result.result.length > 0) {
        console.log(chalk.default.bold.cyan('\n📦 Deliverables:'));
        result.result.forEach((artifact, index) => {
          console.log(`  ${index + 1}. ${artifact.name || artifact.type || 'Artifact'}`);
        });
      }
    } else {
      console.log(chalk.default.bold.yellow('⚠️  PARTIAL SUCCESS'));
      console.log(`Iterations used: ${result.iterations}`);
      const lastIteration = result.history[result.history.length - 1];
      console.log(`Progress achieved: ${Math.round(lastIteration.progress * 100)}%`);
      console.log(`Validation: ${validationStats.passed}/${validationStats.total} criteria passed`);
    }
    
    // Show detailed validation results
    if (result.history && result.history.length > 0) {
      const lastResult = result.history[result.history.length - 1];
      if (lastResult.validationDetails) {
        console.log(chalk.default.bold.cyan('\n📋 Validation Details:'));
        
        for (const [category, stats] of Object.entries(lastResult.validationDetails.categories)) {
          if (stats.total > 0) {
            const pct = (stats.passed / stats.total) * 100;
            const color = pct >= 80 ? chalk.default.green : pct >= 50 ? chalk.default.yellow : chalk.default.red;
            console.log(color(`  ${category}: ${pct.toFixed(1)}% (${stats.passed}/${stats.total})`));
          }
        }
      }
      
      if (lastResult.progressDetails) {
        console.log(chalk.default.bold.cyan('\n📊 Progress Metrics:'));
        const metrics = lastResult.progressDetails.metrics;
        
        if (metrics.code) console.log(`  Code Quality: ${metrics.code.percentage.toFixed(1)}% - ${metrics.code.quality}`);
        if (metrics.tests) console.log(`  Test Coverage: ${metrics.tests.percentage.toFixed(1)}% - ${metrics.tests.quality}`);
        if (metrics.documentation) console.log(`  Documentation: ${metrics.documentation.percentage.toFixed(1)}% - ${metrics.documentation.completeness}`);
        if (metrics.performance) console.log(`  Performance: ${metrics.performance.percentage.toFixed(1)}%${metrics.performance.optimized ? ' (optimized)' : ''}`);
        if (metrics.deployment) console.log(`  Deployment Ready: ${metrics.deployment.percentage.toFixed(1)}%${metrics.deployment.ready ? ' ✅' : ' ❌'}`);
        
        if (lastResult.progressDetails.bottlenecks && lastResult.progressDetails.bottlenecks.length > 0) {
          console.log(chalk.default.bold.yellow('\n⚠️  Remaining Bottlenecks:'));
          lastResult.progressDetails.bottlenecks.forEach(b => {
            console.log(chalk.default.yellow(`  [${b.severity.toUpperCase()}] ${b.area}: ${b.issue}`));
          });
        }
        
        if (lastResult.progressDetails.nextSteps && lastResult.progressDetails.nextSteps.length > 0) {
          console.log(chalk.default.bold.cyan('\n📋 Recommended Next Steps:'));
          lastResult.progressDetails.nextSteps.slice(0, 5).forEach(step => {
            console.log(chalk.default.cyan(`  • ${step.action} [${step.priority}]`));
          });
        }
      }
    }
    
    // Show iteration history with validation
    if (options.verbose && result.history) {
      console.log(chalk.default.bold.cyan('\n📊 Iteration History:'));
      result.history.forEach((iteration, index) => {
        console.log(chalk.default.gray(`\nIteration ${index + 1}:`));
        console.log(`  Real Progress: ${Math.round(iteration.progress * 100)}%`);
        if (iteration.validationDetails) {
          console.log(`  Validation: ${iteration.validationDetails.overall.passed}/${iteration.validationDetails.overall.total} passed`);
        }
        console.log(`  Learnings: ${iteration.learnings.slice(0, 3).join(', ') || 'None'}`);
        console.log(`  Next Steps: ${iteration.nextSteps.slice(0, 3).join(', ') || 'None'}`);
      });
    }
    
    // Show summary with real metrics
    console.log(chalk.default.bold.cyan('\n📈 Summary:'));
    console.log(`  Goal: ${goal}`);
    console.log(`  Total iterations: ${result.iterations}`);
    console.log(`  Final validation: ${validationStats.passed}/${validationStats.total} (${((validationStats.passed/validationStats.total)*100).toFixed(1)}%)`);
    
    const successfulIterations = result.history.filter(h => h.progress > 0.7).length;
    console.log(`  Successful iterations: ${successfulIterations}/${result.iterations}`);
    
    const avgProgress = result.history.reduce((sum, h) => sum + h.progress, 0) / result.history.length;
    console.log(`  Average progress per iteration: ${(avgProgress * 100).toFixed(1)}%`);
    
    // Generate final report
    if (options.report) {
      const report = await orchestrator.generateFinalReport(
        { description: goal }, 
        result.success, 
        result.result
      );
      
      console.log(chalk.default.bold.cyan('\n📄 Final Report:'));
      console.log('─'.repeat(60));
      console.log(report);
    }
    
  } catch (error) {
    spinner.stop();
    console.error(chalk.default.red('\n❌ Error:'), error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Register the validated achieve command
 */
export function registerAchieveValidatedCommand(program) {
  program
    .command('achieve-validated <goal>')
    .alias('achievev')
    .description('Achieve any goal autonomously with real validation')
    .option('-m, --max-iterations <n>', 'Maximum iterations', '10')
    .option('-c, --convergence <n>', 'Convergence threshold (0-1)', '0.90')
    .option('-p, --parallel', 'Enable parallel swarms')
    .option('--no-evolve', 'Disable auto-evolution')
    .option('-v, --verbose', 'Verbose output')
    .option('-r, --report', 'Generate final report')
    .action(handleAchieveValidatedCommand);
}