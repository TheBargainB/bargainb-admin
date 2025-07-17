import { createClient } from '@/utils/supabase/client'
import type { 
  Contact, 
  ContactInsert, 
  ContactUpdate, 
  ContactFilters,
  ContactsResponse,
  CrmProfile
} from '@/types/chat-v2.types'

const supabase = createClient()

// =============================================================================
// FETCH CONTACTS
// =============================================================================

export async function getContacts(
  filters: ContactFilters = {}
): Promise<ContactsResponse> {
  try {
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
      throw new Error(`Failed to fetch contacts: ${error.message}`)
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

    return {
      contacts,
      total_count: contacts.length
    }

  } catch (error) {
    console.error('❌ Error in getContacts:', error)
    throw error
  }
}

// =============================================================================
// GET CONTACT BY ID
// =============================================================================

export async function getContactById(contactId: string): Promise<Contact | null> {
  try {
    const { data, error } = await supabase
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
      .eq('id', contactId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Contact not found
      }
      console.error('❌ Error fetching contact:', error)
      throw new Error(`Failed to fetch contact: ${error.message}`)
    }

    if (!data) return null

    // Transform to clean type
    const contact: Contact = {
      id: data.id,
      phone_number: data.phone_number,
      whatsapp_jid: data.whatsapp_jid,
      display_name: data.display_name || undefined,
      push_name: data.push_name || undefined,
      verified_name: data.verified_name || undefined,
      profile_picture_url: data.profile_picture_url || undefined,
      is_active: data.is_active || false,
      last_seen_at: data.last_seen_at || undefined,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || undefined,
      
      crm_profile: data.crm_profiles ? {
        id: data.crm_profiles.id,
        full_name: data.crm_profiles.full_name || undefined,
        preferred_name: data.crm_profiles.preferred_name || undefined,
        email: data.crm_profiles.email || undefined,
        notes: data.crm_profiles.notes || undefined,
        tags: data.crm_profiles.tags || undefined,
        lifecycle_stage: data.crm_profiles.lifecycle_stage || undefined,
        engagement_score: data.crm_profiles.engagement_score || undefined,
        total_conversations: data.crm_profiles.total_conversations || undefined,
        total_messages: data.crm_profiles.total_messages || undefined
      } : undefined
    }

    return contact

  } catch (error) {
    console.error('❌ Error in getContactById:', error)
    throw error
  }
}

// =============================================================================
// GET CONTACT BY PHONE NUMBER
// =============================================================================

export async function getContactByPhone(phoneNumber: string): Promise<Contact | null> {
  try {
    // Clean the phone number - remove common WhatsApp suffixes and normalize
    const cleanPhone = phoneNumber
      .replace('@s.whatsapp.net', '')
      .replace('@c.us', '')
    
    // Try multiple variations for lookup
    const phoneVariations = [
      cleanPhone,
      cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`,
      cleanPhone.startsWith('+') ? cleanPhone.substring(1) : cleanPhone
    ]

    const { data, error } = await supabase
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
          total_messages,
          onboarding_completed,
          ai_introduction_sent,
          assistant_id
        )
      `)
      .or(`phone_number.in.(${phoneVariations.join(',')}),whatsapp_jid.eq.${cleanPhone.replace('+', '')}@s.whatsapp.net`)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Contact not found
      }
      console.error('❌ Error fetching contact by phone:', error)
      throw new Error(`Failed to fetch contact: ${error.message}`)
    }

    if (!data) return null

    // Transform to clean type (same as getContactById)
    const contact: Contact = {
      id: data.id,
      phone_number: data.phone_number,
      whatsapp_jid: data.whatsapp_jid,
      display_name: data.display_name || undefined,
      push_name: data.push_name || undefined,
      verified_name: data.verified_name || undefined,
      profile_picture_url: data.profile_picture_url || undefined,
      is_active: data.is_active || false,
      last_seen_at: data.last_seen_at || undefined,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || undefined,
      
      crm_profile: data.crm_profiles ? {
        id: data.crm_profiles.id,
        full_name: data.crm_profiles.full_name || undefined,
        preferred_name: data.crm_profiles.preferred_name || undefined,
        email: data.crm_profiles.email || undefined,
        notes: data.crm_profiles.notes || undefined,
        tags: data.crm_profiles.tags || undefined,
        lifecycle_stage: data.crm_profiles.lifecycle_stage || undefined,
        engagement_score: data.crm_profiles.engagement_score || undefined,
        total_conversations: data.crm_profiles.total_conversations || undefined,
        total_messages: data.crm_profiles.total_messages || undefined,
        onboarding_completed: data.crm_profiles.onboarding_completed || false,
        ai_introduction_sent: data.crm_profiles.ai_introduction_sent || false,
        assistant_id: data.crm_profiles.assistant_id || undefined
      } : undefined
    }

    return contact

  } catch (error) {
    console.error('❌ Error in getContactByPhone:', error)
    throw error
  }
}

