/**
 * Structured Application Logger
 * Provides consistent logging across the TixApp application
 */

export class AppLogger {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  private static formatMessage(level: string, context: string, message: string): string {
    return `[${level}][${this.getTimestamp()}][${context}] ${message}`;
  }

  private static safeStringify(data: any): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return `[Stringify Error: ${error}] ${String(data)}`;
    }
  }

  static debug(context: string, message: string, data?: any): void {
    const logMsg = this.formatMessage('DEBUG', context, message);
    if (data) {
      console.log(logMsg);
      console.log('Data:', this.safeStringify(data));
    } else {
      console.log(logMsg);
    }
  }

  static info(context: string, message: string, data?: any): void {
    const logMsg = this.formatMessage('INFO', context, message);
    if (data) {
      console.log(logMsg);
      console.log('Data:', this.safeStringify(data));
    } else {
      console.log(logMsg);
    }
  }

  static warn(context: string, message: string, data?: any): void {
    const logMsg = this.formatMessage('WARN', context, message);
    if (data) {
      console.warn(logMsg);
      console.warn('Data:', this.safeStringify(data));
    } else {
      console.warn(logMsg);
    }
  }

  static error(context: string, message: string, error?: any): void {
    const logMsg = this.formatMessage('ERROR', context, message);
    console.error(logMsg);
    if (error) {
      console.error('Error details:', this.safeStringify({
        message: error.message,
        stack: error.stack,
        name: error.name,
        toString: error.toString()
      }));
    }
  }

  static api(context: string, endpoint: string, request: any, response?: any): void {
    const logMsg = this.formatMessage('API', context, `${endpoint}`);
    console.log(logMsg);
    console.log('REQUEST:', this.safeStringify(request));
    if (response) {
      console.log('RESPONSE:', this.safeStringify(response));
    }
  }

  static modal(context: string, action: string, data?: any): void {
    const logMsg = this.formatMessage('MODAL', context, action);
    if (data) {
      console.log(logMsg);
      console.log('Modal Data:', this.safeStringify(data));
    } else {
      console.log(logMsg);
    }
  }

  static state(context: string, action: string, before?: any, after?: any): void {
    const logMsg = this.formatMessage('STATE', context, action);
    console.log(logMsg);
    if (before !== undefined) {
      console.log('Before:', this.safeStringify(before));
    }
    if (after !== undefined) {
      console.log('After:', this.safeStringify(after));
    }
  }
}