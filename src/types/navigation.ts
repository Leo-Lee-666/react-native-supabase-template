// src/types/navigation.ts
import { NavigatorScreenParams } from "@react-navigation/native";

// Root Stack Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Auth Stack Navigator
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Main Stack Navigator
export type MainStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList>;
  PostDetail: { postId: string };
  EditPost: { postId: string };
  UserProfile: { userId: string };
  Settings: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Create: undefined;
  Notifications: undefined;
  Profile: undefined;
};

// Navigation Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: import("@react-navigation/stack").StackNavigationProp<
    RootStackParamList,
    T
  >;
  route: import("@react-navigation/native").RouteProp<RootStackParamList, T>;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = {
  navigation: import("@react-navigation/stack").StackNavigationProp<
    AuthStackParamList,
    T
  >;
  route: import("@react-navigation/native").RouteProp<AuthStackParamList, T>;
};

export type MainStackScreenProps<T extends keyof MainStackParamList> = {
  navigation: import("@react-navigation/stack").StackNavigationProp<
    MainStackParamList,
    T
  >;
  route: import("@react-navigation/native").RouteProp<MainStackParamList, T>;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = {
  navigation: import("@react-navigation/bottom-tabs").BottomTabNavigationProp<
    MainTabParamList,
    T
  >;
  route: import("@react-navigation/native").RouteProp<MainTabParamList, T>;
};

// Composite Navigation Types
export type CompositeScreenProps<
  T extends keyof MainTabParamList,
  U extends keyof MainStackParamList
> = MainTabScreenProps<T> & {
  navigation: MainTabScreenProps<T>["navigation"] &
    MainStackScreenProps<U>["navigation"];
};
