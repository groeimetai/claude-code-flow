/**
 * Centralized API Key Management System
 * Securely stores and manages API keys for different services and projects
 */

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { ILogger } from '../core/logger.js';

export interface ApiKeyConfig {
  service: string;
  key: string;
  description?: string;
  createdAt: Date;
  lastUsed?: Date;
  projects?: string[];
  environment?: string;
}

export interface ProjectApiKeys {
  projectId: string;
  projectPath: string;
  keys: {
    service: string;
    keyReference: string; // Reference to global key
    overrideKey?: string; // Project-specific override
  }[];
}

export class ApiKeyManager {
  private static instance: ApiKeyManager;
  private configDir: string;
  private keysFile: string;
  private projectsFile: string;
  private encryptionKey?: Buffer;
  private keys: Map<string, ApiKeyConfig> = new Map();
  private projects: Map<string, ProjectApiKeys> = new Map();
  private logger?: ILogger;

  private constructor() {
    this.configDir = path.join(os.homedir(), '.claude-flow');
    this.keysFile = path.join(this.configDir, 'api-keys.encrypted');
    this.projectsFile = path.join(this.configDir, 'project-keys.json');
  }

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  /**
   * Initialize the API key manager
   */
  async init(logger?: ILogger, masterPassword?: string): Promise<void> {
    this.logger = logger;
    
    // Ensure config directory exists
    await fs.mkdir(this.configDir, { recursive: true });

    // Derive encryption key from master password or environment
    this.encryptionKey = this.deriveEncryptionKey(masterPassword);

    // Load existing keys
    await this.loadKeys();
    await this.loadProjects();

    // Check environment variables for new keys
    await this.loadFromEnvironment();
  }

  /**
   * Add or update an API key
   */
  async setApiKey(service: string, key: string, options?: {
    description?: string;
    projects?: string[];
    environment?: string;
  }): Promise<void> {
    const keyConfig: ApiKeyConfig = {
      service,
      key,
      description: options?.description,
      createdAt: this.keys.get(service)?.createdAt || new Date(),
      lastUsed: undefined,
      projects: options?.projects,
      environment: options?.environment || 'production',
    };

    this.keys.set(service, keyConfig);
    await this.saveKeys();

    this.logger?.info('API key saved', { service, hasProjects: !!options?.projects });
  }

  /**
   * Get an API key for a service
   */
  async getApiKey(service: string, projectPath?: string): Promise<string | null> {
    // Check project-specific override first
    if (projectPath) {
      const project = Array.from(this.projects.values()).find(
        p => p.projectPath === projectPath
      );
      
      if (project) {
        const projectKey = project.keys.find(k => k.service === service);
        if (projectKey?.overrideKey) {
          this.updateLastUsed(service);
          return projectKey.overrideKey;
        }
      }
    }

    // Check environment variable override
    const envKey = this.getEnvironmentKey(service);
    if (envKey) {
      return envKey;
    }

    // Get global key
    const keyConfig = this.keys.get(service);
    if (!keyConfig) {
      return null;
    }

    // Check if key is restricted to specific projects
    if (keyConfig.projects && keyConfig.projects.length > 0 && projectPath) {
      const projectAllowed = keyConfig.projects.some(p => 
        projectPath.includes(p) || p === path.basename(projectPath)
      );
      
      if (!projectAllowed) {
        this.logger?.warn('API key access denied for project', { service, projectPath });
        return null;
      }
    }

    this.updateLastUsed(service);
    return keyConfig.key;
  }

  /**
   * List all configured API keys (without exposing the actual keys)
   */
  listApiKeys(): { service: string; description?: string; lastUsed?: Date; projects?: string[] }[] {
    return Array.from(this.keys.entries()).map(([service, config]) => ({
      service,
      description: config.description,
      lastUsed: config.lastUsed,
      projects: config.projects,
    }));
  }

  /**
   * Remove an API key
   */
  async removeApiKey(service: string): Promise<boolean> {
    const removed = this.keys.delete(service);
    if (removed) {
      await this.saveKeys();
      this.logger?.info('API key removed', { service });
    }
    return removed;
  }

  /**
   * Set project-specific API key configuration
   */
  async setProjectKeys(projectPath: string, keys: { service: string; key?: string }[]): Promise<void> {
    const projectId = path.basename(projectPath);
    
    const projectConfig: ProjectApiKeys = {
      projectId,
      projectPath,
      keys: keys.map(k => ({
        service: k.service,
        keyReference: k.service,
        overrideKey: k.key,
      })),
    };

    this.projects.set(projectId, projectConfig);
    await this.saveProjects();

    this.logger?.info('Project API keys configured', { projectId, services: keys.map(k => k.service) });
  }

  /**
   * Get all API keys for a project
   */
  async getProjectKeys(projectPath: string): Promise<Record<string, string>> {
    const keys: Record<string, string> = {};
    
    // Get all available services
    const allServices = new Set<string>();
    this.keys.forEach((_, service) => allServices.add(service));
    
    // Get keys for each service
    for (const service of allServices) {
      const key = await this.getApiKey(service, projectPath);
      if (key) {
        keys[service] = key;
      }
    }

    return keys;
  }

