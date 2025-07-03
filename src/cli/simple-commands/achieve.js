#!/usr/bin/env -S deno run --allow-all
/**
 * Achieve Command - Deno version that works like swarm and sparc
 * Launches Claude Code with Meta-Orchestrator Loop
 */

import { printSuccess, printError, printWarning } from '../utils.js';

export async function achieveCommand(subArgs, flags) {
  const goal = subArgs.join(' ');
  
  // Handle help flag
  if (flags.help || flags.h || !goal) {
    showAchieveHelp();
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
   
   IMPORTANT - META-SWARM PATTERN:
   Instead of individual Task() calls, spawn MULTIPLE SWARMS:
   
   \`\`\`
   // Create iteration plan
   Write("ITERATION_${iteration}_PLAN.md", "Define goals and team assignments");
   
   // Launch parallel swarms - each is a separate process!
   Bash("./claude-flow swarm 'Research Swarm: ${research_goals}' --strategy research --max-agents 4 --background");
   Bash("./claude-flow swarm 'Development Swarm: ${dev_goals}' --strategy development --max-agents 4 --background"); 
   Bash("./claude-flow swarm 'Testing Swarm: ${test_goals}' --strategy testing --max-agents 3 --background");
   
   // Monitor all swarms
   Bash("./claude-flow swarm status --watch");
   
   // Swarms automatically:
   - Run in separate processes (TRUE PARALLELISM!)
   - Share state through .md files and todos
   - Have their own internal agent coordination
   - Can spawn sub-swarms if needed
   \`\`\`
   
   BENEFITS:
   - True parallel execution (multiple processes)
   - Each swarm has 3-5 agents working on related tasks
   - Total parallelism: 3 swarms × 4 agents = 12 parallel workers
   - Swarms coordinate through shared documentation
   - You can monitor all swarms with status commands
   
   LIVE COORDINATION:
   - Just like 'swarm' command, agents see each other's work IMMEDIATELY
   - Use TodoRead frequently to check what others have done
   - Update todos immediately after completing work
   - React to other agents' discoveries and adjust approach
   
   DOCUMENTATION & KNOWLEDGE SHARING:
   - Create .md files for persistent documentation
   - Write SWARM_COORDINATION.md to track overall progress
   - Create ARCHITECTURE.md when designing systems
   - Write PLAN.md for iteration planning
   - Create API_SPEC.md, TESTING_STRATEGY.md, etc. as needed
   - Other agents can Read these .md files for context

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
   
5. **MULTI-COORDINATOR PATTERN** (for very complex goals)
   Example for large system:
   \`\`\`
   // Multiple coordinators managing different domains
   Task("Frontend Coordinator", "Manage UI team. Spawn agents for: components, styling, state management. Sync with Backend Coordinator via todos.");
   Task("Backend Coordinator", "Manage API team. Spawn agents for: endpoints, database, auth. Sync with Frontend Coordinator via todos.");
   Task("DevOps Coordinator", "Manage infrastructure team. Spawn agents for: CI/CD, monitoring, deployment. Sync with other coordinators.");
   Task("QA Coordinator", "Manage testing team. Spawn agents for: unit tests, integration, E2E. Monitor all coordinators' work.");
   \`\`\`
   
   MULTI-COORDINATOR BENEFITS:
   - Each coordinator manages 3-5 specialized agents
   - Coordinators sync through shared todos
   - Total parallelism: 4 coordinators × 4 agents = 16 parallel workers
   - Coordinators can see ALL todos from ALL agents in real-time

## STANDARD DOCUMENTATION FILES

Create these .md files as you work:

1. **SWARM_COORDINATION.md** - Overall swarm progress and decisions
   - Current iteration and progress %
   - Active agents and their missions
   - Key decisions and rationale
   - Blockers and solutions

2. **ARCHITECTURE.md** - System design (for development goals)
   - Component structure
   - Data flow diagrams
   - Technology choices
   - Integration points

3. **PLAN.md** - Iteration planning
   - Goals for current iteration
   - Task breakdown
   - Success criteria
   - Risk mitigation

4. **LEARNINGS.md** - Knowledge accumulation
   - What worked well
   - What didn't work
   - Optimization opportunities
   - Patterns discovered

## IMPORTANT: PARALLELISM IN CLAUDE FLOW

Claude Flow's Task() tool executes SEQUENTIALLY, not in parallel. For each iteration:
- Agents are called one after another, not simultaneously
- They share state through todos and .md files between calls
- This is by design - Claude Code can only run one task at a time

To maximize efficiency despite sequential execution:
1. Create comprehensive task lists in TodoWrite first
2. Each agent should check TodoRead for work assignments
3. Agents update todos immediately after completing work
4. Use .md files for persistent documentation between agents

RECOMMENDED: Spawn multiple swarms for true parallel execution:
\`\`\`
// Launch multiple swarms simultaneously - each swarm runs in its own process!
Bash("./claude-flow swarm 'Research Team: Analyze compact LLM architectures' --strategy research --max-agents 3 --background");
Bash("./claude-flow swarm 'Architecture Team: Design optimal model structure' --strategy development --max-agents 3 --background");
Bash("./claude-flow swarm 'Documentation Team: Create comprehensive docs' --strategy analysis --max-agents 2 --background");

// Check swarm status
Bash("./claude-flow swarm status");

// Swarms coordinate through shared .md files and todos
\`\`\`

## CRITICAL INSTRUCTIONS

1. **REAL WORK ONLY** - Actually implement solutions, don't simulate
2. **SEQUENTIAL EXECUTION** - Agents run one after another, sharing state via todos/files
3. **SHARED STATE** - All agents coordinate through TodoRead/TodoWrite AND .md files
4. **EFFICIENT TASK DESIGN** - Design tasks to minimize dependencies between agents
5. **DOCUMENT EVERYTHING** - Create .md files for persistent knowledge
6. **SELF-IMPROVE** - Each iteration learns from previous swarms via LEARNINGS.md

## AVAILABLE ENHANCED TOOLS

You have access to ALL tools including:
- **Cognitive Triangulation**: analyze_codebase, extract_pois, build_graph
- **Neural Swarms**: spawn_cognitive_agent, neural_forecast
- **Autonomous Agents**: create_agent, execute_mrap
- **Standard Tools**: All file operations, web search, memory, etc.

### WHEN TO USE ADVANCED TOOLS:

1. **COGNITIVE TRIANGULATION** (as codebase grows):
   - When project has 10+ files: Use analyze_codebase for navigation
   - When debugging complex issues: Use extract_pois to find key functions
   - When refactoring: Use build_graph to understand dependencies
   - ALWAYS use for large codebases to maintain overview

2. **NEURAL SWARMS** (for ML/AI projects):
   - When goal involves prediction or forecasting
   - For pattern recognition tasks
   - When optimizing complex systems
   - For adaptive learning requirements

3. **AUTONOMOUS AGENTS** (for self-improving systems):
   - When agents need to evolve strategies
   - For long-running optimization tasks
   - When building self-aware systems
   - For meta-learning scenarios

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

EXAMPLE META-SWARM PATTERN:
\`\`\`
// First, create coordination documents
Write("SWARM_COORDINATION.md", "# Meta-Orchestrator Progress\\n\\nGoal: ${goal}\\nIteration: ${iteration}\\nProgress: ${progress}%");
Write("ITERATION_${iteration}_PLAN.md", "# Iteration Plan\\n\\n## Swarm Assignments\\n- Research Swarm: ...");

// Launch multiple swarms in parallel (TRUE PARALLELISM!)
// Each swarm runs in its own process and manages its own agents

// For research phase (0-30%):
Bash("./claude-flow swarm 'Research best practices and architectures' --strategy research --max-agents 4 --background");
Bash("./claude-flow swarm 'Analyze requirements and constraints' --strategy analysis --max-agents 3 --background");
Bash("./claude-flow swarm 'Explore technology options' --strategy research --max-agents 3 --background");

// For development phase (30-60%):
Bash("./claude-flow swarm 'Core implementation team' --strategy development --max-agents 5 --background");
Bash("./claude-flow swarm 'Testing and validation team' --strategy testing --max-agents 4 --background");
Bash("./claude-flow swarm 'Documentation team' --strategy analysis --max-agents 3 --background");

// Monitor all swarms
Bash("./claude-flow swarm status --all");

// Wait for swarms to complete
Bash("sleep 60 && ./claude-flow swarm status --all > SWARM_RESULTS.md");

// Consolidate results
TodoWrite([{
  id: "consolidate_iteration",
  content: "Review SWARM_RESULTS.md and all team outputs. Update progress percentage.",
  status: "pending",
  priority: "high"
}]);
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
  console.log(`
🎯 Claude-Flow Achieve: Autonomous Goal Achievement

USAGE:
  claude-flow achieve <goal> [options]

DESCRIPTION:
  Launches an autonomous meta-orchestrator that iteratively spawns swarms
  until your goal is achieved. Uses self-improving loops with parallel agents.

EXAMPLES:
  claude-flow achieve "Create a calculator app"
  claude-flow achieve "Build profitable trading system" --max-iterations 20
  claude-flow achieve "Optimize database performance" --parallel --convergence 0.9
  claude-flow achieve "Create REST API" --dry-run

FLAGS:
  --max-iterations <n>     Maximum iteration loops (default: 10)
  --convergence <0-1>      Success threshold percentage (default: 0.95)
  --parallel               Enable parallel swarm execution
  --no-evolve              Disable self-improvement between iterations
  --budget <amount>        Resource budget constraints
  --deadline <time>        Time deadline for completion
  --dry-run, -d            Preview configuration without executing
  --verbose, -v            Show detailed progress
  --help, -h               Show this help message

ADVANCED FLAGS:
  --monitor                Real-time monitoring of swarm progress
  --strategy <type>        Force specific swarm strategy
  --max-agents <n>         Max agents per swarm (default: 5)
  --memory-namespace <ns>  Custom memory namespace
  --output <format>        Output format: json, markdown, html

ITERATION PHASES:
  0-30%: Research and planning phase
  30-60%: Core implementation phase  
  60-80%: Testing and optimization phase
  80-95%: Polish and documentation phase
  95%+: Final validation and delivery

COORDINATION PATTERNS:
  - Single swarm: Basic goals with 3-5 agents
  - Multi-coordinator: Complex goals with 4+ coordinators
  - Hierarchical: Coordinators spawn sub-swarms
  - Adaptive: System chooses best pattern

DOCUMENTATION:
  Agents automatically create and maintain:
  - SWARM_COORDINATION.md: Overall progress tracking
  - ARCHITECTURE.md: System design documentation
  - PLAN.md: Iteration goals and strategies
  - LEARNINGS.md: Knowledge accumulation

EXAMPLES BY COMPLEXITY:
  Simple (calculator):
    claude-flow achieve "Create calculator"
  
  Medium (API):
    claude-flow achieve "Build REST API with auth" --parallel
  
  Complex (trading):
    claude-flow achieve "Create profitable trading system" \\
      --max-iterations 20 --parallel --monitor
  
  Expert (ML system):
    claude-flow achieve "Build self-improving recommendation engine" \\
      --max-iterations 30 --convergence 0.98 --parallel

For more info: https://github.com/ruvnet/claude-code-flow
`);
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