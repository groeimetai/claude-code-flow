import { createCognitiveTriangulationTools } from './cognitive-triangulation.js';
import { createRealCognitiveTriangulationTools } from '../cognitive-triangulation-real.js';
import { createRuvSwarmTools } from './ruv-fann.js';
import { createDAATools } from './daa.js';

export function loadSimpleTools(logger) {
  const tools = [];
  
  try {
    // Check if we should use real implementation
    const useRealCT = process.env.USE_REAL_COGNITIVE_TRIANGULATION === 'true';
    
    if (useRealCT) {
      tools.push(...createRealCognitiveTriangulationTools(logger));
      logger.info('Loaded REAL Cognitive Triangulation tools (Neo4j + Redis)');
    } else {
      tools.push(...createCognitiveTriangulationTools(logger));
      logger.info('Loaded Cognitive Triangulation tools (stub mode)');
    }
  } catch (error) {
    logger.error('Failed to load Cognitive Triangulation tools', error);
  }
  
  try {
    tools.push(...createRuvSwarmTools(logger));
    logger.info('Loaded ruv-FANN tools');
  } catch (error) {
    logger.error('Failed to load ruv-FANN tools', error);
  }
  
  try {
    tools.push(...createDAATools(logger));
    logger.info('Loaded DAA tools');
  } catch (error) {
    logger.error('Failed to load DAA tools', error);
  }
  
  logger.info(`Loaded ${tools.length} simple MCP tools`);
  return tools;
}
