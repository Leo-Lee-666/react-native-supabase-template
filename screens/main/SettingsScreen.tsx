import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../../types/navigation";

type SettingsScreenNavigationProp = BottomTabNavigationProp<
  MainTabParamList,
  "Settings"
>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

export default function SettingsScreen({ navigation }: Props) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const handleClearCache = () => {
    Alert.alert("Clear Cache", "Do you want to clear the app cache?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          Alert.alert("Complete", "Cache has been cleared.");
        },
      },
    ]);
  };

  const handleAbout = () => {
    Alert.alert(
      "App Info",
      "Supabase + Expo + TypeScript\nTemplate App v1.0.0",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Settings</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#767577", true: "#007AFF" }}
                thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Theme</Text>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: "#767577", true: "#007AFF" }}
                thumbColor={darkModeEnabled ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleClearCache}
            >
              <Text style={styles.settingLabel}>Clear Cache</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information</Text>
            <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
              <Text style={styles.settingLabel}>App Info</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Supabase + Expo + TypeScript Template
            </Text>
            <Text style={styles.footerVersion}>v1.0.0</Text>
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
  },
  settingArrow: {
    fontSize: 18,
    color: "#666",
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: "#999",
  },
});
