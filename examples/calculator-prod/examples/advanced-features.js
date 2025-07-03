/**
 * Advanced Calculator Features Examples
 */

import { Calculator } from '../src/calculator.js';
import { config } from '../src/config.js';
import { historyManager } from '../src/history.js';
import { ErrorHandler, InputSanitizer } from '../src/errors.js';
import { initLogger } from '../src/logger.js';
import { evaluateExpression, getCacheStats, clearExpressionCache } from '../src/parser-optimized.js';

// Initialize with custom configuration
config.load({
  logLevel: 'debug',
  cacheSize: 500,
  precision: 15,
  colorOutput: true
});

const logger = initLogger(config.getAll());
const errorHandler = new ErrorHandler(logger);
const calc = new Calculator();

console.log('=== Advanced Calculator Features ===\n');

// Example 1: Complex expressions with caching
console.log('1. Complex Expressions with Caching:');
const expressions = [
  '(sin(45 * 3.14159 / 180) + cos(45 * 3.14159 / 180))^2',
  'factorial(5) + gcd(48, 18)',
  'log(1000) * ln(2.71828) + sqrt(625)'
];

expressions.forEach(expr => {
  const start = performance.now();
  const result = evaluateExpression(expr);
  const duration = performance.now() - start;
  console.log(`   ${expr}`);
  console.log(`   = ${result} (${duration.toFixed(2)}ms)`);
});

// Test cache performance
console.log('\n   Cache Performance Test:');
const testExpr = 'sin(1) + cos(1) + tan(1)';
const timings = [];

for (let i = 0; i < 5; i++) {
  const start = performance.now();
  evaluateExpression(testExpr);
  timings.push(performance.now() - start);
}

console.log(`   First call: ${timings[0].toFixed(2)}ms`);
console.log(`   Cached calls: ${timings.slice(1).map(t => t.toFixed(2) + 'ms').join(', ')}`);
console.log(`   Cache stats:`, getCacheStats());
console.log();

// Example 2: Error handling with recovery suggestions
console.log('2. Error Handling with Recovery:');
const errorTests = [
  '10 / 0',
  'sin((',
  'unknown(5)',
  '2 + + 3'
];

errorTests.forEach(expr => {
  try {
    InputSanitizer.sanitizeExpression(expr);
    calc.evaluateExpression(expr);
  } catch (error) {
    const response = errorHandler.handle(error, { expression: expr });
    console.log(`   Expression: "${expr}"`);
    console.log(`   Error: ${response.error.message}`);
    if (response.error.suggestions.length > 0) {
      console.log('   Suggestions:');
      response.error.suggestions.forEach(s => console.log(`     - ${s}`));
    }
    console.log();
  }
});

// Example 3: History management and export
console.log('3. History Management:');

// Add some calculations
const calculations = [
  ['add', [100, 200]],
  ['multiply', [15, 8]],
  ['divide', [1000, 25]]
];

calculations.forEach(([op, operands]) => {
  calc.calculate(op, operands);
});

// Get statistics
const stats = historyManager.getStats();
console.log('   History Statistics:');
console.log(`     Total: ${stats.total}`);
console.log(`     Average Result: ${stats.averageResult.toFixed(2)}`);
console.log(`     Min Result: ${stats.minResult}`);
console.log(`     Max Result: ${stats.maxResult}`);
console.log(`     Operations:`, stats.operations);

// Export history
const exportPath = './calculator-history.json';
historyManager.export('json', exportPath);
console.log(`\n   History exported to: ${exportPath}`);
console.log();

// Example 4: Memory slots
console.log('4. Advanced Memory Operations:');
const memory = calc.getMemoryManager();

// Store values in different slots
memory.storeInSlot('x', 10);
memory.storeInSlot('y', 20);
memory.storeInSlot('result', 0);

console.log('   Stored: x=10, y=20');

// Use slots in calculations
const formula = 'sqrt(x^2 + y^2)';
console.log(`   Formula: ${formula}`);

// Simulate slot recall (would need parser enhancement)
const x = memory.recallFromSlot('x');
const y = memory.recallFromSlot('y');
const distance = Math.sqrt(x*x + y*y);
memory.storeInSlot('result', distance);

console.log(`   Result: ${distance}`);
console.log('   All slots:', memory.getAllSlots());
console.log();

// Example 5: Performance monitoring
console.log('5. Performance Monitoring:');
const operations = ['add', 'multiply', 'sin', 'factorial'];
const perfResults = [];

operations.forEach(op => {
  const start = performance.now();
  
  if (op === 'add') calc.calculate('add', [1, 2]);
  else if (op === 'multiply') calc.calculate('multiply', [3, 4]);
  else if (op === 'sin') calc.evaluateExpression('sin(1.5708)');
  else if (op === 'factorial') calc.evaluateExpression('factorial(10)');
  
  const duration = performance.now() - start;
  perfResults.push({ op, duration });
  logger.logPerformance(op, duration);
});

console.log('   Operation Performance:');
perfResults.forEach(({ op, duration }) => {
  console.log(`     ${op}: ${duration.toFixed(3)}ms`);
});

// Clear cache and close
clearExpressionCache();
logger.close();
console.log('\n✓ All advanced features demonstrated successfully!');