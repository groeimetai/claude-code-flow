/**
 * Enhanced Error Handling System
 * 
 * Provides user-friendly error messages and recovery suggestions
 */

/**
 * Base calculator error class
 */
export class CalculatorError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'CalculatorError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage() {
    return this.message;
  }

  /**
   * Get recovery suggestions
   */
  getRecoverySuggestions() {
    return [];
  }
}

/**
 * Division by zero error
 */
export class DivisionByZeroError extends CalculatorError {
  constructor(expression) {
    super('Cannot divide by zero', 'DIVISION_BY_ZERO', { expression });
    this.name = 'DivisionByZeroError';
  }

  getUserMessage() {
    return 'Division by zero is not allowed in mathematics.';
  }

  getRecoverySuggestions() {
    return [
      'Check your expression for division by zero',
      'Ensure denominators are non-zero',
      'Consider using a small epsilon value instead of zero'
    ];
  }
}

/**
 * Invalid expression error
 */
export class InvalidExpressionError extends CalculatorError {
  constructor(expression, reason) {
    super(`Invalid expression: ${reason}`, 'INVALID_EXPRESSION', { expression, reason });
    this.name = 'InvalidExpressionError';
  }

  getUserMessage() {
    return `Your expression is invalid: ${this.details.reason}`;
  }

  getRecoverySuggestions() {
    const suggestions = ['Check for typos in your expression'];
    
    if (this.details.reason.includes('parenthesis')) {
      suggestions.push('Ensure all parentheses are properly matched');
      suggestions.push('Count opening and closing parentheses');
    }
    
    if (this.details.reason.includes('operator')) {
      suggestions.push('Check that operators are used correctly');
      suggestions.push('Ensure operators have operands on both sides');
    }
    
    if (this.details.reason.includes('function')) {
      suggestions.push('Verify function names are spelled correctly');
      suggestions.push('Check function argument count');
    }
    
    return suggestions;
  }
}

/**
 * Unknown operation error
 */
export class UnknownOperationError extends CalculatorError {
  constructor(operation, availableOps) {
    super(`Unknown operation: ${operation}`, 'UNKNOWN_OPERATION', { operation, availableOps });
    this.name = 'UnknownOperationError';
  }

  getUserMessage() {
    return `'${this.details.operation}' is not a recognized operation.`;
  }

  getRecoverySuggestions() {
    const suggestions = ['Available operations:'];
    
    // Group operations by category
    const basic = ['add', 'subtract', 'multiply', 'divide'];
    const scientific = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'pow'];
    const advanced = ['factorial', 'gcd', 'lcm', 'mod'];
    
    suggestions.push('  Basic: ' + basic.join(', '));
    suggestions.push('  Scientific: ' + scientific.join(', '));
    suggestions.push('  Advanced: ' + advanced.join(', '));
    
    // Suggest similar operations
    const similar = this.findSimilarOperations(this.details.operation);
    if (similar.length > 0) {
      suggestions.push(`Did you mean: ${similar.join(', ')}?`);
    }
    
    return suggestions;
  }

  findSimilarOperations(operation) {
    const allOps = this.details.availableOps || [];
    const similar = [];
    
    allOps.forEach(op => {
      if (this.levenshteinDistance(operation.toLowerCase(), op.toLowerCase()) <= 2) {
        similar.push(op);
      }
    });
    
    return similar;
  }

  levenshteinDistance(a, b) {
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }
}

/**
 * Overflow error
 */
export class OverflowError extends CalculatorError {
  constructor(value) {
    super('Number too large to handle', 'OVERFLOW', { value });
    this.name = 'OverflowError';
  }

  getUserMessage() {
    return 'The result is too large to be represented accurately.';
  }

