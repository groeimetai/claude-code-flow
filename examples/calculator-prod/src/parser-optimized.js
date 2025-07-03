/**
 * Optimized Expression Parser with Caching
 * 
 * This parser includes performance optimizations:
 * - Expression caching with LRU eviction
 * - Pre-compiled token patterns
 * - Optimized tokenization
 * - Memoized function lookups
 */

import { operations, getOperationArity } from './operations.js';

// LRU Cache implementation
class LRUCache {
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    
    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

// Pre-compiled regex for better performance
const TOKEN_REGEX = /(\d+\.?\d*|[+\-*/()^,]|[a-zA-Z]+|MR)/g;
const NUMBER_REGEX = /^\d+\.?\d*$/;
const LETTER_REGEX = /^[a-zA-Z]+$/;

// Token types as constants for faster comparison
const TOKEN_TYPES = {
  NUMBER: 0,
  OPERATOR: 1,
  LPAREN: 2,
  RPAREN: 3,
  COMMA: 4,
  MEMORY: 5,
  FUNCTION: 6
};

// Operator precedence lookup
const OPERATOR_PRECEDENCE = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3
};

export class OptimizedExpressionParser {
  constructor(cacheSize = 1000) {
    this.tokens = [];
    this.current = 0;
    this.memory = 0;
    this.cache = new LRUCache(cacheSize);
    
    // Pre-cache operation lookups
    this.operationCache = new Map();
    for (const [name, func] of Object.entries(operations)) {
      this.operationCache.set(name, func);
    }
  }

  /**
   * Parse and evaluate expression with caching
   */
  parse(expression, memoryValue = 0) {
    // Check cache first
    const cacheKey = `${expression}:${memoryValue}`;
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // Parse expression
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
    
    // Cache result
    this.cache.set(cacheKey, result);
    
    return result;
  }

  /**
   * Optimized tokenization
   */
  tokenize(expression) {
    const tokens = [];
    let match;
    
    TOKEN_REGEX.lastIndex = 0; // Reset regex
    
    while ((match = TOKEN_REGEX.exec(expression)) !== null) {
      const value = match[0];
      let type;
      
      // Optimized type detection
      if (NUMBER_REGEX.test(value)) {
        type = TOKEN_TYPES.NUMBER;
      } else if (value.length === 1) {
        switch (value) {
          case '+':
          case '-':
          case '*':
          case '/':
          case '^':
            type = TOKEN_TYPES.OPERATOR;
            break;
          case '(':
            type = TOKEN_TYPES.LPAREN;
            break;
          case ')':
            type = TOKEN_TYPES.RPAREN;
            break;
          case ',':
            type = TOKEN_TYPES.COMMA;
            break;
          default:
            throw new Error(`Invalid token: ${value}`);
        }
      } else if (value === 'MR') {
        type = TOKEN_TYPES.MEMORY;
      } else if (LETTER_REGEX.test(value)) {
        type = TOKEN_TYPES.FUNCTION;
      } else {
        throw new Error(`Invalid token: ${value}`);
      }
      
      tokens.push({ type, value });
    }
    
    return tokens;
  }

  /**
   * Parse expression (optimized)
   */
  parseExpression() {
    let left = this.parseTerm();
    
    while (this.current < this.tokens.length) {
      const token = this.tokens[this.current];
      if (token.type === TOKEN_TYPES.OPERATOR && 
          (token.value === '+' || token.value === '-')) {
        const op = token.value;
        this.current++;
        const right = this.parseTerm();
        left = op === '+' ? left + right : left - right;
      } else {
        break;
      }
    }
    
    return left;
  }

  /**
   * Parse term (optimized)
   */
  parseTerm() {
    let left = this.parseFactor();
    
    while (this.current < this.tokens.length) {
      const token = this.tokens[this.current];
      if (token.type === TOKEN_TYPES.OPERATOR && 
          (token.value === '*' || token.value === '/')) {
        const op = token.value;
        this.current++;
        const right = this.parseFactor();
        if (op === '*') {
          left *= right;
        } else {
          if (right === 0) {
            throw new Error('Division by zero');
          }
          left /= right;
        }
      } else {
        break;
      }
    }
    
    return left;
  }

  /**
   * Parse factor (optimized)
   */
  parseFactor() {
    let left = this.parsePower();
    
    while (this.current < this.tokens.length) {
      const token = this.tokens[this.current];
      if (token.type === TOKEN_TYPES.OPERATOR && token.value === '^') {
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
   * Parse power (optimized)
   */
  parsePower() {
    const token = this.tokens[this.current];
    
    if (!token) {
      throw new Error('Unexpected end of expression');
    }
    
    // Handle unary minus
    if (token.type === TOKEN_TYPES.OPERATOR && token.value === '-') {
      this.current++;
      return -this.parsePower();
    }
    
    // Handle parentheses
    if (token.type === TOKEN_TYPES.LPAREN) {
      this.current++;
      const result = this.parseExpression();
      if (this.current >= this.tokens.length || 
          this.tokens[this.current].type !== TOKEN_TYPES.RPAREN) {
        throw new Error('Missing closing parenthesis');
      }
      this.current++;
      return result;
    }
    
    // Handle numbers
    if (token.type === TOKEN_TYPES.NUMBER) {
      this.current++;
      return parseFloat(token.value);
    }
    
    // Handle memory recall
    if (token.type === TOKEN_TYPES.MEMORY) {
      this.current++;
      return this.memory;
    }
    
    // Handle functions
    if (token.type === TOKEN_TYPES.FUNCTION) {
      const funcName = token.value;
      this.current++;
      
      if (this.current >= this.tokens.length || 
          this.tokens[this.current].type !== TOKEN_TYPES.LPAREN) {
        throw new Error(`Expected '(' after function ${funcName}`);
      }
      this.current++;
      
      const args = [];
      
      // Parse function arguments
      if (this.current < this.tokens.length && 
          this.tokens[this.current].type !== TOKEN_TYPES.RPAREN) {
        args.push(this.parseExpression());
        
        while (this.current < this.tokens.length && 
               this.tokens[this.current].type === TOKEN_TYPES.COMMA) {
          this.current++;
          args.push(this.parseExpression());
        }
      }
      
      if (this.current >= this.tokens.length || 
          this.tokens[this.current].type !== TOKEN_TYPES.RPAREN) {
        throw new Error('Missing closing parenthesis for function');
      }
      this.current++;
      
      // Use cached function lookup
      const func = this.operationCache.get(funcName);
      if (!func) {
        throw new Error(`Unknown function: ${funcName}`);
      }
      
      const expectedArity = getOperationArity(funcName);
      if (args.length !== expectedArity) {
        throw new Error(`Function ${funcName} expects ${expectedArity} argument(s), got ${args.length}`);
      }
      
      return func(...args);
    }
    
    throw new Error(`Unexpected token: ${token.value}`);
  }

  /**
   * Clear the expression cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.cache.maxSize,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
    };
  }
}

// Global parser instance for better performance
const globalParser = new OptimizedExpressionParser();

/**
 * Evaluate expression using optimized parser
 */
export function evaluateExpression(expression, memoryValue = 0) {
  return globalParser.parse(expression, memoryValue);
}

/**
 * Clear expression cache
 */
export function clearExpressionCache() {
  globalParser.clearCache();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return globalParser.getCacheStats();
}