// =============================================================================
// CREATE CONTACT
// =============================================================================

export async function createContact(contactData: ContactInsert): Promise<Contact> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_contacts')
      .insert(contactData)
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
      .single()

    if (error) {
      console.error('❌ Error creating contact:', error)
      throw new Error(`Failed to create contact: ${error.message}`)
    }

    if (!data) {
      throw new Error('No data returned from contact creation')
    }

    // Transform to clean type
    const contact: Contact = {
      id: data.id,
      phone_number: data.phone_number,
      whatsapp_jid: data.whatsapp_jid,
      display_name: data.display_name || undefined,
      push_name: data.push_name || undefined,
      verified_name: data.verified_name || undefined,
      profile_picture_url: data.profile_picture_url || undefined,
      is_active: data.is_active || false,
      last_seen_at: data.last_seen_at || undefined,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || undefined,
      
      crm_profile: data.crm_profiles ? {
        id: data.crm_profiles.id,
        full_name: data.crm_profiles.full_name || undefined,
        preferred_name: data.crm_profiles.preferred_name || undefined,
        email: data.crm_profiles.email || undefined,
        notes: data.crm_profiles.notes || undefined,
        tags: data.crm_profiles.tags || undefined,
        lifecycle_stage: data.crm_profiles.lifecycle_stage || undefined,
        engagement_score: data.crm_profiles.engagement_score || undefined,
        total_conversations: data.crm_profiles.total_conversations || undefined,
        total_messages: data.crm_profiles.total_messages || undefined
      } : undefined
    }

    console.log('✅ Contact created:', contact.id)
    return contact

  } catch (error) {
    console.error('❌ Error in createContact:', error)
    throw error
  }
}

// =============================================================================
// UPDATE CONTACT
// =============================================================================

export async function updateContact(
  contactId: string,
  updates: ContactUpdate
): Promise<Contact> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_contacts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', contactId)
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
      .single()

    if (error) {
      console.error('❌ Error updating contact:', error)
      throw new Error(`Failed to update contact: ${error.message}`)
    }

    if (!data) {
      throw new Error('Contact not found')
    }

    // Transform to clean type
    const contact: Contact = {
      id: data.id,
      phone_number: data.phone_number,
      whatsapp_jid: data.whatsapp_jid,
      display_name: data.display_name || undefined,
      push_name: data.push_name || undefined,
      verified_name: data.verified_name || undefined,
      profile_picture_url: data.profile_picture_url || undefined,
      is_active: data.is_active || false,
      last_seen_at: data.last_seen_at || undefined,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || undefined,
      
      crm_profile: data.crm_profiles ? {
        id: data.crm_profiles.id,
        full_name: data.crm_profiles.full_name || undefined,
        preferred_name: data.crm_profiles.preferred_name || undefined,
        email: data.crm_profiles.email || undefined,
        notes: data.crm_profiles.notes || undefined,
        tags: data.crm_profiles.tags || undefined,
        lifecycle_stage: data.crm_profiles.lifecycle_stage || undefined,
        engagement_score: data.crm_profiles.engagement_score || undefined,
        total_conversations: data.crm_profiles.total_conversations || undefined,
        total_messages: data.crm_profiles.total_messages || undefined
      } : undefined
    }

    console.log('✅ Contact updated:', contact.id)
    return contact

  } catch (error) {
    console.error('❌ Error in updateContact:', error)
    throw error
  }
}

// =============================================================================
// DELETE CONTACT
// =============================================================================

