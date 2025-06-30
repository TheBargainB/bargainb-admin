-- BargainB Clean CRM Migration
-- WhatsApp-First Structure (No AI - to be added later)

-- 1. Create WhatsApp Contacts (Source of Truth)
CREATE TABLE whatsapp_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- WhatsApp Identity
  phone_number TEXT UNIQUE NOT NULL,
  whatsapp_jid TEXT UNIQUE NOT NULL,
  
  -- WhatsApp Profile Data
  push_name TEXT,
  display_name TEXT,
  profile_picture_url TEXT,
  verified_name TEXT,
  
  -- WhatsApp Status
  whatsapp_status TEXT,
  last_seen_at TIMESTAMPTZ,
  is_business_account BOOLEAN DEFAULT false,
  
  -- Raw WhatsApp Data (for future AI)
  raw_contact_data JSONB DEFAULT '{}',
  
  -- Sync Status
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Conversations (Clean Chat System)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_contact_id UUID NOT NULL REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
  
  -- Conversation Identity
  whatsapp_conversation_id TEXT UNIQUE NOT NULL,
  
  -- Conversation State
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  conversation_type TEXT DEFAULT 'customer_support',
  
  -- Conversation Metadata
  title TEXT,
  description TEXT,
  
  -- Analytics
  total_messages INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Messages (Clean Message Storage)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Message Identity
  whatsapp_message_id TEXT UNIQUE NOT NULL,
  
  -- Message Content
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'document', 'system')),
  media_url TEXT,
  
  -- Direction
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_me BOOLEAN NOT NULL,
  
  -- WhatsApp Status
  whatsapp_status TEXT CHECK (whatsapp_status IN ('sent', 'delivered', 'read', 'failed')),
  
  -- Raw Data (for future AI processing)
  raw_message_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create CRM Profiles (Customer Intelligence Layer)
