/**
 * Progress Calculator based on Real Metrics
 * Calculates actual progress based on validation results, not arbitrary percentages
 */

import { GoalValidationSystem } from './goal-validator.js';
import { logger } from '../core/logger.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

export class ProgressCalculator {
  constructor() {
    this.validator = new GoalValidationSystem();
    this.metrics = new Map();
    this.history = [];
    this.benchmarks = this.loadBenchmarks();
  }

  /**
   * Calculate real progress based on multiple factors
   */
  async calculateProgress(projectPath, goal, previousResults = null) {
    const metrics = {
      validation: await this.calculateValidationProgress(projectPath, goal),
      code: await this.calculateCodeMetrics(projectPath),
      tests: await this.calculateTestMetrics(projectPath),
      performance: await this.calculatePerformanceMetrics(projectPath),
      documentation: await this.calculateDocumentationMetrics(projectPath),
      deployment: await this.calculateDeploymentReadiness(projectPath)
    };

    // Weight different aspects based on goal type
    const weights = this.getWeightsForGoal(goal);
    
    // Calculate weighted progress
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const [category, weight] of Object.entries(weights)) {
      if (metrics[category]) {
        weightedSum += metrics[category].percentage * weight;
        totalWeight += weight;
      }
    }
    
    const overallProgress = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    // Compare with previous results for momentum
    const momentum = this.calculateMomentum(metrics, previousResults);
    
    // Store in history
    const result = {
      timestamp: new Date(),
      projectPath,
      goal: goal.description,
      metrics,
      weights,
      overallProgress,
      momentum,
      isComplete: this.isGoalComplete(metrics, goal),
      bottlenecks: this.identifyBottlenecks(metrics),
      nextSteps: this.suggestNextSteps(metrics, goal)
    };
    
    this.history.push(result);
    this.metrics.set(projectPath, result);
    
