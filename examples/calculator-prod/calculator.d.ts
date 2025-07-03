/**
 * TypeScript definitions for calculator-prod
 */

declare module 'calculator-prod' {
  // Configuration types
  export interface CalculatorConfig {
    cacheSize?: number;
    enableCache?: boolean;
    precision?: number;
    scientificNotation?: boolean;
    thousandsSeparator?: boolean;
    locale?: string;
    historySize?: number;
    historyFile?: string;
    autoSaveHistory?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    logFile?: string | null;
    colorOutput?: boolean;
    memorySlots?: number;
    persistMemory?: boolean;
    memoryFile?: string;
    prompt?: string;
    welcomeMessage?: boolean;
    showHints?: boolean;
    enablePlugins?: boolean;
    pluginDir?: string;
    timeout?: number;
  }

  // History types
  export interface HistoryEntry {
    id: string;
    operation: string;
    operands: any[];
    result: number;
    timestamp: string;
  }

  export interface HistoryStats {
    total: number;
    operations: Record<string, number>;
    averageResult: number;
    minResult: number | null;
    maxResult: number | null;
  }

  // Error types
  export interface ErrorResponse {
    success: false;
    error: {
      message: string;
      code: string;
      suggestions: string[];
    };
  }

  export interface SuccessResponse<T = any> {
    success: true;
    result: T;
  }

  export type CalculatorResponse<T = any> = SuccessResponse<T> | ErrorResponse;

  // Calculator operations
  export type BasicOperation = 'add' | 'subtract' | 'multiply' | 'divide';
  export type ScientificOperation = 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan' | 
                                   'log' | 'ln' | 'exp' | 'sqrt' | 'pow' | 'abs';
  export type AdvancedOperation = 'factorial' | 'gcd' | 'lcm' | 'mod' | 'percent' | 
                                  'round' | 'floor' | 'ceil';
  export type Operation = BasicOperation | ScientificOperation | AdvancedOperation;

  // Memory Manager
  export interface MemoryManager {
    memoryStore(value: number): void;
    memoryRecall(): number;
    memoryAdd(value: number): void;
    memorySubtract(value: number): void;
    memoryClear(): void;
    getAllSlots(): Record<string, number>;
    storeInSlot(slot: string, value: number): void;
    recallFromSlot(slot: string): number;
    clearSlot(slot: string): void;
    clearAllSlots(): void;
  }

  // History Manager
  export interface HistoryManager {
    add(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): HistoryEntry;
    getAll(): HistoryEntry[];
    getByDateRange(startDate: Date, endDate: Date): HistoryEntry[];
    search(query: string): HistoryEntry[];
    getStats(): HistoryStats;
    clear(): void;
    save(filePath?: string): boolean;
    load(filePath?: string): boolean;
    export(format: 'json' | 'csv' | 'txt', filePath: string): void;
    import(filePath: string, append?: boolean): boolean;
  }

  // Main Calculator class
  export class Calculator {
    constructor(config?: CalculatorConfig);
    
    // Core calculation methods
    calculate(operation: Operation, operands: number[]): number;
    evaluateExpression(expression: string): number;
    
    // History methods
    getHistory(): HistoryEntry[];
    clearHistory(): void;
    getLastResult(): number;
    
    // Memory methods
    getMemoryManager(): MemoryManager;
    
    // Utility methods
    formatResult(result: number): string;
    isValidExpression(expression: string): boolean;
  }

  // Parser classes
  export class ExpressionParser {
    constructor();
    parse(expression: string, memoryValue?: number): number;
    tokenize(expression: string): Token[];
  }

  export class OptimizedExpressionParser extends ExpressionParser {
    constructor(cacheSize?: number);
    clearCache(): void;
    getCacheStats(): CacheStats;
  }

  export interface Token {
    type: 'NUMBER' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'COMMA' | 'MEMORY' | 'FUNCTION';
    value: string;
  }

  export interface CacheStats {
    size: number;
    maxSize: number;
    hitRate: number;
  }

  // Error classes
  export class CalculatorError extends Error {
    code: string;
    details: any;
    timestamp: string;
    getUserMessage(): string;
    getRecoverySuggestions(): string[];
  }

  export class DivisionByZeroError extends CalculatorError {}
  export class InvalidExpressionError extends CalculatorError {}
  export class UnknownOperationError extends CalculatorError {}
  export class OverflowError extends CalculatorError {}
  export class TimeoutError extends CalculatorError {}
  export class ValidationError extends CalculatorError {}

  // Error handler
  export class ErrorHandler {
    constructor(logger?: any);
    handle(error: Error, context?: any): ErrorResponse;
    getStats(): ErrorStats;
    clearHistory(): void;
  }

  export interface ErrorStats {
    total: number;
    byCode: Record<string, number>;
    recent: Array<{
      code: string;
      message: string;
      timestamp: string;
    }>;
  }

  // Input sanitizer
  export class InputSanitizer {
    static sanitizeExpression(input: string): string;
    static sanitizeNumber(input: any): number;
    static validateOperation(operation: string): string;
  }

  // Configuration manager
  export class ConfigManager {
    load(cmdOptions?: Partial<CalculatorConfig>): CalculatorConfig;
    get<K extends keyof CalculatorConfig>(key: K): CalculatorConfig[K];
    set<K extends keyof CalculatorConfig>(key: K, value: CalculatorConfig[K]): void;
    getAll(): CalculatorConfig;
    getConfigFile(): string | null;
    save(path: string): void;
  }

  // Logger
  export class Logger {
    constructor(config?: Pick<CalculatorConfig, 'logLevel' | 'logFile' | 'colorOutput'>);
    debug(message: string, context?: any): void;
    info(message: string, context?: any): void;
    warn(message: string, context?: any): void;
    error(message: string, context?: any): void;
    logCalculation(operation: string, operands: number[], result: number): void;
    logExpression(expression: string, result: number): void;
    logPerformance(operation: string, duration: number): void;
    logError(error: Error, context?: any): void;
    setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void;
    close(): void;
  }

  // Exported functions
  export function evaluateExpression(expression: string, memoryValue?: number): number;
  export function clearExpressionCache(): void;
  export function getCacheStats(): CacheStats;
  export function initLogger(config: Pick<CalculatorConfig, 'logLevel' | 'logFile' | 'colorOutput'>): Logger;
  export function getLogger(): Logger;

  // Exported instances
  export const calculator: Calculator;
  export const config: ConfigManager;
  export const historyManager: HistoryManager;
  export const memoryManager: MemoryManager;

  // Constants
  export const ErrorTypes: {
    DIVISION_BY_ZERO: 'DIVISION_BY_ZERO';
    INVALID_EXPRESSION: 'INVALID_EXPRESSION';
    UNKNOWN_OPERATION: 'UNKNOWN_OPERATION';
    OVERFLOW: 'OVERFLOW';
    TIMEOUT: 'TIMEOUT';
    VALIDATION_ERROR: 'VALIDATION_ERROR';
  };

  export const DEFAULT_CONFIG: CalculatorConfig;
}