import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthStackParamList } from "../types/navigation";
import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#eee",
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "600",
          color: "#333",
        },
        headerTintColor: "#007AFF",
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Login",
          headerShown: false, // Hide header on login screen
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          title: "Sign Up",
          headerShown: false, // Hide header on signup screen
        }}
      />
    </Stack.Navigator>
  );
}
