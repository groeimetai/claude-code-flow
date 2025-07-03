/**
 * History Management with Export/Import Functionality
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export class HistoryManager {
  constructor(config = {}) {
    this.maxSize = config.historySize || 100;
    this.historyFile = config.historyFile || join(homedir(), '.calculator_history');
    this.autoSave = config.autoSaveHistory !== false;
    this.history = [];
    
    // Load history on initialization
    if (this.autoSave) {
      this.load();
    }
  }

  /**
   * Add entry to history
   * @param {Object} entry - History entry
   */
  add(entry) {
    const historyEntry = {
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
      id: this.generateId()
    };
    
    this.history.push(historyEntry);
    
    // Maintain max size
    if (this.history.length > this.maxSize) {
      this.history = this.history.slice(-this.maxSize);
    }
    
    // Auto save if enabled
    if (this.autoSave) {
      this.save();
    }
    
    return historyEntry;
  }

  /**
   * Get all history
   * @returns {Array} History entries
   */
  getAll() {
    return [...this.history];
  }

  /**
   * Get history by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Filtered history
   */
  getByDateRange(startDate, endDate) {
    return this.history.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  /**
   * Search history
   * @param {string} query - Search query
   * @returns {Array} Matching entries
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.history.filter(entry => {
      const expression = entry.operands?.[0] || '';
      const operation = entry.operation || '';
      return expression.toLowerCase().includes(lowerQuery) ||
             operation.toLowerCase().includes(lowerQuery);
    });
  }

  /**
   * Get statistics
   * @returns {Object} History statistics
   */
  getStats() {
    const stats = {
      total: this.history.length,
      operations: {},
      averageResult: 0,
      minResult: null,
      maxResult: null
    };

    if (this.history.length === 0) {
      return stats;
    }

    let sum = 0;
    let count = 0;

    this.history.forEach(entry => {
      // Count operations
      const op = entry.operation || 'expression';
      stats.operations[op] = (stats.operations[op] || 0) + 1;

      // Calculate statistics
      if (typeof entry.result === 'number' && isFinite(entry.result)) {
        sum += entry.result;
        count++;
        
        if (stats.minResult === null || entry.result < stats.minResult) {
          stats.minResult = entry.result;
        }
        if (stats.maxResult === null || entry.result > stats.maxResult) {
          stats.maxResult = entry.result;
        }
      }
    });

    if (count > 0) {
      stats.averageResult = sum / count;
    }

    return stats;
  }

  /**
   * Clear history
   */
  clear() {
    this.history = [];
    if (this.autoSave) {
      this.save();
    }
  }

  /**
   * Save history to file
   * @param {string} filePath - Optional file path
   */
  save(filePath) {
    const path = filePath || this.historyFile;
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      entries: this.history
    };
    
    try {
      writeFileSync(path, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Failed to save history: ${error.message}`);
      return false;
    }
  }

  /**
   * Load history from file
   * @param {string} filePath - Optional file path
   */
  load(filePath) {
    const path = filePath || this.historyFile;
    
    if (!existsSync(path)) {
      return false;
    }
    
    try {
      const content = readFileSync(path, 'utf8');
      const data = JSON.parse(content);
      
      // Validate data
      if (data.version && Array.isArray(data.entries)) {
        this.history = data.entries.slice(-this.maxSize);
        return true;
      }
      
      // Handle legacy format (plain array)
      if (Array.isArray(data)) {
        this.history = data.slice(-this.maxSize);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to load history: ${error.message}`);
      return false;
    }
  }

  /**
   * Export history to different formats
   * @param {string} format - Export format (json, csv, txt)
   * @param {string} filePath - Output file path
   */
  export(format, filePath) {
    switch (format.toLowerCase()) {
      case 'json':
        return this.exportJSON(filePath);
      case 'csv':
        return this.exportCSV(filePath);
      case 'txt':
        return this.exportTXT(filePath);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export as JSON
   * @private
   */
  exportJSON(filePath) {
    const data = {
      version: '1.0',
      exported: new Date().toISOString(),
      calculator: 'calculator-prod',
      entries: this.history
    };
    
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  }

  /**
   * Export as CSV
   * @private
   */
  exportCSV(filePath) {
    const headers = ['Timestamp', 'Operation', 'Expression', 'Result'];
    const rows = [headers.join(',')];
    
    this.history.forEach(entry => {
      const timestamp = entry.timestamp;
      const operation = entry.operation || 'expression';
      const expression = entry.operands?.[0] || entry.operands?.join(', ') || '';
      const result = entry.result;
      
      rows.push([
        `"${timestamp}"`,
        `"${operation}"`,
        `"${expression}"`,
        result
      ].join(','));
    });
    
    writeFileSync(filePath, rows.join('\n'));
    return true;
  }

  /**
   * Export as plain text
   * @private
   */
  exportTXT(filePath) {
    const lines = ['Calculator History', '=================', ''];
    
    this.history.forEach(entry => {
      const timestamp = new Date(entry.timestamp).toLocaleString();
      const operation = entry.operation || 'expression';
      const expression = entry.operands?.[0] || entry.operands?.join(', ') || '';
      const result = entry.result;
      
      lines.push(`[${timestamp}]`);
      lines.push(`Operation: ${operation}`);
      if (expression) {
        lines.push(`Expression: ${expression}`);
      }
      lines.push(`Result: ${result}`);
      lines.push('');
    });
    
    writeFileSync(filePath, lines.join('\n'));
    return true;
  }

  /**
   * Import history from file
   * @param {string} filePath - File path to import from
   * @param {boolean} append - Append to existing history
   */
  import(filePath, append = false) {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const content = readFileSync(filePath, 'utf8');
    
    // Try to detect format
    if (content.trim().startsWith('{')) {
      // JSON format
      const data = JSON.parse(content);
      const entries = data.entries || data;
      
      if (append) {
        this.history.push(...entries);
      } else {
        this.history = entries;
      }
      
      // Maintain max size
      if (this.history.length > this.maxSize) {
        this.history = this.history.slice(-this.maxSize);
      }
      
      if (this.autoSave) {
        this.save();
      }
      
      return true;
    } else {
      throw new Error('Unsupported import format');
    }
  }

  /**
   * Generate unique ID
   * @private
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const historyManager = new HistoryManager();