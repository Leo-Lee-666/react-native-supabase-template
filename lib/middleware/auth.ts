import { supabase } from "../supabase";
import { User } from "../../src/types";

export interface MiddlewareResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export class AuthMiddleware {
  private static instance: AuthMiddleware;
  private listeners: ((state: AuthState) => void)[] = [];
  private state: AuthState = {
    user: null,
    loading: true,
    error: null,
  };

  private constructor() {
    this.initializeAuth();
  }

  public static getInstance(): AuthMiddleware {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  private async initializeAuth() {
    try {
      console.log("🔐 인증 상태 초기화 시작...");

      // 현재 세션 확인
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.log("❌ 세션 확인 오류:", error.message);
        this.setState({ user: null, loading: false, error: error.message });
        return;
      }

      if (session?.user) {
        console.log("✅ 기존 세션 발견:", session.user.email);
        this.setState({
          user: session.user as User,
          loading: false,
          error: null,
        });
      } else {
        console.log("ℹ️ 로그인되지 않은 상태");
        this.setState({
          user: null,
          loading: false,
          error: null,
        });
      }

      // 인증 상태 변화 감지
      supabase.auth.onAuthStateChange((event, session) => {
        console.log(
          "🔄 인증 상태 변화:",
          event,
          session?.user?.email || "로그아웃"
        );
        this.setState({
          user: session?.user ? (session.user as User) : null,
          loading: false,
          error: null,
        });
      });
    } catch (error) {
      console.log("❌ 인증 초기화 오류:", error);
      this.setState({
        user: null,
        loading: false,
        error: "인증 초기화 중 오류가 발생했습니다.",
      });
    }
  }

  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  public subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // 즉시 현재 상태 전달
    listener(this.state);

    // 구독 해제 함수 반환
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getState(): AuthState {
    return this.state;
  }

  public async signIn(
    email: string,
    password: string
  ): Promise<MiddlewareResponse<User>> {
    // 입력값 검증 및 정리
    const sanitizedEmail = email.trim();
    const sanitizedPassword = password.trim();

    if (!sanitizedEmail || !sanitizedPassword) {
      const error = "Please enter your email and password.";
      this.setState({ loading: false, error });
      return { success: false, error };
    }

    this.setState({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (error) {
        const sanitizedError = error.message;
        this.setState({ loading: false, error: sanitizedError });
        return { success: false, error: sanitizedError };
      }

      this.setState({ loading: false, error: null });
      return { success: true, data: data.user as User };
    } catch (error) {
      const errorMessage = "An error occurred during login.";
      this.setState({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  public async signUp(
    email: string,
    password: string
  ): Promise<MiddlewareResponse<User>> {
    // 입력값 검증 및 정리
    const sanitizedEmail = email.trim();
    const sanitizedPassword = password.trim();

    if (!sanitizedEmail || !sanitizedPassword) {
      const error = "Please enter your email and password.";
      this.setState({ loading: false, error });
      return { success: false, error };
    }

    this.setState({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (error) {
        const sanitizedError = error.message;
        this.setState({ loading: false, error: sanitizedError });
        return { success: false, error: sanitizedError };
      }

      this.setState({ loading: false, error: null });
      return { success: true, data: data.user as User };
    } catch (error) {
      const errorMessage = "An error occurred during registration.";
      this.setState({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  public async signOut(): Promise<MiddlewareResponse> {
    this.setState({ loading: true, error: null });

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        const sanitizedError = error.message;
        this.setState({ loading: false, error: sanitizedError });
        return { success: false, error: sanitizedError };
      }

      this.setState({ user: null, loading: false, error: null });
      return { success: true };
    } catch (error) {
      const errorMessage = "An error occurred during logout.";
      this.setState({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }
}
