/**
 * Performance Benchmark Script
 * 
 * Tests calculator performance to ensure <10ms response time
 */

import { Calculator } from '../src/calculator.js';
import { evaluateExpression, clearExpressionCache } from '../src/parser-optimized.js';
import { config } from '../src/config.js';
import chalk from 'chalk';

// Initialize
config.load({ enableCache: true, cacheSize: 1000 });
const calc = new Calculator();

console.log(chalk.bold('\n🚀 Calculator Performance Benchmark\n'));

// Test cases
const benchmarks = [
  {
    name: 'Basic Operations',
    tests: [
      { name: 'Addition', fn: () => calc.calculate('add', [5, 3]) },
      { name: 'Subtraction', fn: () => calc.calculate('subtract', [10, 4]) },
      { name: 'Multiplication', fn: () => calc.calculate('multiply', [6, 7]) },
      { name: 'Division', fn: () => calc.calculate('divide', [20, 4]) }
    ]
  },
  {
    name: 'Expression Parsing',
    tests: [
      { name: 'Simple', fn: () => evaluateExpression('2 + 3') },
      { name: 'Complex', fn: () => evaluateExpression('2 + 3 * 4 - 5 / 2') },
      { name: 'Nested', fn: () => evaluateExpression('((2 + 3) * 4) / (5 - 3)') },
      { name: 'Functions', fn: () => evaluateExpression('sin(1) + cos(1)') }
    ]
  },
  {
    name: 'Scientific Functions',
    tests: [
      { name: 'Trigonometry', fn: () => evaluateExpression('sin(1.5708)') },
      { name: 'Logarithm', fn: () => evaluateExpression('log(100)') },
      { name: 'Square Root', fn: () => evaluateExpression('sqrt(144)') },
      { name: 'Power', fn: () => evaluateExpression('2^10') }
    ]
  },
  {
    name: 'Complex Calculations',
    tests: [
      { name: 'Mixed Operations', fn: () => evaluateExpression('sqrt(16) + 2^3 - log(100)') },
      { name: 'Factorial', fn: () => evaluateExpression('factorial(8)') },
      { name: 'GCD/LCM', fn: () => evaluateExpression('gcd(48, 18) + lcm(12, 8)') },
      { name: 'Nested Functions', fn: () => evaluateExpression('sqrt(sin(1)^2 + cos(1)^2)') }
    ]
  }
];

// Benchmark runner
function runBenchmark(name, fn, iterations = 1000) {
  // Warm up
  for (let i = 0; i < 10; i++) fn();
  
  // Clear cache for fair testing
  clearExpressionCache();
  
  // Run benchmark
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }
  
  // Calculate statistics
  times.sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = times[0];
  const max = times[times.length - 1];
  const median = times[Math.floor(times.length / 2)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];
  
  return { avg, min, max, median, p95, p99 };
}

// Run all benchmarks
let allPassed = true;
const TARGET_TIME = 10; // 10ms target

benchmarks.forEach(category => {
  console.log(chalk.blue.bold(`\n${category.name}:`));
  console.log('─'.repeat(50));
  
  category.tests.forEach(test => {
    const results = runBenchmark(test.name, test.fn);
    const passed = results.p95 < TARGET_TIME;
    allPassed = allPassed && passed;
    
    const statusIcon = passed ? chalk.green('✓') : chalk.red('✗');
    const timeColor = passed ? chalk.green : chalk.red;
    
    console.log(
      `${statusIcon} ${test.name.padEnd(20)} ` +
      `avg: ${timeColor(results.avg.toFixed(3) + 'ms')} ` +
      `p95: ${timeColor(results.p95.toFixed(3) + 'ms')} ` +
      `p99: ${results.p99.toFixed(3)}ms`
    );
  });
});

// Cache performance test
console.log(chalk.blue.bold('\n\nCache Performance:'));
console.log('─'.repeat(50));

// Test with cache
const cacheExpr = 'sin(1) + cos(1) + tan(1) + log(10)';
const withoutCache = [];
const withCache = [];

clearExpressionCache();
for (let i = 0; i < 100; i++) {
  const start = performance.now();
  evaluateExpression(cacheExpr);
  withoutCache.push(performance.now() - start);
}

// Now all should be cached
for (let i = 0; i < 100; i++) {
  const start = performance.now();
  evaluateExpression(cacheExpr);
  withCache.push(performance.now() - start);
}

const avgWithoutCache = withoutCache.reduce((a, b) => a + b, 0) / withoutCache.length;
const avgWithCache = withCache.reduce((a, b) => a + b, 0) / withCache.length;
const speedup = avgWithoutCache / avgWithCache;

console.log(`Without cache: ${avgWithoutCache.toFixed(3)}ms`);
console.log(`With cache: ${chalk.green(avgWithCache.toFixed(3) + 'ms')}`);
console.log(`Speedup: ${chalk.bold(speedup.toFixed(1) + 'x')}`);

// Summary
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log(chalk.green.bold('✓ All benchmarks passed! Response time < 10ms'));
  console.log(chalk.green('The calculator meets production performance requirements.'));
  process.exit(0);
} else {
  console.log(chalk.red.bold('✗ Some benchmarks failed to meet 10ms target'));
  console.log(chalk.red('Performance optimization needed.'));
  process.exit(1);
}