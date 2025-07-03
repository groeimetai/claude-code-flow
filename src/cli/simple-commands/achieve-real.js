#!/usr/bin/env -S deno run --allow-all
/**
 * Real Achieve Command - Uses the production-ready RealMetaOrchestrator
 * This replaces the fake progress tracking with actual swarm output analysis
 */

import { generateId } from "../../utils/helpers.js";
import { RealMetaOrchestrator } from "../../swarm/real-meta-orchestrator.js";
import { Logger } from "../../core/logger.js";
import { EventEmitter } from 'node:events';

export async function achieveRealCommand(subArgs, flags) {
  const goal = subArgs.join(' ');
  
  // Handle help flag
  if (flags.help || flags.h || !goal) {
    showAchieveHelp();
    return;
  }

  console.log('🎯 Claude-Flow Real Meta-Orchestrator: Autonomous Goal Achievement');
  console.log(`Goal: ${goal}`);
  console.log('─'.repeat(60));
  
  const achievementId = generateId('achieve');
  const maxIterations = parseInt(flags.maxIterations || flags['max-iterations'] || '20');
  const convergenceThreshold = parseFloat(flags.convergence || '0.95');
  const swarmsPerIteration = parseInt(flags.swarmsPerIteration || flags['swarms-per-iteration'] || '3');
  
  // Create achievement directory
  const achieveDir = `./achieve-runs/${achievementId}`;
  await Deno.mkdir(achieveDir, { recursive: true });
  
  // Initialize logger and event bus
  const logLevel = flags.verbose || flags.v ? 'info' : 'warn';
  const logger = new Logger({ level: logLevel });
  const eventBus = new EventEmitter();
  
  // Set up event monitoring
  if (flags.monitor || flags.verbose || flags.v) {
    eventBus.on('meta-orchestrator-progress', (data) => {
      console.log(`\n📊 Progress Update - Iteration ${data.iteration}:`);
      console.log(`  📈 Progress: ${Math.round(data.progress * 100)}%`);
      console.log(`  🎯 Active Goals: ${data.activeGoals}`);
      console.log(`  ✅ Completed Goals: ${data.completedGoals}`);
      console.log(`  💡 New Insights: ${data.insights}`);
    });
    
    eventBus.on('swarm-spawned', (data) => {
      console.log(`  🐝 Spawned ${data.type} swarm: ${data.objective}`);
    });
    
    eventBus.on('learning-stored', (data) => {
      console.log(`  💡 Learning: ${data.learning}`);
    });
    
    eventBus.on('goal-completed', (data) => {
      console.log(`  ✅ Goal Completed: ${data.description}`);
    });
  }
  
  // Configure meta-orchestrator
  const config = {
    maxIterations,
    convergenceThreshold,
    swarmsPerIteration,
    persistencePath: achieveDir,
    cognitiveTriangulationEnabled: flags.cognitive || false,
    analysisDepth: flags.deep ? 'comprehensive' : 'standard'
  };
  
  if (flags.dryRun || flags.d || flags['dry-run']) {
    console.log('\n⚠️  DRY RUN - Real Meta-Orchestrator Configuration:');
    console.log(`Achievement ID: ${achievementId}`);
    console.log(`Max Iterations: ${maxIterations}`);
    console.log(`Convergence Threshold: ${convergenceThreshold}`);
    console.log(`Swarms per Iteration: ${swarmsPerIteration}`);
    console.log(`Persistence Path: ${achieveDir}`);
    console.log(`Cognitive Triangulation: ${config.cognitiveTriangulationEnabled ? 'Enabled' : 'Disabled'}`);
    console.log();
    console.log('This would use the RealMetaOrchestrator to:');
    console.log('  1. Decompose your goal into measurable sub-goals');
    console.log('  2. Spawn real swarms that produce actual code/tests/docs');
    console.log('  3. Analyze swarm outputs to extract real learnings');
    console.log('  4. Track progress based on concrete deliverables');
    console.log('  5. Build a knowledge graph of discoveries');
    console.log('  6. Iterate until goal is achieved or max iterations reached');
    return;
  }

  console.log('\n🚀 Starting Real Meta-Orchestrator...');
  console.log(`📝 Achievement ID: ${achievementId}`);
  console.log(`🔄 Max Iterations: ${maxIterations}`);
  console.log(`🎯 Success Threshold: ${Math.round(convergenceThreshold * 100)}%`);
  console.log(`🐝 Swarms per Iteration: ${swarmsPerIteration}`);
  console.log();

  // Initialize the real meta-orchestrator
  const orchestrator = new RealMetaOrchestrator(logger, eventBus, config);
  
  // Override the swarm executor to use our claude-flow binary
  orchestrator.executeSwarmProcess = async function(objective, swarmDir) {
    console.log(`  🐝 Executing swarm for: ${objective.description}`);
    
    // Build swarm command arguments
    const swarmArgs = [
      'swarm',
      `"${objective.description}"`,
      '--strategy', objective.strategy,
      '--max-agents', flags.maxAgents || flags['max-agents'] || '5',
      '--parallel',
      '--persistence',
      '--memory-namespace', `achieve_${objective.id}`,
      '--output', 'json' // Request JSON output for easier parsing
    ];
    
    if (flags.monitor) {
      swarmArgs.push('--monitor');
    }
    
    // Get the path to claude-flow binary
    const scriptPath = new URL(import.meta.url).pathname;
    const projectRoot = scriptPath.substring(0, scriptPath.indexOf('/src/'));
    const claudeFlowBin = `${projectRoot}/bin/claude-flow`;
    
    // Log the command
    const commandLog = `${claudeFlowBin} ${swarmArgs.join(' ')}`;
    await Deno.writeTextFile(`${swarmDir}/command.txt`, commandLog);
    
    // Create log files
    const stdoutPath = `${swarmDir}/stdout.log`;
    const stderrPath = `${swarmDir}/stderr.log`;
    
    // Create objective context file for swarm
    const contextPath = `${swarmDir}/context.json`;
    await Deno.writeTextFile(contextPath, JSON.stringify(objective.context || {}, null, 2));
    
    // Create a wrapper script
    const wrapperScript = `#!/bin/bash
export CLAUDE_FLOW_SWARM_DIR="${swarmDir}"
export CLAUDE_FLOW_CONTEXT_FILE="${contextPath}"
${claudeFlowBin} ${swarmArgs.map(arg => `"${arg}"`).join(' ')} > "${stdoutPath}" 2> "${stderrPath}"
exit_code=$?
echo "EXIT_CODE=$exit_code" >> "${swarmDir}/status.txt"

# Extract and save structured outputs
if [ -f "${swarmDir}/swarm-report.json" ]; then
  cp "${swarmDir}/swarm-report.json" "${swarmDir}/report.json"
fi

# Extract file operations
echo '{"created":[],"modified":[]}' > "${swarmDir}/files.json"
grep -E "(Created|Modified|Generated) file:" "${stdoutPath}" | while read line; do
  # Parse and add to files.json
  echo "$line" >> "${swarmDir}/file-operations.log"
done

# Extract test results
grep -E "[0-9]+ tests? (passed|failed)" "${stdoutPath}" > "${swarmDir}/test-results.log"

# Extract learnings
grep -E "(Discovered|Learned|Found that|Insight|Important):" "${stdoutPath}" > "${swarmDir}/learnings.log"

exit $exit_code`;
    
    const wrapperPath = `${swarmDir}/wrapper.sh`;
    await Deno.writeTextFile(wrapperPath, wrapperScript);
    await Deno.chmod(wrapperPath, 0o755);
    
    // Execute the swarm
    const command = new Deno.Command('bash', {
      args: [wrapperPath],
      env: {
        ...Deno.env.toObject(),
        CLAUDE_FLOW_SWARM_ID: swarmDir.split('/').pop(),
        CLAUDE_FLOW_ACHIEVEMENT_ID: achievementId,
        CLAUDE_FLOW_GOAL_ID: objective.goalId || ''
      }
    });
    
    try {
      const process = command.spawn();
      const { code, success } = await process.status;
      
      return {
        success,
        exitCode: code,
        command: commandLog,
        message: success ? 'Swarm completed successfully' : `Swarm exited with code ${code}`
      };
      
    } catch (err) {
      logger.error('Failed to execute swarm', { error: err.message, objective });
      return {
        success: false,
        error: err.message,
        command: commandLog
      };
    }
  };
  
  try {
    // Start the achievement process
    const startTime = Date.now();
    const result = await orchestrator.achieveGoal(goal);
    const duration = Date.now() - startTime;
    
    // Display final results
    console.log('\n' + '═'.repeat(60));
    console.log(result.success ? '✅ GOAL ACHIEVED!' : '⚠️  PARTIAL SUCCESS');
    console.log('═'.repeat(60));
    
    console.log(`\n📈 Final Results:`);
    console.log(`  - Success: ${result.success}`);
    console.log(`  - Final Progress: ${Math.round(result.convergence * 100)}%`);
    console.log(`  - Iterations Used: ${result.iterations}`);
    console.log(`  - Duration: ${Math.round(duration / 1000)}s`);
    console.log(`  - Goals Completed: ${result.goalsCompleted}/${result.goalsTotal}`);
    
    console.log(`\n📊 Concrete Deliverables:`);
    console.log(`  - Files Created: ${result.metrics.totalFilesCreated}`);
    console.log(`  - Tests Written: ${result.metrics.totalTestsWritten}`);
    console.log(`  - Tests Passed: ${result.metrics.totalTestsPassed}`);
    console.log(`  - Code Lines: ${result.metrics.totalCodeLines || 'N/A'}`);
    console.log(`  - Documentation Pages: ${result.metrics.totalDocumentationPages}`);
    console.log(`  - Knowledge Graph Nodes: ${result.knowledgeGraphSize}`);
    
    if (result.metrics.architectureDecisions.length > 0) {
      console.log(`\n🏗️  Architecture Decisions:`);
      result.metrics.architectureDecisions.slice(0, 3).forEach(d => {
        console.log(`  - ${d.description}`);
      });
    }
    
    if (result.report) {
      // Show key learnings
      if (result.report.learnings) {
        console.log(`\n💡 Key Learnings:`);
        const categories = Object.keys(result.report.learnings);
        for (const category of categories.slice(0, 3)) {
          const learnings = result.report.learnings[category];
          if (learnings.length > 0) {
            console.log(`  ${category}:`);
            learnings.slice(0, 2).forEach(l => {
              console.log(`    - ${l.content}`);
            });
          }
        }
      }
      
      // Show recommendations
      if (result.report.recommendations && result.report.recommendations.length > 0) {
        console.log(`\n📝 Recommendations:`);
        result.report.recommendations.slice(0, 3).forEach(r => {
          if (r.message) {
            console.log(`  - [${r.area}] ${r.message}`);
          } else if (r.items) {
            console.log(`  - ${r.area}: ${r.items.length} items`);
          }
        });
      }
      
      // Show next steps
      if (result.report.nextSteps && result.report.nextSteps.length > 0) {
        console.log(`\n🚀 Next Steps:`);
        result.report.nextSteps.slice(0, 3).forEach(step => {
          console.log(`  - [${step.priority}] ${step.action}`);
          if (step.rationale) {
            console.log(`    Rationale: ${step.rationale}`);
          }
        });
      }
    }
    
    console.log(`\n📁 Full results saved to: ${achieveDir}`);
    console.log(`   - orchestrator-state.json: Complete state and goal tree`);
    console.log(`   - final-report.json: Detailed achievement report`);
    console.log(`   - swarms/: Individual swarm outputs and logs`);
    
    // Save summary
    const summary = {
      achievementId,
      goal,
      success: result.success,
      progress: result.convergence,
      iterations: result.iterations,
      duration: duration,
      metrics: result.metrics,
      timestamp: new Date().toISOString()
    };
    
    await Deno.writeTextFile(
      `${achieveDir}/summary.json`,
      JSON.stringify(summary, null, 2)
    );
    
  } catch (error) {
    console.error('\n❌ Achievement failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Save error report
    await Deno.writeTextFile(
      `${achieveDir}/error.json`,
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }, null, 2)
    );
  }
  
  console.log(`\n🏁 Achievement ${achievementId} completed`);
}

