import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { AuthMiddleware, AuthState } from "../lib/middleware/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  requireAuth = true,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const authMiddleware = AuthMiddleware.getInstance();
    const unsubscribe = authMiddleware.subscribe(setAuthState);

    return unsubscribe;
  }, []);

  // 로딩 중
  if (authState.loading) {
    return (
      fallback || (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )
    );
  }

  // 인증이 필요한데 사용자가 없는 경우
  if (requireAuth && !authState.user) {
    return null; // 로그인 화면으로 리다이렉트
  }

  // 인증이 필요 없는데 사용자가 있는 경우 (로그인 화면 등)
  if (!requireAuth && authState.user) {
    return null; // 메인 화면으로 리다이렉트
  }

  // 에러가 있는 경우
  if (authState.error) {
    console.error("Auth Error:", authState.error);
    // 에러 화면 또는 기본 화면 표시
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
