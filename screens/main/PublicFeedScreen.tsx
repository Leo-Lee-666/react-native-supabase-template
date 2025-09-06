import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { AppMiddleware } from "../../lib/middleware";

type PublicFeedScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "PublicFeed"
>;

interface Props {
  navigation: PublicFeedScreenNavigationProp;
}

interface PublicPost {
  id: string;
  personal_post_id: string;
  user_id: string;
  shared_at: string;
  likes_count: number;
  comments_count: number;
  personal_posts: {
    id: string;
    title: string;
    content: string;
    mood: string;
    tags: string[];
    created_at: string;
    user_id: string;
  };
  user_profile: {
    email: string;
  };
  is_liked: boolean;
}

const moodOptions = [
  { key: "happy", emoji: "😊", label: "Happy" },
  { key: "sad", emoji: "😢", label: "Sad" },
  { key: "excited", emoji: "🤩", label: "Excited" },
  { key: "calm", emoji: "😌", label: "Calm" },
  { key: "anxious", emoji: "😰", label: "Anxious" },
  { key: "grateful", emoji: "🙏", label: "Grateful" },
  { key: "motivated", emoji: "💪", label: "Motivated" },
  { key: "tired", emoji: "😴", label: "Tired" },
];

export default function PublicFeedScreen({ navigation }: Props) {
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");

  const middleware = AppMiddleware.getInstance();
  const authState = middleware.auth.getState();

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    if (!authState.user) return;

    setLoading(true);
    try {
      // 공유된 포스트와 개인 포스트 정보를 함께 조회
      // RLS 정책으로 인해 공유된 포스트만 조회되도록 수정
      let query = supabase
        .from("shared_posts")
        .select(
          `
        id,
        personal_post_id,
        user_id,
        shared_at,
        likes_count,
        comments_count,
        personal_posts!inner(
          id,
          title,
          content,
          mood,
          tags,
          created_at,
          user_id,
          is_shared
        )
      `
        )
        .eq("personal_posts.is_shared", true);

      // 정렬 방식에 따라 쿼리 변경
      if (sortBy === "recent") {
        query = query.order("shared_at", { ascending: false });
      } else {
        query = query.order("likes_count", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Query error:", error);
        throw error;
      }

      console.log("Raw data from shared_posts:", data);
      console.log("Number of shared posts:", data?.length || 0);

      // 각 포스트에 대해 현재 사용자가 좋아요를 눌렀는지 확인하고 사용자 정보 조회
      const postsWithLikes = await Promise.all(
        (data || []).map(async (post) => {
          // 좋아요 상태 확인
          const { data: likeData } = await supabase
            .from("post_likes")
            .select("id")
            .eq("post_id", post.id)
            .eq("user_id", authState.user!.id)
            .single();

          // 사용자 프로필 조회
          const { data: profileData } = await supabase
            .from("user_profiles")
            .select("username, display_name")
            .eq("user_id", post.user_id)
            .single();

          return {
            ...post,
            is_liked: !!likeData,
            user_profile: {
              email:
                profileData?.display_name ||
                profileData?.username ||
                `User ${post.user_id.substring(0, 8)}`,
            },
          };
        })
      );

      setPosts(postsWithLikes);
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!authState.user) return;

    try {
      if (isCurrentlyLiked) {
        // 좋아요 취소
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", authState.user.id);

        if (error) throw error;

        // 좋아요 수 감소
        const { error: updateError } = await supabase
          .from("shared_posts")
          .update({
            likes_count:
              Math.max(
                0,
                posts.find((p) => p.id === postId)?.likes_count || 0
              ) - 1,
          })
          .eq("id", postId);

        if (updateError) throw updateError;
      } else {
        // 좋아요 추가
        const { error } = await supabase.from("post_likes").insert({
          post_id: postId,
          user_id: authState.user.id,
        });

        if (error) throw error;

        // 좋아요 수 증가
        const { error: updateError } = await supabase
          .from("shared_posts")
          .update({
            likes_count:
              (posts.find((p) => p.id === postId)?.likes_count || 0) + 1,
          })
          .eq("id", postId);

        if (updateError) throw updateError;
      }

      // 로컬 상태 업데이트
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: !isCurrentlyLiked,
                likes_count: isCurrentlyLiked
                  ? Math.max(0, post.likes_count - 1)
                  : post.likes_count + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      Alert.alert("Error", "Failed to update like");
    }
  };

  const handleShare = async (post: PublicPost) => {
    Alert.alert(
      "Share Post",
      `Share "${post.personal_posts.title}" with others?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share",
          onPress: () => {
            // 실제 공유 기능은 나중에 구현
            Alert.alert("Success", "Post shared successfully!");
          },
        },
      ]
    );
  };

  const renderPost = ({ item }: { item: PublicPost }) => {
    const moodEmoji =
      moodOptions.find((m) => m.key === item.personal_posts.mood)?.emoji ||
      "😊";

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.user_profile.email?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userEmail}>{item.user_profile.email}</Text>
              <Text style={styles.postDate}>
                {new Date(item.shared_at).toLocaleDateString("en-US")}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.postContent}>
          <View style={styles.postTitleContainer}>
            <Text style={styles.postTitle}>{item.personal_posts.title}</Text>
            <Text style={styles.postMood}>{moodEmoji}</Text>
          </View>

          <Text style={styles.postText}>{item.personal_posts.content}</Text>

          {item.personal_posts.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.personal_posts.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id, item.is_liked)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.is_liked ? "heart" : "heart-outline"}
              size={20}
              color={item.is_liked ? "#FF3B30" : "#666"}
            />
            <Text
              style={[styles.actionText, item.is_liked && styles.likedText]}
            >
              {item.likes_count}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              Alert.alert("Comments", "Comments feature coming soon!")
            }
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{item.comments_count}</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />

          <Text style={styles.originalDate}>
            Original:{" "}
            {new Date(item.personal_posts.created_at).toLocaleDateString(
              "en-US"
            )}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No shared posts yet</Text>
      <Text style={styles.emptySubtext}>
        Be the first to share your thoughts with the community!
      </Text>
      <TouchableOpacity
        style={styles.createPostButton}
        onPress={() => navigation.navigate("PersonalPost")}
        activeOpacity={0.7}
      >
        <Text style={styles.createPostButtonText}>Create Your First Post</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Public Feed</Text>
            <Text style={styles.subtitle}>
              Discover what others are sharing
            </Text>
          </View>

          {/* 정렬 옵션 */}
          <View style={styles.sortContainer}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === "recent" && styles.activeSortButton,
              ]}
              onPress={() => setSortBy("recent")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={sortBy === "recent" ? "white" : "#007AFF"}
              />
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === "recent" && styles.activeSortButtonText,
                ]}
              >
                Recent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === "popular" && styles.activeSortButton,
              ]}
              onPress={() => setSortBy("popular")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="flame-outline"
                size={16}
                color={sortBy === "popular" ? "white" : "#007AFF"}
              />
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === "popular" && styles.activeSortButtonText,
                ]}
              >
                Popular
              </Text>
            </TouchableOpacity>
          </View>

          {/* 통계 */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {posts.reduce((sum, post) => sum + post.likes_count, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Likes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {posts.reduce((sum, post) => sum + post.comments_count, 0)}
              </Text>
              <Text style={styles.statLabel}>Comments</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : posts.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  sortContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 4,
  },
  sortButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeSortButton: {
    backgroundColor: "#007AFF",
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007AFF",
    marginLeft: 4,
  },
  activeSortButtonText: {
    color: "white",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  createPostButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createPostButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  postCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  userDetails: {
    flex: 1,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  postDate: {
    fontSize: 12,
    color: "#999",
  },
  shareButton: {
    padding: 8,
  },
  postContent: {
    marginBottom: 12,
  },
  postTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  postMood: {
    fontSize: 20,
    marginLeft: 8,
  },
  postText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#f0f8ff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  likedText: {
    color: "#FF3B30",
  },
  spacer: {
    flex: 1,
  },
  originalDate: {
    fontSize: 12,
    color: "#999",
  },
});
