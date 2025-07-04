# Claude-Flow MCP Enhanced 🚀

An enhanced fork of [claude-code-flow](https://github.com/ruvnet/claude-code-flow) with integrated MCP (Model Context Protocol) tools for advanced AI orchestration.

## 🌟 Key Features

### 🛠️ Integrated MCP Tools (6 total)

**Note**: Cognitive Triangulation can run in two modes:
- **Stub mode** (default): Works out-of-box for demos
- **Real mode**: Full Neo4j + Redis integration for actual knowledge graphs

#### Cognitive Triangulation
- `cognitive_triangulation/analyze_codebase` - Deep code analysis with knowledge graphs
- `cognitive_triangulation/extract_pois` - Extract points of interest from code

#### ruv-FANN Neural Swarm  
- `ruv_swarm/init` - Initialize neural swarm networks
- `ruv_swarm/spawn_cognitive_agent` - Spawn specialized cognitive agents

#### DAA Autonomous Agents
- `daa/create_agent` - Create fully autonomous AI agents
- `daa/execute_mrap` - Execute Multi-Round Agentic Protocols

### 🧠 New SPARC Modes (6 total)
- `cognitive-analyst` - Deep code analysis using cognitive triangulation
- `graph-architect` - Build and query code knowledge graphs
- `neural-orchestrator` - Orchestrate tasks with neural swarm intelligence
- `autonomous-architect` - Design autonomous AI systems
- `ml-coordinator` - Coordinate distributed ML workflows
- `quantum-security` - Implement quantum-resistant security

### 📁 Enhanced .roomodes
Automatically configured with all new AI modes when using `init --sparc`

## 🚀 Quick Start

```bash
# Clone this repository
git clone https://github.com/groeimetai/claude-code-flow
cd claude-code-flow

# Install dependencies
npm install

# Test that MCP tools work (stub mode)
node test-simple-tools.js

# Start using enhanced features!
./claude-flow swarm "Analyze my code with cognitive triangulation"
```

### 🔑 API Keys Setup (Optional)

For full Cognitive Triangulation with LLM-powered analysis:

```bash
# Option 1: DeepSeek (Recommended - cheapest)
echo "DEEPSEEK_API_KEY=your-key-here" >> .env

# Option 2: OpenAI
echo "OPENAI_API_KEY=sk-..." >> .env

# Option 3: Claude
echo "CLAUDE_API_KEY=your-key-here" >> .env

# Enable real mode
echo "USE_REAL_COGNITIVE_TRIANGULATION=true" >> .env
```

**Note**: Without an LLM API key, Cognitive Triangulation will use regex-based analysis instead of intelligent code understanding.

### 🎯 Easy Setup Script

```bash
# Run the interactive setup
./setup-cognitive-triangulation.sh
```

This will:
- Guide you through API key setup
- Check Docker installation
- Configure everything automatically

### 🧠 Enable Real Cognitive Triangulation (Optional)

For actual knowledge graphs with Neo4j:

```bash
# 1. Start required services
./start-cognitive-triangulation.sh

# 2. Edit .env
echo "USE_REAL_COGNITIVE_TRIANGULATION=true" >> .env

# 3. Use it!
./claude-flow swarm "Build knowledge graph of this project"

# View results at http://localhost:7474 (neo4j/test1234)
```

## 📚 Usage Examples

### Swarm with MCP Tools
```bash
# Analyze codebase structure
./claude-flow swarm "Use cognitive triangulation to analyze src directory"

# Create neural optimization swarm
./claude-flow swarm "Initialize neural swarm for performance optimization"

# Deploy autonomous agents
./claude-flow swarm "Create autonomous agents for testing"
```

### New SPARC Modes
```bash
# Deep code analysis
./claude-flow sparc run cognitive-analyst "Analyze authentication system architecture"

# Build knowledge graph
./claude-flow sparc run graph-architect "Create knowledge graph of API endpoints"

# Neural orchestration
./claude-flow sparc run neural-orchestrator "Coordinate complex refactoring task"
```

### Initialize Enhanced Project
```bash
# Create project with all MCP enhancements
./claude-flow init --sparc my-project
cd my-project

# Your .roomodes file now includes:
# - cognitive-analyst
# - graph-architect  
# - neural-orchestrator
# - autonomous-architect
# - ml-coordinator
# - quantum-security
# Plus all original modes!
```

## 🏗️ Architecture

```
claude-flow/
├── src/
│   ├── mcp/
│   │   └── simple-tools/           # MCP tool implementations
│   │       ├── cognitive-triangulation.js
│   │       ├── ruv-fann.js
│   │       ├── daa.js
│   │       └── index.js
│   ├── cli/
│   │   └── simple-commands/
│   │       ├── swarm-executor-mcp.js    # Enhanced swarm executor
│   │       └── sparc-modes-mcp.js       # New SPARC modes
│   └── ...
├── CLAUDE.md                       # Complete documentation
├── test-simple-tools.js           # MCP tools test
└── test-mcp-integration.js        # Integration test
```

## 🧪 Testing

```bash
# Test MCP tools functionality
node test-simple-tools.js

# Test swarm integration
node test-mcp-integration.js

# Run a dry-run swarm
./claude-flow swarm "Test cognitive analysis" --dry-run
```

## 📖 Documentation

See [CLAUDE.md](CLAUDE.md) for complete documentation including:
- All MCP tool descriptions
- Detailed usage examples
- Integration patterns
- Advanced configurations

## 🎯 What's Different from Original?

This fork maintains 100% compatibility with the original claude-code-flow while adding:

1. **Pre-integrated MCP tools** - No configuration needed
2. **Enhanced SPARC modes** - 6 new AI-powered modes
3. **Extended .roomodes** - Automatically configured
4. **Out-of-box experience** - Clone, install, and use immediately

## 🤝 Credits

- Original [claude-code-flow](https://github.com/ruvnet/claude-code-flow) by [@ruvnet](https://github.com/ruvnet)
- MCP tool integrations inspired by:
  - [Cognitive Triangulation Pipeline](https://github.com/groeimetai/cognitive-triangulation-pipeline)
  - [ruv-FANN](https://github.com/ruvnet/ruv) 
  - [DAA Framework](https://github.com/ruvnet/daa)

## 📄 License

MIT License - Same as the original claude-code-flow project

---

<p align="center">
  <strong>Ready to use advanced AI orchestration?</strong><br>
  Clone → Install → Create amazing things with MCP-enhanced Claude-Flow! 🚀
</p>
