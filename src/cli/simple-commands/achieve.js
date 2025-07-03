#!/usr/bin/env -S deno run --allow-all
/**
 * Achieve Command - Spawns multiple swarms for autonomous goal achievement
 * Uses the same Deno execution model as swarm.js for consistency
 */

import { generateId } from "../../utils/helpers.js";

export async function achieveCommand(subArgs, flags) {
  const goal = subArgs.join(' ');
  
  // Handle help flag
  if (flags.help || flags.h || !goal) {
    showAchieveHelp();
    return;
  }

  console.log('🎯 Claude-Flow Swarm-of-Swarms: Autonomous Goal Achievement');
  console.log(`Goal: ${goal}`);
  console.log('─'.repeat(60));
  
  const achievementId = generateId('achieve');
  const maxIterations = parseInt(flags.maxIterations || flags['max-iterations'] || '10');
  const convergenceThreshold = parseFloat(flags.convergence || '0.95');
  const swarmsPerIteration = parseInt(flags.swarmsPerIteration || flags['swarms-per-iteration'] || '3');
  
  // Create achievement directory
  const achieveDir = `./achieve-runs/${achievementId}`;
  await Deno.mkdir(achieveDir, { recursive: true });
  
  // Initialize achievement state
  const state = {
    goal,
    achievementId,
    iteration: 0,
    progress: 0,
    swarmHistory: [],
    learnings: [],
    artifacts: [],
    startTime: new Date().toISOString()
  };
  
  await saveState(achieveDir, state);
  
  if (flags.dryRun || flags.d || flags['dry-run']) {
    console.log('\n⚠️  DRY RUN - Swarm-of-Swarms Configuration:');
    console.log(`Achievement ID: ${achievementId}`);
    console.log(`Max Iterations: ${maxIterations}`);
    console.log(`Convergence Threshold: ${convergenceThreshold}`);
    console.log(`Swarms per Iteration: ${swarmsPerIteration}`);
    console.log(`Max Agents per Swarm: ${flags.maxAgents || flags['max-agents'] || 5}`);
    console.log();
    console.log('This would spawn real swarm processes in parallel');
    return;
  }

  console.log('\n📝 Starting autonomous achievement loop...');
  console.log(`📝 Achievement ID: ${achievementId}`);
  console.log(`🔄 Max Iterations: ${maxIterations}`);
  console.log(`🎯 Success Threshold: ${Math.round(convergenceThreshold * 100)}%`);
  console.log(`🐝 Swarms per Iteration: ${swarmsPerIteration}`);
  console.log();

  // Main achievement loop
  for (let iteration = 1; iteration <= maxIterations && state.progress < convergenceThreshold; iteration++) {
    console.log(`\n🔄 Iteration ${iteration}/${maxIterations} - Current Progress: ${Math.round(state.progress * 100)}%`);
    
    state.iteration = iteration;
    
    // Determine objectives for this iteration
    const objectives = await planIterationObjectives(state, swarmsPerIteration);
    
    console.log('\n📋 Objectives for this iteration:');
    objectives.forEach((obj, i) => {
      console.log(`  ${i + 1}. ${obj.description} (${obj.strategy})`);
    });
    
    // Spawn swarms in parallel
    const swarmPromises = objectives.map(obj => 
      spawnSwarm(obj, achieveDir, iteration, flags)
    );
    
    console.log(`\n🚀 Spawning ${objectives.length} swarms in parallel...`);
    
    // Wait for all swarms to complete
    const swarmResults = await Promise.all(swarmPromises);
    
    // Process results
    const iterationResults = await processSwarmResults(swarmResults, achieveDir);
    
    // Update state based on results
    state.progress = calculateProgress(state, iterationResults);
    state.learnings.push(...iterationResults.learnings);
    state.artifacts.push(...iterationResults.artifacts);
    state.swarmHistory.push({
      iteration,
      swarms: swarmResults.map(r => r.swarmId),
      progress: state.progress,
      learnings: iterationResults.learnings
    });
    
    await saveState(achieveDir, state);
    
    // Show iteration summary
    console.log(`\n📊 Iteration ${iteration} Summary:`);
    console.log(`  - Progress: ${Math.round(state.progress * 100)}%`);
    console.log(`  - Learnings: ${iterationResults.learnings.length}`);
    console.log(`  - Artifacts: ${iterationResults.artifacts.length}`);
    
    if ((flags.verbose || flags.v) && iterationResults.learnings.length > 0) {
      console.log('\n💡 Key Learnings:');
      iterationResults.learnings.slice(0, 3).forEach(l => {
        console.log(`  - ${l}`);
      });
    }
  }
  
  // Final results
  console.log('\n' + '═'.repeat(60));
  
  if (state.progress >= convergenceThreshold) {
    console.log('✅ GOAL ACHIEVED!');
  } else {
    console.log('⚠️  PARTIAL SUCCESS');
  }
  
  console.log(`\n📈 Final Results:`);
  console.log(`  - Final Progress: ${Math.round(state.progress * 100)}%`);
  console.log(`  - Iterations Used: ${state.iteration}`);
  console.log(`  - Total Swarms Spawned: ${state.swarmHistory.reduce((sum, h) => sum + h.swarms.length, 0)}`);
  console.log(`  - Total Learnings: ${state.learnings.length}`);
  console.log(`  - Total Artifacts: ${state.artifacts.length}`);
  console.log(`  - Results saved to: ${achieveDir}`);
  
  // Save final state
  state.endTime = new Date().toISOString();
  state.success = state.progress >= convergenceThreshold;
  await saveState(achieveDir, state);
  
  console.log(`\n🏁 Achievement ${achievementId} completed`);
}

