-- BargainB AI Integration Database Migration
-- This script adds AI capabilities to the existing WhatsApp system
-- Run this in your Supabase SQL Editor

-- ================================================================
-- PHASE 1: ADD AI COLUMNS TO EXISTING TABLES
-- ================================================================

-- Add AI capabilities to existing whatsapp_chats table
ALTER TABLE whatsapp_chats 
ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_thread_id VARCHAR,
ADD COLUMN IF NOT EXISTS ai_config JSONB DEFAULT '{"enabled": false, "response_style": "helpful"}'::jsonb;

-- Add AI indicators to existing messages table  
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS sender_type VARCHAR DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_ai_triggered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_thread_id VARCHAR;

-- ================================================================
-- PHASE 2: CREATE AI-SPECIFIC TABLES
-- ================================================================

-- Create AI interaction logs table
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_chat_id UUID REFERENCES whatsapp_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  thread_id VARCHAR NOT NULL,
  processing_time_ms INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  response_style VARCHAR DEFAULT 'helpful',
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create AI configuration templates table
CREATE TABLE IF NOT EXISTS ai_config_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create AI usage analytics table
CREATE TABLE IF NOT EXISTS ai_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_interactions INTEGER DEFAULT 0,
  avg_processing_time_ms FLOAT DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  unique_chats INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- PHASE 3: UPDATE EXISTING DATA
-- ================================================================

-- Update sender_type for existing admin messages
UPDATE messages 
SET sender_type = 'admin' 
WHERE sender_type = 'user' AND admin_id IS NOT NULL;

-- Update sender_type for user messages (ensure they're marked as 'user')
UPDATE messages 
SET sender_type = 'user' 
WHERE sender_type IS NULL OR sender_type = '';

-- ================================================================
-- PHASE 4: CREATE INDEXES FOR PERFORMANCE
-- ================================================================

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_ai_enabled 
ON whatsapp_chats(ai_enabled) WHERE ai_enabled = true;

CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_ai_thread 
ON whatsapp_chats(ai_thread_id) WHERE ai_thread_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_sender_type 
ON messages(sender_type);

CREATE INDEX IF NOT EXISTS idx_messages_ai_triggered 
ON messages(is_ai_triggered) WHERE is_ai_triggered = true;

CREATE INDEX IF NOT EXISTS idx_ai_interactions_chat_user 
ON ai_interactions(whatsapp_chat_id, user_id);

CREATE INDEX IF NOT EXISTS idx_ai_interactions_thread 
ON ai_interactions(thread_id);

CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at 
ON ai_interactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_analytics_date 
ON ai_usage_analytics(date DESC);

-- ================================================================
-- PHASE 5: CREATE FUNCTIONS AND TRIGGERS
-- ================================================================

-- Function to update ai_usage_analytics daily
CREATE OR REPLACE FUNCTION update_ai_usage_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ai_usage_analytics (
    date,
    total_interactions,
    avg_processing_time_ms,
    total_tokens_used,
    unique_users,
    unique_chats,
    success_rate
  )
  SELECT 
    CURRENT_DATE,
    COUNT(*),
    AVG(processing_time_ms),
    SUM(tokens_used),
    COUNT(DISTINCT user_id),
    COUNT(DISTINCT whatsapp_chat_id),
    AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) * 100
  FROM ai_interactions 
  WHERE DATE(created_at) = CURRENT_DATE
  ON CONFLICT (date) DO UPDATE SET
    total_interactions = EXCLUDED.total_interactions,
    avg_processing_time_ms = EXCLUDED.avg_processing_time_ms,
    total_tokens_used = EXCLUDED.total_tokens_used,
    unique_users = EXCLUDED.unique_users,
    unique_chats = EXCLUDED.unique_chats,
    success_rate = EXCLUDED.success_rate;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update analytics
DROP TRIGGER IF EXISTS trigger_update_ai_analytics ON ai_interactions;
CREATE TRIGGER trigger_update_ai_analytics
  AFTER INSERT ON ai_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_usage_analytics();

