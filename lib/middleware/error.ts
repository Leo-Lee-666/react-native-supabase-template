export interface ErrorState {
  hasError: boolean;
  errorMessage: string | null;
  errorCode?: string;
}

export class ErrorMiddleware {
  private static instance: ErrorMiddleware;
  private listeners: ((state: ErrorState) => void)[] = [];
  private state: ErrorState = {
    hasError: false,
    errorMessage: null,
    errorCode: undefined,
  };

  private constructor() {}

  public static getInstance(): ErrorMiddleware {
    if (!ErrorMiddleware.instance) {
      ErrorMiddleware.instance = new ErrorMiddleware();
    }
    return ErrorMiddleware.instance;
  }

  private setState(newState: Partial<ErrorState>) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  public subscribe(listener: (state: ErrorState) => void) {
    this.listeners.push(listener);
    listener(this.state);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getState(): ErrorState {
    return this.state;
  }

  public setError(message: string, code?: string) {
    this.setState({
      hasError: true,
      errorMessage: message,
      errorCode: code,
    });
  }

  public clearError() {
    this.setState({
      hasError: false,
      errorMessage: null,
      errorCode: undefined,
    });
  }

  public handleError(error: any, context?: string) {
    let message = "예상치 못한 오류가 발생했습니다.";
    let code: string | undefined;

    if (error?.message) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    if (context) {
      message = `${context}: ${message}`;
    }

    if (error?.code) {
      code = error.code;
    }

    this.setError(message, code);

    // 콘솔에 에러 로그
    console.error("ErrorMiddleware:", { error, context, message, code });
  }

  public async withErrorHandling<T>(
    asyncFunction: () => Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      this.clearError();
      return await asyncFunction();
    } catch (error) {
      this.handleError(error, context);
      return null;
    }
  }
}
