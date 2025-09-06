import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../../types/navigation";
import { AppMiddleware } from "../../lib/middleware";

type ProfileScreenNavigationProp = BottomTabNavigationProp<
  MainTabParamList,
  "Profile"
>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: Props) {
  const middleware = AppMiddleware.getInstance();
  const authState = middleware.auth.getState();

  const handleSignOut = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          const result = await middleware.signOutWithLoading();
          if (!result?.success) {
            Alert.alert(
              "Logout Error",
              result?.error || "Unknown error occurred"
            );
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Profile</Text>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {authState.user?.email?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>

            <Text style={styles.userEmail}>
              {authState.user?.email || "No email"}
            </Text>
            <Text style={styles.userId}>ID: {authState.user?.id}</Text>

            <View style={styles.userDetails}>
              <Text style={styles.detailLabel}>Account Created</Text>
              <Text style={styles.detailValue}>
                {authState.user?.created_at
                  ? new Date(authState.user.created_at).toLocaleDateString(
                      "en-US"
                    )
                  : "Unknown"}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Settings")}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Logout</Text>
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
    marginBottom: 40,
    color: "#333",
    textAlign: "center",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 20,
    color: "#333",
    marginBottom: 8,
    fontWeight: "600",
    textAlign: "center",
  },
  userId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  userDetails: {
    width: "100%",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
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
  logoutButton: {
    backgroundColor: "#ff3b30",
    shadowColor: "#ff3b30",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
