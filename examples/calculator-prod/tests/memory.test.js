/**
 * Tests for Memory Manager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryManager } from '../src/memory.js';

describe('MemoryManager', () => {
  let memory;

  beforeEach(() => {
    memory = new MemoryManager();
  });

  describe('Basic memory operations', () => {
    it('should initialize with zero memory', () => {
      expect(memory.memoryRecall()).toBe(0);
    });

    it('should add to memory with M+', () => {
      expect(memory.memoryAdd(5)).toBe(5);
      expect(memory.memoryAdd(3)).toBe(8);
    });

    it('should subtract from memory with M-', () => {
      memory.memoryAdd(10);
      expect(memory.memorySubtract(3)).toBe(7);
      expect(memory.memorySubtract(2)).toBe(5);
    });

    it('should store value in memory with MS', () => {
      memory.memoryAdd(10);
      expect(memory.memoryStore(25)).toBe(25);
      expect(memory.memoryRecall()).toBe(25);
    });

    it('should clear memory with MC', () => {
      memory.memoryAdd(10);
      memory.memoryClear();
      expect(memory.memoryRecall()).toBe(0);
    });
  });

  describe('Memory slots', () => {
    it('should support named memory slots', () => {
      memory.memoryStore(10, 'x');
      memory.memoryStore(20, 'y');
      expect(memory.memoryRecall('x')).toBe(10);
      expect(memory.memoryRecall('y')).toBe(20);
    });

    it('should add to specific slots', () => {
      memory.memoryStore(5, 'slot1');
      expect(memory.memoryAdd(3, 'slot1')).toBe(8);
      expect(memory.memoryRecall('slot1')).toBe(8);
    });

    it('should maintain separate slots', () => {
      memory.memoryStore(10);
      memory.memoryStore(20, 'custom');
      expect(memory.memoryRecall()).toBe(10);
      expect(memory.memoryRecall('custom')).toBe(20);
    });

    it('should clear specific slots', () => {
      memory.memoryStore(10, 'temp');
      memory.memoryClear('temp');
      expect(memory.memoryRecall('temp')).toBe(0);
      // Main memory should remain unchanged
      memory.memoryStore(5);
      memory.memoryClear('temp');
      expect(memory.memoryRecall()).toBe(5);
    });
  });

  describe('Memory history', () => {
    it('should track memory operations', () => {
      memory.memoryAdd(5);
      memory.memorySubtract(2);
      const history = memory.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].operation).toBe('M+');
      expect(history[1].operation).toBe('M-');
    });

    it('should record operation details', () => {
      memory.memoryStore(10, 'test');
      const history = memory.getHistory();
      expect(history[0].value).toBe(10);
      expect(history[0].slot).toBe('test');
      expect(history[0].result).toBe(10);
    });

    it('should limit history to 100 entries', () => {
      for (let i = 0; i < 110; i++) {
        memory.memoryAdd(1);
      }
      expect(memory.getHistory()).toHaveLength(100);
    });
  });

  describe('Get all memory', () => {
    it('should return all memory values', () => {
      memory.memoryStore(10);
      memory.memoryStore(20, 'x');
      memory.memoryStore(30, 'y');
      
      const all = memory.getAllMemory();
      expect(all.main).toBe(10);
      expect(all.x).toBe(20);
      expect(all.y).toBe(30);
    });
  });

  describe('Clear all memory', () => {
    it('should clear all slots and main memory', () => {
      memory.memoryStore(10);
      memory.memoryStore(20, 'x');
      memory.memoryStore(30, 'y');
      
      memory.clearAllMemory();
      
      expect(memory.memoryRecall()).toBe(0);
      expect(memory.memoryRecall('x')).toBe(0);
      expect(memory.memoryRecall('y')).toBe(0);
      expect(memory.getHistory()).toHaveLength(1);
      expect(memory.getHistory()[0].operation).toBe('MC_ALL');
    });
  });

  describe('State export/import', () => {
    it('should export memory state', () => {
      memory.memoryStore(10);
      memory.memoryStore(20, 'x');
      memory.memoryAdd(5);
      
      const state = memory.exportState();
      expect(state.mainMemory).toBe(15);
      expect(state.slots.x).toBe(20);
      expect(state.history).toHaveLength(3);
    });

    it('should import memory state', () => {
      const state = {
        mainMemory: 42,
        slots: { a: 10, b: 20 },
        history: []
      };
      
      memory.importState(state);
      
      expect(memory.memoryRecall()).toBe(42);
      expect(memory.memoryRecall('a')).toBe(10);
      expect(memory.memoryRecall('b')).toBe(20);
    });

    it('should handle partial state import', () => {
      memory.memoryStore(10);
      memory.importState({ mainMemory: 20 });
      expect(memory.memoryRecall()).toBe(20);
    });
  });

  describe('Edge cases', () => {
    it('should handle operations on non-existent slots', () => {
      expect(memory.memoryRecall('nonexistent')).toBe(0);
      expect(memory.memoryAdd(5, 'new')).toBe(5);
    });

    it('should handle negative values', () => {
      memory.memoryStore(-10);
      expect(memory.memoryAdd(-5)).toBe(-15);
      expect(memory.memorySubtract(-3)).toBe(-12);
    });

    it('should handle floating point values', () => {
      memory.memoryStore(3.14);
      expect(memory.memoryAdd(2.86)).toBeCloseTo(6);
    });
  });
});