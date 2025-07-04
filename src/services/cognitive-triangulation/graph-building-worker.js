export async function processGraphBuilding(job) {
  const { analysisId, batch } = job.data;
  
  // Graph building is handled by the GraphBuilder class
  // This worker mainly tracks progress
  
  return {
    analysisId,
    processed: batch.length,
    status: 'completed'
  };
}