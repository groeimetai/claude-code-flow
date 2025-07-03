#!/usr/bin/env node

// Node.js entry point for npx compatibility
// This file allows claude-flow to work with: npx claude-flow@latest <command>

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if we should use the bin script instead
function shouldUseBinScript() {
  const command = process.argv[2];
  const denoCommands = ['achieve', 'sparc', 'swarm', 'memory'];
  
  // Check if Deno is available
  try {
    execSync('which deno', { stdio: 'ignore' });
    // Check if command requires Deno
    return denoCommands.includes(command);
  } catch {
    return false;
  }
}

// If we should use bin script, exec it directly
if (shouldUseBinScript()) {
  const binPath = join(__dirname, 'bin', 'claude-flow');
  if (existsSync(binPath)) {
    const child = spawn(binPath, process.argv.slice(2), {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('exit', (code) => {
      process.exit(code || 0);
    });
    
    child.on('error', (err) => {
      console.error('Failed to execute command:', err);
      process.exit(1);
    });
    
    return;
  }
}

// Quick check for achieve command
async function handleAchieve() {
  if (process.argv[2] === 'achieve') {
    // Handle achieve command directly
    try {
      const module = await import('./src/cli/simple-commands/achieve-real.js');
      const achieveCommand = module.default;
      const goal = process.argv[3];
      const options = {
        verbose: process.argv.includes('--verbose'),
        monitor: process.argv.includes('--monitor'),
        parallel: process.argv.includes('--parallel'),
        dryRun: process.argv.includes('--dry-run'),
        noEvolve: process.argv.includes('--no-evolve'),
        maxIterations: process.argv.find((arg, i) => process.argv[i-1] === '--max-iterations') || '10',
        convergence: process.argv.find((arg, i) => process.argv[i-1] === '--convergence') || '0.95',
        budget: process.argv.find((arg, i) => process.argv[i-1] === '--budget'),
        deadline: process.argv.find((arg, i) => process.argv[i-1] === '--deadline')
      };
      
      if (!goal) {
        console.error('❌ Please provide a goal for the achieve command');
        console.error('Example: claude-flow achieve "Create a trading bot"');
        process.exit(1);
      }
      
      await achieveCommand.action(goal, options);
      process.exit(0);
    } catch (err) {
      console.error('❌ Failed to load achieve command:', err.message);
      process.exit(1);
    }
  }
}

// Check for achieve command first
await handleAchieve();

// Check if we have the compiled version
const compiledPath = join(__dirname, 'dist', 'cli', 'simple-cli.js');
const sourcePath = join(__dirname, 'src', 'cli', 'simple-cli.ts');

// Check which version exists
if (existsSync(compiledPath)) {
  // Use the compiled JavaScript version
  const cliProcess = spawn('node', [compiledPath, ...process.argv.slice(2)], {
    stdio: 'inherit'
  });
  
  cliProcess.on('error', (error) => {
    console.error('❌ Failed to run claude-flow:', error.message);
    process.exit(1);
  });
  
  cliProcess.on('exit', (code) => {
    process.exit(code || 0);
  });
} else if (existsSync(sourcePath)) {
  // Run TypeScript version with tsx
  console.log('📦 Running TypeScript version...');
  
  const tsxProcess = spawn('npx', ['tsx', sourcePath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: true
  });
  
  tsxProcess.on('error', (error) => {
    console.error('❌ Failed to run claude-flow:', error.message);
    console.log('\n💡 Try installing globally: npm install -g claude-flow');
    process.exit(1);
  });
  
  tsxProcess.on('exit', (code) => {
    process.exit(code || 0);
  });
} else {
  console.error('❌ Error: Could not find claude-flow implementation files');
  console.error('Expected either:');
  console.error(`  - ${compiledPath}`);
  console.error(`  - ${sourcePath}`);
  process.exit(1);
}