export async function deleteContact(contactId: string): Promise<void> {
  try {
    console.log('🗑️ Starting comprehensive contact deletion:', contactId)
    
    // Get contact info first for logging
    const contact = await getContactById(contactId)
    if (!contact) {
      console.warn('⚠️ Contact not found for deletion:', contactId)
      return
    }
    
    // Get all conversations for this contact first
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('whatsapp_contact_id', contactId)
    
    const conversationIds = conversations?.map((c: { id: string }) => c.id) || []
    
    if (conversationIds.length > 0) {
      console.log(`🗑️ Found ${conversationIds.length} conversations for contact:`, contact.phone_number)
      
      // Step 1: Delete AI interactions (references conversations)
      console.log('🗑️ Deleting AI interactions...')
      const { error: aiError } = await supabase
        .from('ai_interactions')
        .delete()
        .in('conversation_id', conversationIds)
      
      if (aiError) {
        console.error('❌ Error deleting AI interactions:', aiError)
        // Continue with deletion, don't throw here
      }
      
      // Step 2: Delete customer events (references conversations and messages)
      console.log('🗑️ Deleting customer events...')
      const { error: eventsError } = await supabase
        .from('customer_events')
        .delete()
        .in('conversation_id', conversationIds)
      
      if (eventsError) {
        console.error('❌ Error deleting customer events:', eventsError)
        // Continue with deletion, don't throw here
      }
      
      // Step 3: Delete message truncation logs
      console.log('🗑️ Deleting message truncation logs...')
      const { error: truncationError } = await supabase
        .from('message_truncation_log')
        .delete()
        .in('conversation_id', conversationIds)
      
      if (truncationError) {
        console.error('❌ Error deleting message truncation logs:', truncationError)
        // Continue with deletion, don't throw here
      }
      
      // Step 4: Delete conversation summaries
      console.log('🗑️ Deleting conversation summaries...')
      const { error: summariesError } = await supabase
        .from('conversation_summaries')
        .delete()
        .in('conversation_id', conversationIds)
      
      if (summariesError) {
        console.error('❌ Error deleting conversation summaries:', summariesError)
        // Continue with deletion, don't throw here
      }
      
      // Step 5: Delete messages (references conversations)
      console.log('🗑️ Deleting messages...')
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
        .in('conversation_id', conversationIds)
    
    if (messagesError) {
      console.error('❌ Error deleting messages:', messagesError)
      // Continue with deletion, don't throw here
    }
    
      // Step 6: Delete conversations themselves
      console.log('🗑️ Deleting conversations...')
    const { error: conversationsError } = await supabase
      .from('conversations')
      .delete()
        .eq('whatsapp_contact_id', contactId)
    
    if (conversationsError) {
      console.error('❌ Error deleting conversations:', conversationsError)
      // Continue with deletion, don't throw here
      }
    }
    
    // Step 7: Delete CRM profile-related data if exists
    if (contact.crm_profile?.id) {
      console.log('🗑️ Deleting CRM profile-related data...')
      
      // Get all budget periods for this CRM profile
      const { data: budgetPeriods } = await supabase
        .from('budget_periods')
        .select('id')
        .eq('crm_profile_id', contact.crm_profile.id)
      
      const budgetPeriodIds = budgetPeriods?.map((bp: { id: string }) => bp.id) || []
      
      if (budgetPeriodIds.length > 0) {
        // Get all budget categories for these periods
        const { data: budgetCategories } = await supabase
          .from('budget_categories')
          .select('id')
          .in('budget_period_id', budgetPeriodIds)
        
        const budgetCategoryIds = budgetCategories?.map((bc: { id: string }) => bc.id) || []
        
        if (budgetCategoryIds.length > 0) {
          // Delete budget expenses (depends on budget_categories and grocery_lists)
          const { error: budgetExpensesError } = await supabase
            .from('budget_expenses')
            .delete()
            .in('budget_category_id', budgetCategoryIds)
        }
        
        // Delete budget categories (depends on budget_periods)
        const { error: budgetCategoriesError } = await supabase
          .from('budget_categories')
          .delete()
          .in('budget_period_id', budgetPeriodIds)
      }
      
      // Delete budget periods
      const { error: budgetPeriodsError } = await supabase
        .from('budget_periods')
        .delete()
        .eq('crm_profile_id', contact.crm_profile.id)
      
      // Delete budget savings goals
      const { error: savingsGoalsError } = await supabase
        .from('budget_savings_goals')
        .delete()
        .eq('crm_profile_id', contact.crm_profile.id)
      
      // Get all recipes created by this CRM profile
      const { data: recipes } = await supabase
        .from('recipes')
        .select('id')
        .eq('created_by', contact.crm_profile.id)
      
      const recipeIds = recipes?.map((r: { id: string }) => r.id) || []
      
      if (recipeIds.length > 0) {
        // Delete recipe ingredients (depends on recipes)
        const { error: recipeIngredientsError } = await supabase
          .from('recipe_ingredients')
          .delete()
          .in('recipe_id', recipeIds)
      }
      
      // Delete meal plans
      const { error: mealPlansError } = await supabase
        .from('meal_plans')
        .delete()
        .eq('crm_profile_id', contact.crm_profile.id)
      
      // Delete recipes
      const { error: recipesError } = await supabase
        .from('recipes')
        .delete()
        .eq('created_by', contact.crm_profile.id)
      
      // Delete grocery lists
      const { error: groceryListsError } = await supabase
        .from('grocery_lists')
        .delete()
        .eq('crm_profile_id', contact.crm_profile.id)
      
      // Delete customer events related to this CRM profile
      const { error: crmEventsError } = await supabase
        .from('customer_events')
        .delete()
        .eq('crm_profile_id', contact.crm_profile.id)
      
      // Delete CRM profile itself
      console.log('🗑️ Deleting CRM profile...')
      const { error: crmError } = await supabase
        .from('crm_profiles')
        .delete()
        .eq('id', contact.crm_profile.id)
      
      if (crmError) {
        console.error('❌ Error deleting CRM profile:', crmError)
        // Continue with deletion, don't throw here
      }
    }
    
    // Step 8: Finally delete the contact itself
    console.log('🗑️ Deleting contact record:', contact.phone_number)
    const { error: contactError } = await supabase
      .from('whatsapp_contacts')
      .delete()
      .eq('id', contactId)

    if (contactError) {
      console.error('❌ Error deleting contact:', contactError)
      throw new Error(`Failed to delete contact: ${contactError.message}`)
    }

    console.log('✅ Contact completely deleted:', contact.phone_number)

  } catch (error) {
    console.error('❌ Error in deleteContact:', error)
    throw error
  }
}

