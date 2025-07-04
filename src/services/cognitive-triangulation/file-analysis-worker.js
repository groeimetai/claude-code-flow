export async function processFileAnalysis(job) {
  const { analysisId, filePath, content } = job.data;
  
  // Extract POIs from the file
  const pois = extractPOIs(filePath, content);
  
  return {
    analysisId,
    filePath,
    pois,
    count: pois.length
  };
}

function extractPOIs(filePath, content) {
  const pois = [];
  const lines = content.split('\n');
  
  // Simple POI extraction (can be enhanced with AST parsing)
  const patterns = [
    { regex: /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g, type: 'function' },
    { regex: /(?:export\s+)?class\s+(\w+)/g, type: 'class' },
    { regex: /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/g, type: 'arrow_function' },
    { regex: /interface\s+(\w+)/g, type: 'interface' },
    { regex: /type\s+(\w+)\s*=/g, type: 'type' },
  ];
  
  patterns.forEach(({ regex, type }) => {
    let match;
    const globalRegex = new RegExp(regex.source, 'g');
    
    while ((match = globalRegex.exec(content)) !== null) {
      const name = match[1];
      const startIndex = match.index;
      const lineNumber = content.substring(0, startIndex).split('\n').length;
      
      pois.push({
        name,
        type,
        filePath,
        startLine: lineNumber,
        endLine: lineNumber, // Could be improved with proper parsing
        metadata: {
          pattern: regex.source,
          fullMatch: match[0]
        }
      });
    }
  });
  
  return pois;
}