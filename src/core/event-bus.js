/**
 * Simple EventBus implementation
 */
export class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, handler) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(handler => handler(data));
    }
  }

  off(event, handler) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(h => h !== handler);
    }
  }
}