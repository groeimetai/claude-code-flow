/**
 * CLI Interface for Calculator
 * 
 * This module handles the command-line interface for the calculator application.
 * It uses Commander.js for parsing commands and Chalk for colorful output.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { Calculator } from './calculator.js';
import { getAvailableOperations, getOperationArity } from './operations.js';
import { evaluateExpression } from './parser.js';
import { memoryManager } from './memory.js';
import { startInteractiveMode } from './interactive.js';

const calculator = new Calculator();

/**
 * Format result for display
 * @param {number} result - The calculation result
 * @returns {string} Formatted result
 */
function formatResult(result) {
  // Handle special cases
  if (Number.isNaN(result)) {
    return chalk.red('Error: Invalid calculation');
  }
  if (!Number.isFinite(result)) {
    return chalk.yellow('Infinity');
  }
  
  // Format the number nicely
  return chalk.green(result.toString());
}

/**
 * Display calculation history
 */
function displayHistory() {
  const history = calculator.getHistory();
  
  if (history.length === 0) {
    console.log(chalk.yellow('No calculation history available.'));
    return;
  }
  
  console.log(chalk.cyan('\n=== Calculation History ==='));
  history.forEach((entry, index) => {
    const { operation, operands, result, timestamp } = entry;
    const timeStr = new Date(timestamp).toLocaleTimeString();
    console.log(
      chalk.gray(`${index + 1}. [${timeStr}]`) + ' ' +
      chalk.white(`${operation}(${operands.join(', ')}) = `) +
      formatResult(result)
    );
  });
  console.log(chalk.cyan('========================\n'));
}

/**
 * Parse numbers from string arguments
 * @param {string[]} args - String arguments
 * @returns {number[]} Parsed numbers
 */
function parseNumbers(args) {
  return args.map(arg => {
    const num = parseFloat(arg);
    if (Number.isNaN(num)) {
      throw new Error(`Invalid number: ${arg}`);
    }
    return num;
  });
}

/**
 * Create and configure the CLI program
 * @returns {Command} Configured Commander program
 */
export function createProgram() {
  const program = new Command();
  
  program
    .name('calculator')
    .description('A production-ready calculator with CLI interface')
    .version('1.0.0');

  // Add operation commands dynamically
  const operations = getAvailableOperations();
  
  operations.forEach(op => {
    const arity = getOperationArity(op);
    const args = Array(arity).fill(0).map((_, i) => `<num${i + 1}>`).join(' ');
    
    program
      .command(`${op} ${args}`)
      .description(`Perform ${op} operation`)
      .action((...args) => {
        try {
          // Filter out non-string arguments (Command objects)
          const stringArgs = args.filter(arg => typeof arg === 'string');
          const numbers = parseNumbers(stringArgs);
          const result = calculator.calculate(op, numbers);
          console.log(`${chalk.cyan('Result:')} ${formatResult(result)}`);
        } catch (error) {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
      });
  });

  // History command
  program
    .command('history')
    .description('Show calculation history')
    .action(() => {
      displayHistory();
    });

  // Clear history command
  program
    .command('clear')
    .description('Clear calculation history')
    .action(() => {
      calculator.clearHistory();
      console.log(chalk.green('History cleared.'));
    });

  // Interactive mode command
  program
    .command('interactive')
    .description('Start interactive calculator mode')
    .action(async () => {
      await startInteractiveMode();
    });

  // List operations command
  program
    .command('list')
    .description('List all available operations')
    .action(() => {
      console.log(chalk.cyan('\n=== Available Operations ==='));
      operations.forEach(op => {
        const arity = getOperationArity(op);
        console.log(chalk.white(`  ${op}`) + chalk.gray(` (${arity} argument${arity > 1 ? 's' : ''})`));
      });
      console.log(chalk.cyan('=========================\n'));
    });

  // Expression evaluation command
  program
    .command('eval <expression>')
    .description('Evaluate a mathematical expression')
    .action((expression) => {
      try {
        const result = evaluateExpression(expression, memoryManager.memoryRecall());
        console.log(`${chalk.cyan('Result:')} ${formatResult(result)}`);
        
        // Store in calculator history
        calculator.history.push({
          operation: 'expression',
          operands: [expression],
          result,
          timestamp: new Date()
        });
        calculator.lastResult = result;
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  // Memory commands
  program
    .command('memory')
    .description('Show current memory values')
    .action(() => {
      const memory = memoryManager.getAllMemory();
      console.log(chalk.cyan('\n=== Memory Values ==='));
      Object.entries(memory).forEach(([slot, value]) => {
        console.log(chalk.yellow(`  ${slot}:`) + ' ' + chalk.green(value));
      });
      console.log(chalk.cyan('==================\n'));
    });

  program
    .command('m+ <value>')
    .description('Add value to memory')
    .action((value) => {
      try {
        const num = parseFloat(value);
        if (isNaN(num)) throw new Error('Invalid number');
        const result = memoryManager.memoryAdd(num);
        console.log(chalk.green(`Added ${num} to memory. Memory = ${result}`));
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  program
    .command('m- <value>')
    .description('Subtract value from memory')
    .action((value) => {
      try {
        const num = parseFloat(value);
        if (isNaN(num)) throw new Error('Invalid number');
        const result = memoryManager.memorySubtract(num);
        console.log(chalk.green(`Subtracted ${num} from memory. Memory = ${result}`));
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  program
    .command('mc')
    .description('Clear memory')
    .action(() => {
      memoryManager.memoryClear();
      console.log(chalk.green('Memory cleared'));
    });

  program
    .command('mr')
    .description('Recall memory value')
    .action(() => {
      const value = memoryManager.memoryRecall();
      console.log(chalk.cyan('Memory value:') + ' ' + chalk.green(value));
    });

  return program;
}

/**
 * Run the CLI application
 */
export function runCLI() {
  const program = createProgram();
  
  // Show help if no arguments provided
  if (process.argv.length === 2) {
    program.outputHelp();
    return;
  }
  
  program.parse(process.argv);
}