  getRecoverySuggestions() {
    return [
      'Try breaking down the calculation into smaller parts',
      'Consider using scientific notation',
      'Check if the calculation is correct'
    ];
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends CalculatorError {
  constructor(expression, timeout) {
    super(`Calculation timed out after ${timeout}ms`, 'TIMEOUT', { expression, timeout });
    this.name = 'TimeoutError';
  }

  getUserMessage() {
    return 'The calculation is taking too long and was stopped.';
  }

  getRecoverySuggestions() {
    return [
      'Simplify your expression',
      'Break complex calculations into steps',
      'Check for infinite loops in recursive functions'
    ];
  }
}

/**
 * Input validation error
 */
export class ValidationError extends CalculatorError {
  constructor(input, rules) {
    super(`Invalid input: ${input}`, 'VALIDATION_ERROR', { input, rules });
    this.name = 'ValidationError';
  }

  getUserMessage() {
    return `Invalid input: ${this.details.input}`;
  }

  getRecoverySuggestions() {
    const suggestions = [];
    
    if (this.details.rules.includes('number')) {
      suggestions.push('Input must be a valid number');
    }
    
    if (this.details.rules.includes('positive')) {
      suggestions.push('Input must be positive');
    }
    
    if (this.details.rules.includes('integer')) {
      suggestions.push('Input must be a whole number');
    }
    
    return suggestions;
  }
}

/**
 * Error handler with recovery
 */
export class ErrorHandler {
  constructor(logger) {
    this.logger = logger;
    this.errorHistory = [];
    this.maxHistory = 100;
  }

  /**
   * Handle error with logging and recovery
   */
  handle(error, context = {}) {
    // Log error
    if (this.logger) {
      this.logger.error(error.message, {
        code: error.code,
        details: error.details,
        context
      });
    }

    // Store in history
    this.errorHistory.push({
      error,
      context,
      timestamp: new Date().toISOString()
    });

    // Maintain history size
    if (this.errorHistory.length > this.maxHistory) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistory);
    }

    // Return formatted error response
    return {
      success: false,
      error: {
        message: error.getUserMessage ? error.getUserMessage() : error.message,
        code: error.code || 'UNKNOWN_ERROR',
        suggestions: error.getRecoverySuggestions ? error.getRecoverySuggestions() : []
      }
    };
  }

  /**
   * Get error statistics
   */
  getStats() {
    const stats = {
      total: this.errorHistory.length,
      byCode: {},
      recent: []
    };

    this.errorHistory.forEach(entry => {
      const code = entry.error.code || 'UNKNOWN';
      stats.byCode[code] = (stats.byCode[code] || 0) + 1;
    });

    stats.recent = this.errorHistory.slice(-10).map(entry => ({
      code: entry.error.code,
      message: entry.error.message,
      timestamp: entry.timestamp
    }));

    return stats;
  }

  /**
   * Clear error history
   */
  clearHistory() {
    this.errorHistory = [];
  }
}

/**
 * Input sanitizer
 */
export class InputSanitizer {
  /**
   * Sanitize expression input
   */
  static sanitizeExpression(input) {
    if (typeof input !== 'string') {
      throw new ValidationError(input, ['string']);
    }

    // Remove dangerous characters
    let sanitized = input.replace(/[^\d\s+\-*/()^,.a-zA-Z]/g, '');

    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // Check for common issues
    if (sanitized.length === 0) {
      throw new InvalidExpressionError('', 'Empty expression');
    }

    if (sanitized.length > 1000) {
      throw new InvalidExpressionError(sanitized, 'Expression too long');
    }

    return sanitized;
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input) {
    const num = parseFloat(input);
    
    if (isNaN(num)) {
      throw new ValidationError(input, ['number']);
    }

    if (!isFinite(num)) {
      throw new OverflowError(input);
    }

    return num;
  }

  /**
   * Validate operation name
   */
  static validateOperation(operation) {
    if (typeof operation !== 'string') {
      throw new ValidationError(operation, ['string']);
    }

    // Only allow alphanumeric operation names
    if (!/^[a-zA-Z0-9_]+$/.test(operation)) {
      throw new ValidationError(operation, ['alphanumeric']);
    }

    return operation.toLowerCase();
  }
}

// Export error types
export const ErrorTypes = {
  DIVISION_BY_ZERO: 'DIVISION_BY_ZERO',
  INVALID_EXPRESSION: 'INVALID_EXPRESSION',
  UNKNOWN_OPERATION: 'UNKNOWN_OPERATION',
  OVERFLOW: 'OVERFLOW',
  TIMEOUT: 'TIMEOUT',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
};