  /**
   * Import API keys from a file
   */
  async importKeys(filePath: string, masterPassword?: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      for (const [service, key] of Object.entries(data)) {
        if (typeof key === 'string') {
          await this.setApiKey(service, key);
        } else if (typeof key === 'object' && key !== null) {
          const keyObj = key as any;
          await this.setApiKey(service, keyObj.key || keyObj.value, {
            description: keyObj.description,
            projects: keyObj.projects,
            environment: keyObj.environment,
          });
        }
      }

      this.logger?.info('API keys imported', { count: Object.keys(data).length });
    } catch (error) {
      throw new Error(`Failed to import API keys: ${error}`);
    }
  }

  /**
   * Export API keys (with option to mask values)
   */
  async exportKeys(filePath: string, mask = true): Promise<void> {
    const exportData: Record<string, any> = {};
    
    for (const [service, config] of this.keys.entries()) {
      exportData[service] = {
        key: mask ? '***MASKED***' : config.key,
        description: config.description,
        projects: config.projects,
        environment: config.environment,
        lastUsed: config.lastUsed,
      };
    }

    await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
    this.logger?.info('API keys exported', { path: filePath, masked: mask });
  }

  /**
   * Check if a service has an API key configured
   */
  hasApiKey(service: string): boolean {
    return this.keys.has(service) || !!this.getEnvironmentKey(service);
  }

  /**
   * Get API key from environment with common patterns
   */
  private getEnvironmentKey(service: string): string | null {
    const patterns = [
      `${service.toUpperCase()}_API_KEY`,
      `${service.toUpperCase()}_KEY`,
      `${service.toUpperCase()}_TOKEN`,
      `CLAUDE_FLOW_${service.toUpperCase()}_KEY`,
    ];

    for (const pattern of patterns) {
      const value = process.env[pattern];
      if (value) {
        return value;
      }
    }

    return null;
  }

  /**
   * Load API keys from environment variables
   */
  private async loadFromEnvironment(): Promise<void> {
    const services = [
      'OPENAI',
      'ANTHROPIC',
      'GOOGLE',
      'AZURE',
      'HUGGINGFACE',
      'REPLICATE',
      'COHERE',
      'GITHUB',
      'GITLAB',
    ];

    for (const service of services) {
      const key = this.getEnvironmentKey(service.toLowerCase());
      if (key && !this.keys.has(service.toLowerCase())) {
        await this.setApiKey(service.toLowerCase(), key, {
          description: `Loaded from environment variable`,
          environment: process.env.NODE_ENV || 'development',
        });
      }
    }
  }

  /**
   * Derive encryption key from master password
   */
  private deriveEncryptionKey(masterPassword?: string): Buffer {
    const password = masterPassword || 
      process.env.CLAUDE_FLOW_MASTER_PASSWORD || 
      'claude-flow-default-key';
    
    const salt = Buffer.from('claude-flow-api-keys-salt', 'utf-8');
    return scryptSync(password, salt, 32);
  }

  /**
   * Encrypt data
   */
  private encrypt(text: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt data
   */
  private decrypt(encryptedText: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Load keys from encrypted file
   */
  private async loadKeys(): Promise<void> {
    try {
      const encrypted = await fs.readFile(this.keysFile, 'utf-8');
      const decrypted = this.decrypt(encrypted);
      const data = JSON.parse(decrypted);
      
      this.keys.clear();
      for (const [service, config] of Object.entries(data)) {
        this.keys.set(service, {
          ...config as ApiKeyConfig,
          createdAt: new Date((config as any).createdAt),
          lastUsed: (config as any).lastUsed ? new Date((config as any).lastUsed) : undefined,
        });
      }
    } catch (error) {
      // File doesn't exist or is corrupted, start fresh
      this.logger?.debug('No existing API keys found, starting fresh');
    }
  }

  /**
   * Save keys to encrypted file
   */
  private async saveKeys(): Promise<void> {
    const data: Record<string, any> = {};
    
    for (const [service, config] of this.keys.entries()) {
      data[service] = {
        ...config,
        createdAt: config.createdAt.toISOString(),
        lastUsed: config.lastUsed?.toISOString(),
      };
    }

    const json = JSON.stringify(data);
    const encrypted = this.encrypt(json);
    
    await fs.writeFile(this.keysFile, encrypted, 'utf-8');
  }

  /**
   * Load project configurations
   */
  private async loadProjects(): Promise<void> {
    try {
      const content = await fs.readFile(this.projectsFile, 'utf-8');
      const data = JSON.parse(content);
      
      this.projects.clear();
      for (const [projectId, config] of Object.entries(data)) {
        this.projects.set(projectId, config as ProjectApiKeys);
      }
    } catch (error) {
      // File doesn't exist, start fresh
      this.logger?.debug('No existing project configurations found');
    }
  }

  /**
   * Save project configurations
   */
  private async saveProjects(): Promise<void> {
    const data: Record<string, ProjectApiKeys> = {};
    
    for (const [projectId, config] of this.projects.entries()) {
      data[projectId] = config;
    }

    await fs.writeFile(this.projectsFile, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Update last used timestamp
   */
  private updateLastUsed(service: string): void {
    const config = this.keys.get(service);
    if (config) {
      config.lastUsed = new Date();
      // Save asynchronously without blocking
      this.saveKeys().catch(error => {
        this.logger?.error('Failed to update last used timestamp', error);
      });
    }
  }
}

// Export singleton instance
export const apiKeyManager = ApiKeyManager.getInstance();