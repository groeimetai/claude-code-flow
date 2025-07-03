/**
 * SharedKnowledgeBase - Central repository for swarm discoveries and learnings
 * 
 * Provides semantic search, conflict resolution, and integration with Memory system
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getGlobalMessageBus, MessageTypes } from './message-bus.js';

// Knowledge types
export const KnowledgeTypes = {
  SOLUTION: 'solution',
  PATTERN: 'pattern',
  ERROR: 'error',
  OPTIMIZATION: 'optimization',
  ARCHITECTURE: 'architecture',
  CONFIGURATION: 'configuration',
  DISCOVERY: 'discovery',
  BEST_PRACTICE: 'best_practice',
  WARNING: 'warning',
  DEPENDENCY: 'dependency'
};

// Confidence levels
export const ConfidenceLevels = {
  VERIFIED: 'verified',      // Tested and confirmed
  HIGH: 'high',              // Strong evidence
  MEDIUM: 'medium',          // Some evidence
  LOW: 'low',                // Weak evidence
  EXPERIMENTAL: 'experimental' // Untested hypothesis
};

class SharedKnowledgeBase {
  constructor(options = {}) {
    this.knowledgeId = options.knowledgeId || `kb_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    this.storagePath = options.storagePath || './swarm-knowledge';
    this.memoryNamespace = options.memoryNamespace || 'swarm-knowledge';
    this.enableVectorSearch = options.enableVectorSearch || false;
    
    // Knowledge storage
    this.knowledge = new Map();
    this.knowledgeByType = new Map();
    this.knowledgeBySwarm = new Map();
    this.knowledgeIndex = new Map(); // For fast text search
    
    // Conflict tracking
    this.conflicts = new Map();
    
    // Message bus integration
    this.messageBus = options.messageBus || getGlobalMessageBus();
    
    // Initialize
    this.initialize();
  }
  
  async initialize() {
    try {
      // Create storage directory
      await fs.mkdir(this.storagePath, { recursive: true });
      
      // Load existing knowledge
      await this.loadKnowledge();
      
      // Subscribe to discovery messages
      this.messageBus.subscribe(
        MessageTypes.DISCOVERY_SHARED,
        (message) => this.handleDiscovery(message),
        { priority: 'high' }
      );
      
      this.messageBus.subscribe(
        MessageTypes.SOLUTION_FOUND,
        (message) => this.handleSolution(message),
        { priority: 'high' }
      );
      
      this.messageBus.subscribe(
        MessageTypes.ERROR_ENCOUNTERED,
        (message) => this.handleError(message),
        { priority: 'high' }
      );
      
      console.log(`🧠 Knowledge base initialized with ${this.knowledge.size} entries`);
    } catch (error) {
      console.error('Failed to initialize knowledge base:', error);
    }
  }
  
  /**
   * Load knowledge from disk
   */
  async loadKnowledge() {
    try {
      const files = await fs.readdir(this.storagePath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = await fs.readFile(path.join(this.storagePath, file), 'utf-8');
            const entry = JSON.parse(content);
            
            // Add to knowledge base
            this.knowledge.set(entry.id, entry);
            this.indexKnowledge(entry);
          } catch (error) {
            console.error(`Failed to load knowledge ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load knowledge:', error);
    }
  }
  
  /**
   * Add knowledge entry
   */
  async addKnowledge(entry) {
    // Validate entry
    const validatedEntry = this.validateEntry(entry);
    
    // Check for conflicts
    const conflicts = await this.checkConflicts(validatedEntry);
    if (conflicts.length > 0) {
      validatedEntry.conflicts = conflicts;
      
      // Resolve conflicts if possible
      const resolved = await this.resolveConflicts(validatedEntry, conflicts);
      if (!resolved) {
        // Track unresolved conflict
        this.conflicts.set(validatedEntry.id, {
          entry: validatedEntry,
          conflicts,
          timestamp: Date.now()
        });
      }
    }
    
    // Add to knowledge base
    this.knowledge.set(validatedEntry.id, validatedEntry);
    this.indexKnowledge(validatedEntry);
    
    // Persist to disk
    await this.persistKnowledge(validatedEntry);
    
    // Store in Memory system
    await this.storeInMemory(validatedEntry);
    
    // Broadcast addition
    this.messageBus.publish({
      type: MessageTypes.DISCOVERY_SHARED,
      data: validatedEntry,
      priority: 'normal'
    });
    
    return validatedEntry;
  }
  
  /**
   * Validate knowledge entry
   */
  validateEntry(entry) {
    const validated = {
      id: entry.id || crypto.randomBytes(8).toString('hex'),
      type: entry.type || KnowledgeTypes.DISCOVERY,
      title: entry.title || 'Untitled',
      content: entry.content || '',
      swarmId: entry.swarmId,
      confidence: entry.confidence || ConfidenceLevels.MEDIUM,
      timestamp: entry.timestamp || Date.now(),
      tags: entry.tags || [],
      metadata: entry.metadata || {},
      references: entry.references || [],
      version: entry.version || 1
    };
    
    // Extract keywords for indexing
    validated.keywords = this.extractKeywords(validated);
    
    return validated;
  }
  
  /**
   * Extract keywords from entry
   */
  extractKeywords(entry) {
    const text = `${entry.title} ${entry.content} ${entry.tags.join(' ')}`.toLowerCase();
    
    // Simple keyword extraction (can be enhanced with NLP)
    const words = text.split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
    
    // Get unique words with frequency
    const wordFreq = new Map();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });
    
    // Sort by frequency and take top keywords
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }
  
  /**
   * Check if word is a stop word
   */
  isStopWord(word) {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'about', 'as', 'is', 'was',
      'are', 'were', 'been', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'should', 'could', 'may', 'might',
      'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an'
    ]);
    
    return stopWords.has(word);
  }
  
  /**
   * Index knowledge for fast search
   */
  indexKnowledge(entry) {
    // Index by type
    if (!this.knowledgeByType.has(entry.type)) {
      this.knowledgeByType.set(entry.type, new Set());
    }
    this.knowledgeByType.get(entry.type).add(entry.id);
    
    // Index by swarm
    if (entry.swarmId) {
      if (!this.knowledgeBySwarm.has(entry.swarmId)) {
        this.knowledgeBySwarm.set(entry.swarmId, new Set());
      }
      this.knowledgeBySwarm.get(entry.swarmId).add(entry.id);
    }
    
    // Index keywords
    entry.keywords.forEach(keyword => {
      if (!this.knowledgeIndex.has(keyword)) {
        this.knowledgeIndex.set(keyword, new Set());
      }
      this.knowledgeIndex.get(keyword).add(entry.id);
    });
  }
  
  /**
   * Check for conflicts with existing knowledge
   */
  async checkConflicts(entry) {
    const conflicts = [];
    
    // Find similar entries
    const similar = await this.findSimilar(entry, { threshold: 0.8 });
    
    for (const similarEntry of similar) {
      // Check for direct contradictions
      if (this.isContradiction(entry, similarEntry)) {
        conflicts.push({
          type: 'contradiction',
          entryId: similarEntry.id,
          reason: 'Contradictory information',
          similarity: similarEntry.similarity
        });
      }
      
      // Check for overlapping solutions
      if (entry.type === KnowledgeTypes.SOLUTION && 
          similarEntry.type === KnowledgeTypes.SOLUTION &&
          this.isSameProblem(entry, similarEntry)) {
        conflicts.push({
          type: 'duplicate_solution',
          entryId: similarEntry.id,
          reason: 'Multiple solutions for same problem',
          similarity: similarEntry.similarity
        });
      }
    }
    
    return conflicts;
  }
  
  /**
   * Check if entries contradict each other
   */
  isContradiction(entry1, entry2) {
    // Simple contradiction detection (can be enhanced)
    const negativeWords = ['not', 'never', 'no', 'cannot', 'wont', 'dont', 'doesnt'];
    
    const hasNegative1 = entry1.content.toLowerCase().split(/\s+/)
      .some(word => negativeWords.includes(word));
    const hasNegative2 = entry2.content.toLowerCase().split(/\s+/)
      .some(word => negativeWords.includes(word));
    
    // If one has negative and other doesn't, might be contradiction
    return hasNegative1 !== hasNegative2 && entry1.keywords.some(k => entry2.keywords.includes(k));
  }
  
  /**
   * Check if entries address the same problem
   */
  isSameProblem(entry1, entry2) {
    // Check keyword overlap
    const overlap = entry1.keywords.filter(k => entry2.keywords.includes(k));
    return overlap.length > Math.min(entry1.keywords.length, entry2.keywords.length) * 0.5;
  }
  
  /**
   * Resolve conflicts between entries
   */
  async resolveConflicts(newEntry, conflicts) {
    // Try automatic resolution strategies
    for (const conflict of conflicts) {
      const existingEntry = this.knowledge.get(conflict.entryId);
      
      if (conflict.type === 'duplicate_solution') {
        // Merge solutions if confidence allows
        if (newEntry.confidence === ConfidenceLevels.VERIFIED && 
            existingEntry.confidence !== ConfidenceLevels.VERIFIED) {
          // New entry is verified, replace old
          existingEntry.supersededBy = newEntry.id;
          await this.persistKnowledge(existingEntry);
          return true;
        } else if (newEntry.confidence === existingEntry.confidence) {
          // Same confidence, create composite solution
          const composite = {
            ...newEntry,
            id: crypto.randomBytes(8).toString('hex'),
            type: KnowledgeTypes.SOLUTION,
            title: `Composite: ${newEntry.title}`,
            content: `Solution 1:\n${existingEntry.content}\n\nSolution 2:\n${newEntry.content}`,
            references: [existingEntry.id, newEntry.id],
            confidence: ConfidenceLevels.HIGH
          };
          
          await this.addKnowledge(composite);
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Search knowledge base
   */
  async search(query, options = {}) {
    const limit = options.limit || 10;
    const type = options.type;
    const minConfidence = options.minConfidence;
    const swarmId = options.swarmId;
    
    // Tokenize query
    const queryKeywords = this.extractKeywords({ title: query, content: '', tags: [] });
    
    // Find matching entries
    const scores = new Map();
    
    for (const keyword of queryKeywords) {
      const entries = this.knowledgeIndex.get(keyword);
      if (entries) {
        entries.forEach(entryId => {
          scores.set(entryId, (scores.get(entryId) || 0) + 1);
        });
      }
    }
    
    // Get entries and apply filters
    let results = Array.from(scores.entries())
      .map(([entryId, score]) => ({
        entry: this.knowledge.get(entryId),
        score
      }))
      .filter(result => result.entry)
      .filter(result => !type || result.entry.type === type)
      .filter(result => !minConfidence || this.getConfidenceLevel(result.entry.confidence) >= this.getConfidenceLevel(minConfidence))
      .filter(result => !swarmId || result.entry.swarmId === swarmId);
    
    // Sort by score and confidence
    results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return this.getConfidenceLevel(b.entry.confidence) - this.getConfidenceLevel(a.entry.confidence);
    });
    
    // Apply limit
    results = results.slice(0, limit);
    
    // Add similarity scores
    for (const result of results) {
      result.similarity = result.score / queryKeywords.length;
    }
    
    return results.map(r => ({
      ...r.entry,
      score: r.score,
      similarity: r.similarity
    }));
  }
  
  /**
   * Find similar knowledge entries
   */
  async findSimilar(entry, options = {}) {
    const threshold = options.threshold || 0.5;
    const limit = options.limit || 5;
    
    // Search using entry keywords
    const searchQuery = entry.keywords.join(' ');
    const results = await this.search(searchQuery, { limit: limit * 2 });
    
    // Filter by similarity threshold and exclude self
    return results
      .filter(result => result.id !== entry.id && result.similarity >= threshold)
      .slice(0, limit);
  }
  
  /**
   * Get confidence level as number
   */
  getConfidenceLevel(confidence) {
    const levels = {
      [ConfidenceLevels.VERIFIED]: 5,
      [ConfidenceLevels.HIGH]: 4,
      [ConfidenceLevels.MEDIUM]: 3,
      [ConfidenceLevels.LOW]: 2,
      [ConfidenceLevels.EXPERIMENTAL]: 1
    };
    
    return levels[confidence] || 3;
  }
  
  /**
   * Store knowledge in Memory system
   */
  async storeInMemory(entry) {
    try {
      // Import memory functions
      const { loadMemory, saveMemory } = await this.getMemoryFunctions();
      
      const memoryData = await loadMemory();
      
      if (!memoryData[this.memoryNamespace]) {
        memoryData[this.memoryNamespace] = [];
      }
      
      // Create memory entry
      const memoryEntry = {
        key: `knowledge_${entry.type}_${entry.id}`,
        value: JSON.stringify({
          title: entry.title,
          content: entry.content,
          type: entry.type,
          confidence: entry.confidence,
          swarmId: entry.swarmId
        }),
        namespace: this.memoryNamespace,
        timestamp: Date.now()
      };
      
      // Remove existing entry with same key
      memoryData[this.memoryNamespace] = memoryData[this.memoryNamespace]
        .filter(e => e.key !== memoryEntry.key);
      
      // Add new entry
      memoryData[this.memoryNamespace].push(memoryEntry);
      
      await saveMemory(memoryData);
    } catch (error) {
      console.error('Failed to store in memory:', error);
    }
  }
  
  /**
   * Get memory functions
   */
  async getMemoryFunctions() {
    // Helper functions compatible with the memory system
    const memoryStore = './memory/memory-store.json';
    
    async function loadMemory() {
      try {
        const content = await fs.readFile(memoryStore, 'utf-8');
        return JSON.parse(content);
      } catch {
        return {};
      }
    }
    
    async function saveMemory(data) {
      await fs.mkdir('./memory', { recursive: true });
      await fs.writeFile(memoryStore, JSON.stringify(data, null, 2));
    }
    
    return { loadMemory, saveMemory };
  }
  
  /**
   * Persist knowledge to disk
   */
  async persistKnowledge(entry) {
    try {
      const filename = `${entry.type}_${entry.id}.json`;
      const filepath = path.join(this.storagePath, filename);
      
      await fs.writeFile(filepath, JSON.stringify(entry, null, 2));
    } catch (error) {
      console.error('Failed to persist knowledge:', error);
    }
  }
  
  /**
   * Handle discovery message
   */
  async handleDiscovery(message) {
    const discovery = {
      type: KnowledgeTypes.DISCOVERY,
      title: message.data.title || 'New Discovery',
      content: message.data.content || message.data.description || '',
      swarmId: message.swarmId,
      confidence: message.data.confidence || ConfidenceLevels.MEDIUM,
      tags: message.data.tags || [],
      metadata: message.data.metadata || {}
    };
    
    await this.addKnowledge(discovery);
  }
  
  /**
   * Handle solution message
   */
  async handleSolution(message) {
    const solution = {
      type: KnowledgeTypes.SOLUTION,
      title: message.data.problem || 'Solution Found',
      content: message.data.solution || '',
      swarmId: message.swarmId,
      confidence: message.data.tested ? ConfidenceLevels.VERIFIED : ConfidenceLevels.HIGH,
      tags: message.data.tags || [],
      metadata: {
        problem: message.data.problem,
        context: message.data.context,
        performance: message.data.performance
      }
    };
    
    await this.addKnowledge(solution);
  }
  
  /**
   * Handle error message
   */
  async handleError(message) {
    const error = {
      type: KnowledgeTypes.ERROR,
      title: message.data.error || 'Error Encountered',
      content: message.data.description || message.data.stack || '',
      swarmId: message.swarmId,
      confidence: ConfidenceLevels.HIGH,
      tags: ['error', ...(message.data.tags || [])],
      metadata: {
        errorType: message.data.type,
        context: message.data.context,
        frequency: 1
      }
    };
    
    // Check if we've seen this error before
    const similar = await this.findSimilar(error, { threshold: 0.9 });
    if (similar.length > 0) {
      // Update frequency
      const existing = similar[0];
      existing.metadata.frequency = (existing.metadata.frequency || 1) + 1;
      await this.persistKnowledge(existing);
    } else {
      await this.addKnowledge(error);
    }
  }
  
  /**
   * Get knowledge statistics
   */
  getStatistics() {
    const stats = {
      totalEntries: this.knowledge.size,
      byType: {},
      byConfidence: {},
      bySwarm: {},
      conflicts: this.conflicts.size,
      topKeywords: []
    };
    
    // Count by type
    for (const [type, entries] of this.knowledgeByType.entries()) {
      stats.byType[type] = entries.size;
    }
    
    // Count by confidence
    for (const entry of this.knowledge.values()) {
      stats.byConfidence[entry.confidence] = (stats.byConfidence[entry.confidence] || 0) + 1;
    }
    
    // Count by swarm
    for (const [swarmId, entries] of this.knowledgeBySwarm.entries()) {
      stats.bySwarm[swarmId] = entries.size;
    }
    
    // Top keywords
    const keywordCounts = new Map();
    for (const [keyword, entries] of this.knowledgeIndex.entries()) {
      keywordCounts.set(keyword, entries.size);
    }
    
    stats.topKeywords = Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));
    
    return stats;
  }
  
  /**
   * Export knowledge to file
   */
  async exportKnowledge(filepath, options = {}) {
    const entries = [];
    
    for (const entry of this.knowledge.values()) {
      if (!options.type || entry.type === options.type) {
        if (!options.swarmId || entry.swarmId === options.swarmId) {
          entries.push(entry);
        }
      }
    }
    
    const exportData = {
      version: '1.0',
      exported: new Date().toISOString(),
      entries,
      statistics: this.getStatistics()
    };
    
    await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));
    
    return {
      entries: entries.length,
      size: (await fs.stat(filepath)).size
    };
  }
}

// Singleton instance
let globalKnowledgeBase = null;

/**
 * Get or create the global knowledge base
 */
export function getGlobalKnowledgeBase(options = {}) {
  if (!globalKnowledgeBase) {
    globalKnowledgeBase = new SharedKnowledgeBase(options);
  }
  return globalKnowledgeBase;
}

/**
 * Create a new knowledge base instance
 */
export function createKnowledgeBase(options = {}) {
  return new SharedKnowledgeBase(options);
}

export default SharedKnowledgeBase;