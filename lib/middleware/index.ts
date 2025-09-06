import { AuthMiddleware } from "./auth";
import { LoadingMiddleware } from "./loading";
import { ErrorMiddleware } from "./error";

export class AppMiddleware {
  private static instance: AppMiddleware;

  public readonly auth: AuthMiddleware;
  public readonly loading: LoadingMiddleware;
  public readonly error: ErrorMiddleware;

  private constructor() {
    this.auth = AuthMiddleware.getInstance();
    this.loading = LoadingMiddleware.getInstance();
    this.error = ErrorMiddleware.getInstance();
  }

  public static getInstance(): AppMiddleware {
    if (!AppMiddleware.instance) {
      AppMiddleware.instance = new AppMiddleware();
    }
    return AppMiddleware.instance;
  }

  // 편의 메서드들
  public async signInWithLoading(email: string, password: string) {
    return await this.loading.withLoading(
      () => this.auth.signIn(email, password),
      "로그인 중..."
    );
  }

  public async signUpWithLoading(email: string, password: string) {
    return await this.loading.withLoading(
      () => this.auth.signUp(email, password),
      "회원가입 중..."
    );
  }

  public async signOutWithLoading() {
    return await this.loading.withLoading(
      () => this.auth.signOut(),
      "로그아웃 중..."
    );
  }

  public async executeWithErrorHandling<T>(
    asyncFunction: () => Promise<T>,
    context?: string
  ) {
    return await this.error.withErrorHandling(asyncFunction, context);
  }
}
