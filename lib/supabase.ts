import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EnvironmentConfig } from "../src/types";

// 환경 변수 검증 및 타입 안전성 보장
function validateEnvironmentConfig(): EnvironmentConfig {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요."
    );
  }

  // URL 형식 검증
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error("잘못된 Supabase URL 형식입니다.");
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    appName: "React Native App",
    appVersion: "1.0.0",
    environment: "development" as const,
    debugMode: true,
    logLevel: "debug" as const,
  };
}

const config = validateEnvironmentConfig();

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
