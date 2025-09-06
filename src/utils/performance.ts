// src/utils/performance.ts
import { logWarn, logError } from "./logger";

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private timers: Map<string, number> = new Map();
  private metrics: Map<string, number[]> = new Map();

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public startTimer(label: string): void {
    if (this.timers.has(label)) {
      logWarn(`Timer ${label} already exists`, "PerformanceMonitor");
    }
    this.timers.set(label, Date.now());
  }

  public endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      logError(`Timer ${label} not found`, "PerformanceMonitor");
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);

    // Store metric
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);

    // Log slow operations
    if (duration > 1000) {
      logWarn(
        `Slow operation detected: ${label} took ${duration}ms`,
        "PerformanceMonitor"
      );
    }

    return duration;
  }

  public getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  public getMetrics(): Record<
    string,
    { average: number; count: number; last: number }
  > {
    const result: Record<
      string,
      { average: number; count: number; last: number }
    > = {};

    for (const [label, times] of this.metrics.entries()) {
      result[label] = {
        average: this.getAverageTime(label),
        count: times.length,
        last: times[times.length - 1] || 0,
      };
    }

    return result;
  }

  public clearMetrics(): void {
    this.metrics.clear();
    this.timers.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Decorator for measuring function performance
export function measurePerformance(label?: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    const timerLabel = label || `${target.constructor.name}.${propertyName}`;

    descriptor.value = function (...args: any[]) {
      performanceMonitor.startTimer(timerLabel);
      try {
        const result = method.apply(this, args);

        // Handle async functions
        if (result && typeof result.then === "function") {
          return result.finally(() => {
            performanceMonitor.endTimer(timerLabel);
          });
        }

        performanceMonitor.endTimer(timerLabel);
        return result;
      } catch (error) {
        performanceMonitor.endTimer(timerLabel);
        throw error;
      }
    };
  };
}

// Utility functions
export const measureAsync = async <T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> => {
  performanceMonitor.startTimer(label);
  try {
    const result = await fn();
    performanceMonitor.endTimer(label);
    return result;
  } catch (error) {
    performanceMonitor.endTimer(label);
    throw error;
  }
};

export const measureSync = <T>(label: string, fn: () => T): T => {
  performanceMonitor.startTimer(label);
  try {
    const result = fn();
    performanceMonitor.endTimer(label);
    return result;
  } catch (error) {
    performanceMonitor.endTimer(label);
    throw error;
  }
};

// Memory management utilities
export class MemoryManager {
  private static instance: MemoryManager;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> =
    new Map();
  private maxCacheSize = 100;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  public set(key: string, data: any, ttl?: number): void {
    // Remove expired entries
    this.cleanup();

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  public get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    this.cleanup();
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  public getStats(): { size: number; maxSize: number; hitRate: number } {
    this.cleanup();
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: 0, // Would need to track hits/misses for accurate hit rate
    };
  }
}

export const memoryManager = MemoryManager.getInstance();

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