/**
 * Plan objectives for the current iteration based on progress
 */
async function planIterationObjectives(state, swarmsPerIteration) {
  const objectives = [];
  const phase = getPhase(state.progress);
  
  switch (phase) {
    case 'exploration':
      // Early phase: research and architecture
      objectives.push({
        description: `Research best practices for: ${state.goal}`,
        strategy: 'research',
        priority: 'high'
      });
      objectives.push({
        description: `Design system architecture for: ${state.goal}`,
        strategy: 'development',
        priority: 'high'
      });
      objectives.push({
        description: `Analyze requirements and constraints for: ${state.goal}`,
        strategy: 'analysis',
        priority: 'medium'
      });
      break;
      
    case 'implementation':
      // Mid phase: build core functionality
      objectives.push({
        description: `Implement core features for: ${state.goal}`,
        strategy: 'development',
        priority: 'high'
      });
      objectives.push({
        description: `Create test suite for implemented features`,
        strategy: 'testing',
        priority: 'high'
      });
      objectives.push({
        description: `Optimize performance and architecture`,
        strategy: 'optimization',
        priority: 'medium'
      });
      break;
      
    case 'refinement':
      // Late phase: polish and validate
      objectives.push({
        description: `Perform comprehensive testing and validation`,
        strategy: 'testing',
        priority: 'high'
      });
      objectives.push({
        description: `Create documentation and deployment guides`,
        strategy: 'maintenance',
        priority: 'high'
      });
      objectives.push({
        description: `Final optimization and edge case handling`,
        strategy: 'optimization',
        priority: 'medium'
      });
      break;
  }
  
  // Add learnings-based objectives
  if (state.learnings.length > 0) {
    const recentLearning = state.learnings[state.learnings.length - 1];
    objectives.push({
      description: `Apply learning: ${recentLearning}`,
      strategy: 'development',
      priority: 'high'
    });
  }
  
  // Return only the requested number of objectives
  return objectives
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, swarmsPerIteration);
}

/**
 * Spawn a single swarm process using the same method as swarm.js
 */
