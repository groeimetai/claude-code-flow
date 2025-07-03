# Swarm Communication System

A robust inter-swarm communication system that enables swarms to share knowledge, coordinate tasks, and collaborate in real-time.

## Overview

The Swarm Communication System solves the problem of isolated swarm execution by providing:

1. **Message Bus** - Pub/sub messaging with persistence and lifecycle management
2. **Shared Knowledge Base** - Central repository with semantic search and conflict resolution
3. **Coordination Protocol** - Task claiming, progress broadcasting, and resource sharing
4. **Real-time Monitoring** - Dashboard for swarm activity, deadlock detection, and metrics

## Quick Start

```javascript
import { setupSwarmCommunication } from './swarm/index.js';

// Initialize the communication system
const { messageBus, knowledgeBase, coordinationProtocol, integration } = setupSwarmCommunication({
  enableMessageBus: true,
  enableKnowledgeBase: true,
  enableCoordination: true,
  enableMonitoring: true
});

// Enhance an existing swarm
const enhancedSwarm = integration.enhanceSwarm(mySwarm, 'swarm_001', {
  capabilities: ['research', 'analysis'],
  strategy: 'research'
});

// Now the swarm can communicate
await enhancedSwarm.shareDiscovery({
  title: 'New Pattern Found',
  content: 'Discovered optimal caching strategy',
  confidence: 'high'
});
```

## Core Components

### 1. Message Bus

The message bus enables real-time communication between swarms:

```javascript
import { getGlobalMessageBus, MessageTypes } from './swarm/message-bus.js';

const messageBus = getGlobalMessageBus();

// Subscribe to messages
const subscriptionId = messageBus.subscribe(
  MessageTypes.DISCOVERY_SHARED,
  async (message) => {
    console.log('New discovery:', message.data);
  },
  { priority: 'high' }
);

// Publish messages
await messageBus.publish({
  type: MessageTypes.PROGRESS_UPDATE,
  swarmId: 'swarm_001',
  data: { progress: 50, status: 'analyzing' },
  priority: 'normal'
});
```

#### Message Types

- **Lifecycle**: `SWARM_STARTED`, `SWARM_COMPLETED`, `SWARM_FAILED`
- **Coordination**: `TASK_CLAIMED`, `TASK_RELEASED`, `TASK_COMPLETED`
- **Knowledge**: `DISCOVERY_SHARED`, `SOLUTION_FOUND`, `ERROR_ENCOUNTERED`
- **Resources**: `CODE_SHARED`, `CONFIG_SHARED`, `ARTIFACT_CREATED`
- **Progress**: `PROGRESS_UPDATE`, `METRICS_UPDATE`, `STATUS_CHANGE`

### 2. Shared Knowledge Base

Centralized knowledge repository with semantic search:

```javascript
import { getGlobalKnowledgeBase, KnowledgeTypes } from './swarm/shared-knowledge.js';

const knowledgeBase = getGlobalKnowledgeBase();

// Add knowledge
await knowledgeBase.addKnowledge({
  type: KnowledgeTypes.SOLUTION,
  title: 'Optimized Database Query',
  content: 'Use compound indexes for multi-field queries',
  swarmId: 'swarm_001',
  confidence: 'verified',
  tags: ['database', 'optimization', 'performance']
});

// Search knowledge
const results = await knowledgeBase.search('database performance', {
  type: KnowledgeTypes.SOLUTION,
  minConfidence: 'high',
  limit: 5
});
```

#### Features

- **Semantic Search**: Find relevant knowledge using natural language queries
- **Conflict Resolution**: Automatically detects and resolves contradictory information
- **Memory Integration**: Syncs with the claude-flow Memory system
- **Confidence Levels**: `verified`, `high`, `medium`, `low`, `experimental`

### 3. Coordination Protocol

Distributed task management and resource sharing:

```javascript
import { getGlobalCoordinationProtocol, TaskStates } from './swarm/coordination-protocol.js';

const protocol = getGlobalCoordinationProtocol();

// Create a task
const task = await protocol.createTask({
  title: 'Analyze user behavior data',
  description: 'Process and analyze user interaction logs',
  priority: 'high',
  requirements: {
    capabilities: ['data-analysis', 'statistics']
  }
});

// Claim a task
await protocol.claimTask('swarm_001', task.id);

// Update progress
await messageBus.broadcastProgress('swarm_001', {
  taskId: task.id,
  progress: 75,
  status: 'finalizing analysis'
});

// Complete task
await protocol.completeTask('swarm_001', task.id, {
  results: analysisResults,
  learnings: 'User engagement peaks at 2PM EST'
});
```

#### Coordination Strategies

- **First Come**: First swarm to claim gets the task
- **Best Fit**: Task assigned to most capable swarm
- **Load Balanced**: Distribute work evenly
- **Priority Based**: Based on swarm priority levels
- **Auction**: Swarms bid for tasks

### 4. Monitoring Dashboard

Real-time monitoring with terminal UI:

```bash
# Start the monitor
./claude-flow swarm:monitor

# Or programmatically
import { createMonitorCLI } from './swarm/swarm-monitor.js';

const monitor = createMonitorCLI();
monitor.start();
```

#### Dashboard Features

- **Message Rate Graph**: Real-time message throughput
- **Swarm Status**: Active/inactive swarm tracking
- **Task Progress**: Donut chart of task states
- **Knowledge Stats**: Knowledge base metrics
- **System Performance**: CPU and memory usage
- **Message Log**: Recent message activity
- **Deadlock Detection**: Automatic circular dependency detection

