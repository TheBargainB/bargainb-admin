-- BargainB User Data Consolidation Migration
-- Consolidates: early_access_users, bb_whatsapp_onboardings, whats_app_onboarding, chat_users, contacts

-- 1. Create the unified users table
CREATE TABLE IF NOT EXISTS unified_users (
  -- Core Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id),
  
  -- Contact Information  
  email TEXT UNIQUE,
  phone_number TEXT UNIQUE,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  
  -- User Lifecycle Status
  lifecycle_stage TEXT CHECK (lifecycle_stage IN (
    'waitlist', 'approved', 'onboarding', 'active', 'churned', 'blocked'
  )) DEFAULT 'waitlist',
  
  -- Grocery Shopping Profile
  preferred_stores TEXT[] DEFAULT '{}',
  shopping_persona TEXT,
  dietary_restrictions TEXT[] DEFAULT '{}',
  favorite_products TEXT[] DEFAULT '{}',
  
  -- Platform Data
  notification_settings JSONB DEFAULT '{}',
  whatsapp_data JSONB DEFAULT '{}',
  onboarding_data JSONB DEFAULT '{}',
  
  -- Engagement Analytics
  last_active_at TIMESTAMPTZ,
  total_messages_sent INTEGER DEFAULT 0,
  total_messages_received INTEGER DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  
  -- Journey Timestamps
  waitlist_joined_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  onboarding_started_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  first_chat_at TIMESTAMPTZ,
  
  -- System Fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Migration Function to Consolidate Users
CREATE OR REPLACE FUNCTION consolidate_user_data() RETURNS void AS $$
BEGIN
  -- Insert from early_access_users (waitlist)
  INSERT INTO unified_users (
    auth_user_id, email, phone_number, full_name, 
    lifecycle_stage, waitlist_joined_at, created_at
  )
  SELECT 
    auth_user_id,
    email,
    phone,
    TRIM(first_name || ' ' || COALESCE(last_name, '')),
    CASE 
      WHEN status = 'approved' THEN 'approved'
      ELSE 'waitlist'
    END,
    created_at,
    created_at
  FROM early_access_users
  ON CONFLICT (phone_number) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(unified_users.full_name, EXCLUDED.full_name),
    lifecycle_stage = CASE 
      WHEN EXCLUDED.lifecycle_stage = 'approved' THEN 'approved'
      ELSE unified_users.lifecycle_stage
    END,
    waitlist_joined_at = COALESCE(unified_users.waitlist_joined_at, EXCLUDED.waitlist_joined_at);

  -- Merge bb_whatsapp_onboardings (current onboarding system)
  INSERT INTO unified_users (
    auth_user_id, phone_number, full_name, preferred_stores, 
    shopping_persona, lifecycle_stage, onboarding_started_at, created_at
  )
  SELECT 
    user_id,
    phone_number,
    full_name,
    stores,
    persona_id,
    'onboarding',
    created_at,
    created_at
  FROM bb_whatsapp_onboardings
  ON CONFLICT (phone_number) DO UPDATE SET
    auth_user_id = COALESCE(unified_users.auth_user_id, EXCLUDED.auth_user_id),
    full_name = COALESCE(unified_users.full_name, EXCLUDED.full_name),
    preferred_stores = COALESCE(NULLIF(unified_users.preferred_stores, '{}'), EXCLUDED.preferred_stores),
    shopping_persona = COALESCE(unified_users.shopping_persona, EXCLUDED.shopping_persona),
    lifecycle_stage = CASE 
      WHEN unified_users.lifecycle_stage IN ('waitlist', 'approved') THEN 'onboarding'
      ELSE unified_users.lifecycle_stage
    END,
    onboarding_started_at = COALESCE(unified_users.onboarding_started_at, EXCLUDED.onboarding_started_at);

  -- Merge whats_app_onboarding (legacy onboarding system)
  INSERT INTO unified_users (
    phone_number, full_name, preferred_stores, shopping_persona, 
    favorite_products, lifecycle_stage, onboarding_completed_at, created_at
  )
  SELECT 
    phone_number,
    full_name,
    stores,
    persona,
    grocery_products,
    'active',
    created_at,
    created_at
  FROM whats_app_onboarding
  ON CONFLICT (phone_number) DO UPDATE SET
    full_name = COALESCE(unified_users.full_name, EXCLUDED.full_name),
    preferred_stores = COALESCE(NULLIF(unified_users.preferred_stores, '{}'), EXCLUDED.preferred_stores),
    shopping_persona = COALESCE(unified_users.shopping_persona, EXCLUDED.shopping_persona),
    favorite_products = COALESCE(NULLIF(unified_users.favorite_products, '{}'), EXCLUDED.favorite_products),
    lifecycle_stage = 'active',
    onboarding_completed_at = COALESCE(unified_users.onboarding_completed_at, EXCLUDED.onboarding_completed_at);

  -- Merge chat_users (active WhatsApp users)
  INSERT INTO unified_users (
    phone_number, full_name, display_name, avatar_url,
    whatsapp_data, preferred_stores, shopping_persona,
    lifecycle_stage, first_chat_at, last_active_at, created_at
  )
  SELECT 
    phone_number,
    full_name,
    display_name,
    avatar_url,
    jsonb_build_object(
      'contact_data', contact_data,
      'onboarding_data', onboarding_data,
      'profile_data', profile_data
    ),
    COALESCE(stores, '{}'),
    persona_id,
    'active',
    created_at,
    last_seen,
    created_at
  FROM chat_users
  WHERE phone_number IS NOT NULL
  ON CONFLICT (phone_number) DO UPDATE SET
    full_name = COALESCE(unified_users.full_name, EXCLUDED.full_name),
    display_name = COALESCE(unified_users.display_name, EXCLUDED.display_name),
    avatar_url = COALESCE(unified_users.avatar_url, EXCLUDED.avatar_url),
    whatsapp_data = unified_users.whatsapp_data || EXCLUDED.whatsapp_data,
    preferred_stores = COALESCE(NULLIF(unified_users.preferred_stores, '{}'), EXCLUDED.preferred_stores),
    shopping_persona = COALESCE(unified_users.shopping_persona, EXCLUDED.shopping_persona),
    lifecycle_stage = 'active',
    first_chat_at = COALESCE(unified_users.first_chat_at, EXCLUDED.first_chat_at),
    last_active_at = GREATEST(COALESCE(unified_users.last_active_at, '1970-01-01'), COALESCE(EXCLUDED.last_active_at, '1970-01-01'));

  -- Update engagement scores from chat_messages
  UPDATE unified_users SET
    total_messages_received = (
      SELECT COUNT(*) 
      FROM chat_messages cm 
      JOIN chat_users cu ON cm.sender_id = cu.id 
      WHERE cu.phone_number = unified_users.phone_number
    ),
    engagement_score = (
      SELECT COUNT(*) * 1.0 / GREATEST(1, DATE_PART('day', now() - MIN(cm.created_at)))
      FROM chat_messages cm 
      JOIN chat_users cu ON cm.sender_id = cu.id 
      WHERE cu.phone_number = unified_users.phone_number
    )
  WHERE phone_number IS NOT NULL;

