#!/bin/bash

echo "🎯 Claude-Flow MCP Enhanced Installer"
echo "===================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is required but not installed"
    echo "   Install from: https://nodejs.org"
    exit 1
fi

if ! command_exists deno; then
    echo "⚠️  Deno is recommended but not installed"
    echo "   Install from: https://deno.land"
    echo "   Continuing without Deno support..."
fi

echo "✅ Prerequisites met"
echo ""

# Installation options
echo "Choose installation method:"
echo "1) Global installation (recommended)"
echo "2) Local installation"
echo "3) Development mode (npm link)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "Installing globally..."
        npm install -g .
        echo ""
        echo "✅ Installed! Commands available:"
        echo "   claude-flow      - Standard command"
        echo "   claude-flow-mcp  - MCP-enhanced command"
        echo "   cf              - Short alias"
        echo "   cfm             - Short MCP alias"
        ;;
    2)
        echo "Installing locally..."
        npm install
        echo ""
        echo "✅ Installed! Use with:"
        echo "   ./claude-flow"
        echo "   ./claude-flow-mcp"
        ;;
    3)
        echo "Setting up development mode..."
        npm link
        echo ""
        echo "✅ Linked! Development mode active"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🧪 Running tests..."
if [ -f "test-simple-tools.js" ]; then
    node test-simple-tools.js
fi

echo ""
echo "📚 Quick Start Guide:"
echo "===================="
echo ""
echo "1. Test MCP tools:"
echo "   claude-flow-mcp swarm \"Analyze code with cognitive triangulation\""
echo ""
echo "2. Use new SPARC modes:"
echo "   claude-flow-mcp sparc run cognitive-analyst \"Analyze auth system\""
echo "   claude-flow-mcp sparc run graph-architect \"Build API graph\""
echo ""
echo "3. Initialize project with enhanced roomodes:"
echo "   claude-flow-mcp init --sparc"
echo ""
echo "4. View all available tools:"
echo "   claude-flow-mcp mcp tools"
echo ""
echo "Happy coding with MCP-enhanced Claude-Flow! 🚀"
