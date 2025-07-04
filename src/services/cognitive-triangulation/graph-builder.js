export class GraphBuilder {
  constructor(neo4jDriver, logger) {
    this.driver = neo4jDriver;
    this.logger = logger;
  }
  
  async createPOINode(poi, analysisId) {
    const session = this.driver.session();
    
    try {
      const result = await session.run(
        `
        MERGE (p:POI {
          name: $name,
          filePath: $filePath,
          analysisId: $analysisId
        })
        SET p.type = $type,
            p.startLine = $startLine,
            p.endLine = $endLine,
            p.metadata = $metadata,
            p.updatedAt = datetime()
        RETURN p
        `,
        {
          name: poi.name,
          filePath: poi.filePath,
          type: poi.type,
          startLine: poi.startLine,
          endLine: poi.endLine,
          metadata: JSON.stringify(poi.metadata || {}),
          analysisId: analysisId,
        }
      );
      
      return result.records[0].get('p');
    } finally {
      await session.close();
    }
  }
  
  async createRelationship(sourcePOI, targetPOI, relationship) {
    const session = this.driver.session();
    
    try {
      const result = await session.run(
        `
        MATCH (s:POI {name: $sourceName, filePath: $sourceFile})
        MATCH (t:POI {name: $targetName, filePath: $targetFile})
        MERGE (s)-[r:${relationship.type}]->(t)
        SET r.confidence = $confidence,
            r.evidence = $evidence,
            r.updatedAt = datetime()
        RETURN r
        `,
        {
          sourceName: sourcePOI.name,
          sourceFile: sourcePOI.filePath,
          targetName: targetPOI.name,
          targetFile: targetPOI.filePath,
          confidence: relationship.confidence || 1.0,
          evidence: JSON.stringify(relationship.evidence || []),
        }
      );
      
      return result.records[0].get('r');
    } finally {
      await session.close();
    }
  }
  
  async createFileNode(filePath, analysisId) {
    const session = this.driver.session();
    
    try {
      const result = await session.run(
        `
        MERGE (f:File {path: $path, analysisId: $analysisId})
        SET f.updatedAt = datetime()
        RETURN f
        `,
        {
          path: filePath,
          analysisId: analysisId,
        }
      );
      
      return result.records[0].get('f');
    } finally {
      await session.close();
    }
  }
  
  async linkPOIToFile(poi, filePath) {
    const session = this.driver.session();
    
    try {
      await session.run(
        `
        MATCH (p:POI {name: $poiName, filePath: $filePath})
        MATCH (f:File {path: $filePath})
        MERGE (f)-[:CONTAINS]->(p)
        `,
        {
          poiName: poi.name,
          filePath: filePath,
        }
      );
    } finally {
      await session.close();
    }
  }
}