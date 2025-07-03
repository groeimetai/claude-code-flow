# Instructions to Push the Cognitive Triangulation Fork

Follow these steps to push the changes to your own GitHub fork:

## 1. Create a Fork on GitHub

1. Go to https://github.com/ruvnet/claude-code-flow
2. Click the "Fork" button in the top-right corner
3. Select your GitHub account to create the fork

## 2. Update the Remote URL

After creating the fork, update the remote URL in your local repository:

```bash
# Remove the current origin
git remote remove origin

# Add your fork as the new origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/claude-code-flow.git

# Verify the remote was added
git remote -v
```

## 3. Push the Changes

```bash
# Push the main branch with the cognitive triangulation integration
git push -u origin main
```

## 4. Create a Pull Request (Optional)

If you want to contribute these changes back to the original repository:

1. Go to your fork on GitHub
2. Click "Pull requests" > "New pull request"
3. Review the changes and create the PR

## What Was Added

This fork includes:

- **5 new MCP tools** for cognitive triangulation:
  - `cognitive_triangulation/analyze_codebase`
  - `cognitive_triangulation/extract_pois`
  - `cognitive_triangulation/query_relationships`
  - `cognitive_triangulation/build_graph`
  - `cognitive_triangulation/cleanup_graph`

- **2 new SPARC modes**:
  - `cognitive-analyst` - Deep code analysis specialist
  - `graph-architect` - Knowledge graph specialist

- **Full integration** with Claude-Flow's MCP server
- **Documentation** in `docs/cognitive-triangulation-integration.md`

## Usage After Pushing

Once pushed to your fork, you can:

1. Use it in your projects by cloning your fork
2. Install it globally: `npm install -g github:YOUR_USERNAME/claude-code-flow`
3. Use the new SPARC modes:
   ```bash
   ./claude-flow sparc run cognitive-analyst "Analyze this codebase"
   ./claude-flow sparc run graph-architect "Build a knowledge graph"
   ```

## Environment Setup

Make sure to set the path to your cognitive triangulation installation:

```bash
export COGNITIVE_TRIANGULATION_PATH=/path/to/cognitive-triangulation-mcp
```

Or install it globally:

```bash
npm install -g cognitive-triangulation-mcp
```