function showAchieveHelp() {
  console.log(`
🎯 Claude-Flow Achieve (Real Implementation) - Autonomous Goal Achievement

Usage: cf-enhanced achieve-real <goal> [options]

Examples:
  cf-enhanced achieve-real "Create a production-ready e-commerce API"
  cf-enhanced achieve-real "Build a real-time chat application with WebSockets" --deep
  cf-enhanced achieve-real "Optimize database performance for high traffic" --cognitive

Options:
  --max-iterations <n>       Maximum iterations (default: 20)
  --convergence <n>          Success threshold 0-1 (default: 0.95)
  --swarms-per-iteration <n> Parallel swarms per iteration (default: 3)
  --max-agents <n>           Max agents per swarm (default: 5)
  --cognitive                Enable cognitive triangulation analysis
  --deep                     Enable comprehensive analysis mode
  --monitor                  Enable real-time monitoring
  --verbose, -v              Show detailed progress
  --dry-run, -d              Preview without executing
  --help, -h                 Show this help

The real achieve command:
1. Decomposes your goal into measurable sub-goals
2. Tracks dependencies between goals
3. Spawns actual swarms that produce real outputs
4. Analyzes swarm logs to extract genuine learnings
5. Tracks concrete deliverables (files, tests, features)
6. Calculates progress based on actual completion
7. Builds a knowledge graph of discoveries
8. Provides actionable recommendations

Results are saved to ./achieve-runs/<achievement-id>/
  `);
}

// Export for both direct execution and import
export default {
  name: 'achieve-real',
  description: 'Autonomously achieve goals using the real meta-orchestrator',
  action: achieveRealCommand
};