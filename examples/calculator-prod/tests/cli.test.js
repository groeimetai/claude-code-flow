/**
 * CLI Interface Tests
 * 
 * Tests for the command-line interface functionality
 */

import { createProgram } from '../src/cli.js';
import { jest } from '@jest/globals';

describe('CLI Interface', () => {
  let program;
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    program = createProgram();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Command Structure', () => {
    test('should have basic arithmetic commands', () => {
      const commands = program.commands.map(cmd => cmd.name());
      expect(commands).toContain('add');
      expect(commands).toContain('subtract');
      expect(commands).toContain('multiply');
      expect(commands).toContain('divide');
    });

    test('should have advanced operation commands', () => {
      const commands = program.commands.map(cmd => cmd.name());
      expect(commands).toContain('sqrt');
      expect(commands).toContain('power');
      expect(commands).toContain('factorial');
    });

    test('should have utility commands', () => {
      const commands = program.commands.map(cmd => cmd.name());
      expect(commands).toContain('history');
      expect(commands).toContain('clear');
      expect(commands).toContain('list');
    });
  });

  describe('Operation Execution', () => {
    test('should execute add command correctly', () => {
      program.parse(['node', 'calculator', 'add', '5', '3']);
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('8');
    });

    test('should handle invalid numbers gracefully', () => {
      program.parse(['node', 'calculator', 'add', '5', 'invalid']);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('List Command', () => {
    test('should list all available operations', () => {
      program.parse(['node', 'calculator', 'list']);
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const calls = consoleLogSpy.mock.calls;
      const output = calls.map(call => call[0]).join('\n');
      
      expect(output).toContain('add');
      expect(output).toContain('subtract');
      expect(output).toContain('multiply');
      expect(output).toContain('divide');
      expect(output).toContain('sqrt');
    });
  });
});