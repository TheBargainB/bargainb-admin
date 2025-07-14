import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { Contact, ContactFilters, ContactsResponse } from '@/types/chat-v2.types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Parse search params for filters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || undefined
    const is_active = searchParams.get('is_active') === 'true' ? true : 
                     searchParams.get('is_active') === 'false' ? false : undefined
    const has_conversations = searchParams.get('has_conversations') === 'true'
    
    const filters: ContactFilters = {
      search,
      is_active,
      has_conversations
    }

    // Start building the query
    let query = supabase
      .from('whatsapp_contacts')
      .select(`
        *,
        crm_profiles!crm_profiles_whatsapp_contact_id_fkey (
          id,
          full_name,
          preferred_name,
          email,
          notes,
          tags,
          lifecycle_stage,
          engagement_score,
          total_conversations,
          total_messages
        )
      `)
      .order('created_at', { ascending: false })

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.trim()
      query = query.or(`display_name.ilike.%${searchTerm}%,push_name.ilike.%${searchTerm}%,verified_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`)
    }

    // Apply active filter
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    // Apply has conversations filter
    if (filters.has_conversations) {
      // This would require a join with conversations table
      // For now, we'll handle this in the application layer
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching contacts:', error)
      return NextResponse.json(
        { error: `Failed to fetch contacts: ${error.message}` },
        { status: 500 }
      )
    }

    // Transform data to match our clean types
    const contacts: Contact[] = (data || []).map((contact: any) => ({
      id: contact.id,
      phone_number: contact.phone_number,
      whatsapp_jid: contact.whatsapp_jid,
      display_name: contact.display_name || undefined,
      push_name: contact.push_name || undefined,
      verified_name: contact.verified_name || undefined,
      profile_picture_url: contact.profile_picture_url || undefined,
      is_active: contact.is_active || false,
      last_seen_at: contact.last_seen_at || undefined,
      created_at: contact.created_at || new Date().toISOString(),
      updated_at: contact.updated_at || undefined,
      
      // Add CRM profile data if available
      crm_profile: contact.crm_profiles ? {
        id: contact.crm_profiles.id,
        full_name: contact.crm_profiles.full_name || undefined,
        preferred_name: contact.crm_profiles.preferred_name || undefined,
        email: contact.crm_profiles.email || undefined,
        notes: contact.crm_profiles.notes || undefined,
        tags: contact.crm_profiles.tags || undefined,
        lifecycle_stage: contact.crm_profiles.lifecycle_stage || undefined,
        engagement_score: contact.crm_profiles.engagement_score || undefined,
        total_conversations: contact.crm_profiles.total_conversations || undefined,
        total_messages: contact.crm_profiles.total_messages || undefined
      } : undefined
    }))

    const response: ContactsResponse = {
      contacts,
      total_count: contacts.length
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error in contacts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 