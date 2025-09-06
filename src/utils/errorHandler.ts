// src/utils/errorHandler.ts
import { Alert } from "react-native";
import { AppError, ValidationError, NetworkError, AuthError } from "../types";
import { logError } from "./logger";

export interface ErrorHandlerOptions {
  showAlert?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(
    error: unknown,
    options: ErrorHandlerOptions = {}
  ): string {
    const {
      showAlert = true,
      logError: shouldLog = true,
      fallbackMessage = "An unexpected error occurred",
    } = options;

    let errorMessage = fallbackMessage;
    let errorCode = "UNKNOWN_ERROR";

    // Determine error type and extract message
    if (error instanceof AppError) {
      errorMessage = error.message;
      errorCode = error.code;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      errorCode = "GENERIC_ERROR";
    } else if (typeof error === "string") {
      errorMessage = error;
      errorCode = "STRING_ERROR";
    } else if (error && typeof error === "object") {
      // Handle Supabase errors
      if ("message" in error && typeof error.message === "string") {
        errorMessage = error.message;
        errorCode =
          "message" in error && typeof error.code === "string"
            ? error.code
            : "SUPABASE_ERROR";
      }
    }

    // Log error if requested
    if (shouldLog) {
      logError(`Error handled: ${errorMessage}`, "ErrorHandler", {
        errorCode,
        originalError: error,
      });
    }

    // Show alert if requested
    if (showAlert) {
      this.showErrorAlert(errorMessage, errorCode);
    }

    return errorMessage;
  }

  public handleValidationError(
    error: ValidationError,
    options: ErrorHandlerOptions = {}
  ): string {
    const message = error.field
      ? `${error.field}: ${error.message}`
      : error.message;

    return this.handleError(error, {
      ...options,
      fallbackMessage: "Please check your input and try again",
    });
  }

  public handleNetworkError(
    error: NetworkError,
    options: ErrorHandlerOptions = {}
  ): string {
    return this.handleError(error, {
      ...options,
      fallbackMessage:
        "Network connection failed. Please check your internet connection.",
    });
  }

  public handleAuthError(
    error: AuthError,
    options: ErrorHandlerOptions = {}
  ): string {
    return this.handleError(error, {
      ...options,
      fallbackMessage: "Authentication failed. Please try again.",
    });
  }

  private showErrorAlert(message: string, code: string): void {
    Alert.alert(
      "Error",
      message,
      [
        {
          text: "OK",
          style: "default",
        },
      ],
      { cancelable: true }
    );
  }

  public createError(
    message: string,
    code: string = "CUSTOM_ERROR",
    statusCode?: number
  ): AppError {
    return new AppError(message, code, statusCode);
  }

  public createValidationError(
    message: string,
    field?: string
  ): ValidationError {
    return new ValidationError(message, field);
  }

  public createNetworkError(message: string): NetworkError {
    return new NetworkError(message);
  }

  public createAuthError(message: string): AuthError {
    return new AuthError(message);
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleError = (error: unknown, options?: ErrorHandlerOptions) =>
  errorHandler.handleError(error, options);

export const handleValidationError = (
  error: ValidationError,
  options?: ErrorHandlerOptions
) => errorHandler.handleValidationError(error, options);

export const handleNetworkError = (
  error: NetworkError,
  options?: ErrorHandlerOptions
) => errorHandler.handleNetworkError(error, options);

export const handleAuthError = (
  error: AuthError,
  options?: ErrorHandlerOptions
) => errorHandler.handleAuthError(error, options);

// Error boundary helper
export const isError = (value: unknown): value is Error => {
  return value instanceof Error;
};

export const isAppError = (value: unknown): value is AppError => {
  return value instanceof AppError;
};