-- Function to clean old AI interactions (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_ai_interactions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_interactions 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- PHASE 6: INSERT DEFAULT CONFIGURATION TEMPLATES
-- ================================================================

-- Insert default AI configuration templates
INSERT INTO ai_config_templates (name, description, config, is_default) VALUES
(
  'Helpful Assistant',
  'Balanced, friendly responses with good detail',
  '{"enabled": true, "response_style": "helpful", "auto_respond": false, "max_response_time": 10000}'::jsonb,
  true
),
(
  'Concise Responses',
  'Quick, brief responses for busy users',
  '{"enabled": true, "response_style": "concise", "auto_respond": false, "max_response_time": 5000}'::jsonb,
  false
),
(
  'Detailed Expert',
  'Comprehensive, thorough responses with explanations',
  '{"enabled": true, "response_style": "detailed", "auto_respond": false, "max_response_time": 15000}'::jsonb,
  false
),
(
  'Auto-Responsive',
  'Automatically responds to grocery-related questions',
  '{"enabled": true, "response_style": "helpful", "auto_respond": true, "keywords": ["grocery", "food", "price", "shop", "buy", "discount"]}'::jsonb,
  false
)
ON CONFLICT DO NOTHING;

-- ================================================================
-- PHASE 7: CREATE VIEWS FOR EASY QUERYING
-- ================================================================

-- View for AI chat statistics
CREATE OR REPLACE VIEW ai_chat_stats AS
SELECT 
  wc.id as chat_id,
  wc.contact_phone_number,
  wc.ai_enabled,
  wc.ai_config,
  COUNT(ai.id) as total_interactions,
  AVG(ai.processing_time_ms) as avg_response_time,
  SUM(ai.tokens_used) as total_tokens,
  MAX(ai.created_at) as last_interaction,
  AVG(CASE WHEN ai.success THEN 1.0 ELSE 0.0 END) * 100 as success_rate
FROM whatsapp_chats wc
LEFT JOIN ai_interactions ai ON wc.id = ai.whatsapp_chat_id
WHERE wc.ai_enabled = true
GROUP BY wc.id, wc.contact_phone_number, wc.ai_enabled, wc.ai_config;

-- View for recent AI activity
CREATE OR REPLACE VIEW recent_ai_activity AS
SELECT 
  ai.id,
  ai.user_message,
  ai.ai_response,
  ai.processing_time_ms,
  ai.tokens_used,
  ai.success,
  ai.created_at,
  wc.contact_phone_number,
  cp.name as user_name
FROM ai_interactions ai
JOIN whatsapp_chats wc ON ai.whatsapp_chat_id = wc.id
LEFT JOIN crm_profiles cp ON ai.user_id = cp.id
ORDER BY ai.created_at DESC;

-- ================================================================
-- PHASE 8: SET UP ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on AI tables
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_config_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Policy for ai_interactions (admin access only)
CREATE POLICY "Admin can access AI interactions" ON ai_interactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy for ai_config_templates (admin access only)
CREATE POLICY "Admin can manage AI config templates" ON ai_config_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy for ai_usage_analytics (admin read-only)
CREATE POLICY "Admin can read AI analytics" ON ai_usage_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- ================================================================
-- PHASE 9: VERIFICATION QUERIES
-- ================================================================

-- Verify the migration was successful
DO $$
BEGIN
  -- Check if new columns exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_chats' AND column_name = 'ai_enabled'
  ) THEN
    RAISE NOTICE '✅ AI columns added to whatsapp_chats table';
  ELSE
    RAISE EXCEPTION '❌ Failed to add AI columns to whatsapp_chats table';
  END IF;

  -- Check if AI tables exist
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'ai_interactions'
  ) THEN
    RAISE NOTICE '✅ ai_interactions table created';
  ELSE
    RAISE EXCEPTION '❌ Failed to create ai_interactions table';
  END IF;

  -- Check if indexes exist
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_whatsapp_chats_ai_enabled'
  ) THEN
    RAISE NOTICE '✅ AI performance indexes created';
  ELSE
    RAISE EXCEPTION '❌ Failed to create AI performance indexes';
  END IF;

  RAISE NOTICE '🎉 AI migration completed successfully!';
  RAISE NOTICE '📊 You can now enable AI for WhatsApp chats in the admin panel';
  RAISE NOTICE '🤖 Users can trigger AI responses with @bb in their messages';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================

-- Summary of what was added:
-- 1. ✅ AI columns to whatsapp_chats table
-- 2. ✅ AI indicators to messages table  
-- 3. ✅ ai_interactions table for logging
-- 4. ✅ ai_config_templates for reusable configs
-- 5. ✅ ai_usage_analytics for tracking metrics
-- 6. ✅ Performance indexes for fast queries
-- 7. ✅ Automated analytics functions and triggers
-- 8. ✅ Helpful views for easy data access
-- 9. ✅ Row Level Security policies
-- 10. ✅ Default configuration templates

-- Next steps:
-- 1. Set up environment variables in your .env.local
-- 2. Test the AI connection in the admin panel
-- 3. Enable AI for a test chat
-- 4. Send a message with @bb to test functionality 