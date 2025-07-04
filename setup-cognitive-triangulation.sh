#!/bin/bash

echo "🧠 Claude-Flow Cognitive Triangulation Setup"
echo "==========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    touch .env
fi

# Check for existing API keys
if grep -q "DEEPSEEK_API_KEY\|OPENAI_API_KEY\|CLAUDE_API_KEY" .env 2>/dev/null; then
    echo "✅ API key already configured in .env"
else
    echo "Select your LLM provider for intelligent code analysis:"
    echo "1) DeepSeek (Recommended - cheapest, ~$0.14/million tokens)"
    echo "2) OpenAI GPT-4"
    echo "3) Claude"
    echo "4) Skip (use basic regex analysis)"
    echo ""
    read -p "Enter choice (1-4): " choice

    case $choice in
        1)
            read -p "Enter your DeepSeek API key: " api_key
            echo "DEEPSEEK_API_KEY=$api_key" >> .env
            echo "✅ DeepSeek API key saved"
            ;;
        2)
            read -p "Enter your OpenAI API key: " api_key
            echo "OPENAI_API_KEY=$api_key" >> .env
            echo "✅ OpenAI API key saved"
            ;;
        3)
            read -p "Enter your Claude API key: " api_key
            echo "CLAUDE_API_KEY=$api_key" >> .env
            echo "✅ Claude API key saved"
            ;;
        4)
            echo "⚠️  Skipping API key setup - will use basic analysis"
            ;;
        *)
            echo "Invalid choice"
            exit 1
            ;;
    esac
fi

# Enable real mode
if ! grep -q "USE_REAL_COGNITIVE_TRIANGULATION" .env 2>/dev/null; then
    echo "USE_REAL_COGNITIVE_TRIANGULATION=true" >> .env
    echo "✅ Real Cognitive Triangulation mode enabled"
fi

# Check Docker
echo ""
echo "Checking Docker installation..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    
    # Check if Docker is running
    if docker info &> /dev/null; then
        echo "✅ Docker is running"
    else
        echo "⚠️  Docker is installed but not running"
        echo "   Please start Docker Desktop"
    fi
else
    echo "❌ Docker is not installed"
    echo "   Please install Docker Desktop from https://docker.com"
    echo "   (Required for Neo4j and Redis)"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "You can now use:"
echo "  ./claude-flow swarm \"Analyze my project with cognitive triangulation\""
echo ""
echo "Neo4j Browser will be available at: http://localhost:7474"
echo "Login: neo4j / test1234"