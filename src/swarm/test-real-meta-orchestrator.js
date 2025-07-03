#!/usr/bin/env node
/**
 * Test and demonstration of the Real Meta-Orchestrator
 * Shows how it actually analyzes swarm outputs and tracks real progress
 */

import { RealMetaOrchestrator } from './real-meta-orchestrator.js';
import { EventEmitter } from 'node:events';
import { Logger } from '../core/logger.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Create test directory structure with realistic swarm outputs
async function createTestSwarmOutputs(baseDir) {
  await mkdir(baseDir, { recursive: true });
  
  // Iteration 1: Research phase
  const iter1Dir = join(baseDir, 'swarms', 'swarm-001');
  await mkdir(iter1Dir, { recursive: true });
  
  await writeFile(join(iter1Dir, 'stdout.log'), `
🐝 Swarm swarm-001 starting...
Objective: Research best practices for REST API development

Agent researcher-1 starting task...
Discovered: RESTful APIs should follow HTTP standards and use proper status codes
Discovered: Authentication best practice is to use JWT tokens with refresh mechanism
Found that: Rate limiting is essential for production APIs

Agent architect-1 analyzing requirements...
Important: API versioning should be implemented from the start
Note: Consider using OpenAPI/Swagger for documentation

Created file: "docs/api-design-principles.md"
Created file: "docs/authentication-strategy.md"

✅ Task completed: Research REST API best practices
✅ Task completed: Document architectural decisions

Swarm Summary:
- Tasks Completed: 2
- Tasks Failed: 0
- Agents Used: 2
- Files Created: 2
`);

  await writeFile(join(iter1Dir, 'files.json'), JSON.stringify({
    created: [
      'docs/api-design-principles.md',
      'docs/authentication-strategy.md'
    ],
    modified: []
  }, null, 2));

  // Iteration 2: Implementation phase
  const iter2Dir = join(baseDir, 'swarms', 'swarm-002');
  await mkdir(iter2Dir, { recursive: true });
  
  await writeFile(join(iter2Dir, 'stdout.log'), `
🐝 Swarm swarm-002 starting...
Objective: Implement core API endpoints

Agent developer-1 implementing user endpoints...
Created file: "src/routes/users.js"
Created file: "src/models/User.js"
Created file: "src/middleware/auth.js"

Agent developer-2 implementing authentication...
Modified file: "src/middleware/auth.js"
Created file: "src/services/authService.js"
Implemented: JWT token generation and validation

Agent tester-1 writing tests...
Created file: "tests/users.test.js"
Created file: "tests/auth.test.js"
15 tests passed

✅ Task completed: Implement user CRUD endpoints
✅ Task completed: Implement JWT authentication
✅ Task completed: Write unit tests

Error: Database connection failed - need to configure database
Failed: Set up database migrations

Swarm Summary:
- Tasks Completed: 3
- Tasks Failed: 1
- Agents Used: 3
- Files Created: 6
- Files Modified: 1
`);

  await writeFile(join(iter2Dir, 'files.json'), JSON.stringify({
    created: [
      'src/routes/users.js',
      'src/models/User.js',
      'src/middleware/auth.js',
      'src/services/authService.js',
      'tests/users.test.js',
      'tests/auth.test.js'
    ],
    modified: [
      'src/middleware/auth.js'
    ]
  }, null, 2));

  await writeFile(join(iter2Dir, 'tests.json'), JSON.stringify({
    written: [
      'tests/users.test.js',
      'tests/auth.test.js'
    ],
    results: [
      { passed: 15, failed: 0, file: 'tests/users.test.js' }
    ]
  }, null, 2));

  // Iteration 3: Testing and optimization
  const iter3Dir = join(baseDir, 'swarms', 'swarm-003');
  await mkdir(iter3Dir, { recursive: true });
  
  await writeFile(join(iter3Dir, 'stdout.log'), `
🐝 Swarm swarm-003 starting...
Objective: Optimize performance and add comprehensive testing

Agent optimizer-1 analyzing performance...
Discovered: Database queries are not optimized
Implemented: Query caching mechanism
Modified file: "src/services/userService.js"
Performance improvement: 45% faster response times

Agent tester-1 expanding test coverage...
Created file: "tests/integration/api.test.js"
Created file: "tests/performance/load.test.js"
32 tests passed

Agent documenter-1 creating documentation...
Created file: "README.md"
Created file: "docs/API.md"
Generated: OpenAPI specification

✅ Task completed: Performance optimization
✅ Task completed: Comprehensive test suite
✅ Task completed: API documentation

Swarm Summary:
- Tasks Completed: 3
- Tasks Failed: 0
- Agents Used: 3
- Files Created: 4
- Files Modified: 1
`);

  await writeFile(join(iter3Dir, 'learnings.json'), JSON.stringify([
    {
      text: "Caching dramatically improves API response times",
      source: "performance-analysis",
      confidence: 0.9
    },
    {
      text: "Integration tests are crucial for API reliability",
      source: "testing-insights",
      confidence: 0.95
    },
    {
      text: "OpenAPI documentation helps with client integration",
      source: "documentation-feedback",
      confidence: 0.85
    }
  ], null, 2));
}

