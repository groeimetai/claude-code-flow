#!/usr/bin/env node

/**
 * Test script for interactive mode
 */

import { spawn } from 'child_process';

const calculator = spawn('node', ['index.js', 'interactive'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';

calculator.stdout.on('data', (data) => {
  output += data.toString();
  console.log('Output:', data.toString());
});

calculator.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

// Test sequence
const commands = [
  '2 + 3\n',
  'sqrt(16)\n',
  'sin(0)\n',
  'help\n',
  'exit\n'
];

let commandIndex = 0;

// Send commands with delay
function sendNextCommand() {
  if (commandIndex < commands.length) {
    console.log('Sending:', commands[commandIndex].trim());
    calculator.stdin.write(commands[commandIndex]);
    commandIndex++;
    setTimeout(sendNextCommand, 500);
  }
}

// Start after initial prompt
setTimeout(sendNextCommand, 1000);

calculator.on('close', (code) => {
  console.log(`Calculator exited with code ${code}`);
  
  // Verify expected outputs
  const expectedOutputs = [
    'Interactive Calculator',
    '= 5',
    '= 4',
    '= 0',
    'Commands:'
  ];
  
  let allFound = true;
  for (const expected of expectedOutputs) {
    if (!output.includes(expected)) {
      console.error(`Missing expected output: "${expected}"`);
      allFound = false;
    }
  }
  
  if (allFound) {
    console.log('✓ All interactive tests passed!');
    process.exit(0);
  } else {
    console.error('✗ Some interactive tests failed');
    process.exit(1);
  }
});