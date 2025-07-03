/**
 * Mathematical Operations
 * 
 * This module defines all the mathematical operations supported by the calculator.
 * Each operation is a pure function that takes operands and returns a result.
 */

export const operations = {
  // Basic arithmetic operations
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) {
      throw new Error('Division by zero');
    }
    return a / b;
  },

  // Advanced operations
  power: (base, exponent) => Math.pow(base, exponent),
  sqrt: (n) => {
    if (n < 0) {
      throw new Error('Cannot calculate square root of negative number');
    }
    return Math.sqrt(n);
  },
  factorial: (n) => {
    if (n < 0) {
      throw new Error('Cannot calculate factorial of negative number');
    }
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  },

  // Percentage operations
  percentage: (value, percent) => (value * percent) / 100,
  
  // Trigonometric operations (in radians)
  sin: (n) => Math.sin(n),
  cos: (n) => Math.cos(n),
  tan: (n) => Math.tan(n),

  // Logarithmic operations
  log: (n) => {
    if (n <= 0) {
      throw new Error('Logarithm input must be positive');
    }
    return Math.log10(n);
  },
  ln: (n) => {
    if (n <= 0) {
      throw new Error('Natural logarithm input must be positive');
    }
    return Math.log(n);
  },
  
  // Number theory operations
  gcd: (a, b) => {
    // Greatest Common Divisor using Euclidean algorithm
    a = Math.abs(Math.floor(a));
    b = Math.abs(Math.floor(b));
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  },
  lcm: (a, b) => {
    // Least Common Multiple
    a = Math.abs(Math.floor(a));
    b = Math.abs(Math.floor(b));
    return (a * b) / operations.gcd(a, b);
  }
};

/**
 * Get list of available operations
 * @returns {string[]} Array of operation names
 */
export function getAvailableOperations() {
  return Object.keys(operations);
}

/**
 * Get operation arity (number of arguments)
 * @param {string} operation - Operation name
 * @returns {number} Number of arguments the operation expects
 */
export function getOperationArity(operation) {
  const arityMap = {
    add: 2,
    subtract: 2,
    multiply: 2,
    divide: 2,
    power: 2,
    sqrt: 1,
    factorial: 1,
    percentage: 2,
    sin: 1,
    cos: 1,
    tan: 1,
    log: 1,
    ln: 1,
    gcd: 2,
    lcm: 2
  };
  
  return arityMap[operation] || 0;
}