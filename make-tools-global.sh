#!/bin/bash

echo "🌍 Making MCP-enhanced claude-flow globally available"
echo "===================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from claude-flow-enhanced directory"
    exit 1
fi

echo "You have several options to make the MCP tools globally available:"
echo ""
echo "Option 1: 🔗 Create a global symlink (recommended)"
echo "----------------------------------------------"
echo "sudo npm link"
echo ""
echo "This will make 'claude-flow' command use YOUR enhanced version globally"
echo ""

echo "Option 2: 📦 Publish to npm (for sharing)"
echo "--------------------------------------"
echo "1. Update package.json with a unique name (e.g., @yourname/claude-flow-mcp)"
echo "2. npm login"
echo "3. npm publish"
echo "4. Then install globally: npm install -g @yourname/claude-flow-mcp"
echo ""

echo "Option 3: 🏠 Add to PATH (local use)"
echo "---------------------------------"
echo "Add this to your ~/.bashrc or ~/.zshrc:"
echo "export PATH=\"$PWD/bin:\$PATH\""
echo ""

echo "Option 4: 🔧 Create an alias"
echo "-------------------------"
echo "Add this to your ~/.bashrc or ~/.zshrc:"
echo "alias claude-flow-mcp='$PWD/claude-flow'"
echo ""

echo "Which option would you like to use?"
echo "1) Global symlink (npm link)"
echo "2) Publish to npm"
echo "3) Add to PATH"
echo "4) Create alias"
echo "5) Show manual instructions"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo "🔗 Creating global symlink..."
        npm link
        echo ""
        echo "✅ Done! Now 'claude-flow' will use your MCP-enhanced version globally"
        echo "To test: claude-flow swarm \"Test with cognitive triangulation\""
        echo ""
        echo "To unlink later: npm unlink -g"
        ;;
    2)
        echo "📦 To publish to npm:"
        echo "1. Edit package.json and change the name to something unique"
        echo "2. Run: npm login"
        echo "3. Run: npm publish"
        echo "4. Install globally: npm install -g your-package-name"
        ;;
    3)
        echo "🏠 Adding to PATH..."
        echo ""
        echo "Add this line to your shell config file:"
        echo "export PATH=\"$PWD/bin:\$PATH\""
        echo ""
        echo "Then reload your shell:"
        echo "source ~/.bashrc  # or source ~/.zshrc"
        ;;
    4)
        echo "🔧 Creating alias..."
        echo ""
        echo "Add this line to your shell config file:"
        echo "alias claude-flow-mcp='$PWD/claude-flow'"
        echo ""
        echo "Then reload your shell:"
        echo "source ~/.bashrc  # or source ~/.zshrc"
        ;;
    5)
        echo "📚 Manual instructions displayed above."
        ;;
    *)
        echo "❌ Invalid choice"
        ;;
esac