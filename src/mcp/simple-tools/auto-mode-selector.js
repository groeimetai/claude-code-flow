// Auto Mode Selector - Intelligently selects the right mode/tool based on user input

export class AutoModeSelector {
  constructor(logger) {
    this.logger = logger;
    
    // Keywords mapped to modes
    this.modeKeywords = {
      'cognitive-analyst': ['analyze', 'understand', 'cognitive', 'triangulation', 'code analysis', 'dependencies'],
      'graph-architect': ['graph', 'knowledge graph', 'relationships', 'visualization', 'mapping'],
      'neural-orchestrator': ['neural', 'swarm', 'optimize', 'parallel', 'distributed'],
      'autonomous-architect': ['autonomous', 'self-managing', 'automated', 'independent'],
      'ml-coordinator': ['machine learning', 'ml', 'training', 'model', 'dataset'],
      'quantum-security': ['quantum', 'encryption', 'security', 'cryptography'],
      'architect': ['design', 'architecture', 'structure', 'system design'],
      'tdd': ['test', 'testing', 'tdd', 'test-driven'],
      'debug': ['bug', 'fix', 'error', 'debug', 'troubleshoot'],
      'optimizer': ['optimize', 'performance', 'speed up', 'efficient'],
      'researcher': ['research', 'find', 'search', 'investigate', 'explore']
    };
    
    // Tool keywords
    this.toolKeywords = {
      'cognitive_triangulation/analyze_codebase': ['analyze codebase', 'code structure', 'dependencies'],
      'cognitive_triangulation/extract_pois': ['points of interest', 'extract', 'find functions'],
      'ruv_swarm/init': ['neural swarm', 'initialize swarm', 'swarm network'],
      'daa/create_agent': ['autonomous agent', 'create agent', 'deploy agent']
    };
  }
  
  // Suggest best mode based on user input
  suggestMode(userInput) {
    const input = userInput.toLowerCase();
    const scores = {};
    
    // Score each mode based on keyword matches
    for (const [mode, keywords] of Object.entries(this.modeKeywords)) {
      scores[mode] = 0;
      for (const keyword of keywords) {
        if (input.includes(keyword)) {
          scores[mode] += keyword.split(' ').length; // Multi-word keywords score higher
        }
      }
    }
    
    // Find best match
    const bestMode = Object.entries(scores)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)[0];
    
    if (bestMode) {
      this.logger.info(`Auto-selected mode: ${bestMode[0]} (confidence: ${bestMode[1]})`);
      return {
        mode: bestMode[0],
        confidence: bestMode[1],
        reason: `Keywords matched: ${this.modeKeywords[bestMode[0]].filter(k => input.includes(k)).join(', ')}`
      };
    }
    
    // Default fallback
    return {
      mode: 'orchestrator',
      confidence: 0,
      reason: 'No specific keywords found, using general orchestrator'
    };
  }
  
  // Suggest tools based on task
  suggestTools(userInput) {
    const input = userInput.toLowerCase();
    const matchedTools = [];
    
    for (const [tool, keywords] of Object.entries(this.toolKeywords)) {
      for (const keyword of keywords) {
        if (input.includes(keyword)) {
          matchedTools.push({
            tool,
            keyword,
            relevance: keyword.split(' ').length
          });
        }
      }
    }
    
    return matchedTools.sort((a, b) => b.relevance - a.relevance);
  }
  
  // Generate smart command based on input
  generateCommand(userInput) {
    const modeSuggestion = this.suggestMode(userInput);
    const toolSuggestions = this.suggestTools(userInput);
    
    // If high confidence in mode selection
    if (modeSuggestion.confidence >= 2) {
      return {
        command: `./claude-flow sparc run ${modeSuggestion.mode} "${userInput}"`,
        explanation: `Using ${modeSuggestion.mode} because: ${modeSuggestion.reason}`,
        alternatives: toolSuggestions.length > 0 ? 
          toolSuggestions.map(t => `Tool: ${t.tool}`) : []
      };
    }
    
    // If tools are more relevant
    if (toolSuggestions.length > 0) {
      return {
        command: `./claude-flow swarm "${userInput}" --tools ${toolSuggestions[0].tool}`,
        explanation: `Using MCP tool ${toolSuggestions[0].tool} for: ${toolSuggestions[0].keyword}`,
        alternatives: modeSuggestion.confidence > 0 ? 
          [`Mode: ${modeSuggestion.mode}`] : []
      };
    }
    
    // Default to swarm
    return {
      command: `./claude-flow swarm "${userInput}"`,
      explanation: 'Using general swarm mode for flexibility',
      alternatives: []
    };
  }
}

// Export for use in CLI
export function autoSelect(userInput, logger = console) {
  const selector = new AutoModeSelector(logger);
  return selector.generateCommand(userInput);
}