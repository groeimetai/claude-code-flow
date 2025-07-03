#!/usr/bin/env -S deno run --allow-all
/**
 * Main Deno entry point for simple commands
 */

import { printSuccess, printError } from './utils.js';
import { sparcCommand } from './simple-commands/sparc.js';
import { swarmCommand } from './simple-commands/swarm.js';
import { achieveCommand } from './simple-commands/achieve.js';

async function main() {
  const args = Deno.args;
  const command = args[0];
  const subArgs = args.slice(1);
  
  // Parse flags
  const flags = {};
  const cleanArgs = [];
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const flagName = arg.substring(2);
      const nextArg = args[i + 1];
      
      if (nextArg && !nextArg.startsWith('--')) {
        flags[flagName] = nextArg;
        i++;
      } else {
        flags[flagName] = true;
      }
    } else if (arg.startsWith('-')) {
      const flagName = arg.substring(1);
      flags[flagName] = true;
    } else {
      cleanArgs.push(arg);
    }
  }
  
  // Handle commands
  switch (command) {
    case 'sparc':
      await sparcCommand(cleanArgs, flags);
      break;
      
    case 'swarm':
      await swarmCommand(cleanArgs, flags);
      break;
      
    case 'achieve':
      await achieveCommand(cleanArgs, flags);
      break;
      
    case '--version':
    case '-v':
      console.log('v2.0.0-enhanced');
      break;
      
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      showHelp();
      break;
      
    default:
      // Check if it's a SPARC task (direct task without 'sparc' prefix)
      if (!command.startsWith('-')) {
        // Treat as SPARC orchestrator task
        await sparcCommand(args, flags);
      } else {
        printError(`Unknown command: ${command}`);
        console.log('Run "claude-flow help" for usage information');
      }
  }
}

function showHelp() {
  console.log(`
🧠 Claude-Flow v2.0.0-enhanced - Advanced AI Agent Orchestration System

USAGE:
  claude-flow <command> [options]

QUICK START:
  claude-flow "Build a REST API"         # Use SPARC orchestrator
  claude-flow sparc modes                # List SPARC modes
  claude-flow swarm "Research topic"     # Multi-agent swarm
  claude-flow achieve "Create trading bot" # Autonomous goal achievement

COMMANDS:
  sparc <task>         SPARC development orchestration
  swarm <objective>    Multi-agent swarm coordination
  achieve <goal>       Autonomous goal achievement loop
  help                 Show this help message
  
For detailed help on any command:
  claude-flow help <command>
  claude-flow <command> --help

Documentation: https://github.com/ruvnet/claude-code-flow
`);
}

// Run main
if (import.meta.main) {
  main().catch((error) => {
    printError(`Fatal error: ${error.message}`);
    if (Deno.env.get('VERBOSE')) {
      console.error(error.stack);
    }
    Deno.exit(1);
  });
}