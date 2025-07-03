/**
 * Interactive REPL Mode for Calculator
 * 
 * Provides an interactive Read-Eval-Print-Loop interface with:
 * - Expression history with arrow key navigation
 * - Auto-completion for functions and commands
 * - Syntax highlighting
 * - Multi-line expression support
 */

import readline from 'readline';
import chalk from 'chalk';
import { Calculator } from './calculator.js';
import { evaluateExpression } from './parser.js';
import { memoryManager } from './memory.js';
import { getAvailableOperations } from './operations.js';

export class InteractiveCalculator {
  constructor() {
    this.calculator = new Calculator();
    this.history = [];
    this.historyIndex = -1;
    this.multilineBuffer = '';
    this.isMultiline = false;
    this.lastResult = 0;
    
    // Available commands
    this.commands = {
      help: 'Show available commands and functions',
      exit: 'Exit interactive mode',
      quit: 'Exit interactive mode',
      clear: 'Clear the screen',
      history: 'Show calculation history',
      'memory': 'Show current memory values',
      'mc': 'Clear memory',
      'ms': 'Store last result in memory',
      'm+': 'Add last result to memory',
      'm-': 'Subtract last result from memory',
      'mr': 'Recall memory value',
      'ans': 'Use last result',
      'functions': 'List available functions',
      'mode': 'Toggle multiline mode'
    };
    
    // Combine functions and commands for autocomplete
    this.completions = [
      ...Object.keys(this.commands),
      ...getAvailableOperations(),
      'MR', 'ans', 'pi', 'e'
    ];
  }

