-- ============================================================
-- Easy Drive — Mobile Push Token Migration
-- Migration: 0003_mobile_push_tokens.sql
-- Adds Expo push notification token support to profiles.
-- Required for mobile app push notifications (FCM/APNs via Expo).
-- ============================================================

-- Add Expo push notification token to profiles.
-- Nullable: web-only users will never populate this field.
-- The mobile app calls:
--   supabase.from('profiles').update({ expo_push_token: token })
-- after Notifications.getExpoPushTokenAsync() on first launch.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Index for bulk push sends (e.g., notify all active renters or all hosts).
-- Partial index — only indexes rows that actually have a token, keeping it lean.
CREATE INDEX IF NOT EXISTS profiles_expo_push_token_idx
  ON profiles(expo_push_token)
  WHERE expo_push_token IS NOT NULL;
