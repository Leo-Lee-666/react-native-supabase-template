import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MainTabNavigator from "./MainTabNavigator";
import DetailScreen from "../screens/main/DetailScreen";
import PersonalPostScreen from "../screens/main/PersonalPostScreen";
import PublicFeedScreen from "../screens/main/PublicFeedScreen";
import { MainStackParamList } from "../types/navigation";

const Stack = createStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
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
        name="Tabs"
        component={MainTabNavigator}
        options={{
          headerShown: false, // 탭 네비게이션에서 헤더 관리
        }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          title: "Premium Features",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="PersonalPost"
        component={PersonalPostScreen}
        options={{
          title: "Personal Posts",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="PublicFeed"
        component={PublicFeedScreen}
        options={{
          title: "Public Feed",
          headerBackTitle: "Back",
        }}
      />
      {/* 추가 스크린들을 여기에 정의 */}
      {/* 
      <Stack.Screen
        name="Edit"
        component={EditScreen}
        options={{
          title: "편집",
        }}
      />
      */}
    </Stack.Navigator>
  );
}