    return result;
  }

  /**
   * Calculate validation-based progress
   */
  async calculateValidationProgress(projectPath, goal) {
    try {
      // Parse goal into criteria
      const criteria = await this.validator.parseGoal(goal.description);
      
      // Run validation
      const validationResults = await this.validator.validateGoal(projectPath, criteria);
      
      return {
        percentage: validationResults.overall.percentage,
        passed: validationResults.overall.passed,
        total: validationResults.overall.total,
        categories: validationResults.categories,
        missing: this.validator.getMissingComponents(validationResults)
      };
    } catch (error) {
      logger.error('Validation progress calculation failed:', error);
      return { percentage: 0, error: error.message };
    }
  }

  /**
   * Calculate code quality metrics
   */
  async calculateCodeMetrics(projectPath) {
    const metrics = {
      linesOfCode: 0,
      files: 0,
      complexity: 0,
      coverage: 0,
      techDebt: 0,
      duplicates: 0
    };

    try {
      // Count lines of code and files
      const codeFiles = await this.findCodeFiles(projectPath);
      metrics.files = codeFiles.length;
      
      for (const file of codeFiles) {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');
        metrics.linesOfCode += lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;
        
        // Simple complexity estimation (cyclomatic complexity)
        const complexityIndicators = content.match(/if\s*\(|while\s*\(|for\s*\(|case\s+|catch\s*\(/g);
        metrics.complexity += complexityIndicators ? complexityIndicators.length : 0;
      }
      
      // Normalize complexity
      metrics.complexity = metrics.files > 0 ? metrics.complexity / metrics.files : 0;
      
      // Try to get coverage from existing reports
      metrics.coverage = await this.getCoverageFromReports(projectPath);
      
      // Estimate technical debt (simple heuristic)
      metrics.techDebt = await this.estimateTechDebt(projectPath);
      
      // Calculate overall code quality score
      const qualityScore = this.calculateCodeQualityScore(metrics);
      
      return {
        percentage: qualityScore,
        metrics,
        quality: this.getQualityLevel(qualityScore)
      };
    } catch (error) {
      logger.error('Code metrics calculation failed:', error);
      return { percentage: 0, error: error.message };
    }
  }

  /**
   * Calculate test metrics
   */
  async calculateTestMetrics(projectPath) {
    const metrics = {
      testFiles: 0,
      testCases: 0,
      coverage: 0,
      passing: 0,
      failing: 0,
      testTypes: new Set()
    };

    try {
      // Find test files
      const testFiles = await this.findTestFiles(projectPath);
      metrics.testFiles = testFiles.length;
      
      // Analyze test content
      for (const file of testFiles) {
        const content = await fs.readFile(file, 'utf-8');
        
        // Count test cases
        const testMatches = content.match(/test\s*\(|it\s*\(|describe\s*\(|def\s+test_/g);
        metrics.testCases += testMatches ? testMatches.length : 0;
        
        // Identify test types
        if (content.match(/unit|Unit/)) metrics.testTypes.add('unit');
        if (content.match(/integration|Integration/)) metrics.testTypes.add('integration');
        if (content.match(/e2e|end.*to.*end|E2E/)) metrics.testTypes.add('e2e');
        if (content.match(/performance|benchmark/i)) metrics.testTypes.add('performance');
      }
      
      // Try to run tests and get results
      const testResults = await this.runTests(projectPath);
      if (testResults) {
        metrics.passing = testResults.passing;
        metrics.failing = testResults.failing;
        metrics.coverage = testResults.coverage || metrics.coverage;
      }
      
      // Calculate test quality score
      const testScore = this.calculateTestScore(metrics);
      
      return {
        percentage: testScore,
        metrics: {
          ...metrics,
          testTypes: Array.from(metrics.testTypes)
        },
        quality: this.getTestQuality(metrics)
      };
    } catch (error) {
      logger.error('Test metrics calculation failed:', error);
      return { percentage: 0, error: error.message };
    }
  }

  /**
   * Calculate performance metrics
   */
  async calculatePerformanceMetrics(projectPath) {
    const metrics = {
      hasPerformanceTests: false,
      benchmarks: [],
      optimization: {
        caching: false,
        lazyLoading: false,
        asyncOperations: false,
        indexing: false
      },
      buildSize: 0,
      loadTime: null
    };

    try {
      // Check for performance tests
      const perfFiles = await this.findFiles(projectPath, ['*perf*.js', '*bench*.js', '*performance*']);
      metrics.hasPerformanceTests = perfFiles.length > 0;
      
      // Check for optimization patterns
      const codeFiles = await this.findCodeFiles(projectPath);
      for (const file of codeFiles.slice(0, 20)) { // Sample first 20 files
        const content = await fs.readFile(file, 'utf-8');
        
        if (content.match(/cache|Cache|memoize/)) metrics.optimization.caching = true;
        if (content.match(/lazy|Lazy|defer|dynamic import/)) metrics.optimization.lazyLoading = true;
        if (content.match(/async|await|Promise\.all/)) metrics.optimization.asyncOperations = true;
        if (content.match(/index|Index|createIndex/)) metrics.optimization.indexing = true;
      }
      
      // Check build size if available
      metrics.buildSize = await this.getBuildSize(projectPath);
      
      // Calculate performance score
      const perfScore = this.calculatePerformanceScore(metrics);
      
      return {
        percentage: perfScore,
        metrics,
        optimized: Object.values(metrics.optimization).filter(v => v).length >= 2
      };
    } catch (error) {
      logger.error('Performance metrics calculation failed:', error);
      return { percentage: 0, error: error.message };
    }
  }

  /**
   * Calculate documentation metrics
   */
  async calculateDocumentationMetrics(projectPath) {
    const metrics = {
      readme: false,
      apiDocs: false,
      codeDocs: 0,
      examples: false,
      changelog: false,
      contributing: false,
      architecture: false
    };

    try {
      // Check for documentation files
      metrics.readme = await this.fileExists(projectPath, 'README.md');
      metrics.changelog = await this.fileExists(projectPath, 'CHANGELOG.md');
      metrics.contributing = await this.fileExists(projectPath, 'CONTRIBUTING.md');
      
      // Check for API documentation
      const apiDocPatterns = ['swagger.json', 'openapi.yaml', 'docs/api/**'];
      for (const pattern of apiDocPatterns) {
        const files = await this.findFiles(projectPath, [pattern]);
        if (files.length > 0) {
          metrics.apiDocs = true;
          break;
        }
      }
      
      // Check for code documentation (JSDoc, etc.)
      const codeFiles = await this.findCodeFiles(projectPath);
      let documentedFiles = 0;
      for (const file of codeFiles.slice(0, 20)) { // Sample
        const content = await fs.readFile(file, 'utf-8');
        if (content.match(/\/\*\*[\s\S]*?\*\/|"""[\s\S]*?"""/)) {
          documentedFiles++;
        }
      }
      metrics.codeDocs = codeFiles.length > 0 ? (documentedFiles / Math.min(codeFiles.length, 20)) * 100 : 0;
      
      // Check for examples
      const examplePatterns = ['examples/**', 'example/**', '*example*'];
      for (const pattern of examplePatterns) {
        const files = await this.findFiles(projectPath, [pattern]);
        if (files.length > 0) {
          metrics.examples = true;
          break;
        }
      }
      
      // Check for architecture docs
      const archPatterns = ['ARCHITECTURE.md', 'docs/architecture/**', 'design/**'];
      for (const pattern of archPatterns) {
        const files = await this.findFiles(projectPath, [pattern]);
        if (files.length > 0) {
          metrics.architecture = true;
          break;
        }
      }
      
      // Calculate documentation score
      const docScore = this.calculateDocumentationScore(metrics);
      
      return {
        percentage: docScore,
        metrics,
        completeness: this.getDocumentationCompleteness(metrics)
      };
    } catch (error) {
      logger.error('Documentation metrics calculation failed:', error);
      return { percentage: 0, error: error.message };
    }
  }

  /**
   * Calculate deployment readiness
   */
  async calculateDeploymentReadiness(projectPath) {
    const metrics = {
      dockerfile: false,
      cicd: false,
      envConfig: false,
      buildScript: false,
      dependencies: false,
      security: false,
      monitoring: false
    };

    try {
      // Check for deployment files
      metrics.dockerfile = await this.fileExists(projectPath, 'Dockerfile');
      metrics.envConfig = await this.fileExists(projectPath, '.env.example') || 
                         await this.fileExists(projectPath, 'config/**');
      
      // Check for CI/CD
      const ciPatterns = ['.github/workflows/**', '.gitlab-ci.yml', 'Jenkinsfile', '.travis.yml'];
      for (const pattern of ciPatterns) {
        const files = await this.findFiles(projectPath, [pattern]);
        if (files.length > 0) {
          metrics.cicd = true;
          break;
        }
      }
      
      // Check for build scripts
      const packageJson = path.join(projectPath, 'package.json');
      if (await this.fileExists(projectPath, 'package.json')) {
        const pkg = JSON.parse(await fs.readFile(packageJson, 'utf-8'));
        metrics.buildScript = !!(pkg.scripts && pkg.scripts.build);
        metrics.dependencies = !!(pkg.dependencies || pkg.devDependencies);
      }
      
      // Check for security configurations
      const securityPatterns = ['security/**', '.env.example', 'helmet', 'cors'];
      for (const pattern of securityPatterns) {
        const files = await this.findFiles(projectPath, [pattern]);
        if (files.length > 0) {
          metrics.security = true;
          break;
        }
      }
      
      // Check for monitoring
      const monitoringPatterns = ['*monitor*', '*metric*', '*telemetry*', '*logging*'];
      for (const pattern of monitoringPatterns) {
        const files = await this.findFiles(projectPath, [pattern]);
        if (files.length > 0) {
          metrics.monitoring = true;
          break;
        }
      }
      
      // Calculate deployment score
      const deployScore = this.calculateDeploymentScore(metrics);
      
      return {
        percentage: deployScore,
        metrics,
        ready: deployScore >= 70
      };
    } catch (error) {
      logger.error('Deployment readiness calculation failed:', error);
      return { percentage: 0, error: error.message };
    }
  }

  /**
   * Get weights for different metrics based on goal type
   */
  getWeightsForGoal(goal) {
    const description = goal.description.toLowerCase();
    
    // Trading system weights
    if (description.includes('trading') || description.includes('profitable')) {
      return {
        validation: 0.35,    // Most important: does it work?
        tests: 0.25,         // Critical for financial systems
        performance: 0.15,   // Important for real-time trading
        code: 0.15,          // Code quality matters
        documentation: 0.05, // Nice to have
        deployment: 0.05     // Final step
      };
    }
    
    // API weights
    if (description.includes('api') || description.includes('rest')) {
      return {
        validation: 0.30,
        tests: 0.20,
        documentation: 0.20, // API docs are critical
        code: 0.15,
        performance: 0.10,
        deployment: 0.05
      };
    }
    
    // General web application
    if (description.includes('app') || description.includes('website')) {
      return {
        validation: 0.25,
        code: 0.20,
        tests: 0.20,
        deployment: 0.15,
        documentation: 0.10,
        performance: 0.10
      };
    }
    
    // Default weights
    return {
      validation: 0.30,
      code: 0.20,
      tests: 0.20,
      documentation: 0.10,
      performance: 0.10,
      deployment: 0.10
    };
  }

  /**
   * Calculate momentum (rate of progress)
   */
  calculateMomentum(currentMetrics, previousResults) {
    if (!previousResults || !previousResults.metrics) {
      return { value: 0, trend: 'neutral' };
    }
    
    const prevOverall = previousResults.overallProgress || 0;
    const currOverall = this.getOverallFromMetrics(currentMetrics);
    
    const change = currOverall - prevOverall;
    const momentum = change / Math.max(1, previousResults.timeElapsed || 1);
    
    return {
      value: momentum,
      trend: momentum > 0.01 ? 'improving' : momentum < -0.01 ? 'declining' : 'stable',
      change: change * 100
    };
  }

  /**
   * Determine if goal is complete
   */
  isGoalComplete(metrics, goal) {
    // Must have high validation score
    if (metrics.validation.percentage < 90) return false;
    
    // Must have passing tests
    if (metrics.tests.metrics && metrics.tests.metrics.failing > 0) return false;
    
    // Must meet minimum thresholds for all categories
    const minimums = {
      code: 60,
      tests: 70,
      documentation: 50,
      performance: 40,
      deployment: 30
    };
    
    for (const [category, minimum] of Object.entries(minimums)) {
      if (metrics[category] && metrics[category].percentage < minimum) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Identify bottlenecks preventing progress
   */
  identifyBottlenecks(metrics) {
    const bottlenecks = [];
    
    // Check validation failures
    if (metrics.validation.percentage < 50) {
      bottlenecks.push({
        area: 'validation',
        severity: 'critical',
        issue: 'Core functionality not implemented',
        impact: 'Cannot achieve goal without basic features'
      });
    }
    
    // Check test failures
    if (metrics.tests.metrics && metrics.tests.metrics.failing > 0) {
      bottlenecks.push({
        area: 'tests',
        severity: 'high',
        issue: `${metrics.tests.metrics.failing} tests failing`,
        impact: 'Code quality and reliability compromised'
      });
    }
    
    // Check code quality
    if (metrics.code.percentage < 40) {
      bottlenecks.push({
        area: 'code',
        severity: 'medium',
        issue: 'Poor code quality',
        impact: 'Maintenance and scalability issues'
      });
    }
    
    // Check documentation
    if (metrics.documentation.percentage < 30) {
      bottlenecks.push({
        area: 'documentation',
        severity: 'low',
        issue: 'Insufficient documentation',
        impact: 'Difficult for others to use or contribute'
      });
    }
    
    return bottlenecks;
  }

  /**
   * Suggest next steps based on current metrics
   */
  suggestNextSteps(metrics, goal) {
    const steps = [];
    
    // Priority 1: Fix validation failures
    if (metrics.validation.missing) {
      if (metrics.validation.missing.critical.length > 0) {
        steps.push({
          priority: 'critical',
          action: 'Implement missing core features',
          details: metrics.validation.missing.critical.map(m => m.component),
          swarmType: 'development'
        });
      }
    }
    
    // Priority 2: Fix failing tests
    if (metrics.tests.metrics && metrics.tests.metrics.failing > 0) {
      steps.push({
        priority: 'high',
        action: 'Fix failing tests',
        details: `${metrics.tests.metrics.failing} tests need attention`,
        swarmType: 'debugging'
      });
    }
    
    // Priority 3: Improve test coverage
    if (metrics.tests.metrics && metrics.tests.metrics.coverage < 70) {
      steps.push({
        priority: 'medium',
        action: 'Increase test coverage',
        details: `Current coverage: ${metrics.tests.metrics.coverage}%, target: 70%`,
        swarmType: 'testing'
      });
    }
    
    // Priority 4: Add documentation
    if (metrics.documentation.percentage < 50) {
      const missingDocs = [];
      if (!metrics.documentation.metrics.readme) missingDocs.push('README.md');
      if (!metrics.documentation.metrics.apiDocs) missingDocs.push('API documentation');
      
      if (missingDocs.length > 0) {
        steps.push({
          priority: 'medium',
          action: 'Create documentation',
          details: missingDocs,
          swarmType: 'documentation'
        });
      }
    }
    
    // Priority 5: Optimize performance
    if (metrics.performance.percentage < 60) {
      steps.push({
        priority: 'low',
        action: 'Optimize performance',
        details: 'Add caching, lazy loading, and performance tests',
        swarmType: 'optimization'
      });
    }
    
    // Priority 6: Prepare for deployment
    if (metrics.deployment.percentage < 70) {
      steps.push({
        priority: 'low',
        action: 'Prepare deployment',
        details: 'Add Dockerfile, CI/CD pipeline, and monitoring',
        swarmType: 'devops'
      });
    }
    
    return steps;
  }

  /**
   * Helper methods for calculations
   */
  calculateCodeQualityScore(metrics) {
    let score = 0;
    
    // Lines of code (reasonable size)
    if (metrics.linesOfCode > 100 && metrics.linesOfCode < 10000) score += 20;
    else if (metrics.linesOfCode > 0) score += 10;
    
    // Files (modular structure)
    if (metrics.files > 5 && metrics.files < 100) score += 20;
    else if (metrics.files > 0) score += 10;
    
    // Complexity (lower is better)
    if (metrics.complexity < 10) score += 20;
    else if (metrics.complexity < 20) score += 10;
    
    // Coverage
    score += Math.min(30, metrics.coverage * 0.3);
    
    // Tech debt (lower is better)
    if (metrics.techDebt < 0.1) score += 10;
    else if (metrics.techDebt < 0.2) score += 5;
    
    return Math.min(100, score);
  }

  calculateTestScore(metrics) {
    let score = 0;
    
    // Test files exist
    if (metrics.testFiles > 0) score += 20;
    
    // Good number of test cases
    if (metrics.testCases > 10) score += 20;
    else if (metrics.testCases > 0) score += 10;
    
    // Test coverage
    score += Math.min(30, metrics.coverage * 0.3);
    
    // All tests passing
    if (metrics.failing === 0 && metrics.passing > 0) score += 20;
    else if (metrics.passing > metrics.failing) score += 10;
    
    // Multiple test types
    score += Math.min(10, metrics.testTypes.length * 3);
    
    return Math.min(100, score);
  }

  calculatePerformanceScore(metrics) {
    let score = 0;
    
    // Has performance tests
    if (metrics.hasPerformanceTests) score += 30;
    
    // Optimization techniques
    const optimizations = Object.values(metrics.optimization).filter(v => v).length;
    score += optimizations * 15;
    
    // Build size (smaller is better)
    if (metrics.buildSize > 0 && metrics.buildSize < 5000000) score += 10; // < 5MB
    
    return Math.min(100, score);
  }

  calculateDocumentationScore(metrics) {
    let score = 0;
    
    if (metrics.readme) score += 25;
    if (metrics.apiDocs) score += 20;
    if (metrics.examples) score += 15;
    if (metrics.changelog) score += 10;
    if (metrics.contributing) score += 10;
    if (metrics.architecture) score += 10;
    
    // Code documentation percentage
    score += Math.min(10, metrics.codeDocs * 0.1);
    
    return Math.min(100, score);
  }

  calculateDeploymentScore(metrics) {
    let score = 0;
    
    if (metrics.dockerfile) score += 20;
    if (metrics.cicd) score += 20;
    if (metrics.envConfig) score += 15;
    if (metrics.buildScript) score += 15;
    if (metrics.dependencies) score += 10;
    if (metrics.security) score += 10;
    if (metrics.monitoring) score += 10;
    
    return Math.min(100, score);
  }

  getQualityLevel(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  getTestQuality(metrics) {
    const coverage = metrics.coverage || 0;
    const passingRate = metrics.testCases > 0 
      ? (metrics.passing / (metrics.passing + metrics.failing)) * 100 
      : 0;
    
    if (coverage >= 80 && passingRate === 100) return 'excellent';
    if (coverage >= 60 && passingRate >= 90) return 'good';
    if (coverage >= 40 && passingRate >= 70) return 'fair';
    return 'poor';
  }

  getDocumentationCompleteness(metrics) {
    const essential = [metrics.readme, metrics.apiDocs || metrics.codeDocs > 50];
    const nice = [metrics.examples, metrics.changelog, metrics.contributing];
    
    const essentialCount = essential.filter(v => v).length;
    const niceCount = nice.filter(v => v).length;
    
    if (essentialCount === essential.length && niceCount >= 2) return 'complete';
    if (essentialCount === essential.length) return 'adequate';
    if (essentialCount >= 1) return 'minimal';
    return 'insufficient';
  }

  getOverallFromMetrics(metrics) {
    const scores = [];
    for (const category of Object.values(metrics)) {
      if (category && typeof category.percentage === 'number') {
        scores.push(category.percentage);
      }
    }
    return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
  }

  /**
   * Utility methods
   */
  async findFiles(basePath, patterns) {
    const glob = (await import('glob')).glob;
    const files = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: basePath,
        absolute: true,
        ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**']
      });
      files.push(...matches);
    }
    
    return [...new Set(files)];
  }

  async findCodeFiles(projectPath) {
    return this.findFiles(projectPath, ['**/*.js', '**/*.ts', '**/*.py', '**/*.jsx', '**/*.tsx']);
  }

  async findTestFiles(projectPath) {
    return this.findFiles(projectPath, [
      '**/*.test.js', '**/*.spec.js', '**/*.test.ts', 
      '**/test_*.py', '**/*_test.py', '**/tests/**/*.js'
    ]);
  }

  async fileExists(basePath, filename) {
    try {
      await fs.access(path.join(basePath, filename));
      return true;
    } catch {
      return false;
    }
  }

  async getCoverageFromReports(projectPath) {
    try {
      // Look for coverage reports
      const coverageFiles = await this.findFiles(projectPath, [
        'coverage/coverage-summary.json',
        'coverage/lcov-report/index.html',
        '.nyc_output/**/*.json'
      ]);
      
      for (const file of coverageFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          
          // Try JSON format
          if (file.endsWith('.json')) {
            const data = JSON.parse(content);
            if (data.total && data.total.statements) {
              return data.total.statements.pct || 0;
            }
          }
          
          // Try HTML format
          if (file.endsWith('.html')) {
            const match = content.match(/(\d+(?:\.\d+)?)\s*%.*?statements/i);
            if (match) {
              return parseFloat(match[1]);
            }
          }
        } catch {
          // Continue to next file
        }
      }
    } catch {
      // No coverage data
    }
    
    return 0;
  }

  async estimateTechDebt(projectPath) {
    let debtScore = 0;
    let fileCount = 0;
    
    try {
      const files = await this.findCodeFiles(projectPath);
      
      for (const file of files.slice(0, 20)) { // Sample
        const content = await fs.readFile(file, 'utf-8');
        fileCount++;
        
        // Check for code smells
        if (content.match(/TODO|FIXME|HACK|XXX/g)) debtScore += 0.1;
        if (content.match(/console\.log/g)) debtScore += 0.05;
        if (content.match(/any/g) && file.endsWith('.ts')) debtScore += 0.05;
        
        // Check for long files
        const lines = content.split('\n').length;
        if (lines > 500) debtScore += 0.1;
        if (lines > 1000) debtScore += 0.2;
      }
      
      return fileCount > 0 ? debtScore / fileCount : 0;
    } catch {
      return 0;
    }
  }

  async getBuildSize(projectPath) {
    try {
      const buildDirs = await this.findFiles(projectPath, ['dist/**', 'build/**', 'out/**']);
      let totalSize = 0;
      
      for (const file of buildDirs) {
        const stats = await fs.stat(file);
        if (stats.isFile()) {
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    } catch {
      return 0;
    }
  }

  async runTests(projectPath) {
    try {
      // Detect test command
      const packageJson = path.join(projectPath, 'package.json');
      if (await this.fileExists(projectPath, 'package.json')) {
        const pkg = JSON.parse(await fs.readFile(packageJson, 'utf-8'));
        
        if (pkg.scripts && pkg.scripts.test) {
          // Run tests with timeout
          const result = await this.runCommand('npm test -- --json', projectPath, 60000);
          
          // Try to parse JSON output
          try {
            const jsonMatch = result.output.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const data = JSON.parse(jsonMatch[0]);
              return {
                passing: data.numPassedTests || 0,
                failing: data.numFailedTests || 0,
                coverage: data.coverageMap ? this.extractCoverageFromMap(data.coverageMap) : 0
              };
            }
          } catch {
            // Fall back to regex parsing
            const passMatch = result.output.match(/(\d+)\s+pass/i);
            const failMatch = result.output.match(/(\d+)\s+fail/i);
            
            return {
              passing: passMatch ? parseInt(passMatch[1]) : 0,
              failing: failMatch ? parseInt(failMatch[1]) : 0,
              coverage: 0
            };
          }
        }
      }
    } catch {
      // Tests couldn't be run
    }
    
    return null;
  }

  async runCommand(command, cwd, timeout = 30000) {
    return new Promise((resolve) => {
      const proc = spawn(command, [], {
        shell: true,
        cwd,
        timeout
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

  extractCoverageFromMap(coverageMap) {
    // Extract overall coverage from coverage map
    let totalStatements = 0;
    let coveredStatements = 0;
    
    for (const file of Object.values(coverageMap)) {
      if (file.statementMap && file.s) {
        totalStatements += Object.keys(file.statementMap).length;
        coveredStatements += Object.values(file.s).filter(count => count > 0).length;
      }
    }
    
    return totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0;
  }

  loadBenchmarks() {
    // Load industry benchmarks for comparison
    return {
      trading: {
        minBacktestReturn: 0.05, // 5% minimum
        maxDrawdown: 0.20, // 20% max drawdown
        sharpeRatio: 1.0 // Minimum Sharpe ratio
      },
      api: {
        responseTime: 200, // ms
        availability: 0.99, // 99% uptime
        errorRate: 0.01 // 1% error rate
      },
      general: {
        testCoverage: 70,
        codeComplexity: 15,
        documentationScore: 60
      }
    };
  }

  /**
   * Generate progress report
   */
  generateReport(progressData) {
    const lines = [
      '📊 Progress Report',
      '==================',
      '',
      `Goal: ${progressData.goal}`,
      `Overall Progress: ${progressData.overallProgress.toFixed(1)}%`,
      `Status: ${progressData.isComplete ? '✅ COMPLETE' : '🔄 IN PROGRESS'}`,
      ''
    ];

    // Metrics breakdown
    lines.push('Metrics Breakdown:');
    lines.push('-----------------');
    for (const [category, data] of Object.entries(progressData.metrics)) {
      if (data && typeof data.percentage === 'number') {
        const bar = this.createProgressBar(data.percentage / 100);
        lines.push(`${category}: ${bar} ${data.percentage.toFixed(1)}%`);
        if (data.error) {
          lines.push(`  ⚠️ Error: ${data.error}`);
        }
      }
    }

    // Momentum
    if (progressData.momentum) {
      lines.push('');
      lines.push(`Momentum: ${progressData.momentum.trend} (${progressData.momentum.change > 0 ? '+' : ''}${progressData.momentum.change.toFixed(1)}%)`);
    }

    // Bottlenecks
    if (progressData.bottlenecks && progressData.bottlenecks.length > 0) {
      lines.push('\n⚠️ Bottlenecks:');
      lines.push('-------------');
      for (const bottleneck of progressData.bottlenecks) {
        lines.push(`[${bottleneck.severity.toUpperCase()}] ${bottleneck.area}: ${bottleneck.issue}`);
        lines.push(`  Impact: ${bottleneck.impact}`);
      }
    }

    // Next steps
    if (progressData.nextSteps && progressData.nextSteps.length > 0) {
      lines.push('\n📋 Recommended Next Steps:');
      lines.push('------------------------');
      for (const step of progressData.nextSteps) {
        lines.push(`[${step.priority.toUpperCase()}] ${step.action}`);
        if (Array.isArray(step.details)) {
          for (const detail of step.details) {
            lines.push(`  • ${detail}`);
          }
        } else {
          lines.push(`  ${step.details}`);
        }
        lines.push(`  → Suggested swarm: ${step.swarmType}`);
      }
    }

    return lines.join('\n');
  }

  createProgressBar(progress) {
    const total = 20;
    const filled = Math.round(progress * total);
    const empty = total - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }
}