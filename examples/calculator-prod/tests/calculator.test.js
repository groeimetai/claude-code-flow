/**
 * Calculator Core Tests
 * 
 * Tests for the main calculator engine functionality
 */

import { Calculator } from '../src/calculator.js';

describe('Calculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('Basic Operations', () => {
    test('should add two numbers correctly', () => {
      const result = calculator.calculate('add', [5, 3]);
      expect(result).toBe(8);
    });

    test('should subtract two numbers correctly', () => {
      const result = calculator.calculate('subtract', [10, 4]);
      expect(result).toBe(6);
    });

    test('should multiply two numbers correctly', () => {
      const result = calculator.calculate('multiply', [6, 7]);
      expect(result).toBe(42);
    });

    test('should divide two numbers correctly', () => {
      const result = calculator.calculate('divide', [20, 4]);
      expect(result).toBe(5);
    });

    test('should throw error for division by zero', () => {
      expect(() => calculator.calculate('divide', [10, 0])).toThrow('Division by zero');
    });
  });

  describe('Advanced Operations', () => {
    test('should calculate power correctly', () => {
      const result = calculator.calculate('power', [2, 8]);
      expect(result).toBe(256);
    });

    test('should calculate square root correctly', () => {
      const result = calculator.calculate('sqrt', [16]);
      expect(result).toBe(4);
    });

    test('should throw error for negative square root', () => {
      expect(() => calculator.calculate('sqrt', [-4])).toThrow('Cannot calculate square root of negative number');
    });

    test('should calculate factorial correctly', () => {
      expect(calculator.calculate('factorial', [5])).toBe(120);
      expect(calculator.calculate('factorial', [0])).toBe(1);
      expect(calculator.calculate('factorial', [1])).toBe(1);
    });
  });

  describe('History Management', () => {
    test('should maintain calculation history', () => {
      calculator.calculate('add', [5, 3]);
      calculator.calculate('multiply', [4, 2]);
      
      const history = calculator.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].operation).toBe('add');
      expect(history[0].result).toBe(8);
      expect(history[1].operation).toBe('multiply');
      expect(history[1].result).toBe(8);
    });

    test('should clear history', () => {
      calculator.calculate('add', [5, 3]);
      calculator.clearHistory();
      
      expect(calculator.getHistory()).toHaveLength(0);
      expect(calculator.getLastResult()).toBe(0);
    });

    test('should track last result', () => {
      calculator.calculate('add', [5, 3]);
      expect(calculator.getLastResult()).toBe(8);
      
      calculator.calculate('multiply', [2, 5]);
      expect(calculator.getLastResult()).toBe(10);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for unknown operation', () => {
      expect(() => calculator.calculate('unknown', [1, 2])).toThrow('Unknown operation: unknown');
    });
  });
});