// Main test function
async function testRealMetaOrchestrator() {
  console.log('🧪 Testing Real Meta-Orchestrator\n');
  
  // Setup
  const logger = new Logger({ level: 'info' });
  const eventBus = new EventEmitter();
  
  // Listen to events
  eventBus.on('meta-orchestrator-progress', (data) => {
    console.log(`\n📊 Progress Update:`);
    console.log(`  Iteration: ${data.iteration}`);
    console.log(`  Progress: ${Math.round(data.progress * 100)}%`);
    console.log(`  Active Goals: ${data.activeGoals}`);
    console.log(`  Completed Goals: ${data.completedGoals}`);
    console.log(`  Insights: ${data.insights}`);
  });
  
  // Create test environment
  const testDir = './test-meta-orchestrator-run';
  await createTestSwarmOutputs(testDir);
  
  // Initialize orchestrator
  const orchestrator = new RealMetaOrchestrator(logger, eventBus, {
    maxIterations: 5,
    convergenceThreshold: 0.95,
    persistencePath: testDir,
    cognitiveTriangulationEnabled: false // For testing without external deps
  });
  
  // Override executeSwarmProcess to use our test data
  orchestrator.executeSwarmProcess = async function(objective, swarmDir) {
    // Map objectives to our test swarms
    const swarmMap = {
      'research': 'swarm-001',
      'implement': 'swarm-002',
      'optimize': 'swarm-003'
    };
    
    let swarmId = 'swarm-001'; // default
    for (const [key, id] of Object.entries(swarmMap)) {
      if (objective.description.toLowerCase().includes(key)) {
        swarmId = id;
        break;
      }
    }
    
    // Copy test data to swarm directory
    const testSwarmDir = join(testDir, 'swarms', swarmId);
    const { cp } = await import('node:fs/promises');
    try {
      await cp(testSwarmDir, swarmDir, { recursive: true });
    } catch (e) {
      // Directory might not exist in test scenario
    }
    
    return {
      success: true,
      command: 'test-command',
      message: `Test swarm ${swarmId} executed`
    };
  };
  
  // Test goal achievement
  console.log('🎯 Testing goal: "Build a production-ready REST API with authentication"\n');
  
  const result = await orchestrator.achieveGoal(
    "Build a production-ready REST API with authentication"
  );
  
  // Display results
  console.log('\n' + '═'.repeat(60));
  console.log('📋 FINAL RESULTS');
  console.log('═'.repeat(60));
  
  console.log(`\n✅ Success: ${result.success}`);
  console.log(`📈 Final Progress: ${Math.round(result.convergence * 100)}%`);
  console.log(`🔄 Iterations Used: ${result.iterations}`);
  console.log(`⏱️  Duration: ${result.duration}ms`);
  console.log(`🎯 Goals Completed: ${result.goalsCompleted}/${result.goalsTotal}`);
  
  console.log('\n📊 Metrics:');
  console.log(`  Files Created: ${result.metrics.totalFilesCreated}`);
  console.log(`  Tests Written: ${result.metrics.totalTestsWritten}`);
  console.log(`  Tests Passed: ${result.metrics.totalTestsPassed}`);
  console.log(`  Knowledge Nodes: ${result.knowledgeGraphSize}`);
  
  if (result.report.learnings) {
    console.log('\n💡 Key Learnings by Category:');
    for (const [category, learnings] of Object.entries(result.report.learnings)) {
      console.log(`\n  ${category}:`);
      learnings.slice(0, 2).forEach(l => {
        console.log(`    - ${l.content} (confidence: ${Math.round(l.confidence * 100)}%)`);
      });
    }
  }
  
  if (result.report.technicalDecisions.length > 0) {
    console.log('\n🏗️  Technical Decisions Made:');
    result.report.technicalDecisions.slice(0, 3).forEach(d => {
      console.log(`  - ${d.decision}`);
    });
  }
  
  if (result.report.recommendations.length > 0) {
    console.log('\n📝 Recommendations:');
    result.report.recommendations.forEach(r => {
      if (r.message) {
        console.log(`  - [${r.area}] ${r.message}`);
      }
    });
  }
  
  if (result.report.nextSteps.length > 0) {
    console.log('\n🚀 Next Steps:');
    result.report.nextSteps.forEach(step => {
      console.log(`  - [${step.priority}] ${step.action}: ${step.rationale}`);
    });
  }
  
  console.log('\n✨ Test completed! Check', testDir, 'for detailed outputs.\n');
}

// Run the test
testRealMetaOrchestrator().catch(console.error);