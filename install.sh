#!/bin/bash

# Install script for Claude-Flow Enhanced
# This ensures proper installation with all dependencies

echo "🚀 Installing Claude-Flow Enhanced..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create global symlink
echo "🔗 Creating global link..."
npm link

# Make claude-flow executable
if [ -f "./claude-flow" ]; then
    chmod +x ./claude-flow
fi

echo "✅ Installation complete!"
echo ""
echo "You can now use claude-flow globally:"
echo "  claude-flow init --sparc"
echo "  claude-flow achieve \"Your goal here\""
echo ""
echo "Or locally in any project:"
echo "  ./claude-flow achieve \"Your goal here\""