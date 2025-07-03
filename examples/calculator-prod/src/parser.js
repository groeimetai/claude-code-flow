/**
 * Expression Parser for Calculator
 * 
 * Implements a recursive descent parser that handles mathematical expressions
 * with proper operator precedence (PEMDAS/BODMAS).
 * 
 * Grammar:
 * expression := term (('+' | '-') term)*
 * term := factor (('*' | '/') factor)*
 * factor := power ('^' power)*
 * power := unary | '(' expression ')' | number | function
 * unary := '-' power
 * function := identifier '(' expression (',' expression)* ')'
 * number := [0-9]+ ('.' [0-9]+)?
 */

import { operations, getOperationArity } from './operations.js';

export class ExpressionParser {
  constructor() {
    this.tokens = [];
    this.current = 0;
    this.memory = 0;
  }

  /**
   * Parse and evaluate a mathematical expression
   * @param {string} expression - The expression to parse
   * @param {number} memoryValue - Current memory value for MR
   * @returns {number} The result of the expression
   */
  parse(expression, memoryValue = 0) {
    this.memory = memoryValue;
    this.tokens = this.tokenize(expression);
    this.current = 0;
    
    if (this.tokens.length === 0) {
      throw new Error('Empty expression');
    }
    
    const result = this.parseExpression();
    
    if (this.current < this.tokens.length) {
      throw new Error(`Unexpected token: ${this.tokens[this.current].value}`);
    }
    
    return result;
  }

  /**
   * Tokenize the input expression
   * @param {string} expression - The expression to tokenize
   * @returns {Array} Array of tokens
   */
  tokenize(expression) {
    const tokens = [];
    const regex = /(\d+\.?\d*|[+\-*/()^,]|[a-zA-Z]+|MR)/g;
    let match;
    let lastIndex = 0;
    
    while ((match = regex.exec(expression)) !== null) {
      // Check for invalid characters between matches
      if (match.index > lastIndex) {
        const between = expression.substring(lastIndex, match.index).trim();
        if (between) {
          throw new Error(`Unexpected token: ${between[0]}`);
        }
      }
      lastIndex = regex.lastIndex;
      const value = match[0];
      let type;
      
      if (/^\d+\.?\d*$/.test(value)) {
        type = 'NUMBER';
      } else if (['+', '-', '*', '/', '^'].includes(value)) {
        type = 'OPERATOR';
      } else if (value === '(') {
        type = 'LPAREN';
      } else if (value === ')') {
        type = 'RPAREN';
      } else if (value === ',') {
        type = 'COMMA';
      } else if (value === 'MR') {
        type = 'MEMORY';
      } else if (/^[a-zA-Z]+$/.test(value)) {
        type = 'FUNCTION';
      } else {
        throw new Error(`Invalid token: ${value}`);
      }
      
      tokens.push({ type, value });
    }
    
    // Check for invalid characters after the last match
    if (lastIndex < expression.length) {
      const remaining = expression.substring(lastIndex).trim();
      if (remaining) {
        throw new Error(`Unexpected token: ${remaining[0]}`);
      }
    }
    
    return tokens;
  }

  /**
   * Parse expression (handles + and -)
   */
  parseExpression() {
    let left = this.parseTerm();
    
    while (this.current < this.tokens.length) {
      const token = this.tokens[this.current];
      if (token.type === 'OPERATOR' && (token.value === '+' || token.value === '-')) {
        this.current++;
        const right = this.parseTerm();
        if (token.value === '+') {
          left = left + right;
        } else {
          left = left - right;
        }
      } else {
        break;
      }
    }
    
    return left;
  }

  /**
   * Parse term (handles * and /)
   */
  parseTerm() {
    let left = this.parseFactor();
    
    while (this.current < this.tokens.length) {
      const token = this.tokens[this.current];
      if (token.type === 'OPERATOR' && (token.value === '*' || token.value === '/')) {
        this.current++;
        const right = this.parseFactor();
        if (token.value === '*') {
          left = left * right;
        } else {
          if (right === 0) {
            throw new Error('Division by zero');
          }
          left = left / right;
        }
      } else {
        break;
      }
    }
    
    return left;
  }

  /**
   * Parse factor (handles ^)
   */
  parseFactor() {
    let left = this.parsePower();
    
    while (this.current < this.tokens.length) {
      const token = this.tokens[this.current];
      if (token.type === 'OPERATOR' && token.value === '^') {
        this.current++;
        const right = this.parsePower();
        left = Math.pow(left, right);
      } else {
        break;
      }
    }
    
    return left;
  }

  /**
   * Parse power (handles unary -, parentheses, numbers, functions, and memory)
   */
  parsePower() {
    const token = this.tokens[this.current];
    
    if (!token) {
      throw new Error('Unexpected end of expression');
    }
    
    // Handle unary minus
    if (token.type === 'OPERATOR' && token.value === '-') {
      this.current++;
      return -this.parsePower();
    }
    
    // Handle parentheses
    if (token.type === 'LPAREN') {
      this.current++;
      const result = this.parseExpression();
      if (this.current >= this.tokens.length || this.tokens[this.current].type !== 'RPAREN') {
        throw new Error('Missing closing parenthesis');
      }
      this.current++;
      return result;
    }
    
    // Handle numbers
    if (token.type === 'NUMBER') {
      this.current++;
      return parseFloat(token.value);
    }
    
    // Handle memory recall
    if (token.type === 'MEMORY') {
      this.current++;
      return this.memory;
    }
    
    // Handle functions
    if (token.type === 'FUNCTION') {
      const funcName = token.value;
      this.current++;
      
      if (this.current >= this.tokens.length || this.tokens[this.current].type !== 'LPAREN') {
        throw new Error(`Expected '(' after function ${funcName}`);
      }
      this.current++;
      
      const args = [];
      
      // Parse function arguments
      if (this.current < this.tokens.length && this.tokens[this.current].type !== 'RPAREN') {
        args.push(this.parseExpression());
        
        while (this.current < this.tokens.length && this.tokens[this.current].type === 'COMMA') {
          this.current++;
          args.push(this.parseExpression());
        }
      }
      
      if (this.current >= this.tokens.length || this.tokens[this.current].type !== 'RPAREN') {
        throw new Error('Missing closing parenthesis for function');
      }
      this.current++;
      
      // Call the function
      if (!operations[funcName]) {
        throw new Error(`Unknown function: ${funcName}`);
      }
      
      const expectedArity = getOperationArity(funcName);
      if (args.length !== expectedArity) {
        throw new Error(`Function ${funcName} expects ${expectedArity} argument(s), got ${args.length}`);
      }
      
      return operations[funcName](...args);
    }
    
    throw new Error(`Unexpected token: ${token.value}`);
  }
}

/**
 * Evaluate a mathematical expression
 * @param {string} expression - The expression to evaluate
 * @param {number} memoryValue - Current memory value
 * @returns {number} The result
 */
export function evaluateExpression(expression, memoryValue = 0) {
  const parser = new ExpressionParser();
  return parser.parse(expression, memoryValue);
}