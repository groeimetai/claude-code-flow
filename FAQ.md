# Frequently Asked Questions

## 💰 Does this cost money?

**Short answer: NO!** (unless you want advanced AI analysis)

### What's FREE:
- ✅ **Neo4j Community Edition** - Runs locally on your computer
- ✅ **Redis** - Open source, runs locally
- ✅ **All Claude-Flow features** - 100% free
- ✅ **Basic code analysis** - Uses regex patterns
- ✅ **Docker containers** - Free to use

### What costs money (optional):
- 💵 **LLM API** for intelligent code analysis
  - DeepSeek: ~$0.14 per million tokens (cheapest)
  - OpenAI: More expensive
  - Claude: Most expensive

## 🤔 Neo4j and Redis aren't free services, right?

**They have both free and paid versions:**

### What we use (FREE):
- **Neo4j Community Edition**: Free, open-source version
- **Redis OSS**: Free, open-source version
- Both run locally in Docker containers
- No cloud services = no costs

### What we DON'T use (PAID):
- ❌ Neo4j Aura (cloud service)
- ❌ Redis Cloud
- ❌ Neo4j Enterprise Edition

## 🐳 Do I need Docker?

**Yes**, Docker is required for Neo4j and Redis to run locally.

Docker Desktop is free for:
- Personal use
- Education
- Small businesses (<250 employees AND <$10M revenue)

## 🔑 Which API key should I choose?

For the best balance of cost and quality:
1. **DeepSeek** - Cheapest option, good quality
2. **OpenAI GPT-3.5** - More expensive, slightly better
3. **Claude** - Most expensive, best quality

**Note**: You can use claude-flow without any API key! It will use regex-based analysis instead.

## 📊 Can I see the knowledge graphs?

Yes! Neo4j Browser is available at http://localhost:7474
- Username: neo4j
- Password: test1234

Each project gets its own isolated graph with a unique analysisId.

## 🚀 Is this production-ready?

This is designed for local development and analysis. For production:
- Consider Neo4j Enterprise (paid) for better performance
- Use managed Redis for reliability
- Implement proper authentication
- Add monitoring and backups