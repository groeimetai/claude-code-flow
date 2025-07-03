/**
 * Core Calculator Engine
 * 
 * This module contains the main calculator logic and operations.
 * It provides a clean API for performing mathematical calculations.
 */

import { operations } from './operations.js';
import { evaluateExpression, OptimizedExpressionParser } from './parser-optimized.js';
import { memoryManager } from './memory.js';
import { historyManager } from './history.js';
import { InputSanitizer } from './errors.js';

export class Calculator {
  constructor(config = {}) {
    this.config = config;
    this.history = [];
    this.lastResult = 0;
    this.historyManager = historyManager;
  }

  /**
   * Perform a calculation
   * @param {string} operation - The operation to perform
   * @param {number[]} operands - The operands for the operation
   * @returns {number} The result of the calculation
   */
  calculate(operation, operands) {
    // Validate operation
    const sanitizedOp = InputSanitizer.validateOperation(operation);
    
    if (!operations[sanitizedOp]) {
      throw new Error(`Unknown operation: ${operation}`);
    }

    // Validate operands
    const sanitizedOperands = operands.map(op => InputSanitizer.sanitizeNumber(op));
    
    const result = operations[sanitizedOp](...sanitizedOperands);
    
    // Store in history
    const entry = {
      operation: sanitizedOp,
      operands: sanitizedOperands,
      result
    };
    
    this.history.push({
      ...entry,
      timestamp: new Date()
    });
    
    // Also store in history manager
    this.historyManager.add(entry);
    
    this.lastResult = result;
    return result;
  }

  /**
   * Get calculation history
   * @returns {Array} Array of previous calculations
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Clear calculation history
   */
  clearHistory() {
    this.history = [];
    this.lastResult = 0;
  }

  /**
   * Get the last result
   * @returns {number} The last calculation result
   */
  getLastResult() {
    return this.lastResult;
  }

  /**
   * Evaluate a mathematical expression
   * @param {string} expression - The expression to evaluate
   * @returns {number} The result of the expression
   */
  evaluateExpression(expression) {
    // Sanitize expression
    const sanitized = InputSanitizer.sanitizeExpression(expression);
    
    const result = evaluateExpression(sanitized, memoryManager.memoryRecall());
    
    // Store in history
    const entry = {
      operation: 'expression',
      operands: [sanitized],
      result
    };
    
    this.history.push({
      ...entry,
      timestamp: new Date()
    });
    
    // Also store in history manager
    this.historyManager.add(entry);
    
    this.lastResult = result;
    return result;
  }

  /**
   * Get memory manager instance
   * @returns {MemoryManager} The memory manager
   */
  getMemoryManager() {
    return memoryManager;
  }

  /**
   * Format result based on configuration
   * @param {number} result - The result to format
   * @returns {string} Formatted result
   */
  formatResult(result) {
    const precision = this.config.precision || 10;
    const useScientific = this.config.scientificNotation || false;
    const locale = this.config.locale || 'en-US';
    const thousandsSep = this.config.thousandsSeparator !== false;
    
    if (useScientific && (Math.abs(result) > 1e6 || Math.abs(result) < 1e-6)) {
      return result.toExponential(precision);
    }
    
    if (thousandsSep) {
      return result.toLocaleString(locale, {
        maximumFractionDigits: precision,
        minimumFractionDigits: 0
      });
    }
    
    return result.toFixed(precision).replace(/\.?0+$/, '');
  }

  /**
   * Check if expression is valid
   * @param {string} expression - Expression to validate
   * @returns {boolean} True if valid
   */
  isValidExpression(expression) {
    try {
      InputSanitizer.sanitizeExpression(expression);
      // Try to tokenize without evaluating
      const parser = new OptimizedExpressionParser();
      parser.tokenize(expression);
      return true;
    } catch {
      return false;
    }
  }
}