CREATE TABLE crm_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_contact_id UUID UNIQUE NOT NULL REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
  
  -- Basic CRM Data
  email TEXT,
  full_name TEXT,
  preferred_name TEXT,
  date_of_birth DATE,
  
  -- Customer Journey
  lifecycle_stage TEXT DEFAULT 'prospect' CHECK (lifecycle_stage IN (
    'prospect', 'lead', 'onboarding', 'customer', 'vip', 'churned', 'blocked'
  )),
  customer_since TIMESTAMPTZ,
  
  -- Grocery Profile (Your Business Core)
  preferred_stores TEXT[] DEFAULT '{}',
  shopping_persona TEXT CHECK (shopping_persona IN ('healthHero', 'ecoShopper', 'sensitiveStomach', 'budgetSaver', 'convenienceShopper')),
  dietary_restrictions TEXT[] DEFAULT '{}',
  budget_range NUMRANGE, -- e.g., [50, 150) weekly budget
  shopping_frequency TEXT CHECK (shopping_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  
  -- Engagement Data
  engagement_score NUMERIC DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  avg_response_time_hours NUMERIC,
  
  -- Preferences
  communication_style TEXT CHECK (communication_style IN ('formal', 'casual', 'emoji_heavy')),
  response_time_preference TEXT CHECK (response_time_preference IN ('immediate', 'same_day', 'flexible')),
  notification_preferences JSONB DEFAULT '{}',
  
  -- Business Intelligence
  product_interests TEXT[] DEFAULT '{}',
  price_sensitivity TEXT CHECK (price_sensitivity IN ('high', 'medium', 'low')),
  complaint_count INTEGER DEFAULT 0,
  compliment_count INTEGER DEFAULT 0,
  
  -- Notes & Tags
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create Grocery Lists (Shopping Intelligence)
CREATE TABLE grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_profile_id UUID NOT NULL REFERENCES crm_profiles(id) ON DELETE CASCADE,
  
  -- List Details
  list_name TEXT DEFAULT 'My Grocery List',
  products JSONB NOT NULL DEFAULT '[]', -- [{"name": "Milk", "quantity": 2, "store": "AH", "estimated_price": 1.50}]
  estimated_total NUMERIC,
  actual_total NUMERIC,
  
  -- Shopping Details
  preferred_store TEXT,
  shopping_date DATE,
  
  -- List Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  
  -- Smart Features (for future)
  is_template BOOLEAN DEFAULT false,
  auto_reorder_enabled BOOLEAN DEFAULT false,
  reorder_frequency TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create Customer Events (Journey Tracking)
CREATE TABLE customer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_profile_id UUID NOT NULL REFERENCES crm_profiles(id) ON DELETE CASCADE,
  
  -- Event Details
  event_type TEXT NOT NULL, -- 'first_contact', 'onboarding_completed', 'first_purchase', 'complaint', etc.
  event_description TEXT,
  event_data JSONB DEFAULT '{}',
  
  -- Event Context
  conversation_id UUID REFERENCES conversations(id),
  message_id UUID REFERENCES messages(id),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Add Indexes for Performance
CREATE INDEX idx_whatsapp_contacts_phone ON whatsapp_contacts(phone_number);
CREATE INDEX idx_whatsapp_contacts_jid ON whatsapp_contacts(whatsapp_jid);
CREATE INDEX idx_whatsapp_contacts_active ON whatsapp_contacts(is_active) WHERE is_active = true;

CREATE INDEX idx_conversations_contact ON conversations(whatsapp_contact_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_direction ON messages(direction);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_whatsapp_id ON messages(whatsapp_message_id);

CREATE INDEX idx_crm_profiles_contact ON crm_profiles(whatsapp_contact_id);
CREATE INDEX idx_crm_profiles_lifecycle ON crm_profiles(lifecycle_stage);
CREATE INDEX idx_crm_profiles_persona ON crm_profiles(shopping_persona);
CREATE INDEX idx_crm_profiles_stores ON crm_profiles USING GIN(preferred_stores);
CREATE INDEX idx_crm_profiles_engagement ON crm_profiles(engagement_score DESC);

CREATE INDEX idx_grocery_lists_profile ON grocery_lists(crm_profile_id);
CREATE INDEX idx_grocery_lists_status ON grocery_lists(status);

CREATE INDEX idx_customer_events_profile ON customer_events(crm_profile_id);
CREATE INDEX idx_customer_events_type ON customer_events(event_type);
CREATE INDEX idx_customer_events_created ON customer_events(created_at DESC);

-- 8. Create Data Migration Function
CREATE OR REPLACE FUNCTION migrate_existing_data() RETURNS void AS $$
BEGIN
  -- Migrate from chat_users to whatsapp_contacts
  INSERT INTO whatsapp_contacts (
    phone_number, whatsapp_jid, push_name, display_name, 
    profile_picture_url, verified_name, raw_contact_data, created_at
  )
  SELECT 
    phone_number,
    phone_number || '@s.whatsapp.net' as whatsapp_jid,
    full_name as push_name,
    display_name,
    avatar_url as profile_picture_url,
    verified_name,
    jsonb_build_object(
      'contact_data', contact_data,
      'onboarding_data', onboarding_data,
      'profile_data', profile_data
    ) as raw_contact_data,
    created_at
  FROM chat_users 
  WHERE phone_number IS NOT NULL
  ON CONFLICT (phone_number) DO NOTHING;

  -- Migrate conversations
  INSERT INTO conversations (
    whatsapp_contact_id, whatsapp_conversation_id, title, description,
    total_messages, last_message_at, created_at
  )
  SELECT 
    wc.id as whatsapp_contact_id,
    cc.id::text as whatsapp_conversation_id,
    cc.title,
    cc.description,
    COALESCE((SELECT COUNT(*) FROM chat_messages cm WHERE cm.conversation_id = cc.id), 0) as total_messages,
    COALESCE(cc.last_message_at, cc.created_at) as last_message_at,
    cc.created_at
  FROM chat_conversations cc
  JOIN chat_conversation_participants ccp ON cc.id = ccp.conversation_id
  JOIN chat_users cu ON ccp.user_id = cu.id
  JOIN whatsapp_contacts wc ON cu.phone_number = wc.phone_number
  WHERE cu.role = 'customer'
  ON CONFLICT (whatsapp_conversation_id) DO NOTHING;

  -- Migrate messages
  INSERT INTO messages (
    conversation_id, whatsapp_message_id, content, message_type,
    direction, from_me, whatsapp_status, raw_message_data, created_at
  )
  SELECT 
    c.id as conversation_id,
    cm.id::text as whatsapp_message_id,
    cm.content,
    cm.type as message_type,
    CASE WHEN cm.sender_id IS NULL THEN 'inbound' ELSE 'outbound' END as direction,
    CASE WHEN cm.sender_id IS NULL THEN false ELSE true END as from_me,
    cm.status as whatsapp_status,
    jsonb_build_object(
      'metadata', cm.metadata,
      'product_references', cm.product_references
    ) as raw_message_data,
    cm.created_at
  FROM chat_messages cm
  JOIN conversations c ON cm.conversation_id::text = c.whatsapp_conversation_id
  ON CONFLICT (whatsapp_message_id) DO NOTHING;

  -- Create CRM profiles for all WhatsApp contacts
  INSERT INTO crm_profiles (
    whatsapp_contact_id, full_name, preferred_name, preferred_stores,
    shopping_persona, lifecycle_stage, customer_since, created_at
  )
  SELECT 
    wc.id,
    wc.push_name as full_name,
    wc.display_name as preferred_name,
    COALESCE(cu.stores, '{}') as preferred_stores,
    cu.persona_id as shopping_persona,
    CASE 
      WHEN cu.phone_number IS NOT NULL THEN 'customer'
      ELSE 'prospect'
    END as lifecycle_stage,
    wc.created_at as customer_since,
    wc.created_at
  FROM whatsapp_contacts wc
  LEFT JOIN chat_users cu ON wc.phone_number = cu.phone_number
  ON CONFLICT (whatsapp_contact_id) DO NOTHING;

  -- Migrate onboarding data from legacy tables
  UPDATE crm_profiles SET
    preferred_stores = wo.stores,
    shopping_persona = wo.persona,
    lifecycle_stage = 'customer'
  FROM whats_app_onboarding wo
  JOIN whatsapp_contacts wc ON wo.phone_number = wc.phone_number
  WHERE crm_profiles.whatsapp_contact_id = wc.id;

  -- Update engagement scores
  UPDATE crm_profiles SET
    total_conversations = (
      SELECT COUNT(*) FROM conversations c WHERE c.whatsapp_contact_id = crm_profiles.whatsapp_contact_id
    ),
    total_messages = (
      SELECT COUNT(*) 
      FROM messages m 
      JOIN conversations c ON m.conversation_id = c.id 
      WHERE c.whatsapp_contact_id = crm_profiles.whatsapp_contact_id
    ),
    engagement_score = (
      SELECT COUNT(*) * 1.0 / GREATEST(1, DATE_PART('day', now() - MIN(m.created_at)))
      FROM messages m 
      JOIN conversations c ON m.conversation_id = c.id 
      WHERE c.whatsapp_contact_id = crm_profiles.whatsapp_contact_id
    );

END;
$$ LANGUAGE plpgsql;

-- 9. Create CRM Views
CREATE VIEW customer_360 AS
SELECT 
  wc.id as contact_id,
  wc.phone_number,
  wc.push_name as whatsapp_name,
  wc.profile_picture_url,
  wc.last_seen_at,
  
  crm.full_name,
  crm.preferred_name,
  crm.email,
  crm.lifecycle_stage,
  crm.shopping_persona,
  crm.preferred_stores,
  crm.dietary_restrictions,
  crm.engagement_score,
  crm.total_conversations,
  crm.total_messages,
  crm.customer_since,
  
  -- Recent activity
  (SELECT MAX(created_at) FROM messages m 
   JOIN conversations c ON m.conversation_id = c.id 
   WHERE c.whatsapp_contact_id = wc.id) as last_message_at,
   
  -- Grocery lists
  (SELECT COUNT(*) FROM grocery_lists gl WHERE gl.crm_profile_id = crm.id) as grocery_lists_count,
  
  -- Engagement status
  CASE 
    WHEN wc.last_seen_at > now() - interval '7 days' THEN 'highly_active'
    WHEN wc.last_seen_at > now() - interval '30 days' THEN 'active'
    WHEN wc.last_seen_at > now() - interval '90 days' THEN 'dormant'
    ELSE 'churned'
  END as engagement_status
  
FROM whatsapp_contacts wc
LEFT JOIN crm_profiles crm ON wc.id = crm.whatsapp_contact_id
WHERE wc.is_active = true
ORDER BY crm.engagement_score DESC NULLS LAST;

-- 10. Create Analytics View
CREATE VIEW crm_analytics AS
SELECT 
  -- Lifecycle distribution
  lifecycle_stage,
  COUNT(*) as customer_count,
  AVG(engagement_score) as avg_engagement,
  
  -- Shopping persona distribution
  shopping_persona,
  COUNT(*) FILTER (WHERE shopping_persona IS NOT NULL) as persona_count,
  
  -- Store preferences
  unnest(preferred_stores) as store,
  COUNT(*) as store_preference_count
  
FROM crm_profiles
WHERE whatsapp_contact_id IN (SELECT id FROM whatsapp_contacts WHERE is_active = true)
GROUP BY GROUPING SETS (
  (lifecycle_stage),
  (shopping_persona), 
  (unnest(preferred_stores))
);

-- Execute migration
SELECT migrate_existing_data(); 