import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainTabParamList } from "../../types/navigation";
import { MainStackParamList } from "../../types/navigation";
import { AppMiddleware } from "../../lib/middleware";

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Home">,
  StackNavigationProp<MainStackParamList>
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const middleware = AppMiddleware.getInstance();
  const authState = middleware.auth.getState();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Home</Text>
          <Text style={styles.subtitle}>Welcome! 🎉</Text>

          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>
              {authState.user?.email || "No email"}
            </Text>
            <Text style={styles.userDetail}>
              Account created:{" "}
              {authState.user?.created_at
                ? new Date(authState.user.created_at).toLocaleDateString(
                    "en-US"
                  )
                : "Unknown"}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Explore")}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Explore</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Detail")}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Premium Features</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("PersonalPost")}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Personal Posts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("PublicFeed")}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Public Feed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Profile")}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Settings")}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  userInfo: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  userEmail: {
    fontSize: 20,
    color: "#007AFF",
    marginBottom: 8,
    fontWeight: "600",
  },
  userDetail: {
    fontSize: 14,
    color: "#666",
  },
  actions: {
    width: "100%",
    maxWidth: 300,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