async function spawnSwarm(objective, achieveDir, iteration, flags) {
  const swarmId = generateId('swarm');
  const swarmDir = `${achieveDir}/swarms/iteration-${iteration}/${swarmId}`;
  await Deno.mkdir(swarmDir, { recursive: true });
  
  console.log(`  🐝 Spawning swarm ${swarmId}...`);
  
  // Build swarm command arguments
  const swarmArgs = [
    'swarm',
    objective.description,
    '--strategy', objective.strategy,
    '--max-agents', flags.maxAgents || flags['max-agents'] || '5',
    '--parallel',  // Always use parallel for better performance
    '--persistence',  // Enable persistence
    '--memory-namespace', `achieve_${swarmId}`
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
  
  // Create a wrapper script for proper output capture (like swarm.js does)
  const wrapperScript = `#!/bin/bash
${claudeFlowBin} ${swarmArgs.map(arg => `"${arg}"`).join(' ')} > "${stdoutPath}" 2> "${stderrPath}"
exit_code=$?
echo "EXIT_CODE=$exit_code" >> "${swarmDir}/status.txt"
exit $exit_code`;
  
  const wrapperPath = `${swarmDir}/wrapper.sh`;
  await Deno.writeTextFile(wrapperPath, wrapperScript);
  await Deno.chmod(wrapperPath, 0o755);
  
  // Execute the swarm
  const command = new Deno.Command('bash', {
    args: [wrapperPath],
    env: {
      ...Deno.env.toObject(),
      CLAUDE_FLOW_SWARM_ID: swarmId,
      CLAUDE_FLOW_ACHIEVEMENT_ID: achieveDir.split('/').pop(),
      CLAUDE_FLOW_ITERATION: iteration.toString()
    }
  });
  
  const startTime = new Date().toISOString();
  
  try {
    const process = command.spawn();
    const { code, success } = await process.status;
    
    // Read the output
    const stdout = await Deno.readTextFile(stdoutPath).catch(() => '');
    const stderr = await Deno.readTextFile(stderrPath).catch(() => '');
    
    const endTime = new Date().toISOString();
    
    // Extract results from output
    const results = extractSwarmResults(stdout, stderr);
    
    // Save swarm metadata
    const metadata = {
      swarmId,
      objective,
      iteration,
      exitCode: code,
      success,
      startTime,
      endTime,
      results
    };
    
    await Deno.writeTextFile(
      `${swarmDir}/metadata.json`,
      JSON.stringify(metadata, null, 2)
    );
    
    if (success) {
      console.log(`  ✅ Swarm ${swarmId} completed successfully`);
    } else {
      console.log(`  ⚠️  Swarm ${swarmId} exited with code ${code}`);
    }
    
    // Show some output if verbose
    if (flags.verbose || flags.v) {
      const lines = stdout.split('\n').filter(l => l.trim());
      const summaryLines = lines.filter(l => 
        l.includes('✅') || l.includes('completed') || l.includes('Summary')
      ).slice(-3);
      
      if (summaryLines.length > 0) {
        console.log(`     Output from ${swarmId}:`);
        summaryLines.forEach(line => {
          console.log(`       ${line.trim()}`);
        });
      }
    }
    
    return metadata;
    
  } catch (err) {
    console.log(`  ❌ Failed to spawn swarm ${swarmId}: ${err.message}`);
    return {
      swarmId,
      objective,
      iteration,
      exitCode: -1,
      success: false,
      error: err.message,
      results: { tasksCompleted: 0, tasksFailed: 1, learnings: [], artifacts: [] }
    };
  }
}

/**
 * Extract meaningful results from swarm output
 */
function extractSwarmResults(stdout, stderr) {
  const results = {
    tasksCompleted: 0,
    tasksFailed: 0,
    agentsUsed: 0,
    learnings: [],
    artifacts: []
  };
  
  // Extract task counts
  const taskMatch = stdout.match(/Tasks Completed: (\d+)/);
  if (taskMatch) results.tasksCompleted = parseInt(taskMatch[1]);
  
  const failMatch = stdout.match(/Tasks Failed: (\d+)/);
  if (failMatch) results.tasksFailed = parseInt(failMatch[1]);
  
  const agentMatch = stdout.match(/Agents Used: (\d+)/);
  if (agentMatch) results.agentsUsed = parseInt(agentMatch[1]);
  
  // Extract learnings (look for patterns)
  const learningPatterns = [
    /Learning: (.+)/g,
    /Discovered: (.+)/g,
    /Found that (.+)/g,
    /Identified: (.+)/g,
    /💡 (.+)/g
  ];
  
  learningPatterns.forEach(pattern => {
    const matches = stdout.matchAll(pattern);
    for (const match of matches) {
      results.learnings.push(match[1].trim());
    }
  });
  
  // Extract artifacts (files created/modified)
  const filePatterns = [
    /Created file: (.+)/g,
    /Modified file: (.+)/g,
    /Generated: (.+)/g,
    /Writing to (.+)/g,
    /Saved to (.+)/g
  ];
  
  filePatterns.forEach(pattern => {
    const matches = stdout.matchAll(pattern);
    for (const match of matches) {
      results.artifacts.push(match[1].trim());
    }
  });
  
  // If no explicit counts found, estimate from output
  if (results.tasksCompleted === 0 && stdout.includes('✅')) {
    results.tasksCompleted = (stdout.match(/✅/g) || []).length;
  }
  
  return results;
}

/**
 * Process results from all swarms in an iteration
 */
async function processSwarmResults(swarmResults, achieveDir) {
  const aggregated = {
    learnings: [],
    artifacts: [],
    totalTasks: 0,
    successRate: 0
  };
  
  for (const swarm of swarmResults) {
    if (swarm.results) {
      aggregated.learnings.push(...swarm.results.learnings);
      aggregated.artifacts.push(...swarm.results.artifacts);
      aggregated.totalTasks += swarm.results.tasksCompleted + swarm.results.tasksFailed;
      
      if (swarm.results.tasksCompleted > 0) {
        const rate = swarm.results.tasksCompleted / (swarm.results.tasksCompleted + swarm.results.tasksFailed || 1);
        aggregated.successRate += rate;
      }
    }
  }
  
  // Average success rate
  if (swarmResults.length > 0) {
    aggregated.successRate /= swarmResults.length;
  }
  
  // Deduplicate learnings
  aggregated.learnings = [...new Set(aggregated.learnings)];
  
  return aggregated;
}

/**
 * Calculate progress based on current state and iteration results
 */
function calculateProgress(state, iterationResults) {
  // Base progress on multiple factors
  let progress = state.progress;
  
  // Success rate contributes to progress
  progress += iterationResults.successRate * 0.1;
  
  // Each iteration moves us forward
  progress += 0.05;
  
  // Learnings indicate understanding
  progress += Math.min(iterationResults.learnings.length * 0.02, 0.1);
  
  // Artifacts indicate concrete output
  progress += Math.min(iterationResults.artifacts.length * 0.03, 0.15);
  
  // Cap at 1.0
  return Math.min(progress, 1.0);
}

/**
 * Determine the current phase based on progress
 */
function getPhase(progress) {
  if (progress < 0.3) return 'exploration';
  if (progress < 0.7) return 'implementation';
  return 'refinement';
}

/**
 * Save state to disk
 */
async function saveState(achieveDir, state) {
  await Deno.writeTextFile(
    `${achieveDir}/state.json`,
    JSON.stringify(state, null, 2)
  );
}

function showAchieveHelp() {
  console.log(`
🎯 Claude-Flow Achieve - Autonomous Goal Achievement

Usage: cf-enhanced achieve <goal> [options]

Examples:
  cf-enhanced achieve "Create a profitable trading bot"
  cf-enhanced achieve "Build a REST API for user management" --max-iterations 5
  cf-enhanced achieve "Analyze and optimize database performance" --parallel

Options:
  --max-iterations <n>       Maximum iterations (default: 10)
  --convergence <n>          Success threshold 0-1 (default: 0.95)
  --swarms-per-iteration <n> Parallel swarms per iteration (default: 3)
  --max-agents <n>           Max agents per swarm (default: 5)
  --strategy <type>          Default strategy (auto, research, development)
  --monitor                  Enable real-time monitoring
  --verbose, -v              Show detailed progress
  --dry-run, -d              Preview without executing
  --help, -h                 Show this help

The achieve command creates a swarm-of-swarms that:
1. Analyzes your goal and creates a plan
2. Spawns multiple specialized swarms in parallel
3. Each swarm works on a specific aspect
4. Results are aggregated and progress measured
5. Process continues until goal is achieved

Results are saved to ./achieve-runs/<achievement-id>/
  `);
}

// Export for both direct execution and import
export default {
  name: 'achieve',
  description: 'Autonomously achieve any goal through iterative swarm orchestration',
  action: achieveCommand
};