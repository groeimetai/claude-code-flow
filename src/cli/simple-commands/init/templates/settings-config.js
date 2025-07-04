// settings-config.js - Claude-Flow settings templates

export function createDefaultSettings() {
  return {
    "memory": {
      "maxSize": "100MB",
      "ttl": 86400,
      "persistence": true
    },
    "swarm": {
      "maxAgents": 5,
      "taskTimeout": 3600,
      "parallel": true
    },
    "performance": {
      "maxConcurrentOperations": 10,
      "batchSize": 50
    }
  };
}

export function createOptimizedSettings() {
  return {
    "memory": {
      "maxSize": "500MB",
      "ttl": 604800, // 7 days
      "persistence": true,
      "compression": true
    },
    "swarm": {
      "maxAgents": 10,
      "taskTimeout": 7200, // 2 hours
      "parallel": true,
      "distributed": true,
      "retryAttempts": 3
    },
    "performance": {
      "maxConcurrentOperations": 20,
      "batchSize": 100,
      "cacheEnabled": true,
      "workerThreads": 4
    },
    "mcp": {
      "enabledTools": [
        "cognitive_triangulation",
        "ruv_swarm",
        "daa"
      ],
      "autoLoad": true
    }
  };
}

// Settings for 16GB RAM MacBook
export function createMacBookSettings() {
  return {
    "memory": {
      "maxSize": "2GB", // Generous memory allocation
      "ttl": 604800, // 7 days
      "persistence": true,
      "compression": true,
      "gcInterval": 3600 // Garbage collection every hour
    },
    "swarm": {
      "maxAgents": 20, // More agents for parallel processing
      "taskTimeout": 10800, // 3 hours for complex tasks
      "parallel": true,
      "distributed": true,
      "retryAttempts": 5,
      "maxConcurrentSwarms": 5
    },
    "performance": {
      "maxConcurrentOperations": 50, // Higher concurrency
      "batchSize": 200, // Larger batches
      "cacheEnabled": true,
      "cacheSize": "1GB",
      "workerThreads": 8, // Utilize multiple cores
      "asyncOperations": true
    },
    "mcp": {
      "enabledTools": [
        "cognitive_triangulation",
        "ruv_swarm", 
        "daa"
      ],
      "autoLoad": true,
      "parallelToolExecution": true,
      "toolTimeout": 300 // 5 minutes per tool
    },
    "fileOperations": {
      "maxFileSize": "100MB",
      "parallelReads": true,
      "bufferSize": "10MB"
    },
    "logging": {
      "level": "info",
      "maxLogSize": "100MB",
      "rotateDaily": true
    },
    "experimental": {
      "neuralOptimization": true,
      "quantumReady": false,
      "distributedMemory": true
    }
  };
}

// Export function to create settings based on environment
export function createSettings(profile = 'default') {
  switch (profile) {
    case 'optimized':
      return createOptimizedSettings();
    case 'macbook':
    case 'macbook-16gb':
      return createMacBookSettings();
    default:
      return createDefaultSettings();
  }
}