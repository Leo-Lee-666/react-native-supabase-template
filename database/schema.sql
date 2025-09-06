-- Complete Database Schema for React Native + Supabase Template
-- This file contains all necessary tables, policies, and functions

-- ==============================================
-- TABLES
-- ==============================================

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personal posts table (diary entries)
CREATE TABLE IF NOT EXISTS personal_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  is_private BOOLEAN DEFAULT true,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared posts table (public feed)
CREATE TABLE IF NOT EXISTS shared_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  personal_post_id UUID REFERENCES personal_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES shared_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Post comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES shared_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_personal_posts_user_id ON personal_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_posts_created_at ON personal_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_shared_posts_shared_at ON shared_posts(shared_at);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- User profiles policies
DROP POLICY IF EXISTS "Anyone can view user profiles" ON user_profiles;
CREATE POLICY "Anyone can view user profiles" ON user_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;
CREATE POLICY "Users can delete their own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Personal posts policies
DROP POLICY IF EXISTS "Users can view their own posts and shared posts" ON personal_posts;
CREATE POLICY "Users can view their own posts and shared posts" ON personal_posts
  FOR SELECT USING (auth.uid() = user_id OR is_shared = true);

DROP POLICY IF EXISTS "Users can insert their own posts" ON personal_posts;
CREATE POLICY "Users can insert their own posts" ON personal_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON personal_posts;
CREATE POLICY "Users can update their own posts" ON personal_posts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON personal_posts;
CREATE POLICY "Users can delete their own posts" ON personal_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Shared posts policies
DROP POLICY IF EXISTS "Anyone can view shared posts" ON shared_posts;
CREATE POLICY "Anyone can view shared posts" ON shared_posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can share their own posts" ON shared_posts;
CREATE POLICY "Users can share their own posts" ON shared_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Post likes policies
DROP POLICY IF EXISTS "Anyone can view likes" ON post_likes;
CREATE POLICY "Anyone can view likes" ON post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
CREATE POLICY "Users can like posts" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike their own likes" ON post_likes;
CREATE POLICY "Users can unlike their own likes" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Post comments policies
DROP POLICY IF EXISTS "Anyone can view comments" ON post_comments;
CREATE POLICY "Anyone can view comments" ON post_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert comments" ON post_comments;
CREATE POLICY "Users can insert comments" ON post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;
CREATE POLICY "Users can update their own comments" ON post_comments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;
CREATE POLICY "Users can delete their own comments" ON post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- ==============================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS update_personal_posts_updated_at ON personal_posts;
CREATE TRIGGER update_personal_posts_updated_at 
  BEFORE UPDATE ON personal_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_post_comments_updated_at ON post_comments;
CREATE TRIGGER update_post_comments_updated_at 
  BEFORE UPDATE ON post_comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- ==============================================
-- SEED DATA (Optional)
-- ==============================================

-- Create profiles for existing users (if any)
INSERT INTO user_profiles (user_id, username, display_name)
SELECT 
  id,
  split_part(email, '@', 1) as username,
  split_part(email, '@', 1) as display_name
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;