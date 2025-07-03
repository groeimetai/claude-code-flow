/**
 * Simple Logger implementation
 */
export class Logger {
  constructor(config = {}) {
    this.level = config.level || 'info';
    this.format = config.format || 'pretty';
  }

  info(message, data) {
    console.log(`[INFO] ${message}`, data || '');
  }

  warn(message, data) {
    console.warn(`[WARN] ${message}`, data || '');
  }

  error(message, data) {
    console.error(`[ERROR] ${message}`, data || '');
  }

  debug(message, data) {
    if (this.level === 'debug') {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }
}