# Claude-Flow MCP Enhanced 🚀

Claude-Flow enhanced with Model Context Protocol (MCP) tools for advanced AI orchestration.

## 🎯 What's Included

### 🛠️ Integrated MCP Tools

#### Cognitive Triangulation (2 tools)
- `cognitive_triangulation/analyze_codebase` - Deep code analysis with knowledge graphs
- `cognitive_triangulation/extract_pois` - Extract points of interest from code

#### ruv-FANN Neural Swarm (2 tools)
- `ruv_swarm/init` - Initialize neural swarm networks
- `ruv_swarm/spawn_cognitive_agent` - Spawn specialized cognitive agents

#### DAA Autonomous Agents (2 tools)
- `daa/create_agent` - Create fully autonomous AI agents
- `daa/execute_mrap` - Execute Multi-Round Agentic Protocols

### 🧠 New SPARC Modes

- `cognitive-analyst` - Deep code analysis using cognitive triangulation
- `graph-architect` - Build and query code knowledge graphs
- `neural-orchestrator` - Orchestrate tasks with neural swarm intelligence
- `autonomous-architect` - Design autonomous AI systems
- `ml-coordinator` - Coordinate distributed ML workflows
- `quantum-security` - Implement quantum-resistant security

### 📁 Extended .roomodes

The init command now creates an extended `.roomodes` file with all new modes pre-configured.

## 🚀 Installation

```bash
# Clone or download this package
git clone <your-repo-url>
cd claude-flow-mcp-enhanced

# Run the installer
./install-mcp-package.sh
```

## 📚 Usage Examples

### With Swarms
```bash
# Analyze codebase
claude-flow-mcp swarm "Analyze my project with cognitive triangulation"

# Create neural optimization swarm
claude-flow-mcp swarm "Optimize performance using neural swarm"

# Deploy autonomous agents
claude-flow-mcp swarm "Create autonomous testing agents"
```

### With SPARC Modes
```bash
# Deep code analysis
claude-flow-mcp sparc run cognitive-analyst "Analyze authentication architecture"

# Build knowledge graph
claude-flow-mcp sparc run graph-architect "Create API endpoint graph"

# Neural orchestration
claude-flow-mcp sparc run neural-orchestrator "Coordinate complex refactoring"
```

### Initialize Enhanced Project
```bash
# Create project with all MCP enhancements
claude-flow-mcp init --sparc my-project
cd my-project

# Your .roomodes file now includes all MCP-enhanced modes!
```

## 🔧 Configuration

The MCP tools are automatically available in:
- All swarm operations
- SPARC modes
- Direct MCP commands

## 📊 Architecture

```
claude-flow-mcp-enhanced/
├── src/
│   ├── mcp/
│   │   └── simple-tools/       # MCP tool implementations
│   ├── cli/
│   │   └── simple-commands/
│   │       ├── swarm-executor-mcp.js  # Enhanced swarm
│   │       └── sparc-modes-mcp.js     # New SPARC modes
│   └── ...
├── CLAUDE.md                   # Enhanced instructions
├── test-simple-tools.js        # Tool tests
└── test-mcp-integration.js     # Integration tests
```

## 🧪 Testing

```bash
# Test MCP tools
npm run test:tools

# Test integration
npm run test:integration

# Run all tests
npm test
```

## 🤝 Contributing

This is an enhanced fork of claude-code-flow. Contributions welcome!

## 📄 License

MIT License - Same as original claude-code-flow
