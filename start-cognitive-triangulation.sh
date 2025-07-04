#!/bin/bash

echo "🧠 Starting Cognitive Triangulation Services"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi

# Check if services are already running
REDIS_RUNNING=$(docker ps --filter "ancestor=redis:7-alpine" --format "{{.Names}}" | head -1)
NEO4J_RUNNING=$(docker ps --filter "ancestor=neo4j:5-community" --format "{{.Names}}" | head -1)

if [ -n "$REDIS_RUNNING" ] && [ -n "$NEO4J_RUNNING" ]; then
  echo "✅ Services are already running:"
  echo "   - Redis: $REDIS_RUNNING"
  echo "   - Neo4j: $NEO4J_RUNNING"
  echo ""
  echo "Neo4j Browser: http://localhost:7474 (neo4j/test1234)"
  echo "Bull Dashboard: http://localhost:3040"
  exit 0
fi

# Start services
echo "🚀 Starting Redis and Neo4j..."
docker-compose up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."

# Wait for Redis
echo -n "   Redis: "
for i in {1..30}; do
  if docker exec $(docker ps --filter "ancestor=redis:7-alpine" --format "{{.Names}}" | head -1) redis-cli ping > /dev/null 2>&1; then
    echo "✅ Ready"
    break
  fi
  sleep 1
  echo -n "."
done

# Wait for Neo4j
echo -n "   Neo4j: "
for i in {1..60}; do
  if curl -s http://localhost:7474 > /dev/null 2>&1; then
    echo "✅ Ready"
    break
  fi
  sleep 1
  echo -n "."
done

echo ""
echo "✅ Cognitive Triangulation services are ready!"
echo ""
echo "📊 Access points:"
echo "   - Neo4j Browser: http://localhost:7474"
echo "     Username: neo4j"
echo "     Password: test1234"
echo ""
echo "   - Bull Dashboard: http://localhost:3040"
echo "     (Queue monitoring)"
echo ""
echo "🎯 Enable real Cognitive Triangulation:"
echo "   1. Edit .env and set: USE_REAL_COGNITIVE_TRIANGULATION=true"
echo "   2. Add your LLM API key (DEEPSEEK_API_KEY or OPENAI_API_KEY)"
echo "   3. Run: ./claude-flow swarm \"Analyze code with cognitive triangulation\""
echo ""
echo "To stop services: docker-compose down"