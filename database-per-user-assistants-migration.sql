-- ===================================================
-- BargainB Per-User Assistants Migration
-- Phase 1: Database Schema Update
-- ===================================================

-- Add assistant-related columns to conversations table
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS assistant_id UUID,
ADD COLUMN IF NOT EXISTS assistant_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assistant_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS assistant_name TEXT,
ADD COLUMN IF NOT EXISTS assistant_metadata JSONB DEFAULT '{}';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_assistant_id ON public.conversations(assistant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_assistant_created_at ON public.conversations(assistant_created_at);

-- Add comments for documentation
COMMENT ON COLUMN public.conversations.assistant_id IS 'UUID of the LangGraph assistant created for this conversation';
COMMENT ON COLUMN public.conversations.assistant_created_at IS 'Timestamp when the assistant was created';
COMMENT ON COLUMN public.conversations.assistant_config IS 'Configuration specific to this assistant instance';
COMMENT ON COLUMN public.conversations.assistant_name IS 'Human-readable name for the assistant';
COMMENT ON COLUMN public.conversations.assistant_metadata IS 'Additional metadata for the assistant (user preferences, etc.)';

-- Optional: Create a view for assistant management
CREATE OR REPLACE VIEW public.conversation_assistants AS
SELECT 
    c.id as conversation_id,
    c.whatsapp_contact_id,
    c.whatsapp_conversation_id,
    c.assistant_id,
    c.assistant_name,
    c.assistant_created_at,
    c.assistant_config,
    c.assistant_metadata,
    c.ai_enabled,
    c.ai_thread_id,
    wc.phone_number,
    wc.display_name as contact_name
FROM public.conversations c
LEFT JOIN public.whatsapp_contacts wc ON c.whatsapp_contact_id = wc.id
WHERE c.assistant_id IS NOT NULL;

COMMENT ON VIEW public.conversation_assistants IS 'View showing all conversations with their associated assistants';

-- Add a function to generate assistant names
CREATE OR REPLACE FUNCTION public.generate_assistant_name(contact_phone TEXT, contact_name TEXT DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
    IF contact_name IS NOT NULL AND contact_name != '' THEN
        RETURN 'BargainB Assistant for ' || contact_name;
    ELSE
        RETURN 'BargainB Assistant for ' || contact_phone;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.generate_assistant_name IS 'Generate a human-readable name for a new assistant';

-- Optional: Add constraints
ALTER TABLE public.conversations 
ADD CONSTRAINT chk_assistant_config_is_object 
CHECK (assistant_config IS NULL OR jsonb_typeof(assistant_config) = 'object');

ALTER TABLE public.conversations 
ADD CONSTRAINT chk_assistant_metadata_is_object 
CHECK (assistant_metadata IS NULL OR jsonb_typeof(assistant_metadata) = 'object');

-- Grant necessary permissions (adjust as needed)
GRANT SELECT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT ON public.conversation_assistants TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_assistant_name TO authenticated; 