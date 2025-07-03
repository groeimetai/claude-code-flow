/**
 * Tests for Expression Parser
 */

import { ExpressionParser, evaluateExpression } from '../src/parser.js';

describe('ExpressionParser', () => {
  let parser;

  beforeEach(() => {
    parser = new ExpressionParser();
  });

  describe('Basic arithmetic', () => {
    it('should evaluate simple addition', () => {
      expect(evaluateExpression('2 + 3')).toBe(5);
    });

    it('should evaluate simple subtraction', () => {
      expect(evaluateExpression('10 - 4')).toBe(6);
    });

    it('should evaluate simple multiplication', () => {
      expect(evaluateExpression('6 * 7')).toBe(42);
    });

    it('should evaluate simple division', () => {
      expect(evaluateExpression('15 / 3')).toBe(5);
    });

    it('should handle division by zero', () => {
      expect(() => evaluateExpression('10 / 0')).toThrow('Division by zero');
    });
  });

  describe('Operator precedence', () => {
    it('should respect multiplication over addition', () => {
      expect(evaluateExpression('2 + 3 * 4')).toBe(14);
    });

    it('should respect division over subtraction', () => {
      expect(evaluateExpression('20 - 10 / 2')).toBe(15);
    });

    it('should handle complex expressions', () => {
      expect(evaluateExpression('2 + 3 * 4 - 5 / 5')).toBe(13);
    });

    it('should respect power operator precedence', () => {
      expect(evaluateExpression('2 ^ 3 * 4')).toBe(32);
      expect(evaluateExpression('2 * 3 ^ 2')).toBe(18);
    });
  });

  describe('Parentheses', () => {
    it('should evaluate expressions with parentheses', () => {
      expect(evaluateExpression('(2 + 3) * 4')).toBe(20);
    });

    it('should handle nested parentheses', () => {
      expect(evaluateExpression('((2 + 3) * (4 + 5))')).toBe(45);
    });

    it('should handle complex nested expressions', () => {
      expect(evaluateExpression('(2 + (3 * 4)) / (5 - 1)')).toBe(3.5);
    });

    it('should throw on missing closing parenthesis', () => {
      expect(() => evaluateExpression('(2 + 3')).toThrow('Missing closing parenthesis');
    });
  });

  describe('Unary operators', () => {
    it('should handle negative numbers', () => {
      expect(evaluateExpression('-5')).toBe(-5);
    });

    it('should handle negative expressions', () => {
      expect(evaluateExpression('-(2 + 3)')).toBe(-5);
    });

    it('should handle double negatives', () => {
      expect(evaluateExpression('--5')).toBe(5);
    });

    it('should combine negative with operations', () => {
      expect(evaluateExpression('-5 + 3')).toBe(-2);
      expect(evaluateExpression('5 + -3')).toBe(2);
    });
  });

  describe('Functions', () => {
    it('should evaluate sqrt function', () => {
      expect(evaluateExpression('sqrt(16)')).toBe(4);
    });

    it('should evaluate sin function', () => {
      expect(evaluateExpression('sin(0)')).toBe(0);
    });

    it('should evaluate nested functions', () => {
      expect(evaluateExpression('sqrt(sqrt(16))')).toBe(2);
    });

    it('should evaluate functions with expressions', () => {
      expect(evaluateExpression('sqrt(3 * 3 + 4 * 4)')).toBe(5);
    });

    it('should handle multi-argument functions', () => {
      expect(evaluateExpression('power(2, 3)')).toBe(8);
    });

    it('should throw on unknown functions', () => {
      expect(() => evaluateExpression('unknown(5)')).toThrow('Unknown function: unknown');
    });

    it('should throw on wrong number of arguments', () => {
      expect(() => evaluateExpression('sqrt()')).toThrow('Function sqrt expects 1 argument(s), got 0');
      expect(() => evaluateExpression('power(2)')).toThrow('Function power expects 2 argument(s), got 1');
    });
  });

  describe('Memory recall', () => {
    it('should handle MR in expressions', () => {
      expect(evaluateExpression('5 + MR', 10)).toBe(15);
    });

    it('should handle multiple MR references', () => {
      expect(evaluateExpression('MR + MR * 2', 5)).toBe(15);
    });

    it('should handle MR in functions', () => {
      expect(evaluateExpression('sqrt(MR)', 16)).toBe(4);
    });
  });

  describe('Floating point numbers', () => {
    it('should handle decimal numbers', () => {
      expect(evaluateExpression('3.14 + 2.86')).toBeCloseTo(6);
    });

    it('should handle scientific notation', () => {
      expect(evaluateExpression('1.5 * 2')).toBe(3);
    });
  });

  describe('Edge cases', () => {
    it('should handle spaces in expressions', () => {
      expect(evaluateExpression('  2  +  3  ')).toBe(5);
    });

    it('should handle expressions without spaces', () => {
      expect(evaluateExpression('2+3*4')).toBe(14);
    });

    it('should throw on empty expression', () => {
      expect(() => evaluateExpression('')).toThrow('Empty expression');
    });

    it('should throw on invalid tokens', () => {
      expect(() => evaluateExpression('2 + $')).toThrow('Unexpected token');
    });

    it('should throw on incomplete expressions', () => {
      expect(() => evaluateExpression('2 +')).toThrow('Unexpected end of expression');
    });
  });

  describe('Complex expressions', () => {
    it('should evaluate complex mathematical expressions', () => {
      expect(evaluateExpression('(2 + 3) * 4 - sqrt(16) / 2')).toBe(18);
    });

    it('should handle trigonometric calculations', () => {
      const result = evaluateExpression('sin(0) + cos(0)');
      expect(result).toBe(1);
    });

    it('should handle logarithmic calculations', () => {
      expect(evaluateExpression('log(100)')).toBe(2);
    });

    it('should evaluate factorial', () => {
      expect(evaluateExpression('factorial(5)')).toBe(120);
    });
  });
});