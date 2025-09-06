// src/types/index.ts
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: string;
  tags: string[];
  is_private: boolean;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface SharedPost {
  id: string;
  personal_post_id: string;
  user_id: string;
  shared_at: string;
  likes_count: number;
  comments_count: number;
  personal_posts: PersonalPost;
  user_profile: UserProfile;
  is_liked: boolean;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// State Types
export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
  posts: {
    personal: PersonalPost[];
    shared: SharedPost[];
    loading: boolean;
    error: string | null;
  };
  ui: {
    theme: "light" | "dark";
    language: string;
    notifications: boolean;
  };
}

// Environment Configuration
export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appName: string;
  appVersion: string;
  environment: "development" | "staging" | "production";
  debugMode: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
}

// Error Types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, "NETWORK_ERROR", 0);
    this.name = "NetworkError";
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, "AUTH_ERROR", 401);
    this.name = "AuthError";
  }
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PostForm {
  title: string;
  content: string;
  mood?: string;
  tags: string[];
}

export interface ProfileForm {
  username?: string;
  display_name?: string;
  bio?: string;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    h1: object;
    h2: object;
    h3: object;
    body: object;
    caption: object;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}
