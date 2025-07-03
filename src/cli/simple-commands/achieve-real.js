/**
 * Real Achieve Command - Launches Claude Code with Meta-Orchestrator Loop
 * This creates an autonomous loop where Claude Code keeps spawning swarms until the goal is achieved
 */

import { printSuccess, printError, printWarning } from '../utils.js';
import { generateId } from '../../utils/helpers.js';

export default {
  name: 'achieve',
  description: 'Autonomously achieve any goal through iterative swarm orchestration',
  arguments: '<goal>',
  options: [
    { flags: '--max-iterations <n>', description: 'Maximum iterations to attempt', default: '10' },
    { flags: '--convergence <n>', description: 'Success threshold (0-1)', default: '0.95' },
    { flags: '--parallel', description: 'Enable parallel swarm execution' },
    { flags: '--no-evolve', description: 'Disable autonomous evolution' },
    { flags: '--budget <n>', description: 'Maximum resource budget' },
    { flags: '--deadline <date>', description: 'Deadline for goal achievement' },
    { flags: '--verbose', description: 'Show detailed progress' },
    { flags: '--dry-run', description: 'Show what would be executed without running' },
  ],
  
  async action(goal, options) {
    if (!goal) {
      printError('Please provide a goal to achieve');
      console.log('Example: claude-flow achieve "Create a profitable trading bot"');
      return;
    }

    printSuccess('🎯 Claude-Flow Meta-Orchestrator: Autonomous Goal Achievement');
    console.log(`Goal: ${goal}`);
    console.log('─'.repeat(60));
    
    const goalId = generateId();
    const maxIterations = parseInt(options.maxIterations) || 10;
    const convergenceThreshold = parseFloat(options.convergence) || 0.95;
    
    // Create the meta-orchestrator prompt
    const metaPrompt = generateMetaOrchestratorPrompt({
      goal,
      goalId,
      maxIterations,
      convergenceThreshold,
      enableParallel: options.parallel,
      autoEvolve: options.evolve !== false,
      budget: options.budget,
      deadline: options.deadline
    });

    if (options.dryRun) {
      printWarning('DRY RUN - Meta-Orchestrator Configuration:');
      console.log(`Goal ID: ${goalId}`);
      console.log(`Max Iterations: ${maxIterations}`);
      console.log(`Convergence Threshold: ${convergenceThreshold}`);
      console.log(`Parallel Swarms: ${options.parallel || false}`);
      console.log(`Auto Evolution: ${options.evolve !== false}`);
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

    await launchClaudeWithMetaOrchestrator(metaPrompt, goalId, options);
  },
};

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

/**
 * Launch Claude Code with the meta-orchestrator prompt
 */
async function launchClaudeWithMetaOrchestrator(prompt, goalId, options) {
  const { spawn } = await import('child_process');
  const fs = await import('fs/promises');
  const path = await import('path');
  const os = await import('os');
  
  printSuccess('🚀 Starting autonomous goal achievement loop...');
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
  
  // Save prompt to file to avoid command line length issues
  const tempDir = os.tmpdir();
  const promptFile = path.join(tempDir, `claude-achieve-${goalId}.txt`);
  
  try {
    await fs.writeFile(promptFile, prompt, 'utf8');
    console.log(`\n📝 Prompt saved to: ${promptFile}`);
  } catch (error) {
    printError('Failed to save prompt file');
    console.log('\n💡 Copy this prompt and run manually:');
    console.log('─'.repeat(60));
    console.log('claude --dangerously-skip-permissions');
    console.log('─'.repeat(60));
    console.log(prompt);
    console.log('─'.repeat(60));
    return;
  }
  
  // Set environment variables for the meta-orchestrator
  const env = {
    ...process.env,
    CLAUDE_META_ORCHESTRATOR: 'true',
    CLAUDE_GOAL_ID: goalId,
    CLAUDE_FLOW_MEMORY_ENABLED: 'true',
    CLAUDE_FLOW_MEMORY_NAMESPACE: `goal_${goalId}`,
  };
  
  console.log('\n📡 Launching claude process...\n');
  console.log('📋 Instructions:');
  console.log('1. Claude Code will open');
  console.log(`2. Copy and paste the prompt from: ${promptFile}`);
  console.log('3. Or run this command:');
  console.log(`   cat "${promptFile}" | pbcopy  # Copies to clipboard on macOS`);
  console.log();
  
  // Launch claude with a minimal prompt to start the interface
  const claudeProcess = spawn('claude', [
    'Please paste the meta-orchestrator prompt from the file mentioned above.',
    '--dangerously-skip-permissions'
  ], {
    env: env,
    stdio: 'inherit'
  });
    
  claudeProcess.on('close', (code) => {
    if (code === 0) {
      printSuccess('✅ Goal achievement process completed!');
      console.log(`Check memory namespace "goal_${goalId}" for results`);
    } else {
      printError(`Process exited with code ${code}`);
    }
  });
  
  claudeProcess.on('error', (error) => {
    if (error.code === 'ENOENT') {
      printError('Claude Code is not installed or not in PATH');
      console.log('\n📦 To install Claude Code:');
      console.log('  1. Install via Cursor/VS Code extension');
      console.log('  2. Or download from: https://claude.ai/code');
      console.log('\n💡 Alternatively, copy this prompt to use manually:');
      console.log('\n' + '─'.repeat(60));
      console.log(prompt);
      console.log('─'.repeat(60));
    } else {
      printError(`Failed to launch Claude Code: ${error.message}`);
    }
  });
}