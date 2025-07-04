# Cognitive Triangulation Setup Guide

## Overview

The Cognitive Triangulation integration in claude-flow-enhanced provides two modes:

1. **Stub Mode** (Default) - Simple implementation for testing
2. **Full Mode** - Complete knowledge graph analysis using the real Cognitive Triangulation Pipeline

## Stub Mode (Default)

Works out-of-the-box without any setup:

```bash
./claude-flow swarm "Analyze code with cognitive triangulation"
```

This uses simplified implementations that demonstrate the concept but don't create real knowledge graphs.

## Full Mode (Advanced)

For real code analysis with knowledge graphs, you need to run the full Cognitive Triangulation Pipeline.

### Prerequisites

- Docker (for Redis and Neo4j)
- Node.js 18+
- An LLM API key (DeepSeek, OpenAI, or Claude)

### Setup Steps

1. **Clone the Cognitive Triangulation Pipeline**:
   ```bash
   git clone https://github.com/groeimetai/Cognitive-Triangulation-Pipeline
   cd Cognitive-Triangulation-Pipeline
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start infrastructure**:
   ```bash
   docker-compose up -d
   ```
   This starts:
   - Redis (for job queues)
   - Neo4j (for knowledge graph storage)

4. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add:
   ```env
   # Choose one AI provider:
   DEEPSEEK_API_KEY=your-key-here
   # OR
   OPENAI_API_KEY=your-key-here
   # OR
   CLAUDE_API_KEY=your-key-here
   
   # Neo4j (default works with docker-compose)
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=test1234
   ```

5. **Start the services**:
   ```bash
   npm run start:services
   ```

6. **Configure claude-flow to use the real service**:
   
   In your claude-flow project `.env`:
   ```env
   # Point to the running Cognitive Triangulation service
   COGNITIVE_TRIANGULATION_URL=http://localhost:3010
   COGNITIVE_TRIANGULATION_PATH=/path/to/Cognitive-Triangulation-Pipeline
   USE_COGNITIVE_TRIANGULATION_PROXY=true
   ```

### Using Full Mode

Once the service is running:

```bash
# Analyze a codebase
./claude-flow swarm "Use cognitive triangulation to analyze /path/to/project"

# The system will:
# 1. Discover all code files
# 2. Use LLM to extract Points of Interest (functions, classes, etc.)
# 3. Triangulate relationships between code elements
# 4. Build a knowledge graph in Neo4j
# 5. Make it queryable for Claude

# Check progress
./claude-flow swarm "Check cognitive triangulation analysis status"

# Query the graph
./claude-flow swarm "Show me all classes that depend on UserService"
```

### Viewing the Knowledge Graph

1. **Neo4j Browser**: http://localhost:7474
   - Username: neo4j
   - Password: test1234

2. **API Dashboard**: http://localhost:3010

### Example Queries

```cypher
// Find all classes
MATCH (c:Class) RETURN c.name

// Find dependencies of a class
MATCH (c:Class {name: 'UserService'})-[:DEPENDS_ON]->(dep)
RETURN c, dep

// Find all functions that call a specific function
MATCH (f1:Function)-[:CALLS]->(f2:Function {name: 'authenticate'})
RETURN f1, f2
```

## Troubleshooting

### Service won't start
- Check Docker is running: `docker ps`
- Check ports 6379 (Redis) and 7687 (Neo4j) are free
- Check logs: `docker-compose logs`

### Analysis seems stuck
- Check worker logs: `npm run logs:workers`
- Check Redis queue: `npm run queue:ui` (opens Bull Dashboard)

### No API key
- The system needs an LLM to analyze code
- DeepSeek is recommended for cost-effectiveness
- Get a key from: https://platform.deepseek.com/

## Architecture

```
Your Code → Entity Scout → File Analysis (LLM) → Relationship Triangulation → Neo4j Graph
                ↓               ↓                         ↓
              Redis           SQLite              Confidence Scoring
```

The system uses:
- **Redis + BullMQ**: Job queue management
- **SQLite**: Temporary storage and transactional outbox
- **Neo4j**: Final knowledge graph storage
- **LLMs**: Extract semantic meaning from code

## Why Use Full Mode?

The full Cognitive Triangulation Pipeline provides:

1. **Deep Understanding**: LLMs understand code semantics, not just syntax
2. **Relationship Discovery**: Finds non-obvious connections between code elements
3. **Confidence Scoring**: Multiple analysis passes reduce false positives
4. **Queryable Graph**: Use Cypher queries to explore your codebase
5. **Living Documentation**: Graph updates as code changes

Perfect for:
- Understanding legacy codebases
- Impact analysis before refactoring
- Architectural documentation
- Dependency mapping
- Code review assistance