# Database Setup Guide

This guide covers setting up the PostgreSQL database with Supabase for the React Native template.

## Overview

The application uses Supabase as the backend, which provides:

- PostgreSQL database
- Authentication
- Real-time subscriptions
- Row Level Security (RLS)
- API auto-generation

## Database Schema

### Core Tables

#### `user_profiles`

Stores user profile information.

```sql
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `personal_posts`

Stores user's personal posts (diary entries).

```sql
CREATE TABLE personal_posts (
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
```

#### `shared_posts`

Stores posts that have been shared to the public feed.

```sql
CREATE TABLE shared_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  personal_post_id UUID REFERENCES personal_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);
```

#### `post_likes`

Stores likes on shared posts.

```sql
CREATE TABLE post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES shared_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

#### `post_comments`

Stores comments on shared posts.

```sql
CREATE TABLE post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES shared_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `react-native-template`
   - Database Password: (generate a strong password)
   - Region: (choose closest to your users)

### 2. Run Database Migrations

Execute the SQL scripts in order:

1. **Main Schema**

   ```sql
   -- Run database/schema.sql
   ```

2. **User Profiles**

   ```sql
   -- Run database/add-user-profiles.sql
   ```

3. **Create Profiles for Existing Users**
   ```sql
   -- Run database/create-profiles.sql
   ```

### 3. Configure Row Level Security (RLS)

RLS policies are automatically created with the schema. Key policies:

#### User Profiles

- Anyone can view profiles
- Users can only modify their own profile

#### Personal Posts

- Users can view their own posts
- Users can view shared posts from others
- Users can only modify their own posts

#### Shared Posts

- Anyone can view shared posts
- Users can only share their own posts

#### Post Likes/Comments

- Anyone can view likes/comments
- Users can only create/modify their own likes/comments

### 4. Set Up Authentication

1. **Configure Auth Settings**

   - Go to Authentication > Settings
   - Enable email confirmations if needed
   - Configure password requirements

2. **Set Up Email Templates**

   - Go to Authentication > Email Templates
   - Customize confirmation and reset password emails

3. **Configure Providers** (Optional)
   - Go to Authentication > Providers
   - Enable Google, GitHub, etc. if needed

## Database Functions

### Auto Profile Creation

```sql
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
```

### Update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## Testing the Setup

### 1. Test Database Connection

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 2. Test RLS Policies

```sql
-- Test user profile access
SELECT * FROM user_profiles LIMIT 5;

-- Test personal posts access
SELECT * FROM personal_posts LIMIT 5;

-- Test shared posts access
SELECT * FROM shared_posts LIMIT 5;
```

### 3. Test Authentication

- Create a test user through the app
- Verify profile is automatically created
- Test login/logout functionality

## Performance Optimization

### Indexes

```sql
-- Add indexes for better performance
CREATE INDEX idx_personal_posts_user_id ON personal_posts(user_id);
CREATE INDEX idx_personal_posts_created_at ON personal_posts(created_at);
CREATE INDEX idx_shared_posts_shared_at ON shared_posts(shared_at);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
```

### Query Optimization

- Use proper WHERE clauses
- Limit result sets with LIMIT
- Use appropriate JOINs
- Consider pagination for large datasets

## Backup and Recovery

### Backup

```sql
-- Create a backup
pg_dump -h your-host -U postgres -d your-database > backup.sql
```

### Recovery

```sql
-- Restore from backup
psql -h your-host -U postgres -d your-database < backup.sql
```

## Monitoring

### Database Metrics

- Monitor query performance
- Check for slow queries
- Monitor connection usage
- Track storage usage

### Supabase Dashboard

- Use the Supabase dashboard for monitoring
- Check logs for errors
- Monitor API usage
- Track authentication metrics

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**

   - Check if policies are enabled
   - Verify policy conditions
   - Test with different user contexts

2. **Connection Issues**

   - Verify environment variables
   - Check network connectivity
   - Verify Supabase project status

3. **Migration Errors**
   - Check for existing tables
   - Verify permissions
   - Review error messages

### Debug Queries

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'personal_posts';

-- Check table permissions
SELECT * FROM information_schema.table_privileges
WHERE table_name = 'personal_posts';

-- Check user roles
SELECT * FROM pg_roles WHERE rolname = 'authenticated';
```
