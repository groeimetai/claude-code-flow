// Main exports for the swarm system
export * from './coordinator';
export * from './executor';
export * from './types';
export * from './strategies/base';
export * from './strategies/auto';
export * from './strategies/research';
export * from './memory';

// Prompt copying system exports
export * from './prompt-copier';
export * from './prompt-copier-enhanced';
export * from './prompt-utils';
export * from './prompt-manager';
export * from './prompt-cli';

// Optimizations
export * from './optimizations';

// Goal validation system exports
export { GoalValidationSystem } from './goal-validator.js';
export { ProgressCalculator } from './progress-calculator.js';
export { AdaptiveGoalPlanner } from './adaptive-planner.js';
export { ValidatedMetaOrchestrator, createValidatedMetaOrchestrator } from './meta-orchestrator-validated.js';

// Utility function to get all exports
export function getSwarmComponents() {
  return {
    // Core components
    coordinator: () => import('./coordinator'),
    executor: () => import('./executor'),
    types: () => import('./types'),
    
    // Strategies
    strategies: {
      base: () => import('./strategies/base'),
      auto: () => import('./strategies/auto'),
      research: () => import('./strategies/research')
    },
    
    // Memory
    memory: () => import('./memory'),
    
    // Prompt system
    promptCopier: () => import('./prompt-copier'),
    promptCopierEnhanced: () => import('./prompt-copier-enhanced'),
    promptUtils: () => import('./prompt-utils'),
    promptManager: () => import('./prompt-manager'),
    promptCli: () => import('./prompt-cli'),
    
    // Optimizations
    optimizations: () => import('./optimizations'),
    
    // Goal validation system
    validation: {
      goalValidator: () => import('./goal-validator.js'),
      progressCalculator: () => import('./progress-calculator.js'),
      adaptivePlanner: () => import('./adaptive-planner.js'),
      validatedOrchestrator: () => import('./meta-orchestrator-validated.js')
    }
  };
}