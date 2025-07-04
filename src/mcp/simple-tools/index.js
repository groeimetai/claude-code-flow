import { createCognitiveTriangulationTools } from './cognitive-triangulation.js';
import { createRuvSwarmTools } from './ruv-fann.js';
import { createDAATools } from './daa.js';

export function loadSimpleTools(logger) {
  const tools = [];
  
  try {
    tools.push(...createCognitiveTriangulationTools(logger));
    logger.info('Loaded Cognitive Triangulation tools');
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
