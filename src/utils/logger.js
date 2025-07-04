export class Logger {
  constructor(name) {
    this.name = name;
    this.logLevel = process.env.CLAUDE_FLOW_LOG_LEVEL || 'info';
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
  }
  
  log(level, ...args) {
    if (this.levels[level] <= this.levels[this.logLevel]) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${this.name}] [${level.toUpperCase()}]`;
      console.log(prefix, ...args);
    }
  }
  
  error(...args) {
    this.log('error', ...args);
  }
  
  warn(...args) {
    this.log('warn', ...args);
  }
  
  info(...args) {
    this.log('info', ...args);
  }
  
  debug(...args) {
    this.log('debug', ...args);
  }
}