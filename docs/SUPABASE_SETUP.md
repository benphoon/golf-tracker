# Supabase Setup Guide

This guide explains how to set up Supabase authentication and database for ShotMate.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from Settings > API
3. Update your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-actual-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

## 2. Database Schema

Run the following SQL in your Supabase SQL editor to create the required tables and policies:

```sql
-- User profiles table (extends auth.users)
-- Note: auth.users table is managed by Supabase and already secured
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved rounds table
CREATE TABLE saved_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  holes INTEGER NOT NULL CHECK (holes IN (9, 18)),
  course_par INTEGER,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Round players table
CREATE TABLE round_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES saved_rounds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  scores INTEGER[] NOT NULL,
  player_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_saved_rounds_user_id ON saved_rounds(user_id);
CREATE INDEX idx_saved_rounds_played_at ON saved_rounds(played_at DESC);
CREATE INDEX idx_round_players_round_id ON round_players(round_id);

-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for saved_rounds
CREATE POLICY "Users can view own rounds" ON saved_rounds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rounds" ON saved_rounds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rounds" ON saved_rounds
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rounds" ON saved_rounds
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for round_players
CREATE POLICY "Users can view players in own rounds" ON round_players
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM saved_rounds
      WHERE id = round_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert players in own rounds" ON round_players
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM saved_rounds
      WHERE id = round_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update players in own rounds" ON round_players
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM saved_rounds
      WHERE id = round_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete players in own rounds" ON round_players
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM saved_rounds
      WHERE id = round_id AND user_id = auth.uid()
    )
  );
```

## 3. Authentication Configuration

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Enable email authentication (default)
4. Optionally configure OAuth providers (Google, GitHub, etc.)

## 4. Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# For production, also add:
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 5. Testing the Setup

1. Start your development server: `npm run dev`
2. Try to sign up for a new account
3. Complete a golf round and save it
4. Check that data appears in your Supabase tables

## 6. Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Passwords are handled securely by Supabase Auth
- API keys are environment-specific

## 7. Production Deployment

1. Set environment variables in your deployment platform
2. Update site URL in Supabase Auth settings
3. Consider enabling additional security features like email confirmation
4. Monitor usage in Supabase dashboard

## Troubleshooting

**Q: I get authentication errors**
A: Check that your environment variables are correct and your site URL is configured in Supabase.

**Q: Data isn't saving**
A: Verify that the database tables exist and RLS policies are properly configured.

**Q: Build fails with Supabase errors**
A: Make sure all environment variables are set, even for build environments.