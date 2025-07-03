/**
 * Configuration Management System
 * 
 * Handles configuration from multiple sources:
 * 1. Default configuration
 * 2. Configuration file (.calculatorrc)
 * 3. Environment variables
 * 4. Command line arguments
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Default configuration
const DEFAULT_CONFIG = {
  // Performance
  cacheSize: 1000,
  enableCache: true,
  
  // UI/Display
  precision: 10,
  scientificNotation: false,
  thousandsSeparator: true,
  locale: 'en-US',
  
  // History
  historySize: 100,
  historyFile: '.calculator_history',
  autoSaveHistory: true,
  
  // Logging
  logLevel: 'info', // debug, info, warn, error
  logFile: null,
  colorOutput: true,
  
  // Memory
  memorySlots: 10,
  persistMemory: true,
  memoryFile: '.calculator_memory',
  
  // Interactive mode
  prompt: '> ',
  welcomeMessage: true,
  showHints: true,
  
  // Advanced
  enablePlugins: false,
  pluginDir: '.calculator/plugins',
  timeout: 5000, // Max calculation time in ms
};

// Environment variable mapping
const ENV_MAPPING = {
  CALC_CACHE_SIZE: 'cacheSize',
  CALC_ENABLE_CACHE: 'enableCache',
  CALC_PRECISION: 'precision',
  CALC_SCIENTIFIC: 'scientificNotation',
  CALC_THOUSANDS_SEP: 'thousandsSeparator',
  CALC_LOCALE: 'locale',
  CALC_HISTORY_SIZE: 'historySize',
  CALC_HISTORY_FILE: 'historyFile',
  CALC_AUTO_SAVE_HISTORY: 'autoSaveHistory',
  CALC_LOG_LEVEL: 'logLevel',
  CALC_LOG_FILE: 'logFile',
  CALC_COLOR_OUTPUT: 'colorOutput',
  CALC_MEMORY_SLOTS: 'memorySlots',
  CALC_PERSIST_MEMORY: 'persistMemory',
  CALC_MEMORY_FILE: 'memoryFile',
  CALC_PROMPT: 'prompt',
  CALC_WELCOME_MESSAGE: 'welcomeMessage',
  CALC_SHOW_HINTS: 'showHints',
  CALC_ENABLE_PLUGINS: 'enablePlugins',
  CALC_PLUGIN_DIR: 'pluginDir',
  CALC_TIMEOUT: 'timeout'
};

class ConfigManager {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.configFile = null;
  }

  /**
   * Load configuration from all sources
   * @param {Object} cmdOptions - Command line options
   * @returns {Object} Final configuration
   */
  load(cmdOptions = {}) {
    // 1. Load from config file
    this.loadConfigFile();
    
    // 2. Load from environment variables
    this.loadEnvironmentVariables();
    
    // 3. Apply command line options (highest priority)
    this.applyOptions(cmdOptions);
    
    // Validate configuration
    this.validate();
    
    return this.config;
  }

  /**
   * Load configuration from file
   */
  loadConfigFile() {
    // Check multiple locations for config file
    const configLocations = [
      '.calculatorrc',
      join(homedir(), '.calculatorrc'),
      join(process.cwd(), '.calculatorrc')
    ];

    for (const location of configLocations) {
      if (existsSync(location)) {
        try {
          const content = readFileSync(location, 'utf8');
          const fileConfig = JSON.parse(content);
          this.config = { ...this.config, ...fileConfig };
          this.configFile = location;
          break;
        } catch (error) {
          console.warn(`Warning: Failed to load config from ${location}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Load configuration from environment variables
   */
  loadEnvironmentVariables() {
    for (const [envVar, configKey] of Object.entries(ENV_MAPPING)) {
      if (process.env[envVar] !== undefined) {
        const value = process.env[envVar];
        
        // Type conversion
        if (typeof this.config[configKey] === 'boolean') {
          this.config[configKey] = value.toLowerCase() === 'true';
        } else if (typeof this.config[configKey] === 'number') {
          this.config[configKey] = parseInt(value, 10);
        } else {
          this.config[configKey] = value;
        }
      }
    }
  }

  /**
   * Apply command line options
   * @param {Object} options - Command line options
   */
  applyOptions(options) {
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined && key in this.config) {
        this.config[key] = value;
      }
    }
  }

  /**
   * Validate configuration
   */
  validate() {
    // Validate cache size
    if (this.config.cacheSize < 0 || this.config.cacheSize > 10000) {
      throw new Error('Cache size must be between 0 and 10000');
    }

    // Validate precision
    if (this.config.precision < 0 || this.config.precision > 20) {
      throw new Error('Precision must be between 0 and 20');
    }

    // Validate history size
    if (this.config.historySize < 0 || this.config.historySize > 10000) {
      throw new Error('History size must be between 0 and 10000');
    }

    // Validate log level
    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLogLevels.includes(this.config.logLevel)) {
      throw new Error(`Invalid log level. Must be one of: ${validLogLevels.join(', ')}`);
    }

    // Validate timeout
    if (this.config.timeout < 100 || this.config.timeout > 60000) {
      throw new Error('Timeout must be between 100ms and 60000ms');
    }
  }

  /**
   * Get a configuration value
   * @param {string} key - Configuration key
   * @returns {*} Configuration value
   */
  get(key) {
    return this.config[key];
  }

  /**
   * Set a configuration value
   * @param {string} key - Configuration key
   * @param {*} value - Configuration value
   */
  set(key, value) {
    if (key in this.config) {
      this.config[key] = value;
    }
  }

  /**
   * Get all configuration
   * @returns {Object} All configuration
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Get config file location
   * @returns {string|null} Config file path
   */
  getConfigFile() {
    return this.configFile;
  }

  /**
   * Save configuration to file
   * @param {string} path - File path
   */
  save(path) {
    const { writeFileSync } = require('fs');
    const configToSave = { ...this.config };
    
    // Remove default values to keep file clean
    for (const [key, value] of Object.entries(configToSave)) {
      if (value === DEFAULT_CONFIG[key]) {
        delete configToSave[key];
      }
    }
    
    writeFileSync(path, JSON.stringify(configToSave, null, 2));
  }
}

// Singleton instance
export const config = new ConfigManager();

// Export for testing
export { ConfigManager, DEFAULT_CONFIG };