  /**
   * Start the interactive REPL
   */
  async start() {
    console.log(chalk.cyan('=== Interactive Calculator ==='));
    console.log(chalk.gray('Type "help" for available commands, "exit" to quit'));
    console.log(chalk.gray('Use up/down arrows to navigate history'));
    console.log(chalk.gray('Tab for auto-completion\n'));
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.green('> '),
      completer: (line) => this.completer(line),
      historySize: 100
    });
    
    // Handle arrow keys for history navigation
    rl.on('line', (input) => {
      this.handleInput(input, rl);
    });
    
    // Handle Ctrl+C
    rl.on('SIGINT', () => {
      console.log(chalk.yellow('\nUse "exit" to quit'));
      rl.prompt();
    });
    
    rl.prompt();
  }

  /**
   * Auto-completion handler
   * @param {string} line - Current input line
   * @returns {Array} Completion results
   */
  completer(line) {
    const hits = this.completions.filter((c) => c.startsWith(line));
    return [hits.length ? hits : this.completions, line];
  }

  /**
   * Handle user input
   * @param {string} input - User input
   * @param {readline.Interface} rl - Readline interface
   */
  handleInput(input, rl) {
    const trimmed = input.trim();
    
    // Handle empty input
    if (!trimmed) {
      rl.prompt();
      return;
    }
    
    // Add to history
    if (trimmed !== this.history[this.history.length - 1]) {
      this.history.push(trimmed);
    }
    this.historyIndex = this.history.length;
    
    // Handle multiline mode
    if (this.isMultiline) {
      if (trimmed === ';;') {
        this.isMultiline = false;
        const expression = this.multilineBuffer.trim();
        this.multilineBuffer = '';
        if (expression) {
          this.evaluateExpression(expression, rl);
        }
        rl.setPrompt(chalk.green('> '));
      } else {
        this.multilineBuffer += input + ' ';
        rl.setPrompt(chalk.green('... '));
      }
      rl.prompt();
      return;
    }
    
    // Check for multiline start
    if (trimmed.endsWith('\\')) {
      this.isMultiline = true;
      this.multilineBuffer = trimmed.slice(0, -1) + ' ';
      rl.setPrompt(chalk.green('... '));
      rl.prompt();
      return;
    }
    
    // Handle commands
    const lowerInput = trimmed.toLowerCase();
    
    switch (lowerInput) {
      case 'help':
        this.showHelp();
        break;
      
      case 'exit':
      case 'quit':
        console.log(chalk.cyan('Goodbye!'));
        rl.close();
        process.exit(0);
        return;
      
      case 'clear':
        console.clear();
        console.log(chalk.cyan('=== Interactive Calculator ==='));
        break;
      
      case 'history':
        this.showHistory();
        break;
      
      case 'memory':
        this.showMemory();
        break;
      
      case 'mc':
        memoryManager.memoryClear();
        console.log(chalk.green('Memory cleared'));
        break;
      
      case 'ms':
        memoryManager.memoryStore(this.lastResult);
        console.log(chalk.green(`Stored ${this.lastResult} in memory`));
        break;
      
      case 'm+':
        const newAdd = memoryManager.memoryAdd(this.lastResult);
        console.log(chalk.green(`Added ${this.lastResult} to memory. Memory = ${newAdd}`));
        break;
      
      case 'm-':
        const newSub = memoryManager.memorySubtract(this.lastResult);
        console.log(chalk.green(`Subtracted ${this.lastResult} from memory. Memory = ${newSub}`));
        break;
      
      case 'mr':
        const memValue = memoryManager.memoryRecall();
        console.log(chalk.cyan(`Memory value: ${memValue}`));
        break;
      
      case 'functions':
        this.showFunctions();
        break;
      
      case 'mode':
        console.log(chalk.yellow('Enter multiline mode by ending a line with \\'));
        console.log(chalk.yellow('Exit multiline mode by entering ;; on a new line'));
        break;
      
      default:
        // Try to evaluate as expression
        this.evaluateExpression(trimmed, rl);
    }
    
    rl.prompt();
  }

  /**
   * Evaluate a mathematical expression
   * @param {string} expression - Expression to evaluate
   * @param {readline.Interface} rl - Readline interface
   */
  evaluateExpression(expression, rl) {
    try {
      // Replace special variables
      let processedExpr = expression
        .replace(/\bans\b/gi, this.lastResult.toString())
        .replace(/\bpi\b/gi, Math.PI.toString())
        .replace(/\be\b/gi, Math.E.toString());
      
      // Check if it's a simple operation command
      const simpleOpMatch = expression.match(/^(\w+)\s+(.+)$/);
      if (simpleOpMatch && getAvailableOperations().includes(simpleOpMatch[1])) {
        const [, op, args] = simpleOpMatch;
        const numbers = args.split(/\s+/).map(n => {
          if (n.toLowerCase() === 'ans') return this.lastResult;
          if (n.toLowerCase() === 'mr') return memoryManager.memoryRecall();
          return parseFloat(n);
        });
        
        const result = this.calculator.calculate(op, numbers);
        this.lastResult = result;
        console.log(chalk.cyan('= ') + chalk.green(result));
      } else {
        // Parse as expression
        const result = evaluateExpression(processedExpr, memoryManager.memoryRecall());
        this.lastResult = result;
        
        // Store in calculator history
        this.calculator.history.push({
          operation: 'expression',
          operands: [expression],
          result,
          timestamp: new Date()
        });
        
        console.log(chalk.cyan('= ') + chalk.green(result));
      }
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(chalk.cyan('\n=== Help ==='));
    console.log(chalk.white('Commands:'));
    Object.entries(this.commands).forEach(([cmd, desc]) => {
      console.log(chalk.yellow(`  ${cmd.padEnd(10)} `) + chalk.gray(desc));
    });
    
    console.log(chalk.white('\nSpecial values:'));
    console.log(chalk.yellow('  ans        ') + chalk.gray('Last result'));
    console.log(chalk.yellow('  MR         ') + chalk.gray('Memory recall'));
    console.log(chalk.yellow('  pi         ') + chalk.gray('π (3.14159...)'));
    console.log(chalk.yellow('  e          ') + chalk.gray('Euler\'s number (2.71828...)'));
    
    console.log(chalk.white('\nExamples:'));
    console.log(chalk.gray('  2 + 3 * 4'));
    console.log(chalk.gray('  (2 + 3) * 4'));
    console.log(chalk.gray('  sin(pi/2)'));
    console.log(chalk.gray('  sqrt(ans)'));
    console.log(chalk.gray('  2^8 + MR'));
    console.log(chalk.cyan('============\n'));
  }

  /**
   * Show calculation history
   */
  showHistory() {
    const calcHistory = this.calculator.getHistory();
    
    if (calcHistory.length === 0) {
      console.log(chalk.yellow('No calculation history'));
      return;
    }
    
    console.log(chalk.cyan('\n=== Calculation History ==='));
    calcHistory.slice(-10).forEach((entry, index) => {
      const { operation, operands, result } = entry;
      if (operation === 'expression') {
        console.log(chalk.gray(`${index + 1}. `) + chalk.white(operands[0]) + chalk.cyan(' = ') + chalk.green(result));
      } else {
        console.log(chalk.gray(`${index + 1}. `) + chalk.white(`${operation}(${operands.join(', ')})`) + chalk.cyan(' = ') + chalk.green(result));
      }
    });
    console.log(chalk.cyan('========================\n'));
  }

  /**
   * Show memory values
   */
  showMemory() {
    const memory = memoryManager.getAllMemory();
    
    console.log(chalk.cyan('\n=== Memory ==='));
    Object.entries(memory).forEach(([slot, value]) => {
      console.log(chalk.yellow(`  ${slot.padEnd(10)} `) + chalk.green(value));
    });
    console.log(chalk.cyan('=============\n'));
  }

  /**
   * Show available functions
   */
  showFunctions() {
    const operations = getAvailableOperations();
    
    console.log(chalk.cyan('\n=== Available Functions ==='));
    operations.forEach(op => {
      console.log(chalk.yellow(`  ${op}`));
    });
    console.log(chalk.cyan('========================\n'));
  }
}

/**
 * Start interactive mode
 */
export async function startInteractiveMode() {
  const calculator = new InteractiveCalculator();
  await calculator.start();
}