## Integration with Existing Swarms

### Method 1: Enhance Existing Swarm

```javascript
import { createSwarmIntegration } from './swarm/swarm-communication-integration.js';

const integration = createSwarmIntegration();

// Enhance existing swarm instance
const enhanced = integration.enhanceSwarm(existingSwarm, 'swarm_id', {
  capabilities: ['coder', 'tester'],
  strategy: 'development'
});

// Use new communication features
await enhanced.shareDiscovery({
  title: 'Unit Test Pattern',
  content: 'Found effective mocking strategy'
});

await enhanced.requestHelp({
  type: 'debugging',
  description: 'Need help with async test failures'
});
```

### Method 2: Wrap Swarm Executor

```javascript
// Wrap the existing executor
const wrappedExecutor = integration.integrateWithExecutor(originalExecuteSwarm);

// Execute with communication features
const result = await wrappedExecutor('Build REST API', {
  strategy: 'development',
  communication: true,
  knowledge: true,
  coordination: true
});
```

### Method 3: CLI Integration

```javascript
// In your CLI setup
import { enhanceSwarmCLI } from './swarm/index.js';

const swarmCommands = enhanceSwarmCLI();

// Adds commands:
// - swarm:monitor - Start monitoring dashboard
// - swarm:knowledge <query> - Search knowledge base
// - swarm:status - Show system status
```

## Advanced Usage

### Help System

```javascript
// Request help
const helpRequest = await enhanced.requestHelp({
  type: 'implementation',
  description: 'How to implement WebSocket authentication?',
  context: { framework: 'express', auth: 'jwt' },
  urgency: 'high'
});

// Provide help (from another swarm)
await otherSwarm.provideHelp(helpRequest.id, {
  type: 'solution',
  content: 'Use socket.io middleware for JWT validation...'
});
```

### Resource Sharing

```javascript
// Share code snippet
await enhanced.shareResource({
  type: 'code',
  name: 'JWT Middleware',
  content: jwtMiddlewareCode,
  metadata: {
    language: 'javascript',
    framework: 'express',
    tags: ['auth', 'security']
  }
});

// Search and retrieve resources
const resources = protocol.searchSharedResources('jwt');
const resource = protocol.getSharedResource(resources[0].id);
```

### Batch Operations

```javascript
// Coordinate multiple swarms
const swarms = ['swarm_001', 'swarm_002', 'swarm_003'];

// Create related tasks
const tasks = await Promise.all([
  protocol.createTask({ title: 'Frontend Development', dependencies: [] }),
  protocol.createTask({ title: 'API Development', dependencies: [] }),
  protocol.createTask({ title: 'Integration Testing', dependencies: ['task_1', 'task_2'] })
]);

// Swarms will automatically coordinate based on dependencies
```

## Best Practices

1. **Message Priority**: Use appropriate priority levels to ensure critical messages are processed first
2. **Knowledge Confidence**: Always specify confidence levels when sharing discoveries
3. **Task Dependencies**: Define clear dependencies to prevent deadlocks
4. **Resource Cleanup**: Call `shutdown()` on swarms when done to clean up resources
5. **Error Handling**: Share errors as knowledge to help other swarms avoid similar issues

## Configuration Options

```javascript
const config = {
  // Message Bus Options
  messageBusOptions: {
    persistencePath: './swarm-messages',
    maxMessageAge: 24 * 60 * 60 * 1000, // 24 hours
    enablePersistence: true,
    enableCompression: false
  },
  
  // Knowledge Base Options
  knowledgeBaseOptions: {
    storagePath: './swarm-knowledge',
    memoryNamespace: 'swarm-knowledge',
    enableVectorSearch: false // Future feature
  },
  
  // Coordination Options
  coordinationOptions: {
    strategy: 'best_fit', // or 'first_come', 'load_balanced', etc.
    enableAuction: false,
    auctionDuration: 5000 // 5 seconds
  },
  
  // Monitoring Options
  monitoringOptions: {
    refreshInterval: 1000, // 1 second
    enableLogging: true,
    logFile: './swarm-monitor.log'
  }
};

const components = setupSwarmCommunication(config);
```

## Performance Considerations

- **Message Volume**: The system can handle thousands of messages per second
- **Knowledge Search**: Indexed for fast retrieval, scales to millions of entries
- **Task Coordination**: Efficient task claiming prevents race conditions
- **Memory Usage**: Old messages and knowledge are automatically cleaned up

## Troubleshooting

### Common Issues

1. **Swarms not communicating**: Ensure both swarms are registered with the message bus
2. **Knowledge not found**: Check confidence levels and search query specificity
3. **Tasks stuck**: Use monitor to detect deadlocks, check task dependencies
4. **High memory usage**: Adjust `maxMessageAge` and cleanup intervals

### Debug Mode

```javascript
// Enable verbose logging
const messageBus = getGlobalMessageBus({ debug: true });

// Export system state
const monitor = createMonitorCLI();
await monitor.export('./swarm-debug-dump.json');
```

## Examples

See `/examples/swarm-communication/` for complete examples:

- `basic-coordination.js` - Simple multi-swarm task coordination
- `knowledge-driven.js` - Swarms learning from each other
- `help-system.js` - Collaborative problem solving
- `monitoring-demo.js` - Real-time monitoring setup

## Future Enhancements

- Vector embeddings for semantic knowledge search
- Distributed message bus for multi-machine swarms
- Machine learning for optimal task assignment
- Automatic swarm spawning based on workload
- GraphQL API for external system integration