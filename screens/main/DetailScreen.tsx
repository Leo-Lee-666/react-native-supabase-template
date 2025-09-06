import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../types/navigation";
import { Ionicons } from "@expo/vector-icons";

type DetailScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Detail"
>;

interface Props {
  navigation: DetailScreenNavigationProp;
}

interface DetailItem {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  price: string;
  image: string;
}

const detailData: DetailItem[] = [
  {
    id: "1",
    title: "Premium Feature",
    description:
      "Access to all premium features and content. Get unlimited access to our entire library.",
    category: "Premium",
    rating: 4.8,
    price: "$9.99",
    image: "star",
  },
  {
    id: "2",
    title: "Advanced Analytics",
    description:
      "Detailed analytics and insights to help you understand your data better.",
    category: "Analytics",
    rating: 4.6,
    price: "$4.99",
    image: "analytics",
  },
  {
    id: "3",
    title: "Custom Themes",
    description:
      "Personalize your experience with custom themes and color schemes.",
    category: "Customization",
    rating: 4.7,
    price: "$2.99",
    image: "color-palette",
  },
  {
    id: "4",
    title: "Priority Support",
    description: "Get priority customer support with faster response times.",
    category: "Support",
    rating: 4.9,
    price: "$7.99",
    image: "headset",
  },
];

export default function DetailScreen({ navigation }: Props) {
  const [selectedItem, setSelectedItem] = useState<DetailItem | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const handlePurchase = (item: DetailItem) => {
    Alert.alert(
      "Purchase Confirmation",
      `Are you sure you want to purchase "${item.title}" for ${item.price}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Purchase",
          onPress: () => {
            Alert.alert("Success", "Purchase completed successfully!");
          },
        },
      ]
    );
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(
      isFavorite ? "Removed from Favorites" : "Added to Favorites",
      isFavorite
        ? "Item removed from your favorites."
        : "Item added to your favorites."
    );
  };

  const renderDetailItem = (item: DetailItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.detailCard,
        selectedItem?.id === item.id && styles.selectedCard,
      ]}
      onPress={() => setSelectedItem(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.image as any} size={24} color="#007AFF" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavorite}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#ff3b30" : "#666"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.cardDescription}>{item.description}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#ffc107" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>

      <TouchableOpacity
        style={styles.purchaseButton}
        onPress={() => handlePurchase(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.purchaseButtonText}>Purchase</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Premium Features</Text>
          <Text style={styles.subtitle}>
            Discover and purchase premium features to enhance your experience
          </Text>

          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>Features</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.7</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>$25</Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
          </View>

          {/* Detail Items */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Available Features</Text>
            {detailData.map(renderDetailItem)}
          </View>

          {/* Selected Item Details */}
          {selectedItem && (
            <View style={styles.selectedItemContainer}>
              <Text style={styles.selectedItemTitle}>
                Selected: {selectedItem.title}
              </Text>
              <Text style={styles.selectedItemDescription}>
                {selectedItem.description}
              </Text>
              <View style={styles.selectedItemActions}>
                <TouchableOpacity
                  style={styles.addToCartButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="cart" size={20} color="#007AFF" />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buyNowButton}
                  onPress={() => handlePurchase(selectedItem)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buyNowText}>Buy Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Additional Actions */}
          <View style={styles.additionalActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#007AFF" />
              <Text style={styles.actionButtonText}>Back to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Alert.alert("Contact", "Contact support for more information.")
              }
              activeOpacity={0.7}
            >
              <Ionicons name="mail" size={20} color="#007AFF" />
              <Text style={styles.actionButtonText}>Contact Support</Text>
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
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
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  statItem: {
    alignItems: "center",
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
  },
  detailsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: "#007AFF",
    borderWidth: 2,
    backgroundColor: "#f0f8ff",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
  cardCategory: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
  },
  favoriteButton: {
    padding: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 4,
    fontWeight: "500",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  purchaseButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  purchaseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedItemContainer: {
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  selectedItemTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 8,
  },
  selectedItemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  selectedItemActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  addToCartText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginLeft: 8,
  },
  buyNowText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  additionalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    minWidth: 120,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
});
