// src/utils/logger.ts
import { Platform } from "react-native";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.DEBUG;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {
    // Set log level based on environment
    if (__DEV__) {
      this.logLevel = LogLevel.DEBUG;
    } else {
      this.logLevel = LogLevel.WARN;
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const context = entry.context ? `[${entry.context}]` : "";
    const data = entry.data ? ` ${JSON.stringify(entry.data)}` : "";

    return `${timestamp} ${levelName} ${context} ${entry.message}${data}`;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data,
    };

    // Add to internal logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.log(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }

    // In development, also log to React Native debugger
    if (__DEV__ && Platform.OS === "ios") {
      console.log(formattedMessage);
    }
  }

  public debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  public info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  public warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  public error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public exportLogs(): string {
    return this.logs.map((entry) => this.formatMessage(entry)).join("\n");
  }
}

export const logger = Logger.getInstance();

// Convenience functions
export const logDebug = (message: string, context?: string, data?: any) =>
  logger.debug(message, context, data);

export const logInfo = (message: string, context?: string, data?: any) =>
  logger.info(message, context, data);

export const logWarn = (message: string, context?: string, data?: any) =>
  logger.warn(message, context, data);

export const logError = (message: string, context?: string, data?: any) =>
  logger.error(message, context, data);
