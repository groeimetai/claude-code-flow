/**
 * Tests for Goal Validation System
 * Demonstrates real validation vs fake progress
 */

import { GoalValidationSystem } from '../goal-validator.js';
import { ProgressCalculator } from '../progress-calculator.js';
import { AdaptiveGoalPlanner } from '../adaptive-planner.js';
import path from 'path';
import fs from 'fs/promises';

describe('Goal Validation System', () => {
  let validator;
  let progressCalculator;
  let adaptivePlanner;
  let testProjectPath;

  beforeEach(async () => {
    validator = new GoalValidationSystem();
    progressCalculator = new ProgressCalculator();
    adaptivePlanner = new AdaptiveGoalPlanner();
    
    // Create test project directory
    testProjectPath = path.join(process.cwd(), 'test-project-' + Date.now());
    await fs.mkdir(testProjectPath, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    if (testProjectPath) {
      await fs.rm(testProjectPath, { recursive: true, force: true });
    }
  });

  describe('Goal Parsing', () => {
    test('should parse trading system goal into concrete criteria', async () => {
      const goal = 'Build a profitable cryptocurrency trading system with backtesting';
      const criteria = await validator.parseGoal(goal);

      expect(criteria.functional).toContainEqual(
        expect.objectContaining({
          id: 'trading-profit-calculation',
          description: 'System calculates profit/loss correctly'
        })
      );

      expect(criteria.functional).toContainEqual(
        expect.objectContaining({
          id: 'trading-backtesting',
          description: 'Backtesting framework is implemented and functional'
        })
      );

      expect(criteria.functional).toContainEqual(
        expect.objectContaining({
          id: 'trading-risk-management',
          description: 'Risk management features (stop-loss, position sizing) exist'
        })
      );

      expect(criteria.performance).toContainEqual(
        expect.objectContaining({
          id: 'trading-profitability',
          description: 'System shows positive returns in backtesting'
        })
      );
    });

    test('should parse REST API goal into concrete criteria', async () => {
      const goal = 'Create a REST API for user management with authentication';
      const criteria = await validator.parseGoal(goal);

      expect(criteria.functional).toContainEqual(
        expect.objectContaining({
          id: 'api-endpoints-exist',
          description: 'All required endpoints are implemented'
        })
      );

      expect(criteria.functional).toContainEqual(
        expect.objectContaining({
          id: 'api-authentication',
          description: 'Authentication/authorization is implemented'
        })
      );

      expect(criteria.performance).toContainEqual(
        expect.objectContaining({
          id: 'api-response-time',
          description: 'API responds within acceptable time'
        })
      );
    });
  });

  describe('Validation Execution', () => {
    test('should fail validation for empty project', async () => {
      const goal = 'Build a trading system';
      const criteria = await validator.parseGoal(goal);
      const results = await validator.validateGoal(testProjectPath, criteria);

      expect(results.overall.percentage).toBe(0);
      expect(results.overall.passed).toBe(0);
      expect(results.overall.failed).toBeGreaterThan(0);
    });

    test('should pass validation for properly implemented features', async () => {
      // Create a simple trading system file
      const tradingCode = `
class TradingSystem {
  calculateProfit(trades) {
    let totalProfit = 0;
    for (const trade of trades) {
      const profit = (trade.sellPrice - trade.buyPrice) * trade.quantity;
      const commission = trade.commission || 0;
      const slippage = trade.slippage || 0;
      totalProfit += profit - commission - slippage;
    }
    return totalProfit;
  }

  backtest(strategy, historicalData) {
    const results = [];
    for (const data of historicalData) {
      const signal = strategy.analyze(data);
      if (signal) {
        results.push({
          date: data.date,
          signal,
          price: data.close
        });
      }
    }
    return results;
  }

  setStopLoss(position, percentage) {
    return {
      ...position,
      stopLoss: position.entryPrice * (1 - percentage / 100)
    };
  }

  calculatePositionSize(capital, riskPercentage, stopLossDistance) {
    const riskAmount = capital * (riskPercentage / 100);
    return Math.floor(riskAmount / stopLossDistance);
  }
}

module.exports = TradingSystem;
`;

      await fs.writeFile(path.join(testProjectPath, 'trading-system.js'), tradingCode);

      // Create a test file
      const testCode = `
const TradingSystem = require('./trading-system');

describe('TradingSystem', () => {
  test('calculates profit correctly', () => {
    const system = new TradingSystem();
    const trades = [
      { buyPrice: 100, sellPrice: 110, quantity: 10, commission: 5 }
    ];
    expect(system.calculateProfit(trades)).toBe(95);
  });
});
`;

      await fs.writeFile(path.join(testProjectPath, 'trading-system.test.js'), testCode);

      // Create README
      const readme = `
# Trading System

A cryptocurrency trading system with backtesting support.

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`javascript
const system = new TradingSystem();
const profit = system.calculateProfit(trades);
\`\`\`
`;

      await fs.writeFile(path.join(testProjectPath, 'README.md'), readme);

      // Run validation
      const goal = 'Build a profitable trading system';
      const criteria = await validator.parseGoal(goal);
      const results = await validator.validateGoal(testProjectPath, criteria);

      expect(results.overall.percentage).toBeGreaterThan(0);
      expect(results.overall.passed).toBeGreaterThan(0);
      
      // Check specific validations passed
      const profitCalcResult = results.details.find(d => d.id === 'trading-profit-calculation');
      expect(profitCalcResult.success).toBe(true);
      
      const riskMgmtResult = results.details.find(d => d.id === 'trading-risk-management');
      expect(riskMgmtResult.success).toBe(true);
    });
  });

  describe('Progress Calculation', () => {
    test('should calculate real progress based on validation', async () => {
      const goal = {
        description: 'Build a trading system',
        successCriteria: ['profitable', 'backtesting', 'risk management']
      };

      const progress = await progressCalculator.calculateProgress(testProjectPath, goal);

      expect(progress).toHaveProperty('overallProgress');
      expect(progress).toHaveProperty('metrics');
      expect(progress).toHaveProperty('isComplete');
      expect(progress).toHaveProperty('bottlenecks');
      expect(progress).toHaveProperty('nextSteps');

      // Should identify missing components
      expect(progress.isComplete).toBe(false);
      expect(progress.bottlenecks.length).toBeGreaterThan(0);
      expect(progress.nextSteps.length).toBeGreaterThan(0);
    });

    test('should track momentum between iterations', async () => {
      const goal = {
        description: 'Build a trading system',
        successCriteria: ['profitable']
      };

      // First progress check
      const progress1 = await progressCalculator.calculateProgress(testProjectPath, goal);
      
      // Add some code
      await fs.writeFile(path.join(testProjectPath, 'index.js'), 'console.log("trading");');
      
      // Second progress check
      const progress2 = await progressCalculator.calculateProgress(testProjectPath, goal, progress1);

      expect(progress2.momentum).toBeDefined();
      expect(progress2.momentum.trend).toBeDefined();
    });
  });

  describe('Adaptive Planning', () => {
    test('should create adaptive plan based on validation results', async () => {
      const goal = {
        description: 'Build a REST API with authentication',
        successCriteria: ['endpoints', 'authentication', 'tests']
      };

      const plan = await adaptivePlanner.planNextIteration(goal, testProjectPath);

      expect(plan).toHaveProperty('iteration');
      expect(plan).toHaveProperty('objective');
      expect(plan).toHaveProperty('swarms');
      expect(plan).toHaveProperty('estimatedTime');
      expect(plan).toHaveProperty('confidence');
      expect(plan).toHaveProperty('strategy');
      expect(plan).toHaveProperty('checkpoints');
      expect(plan).toHaveProperty('fallbackPlans');

      // Should recommend appropriate swarms
      expect(plan.swarms.length).toBeGreaterThan(0);
      expect(plan.swarms[0]).toHaveProperty('type');
      expect(plan.swarms[0]).toHaveProperty('priority');
      expect(plan.swarms[0]).toHaveProperty('focus');
    });

    test('should adjust strategy based on progress', async () => {
      const goal = {
        description: 'Build a system',
        successCriteria: ['working']
      };

      // Low progress scenario
      const lowProgressData = {
        overallProgress: 10,
        momentum: { trend: 'stable' },
        bottlenecks: []
      };

      const plan1 = await adaptivePlanner.planNextIteration(goal, testProjectPath, {
        metrics: { validation: { percentage: 10 } },
        overallProgress: 10
      });

      expect(plan1.strategy.type).toBe('exploration');

      // High progress scenario
      const highProgressData = {
        overallProgress: 75,
        momentum: { trend: 'improving' },
        bottlenecks: []
      };

      const plan2 = await adaptivePlanner.planNextIteration(goal, testProjectPath, {
        metrics: { validation: { percentage: 75 } },
        overallProgress: 75
      });

      expect(plan2.strategy.type).toBe('refinement');
    });
  });

  describe('Missing Component Detection', () => {
    test('should identify missing components accurately', async () => {
      const goal = 'Build a REST API';
      const criteria = await validator.parseGoal(goal);
      const results = await validator.validateGoal(testProjectPath, criteria);
      
      const missing = validator.getMissingComponents(results);

      expect(missing).toHaveProperty('critical');
      expect(missing).toHaveProperty('important');
      expect(missing).toHaveProperty('optional');

      // Should have critical missing components for empty project
      expect(missing.critical.length).toBeGreaterThan(0);
      expect(missing.critical[0]).toHaveProperty('component');
      expect(missing.critical[0]).toHaveProperty('reason');
      expect(missing.critical[0]).toHaveProperty('hints');
    });
  });

  describe('Real vs Fake Progress', () => {
    test('should not show progress for non-functional code', async () => {
      // Create fake implementation that looks complete but doesn't work
      const fakeCode = `
// This looks like a trading system but doesn't actually work
class TradingSystem {
  calculateProfit() {
    // TODO: implement
    return 0;
  }
  
  backtest() {
    // Not implemented
    throw new Error('Not implemented');
  }
}
`;

      await fs.writeFile(path.join(testProjectPath, 'fake-trading.js'), fakeCode);

      const goal = 'Build a profitable trading system';
      const criteria = await validator.parseGoal(goal);
      const results = await validator.validateGoal(testProjectPath, criteria);

      // Should fail validation despite having code
      expect(results.overall.percentage).toBeLessThan(50);
      
      const profitCalc = results.details.find(d => d.id === 'trading-profit-calculation');
      expect(profitCalc.success).toBe(false);
      expect(profitCalc.message).toContain('does not account for fees');
    });

    test('should validate actual functionality not just file presence', async () => {
      // Create README without actual implementation
      await fs.writeFile(path.join(testProjectPath, 'README.md'), '# Project');
      
      // Create empty test file
      await fs.writeFile(path.join(testProjectPath, 'test.js'), '// tests');

      const goal = 'Build a tested API';
      const criteria = await validator.parseGoal(goal);
      const results = await validator.validateGoal(testProjectPath, criteria);

      // Should fail because tests don't actually run
      const testResult = results.details.find(d => d.id === 'tests-pass');
      expect(testResult.success).toBe(false);
    });
  });
});

/**
 * Example: How the validation system prevents fake progress
 */
describe('Validation System Demo', () => {
  test('demonstrates real validation', async () => {
    console.log('\n🎯 Goal Validation System Demo\n');
    
    const goal = 'Build a profitable cryptocurrency trading system';
    console.log(`Goal: ${goal}\n`);
    
    // Parse into concrete criteria
    const criteria = await validator.parseGoal(goal);
    console.log('Concrete Success Criteria:');
    
    let totalCriteria = 0;
    for (const [category, items] of Object.entries(criteria)) {
      if (items.length > 0) {
        console.log(`\n${category.toUpperCase()}:`);
        items.forEach(item => {
          console.log(`  ✓ ${item.description}`);
          totalCriteria++;
        });
      }
    }
    
    console.log(`\nTotal validation points: ${totalCriteria}`);
    
    // Show what happens with empty project
    console.log('\n--- Empty Project Validation ---');
    const emptyResults = await validator.validateGoal(testProjectPath, criteria);
    console.log(`Progress: ${emptyResults.overall.percentage.toFixed(1)}%`);
    console.log(`Passed: ${emptyResults.overall.passed}/${emptyResults.overall.total}`);
    
    // Show missing components
    const missing = validator.getMissingComponents(emptyResults);
    console.log('\nMissing Components:');
    console.log(`Critical: ${missing.critical.length}`);
    console.log(`Important: ${missing.important.length}`);
    console.log(`Optional: ${missing.optional.length}`);
    
    if (missing.critical.length > 0) {
      console.log('\nCritical components needed:');
      missing.critical.slice(0, 3).forEach(m => {
        console.log(`  • ${m.component}`);
        console.log(`    Reason: ${m.reason}`);
      });
    }
    
    // Show adaptive planning
    console.log('\n--- Adaptive Planning ---');
    const plan = await adaptivePlanner.planNextIteration(
      { description: goal },
      testProjectPath
    );
    
    console.log(`\nRecommended swarms for iteration ${plan.iteration}:`);
    plan.swarms.forEach(swarm => {
      console.log(`  • ${swarm.type} [${swarm.priority}]: ${swarm.focus}`);
    });
    
    console.log(`\nEstimated time: ${plan.estimatedTime.formatted}`);
    console.log(`Confidence: ${plan.confidence}%`);
    console.log(`Strategy: ${plan.strategy.type} (${plan.strategy.description})`);
  });
});