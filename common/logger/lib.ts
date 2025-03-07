/**
 * Simple logger that wraps console.log
 * Adds process ID and timestamp to all logs
 */
export class Logger {
  private context: string;

  constructor(context: string = 'app') {
    this.context = context;
  }

  /**
   * Log an informational message
   */
  info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: any): void {
    this.log('ERROR', message, error);
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: any): void {
    this.log('WARN', message, data);
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: any): void {
    this.log('DEBUG', message, data);
  }

  private log(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const pid = process.pid;
    
    const logMessage = {
      timestamp,
      pid,
      level,
      context: this.context,
      message,
      ...(data ? { data } : {})
    };
    
    console.log(JSON.stringify(logMessage));
  }
}

// Default logger instance
export const logger = new Logger();
