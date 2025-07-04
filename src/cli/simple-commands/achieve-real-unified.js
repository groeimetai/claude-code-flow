#!/usr/bin/env -S deno run --allow-all
/**
 * Simplified Achieve Command that properly uses RealMetaOrchestrator
 * The orchestrator handles the entire goal achievement process internally
 */

import { generateId } from "../../utils/helpers.js";
import { RealMetaOrchestrator } from "../../swarm/real-meta-orchestrator.js";
import { Logger } from "../../core/logger.js";
import { EventEmitter } from "node:events";
import { GoalValidationSystem } from "../../swarm/goal-validator.js";

export async function achieveCommand(subArgs, flags) {
  const goal = subArgs.join(' ');
  
  // Handle help flag
  if (flags.help || flags.h || !goal) {
    showAchieveHelp();
    return;
  }

  console.log('🎯 Claude-Flow Real Swarm-of-Swarms: Autonomous Goal Achievement');
  console.log(`Goal: ${goal}`);
  console.log('─'.repeat(60));
  
  const achievementId = generateId('achieve');
  const maxIterations = parseInt(flags.maxIterations || flags['max-iterations'] || '10');
  const swarmsPerIteration = parseInt(flags.swarmsPerIteration || flags['swarms-per-iteration'] || '3');
  
  // Create achievement directory
  const achieveDir = `./achieve-runs/${achievementId}`;
  await Deno.mkdir(achieveDir, { recursive: true });
  
  // Initialize components
  console.log('\n🔧 Initializing components...');
  
  // 1. Setup logger and event bus
  const logger = new Logger({ 
    level: flags.verbose || flags.v ? 'debug' : 'info',
    component: 'achieve' 
  });
  const eventBus = new EventEmitter();
  
  // 2. Create the Real Meta-Orchestrator
  const orchestrator = new RealMetaOrchestrator(logger, eventBus, {
    achievementId,
    persistencePath: achieveDir,
    maxIterations,
    swarmsPerIteration,
    convergenceThreshold: parseFloat(flags.convergence || '0.95'),
    verbose: flags.verbose || flags.v
  });
  
  // 3. Goal Validator for additional validation
  const validator = new GoalValidationSystem();
  
  // Initialize persistence
  await orchestrator.initializePersistence();
  
  if (flags.dryRun || flags.d || flags['dry-run']) {
    console.log('\n⚠️  DRY RUN - Real Swarm-of-Swarms Configuration:');
    console.log(`Achievement ID: ${achievementId}`);
    console.log(`Max Iterations: ${maxIterations}`);
    console.log(`Swarms per Iteration: ${swarmsPerIteration}`);
    console.log('\nFeatures:');
    console.log('  ✅ Real Meta-Orchestrator with Knowledge Graphs');
    console.log('  ✅ Goal Decomposition and Progress Tracking');
    console.log('  ✅ Swarm Result Analysis');
    console.log('  ✅ Adaptive Planning Based on Results');
    console.log('\nThis would spawn real swarm processes');
    return;
  }

  console.log('\n🚀 Starting autonomous goal achievement...');
  console.log(`📝 Achievement ID: ${achievementId}`);
  console.log(`🔄 Max Iterations: ${maxIterations}`);
  console.log(`🐝 Swarms per Iteration: ${swarmsPerIteration}`);
  
  // Subscribe to progress events
  let lastProgress = 0;
  eventBus.on('meta-orchestrator-progress', (data) => {
    if (flags.verbose || flags.v || data.progress - lastProgress > 0.05) {
      console.log(`\n📊 Iteration ${data.iteration}: Progress ${Math.round(data.progress * 100)}%`);
      if (data.activeGoals) {
        console.log(`   Active Goals: ${data.activeGoals}`);
      }
      lastProgress = data.progress;
    }
  });
  
  eventBus.on('swarm-started', (data) => {
    console.log(`  🐝 Spawning swarm for: ${data.objective}`);
  });
  
  eventBus.on('swarm-completed', (data) => {
    if (data.success) {
      console.log(`  ✅ Swarm completed: ${data.objective}`);
    } else {
      console.log(`  ❌ Swarm failed: ${data.objective}`);
    }
  });
  
  eventBus.on('learning-discovered', (data) => {
    if (flags.verbose || flags.v) {
      console.log(`  💡 Learning: ${data.learning}`);
    }
  });
  
  try {
    // Let the orchestrator handle the entire process
    console.log('\n═══════════════════════════════════════════════════════════');
    const result = await orchestrator.achieveGoal(goal);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Validate the final result
    const parsedGoal = validator.parseGoal(goal);
    const validationResult = await validator.validateGoal(parsedGoal, achieveDir);
    
    // Display results
    if (result.success) {
      console.log('✅ GOAL ACHIEVED!');
    } else {
      console.log('⚠️  PARTIAL SUCCESS');
    }
    
    console.log(`\n📈 Final Results:`);
    console.log(`  - Progress: ${Math.round(result.progress * 100)}%`);
    console.log(`  - Iterations Used: ${result.iterations}`);
    console.log(`  - Total Swarms: ${result.totalSwarms}`);
    console.log(`  - Files Created: ${result.metrics.totalFilesCreated}`);
    console.log(`  - Tests Written: ${result.metrics.totalTestsWritten}`);
    console.log(`  - Tests Passed: ${result.metrics.totalTestsPassed}`);
    console.log(`  - Knowledge Nodes: ${result.knowledgeGraphSize}`);
    
    if (flags.verbose || flags.v) {
      console.log('\n🔍 Validation Results:');
      const details = validationResult.details || [];
      details.slice(0, 5).forEach(detail => {
        const icon = detail.status === 'passed' ? '✅' : 
                     detail.status === 'failed' ? '❌' : '⚠️';
        console.log(`  ${icon} ${detail.criterion}: ${detail.message}`);
      });
      if (details.length > 5) {
        console.log(`  ... and ${details.length - 5} more`);
      }
    }
    
    console.log(`\n📄 Results saved to: ${achieveDir}`);
    
    // Save final state
    try {
      await orchestrator.saveState();
      console.log(`📄 State saved to: ${achieveDir}/orchestrator-state.json`);
    } catch (e) {
      // State saving is optional
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    if (flags.verbose || flags.v) {
      console.error(error.stack);
    }
    Deno.exit(1);
  }
  
  console.log(`\n🏁 Achievement ${achievementId} completed`);
}

function showAchieveHelp() {
  console.log(`
🎯 Claude-Flow Achieve - Real Autonomous Goal Achievement

Usage: cf-enhanced achieve <goal> [options]

Examples:
  cf-enhanced achieve "Create a profitable trading bot"
  cf-enhanced achieve "Build a REST API for user management" --verbose
  cf-enhanced achieve "Analyze and optimize database performance" --dry-run

Options:
  --max-iterations <n>         Maximum iterations (default: 10)
  --swarms-per-iteration <n>   Parallel swarms per iteration (default: 3)
  --convergence <n>            Success threshold 0-1 (default: 0.95)
  --verbose, -v                Show detailed progress
  --dry-run, -d                Preview without executing
  --help, -h                   Show this help

The achieve command uses the Real Meta-Orchestrator to:
✅ Decompose goals into concrete sub-goals
✅ Spawn real swarms that do actual work
✅ Analyze results and extract learnings
✅ Track progress based on deliverables
✅ Build a knowledge graph of discoveries

Results are saved to ./achieve-runs/<achievement-id>/
  `);
}

// Export for both direct execution and import
export default {
  name: 'achieve',
  description: 'Autonomously achieve any goal through real swarm orchestration',
  action: achieveCommand
};