import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  stack?: string;
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
}

class Logger {
  private logLevel: LogLevel;
  private logDir: string;

  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    this.logDir = join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private async ensureLogDirectory() {
    if (!existsSync(this.logDir)) {
      try {
        await mkdir(this.logDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create log directory:', error);
      }
    }
  }

  private async writeLogToFile(entry: LogEntry) {
    if (process.env.NODE_ENV === 'development') {
      // En développement, on log seulement dans la console
      return;
    }

    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = `${date}.log`;
      const filepath = join(this.logDir, filename);
      
      const logLine = JSON.stringify(entry) + '\n';
      await writeFile(filepath, logLine, { flag: 'a' });
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: any,
    stack?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      stack,
    };
  }

  private formatConsoleOutput(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelName}]`;
    
    let output = `${prefix} ${entry.message}`;
    
    if (entry.context) {
      output += `\nContext: ${JSON.stringify(entry.context, null, 2)}`;
    }
    
    if (entry.stack) {
      output += `\nStack: ${entry.stack}`;
    }
    
    return output;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  debug(message: string, context?: any) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    console.debug(this.formatConsoleOutput(entry));
    this.writeLogToFile(entry);
  }

  info(message: string, context?: any) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    console.info(this.formatConsoleOutput(entry));
    this.writeLogToFile(entry);
  }

  warn(message: string, context?: any) {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    console.warn(this.formatConsoleOutput(entry));
    this.writeLogToFile(entry);
  }

  error(message: string, error?: Error, context?: any) {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(
      LogLevel.ERROR,
      message,
      context,
      error?.stack
    );
    console.error(this.formatConsoleOutput(entry));
    this.writeLogToFile(entry);
  }

  critical(message: string, error?: Error, context?: any) {
    const entry = this.createLogEntry(
      LogLevel.CRITICAL,
      message,
      context,
      error?.stack
    );
    console.error(this.formatConsoleOutput(entry));
    this.writeLogToFile(entry);
    
    // En production, on pourrait envoyer une alerte immédiate
    if (process.env.NODE_ENV === 'production') {
      this.sendCriticalAlert(entry);
    }
  }

  // Méthode spécialisée pour les erreurs API
  apiError(
    message: string,
    error: Error,
    request?: {
      method?: string;
      url?: string;
      ip?: string;
      userAgent?: string;
      userId?: string;
      body?: any;
    }
  ) {
    const context = {
      ...request,
      errorMessage: error.message,
      errorName: error.name,
    };
    
    this.error(message, error, context);
  }

  // Méthode spécialisée pour les erreurs de base de données
  dbError(message: string, error: Error, query?: string, params?: any) {
    const context = {
      query,
      params,
      errorCode: (error as any).code,
      errorMeta: (error as any).meta,
    };
    
    this.error(message, error, context);
  }

  // Méthode spécialisée pour les erreurs de paiement
  paymentError(
    message: string,
    error: Error,
    paymentData?: {
      amount?: number;
      currency?: string;
      paymentIntentId?: string;
      customerId?: string;
    }
  ) {
    const context = {
      ...paymentData,
      errorType: error.name,
    };
    
    this.error(message, error, context);
  }

  private async sendCriticalAlert(entry: LogEntry) {
    // Ici on pourrait intégrer avec des services comme:
    // - Slack
    // - Discord
    // - Email
    // - Sentry
    // - PagerDuty
    
    try {
      // Exemple d'envoi d'alerte par email (à implémenter)
      // await sendAlertEmail({
      //   subject: 'CRITICAL ERROR - EasyBaby',
      //   message: entry.message,
      //   context: entry.context,
      //   timestamp: entry.timestamp,
      // });
      
      console.error('CRITICAL ALERT WOULD BE SENT:', entry);
    } catch (alertError) {
      console.error('Failed to send critical alert:', alertError);
    }
  }
}

// Instance singleton
export const logger = new Logger();

// Middleware pour capturer les erreurs non gérées
export function setupGlobalErrorHandling() {
  process.on('uncaughtException', (error) => {
    logger.critical('Uncaught Exception', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.critical('Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)), {
      promise: promise.toString(),
    });
  });
}

// Utilitaires pour les métriques
export class MetricsLogger {
  static logApiRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string
  ) {
    logger.info('API Request', {
      method,
      url,
      statusCode,
      duration,
      userId,
      type: 'api_request',
    });
  }

  static logDatabaseQuery(
    operation: string,
    table: string,
    duration: number,
    recordCount?: number
  ) {
    logger.debug('Database Query', {
      operation,
      table,
      duration,
      recordCount,
      type: 'db_query',
    });
  }

  static logUserAction(
    action: string,
    userId: string,
    details?: any
  ) {
    logger.info('User Action', {
      action,
      userId,
      details,
      type: 'user_action',
    });
  }

  static logBusinessEvent(
    event: string,
    data: any
  ) {
    logger.info('Business Event', {
      event,
      data,
      type: 'business_event',
    });
  }
}

// Types pour TypeScript
export type LoggerFunction = (message: string, context?: any) => void;
export type ErrorLoggerFunction = (message: string, error?: Error, context?: any) => void;
