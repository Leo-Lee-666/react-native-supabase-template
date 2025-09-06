import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "react-native-gesture-handler";
import { RootStackParamList } from "./types/navigation";
import { AppMiddleware } from "./lib/middleware";
import AuthStackNavigator from "./navigation/AuthStackNavigator";
import MainStackNavigator from "./navigation/MainStackNavigator";

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const middleware = AppMiddleware.getInstance();
  const [authState, setAuthState] = useState<{ user: any; loading: boolean }>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = middleware.auth.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  // 로딩 중 (세션 확인 중)
  if (authState.loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {authState.user ? (
            // 로그인된 사용자 - 메인 앱
            <Stack.Screen name="Main" component={MainStackNavigator} />
          ) : (
            // 로그인되지 않은 사용자 - 인증 화면
            <Stack.Screen name="Auth" component={AuthStackNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
