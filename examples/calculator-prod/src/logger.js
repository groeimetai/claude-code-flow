/**
 * Logging System with Multiple Levels and Output Options
 */

import { createWriteStream } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

// Log levels
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Log level colors
const LOG_COLORS = {
  debug: chalk.gray,
  info: chalk.blue,
  warn: chalk.yellow,
  error: chalk.red
};

class Logger {
  constructor(config = {}) {
    this.level = LOG_LEVELS[config.logLevel || 'info'];
    this.colorOutput = config.colorOutput !== false;
    this.logFile = config.logFile;
    this.fileStream = null;
    
    // Initialize file stream if needed
    if (this.logFile) {
      try {
        this.fileStream = createWriteStream(this.logFile, { flags: 'a' });
      } catch (error) {
        console.error(`Failed to open log file: ${error.message}`);
      }
    }
  }

  /**
   * Format log message
   * @private
   */
  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    
    let formatted = `[${timestamp}] ${levelStr} ${message}`;
    
    // Add context if provided
    if (Object.keys(context).length > 0) {
      formatted += ` ${JSON.stringify(context)}`;
    }
    
    return formatted;
  }

  /**
   * Log a message
   * @private
   */
  log(level, message, context) {
    const levelValue = LOG_LEVELS[level];
    
    // Check if should log based on level
    if (levelValue < this.level) {
      return;
    }
    
    const formatted = this.formatMessage(level, message, context);
    
    // Console output
    if (this.colorOutput && LOG_COLORS[level]) {
      console.log(LOG_COLORS[level](formatted));
    } else {
      console.log(formatted);
    }
    
    // File output
    if (this.fileStream) {
      this.fileStream.write(formatted + '\n');
    }
  }

  /**
   * Debug level logging
   */
  debug(message, context) {
    this.log('debug', message, context);
  }

  /**
   * Info level logging
   */
  info(message, context) {
    this.log('info', message, context);
  }

  /**
   * Warning level logging
   */
  warn(message, context) {
    this.log('warn', message, context);
  }

  /**
   * Error level logging
   */
  error(message, context) {
    this.log('error', message, context);
  }

  /**
   * Log calculation operation
   */
  logCalculation(operation, operands, result) {
    this.info('Calculation performed', {
      operation,
      operands,
      result
    });
  }

  /**
   * Log expression evaluation
   */
  logExpression(expression, result) {
    this.info('Expression evaluated', {
      expression,
      result
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation, duration) {
    this.debug('Performance metric', {
      operation,
      duration: `${duration}ms`
    });
  }

  /**
   * Log error with stack trace
   */
  logError(error, context = {}) {
    this.error(error.message, {
      ...context,
      stack: error.stack
    });
  }

  /**
   * Set log level
   */
  setLevel(level) {
    if (LOG_LEVELS[level] !== undefined) {
      this.level = LOG_LEVELS[level];
    }
  }

  /**
   * Close file stream
   */
  close() {
    if (this.fileStream) {
      this.fileStream.end();
      this.fileStream = null;
    }
  }
}

// Create a singleton logger instance
let logger = null;

/**
 * Initialize logger with configuration
 */
export function initLogger(config) {
  if (logger) {
    logger.close();
  }
  logger = new Logger(config);
  return logger;
}

/**
 * Get logger instance
 */
export function getLogger() {
  if (!logger) {
    logger = new Logger();
  }
  return logger;
}

// Export Logger class for testing
export { Logger };