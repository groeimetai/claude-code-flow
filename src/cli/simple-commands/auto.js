#!/usr/bin/env node
// auto.js - Automatically select the best mode/tool for a task

import { autoSelect } from '../../mcp/simple-tools/auto-mode-selector.js';

export async function autoCommand(args, flags) {
  const task = args.join(' ').trim();
  
  if (!task) {
    console.log(`
🤖 Claude-Flow Auto Mode

USAGE:
  claude-flow auto <task description>

EXAMPLES:
  claude-flow auto "analyze my authentication system"
  → Automatically uses cognitive-analyst mode

  claude-flow auto "create tests for user service"  
  → Automatically uses tdd mode
  
  claude-flow auto "build knowledge graph of API"
  → Automatically uses graph-architect mode
  
  claude-flow auto "fix performance issues"
  → Automatically uses optimizer/debug mode

The auto command analyzes your task description and automatically:
- Selects the best SPARC mode
- Chooses appropriate MCP tools
- Configures optimal settings

No need to remember which mode to use!
`);
    return;
  }
  
  console.log('🤖 Auto-selecting best approach...\n');
  
  const suggestion = autoSelect(task);
  
  console.log(`📋 Task: ${task}`);
  console.log(`🎯 ${suggestion.explanation}`);
  console.log(`\n💡 Suggested command:`);
  console.log(`   ${suggestion.command}`);
  
  if (suggestion.alternatives.length > 0) {
    console.log(`\n🔄 Alternatives:`);
    suggestion.alternatives.forEach(alt => console.log(`   - ${alt}`));
  }
  
  // If not dry-run, execute the command
  if (!flags['dry-run']) {
    console.log('\n🚀 Executing...\n');
    
    // Extract the actual command parts
    const commandParts = suggestion.command.split(' ');
    const claudeFlowIndex = commandParts.indexOf('./claude-flow');
    
    if (claudeFlowIndex >= 0) {
      // Get command after ./claude-flow
      const subCommand = commandParts[claudeFlowIndex + 1];
      const subSubCommand = commandParts[claudeFlowIndex + 2];
      
      // Import and execute the command
      try {
        if (subCommand === 'sparc') {
          const { sparcCommand } = await import('./sparc.js');
          await sparcCommand(commandParts.slice(claudeFlowIndex + 2), flags);
        } else if (subCommand === 'swarm') {
          const { swarmCommand } = await import('./swarm.js');
          await swarmCommand(commandParts.slice(claudeFlowIndex + 2), flags);
        }
      } catch (error) {
        console.error('Error executing command:', error.message);
      }
    }
  } else {
    console.log('\n(Dry run - command not executed)');
  }
}