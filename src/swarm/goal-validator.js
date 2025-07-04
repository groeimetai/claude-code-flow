/**
 * Goal Validation System
 * Validates whether goals are actually achieved through concrete success criteria
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Logger } from '../core/logger.js';
const logger = new Logger({ component: 'GoalValidator' });

export class GoalValidationSystem {
  constructor() {
    this.validators = new Map();
    this.validationResults = new Map();
    this.testRunners = new Map();
    this.registerBuiltInValidators();
  }

  /**
   * Parse natural language goal into concrete success criteria
   */
  async parseGoal(goalDescription) {
    const criteria = {
      functional: [],
      performance: [],
      quality: [],
      security: [],
      documentation: [],
      testing: []
    };

    const lowerGoal = goalDescription.toLowerCase();

    // Trading system specific criteria
    if (lowerGoal.includes('trading') || lowerGoal.includes('profitable')) {
      criteria.functional.push({
        id: 'trading-profit-calculation',
        description: 'System calculates profit/loss correctly',
        validator: 'tradingSystemValidator',
        test: 'verifyProfitCalculation'
      });
      criteria.functional.push({
        id: 'trading-backtesting',
        description: 'Backtesting framework is implemented and functional',
        validator: 'tradingSystemValidator',
        test: 'verifyBacktesting'
      });
      criteria.functional.push({
        id: 'trading-risk-management',
        description: 'Risk management features (stop-loss, position sizing) exist',
        validator: 'tradingSystemValidator',
        test: 'verifyRiskManagement'
      });
      criteria.performance.push({
        id: 'trading-profitability',
        description: 'System shows positive returns in backtesting',
        validator: 'tradingSystemValidator',
        test: 'verifyProfitability',
        threshold: 0.01 // 1% minimum profit
      });
    }

    // REST API specific criteria
    if (lowerGoal.includes('api') || lowerGoal.includes('rest')) {
      criteria.functional.push({
        id: 'api-endpoints-exist',
        description: 'All required endpoints are implemented',
        validator: 'apiValidator',
        test: 'verifyEndpoints'
      });
      criteria.functional.push({
        id: 'api-authentication',
        description: 'Authentication/authorization is implemented',
        validator: 'apiValidator',
        test: 'verifyAuthentication'
      });
      criteria.performance.push({
        id: 'api-response-time',
        description: 'API responds within acceptable time',
        validator: 'apiValidator',
        test: 'verifyResponseTime',
        threshold: 1000 // ms
      });
      criteria.quality.push({
        id: 'api-error-handling',
        description: 'Proper error handling and status codes',
        validator: 'apiValidator',
        test: 'verifyErrorHandling'
      });
    }

    // Documentation criteria (common to most goals)
    if (lowerGoal.includes('document') || !lowerGoal.includes('undocumented')) {
      criteria.documentation.push({
        id: 'readme-exists',
        description: 'README.md exists with setup instructions',
        validator: 'documentationValidator',
        test: 'verifyReadmeExists'
      });
      criteria.documentation.push({
        id: 'api-docs',
        description: 'API documentation is complete',
        validator: 'documentationValidator',
        test: 'verifyApiDocs'
      });
    }

    // Testing criteria (common to all code projects)
    if (lowerGoal.includes('test') || lowerGoal.includes('tested')) {
      criteria.testing.push({
        id: 'test-coverage',
        description: 'Code coverage meets minimum threshold',
        validator: 'testingValidator',
        test: 'verifyCodeCoverage',
        threshold: 70 // 70% minimum coverage
      });
      criteria.testing.push({
        id: 'tests-pass',
        description: 'All tests pass successfully',
        validator: 'testingValidator',
        test: 'verifyTestsPass'
      });
    }

    // Security criteria
    if (lowerGoal.includes('secure') || lowerGoal.includes('security')) {
      criteria.security.push({
        id: 'security-headers',
        description: 'Security headers are properly configured',
        validator: 'securityValidator',
        test: 'verifySecurityHeaders'
      });
      criteria.security.push({
        id: 'input-validation',
        description: 'Input validation prevents injection attacks',
        validator: 'securityValidator',
        test: 'verifyInputValidation'
      });
    }

    // Generic criteria based on keywords
    if (lowerGoal.includes('performan') || lowerGoal.includes('fast')) {
      criteria.performance.push({
        id: 'performance-benchmarks',
        description: 'Performance meets specified benchmarks',
        validator: 'performanceValidator',
        test: 'verifyPerformanceBenchmarks'
      });
    }

    return criteria;
  }

  /**
   * Register built-in validators
   */
  registerBuiltInValidators() {
    // Trading System Validator
    this.validators.set('tradingSystemValidator', {
      verifyProfitCalculation: async (projectPath) => {
        try {
          // Look for profit calculation functions
          const files = await this.findFiles(projectPath, ['*.js', '*.ts', '*.py']);
          let found = false;
          
          for (const file of files) {
            const content = await fs.readFile(file, 'utf-8');
            if (content.match(/calculate.*profit|profit.*calculation|pnl|returns/i)) {
              found = true;
              
              // Check if calculation includes fees
              if (!content.match(/fee|commission|slippage/i)) {
                return {
                  success: false,
                  message: 'Profit calculation found but does not account for fees/commissions',
                  details: { file, issue: 'missing_fees' }
                };
              }
              break;
            }
          }
          
          return {
            success: found,
            message: found ? 'Profit calculation logic found' : 'No profit calculation found',
            details: { filesChecked: files.length }
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      },

      verifyBacktesting: async (projectPath) => {
        try {
          const files = await this.findFiles(projectPath, ['*.js', '*.ts', '*.py']);
          let hasBacktest = false;
          let hasHistoricalData = false;
          
          for (const file of files) {
            const content = await fs.readFile(file, 'utf-8');
            if (content.match(/backtest|historical.*test|strategy.*test/i)) {
              hasBacktest = true;
            }
            if (content.match(/historical.*data|price.*history|ohlc/i)) {
              hasHistoricalData = true;
            }
          }
          
          return {
            success: hasBacktest && hasHistoricalData,
            message: hasBacktest ? 
              (hasHistoricalData ? 'Backtesting framework found' : 'Backtesting found but no historical data handling') :
              'No backtesting implementation found',
            details: { hasBacktest, hasHistoricalData }
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      },

      verifyRiskManagement: async (projectPath) => {
        try {
          const files = await this.findFiles(projectPath, ['*.js', '*.ts', '*.py']);
          const riskFeatures = {
            stopLoss: false,
            positionSizing: false,
            maxDrawdown: false,
            riskReward: false
          };
          
          for (const file of files) {
            const content = await fs.readFile(file, 'utf-8');
            if (content.match(/stop.*loss|stopLoss/i)) riskFeatures.stopLoss = true;
            if (content.match(/position.*siz|lot.*siz|kelly/i)) riskFeatures.positionSizing = true;
            if (content.match(/drawdown|max.*loss/i)) riskFeatures.maxDrawdown = true;
            if (content.match(/risk.*reward|r.*ratio/i)) riskFeatures.riskReward = true;
          }
          
          const implementedFeatures = Object.values(riskFeatures).filter(v => v).length;
          const success = implementedFeatures >= 2; // At least 2 risk features
          
          return {
            success,
            message: `${implementedFeatures}/4 risk management features implemented`,
            details: riskFeatures
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      },

      verifyProfitability: async (projectPath, criterion) => {
        try {
          // Look for backtest results
          const files = await this.findFiles(projectPath, ['*result*.json', '*backtest*.json', '*.log']);
          
          for (const file of files) {
            const content = await fs.readFile(file, 'utf-8');
            
            // Try to parse JSON results
            try {
              const data = JSON.parse(content);
              if (data.returns || data.profit || data.pnl) {
                const profit = data.returns || data.profit || data.pnl;
                const success = profit > (criterion.threshold || 0.01);
                return {
                  success,
                  message: `Backtest shows ${(profit * 100).toFixed(2)}% returns`,
                  details: { profit, threshold: criterion.threshold }
                };
              }
            } catch {
              // Not JSON, check for profit mentions in logs
              const profitMatch = content.match(/profit.*?([+-]?\d+\.?\d*)/i);
              if (profitMatch) {
                const profit = parseFloat(profitMatch[1]) / 100;
                const success = profit > (criterion.threshold || 0.01);
                return {
                  success,
                  message: `Found profit: ${(profit * 100).toFixed(2)}%`,
                  details: { profit, source: file }
                };
              }
            }
          }
          
          return {
            success: false,
            message: 'No profitability data found in backtest results',
            details: { filesChecked: files.length }
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      }
    });

    // API Validator
    this.validators.set('apiValidator', {
      verifyEndpoints: async (projectPath) => {
        try {
          const files = await this.findFiles(projectPath, ['*.js', '*.ts', '*.py']);
          const endpoints = new Set();
          const methods = new Set();
          
          for (const file of files) {
            const content = await fs.readFile(file, 'utf-8');
            
            // Express/Node patterns
            const routeMatches = content.matchAll(/app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)/g);
            for (const match of routeMatches) {
              methods.add(match[1].toUpperCase());
              endpoints.add(match[2]);
            }
            
            // FastAPI/Python patterns
            const fastApiMatches = content.matchAll(/@app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)/g);
            for (const match of fastApiMatches) {
              methods.add(match[1].toUpperCase());
              endpoints.add(match[2]);
            }
          }
          
          const hasBasicCRUD = 
            methods.has('GET') && 
            methods.has('POST') && 
            (methods.has('PUT') || methods.has('PATCH'));
          
          return {
            success: endpoints.size >= 3 && hasBasicCRUD,
            message: `Found ${endpoints.size} endpoints with ${methods.size} HTTP methods`,
            details: {
              endpoints: Array.from(endpoints),
              methods: Array.from(methods),
              hasBasicCRUD
            }
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      },

      verifyAuthentication: async (projectPath) => {
        try {
          const files = await this.findFiles(projectPath, ['*.js', '*.ts', '*.py']);
          const authFeatures = {
            jwt: false,
            oauth: false,
            basicAuth: false,
            apiKey: false,
            middleware: false
          };
          
          for (const file of files) {
            const content = await fs.readFile(file, 'utf-8');
            if (content.match(/jwt|jsonwebtoken/i)) authFeatures.jwt = true;
            if (content.match(/oauth|passport/i)) authFeatures.oauth = true;
            if (content.match(/basic.*auth|authorization.*basic/i)) authFeatures.basicAuth = true;
            if (content.match(/api.*key|x-api-key/i)) authFeatures.apiKey = true;
            if (content.match(/auth.*middleware|verify.*token|authenticate/i)) authFeatures.middleware = true;
          }
          
          const hasAuth = Object.values(authFeatures).some(v => v);
          
          return {
            success: hasAuth && authFeatures.middleware,
            message: hasAuth ? 'Authentication implemented' : 'No authentication found',
            details: authFeatures
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      },

      verifyResponseTime: async (projectPath, criterion) => {
        try {
          // Run API tests if they exist
          const testCommand = await this.detectTestCommand(projectPath);
          if (testCommand && testCommand.includes('test')) {
            const result = await this.runCommand(testCommand, projectPath);
            
            // Look for response time in output
            const timeMatch = result.output.match(/response.*?(\d+).*?ms/i);
            if (timeMatch) {
              const responseTime = parseInt(timeMatch[1]);
              const success = responseTime < (criterion.threshold || 1000);
              return {
                success,
                message: `Average response time: ${responseTime}ms`,
                details: { responseTime, threshold: criterion.threshold }
              };
            }
          }
          
          // Fallback: check for performance tests
          const files = await this.findFiles(projectPath, ['*test*.js', '*spec*.js', '*.test.ts']);
          for (const file of files) {
            const content = await fs.readFile(file, 'utf-8');
            if (content.match(/response.*time|performance.*test|load.*test/i)) {
              return {
                success: true,
                message: 'Performance tests found',
                details: { file }
              };
            }
          }
          
          return {
            success: false,
            message: 'No response time validation found',
            details: {}
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      },

      verifyErrorHandling: async (projectPath) => {
        try {
          const files = await this.findFiles(projectPath, ['*.js', '*.ts', '*.py']);
          const errorFeatures = {
            tryCtach: false,
            errorMiddleware: false,
            statusCodes: false,
            errorResponse: false
          };
          
          for (const file of files) {
            const content = await fs.readFile(file, 'utf-8');
            if (content.match(/try\s*{[\s\S]*?}\s*catch/)) errorFeatures.tryCatch = true;
            if (content.match(/error.*middleware|app\.use.*err/i)) errorFeatures.errorMiddleware = true;
            if (content.match(/status\(4\d\d\)|status\(5\d\d\)/)) errorFeatures.statusCodes = true;
            if (content.match(/res\..*error|error.*response/i)) errorFeatures.errorResponse = true;
          }
          
          const implementedFeatures = Object.values(errorFeatures).filter(v => v).length;
          const success = implementedFeatures >= 3;
          
          return {
            success,
            message: `${implementedFeatures}/4 error handling features implemented`,
            details: errorFeatures
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      }
    });

    // Documentation Validator
    this.validators.set('documentationValidator', {
      verifyReadmeExists: async (projectPath) => {
        try {
          const readmePath = path.join(projectPath, 'README.md');
          const exists = await fs.access(readmePath).then(() => true).catch(() => false);
          
          if (!exists) {
            return { success: false, message: 'README.md not found' };
          }
          
          const content = await fs.readFile(readmePath, 'utf-8');
          const hasSetup = content.match(/install|setup|getting.*started/i);
          const hasUsage = content.match(/usage|example|how.*to/i);
          const hasDescription = content.length > 100;
          
          const quality = [hasSetup, hasUsage, hasDescription].filter(v => v).length;
          
          return {
            success: quality >= 2,
            message: `README.md exists with ${quality}/3 quality markers`,
            details: { hasSetup: !!hasSetup, hasUsage: !!hasUsage, hasDescription }
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      },

      verifyApiDocs: async (projectPath) => {
        try {
          // Check for various documentation formats
          const docPatterns = [
            'swagger.json', 'swagger.yaml', 'openapi.json', 'openapi.yaml',
            'docs/*.md', 'documentation/*.md', 'api-docs.*'
          ];
          
          let foundDocs = false;
          let docType = null;
          
          for (const pattern of docPatterns) {
            const files = await this.findFiles(projectPath, [pattern]);
            if (files.length > 0) {
              foundDocs = true;
              docType = pattern;
              break;
            }
          }
          
          // Also check for inline documentation
          if (!foundDocs) {
            const files = await this.findFiles(projectPath, ['*.js', '*.ts']);
            for (const file of files) {
              const content = await fs.readFile(file, 'utf-8');
              if (content.match(/\/\*\*[\s\S]*?@api|@swagger|@openapi/)) {
                foundDocs = true;
                docType = 'inline JSDoc/Swagger';
                break;
              }
            }
          }
          
          return {
            success: foundDocs,
            message: foundDocs ? `API documentation found: ${docType}` : 'No API documentation found',
            details: { docType }
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      }
    });

    // Testing Validator
    this.validators.set('testingValidator', {
      verifyCodeCoverage: async (projectPath, criterion) => {
        try {
          // Try to run coverage command
          const packageJson = path.join(projectPath, 'package.json');
          if (await fs.access(packageJson).then(() => true).catch(() => false)) {
            const pkg = JSON.parse(await fs.readFile(packageJson, 'utf-8'));
            
            if (pkg.scripts && pkg.scripts.coverage) {
              const result = await this.runCommand('npm run coverage', projectPath);
              
              // Parse coverage from output
              const coverageMatch = result.output.match(/(?:overall\s+)?coverage[:\s]+(\d+(?:\.\d+)?)/i);
              if (coverageMatch) {
                const coverage = parseFloat(coverageMatch[1]);
                const threshold = criterion.threshold || 70;
                return {
                  success: coverage >= threshold,
                  message: `Code coverage: ${coverage}%`,
                  details: { coverage, threshold }
                };
              }
            }
          }
          
          // Check for coverage reports
          const coverageFiles = await this.findFiles(projectPath, ['coverage/**/*.json', 'coverage.txt']);
          if (coverageFiles.length > 0) {
            return {
              success: true,
              message: 'Coverage reports found',
              details: { files: coverageFiles.length }
            };
          }
          
          // Check if tests exist at all
          const testFiles = await this.findFiles(projectPath, ['*.test.js', '*.spec.js', '*.test.ts', 'test_*.py']);
          return {
            success: false,
            message: testFiles.length > 0 ? 'Tests exist but no coverage data' : 'No tests found',
            details: { testFiles: testFiles.length }
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      },

      verifyTestsPass: async (projectPath) => {
        try {
          const testCommand = await this.detectTestCommand(projectPath);
          if (!testCommand) {
            return { success: false, message: 'No test command found' };
          }
          
          const result = await this.runCommand(testCommand, projectPath);
          
          // Check for common test result patterns
          const isPassing = 
            result.exitCode === 0 ||
            result.output.match(/all tests pass|tests? passed|✓|✔|PASS/i) ||
            !result.output.match(/fail|error|✗|✘|FAIL/i);
          
          // Extract test counts if possible
          const testCount = result.output.match(/(\d+)\s+(?:tests?|specs?)/i);
          const passCount = result.output.match(/(\d+)\s+pass/i);
          
          return {
            success: isPassing,
            message: isPassing ? 'All tests pass' : 'Tests are failing',
            details: {
              exitCode: result.exitCode,
              totalTests: testCount ? parseInt(testCount[1]) : null,
              passingTests: passCount ? parseInt(passCount[1]) : null
            }
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      }
    });

    // Security Validator
    this.validators.set('securityValidator', {
      verifySecurityHeaders: async (projectPath) => {
        try {
          const files = await this.findFiles(projectPath, ['*.js', '*.ts']);
          const headers = {
            helmet: false,
            cors: false,
            csp: false,
            hsts: false
          };
          
          for (const file of files) {
            const content = await fs.readFile(file, 'utf-8');
            if (content.match(/helmet|security.*headers/i)) headers.helmet = true;
            if (content.match(/cors|cross.*origin/i)) headers.cors = true;
            if (content.match(/content.*security.*policy|csp/i)) headers.csp = true;
            if (content.match(/strict.*transport.*security|hsts/i)) headers.hsts = true;
          }
          
          const implementedHeaders = Object.values(headers).filter(v => v).length;
          const success = implementedHeaders >= 2;
          
          return {
            success,
            message: `${implementedHeaders}/4 security headers configured`,
            details: headers
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      },

      verifyInputValidation: async (projectPath) => {
        try {
          const files = await this.findFiles(projectPath, ['*.js', '*.ts', '*.py']);
          const validationFeatures = {
            sanitization: false,
            validation: false,
            parameterization: false,
            escaping: false
          };
          
          for (const file of files) {
            const content = await fs.readFile(file, 'utf-8');
            if (content.match(/sanitiz|dompurify|bleach/i)) validationFeatures.sanitization = true;
            if (content.match(/validat|joi|express-validator|yup/i)) validationFeatures.validation = true;
            if (content.match(/prepared.*statement|parameteriz/i)) validationFeatures.parameterization = true;
            if (content.match(/escape|encode.*html/i)) validationFeatures.escaping = true;
          }
          
          const implementedFeatures = Object.values(validationFeatures).filter(v => v).length;
          const success = implementedFeatures >= 2;
          
          return {
            success,
            message: `${implementedFeatures}/4 input validation features found`,
            details: validationFeatures
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      }
    });

    // Performance Validator
    this.validators.set('performanceValidator', {
      verifyPerformanceBenchmarks: async (projectPath) => {
        try {
          // Look for benchmark files
          const benchmarkFiles = await this.findFiles(projectPath, ['*bench*.js', '*perf*.js', 'benchmark/**/*']);
          
          if (benchmarkFiles.length > 0) {
            // Try to run benchmarks
            for (const file of benchmarkFiles) {
              if (file.endsWith('.js')) {
                try {
                  const result = await this.runCommand(`node ${path.basename(file)}`, path.dirname(file));
                  if (result.output.match(/ops\/sec|ms|performance/i)) {
                    return {
                      success: true,
                      message: 'Performance benchmarks found and executable',
                      details: { file, output: result.output.slice(0, 200) }
                    };
                  }
                } catch {
                  // Continue to next file
                }
              }
            }
            
            return {
              success: true,
              message: 'Performance benchmark files found',
              details: { files: benchmarkFiles.length }
            };
          }
          
          // Check for performance monitoring in code
          const files = await this.findFiles(projectPath, ['*.js', '*.ts']);
          for (const file of files) {
            const content = await fs.readFile(file, 'utf-8');
            if (content.match(/performance\.(now|mark|measure)|console\.time/i)) {
              return {
                success: true,
                message: 'Performance monitoring code found',
                details: { file }
              };
            }
          }
          
          return {
            success: false,
            message: 'No performance benchmarks or monitoring found',
            details: {}
          };
        } catch (error) {
          return { success: false, message: error.message, error: true };
        }
      }
    });
  }

  /**
   * Run validation for all criteria
   */
  async validateGoal(projectPath, criteria) {
    const results = {
      overall: {
        total: 0,
        passed: 0,
        failed: 0,
        percentage: 0
      },
      categories: {},
      details: []
    };

    // Count total criteria
    for (const category of Object.keys(criteria)) {
      results.overall.total += criteria[category].length;
      results.categories[category] = {
        total: criteria[category].length,
        passed: 0,
        failed: 0,
        results: []
      };
    }

    // Run validations
    for (const [category, criteriaList] of Object.entries(criteria)) {
      for (const criterion of criteriaList) {
        logger.info(`Validating: ${criterion.description}`);
        
        const validator = this.validators.get(criterion.validator);
        if (!validator || !validator[criterion.test]) {
          logger.warn(`Validator not found: ${criterion.validator}.${criterion.test}`);
          continue;
        }

        try {
          const result = await validator[criterion.test](projectPath, criterion);
          
          const validationResult = {
            id: criterion.id,
            description: criterion.description,
            category,
            ...result
          };

          results.details.push(validationResult);
          results.categories[category].results.push(validationResult);

          if (result.success) {
            results.overall.passed++;
            results.categories[category].passed++;
          } else {
            results.overall.failed++;
            results.categories[category].failed++;
          }
        } catch (error) {
          logger.error(`Validation error for ${criterion.id}:`, error);
          const errorResult = {
            id: criterion.id,
            description: criterion.description,
            category,
            success: false,
            message: `Validation error: ${error.message}`,
            error: true
          };
          results.details.push(errorResult);
          results.categories[category].results.push(errorResult);
          results.overall.failed++;
          results.categories[category].failed++;
        }
      }
    }

    // Calculate percentage
    results.overall.percentage = results.overall.total > 0 
      ? (results.overall.passed / results.overall.total) * 100 
      : 0;

    // Store results
    this.validationResults.set(projectPath, results);

    return results;
  }

  /**
   * Get missing components based on validation results
   */
  getMissingComponents(validationResults) {
    const missing = {
      critical: [],
      important: [],
      optional: []
    };

    for (const detail of validationResults.details) {
      if (!detail.success) {
        // Categorize by importance
        if (detail.category === 'functional' || detail.category === 'security') {
          missing.critical.push({
            component: detail.description,
            reason: detail.message,
            hints: this.getImplementationHints(detail)
          });
        } else if (detail.category === 'testing' || detail.category === 'quality') {
          missing.important.push({
            component: detail.description,
            reason: detail.message,
            hints: this.getImplementationHints(detail)
          });
        } else {
          missing.optional.push({
            component: detail.description,
            reason: detail.message,
            hints: this.getImplementationHints(detail)
          });
        }
      }
    }

    return missing;
  }

  /**
   * Get implementation hints for missing components
   */
  getImplementationHints(validationDetail) {
    const hints = {
      'trading-profit-calculation': [
        'Implement a calculatePnL() function that accounts for fees',
        'Include commission and slippage in calculations',
        'Track both realized and unrealized profits'
      ],
      'trading-backtesting': [
        'Create a backtesting framework that processes historical data',
        'Implement strategy.backtest() method',
        'Store and analyze backtest results'
      ],
      'api-endpoints-exist': [
        'Define RESTful routes for CRUD operations',
        'Use Express.js or FastAPI for routing',
        'Implement at least GET, POST, PUT/PATCH endpoints'
      ],
      'test-coverage': [
        'Add unit tests for all major functions',
        'Use Jest, Mocha, or pytest for testing',
        'Run coverage reports with npm run coverage'
      ],
      'readme-exists': [
        'Create README.md with setup instructions',
        'Include usage examples and API documentation',
        'Add installation steps and requirements'
      ]
    };

    return hints[validationDetail.id] || ['Implement the required functionality', 'Add appropriate tests'];
  }

  /**
   * Generate detailed validation report
   */
  generateReport(validationResults) {
    const lines = [
      '🎯 Goal Validation Report',
      '========================',
      '',
      `Overall Progress: ${validationResults.overall.percentage.toFixed(1)}%`,
      `✅ Passed: ${validationResults.overall.passed}/${validationResults.overall.total}`,
      `❌ Failed: ${validationResults.overall.failed}/${validationResults.overall.total}`,
      ''
    ];

    // Category breakdown
    lines.push('Category Breakdown:');
    lines.push('------------------');
    for (const [category, stats] of Object.entries(validationResults.categories)) {
      if (stats.total > 0) {
        const percentage = (stats.passed / stats.total) * 100;
        lines.push(`${category}: ${percentage.toFixed(1)}% (${stats.passed}/${stats.total})`);
      }
    }
    lines.push('');

    // Detailed results
    lines.push('Detailed Results:');
    lines.push('----------------');
    for (const [category, stats] of Object.entries(validationResults.categories)) {
      if (stats.results.length > 0) {
        lines.push(`\n${category.toUpperCase()}:`);
        for (const result of stats.results) {
          const icon = result.success ? '✅' : '❌';
          lines.push(`  ${icon} ${result.description}`);
          lines.push(`     ${result.message}`);
          if (result.details && Object.keys(result.details).length > 0) {
            lines.push(`     Details: ${JSON.stringify(result.details, null, 2).replace(/\n/g, '\n     ')}`);
          }
        }
      }
    }

    // Missing components
    const missing = this.getMissingComponents(validationResults);
    if (missing.critical.length > 0 || missing.important.length > 0) {
      lines.push('\n\n🔧 Missing Components:');
      lines.push('--------------------');
      
      if (missing.critical.length > 0) {
        lines.push('\nCRITICAL (Must Fix):');
        for (const item of missing.critical) {
          lines.push(`  • ${item.component}`);
          lines.push(`    Reason: ${item.reason}`);
          lines.push(`    Hints:`);
          for (const hint of item.hints) {
            lines.push(`      - ${hint}`);
          }
        }
      }
      
      if (missing.important.length > 0) {
        lines.push('\nIMPORTANT (Should Fix):');
        for (const item of missing.important) {
          lines.push(`  • ${item.component}`);
          lines.push(`    Reason: ${item.reason}`);
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Helper methods
   */
  async findFiles(projectPath, patterns) {
    const files = [];
    const glob = (await import('glob')).glob;
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, { 
        cwd: projectPath,
        absolute: true,
        ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**']
      });
      files.push(...matches);
    }
    
    return [...new Set(files)]; // Remove duplicates
  }

  async runCommand(command, cwd) {
    return new Promise((resolve) => {
      const proc = spawn(command, [], { 
        shell: true, 
        cwd,
        timeout: 30000 // 30 second timeout
      });
      
      let output = '';
      let error = '';
      
      proc.stdout.on('data', (data) => output += data.toString());
      proc.stderr.on('data', (data) => error += data.toString());
      
      proc.on('close', (code) => {
        resolve({
          exitCode: code,
          output: output + error,
          success: code === 0
        });
      });
      
      proc.on('error', (err) => {
        resolve({
          exitCode: -1,
          output: err.message,
          success: false
        });
      });
    });
  }

  async detectTestCommand(projectPath) {
    try {
      const packageJson = path.join(projectPath, 'package.json');
      if (await fs.access(packageJson).then(() => true).catch(() => false)) {
        const pkg = JSON.parse(await fs.readFile(packageJson, 'utf-8'));
        if (pkg.scripts) {
          if (pkg.scripts.test) return 'npm test';
          if (pkg.scripts.jest) return 'npm run jest';
          if (pkg.scripts.mocha) return 'npm run mocha';
        }
      }
      
      // Python
      if (await fs.access(path.join(projectPath, 'setup.py')).then(() => true).catch(() => false)) {
        return 'python -m pytest';
      }
      
      // Direct test file execution
      const testFiles = await this.findFiles(projectPath, ['test.js', 'test.py', 'spec.js']);
      if (testFiles.length > 0) {
        const ext = path.extname(testFiles[0]);
        return ext === '.py' ? `python ${testFiles[0]}` : `node ${testFiles[0]}`;
      }
      
      return null;
    } catch {
      return null;
    }
  }
}