// =============================================================================
// UPSERT CONTACT (CREATE OR UPDATE)
// =============================================================================

export async function upsertContact(
  phoneNumber: string,
  contactData: Partial<ContactInsert>
): Promise<Contact> {
  try {
    // First try to find existing contact
    const existingContact = await getContactByPhone(phoneNumber)
    
    if (existingContact) {
      // Update existing contact
      const updatedContact = await updateContact(existingContact.id, contactData)
      console.log('✅ Contact updated (upsert):', updatedContact.id)
      return updatedContact
    } else {
      // Create new contact
      const newContactData: ContactInsert = {
        phone_number: phoneNumber,
        whatsapp_jid: phoneNumber.includes('@') ? phoneNumber : `${phoneNumber.replace('+', '')}@s.whatsapp.net`,
        is_active: true,
        ...contactData
      }
      
      const newContact = await createContact(newContactData)
      console.log('✅ Contact created (upsert):', newContact.id)
      return newContact
    }

  } catch (error) {
    console.error('❌ Error in upsertContact:', error)
    throw error
  }
}

// =============================================================================
// SYNC CONTACTS FROM WASENDER
// =============================================================================

export async function syncContactsFromWASender(): Promise<{
  success: boolean;
  synced_count: number;
  error?: string;
  with_images?: number;
}> {
  try {
    console.log('🔄 Starting WASender contact sync...')
    
    const apiKey = process.env.WASENDER_API_KEY
    const apiUrl = process.env.WASENDER_API_URL || 'https://www.wasenderapi.com'
    
    if (!apiKey) {
      console.error('❌ WASENDER_API_KEY not found in environment variables')
      return {
        success: false,
        synced_count: 0,
        error: 'WASender API key not configured'
      }
    }
    
    console.log('📡 Calling WASender API for contacts...')
    const response = await fetch(`${apiUrl}/api/contacts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📡 WASender API response status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ WASender API error:', errorText)
      return {
        success: false,
        synced_count: 0,
        error: `WASender API error: ${response.status} ${response.statusText}`
      }
    }
    
    const result = await response.json()
    console.log('📋 WASender contacts response received with', result.data?.length || 0, 'contacts')
    
    // WASender returns { success: true, data: [...] }
    if (!result.success || !result.data) {
      console.log('⚠️ WASender returned unsuccessful response or no data')
      return {
        success: false,
        synced_count: 0,
        error: 'No contacts received from WASender'
      }
    }

    const contactsArray = result.data.filter((contact: any) => contact.id)
    console.log('💾 Processing contacts with profile pictures...')
    
    // Process contacts in smaller batches to fetch profile pictures
    const batchSize = 5 // Small batches to avoid rate limits
    let totalStored = 0
    let totalWithImages = 0
    
    for (let i = 0; i < contactsArray.length; i += batchSize) {
      const batch = contactsArray.slice(i, i + batchSize)
      console.log(`🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(contactsArray.length/batchSize)}...`)
      
      // Process each contact in the batch
      const contactPromises = batch.map(async (contact: any) => {
        let imgUrl = contact.imgUrl || null
        // Use raw phone number (contact.id), not with @s.whatsapp.net
        const phoneNumber = contact.id.replace('@s.whatsapp.net', '')
        
        // Try to fetch profile picture from WASender API
        if (!imgUrl) {
          try {
            console.log(`📸 Fetching profile picture for: ${phoneNumber}`)
            const pictureResponse = await fetch(`${apiUrl}/api/contacts/${phoneNumber}/picture`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (pictureResponse.ok) {
              const pictureResult = await pictureResponse.json()
              if (pictureResult.success && pictureResult.data?.imgUrl) {
                imgUrl = pictureResult.data.imgUrl
                console.log(`✅ Got profile picture for ${phoneNumber}`)
              } else {
                console.log(`📷 No profile picture available for ${phoneNumber}`)
              }
            } else {
              console.warn(`⚠️ Failed to fetch profile picture for ${phoneNumber}: ${pictureResponse.status}`)
            }
          } catch (error) {
            console.warn(`⚠️ Error fetching profile picture for ${phoneNumber}:`, error)
          }
        }
        
        // Upsert contact in database
        const contactData: Partial<ContactInsert> = {
          whatsapp_jid: contact.id,
          display_name: contact.name || undefined,
          push_name: contact.notify || undefined,
          verified_name: contact.verifiedName || undefined,
          profile_picture_url: imgUrl || undefined,
          is_active: true
        }
        
        try {
          const storedContact = await upsertContact(phoneNumber, contactData)
          return { success: true, hasImage: !!imgUrl, contact: storedContact }
        } catch (error) {
          console.error(`❌ Error storing contact ${phoneNumber}:`, error)
          return { success: false, hasImage: false, contact: null }
        }
      })
      
      const batchResults = await Promise.all(contactPromises)
      const successfulContacts = batchResults.filter(r => r.success)
      const imagesInBatch = batchResults.filter(r => r.hasImage).length
      
      console.log(`💾 Stored batch ${Math.floor(i/batchSize) + 1}: ${successfulContacts.length} contacts (${imagesInBatch} with images)`)
      totalStored += successfulContacts.length
      totalWithImages += imagesInBatch
      
      // Small delay between batches to be nice to the API
      if (i + batchSize < contactsArray.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    console.log('💾 Successfully synced', totalStored, 'contacts from WASender')
    console.log('📸 Profile pictures found for', totalWithImages, 'contacts')
    
    return {
      success: true,
      synced_count: totalStored,
      with_images: totalWithImages
    }

  } catch (error) {
    console.error('❌ Error syncing contacts from WASender:', error)
    return {
      success: false,
      synced_count: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =============================================================================
// SEARCH CONTACTS
// =============================================================================

export async function searchContacts(
  query: string,
  limit: number = 20
): Promise<Contact[]> {
  try {
    if (!query.trim()) {
      return []
    }

    const { data, error } = await supabase
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
      .or(`display_name.ilike.%${query}%,push_name.ilike.%${query}%,verified_name.ilike.%${query}%,phone_number.ilike.%${query}%`)
      .eq('is_active', true)
      .order('last_seen_at', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) {
      console.error('❌ Error searching contacts:', error)
      throw new Error(`Failed to search contacts: ${error.message}`)
    }

    // Transform to clean types
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

    return contacts

  } catch (error) {
    console.error('❌ Error in searchContacts:', error)
    throw error
  }
}

// =============================================================================
// GET CONTACT DISPLAY NAME
// =============================================================================

export function getContactDisplayName(contact: Contact): string {
  return contact.display_name || 
         contact.push_name || 
         contact.verified_name || 
         contact.crm_profile?.preferred_name ||
         contact.crm_profile?.full_name ||
         contact.phone_number
}

// =============================================================================
// UPDATE LAST SEEN
// =============================================================================

export async function updateContactLastSeen(
  contactId: string,
  lastSeenAt: string = new Date().toISOString()
): Promise<void> {
  try {
    const { error } = await supabase
      .from('whatsapp_contacts')
      .update({ 
        last_seen_at: lastSeenAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', contactId)

    if (error) {
      console.error('❌ Error updating contact last seen:', error)
      throw new Error(`Failed to update contact last seen: ${error.message}`)
    }

    console.log('✅ Contact last seen updated:', contactId)

  } catch (error) {
    console.error('❌ Error in updateContactLastSeen:', error)
    throw error
  }
} 