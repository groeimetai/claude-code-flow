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

3. **SPAWN PARALLEL SWARM**
   Create MULTIPLE agents working in parallel based on current needs:
   
   Example for development phase (30-60% progress):
   \`\`\`
   // Spawn multiple agents concurrently
   Task("Frontend Developer", "Build UI components based on TodoRead state. Focus on: {specific_ui_tasks}");
   Task("Backend Developer", "Implement API endpoints. Check TodoRead for requirements. Focus on: {specific_api_tasks}");
   Task("Test Engineer", "Write tests for completed features. Use TodoRead to track what's done. Focus on: {specific_test_tasks}");
   Task("Code Reviewer", "Review and optimize implemented code. Check for patterns and improvements.");
   \`\`\`
   
   Example for research phase (0-30% progress):
   \`\`\`
   Task("Research Analyst", "Research best practices for: {technology_stack}. Store findings in todos.");
   Task("Architecture Designer", "Design system architecture based on requirements. Create diagrams.");
   Task("Technology Scout", "Evaluate tools and libraries. Compare options and make recommendations.");
   Task("Requirements Analyst", "Break down the goal into concrete requirements and success criteria.");
   \`\`\`
   
   IMPORTANT: 
   - Spawn 3-5 agents PER ITERATION working on DIFFERENT aspects
   - All agents share state through TodoRead/TodoWrite
   - Agents work CONCURRENTLY not sequentially
   - Each agent has a SPECIFIC focused mission

4. **EVALUATE RESULTS**
   After ALL swarm agents complete:
   - Use TodoRead to review what each agent accomplished
   - Consolidate learnings from all agents
   - Calculate new progress percentage based on completed work
   - Identify gaps and remaining work
   - Check if goal is achieved (progress >= ${config.convergenceThreshold * 100}%)
   
   COORDINATION TIP: Use TodoWrite to create a "Swarm Results" todo that summarizes what all agents achieved

5. **ITERATE OR COMPLETE**
   - If goal achieved: Prepare final deliverables and exit
   - If not achieved and iterations < ${config.maxIterations}: Go to step 1
   - If max iterations reached: Report best effort results

## SWARM COORDINATION PATTERNS

Choose the right pattern based on your goal:

1. **PARALLEL DEVELOPMENT** (for apps/systems)
   - Frontend, Backend, Database, DevOps agents working simultaneously
   - Shared interface definitions in todos

2. **RESEARCH SWARM** (for analysis/exploration)
   - Multiple researchers exploring different aspects
   - Synthesizer agent to combine findings

3. **ITERATIVE REFINEMENT** (for optimization)
   - Implementer, Tester, Optimizer agents in tight loops
   - Continuous improvement cycles

4. **HIERARCHICAL SWARM** (for complex projects)
   - Lead architect spawns specialized sub-swarms
   - Each sub-swarm handles a component

## CRITICAL INSTRUCTIONS

1. **REAL WORK ONLY** - Actually implement solutions, don't simulate
2. **PARALLEL EXECUTION** - Spawn multiple agents working concurrently
3. **SHARED STATE** - All agents coordinate through TodoRead/TodoWrite
4. **SPAWN REAL SWARMS** - Use multiple Task() calls for true parallelism
5. **MEASURE PROGRESS** - Use concrete metrics from all agents
6. **SELF-IMPROVE** - Each iteration learns from previous swarms

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

IMPORTANT: Skip memory initialization - we'll use TodoWrite for state tracking instead.

Initial state (already initialized):
- Goal ID: ${config.goalId}
- Status: active
- Iteration: 1
- Progress: 0%

EXAMPLE FIRST SWARM for "Create calculator":
\`\`\`
// All agents work in PARALLEL
Task("UI Designer", "Design calculator interface layout. Create HTML/CSS for buttons, display, and responsive design. Store design in todos.");
Task("Logic Developer", "Implement calculator operations (add, subtract, multiply, divide). Handle edge cases like division by zero.");
Task("Feature Developer", "Add advanced features: memory functions, history, scientific mode toggle. Document in todos.");
Task("Test Engineer", "Create test suite for calculator operations. Test UI interactions and edge cases.");
\`\`\`

Start immediately by spawning your first PARALLEL swarm to begin!`;
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
  
  if (goal.toLowerCase().includes('calculator')) {
    criteria.push('- Basic operations work correctly (add, subtract, multiply, divide)');
    criteria.push('- User interface is intuitive and responsive');
    criteria.push('- Edge cases handled (division by zero, overflow)');
    criteria.push('- Clear/reset functionality works');
    criteria.push('- Tests validate all operations');
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