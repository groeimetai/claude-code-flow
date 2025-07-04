import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { join, relative } from 'path';
import ignore from 'ignore';
import { readFileSync, existsSync } from 'fs';

export class EntityScout {
  constructor(logger) {
    this.logger = logger;
  }
  
  async discoverFiles(projectPath, options = {}) {
    const {
      includePatterns = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.py', '**/*.java'],
      excludePatterns = ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
      respectGitignore = true,
    } = options;
    
    // Load .gitignore if it exists
    let ig = null;
    if (respectGitignore) {
      const gitignorePath = join(projectPath, '.gitignore');
      if (existsSync(gitignorePath)) {
        ig = ignore();
        const gitignoreContent = readFileSync(gitignorePath, 'utf8');
        ig.add(gitignoreContent);
      }
    }
    
    const files = [];
    
    // Process each include pattern
    for (const pattern of includePatterns) {
      const matches = await glob(pattern, {
        cwd: projectPath,
        ignore: excludePatterns,
        nodir: true,
      });
      
      for (const match of matches) {
        // Check gitignore
        if (ig && ig.ignores(match)) {
          continue;
        }
        
        const fullPath = join(projectPath, match);
        
        try {
          const content = await readFile(fullPath, 'utf8');
          
          files.push({
            path: fullPath,
            relativePath: match,
            content,
            size: content.length,
            lines: content.split('\n').length,
          });
        } catch (error) {
          this.logger.warn(`Failed to read file ${fullPath}:`, error.message);
        }
      }
    }
    
    this.logger.info(`Discovered ${files.length} files in ${projectPath}`);
    return files;
  }
}