END;
$$ LANGUAGE plpgsql;

-- 3. Create supporting tables
CREATE TABLE IF NOT EXISTS user_grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES unified_users(id) ON DELETE CASCADE,
  
  list_name TEXT DEFAULT 'My Grocery List',
  products JSONB DEFAULT '[]',
  estimated_budget NUMERIC,
  preferred_store TEXT,
  
  auto_reorder_enabled BOOLEAN DEFAULT false,
  price_alert_threshold NUMERIC,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_journey_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES unified_users(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  source_table TEXT, -- Track which original table this came from
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_unified_users_phone ON unified_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_unified_users_email ON unified_users(email);
CREATE INDEX IF NOT EXISTS idx_unified_users_lifecycle ON unified_users(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_unified_users_persona ON unified_users(shopping_persona);
CREATE INDEX IF NOT EXISTS idx_unified_users_stores ON unified_users USING GIN(preferred_stores);

-- 5. Execute the consolidation
SELECT consolidate_user_data();

-- 6. Create a view for easy CRM access
CREATE OR REPLACE VIEW crm_user_profiles AS
SELECT 
  u.id,
  u.phone_number,
  u.email,
  u.full_name,
  u.display_name,
  u.lifecycle_stage,
  u.shopping_persona,
  u.preferred_stores,
  u.favorite_products,
  u.engagement_score,
  u.total_messages_received,
  u.last_active_at,
  
  -- Journey metrics
  u.waitlist_joined_at,
  u.onboarding_completed_at,
  DATE_PART('day', u.onboarding_completed_at - u.waitlist_joined_at) as days_to_onboard,
  
  -- Engagement metrics
  CASE 
    WHEN u.last_active_at > now() - interval '7 days' THEN 'highly_active'
    WHEN u.last_active_at > now() - interval '30 days' THEN 'active'
    WHEN u.last_active_at > now() - interval '90 days' THEN 'dormant'
    ELSE 'churned'
  END as engagement_status,
  
  -- Grocery list count
  (SELECT COUNT(*) FROM user_grocery_lists ugl WHERE ugl.user_id = u.id) as grocery_lists_count
  
FROM unified_users u
WHERE u.is_active = true
ORDER BY u.engagement_score DESC; 