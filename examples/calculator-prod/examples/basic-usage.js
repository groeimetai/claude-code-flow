/**
 * Basic Calculator Usage Examples
 */

import { Calculator } from '../src/calculator.js';
import { config } from '../src/config.js';
import { initLogger } from '../src/logger.js';

// Initialize configuration
config.load({ logLevel: 'info' });

// Initialize logger
const logger = initLogger(config.getAll());

// Create calculator instance
const calc = new Calculator();

console.log('=== Basic Calculator Usage Examples ===\n');

// Example 1: Basic arithmetic operations
console.log('1. Basic Arithmetic:');
console.log('   5 + 3 =', calc.calculate('add', [5, 3]));
console.log('   10 - 4 =', calc.calculate('subtract', [10, 4]));
console.log('   6 * 7 =', calc.calculate('multiply', [6, 7]));
console.log('   20 / 4 =', calc.calculate('divide', [20, 4]));
console.log();

// Example 2: Expression evaluation
console.log('2. Expression Evaluation:');
console.log('   "2 + 3 * 4" =', calc.evaluateExpression('2 + 3 * 4'));
console.log('   "(2 + 3) * 4" =', calc.evaluateExpression('(2 + 3) * 4'));
console.log('   "2^3 + sqrt(16)" =', calc.evaluateExpression('2^3 + sqrt(16)'));
console.log();

// Example 3: Scientific functions
console.log('3. Scientific Functions:');
console.log('   sin(pi/2) =', calc.evaluateExpression('sin(1.5708)'));
console.log('   log(100) =', calc.evaluateExpression('log(100)'));
console.log('   sqrt(144) =', calc.evaluateExpression('sqrt(144)'));
console.log();

// Example 4: Memory operations
console.log('4. Memory Operations:');
const memory = calc.getMemoryManager();
memory.memoryStore(42);
console.log('   Stored in memory: 42');
console.log('   "10 + MR" =', calc.evaluateExpression('10 + MR'));
memory.memoryAdd(8);
console.log('   Added 8 to memory');
console.log('   Memory now contains:', memory.memoryRecall());
console.log();

// Example 5: History
console.log('5. Calculation History:');
const history = calc.getHistory();
console.log('   Total calculations:', history.length);
console.log('   Last result:', calc.getLastResult());
console.log('   Recent calculations:');
history.slice(-3).forEach(entry => {
  console.log(`     ${entry.operands[0]} → ${entry.result}`);
});

// Close logger
logger.close();