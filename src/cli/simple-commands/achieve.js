#!/usr/bin/env -S deno run --allow-all
/**
 * Achieve Command - Deno version that works like swarm and sparc
 * Launches Claude Code with Meta-Orchestrator Loop
 */

import { printSuccess, printError, printWarning } from '../utils.js';

export async function achieveCommand(subArgs, flags) {
  const goal = subArgs.join(' ');
  
  if (!goal) {
    printError('Please provide a goal to achieve');
    console.log('Example: claude-flow achieve "Create a profitable trading bot"');
    return;
  }

  printSuccess('🎯 Claude-Flow Meta-Orchestrator: Autonomous Goal Achievement');
  console.log(`Goal: ${goal}`);
  console.log('─'.repeat(60));
  
  const goalId = `goal_${Math.random().toString(36).substring(2, 11)}_${Math.random().toString(36).substring(2, 11)}`;
  const maxIterations = parseInt(flags.maxIterations || flags['max-iterations'] || '10');
  const convergenceThreshold = parseFloat(flags.convergence || '0.95');
  
  // Create the meta-orchestrator prompt
  const metaPrompt = generateMetaOrchestratorPrompt({
    goal,
    goalId,
    maxIterations,
    convergenceThreshold,
    enableParallel: flags.parallel,
    autoEvolve: !flags.noEvolve && !flags['no-evolve'],
    budget: flags.budget,
    deadline: flags.deadline
  });

  if (flags.dryRun || flags.d || flags['dry-run']) {
    printWarning('DRY RUN - Meta-Orchestrator Configuration:');
    console.log(`Goal ID: ${goalId}`);
    console.log(`Max Iterations: ${maxIterations}`);
    console.log(`Convergence Threshold: ${convergenceThreshold}`);
    console.log(`Parallel Swarms: ${flags.parallel || false}`);
    console.log(`Auto Evolution: ${!flags.noEvolve && !flags['no-evolve']}`);
    console.log();
    console.log('Meta-orchestrator prompt preview:');
    console.log(metaPrompt.substring(0, 500) + '...');
    console.log();
    console.log('This would launch Claude Code with the meta-orchestrator loop');
    return;
  }

  // Launch Claude Code with the meta-orchestrator prompt
  printSuccess('Launching Claude Code with Meta-Orchestrator...');
  console.log(`📝 Goal ID: ${goalId}`);
  console.log(`🔄 Max Iterations: ${maxIterations}`);
  console.log(`🎯 Success Threshold: ${Math.round(convergenceThreshold * 100)}%`);
  console.log();

  // Execute Claude using same pattern as SPARC
  await executeClaude(metaPrompt, goalId, subArgs, flags);
}

/**
 * Generate the meta-orchestrator prompt that creates the autonomous loop
 */
