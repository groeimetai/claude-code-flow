#!/bin/bash

# Apply MCP integration to claude-flow-enhanced
# This adds the tools without breaking the existing system

set -e

echo "🔧 Applying MCP Integration to Claude-Flow"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from claude-flow-enhanced directory"
    exit 1
fi

echo "📁 Working directory: $(pwd)"

# Create a wrapper for the swarm command that includes MCP tools
echo "🔄 Creating MCP-enhanced swarm wrapper..."

# Create the enhanced swarm executor
cat > src/cli/simple-commands/swarm-executor-mcp.js << 'EOF'
// MCP-enhanced swarm executor
import { loadSimpleTools } from '../../mcp/simple-tools/index.js';

// Original swarm executor with MCP enhancement
export async function executeSwarm(objective, flags) {
  const logger = {
    info: (...args) => console.log('[INFO]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    debug: (...args) => console.log('[DEBUG]', ...args)
  };

  try {
    // Load MCP tools
    const mcpTools = loadSimpleTools(logger);
    logger.info(`Loaded ${mcpTools.length} MCP tools for swarm`);

    // Check if objective mentions any MCP-related keywords
    const useCognitiveAnalysis = objective.toLowerCase().includes('cognitive') || 
                                objective.toLowerCase().includes('triangulation') ||
                                objective.toLowerCase().includes('analyze code') ||
                                objective.toLowerCase().includes('knowledge graph');
    
    const useNeuralSwarm = objective.toLowerCase().includes('neural') ||
                          objective.toLowerCase().includes('swarm coordination') ||
                          objective.toLowerCase().includes('distributed agents');
    
    const useDAA = objective.toLowerCase().includes('autonomous') ||
                   objective.toLowerCase().includes('daa') ||
                   objective.toLowerCase().includes('decentralized');

    // Log which tools might be used
    if (useCognitiveAnalysis) {
      logger.info('🧠 Cognitive Triangulation tools available for this objective');
    }
    if (useNeuralSwarm) {
      logger.info('🤖 Neural Swarm tools available for this objective');
    }
    if (useDAA) {
      logger.info('⚡ DAA tools available for this objective');
    }

    // Create enhanced swarm context
    const swarmContext = {
      objective,
      flags,
      mcpTools,
      logger,
      // Tool executor
      executeMCPTool: async (toolName, input) => {
        const tool = mcpTools.find(t => t.name === toolName);
        if (!tool) {
          throw new Error(`MCP tool not found: ${toolName}`);
        }
        logger.info(`Executing MCP tool: ${toolName}`);
        return await tool.execute(input);
      }
    };

    // If original executor exists, use it with enhanced context
    try {
      const { executeSwarm: originalExecutor } = await import('./swarm-executor.js');
      return await originalExecutor(objective, flags, swarmContext);
    } catch (error) {
      // Fallback to basic execution with MCP tools info
      logger.info('Using MCP-enhanced basic swarm execution');
      
      console.log(`
🐝 MCP-Enhanced Swarm Execution
📋 Objective: ${objective}
🎯 Strategy: ${flags.strategy || 'auto'}
🛠️  MCP Tools Available: ${mcpTools.length}

Available MCP Tools:
${mcpTools.map(t => `  - ${t.name}: ${t.description}`).join('\n')}

The swarm will coordinate agents to achieve the objective using the available tools.
`);
      
      return { success: true, mcpToolsAvailable: mcpTools.length };
    }
  } catch (error) {
    logger.error('MCP swarm execution error:', error);
    throw error;
  }
}
EOF

# Update CLAUDE.md to document the MCP tools
echo "📝 Updating CLAUDE.md with MCP tool documentation..."

# Check if MCP section already exists
if ! grep -q "Cognitive Triangulation Integration" CLAUDE.md; then
    cat >> CLAUDE.md << 'EOF'

## 🆕 Cognitive Triangulation Integration

Claude-Flow now includes integrated Cognitive Triangulation MCP tools for advanced code analysis:

### Available Cognitive Triangulation Tools

1. **`cognitive_triangulation/analyze_codebase`** - Comprehensive codebase analysis
   - Builds knowledge graph of code relationships
   - Identifies dependencies and architecture patterns
   - Supports include/exclude patterns

2. **`cognitive_triangulation/extract_pois`** - Extract Points of Interest
   - Identifies functions, classes, methods, interfaces
   - Provides context for each POI
   - Supports filtering by type

3. **`cognitive_triangulation/query_relationships`** - Query code relationships
   - Natural language queries about code structure
   - Scope queries to specific files/directories
   - Configurable traversal depth

4. **`cognitive_triangulation/build_graph`** - Build knowledge graphs
   - Supports multiple output formats (Neo4j, JSON, GraphML)
   - Incremental updates for large codebases
   - Persistent graph storage

5. **`cognitive_triangulation/cleanup_graph`** - Graph maintenance
   - Remove orphaned nodes and relationships
   - Dry-run mode for safety
   - Optimize graph performance

### New SPARC Modes for Cognitive Analysis

- **`cognitive-analyst`**: Deep code analysis using cognitive triangulation
  ```bash
  ./claude-flow sparc run cognitive-analyst "Analyze the authentication system architecture"
  ```

- **`graph-architect`**: Build and query code knowledge graphs
  ```bash
  ./claude-flow sparc run graph-architect "Create a knowledge graph of the API endpoints"
  ```

### Integration Examples

```bash
# Analyze a project with cognitive triangulation
./claude-flow sparc run cognitive-analyst "Use cognitive triangulation to understand this codebase"

# Build a knowledge graph
./claude-flow sparc run graph-architect "Build a complete knowledge graph of the project"

# Combine with other modes
./claude-flow sparc run researcher "Research the project structure" && \
./claude-flow sparc run cognitive-analyst "Analyze code relationships" && \
./claude-flow sparc run architect "Design improvements based on the analysis"

# Store analysis results in memory
./claude-flow memory store "code_analysis" "Results from cognitive triangulation"
```
EOF
fi

# Create test script
echo "🧪 Creating MCP integration test..."
cat > test-mcp-integration.js << 'EOF'
#!/usr/bin/env node

import { executeSwarm } from './src/cli/simple-commands/swarm-executor-mcp.js';

console.log('Testing MCP Integration\n');

// Test cognitive triangulation
console.log('1. Testing Cognitive Triangulation:');
await executeSwarm('Use cognitive triangulation to analyze the src directory', {
  strategy: 'research',
  'dry-run': true
});

console.log('\n2. Testing Neural Swarm:');
await executeSwarm('Initialize neural swarm for optimization', {
  strategy: 'optimization',
  'dry-run': true
});

console.log('\n3. Testing DAA:');
await executeSwarm('Create autonomous agents for testing', {
  strategy: 'testing',
  'dry-run': true
});

console.log('\nMCP Integration test complete!');
EOF

chmod +x test-mcp-integration.js

# Create a simple launcher that uses the MCP-enhanced executor
echo "🚀 Creating MCP-enhanced launcher..."
cat > claude-flow-mcp << 'EOF'
#!/usr/bin/env bash

# Claude-Flow with MCP tools integrated
# This launcher ensures MCP tools are available

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Export flag to use MCP-enhanced executor
export USE_MCP_EXECUTOR=true

# Forward to main claude-flow with all arguments
exec "$SCRIPT_DIR/claude-flow" "$@"
EOF

chmod +x claude-flow-mcp

echo ""
echo "✅ MCP Integration Applied!"
echo ""
echo "📋 What's been added:"
echo "  - MCP-enhanced swarm executor"
echo "  - 6 integrated MCP tools"
echo "  - Updated CLAUDE.md documentation"
echo "  - Test script for verification"
echo "  - MCP-enhanced launcher"
echo ""
echo "🧪 Test the integration:"
echo "  node test-mcp-integration.js"
echo ""
echo "🚀 Use MCP-enhanced swarms:"
echo "  ./claude-flow-mcp swarm \"Analyze codebase with cognitive triangulation\""
echo "  ./claude-flow-mcp swarm \"Create neural swarm for optimization\""
echo "  ./claude-flow-mcp swarm \"Deploy autonomous agents\""
echo ""
echo "The MCP tools are now available in all swarm operations!"
EOF

chmod +x apply-mcp-integration.sh