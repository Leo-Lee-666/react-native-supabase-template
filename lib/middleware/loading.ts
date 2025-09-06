export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

export class LoadingMiddleware {
  private static instance: LoadingMiddleware;
  private listeners: ((state: LoadingState) => void)[] = [];
  private state: LoadingState = {
    isLoading: false,
    loadingMessage: undefined,
  };

  private constructor() {}

  public static getInstance(): LoadingMiddleware {
    if (!LoadingMiddleware.instance) {
      LoadingMiddleware.instance = new LoadingMiddleware();
    }
    return LoadingMiddleware.instance;
  }

  private setState(newState: Partial<LoadingState>) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  public subscribe(listener: (state: LoadingState) => void) {
    this.listeners.push(listener);
    listener(this.state);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getState(): LoadingState {
    return this.state;
  }

  public showLoading(message?: string) {
    this.setState({ isLoading: true, loadingMessage: message });
  }

  public hideLoading() {
    this.setState({ isLoading: false, loadingMessage: undefined });
  }

  public async withLoading<T>(
    asyncFunction: () => Promise<T>,
    message?: string
  ): Promise<T> {
    this.showLoading(message);

    try {
      const result = await asyncFunction();
      return result;
    } finally {
      this.hideLoading();
    }
  }
}
