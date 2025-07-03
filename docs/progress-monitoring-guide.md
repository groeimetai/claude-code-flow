# Progress Monitoring & Cognitive Triangulation Guide

## 🎯 Progress Visibility

### Real-time Progress Dashboard

When using the `achieve` command, you get automatic progress monitoring:

```bash
./claude-flow achieve "Create trading system" --verbose --monitor
```

This shows:
- **Current Iteration**: Which attempt is running
- **Progress Percentage**: How close to goal completion
- **Active Swarms**: What's being worked on
- **Learnings**: What the system discovered
- **Next Steps**: What's planned next

### Progress Indicators

```
Iteration 1: 🔍 Exploration & Foundation (0-30%)
├── Research similar systems
├── Design architecture  
├── Create project structure
└── Set up testing framework

Iteration 2: 🔨 Core Implementation (30-60%)
├── Build main features
├── Implement business logic
├── Add error handling
└── Create basic UI

Iteration 3: 🧪 Testing & Optimization (60-80%)
├── Write comprehensive tests
├── Fix discovered issues
├── Optimize performance
└── Add monitoring

Iteration 4: ✨ Polish & Completion (80-100%)
├── Handle edge cases
├── Complete documentation
├── Final validation
└── Prepare deliverables
```

## 🧠 Automatic Cognitive Triangulation

### When It's Used Automatically

The system **automatically** uses cognitive triangulation at key points:

1. **Start of Each Iteration**
   - Analyzes current project state
   - Builds knowledge graph of existing code
   - Identifies gaps and opportunities

2. **After Major Changes**
   - Re-analyzes to understand impact
   - Updates knowledge graph
   - Detects architectural shifts

3. **When Stuck**
   - Deep analysis to find root causes
   - Explores alternative approaches
   - Identifies hidden dependencies

### Manual Triggers

You can also manually trigger analysis:

```bash
# During any swarm operation
"Use cognitive triangulation to understand the current architecture"

# Specific analysis
./claude-flow sparc run cognitive-analyst "Analyze how components interact"

# Build knowledge graph
./claude-flow sparc run graph-architect "Create visual map of the system"
```

## 🔑 API Key Management

### Setting Up API Keys

**For Cognitive Triangulation (Neo4j & Redis):**

1. **Environment Variables** (Recommended)
   ```bash
   # Add to your .env or shell profile
   export NEO4J_URI=bolt://localhost:7687
   export NEO4J_USER=neo4j
   export NEO4J_PASSWORD=your-password
   export REDIS_URL=redis://localhost:6379
   ```

2. **Project-Specific Configuration**
   ```bash
   # Create .claude/settings.json in your project
   {
     "cognitiveTriangulation": {
       "neo4j": {
         "uri": "bolt://localhost:7687",
         "user": "neo4j",
         "password": "your-password"
       },
       "redis": {
         "url": "redis://localhost:6379"
       }
     }
   }
   ```

3. **Global Configuration**
   ```bash
   # Set once for all projects
   ./claude-flow config set neo4j.uri "bolt://localhost:7687"
   ./claude-flow config set neo4j.user "neo4j"
   ./claude-flow config set neo4j.password "your-password"
   ```

### Local-Only Options

If you don't have Neo4j/Redis, the system can use:
- **JSON-based graphs** (no Neo4j needed)
- **File-based caching** (no Redis needed)

```bash
# Use local file storage
export COGNITIVE_GRAPH_FORMAT=json
export COGNITIVE_CACHE_TYPE=file
```

## 📊 Enhanced Progress Monitoring

### Visual Progress Mode

```bash
# Enable visual progress dashboard
./claude-flow achieve "Build e-commerce platform" --visual

# Shows:
┌─────────────────────────────────────┐
│ Goal: Build e-commerce platform     │
│ Iteration: 3/10                     │
│ Progress: ████████░░░░░░ 65%        │
│                                     │
│ Current Phase: Implementation       │
│ Active Swarms: 3                    │
│ Completed Tasks: 24/37              │
│                                     │
│ Recent Learnings:                   │
│ • Payment integration needs Stripe  │
│ • Database should use PostgreSQL    │
│ • Add caching for product queries   │
└─────────────────────────────────────┘
```

