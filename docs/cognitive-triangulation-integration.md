# Cognitive Triangulation Integration for Claude-Flow

This document describes how the Cognitive Triangulation Pipeline MCP has been integrated into Claude-Flow.

## Overview

The Cognitive Triangulation Pipeline provides advanced code analysis capabilities through MCP (Model Context Protocol) tools. This integration adds five new MCP tools and two new SPARC modes to Claude-Flow.

## New MCP Tools

### 1. cognitive_triangulation/analyze_codebase
Performs comprehensive codebase analysis to build a knowledge graph of code relationships.

**Input Parameters:**
- `projectPath` (required): Path to the project directory
- `outputPath`: Where to store analysis results
- `includePatterns`: File patterns to include (e.g., ["*.js", "*.ts"])
- `excludePatterns`: File patterns to exclude

**Example:**
```javascript
{
  "projectPath": "/path/to/project",
  "includePatterns": ["*.js", "*.ts"],
  "excludePatterns": ["node_modules/**", "*.test.js"]
}
```

### 2. cognitive_triangulation/extract_pois
Extracts Points of Interest (POIs) from specific files.

**Input Parameters:**
- `filePaths` (required): Array of file paths to analyze
- `poiTypes`: Types to extract (function, class, method, interface, type, variable, import, export)
- `includeContext`: Include surrounding context for each POI

**Example:**
```javascript
{
  "filePaths": ["src/index.js", "src/utils.js"],
  "poiTypes": ["function", "class"],
  "includeContext": true
}
```

### 3. cognitive_triangulation/query_relationships
Query code relationships using natural language.

**Input Parameters:**
- `query` (required): Natural language query
- `scope`: Limit to specific files/directories
- `depth`: Maximum traversal depth (default: 3)

**Example:**
```javascript
{
  "query": "What functions call the authenticate method?",
  "scope": {
    "directories": ["src/auth"]
  },
  "depth": 2
}
```

### 4. cognitive_triangulation/build_graph
Build or update the knowledge graph.

**Input Parameters:**
- `projectPath` (required): Path to project
- `graphPath`: Where to store the graph
- `incremental`: Perform incremental update
- `format`: Output format (neo4j, json, graphml)

**Example:**
```javascript
{
  "projectPath": "/path/to/project",
  "format": "neo4j",
  "incremental": true
}
```

### 5. cognitive_triangulation/cleanup_graph
Clean up orphaned nodes and relationships.

**Input Parameters:**
- `graphPath`: Path to the knowledge graph
- `dryRun`: Preview changes without applying

## New SPARC Modes

### cognitive-analyst
A specialized mode for deep code analysis using cognitive triangulation.

**Usage:**
```bash
./claude-flow sparc run cognitive-analyst "Analyze the authentication system"
```

**Capabilities:**
- Analyzes code structure and patterns
- Identifies architectural insights
- Provides recommendations for improvements
- Uses cognitive triangulation tools automatically

### graph-architect
Specializes in building and querying code knowledge graphs.

**Usage:**
```bash
./claude-flow sparc run graph-architect "Build a knowledge graph of the API"
```

**Capabilities:**
- Creates comprehensive knowledge graphs
- Queries complex relationships
- Visualizes code dependencies
- Maintains graph integrity

## Integration Workflows

### 1. Full Codebase Analysis
```bash
# Start with cognitive analysis
./claude-flow sparc run cognitive-analyst "Analyze the entire codebase structure"

# Store results in memory
./claude-flow memory store "analysis_results" "Complete codebase analysis from cognitive triangulation"

# Use results for architecture improvements
./claude-flow sparc run architect "Design improvements based on analysis_results in memory"
```

### 2. Targeted Component Analysis
```bash
# Analyze specific component
./claude-flow sparc run cognitive-analyst "Analyze the payment processing module"

# Build knowledge graph
./claude-flow sparc run graph-architect "Create a knowledge graph of payment dependencies"

# Debug issues found
./claude-flow sparc run debugger "Fix circular dependencies in payment module"
```

### 3. Continuous Integration
```bash
# Add to CI pipeline
./claude-flow sparc run cognitive-analyst "Analyze code changes in PR" && \
./claude-flow sparc run reviewer "Review based on cognitive analysis" && \
./claude-flow sparc run tester "Test affected components"
```

## Configuration

### Environment Variables
- `COGNITIVE_TRIANGULATION_PATH`: Path to the cognitive triangulation executable
- `COGNITIVE_TRIANGULATION_GRAPH_PATH`: Default path for knowledge graphs

### Integration with .roomodes
The new modes are automatically added to your `.roomodes` configuration when you initialize a SPARC project:

```json
{
  "customModes": [
    {
      "slug": "cognitive-analyst",
      "name": "🧠 Cognitive Analyst",
      "roleDefinition": "You are a code analysis specialist using cognitive triangulation...",
      "groups": ["read", "mcp"],
      "source": "project"
    },
    {
      "slug": "graph-architect",
      "name": "🕸️ Graph Architect",
      "roleDefinition": "You specialize in building and querying code knowledge graphs...",
      "groups": ["read", "edit", "mcp"],
      "source": "project"
    }
  ]
}
```

## Best Practices

1. **Start with Analysis**: Always begin with cognitive-analyst mode to understand the codebase
2. **Store in Memory**: Use Claude-Flow's memory system to persist analysis results
3. **Combine Modes**: Leverage multiple SPARC modes together for comprehensive workflows
4. **Incremental Updates**: Use incremental graph updates for large codebases
5. **Scope Queries**: Limit analysis scope for better performance on specific components

## Troubleshooting

### Cognitive Triangulation Not Found
If you get an error about the cognitive triangulation executable not being found:

1. Ensure cognitive-triangulation-mcp is installed globally:
   ```bash
   npm install -g cognitive-triangulation-mcp
   ```

2. Set the environment variable:
   ```bash
   export COGNITIVE_TRIANGULATION_PATH=/path/to/cognitive-triangulation-mcp
   ```

### Graph Build Failures
- Check that Neo4j is running if using neo4j format
- Ensure sufficient disk space for large graphs
- Use incremental updates for better performance

### Tool Timeout Issues
- Break large analyses into smaller scopes
- Use the swarm coordinator for very large codebases
- Enable parallel execution with --parallel flag

## Future Enhancements

- Visual graph exploration in Claude-Flow UI
- Automatic analysis triggers on code changes
- Integration with Claude-Flow's monitoring dashboard
- Custom POI type definitions
- Graph diff capabilities for tracking changes