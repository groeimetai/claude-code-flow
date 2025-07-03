/**
 * Helper utilities for the calculator
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the data directory path
const DATA_DIR = join(__dirname, '../../.calculator-data');
const MEMORY_FILE = join(DATA_DIR, 'memory.json');
const HISTORY_FILE = join(DATA_DIR, 'history.json');

/**
 * Ensure data directory exists
 */
export function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Load memory state from file
 * @returns {Object} Memory state or default
 */
export function loadMemoryState() {
  // Skip persistence in test environment
  if (process.env.NODE_ENV === 'test') {
    return null;
  }
  
  ensureDataDir();
  
  if (existsSync(MEMORY_FILE)) {
    try {
      const data = readFileSync(MEMORY_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading memory state:', error);
      return null;
    }
  }
  
  return null;
}

/**
 * Save memory state to file
 * @param {Object} state - Memory state to save
 */
export function saveMemoryState(state) {
  // Skip persistence in test environment
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  
  ensureDataDir();
  
  try {
    writeFileSync(MEMORY_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Error saving memory state:', error);
  }
}

/**
 * Load calculation history from file
 * @returns {Array} History or empty array
 */
export function loadHistory() {
  ensureDataDir();
  
  if (existsSync(HISTORY_FILE)) {
    try {
      const data = readFileSync(HISTORY_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }
  
  return [];
}

/**
 * Save calculation history to file
 * @param {Array} history - History to save
 */
export function saveHistory(history) {
  ensureDataDir();
  
  try {
    // Keep only last 1000 entries
    const trimmedHistory = history.slice(-1000);
    writeFileSync(HISTORY_FILE, JSON.stringify(trimmedHistory, null, 2));
  } catch (error) {
    console.error('Error saving history:', error);
  }
}

/**
 * Clear all saved data
 */
export function clearAllData() {
  ensureDataDir();
  
  try {
    if (existsSync(MEMORY_FILE)) {
      writeFileSync(MEMORY_FILE, '{}');
    }
    if (existsSync(HISTORY_FILE)) {
      writeFileSync(HISTORY_FILE, '[]');
    }
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}