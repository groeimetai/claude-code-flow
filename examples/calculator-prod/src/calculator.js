/**
 * Core Calculator Engine
 * 
 * This module contains the main calculator logic and operations.
 * It provides a clean API for performing mathematical calculations.
 */

import { operations } from './operations.js';
import { evaluateExpression } from './parser.js';
import { memoryManager } from './memory.js';

export class Calculator {
  constructor() {
    this.history = [];
    this.lastResult = 0;
  }

  /**
   * Perform a calculation
   * @param {string} operation - The operation to perform
   * @param {number[]} operands - The operands for the operation
   * @returns {number} The result of the calculation
   */
  calculate(operation, operands) {
    if (!operations[operation]) {
      throw new Error(`Unknown operation: ${operation}`);
    }

    const result = operations[operation](...operands);
    
    // Store in history
    this.history.push({
      operation,
      operands,
      result,
      timestamp: new Date()
    });
    
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
    const result = evaluateExpression(expression, memoryManager.memoryRecall());
    
    // Store in history
    this.history.push({
      operation: 'expression',
      operands: [expression],
      result,
      timestamp: new Date()
    });
    
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
}