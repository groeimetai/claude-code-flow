/**
 * SwarmMonitor - Real-time monitoring and debugging tools for swarm coordination
 * 
 * Provides dashboards, metrics, and diagnostic capabilities
 */

import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { getGlobalMessageBus, MessageTypes } from './message-bus.js';
import { getGlobalKnowledgeBase } from './shared-knowledge.js';
import { getGlobalCoordinationProtocol } from './coordination-protocol.js';

class SwarmMonitor {
  constructor(options = {}) {
    this.refreshInterval = options.refreshInterval || 1000; // 1 second
    this.enableLogging = options.enableLogging !== false;
    this.logFile = options.logFile || './swarm-monitor.log';
    
    // System connections
    this.messageBus = options.messageBus || getGlobalMessageBus();
    this.knowledgeBase = options.knowledgeBase || getGlobalKnowledgeBase();
    this.coordinationProtocol = options.coordinationProtocol || getGlobalCoordinationProtocol();
    
    // Metrics storage
    this.metrics = {
      messages: {
        total: 0,
        byType: {},
        rate: 0,
        history: []
      },
      swarms: {
        active: 0,
        total: 0,
        byStatus: {}
      },
      tasks: {
        total: 0,
        completed: 0,
        failed: 0,
        inProgress: 0,
        avgCompletionTime: 0
      },
      knowledge: {
        entries: 0,
        byType: {},
        conflicts: 0
      },
      performance: {
        cpuUsage: 0,
        memoryUsage: 0,
        messageLatency: 0
      }
    };
    
    // Message tracking for rate calculation
    this.messageCount = 0;
    this.lastMessageReset = Date.now();
    
    // Terminal UI components
    this.screen = null;
    this.grid = null;
    this.widgets = {};
    
    // Initialize monitoring
    this.initialize();
  }
  
  async initialize() {
    // Subscribe to all messages for monitoring
    this.messageBus.subscribe(
      '.*', // Match all message types
      (message) => this.trackMessage(message),
      { priority: 'low' }
    );
    
    // Start metrics collection
    this.startMetricsCollection();
    
    console.log('📊 Swarm monitor initialized');
  }
  
  /**
   * Track incoming messages
   */
  trackMessage(message) {
    this.messageCount++;
    this.metrics.messages.total++;
    
    // Track by type
    this.metrics.messages.byType[message.type] = 
      (this.metrics.messages.byType[message.type] || 0) + 1;
    
    // Add to history for visualization
    this.metrics.messages.history.push({
      type: message.type,
      timestamp: message.timestamp,
      swarmId: message.swarmId
    });
    
    // Keep history limited
    if (this.metrics.messages.history.length > 1000) {
      this.metrics.messages.history.shift();
    }
    
    // Log if enabled
    if (this.enableLogging) {
      this.logMessage(message);
    }
  }
  
