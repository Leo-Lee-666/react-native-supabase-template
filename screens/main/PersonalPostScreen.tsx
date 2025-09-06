import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
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

type PersonalPostScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "PersonalPost"
>;

interface Props {
  navigation: PersonalPostScreenNavigationProp;
}

interface PersonalPost {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  is_private: boolean;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
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

export default function PersonalPostScreen({ navigation }: Props) {
  const [posts, setPosts] = useState<PersonalPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [editingPost, setEditingPost] = useState<PersonalPost | null>(null);

  // 새 포스트 작성 상태
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    mood: "",
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState("");

  const middleware = AppMiddleware.getInstance();
  const authState = middleware.auth.getState();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    if (!authState.user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("personal_posts")
        .select("*")
        .eq("user_id", authState.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
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

  const handleCreatePost = async () => {
    if (!authState.user) return;

    if (!newPost.title.trim() || !newPost.content.trim()) {
      Alert.alert("Error", "Please fill in title and content");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("personal_posts")
        .insert({
          user_id: authState.user.id,
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          mood: newPost.mood,
          tags: newPost.tags,
          is_private: true,
          is_shared: false,
        })
        .select()
        .single();

      if (error) throw error;

      setPosts([data, ...posts]);
      setShowNewPost(false);
      setNewPost({ title: "", content: "", mood: "", tags: [] });
      Alert.alert("Success", "Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post");
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    try {
      const { data, error } = await supabase
        .from("personal_posts")
        .update({
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          mood: newPost.mood,
          tags: newPost.tags,
        })
        .eq("id", editingPost.id)
        .select()
        .single();

      if (error) throw error;

      setPosts(posts.map((post) => (post.id === editingPost.id ? data : post)));
      setEditingPost(null);
      setNewPost({ title: "", content: "", mood: "", tags: [] });
      Alert.alert("Success", "Post updated successfully!");
    } catch (error) {
      console.error("Error updating post:", error);
      Alert.alert("Error", "Failed to update post");
    }
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("personal_posts")
              .delete()
              .eq("id", postId);

            if (error) throw error;

            setPosts(posts.filter((post) => post.id !== postId));
            Alert.alert("Success", "Post deleted successfully!");
          } catch (error) {
            console.error("Error deleting post:", error);
            Alert.alert("Error", "Failed to delete post");
          }
        },
      },
    ]);
  };

  const handleSharePost = async (post: PersonalPost) => {
    Alert.alert(
      "Share Post",
      "Do you want to share this post to the public feed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share",
          onPress: async () => {
            try {
              // 개인 포스트를 공유 상태로 업데이트
              const { error: updateError } = await supabase
                .from("personal_posts")
                .update({ is_shared: true })
                .eq("id", post.id);

              if (updateError) throw updateError;

              // 공유 포스트 테이블에 추가
              const { error: shareError } = await supabase
                .from("shared_posts")
                .insert({
                  personal_post_id: post.id,
                  user_id: authState.user!.id,
                });

              if (shareError) throw shareError;

              setPosts(
                posts.map((p) =>
                  p.id === post.id ? { ...p, is_shared: true } : p
                )
              );
              Alert.alert("Success", "Post shared successfully!");
            } catch (error) {
              console.error("Error sharing post:", error);
              Alert.alert("Error", "Failed to share post");
            }
          },
        },
      ]
    );
  };

  const addTag = () => {
    if (tagInput.trim() && !newPost.tags.includes(tagInput.trim())) {
      setNewPost({ ...newPost, tags: [...newPost.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewPost({
      ...newPost,
      tags: newPost.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const startEdit = (post: PersonalPost) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content,
      mood: post.mood,
      tags: post.tags,
    });
    setShowNewPost(true);
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setShowNewPost(false);
    setNewPost({ title: "", content: "", mood: "", tags: [] });
  };

  const renderPost = ({ item }: { item: PersonalPost }) => {
    const moodEmoji =
      moodOptions.find((m) => m.key === item.mood)?.emoji || "😊";

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.postTitleContainer}>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postMood}>{moodEmoji}</Text>
          </View>
          <View style={styles.postActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => startEdit(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
            {!item.is_shared && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleSharePost(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={20} color="#34C759" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeletePost(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.postFooter}>
          <Text style={styles.postDate}>
            {new Date(item.created_at).toLocaleDateString("en-US")}
          </Text>
          {item.is_shared && (
            <View style={styles.sharedBadge}>
              <Ionicons name="globe-outline" size={16} color="#34C759" />
              <Text style={styles.sharedText}>Shared</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderNewPostForm = () => (
    <View style={styles.newPostForm}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>
          {editingPost ? "Edit Post" : "New Post"}
        </Text>
        <TouchableOpacity onPress={cancelEdit} activeOpacity={0.7}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.titleInput}
        placeholder="Post title..."
        value={newPost.title}
        onChangeText={(text) => setNewPost({ ...newPost, title: text })}
      />

      <TextInput
        style={styles.contentInput}
        placeholder="What's on your mind?"
        value={newPost.content}
        onChangeText={(text) => setNewPost({ ...newPost, content: text })}
        multiline
        numberOfLines={6}
      />

      <View style={styles.moodSection}>
        <Text style={styles.sectionLabel}>Mood</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {moodOptions.map((mood) => (
            <TouchableOpacity
              key={mood.key}
              style={[
                styles.moodOption,
                newPost.mood === mood.key && styles.selectedMood,
              ]}
              onPress={() => setNewPost({ ...newPost, mood: mood.key })}
              activeOpacity={0.7}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={styles.moodLabel}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.tagsSection}>
        <Text style={styles.sectionLabel}>Tags</Text>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={styles.tagInput}
            placeholder="Add a tag..."
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={addTag}
          />
          <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.tagsContainer}>
          {newPost.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(tag)}>
                <Ionicons name="close" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={cancelEdit}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={editingPost ? handleUpdatePost : handleCreatePost}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>
            {editingPost ? "Update" : "Create"}
          </Text>
        </TouchableOpacity>
      </View>
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
            <Text style={styles.title}>Personal Posts</Text>
            <Text style={styles.subtitle}>
              Your personal diary and thoughts
            </Text>
          </View>

          {showNewPost ? (
            renderNewPostForm()
          ) : (
            <>
              <TouchableOpacity
                style={styles.newPostButton}
                onPress={() => setShowNewPost(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={24} color="white" />
                <Text style={styles.newPostButtonText}>New Post</Text>
              </TouchableOpacity>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading posts...</Text>
                </View>
              ) : posts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="journal-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>No posts yet</Text>
                  <Text style={styles.emptySubtext}>
                    Start writing your first post!
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={posts}
                  renderItem={renderPost}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </>
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
  newPostButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  newPostButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
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
    alignItems: "flex-start",
    marginBottom: 12,
  },
  postTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
  postActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  postContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "#f0f8ff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postDate: {
    fontSize: 12,
    color: "#999",
  },
  sharedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fff0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sharedText: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "500",
    marginLeft: 4,
  },
  newPostForm: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  titleInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  contentInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    textAlignVertical: "top",
  },
  moodSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  moodOption: {
    alignItems: "center",
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedMood: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: "#666",
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginLeft: 8,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
