/**
 * Memory Functions for Calculator
 * 
 * Implements calculator memory functionality:
 * - M+ (Memory Add): Add current value to memory
 * - M- (Memory Subtract): Subtract current value from memory
 * - MR (Memory Recall): Retrieve value from memory
 * - MC (Memory Clear): Clear memory
 * 
 * Also supports multiple memory slots for advanced usage.
 */

import { loadMemoryState, saveMemoryState } from './utils/helpers.js';

export class MemoryManager {
  constructor() {
    this.mainMemory = 0;
    this.slots = new Map();
    this.history = [];
    
    // Load persisted state
    const savedState = loadMemoryState();
    if (savedState) {
      this.importState(savedState);
    }
  }

  /**
   * Add value to memory
   * @param {number} value - Value to add
   * @param {string} slot - Optional memory slot name
   * @returns {number} New memory value
   */
  memoryAdd(value, slot = null) {
    if (slot) {
      const current = this.slots.get(slot) || 0;
      const newValue = current + value;
      this.slots.set(slot, newValue);
      this.recordOperation('M+', value, slot, newValue);
      this.persist();
      return newValue;
    } else {
      this.mainMemory += value;
      this.recordOperation('M+', value, 'main', this.mainMemory);
      this.persist();
      return this.mainMemory;
    }
  }

  /**
   * Subtract value from memory
   * @param {number} value - Value to subtract
   * @param {string} slot - Optional memory slot name
   * @returns {number} New memory value
   */
  memorySubtract(value, slot = null) {
    if (slot) {
      const current = this.slots.get(slot) || 0;
      const newValue = current - value;
      this.slots.set(slot, newValue);
      this.recordOperation('M-', value, slot, newValue);
      this.persist();
      return newValue;
    } else {
      this.mainMemory -= value;
      this.recordOperation('M-', value, 'main', this.mainMemory);
      this.persist();
      return this.mainMemory;
    }
  }

  /**
   * Recall value from memory
   * @param {string} slot - Optional memory slot name
   * @returns {number} Memory value
   */
  memoryRecall(slot = null) {
    if (slot) {
      const value = this.slots.get(slot) || 0;
      this.recordOperation('MR', null, slot, value);
      return value;
    } else {
      this.recordOperation('MR', null, 'main', this.mainMemory);
      return this.mainMemory;
    }
  }

  /**
   * Clear memory
   * @param {string} slot - Optional memory slot name to clear
   */
  memoryClear(slot = null) {
    if (slot) {
      this.slots.delete(slot);
      this.recordOperation('MC', null, slot, 0);
    } else {
      this.mainMemory = 0;
      this.recordOperation('MC', null, 'main', 0);
    }
    this.persist();
  }

  /**
   * Store value in memory (replaces current value)
   * @param {number} value - Value to store
   * @param {string} slot - Optional memory slot name
   * @returns {number} Stored value
   */
  memoryStore(value, slot = null) {
    if (slot) {
      this.slots.set(slot, value);
      this.recordOperation('MS', value, slot, value);
      this.persist();
      return value;
    } else {
      this.mainMemory = value;
      this.recordOperation('MS', value, 'main', value);
      this.persist();
      return value;
    }
  }

  /**
   * Get all memory slots and their values
   * @returns {Object} Object with all memory values
   */
  getAllMemory() {
    const result = {
      main: this.mainMemory
    };
    
    for (const [slot, value] of this.slots) {
      result[slot] = value;
    }
    
    return result;
  }

  /**
   * Clear all memory (main and all slots)
   */
  clearAllMemory() {
    this.mainMemory = 0;
    this.slots.clear();
    this.history = [];
    this.recordOperation('MC_ALL', null, 'all', 0);
    this.persist();
  }

  /**
   * Get memory operation history
   * @returns {Array} Array of memory operations
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Record a memory operation for history
   * @private
   */
  recordOperation(operation, value, slot, result) {
    this.history.push({
      operation,
      value,
      slot,
      result,
      timestamp: new Date()
    });
    
    // Keep only last 100 operations
    if (this.history.length > 100) {
      this.history.shift();
    }
  }

  /**
   * Export memory state
   * @returns {Object} Serializable memory state
   */
  exportState() {
    return {
      mainMemory: this.mainMemory,
      slots: Object.fromEntries(this.slots),
      history: this.history
    };
  }

  /**
   * Import memory state
   * @param {Object} state - Previously exported state
   */
  importState(state) {
    if (state.mainMemory !== undefined) {
      this.mainMemory = state.mainMemory;
    }
    
    if (state.slots) {
      this.slots = new Map(Object.entries(state.slots));
    }
    
    if (state.history) {
      this.history = state.history;
    }
  }

  /**
   * Persist current state to file
   * @private
   */
  persist() {
    saveMemoryState(this.exportState());
  }
}

// Export singleton instance for easy use
export const memoryManager = new MemoryManager();