function generateMetaOrchestratorPrompt(config) {
  return `# 🎯 META-ORCHESTRATOR: Autonomous Goal Achievement Loop

You are a META-ORCHESTRATOR with a critical mission: autonomously achieve the following goal through iterative swarm orchestration.

## YOUR GOAL
${config.goal}

## META-ORCHESTRATOR CONFIGURATION
- Goal ID: ${config.goalId}
- Max Iterations: ${config.maxIterations}
- Success Threshold: ${Math.round(config.convergenceThreshold * 100)}%
- Parallel Swarms: ${config.enableParallel ? 'Enabled' : 'Disabled'}
- Auto Evolution: ${config.autoEvolve ? 'Enabled' : 'Disabled'}
${config.budget ? `- Budget Limit: ${config.budget}` : ''}
${config.deadline ? `- Deadline: ${config.deadline}` : ''}

## YOUR AUTONOMOUS LOOP

You MUST follow this iterative process until the goal is achieved:

### ITERATION LOOP (Repeat until success or max iterations)

1. **ANALYZE CURRENT STATE**
   - Use memory get "goal/${config.goalId}/progress" to check current progress
   - If first iteration, progress = 0
   - Use cognitive_triangulation tools to understand the project state

2. **DETERMINE NEXT ACTION**
   Based on progress:
   - 0-30%: Focus on research, architecture, and foundation
   - 30-60%: Core implementation and feature development
   - 60-80%: Testing, optimization, and refinement
   - 80-95%: Polish, documentation, and edge cases
   - 95%+: Final validation and delivery

3. **SPAWN APPROPRIATE SWARM**
   Create a swarm with specific instructions based on current needs:
   
   \`\`\`
   Task("Swarm Coordinator", "
   ITERATION: {current_iteration}
   PROGRESS: {current_progress}%
   
   YOUR MISSION:
   [Specific instructions based on current phase]
   
   USE THESE TOOLS:
   - cognitive_triangulation for code analysis
   - TodoWrite for task management
   - Memory for persistence
   - All development tools as needed
   
   STORE EVERYTHING IN MEMORY:
   - memory store 'goal/${config.goalId}/progress' {new_progress}
   - memory store 'goal/${config.goalId}/learnings' {what_you_learned}
   - memory store 'goal/${config.goalId}/artifacts' {deliverables}
   ")
   \`\`\`

4. **EVALUATE RESULTS**
   After swarm completes:
   - Calculate new progress percentage
   - Document learnings
   - Identify remaining work
   - Check if goal is achieved (progress >= ${config.convergenceThreshold * 100}%)

5. **ITERATE OR COMPLETE**
   - If goal achieved: Prepare final deliverables and exit
   - If not achieved and iterations < ${config.maxIterations}: Go to step 1
   - If max iterations reached: Report best effort results

## CRITICAL INSTRUCTIONS

1. **REAL WORK ONLY** - Actually implement solutions, don't simulate
2. **USE ALL TOOLS** - Leverage every available tool to achieve the goal
3. **PERSIST EVERYTHING** - Use memory extensively for continuity
4. **SPAWN REAL SWARMS** - Use Task() to create actual working swarms
5. **MEASURE PROGRESS** - Use concrete metrics, not estimates
6. **SELF-IMPROVE** - Each iteration should be smarter than the last

## AVAILABLE ENHANCED TOOLS

You have access to ALL tools including:
- **Cognitive Triangulation**: analyze_codebase, extract_pois, build_graph
- **Neural Swarms**: spawn_cognitive_agent, neural_forecast
- **Autonomous Agents**: create_agent, execute_mrap
- **Standard Tools**: All file operations, web search, memory, etc.

## SUCCESS CRITERIA EXTRACTION

Analyze the goal and extract concrete success criteria. For "${config.goal}":
${extractSuccessCriteria(config.goal)}

## START THE LOOP NOW

Begin with iteration 1. Remember: You're not simulating - you're actually achieving this goal!

Store initial state:
\`\`\`
memory store "goal/${config.goalId}/status" "active"
memory store "goal/${config.goalId}/iteration" "1"
memory store "goal/${config.goalId}/progress" "0"
\`\`\`

Then spawn your first exploration swarm to begin!`;
}

/**
 * Extract success criteria from goal description
 */
function extractSuccessCriteria(goal) {
  const criteria = [];
  
  // Common patterns
  if (goal.toLowerCase().includes('profitable') || goal.toLowerCase().includes('winstgevend')) {
    criteria.push('- System generates positive returns/profit');
    criteria.push('- Risk management is implemented');
    criteria.push('- Backtesting shows consistent results');
  }
  
  if (goal.toLowerCase().includes('trading')) {
    criteria.push('- Can execute buy/sell orders');
    criteria.push('- Real-time market data integration');
    criteria.push('- Stop-loss and take-profit mechanisms');
  }
  
  if (goal.toLowerCase().includes('api')) {
    criteria.push('- RESTful endpoints implemented');
    criteria.push('- Authentication and authorization');
    criteria.push('- Error handling and validation');
    criteria.push('- API documentation generated');
  }
  
  if (goal.toLowerCase().includes('test')) {
    criteria.push('- Test coverage > 80%');
    criteria.push('- All tests passing');
    criteria.push('- Integration tests included');
  }
  
  // Default criteria
  criteria.push('- Code is production-ready');
  criteria.push('- Documentation is complete');
  criteria.push('- Deployment instructions provided');
  
  return criteria.join('\n');
}

