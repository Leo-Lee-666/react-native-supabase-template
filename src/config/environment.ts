// src/config/environment.ts
import { EnvironmentConfig } from "../types";
import { logError } from "../utils/logger";

class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: EnvironmentConfig | null = null;

  private constructor() {}

  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  public initialize(): EnvironmentConfig {
    if (this.config) {
      return this.config;
    }

    try {
      this.config = this.loadConfig();
      this.validateConfig(this.config);
      return this.config;
    } catch (error) {
      logError(
        "Failed to initialize environment configuration",
        "EnvironmentManager",
        error
      );
      throw error;
    }
  }

  public getConfig(): EnvironmentConfig {
    if (!this.config) {
      throw new Error("Environment not initialized. Call initialize() first.");
    }
    return this.config;
  }

  private loadConfig(): EnvironmentConfig {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const appName = process.env.EXPO_PUBLIC_APP_NAME || "React Native App";
    const appVersion = process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0";
    const environment =
      (process.env.EXPO_PUBLIC_ENVIRONMENT as
        | "development"
        | "staging"
        | "production") || "development";
    const debugMode = process.env.EXPO_PUBLIC_DEBUG_MODE === "true";
    const logLevel =
      (process.env.EXPO_PUBLIC_LOG_LEVEL as
        | "debug"
        | "info"
        | "warn"
        | "error") || "debug";

    return {
      supabaseUrl: supabaseUrl || "",
      supabaseAnonKey: supabaseAnonKey || "",
      appName,
      appVersion,
      environment,
      debugMode,
      logLevel,
    };
  }

  private validateConfig(config: EnvironmentConfig): void {
    const errors: string[] = [];

    if (!config.supabaseUrl) {
      errors.push("EXPO_PUBLIC_SUPABASE_URL is required");
    } else if (!this.isValidUrl(config.supabaseUrl)) {
      errors.push("EXPO_PUBLIC_SUPABASE_URL must be a valid URL");
    }

    if (!config.supabaseAnonKey) {
      errors.push("EXPO_PUBLIC_SUPABASE_ANON_KEY is required");
    } else if (config.supabaseAnonKey.length < 20) {
      errors.push("EXPO_PUBLIC_SUPABASE_ANON_KEY appears to be invalid");
    }

    if (errors.length > 0) {
      throw new Error(`Environment validation failed:\n${errors.join("\n")}`);
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  public isDevelopment(): boolean {
    return this.getConfig().environment === "development";
  }

  public isProduction(): boolean {
    return this.getConfig().environment === "production";
  }

  public isStaging(): boolean {
    return this.getConfig().environment === "staging";
  }

  public getSupabaseConfig(): { url: string; anonKey: string } {
    const config = this.getConfig();
    return {
      url: config.supabaseUrl,
      anonKey: config.supabaseAnonKey,
    };
  }
}

export const environmentManager = EnvironmentManager.getInstance();

// Security utilities
export class SecurityManager {
  private static instance: SecurityManager;

  private constructor() {}

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  public sanitizeInput(input: string): string {
    if (typeof input !== "string") {
      return "";
    }

    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .substring(0, 1000); // Limit length
  }

  public sanitizeHtml(html: string): string {
    if (typeof html !== "string") {
      return "";
    }

    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframe tags
      .replace(/on\w+="[^"]*"/gi, "") // Remove event handlers
      .replace(/javascript:/gi, ""); // Remove javascript protocol
  }

  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (password.length > 128) {
      errors.push("Password must be less than 128 characters");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public generateSecureToken(length: number = 32): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  public hashString(input: string): string {
    // Simple hash function for non-cryptographic purposes
    let hash = 0;
    if (input.length === 0) return hash.toString();

    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16);
  }

  public isSecureContext(): boolean {
    // Check if running in a secure context (HTTPS, localhost, etc.)
    if (typeof window !== "undefined") {
      return window.isSecureContext || false;
    }
    return true; // Assume secure for React Native
  }
}

export const securityManager = SecurityManager.getInstance();

// Rate limiting
export class RateLimiter {
  private static instance: RateLimiter;
  private requests: Map<string, number[]> = new Map();

  private constructor() {}

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public isAllowed(
    key: string,
    maxRequests: number = 10,
    windowMs: number = 60000 // 1 minute
  ): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < windowMs);

    if (validRequests.length >= maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);

    return true;
  }

  public reset(key: string): void {
    this.requests.delete(key);
  }

  public resetAll(): void {
    this.requests.clear();
  }
}

export const rateLimiter = RateLimiter.getInstance();
