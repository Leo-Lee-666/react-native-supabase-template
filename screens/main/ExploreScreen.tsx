import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainTabParamList } from "../../types/navigation";
import { MainStackParamList } from "../../types/navigation";
import { Ionicons } from "@expo/vector-icons";

type ExploreScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Explore">,
  StackNavigationProp<MainStackParamList>
>;

interface Props {
  navigation: ExploreScreenNavigationProp;
}

interface ExploreItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const exploreData: ExploreItem[] = [
  {
    id: "1",
    title: "Featured Content",
    description: "Discover trending topics and popular content",
    category: "Trending",
    icon: "trending-up",
  },
  {
    id: "2",
    title: "Categories",
    description: "Browse content by different categories",
    category: "Browse",
    icon: "grid",
  },
  {
    id: "3",
    title: "Search",
    description: "Find exactly what you're looking for",
    category: "Search",
    icon: "search",
  },
  {
    id: "4",
    title: "Recommendations",
    description: "Personalized content just for you",
    category: "Personal",
    icon: "heart",
  },
  {
    id: "5",
    title: "Latest Updates",
    description: "Stay up to date with recent changes",
    category: "Updates",
    icon: "time",
  },
  {
    id: "6",
    title: "Community",
    description: "Connect with other users and share ideas",
    category: "Social",
    icon: "people",
  },
];

export default function ExploreScreen({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    "Trending",
    "Browse",
    "Search",
    "Personal",
    "Updates",
    "Social",
  ];

  const filteredData =
    selectedCategory === "All"
      ? exploreData
      : exploreData.filter((item) => item.category === selectedCategory);

  const renderExploreItem = ({ item }: { item: ExploreItem }) => (
    <TouchableOpacity style={styles.exploreCard} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={24} color="#007AFF" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButton = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(category)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category && styles.categoryButtonTextActive,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>Discover new content and features</Text>

          {/* Category Filter */}
          <View style={styles.categoryContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {categories.map(renderCategoryButton)}
            </ScrollView>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>1,234</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>56</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>89</Text>
              <Text style={styles.statLabel}>Featured</Text>
            </View>
          </View>

          {/* Explore Items */}
          <View style={styles.exploreSection}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === "All"
                ? "All Features"
                : `${selectedCategory} Features`}
            </Text>
            <FlatList
              data={filteredData}
              renderItem={renderExploreItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate("Home")}
                activeOpacity={0.7}
              >
                <Ionicons name="home" size={20} color="#007AFF" />
                <Text style={styles.actionButtonText}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate("Detail")}
                activeOpacity={0.7}
              >
                <Ionicons name="star" size={20} color="#007AFF" />
                <Text style={styles.actionButtonText}>Premium</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate("PersonalPost")}
                activeOpacity={0.7}
              >
                <Ionicons name="journal" size={20} color="#007AFF" />
                <Text style={styles.actionButtonText}>Posts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate("PublicFeed")}
                activeOpacity={0.7}
              >
                <Ionicons name="people" size={20} color="#007AFF" />
                <Text style={styles.actionButtonText}>Feed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate("Profile")}
                activeOpacity={0.7}
              >
                <Ionicons name="person" size={20} color="#007AFF" />
                <Text style={styles.actionButtonText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate("Settings")}
                activeOpacity={0.7}
              >
                <Ionicons name="settings" size={20} color="#007AFF" />
                <Text style={styles.actionButtonText}>Settings</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 8,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  categoryContainer: {
    marginBottom: 25,
  },
  categoryScrollContent: {
    paddingHorizontal: 5,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: "#007AFF",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: "white",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  exploreSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  exploreCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
  },
  quickActions: {
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    minWidth: 80,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 4,
    fontWeight: "500",
  },
});