### Progress Webhooks

```bash
# Send progress updates to webhook
./claude-flow achieve "Create API" --webhook https://your-server.com/progress
```

### Progress Export

```bash
# Export detailed progress report
./claude-flow achieve "Build system" --export-progress report.json
```

## 🔄 Automatic Project Understanding

### Smart Analysis Triggers

The system automatically triggers cognitive triangulation when:

1. **Project Complexity Exceeds Threshold**
   ```javascript
   if (filesCount > 50 || linesOfCode > 5000) {
     automaticallyAnalyzeArchitecture();
   }
   ```

2. **Confusion Detected**
   ```javascript
   if (swarmAsksAboutArchitecture || errorsRelatedToStructure) {
     runCognitiveTriangulation();
   }
   ```

3. **Major Refactoring Needed**
   ```javascript
   if (technicalDebtScore > 0.7) {
     deepArchitecturalAnalysis();
   }
   ```

### Analysis Frequency

Configure how often automatic analysis runs:

```json
{
  "autoAnalysis": {
    "enabled": true,
    "triggers": {
      "everyNIterations": 3,
      "onComplexity": true,
      "onConfusion": true,
      "onRefactoring": true
    },
    "minTimeBetween": 300000  // 5 minutes
  }
}
```

## 📈 Progress Metrics

### Key Metrics Tracked

1. **Goal Completion**: % of success criteria met
2. **Code Quality**: Test coverage, linting scores
3. **Architecture Health**: Coupling, cohesion metrics
4. **Performance**: Speed, memory usage
5. **Learning Rate**: Improvements per iteration

### Accessing Metrics

```bash
# View current metrics
./claude-flow metrics

# Export metrics history
./claude-flow metrics export metrics.csv

# Real-time metrics dashboard
./claude-flow metrics --dashboard
```

## 🚀 Best Practices

### 1. **Always Use --verbose for Complex Goals**
```bash
./claude-flow achieve "Complex system" --verbose --monitor
```

### 2. **Enable Cognitive Analysis Early**
```bash
# Add to your prompt
"Use cognitive triangulation frequently to understand the evolving architecture"
```

### 3. **Set Up API Keys Once**
- Use environment variables for all projects
- Or use global config for convenience
- Fall back to local storage if needed

### 4. **Monitor Key Milestones**
```bash
# Set milestone notifications
./claude-flow achieve "Goal" --notify-at 25,50,75,100
```

### 5. **Review Progress Logs**
```bash
# After completion
./claude-flow logs --last-run
```

## 🛠️ Troubleshooting

### "Cannot connect to Neo4j"
- Check if Neo4j is running: `neo4j status`
- Verify credentials in environment variables
- Try local JSON mode: `export COGNITIVE_GRAPH_FORMAT=json`

### "Progress seems stuck"
- Use `--verbose` to see detailed logs
- Check `./claude-flow status` for active processes
- Review memory: `./claude-flow memory list`

### "Analysis not running automatically"
- Verify autoAnalysis is enabled in settings
- Check project complexity thresholds
- Manually trigger: mention "analyze architecture" in prompts

## 💡 Pro Tips

1. **Combine with Monitoring**
   ```bash
   ./claude-flow achieve "Goal" --monitor --visual --webhook $SLACK_WEBHOOK
   ```

2. **Use Memory for Progress Tracking**
   ```bash
   ./claude-flow memory get "goal/*/progress"
   ```

3. **Enable All Intelligence Features**
   ```bash
   ./claude-flow achieve "Goal" \
     --self-aware advanced \
     --cognitive-analysis frequent \
     --neural-optimization \
     --collective-learning
   ```

Remember: The system is designed to be intelligent about when to analyze and how to show progress. Trust the process, but feel free to guide it with explicit requests!