  /**
   * Start metrics collection
   */
  startMetricsCollection() {
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, this.refreshInterval);
  }
  
  /**
   * Collect current metrics
   */
  async collectMetrics() {
    // Calculate message rate
    const now = Date.now();
    const timeDiff = (now - this.lastMessageReset) / 1000; // seconds
    this.metrics.messages.rate = this.messageCount / timeDiff;
    
    // Reset counters every 10 seconds
    if (timeDiff > 10) {
      this.messageCount = 0;
      this.lastMessageReset = now;
    }
    
    // Get swarm metrics
    const activeSwarms = this.messageBus.getActiveSwarms();
    this.metrics.swarms.active = activeSwarms.length;
    this.metrics.swarms.total = this.messageBus.swarmRegistry.size;
    
    // Get task metrics from coordination protocol
    const taskStats = this.coordinationProtocol.getStatistics();
    this.metrics.tasks = {
      total: taskStats.totalTasks,
      completed: taskStats.tasksByState.completed || 0,
      failed: taskStats.tasksByState.failed || 0,
      inProgress: taskStats.tasksByState.in_progress || 0,
      avgCompletionTime: taskStats.averageWorkTime
    };
    
    // Get knowledge metrics
    const knowledgeStats = this.knowledgeBase.getStatistics();
    this.metrics.knowledge = {
      entries: knowledgeStats.totalEntries,
      byType: knowledgeStats.byType,
      conflicts: knowledgeStats.conflicts
    };
    
    // Get performance metrics
    this.metrics.performance = await this.getPerformanceMetrics();
    
    // Update UI if active
    if (this.screen) {
      this.updateUI();
    }
  }
  
  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    const usage = process.memoryUsage();
    
    return {
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      memoryUsage: usage.heapUsed / 1024 / 1024, // Convert to MB
      messageLatency: this.calculateAverageLatency()
    };
  }
  
  /**
   * Calculate average message latency
   */
  calculateAverageLatency() {
    // Simple latency estimation based on message processing
    const recentMessages = this.metrics.messages.history.slice(-100);
    
    if (recentMessages.length < 2) {
      return 0;
    }
    
    let totalLatency = 0;
    for (let i = 1; i < recentMessages.length; i++) {
      totalLatency += recentMessages[i].timestamp - recentMessages[i-1].timestamp;
    }
    
    return totalLatency / (recentMessages.length - 1);
  }
  
  /**
   * Start terminal UI
   */
  startUI() {
    // Create screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Swarm Monitor'
    });
    
    // Create grid layout
    this.grid = new contrib.grid({
      rows: 12,
      cols: 12,
      screen: this.screen
    });
    
    // Create widgets
    this.createWidgets();
    
    // Handle exit
    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.stopUI();
    });
    
    // Initial render
    this.updateUI();
    this.screen.render();
  }
  
  /**
   * Create UI widgets
   */
  createWidgets() {
    // Message rate line chart
    this.widgets.messageRate = this.grid.set(0, 0, 4, 6, contrib.line, {
      style: {
        line: "yellow",
        text: "green",
        baseline: "black"
      },
      label: 'Message Rate (msg/s)',
      showLegend: true
    });
    
    // Swarm status bar chart
    this.widgets.swarmStatus = this.grid.set(0, 6, 4, 6, contrib.bar, {
      label: 'Swarm Status',
      barWidth: 4,
      barSpacing: 6,
      xOffset: 0,
      maxHeight: 10
    });
    
    // Task progress donut
    this.widgets.taskProgress = this.grid.set(4, 0, 4, 4, contrib.donut, {
      label: 'Task Status',
      radius: 8,
      arcWidth: 3,
      remainColor: 'black',
      yPadding: 2
    });
    
    // Knowledge base stats
    this.widgets.knowledgeStats = this.grid.set(4, 4, 4, 4, contrib.table, {
      keys: true,
      fg: 'white',
      selectedFg: 'white',
      selectedBg: 'blue',
      interactive: false,
      label: 'Knowledge Base',
      width: '30%',
      height: '30%',
      border: {type: "line", fg: "cyan"},
      columnSpacing: 3,
      columnWidth: [16, 10]
    });
    
    // System performance
    this.widgets.performance = this.grid.set(4, 8, 4, 4, contrib.gauge, {
      label: 'System Load',
      stroke: 'green',
      fill: 'white',
      percent: 0
    });
    
    // Message log
    this.widgets.messageLog = this.grid.set(8, 0, 4, 8, blessed.log, {
      fg: 'green',
      selectedFg: 'green',
      label: 'Recent Messages',
      height: '20%',
      tags: true,
      border: {type: "line", fg: "cyan"}
    });
    
    // Active swarms list
    this.widgets.activeSwarms = this.grid.set(8, 8, 4, 4, blessed.list, {
      label: 'Active Swarms',
      tags: true,
      style: {
        selected: {
          bg: 'blue'
        }
      },
      border: {type: "line", fg: "cyan"}
    });
  }
  
  /**
   * Update UI with current metrics
   */
  updateUI() {
    // Update message rate chart
    const rateHistory = this.getMessageRateHistory();
    this.widgets.messageRate.setData([{
      title: 'Messages/sec',
      x: rateHistory.x,
      y: rateHistory.y,
      style: { line: 'yellow' }
    }]);
    
    // Update swarm status
    this.widgets.swarmStatus.setData({
      titles: ['Active', 'Inactive', 'Total'],
      data: [
        this.metrics.swarms.active,
        this.metrics.swarms.total - this.metrics.swarms.active,
        this.metrics.swarms.total
      ]
    });
    
    // Update task progress
    const taskData = [
      { percent: this.metrics.tasks.completed, label: 'Completed', color: 'green' },
      { percent: this.metrics.tasks.inProgress, label: 'In Progress', color: 'yellow' },
      { percent: this.metrics.tasks.failed, label: 'Failed', color: 'red' }
    ];
    
    const total = taskData.reduce((sum, item) => sum + item.percent, 0);
    if (total > 0) {
      taskData.forEach(item => {
        item.percent = Math.round((item.percent / total) * 100);
      });
    }
    
    this.widgets.taskProgress.setData(taskData);
    
    // Update knowledge stats
    const knowledgeData = {
      headers: ['Type', 'Count'],
      data: Object.entries(this.metrics.knowledge.byType).map(([type, count]) => [type, count.toString()])
    };
    knowledgeData.data.push(['Conflicts', this.metrics.knowledge.conflicts.toString()]);
    this.widgets.knowledgeStats.setData(knowledgeData);
    
    // Update performance gauge
    const cpuPercent = Math.min(100, Math.round(this.metrics.performance.cpuUsage));
    this.widgets.performance.setPercent(cpuPercent);
    
    // Update message log
    const recentMessages = this.metrics.messages.history.slice(-10).reverse();
    recentMessages.forEach(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      this.widgets.messageLog.log(`{cyan-fg}[${time}]{/} {yellow-fg}${msg.type}{/} from ${msg.swarmId || 'unknown'}`);
    });
    
    // Update active swarms
    const activeSwarms = this.messageBus.getActiveSwarms();
    const swarmList = activeSwarms.map(swarm => 
      `{green-fg}●{/} ${swarm.id} - ${swarm.objective || 'No objective'}`
    );
    this.widgets.activeSwarms.setItems(swarmList);
    
    // Render screen
    this.screen.render();
  }
  
  /**
   * Get message rate history for chart
   */
  getMessageRateHistory() {
    const history = [];
    const now = Date.now();
    const interval = 1000; // 1 second intervals
    const periods = 60; // Last 60 seconds
    
    for (let i = periods; i >= 0; i--) {
      const periodStart = now - (i * interval);
      const periodEnd = periodStart + interval;
      
      const count = this.metrics.messages.history.filter(msg => 
        msg.timestamp >= periodStart && msg.timestamp < periodEnd
      ).length;
      
      history.push({
        x: periods - i,
        y: count
      });
    }
    
    return {
      x: history.map(h => h.x.toString()),
      y: history.map(h => h.y)
    };
  }
  
  /**
   * Stop UI
   */
  stopUI() {
    if (this.screen) {
      this.screen.destroy();
      this.screen = null;
    }
  }
  
  /**
   * Log message to file
   */
  async logMessage(message) {
    const logEntry = {
      timestamp: new Date(message.timestamp).toISOString(),
      type: message.type,
      swarmId: message.swarmId,
      priority: message.priority,
      data: message.data
    };
    
    try {
      const fs = await import('fs/promises');
      await fs.appendFile(this.logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Failed to log message:', error);
    }
  }
  
  /**
   * Get current metrics snapshot
   */
  getMetricsSnapshot() {
    return {
      timestamp: Date.now(),
      ...this.metrics
    };
  }
  
  /**
   * Detect deadlocks
   */
  detectDeadlocks() {
    const deadlocks = [];
    const taskStats = this.coordinationProtocol.getStatistics();
    
    // Check for circular task dependencies
    const tasks = Array.from(this.coordinationProtocol.tasks.values());
    
    for (const task of tasks) {
      if (task.state === 'blocked' && task.dependencies.length > 0) {
        const visited = new Set();
        const chain = this.findDependencyChain(task.id, visited);
        
        if (chain.includes(task.id)) {
          deadlocks.push({
            type: 'circular_dependency',
            tasks: chain,
            detected: Date.now()
          });
        }
      }
    }
    
    // Check for resource contention
    const helpRequests = Array.from(this.coordinationProtocol.helpRequests.values());
    const stuckRequests = helpRequests.filter(req => 
      Date.now() - req.timestamp > 5 * 60 * 1000 // 5 minutes
    );
    
    if (stuckRequests.length > 0) {
      deadlocks.push({
        type: 'help_timeout',
        requests: stuckRequests.map(r => r.id),
        detected: Date.now()
      });
    }
    
    return deadlocks;
  }
  
  /**
   * Find dependency chain
   */
  findDependencyChain(taskId, visited, chain = []) {
    if (visited.has(taskId)) {
      return chain;
    }
    
    visited.add(taskId);
    chain.push(taskId);
    
    const task = this.coordinationProtocol.tasks.get(taskId);
    if (task && task.dependencies) {
      for (const depId of task.dependencies) {
        this.findDependencyChain(depId, visited, chain);
      }
    }
    
    return chain;
  }
  
  /**
   * Export metrics to file
   */
  async exportMetrics(filepath) {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics: this.getMetricsSnapshot(),
      deadlocks: this.detectDeadlocks(),
      swarms: Array.from(this.messageBus.swarmRegistry.values()),
      tasks: Array.from(this.coordinationProtocol.tasks.values()),
      knowledge: this.knowledgeBase.getStatistics()
    };
    
    const fs = await import('fs/promises');
    await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));
    
    return exportData;
  }
  
  /**
   * Shutdown monitor
   */
  shutdown() {
    this.stopUI();
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    console.log('📊 Swarm monitor shutdown');
  }
}

// Create command-line interface
export function createMonitorCLI() {
  const monitor = new SwarmMonitor();
  
  return {
    start: () => monitor.startUI(),
    stop: () => monitor.stopUI(),
    metrics: () => monitor.getMetricsSnapshot(),
    deadlocks: () => monitor.detectDeadlocks(),
    export: (filepath) => monitor.exportMetrics(filepath),
    shutdown: () => monitor.shutdown()
  };
}

export default SwarmMonitor;