async function executeClaude(enhancedTask, goalId, subArgs, flags) {
  // Build arguments array using same pattern as SPARC
  const claudeArgs = [];
  claudeArgs.push(enhancedTask);
  
  // Add --dangerously-skip-permissions by default
  claudeArgs.push('--dangerously-skip-permissions');
  
  if (flags.verbose || flags.v) {
    claudeArgs.push('--verbose');
  }
  
  console.log('\n🚀 Starting autonomous goal achievement loop...');
  console.log();
  console.log('The system will now:');
  console.log('1. Analyze your goal and create a plan');
  console.log('2. Spawn specialized swarms iteratively');
  console.log('3. Use cognitive triangulation for understanding');
  console.log('4. Self-correct and improve with each iteration');
  console.log('5. Continue until goal is achieved');
  console.log();
  console.log('🤖 No manual intervention required - sit back and watch!');
  console.log();
  
  try {
    const command = new Deno.Command('claude', {
      args: claudeArgs,
      cwd: Deno.cwd(),
      env: {
        ...Deno.env.toObject(),
        CLAUDE_META_ORCHESTRATOR: 'true',
        CLAUDE_GOAL_ID: goalId,
        CLAUDE_FLOW_MEMORY_ENABLED: 'true',
        CLAUDE_FLOW_MEMORY_NAMESPACE: `goal_${goalId}`,
      },
      stdin: 'inherit',
      stdout: 'inherit',
      stderr: 'inherit',
    });
    
    console.log('\n📡 Spawning claude process...\n');
    const child = command.spawn();
    const status = await child.status;
    
    if (status.success) {
      printSuccess(`✅ Goal achievement process completed!`);
      console.log(`Check memory namespace "goal_${goalId}" for results`);
    } else {
      printError(`Process exited with code ${status.code}`);
    }
  } catch (err) {
    printError(`Failed to execute Claude: ${err.message}`);
    console.error('Stack trace:', err.stack);
  }
}

// Help function
function showAchieveHelp() {
  console.log('Achieve command:');
  console.log('  <goal>                   Autonomously achieve any goal');
  console.log();
  console.log('Examples:');
  console.log('  claude-flow achieve "Create a profitable trading bot"');
  console.log('  claude-flow achieve "Build REST API" --max-iterations 20');
  console.log('  claude-flow achieve "Optimize performance" --parallel --verbose');
  console.log();
  console.log('Options:');
  console.log('  --max-iterations <n>     Maximum iterations (default: 10)');
  console.log('  --convergence <n>        Success threshold 0-1 (default: 0.95)');
  console.log('  --parallel               Enable parallel swarm execution');
  console.log('  --no-evolve              Disable autonomous evolution');
  console.log('  --budget <n>             Maximum resource budget');
  console.log('  --deadline <date>        Deadline for goal achievement');
  console.log('  --verbose                Show detailed progress');
  console.log('  --dry-run                Show configuration without executing');
}

// Allow direct execution
if (import.meta.main) {
  const args = [];
  const flags = {};
  
  // Parse arguments and flags
  for (let i = 0; i < Deno.args.length; i++) {
    const arg = Deno.args[i];
    if (arg.startsWith('--')) {
      const flagName = arg.substring(2);
      const nextArg = Deno.args[i + 1];
      
      if (nextArg && !nextArg.startsWith('--')) {
        flags[flagName] = nextArg;
        i++;
      } else {
        flags[flagName] = true;
      }
    } else {
      args.push(arg);
    }
  }
  
  if (args.length === 0 || flags.help || flags.h) {
    showAchieveHelp();
  } else {
    await achieveCommand(args, flags);
  }
}