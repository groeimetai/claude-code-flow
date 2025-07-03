/**
 * CLI Usage Examples
 * 
 * This file demonstrates various command-line usage patterns
 */

console.log('=== Calculator CLI Usage Examples ===\n');

console.log('1. Basic Operations:');
console.log('   $ calculator add 5 3');
console.log('   $ calculator subtract 10 4');
console.log('   $ calculator multiply 6 7');
console.log('   $ calculator divide 20 4');
console.log();

console.log('2. Expression Evaluation:');
console.log('   $ calculator eval "2 + 3 * 4"');
console.log('   $ calculator eval "(5 + 3) * 2"');
console.log('   $ calculator eval "sqrt(16) + 2^3"');
console.log('   $ calculator eval "sin(3.14159/2)"');
console.log();

console.log('3. Interactive Mode:');
console.log('   $ calculator interactive');
console.log('   > 5 + 3');
console.log('   8');
console.log('   > sqrt(144)');
console.log('   12');
console.log('   > exit');
console.log();

console.log('4. Configuration Options:');
console.log('   $ calculator --precision 2 eval "22/7"');
console.log('   $ calculator --no-color eval "1+1"');
console.log('   $ calculator --log-level debug eval "log(100)"');
console.log('   $ calculator --config ~/.calculatorrc eval "2*3"');
console.log();

console.log('5. History Commands:');
console.log('   $ calculator history');
console.log('   $ calculator history --last 10');
console.log('   $ calculator history --export history.json');
console.log('   $ calculator history --clear');
console.log();

console.log('6. Memory Operations:');
console.log('   $ calculator memory store 42');
console.log('   $ calculator memory recall');
console.log('   $ calculator memory add 8');
console.log('   $ calculator memory clear');
console.log('   $ calculator eval "10 + MR"');
console.log();

console.log('7. Advanced Features:');
console.log('   $ calculator --benchmark eval "factorial(10)"');
console.log('   $ calculator --timeout 1000 eval "complex_expression"');
console.log('   $ calculator --thousands-separator eval "1000000 / 3"');
console.log('   $ calculator --scientific eval "1.23e10 * 2"');
console.log();

console.log('8. Environment Variables:');
console.log('   $ CALC_PRECISION=15 calculator eval "pi"');
console.log('   $ CALC_LOG_LEVEL=debug calculator eval "1+1"');
console.log('   $ CALC_COLOR_OUTPUT=false calculator eval "sqrt(2)"');
console.log();

console.log('9. Piping and Scripting:');
console.log('   $ echo "2 + 2" | calculator eval');
console.log('   $ calculator eval "1+1" > result.txt');
console.log('   $ cat expressions.txt | calculator eval --batch');
console.log();

console.log('10. Help and Version:');
console.log('   $ calculator --help');
console.log('   $ calculator --version');
console.log('   $ calculator help eval');
console.log('   $ calculator help operations');
console.log();

console.log('For more information, see the documentation or run: calculator --help');