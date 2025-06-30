/**
 * CRM Contact Sync Script
 * 
 * This script fetches rich contact data from the WASender WhatsApp API
 * and syncs it to our clean CRM database structure:
 * 
 * 1. Fetches contacts with names, avatars, status from WASender API
 * 2. Updates whatsapp_contacts table with rich contact data
 * 3. Creates/updates CRM profiles for complete customer intelligence
 * 
 * This ensures your CRM shows real names, profile pictures, and 
 * up-to-date contact information instead of just phone numbers.
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oumhprsxyxnocgbzosvh.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bWhwcnN4eXhub2NnYnpvc3ZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODUwOTkxMiwiZXhwIjoyMDY0MDg1OTEyfQ.IBgTilAos3LC1ZoDKRWcu1F0mcOiAAFTFInQMhE2Bt0'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// WASender API setup
const apiKey = process.env.WASENDER_API_KEY
const apiUrl = process.env.WASENDER_API_URL || 'https://www.wasenderapi.com'

if (!apiKey) {
  console.error('❌ Missing WASENDER_API_KEY environment variable')
  process.exit(1)
}

async function fetchContactsFromWASender() {
  console.log('📡 Fetching contacts from WASender API...')
  
  try {
    const response = await fetch(`${apiUrl}/api/contacts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`WASender API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('📋 WASender API response:', JSON.stringify(result, null, 2))

    if (result.success && result.data) {
      console.log(`✅ Successfully fetched ${result.data.length} contacts from WASender`)
      return result.data
    } else {
      console.log('⚠️ WASender returned unsuccessful response or no data')
      return []
    }
  } catch (error) {
    console.error('❌ Error fetching contacts from WASender:', error)
    throw error
  }
}

async function fetchContactPicture(phoneNumber) {
  try {
    console.log(`📸 Fetching profile picture for: ${phoneNumber}`)
    
    const response = await fetch(`${apiUrl}/api/contacts/${phoneNumber}/picture`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.log(`⚠️ No profile picture available for ${phoneNumber}: ${response.status}`)
      return null
    }

    const result = await response.json()
    if (result.success && result.data?.imgUrl) {
      console.log(`✅ Found profile picture for ${phoneNumber}`)
      return result.data.imgUrl
    } else {
      console.log(`⚠️ No profile picture in response for ${phoneNumber}`)
      return null
    }
  } catch (error) {
    console.error(`❌ Error fetching profile picture for ${phoneNumber}:`, error)
    return null
  }
}

async function fetchDetailedContactInfo(phoneNumber) {
  try {
    console.log(`📋 Fetching detailed contact info for: ${phoneNumber}`)
    
    const response = await fetch(`${apiUrl}/api/contacts/${phoneNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.log(`⚠️ No detailed info available for ${phoneNumber}: ${response.status}`)
      return null
    }

    const result = await response.json()
    if (result.success && result.data) {
      console.log(`✅ Found detailed info for ${phoneNumber}`)
      return result.data
    } else {
      console.log(`⚠️ No detailed info in response for ${phoneNumber}`)
      return null
    }
  } catch (error) {
    console.error(`❌ Error fetching detailed contact info for ${phoneNumber}:`, error)
    return null
  }
}

async function storeContactInCRM(contact) {
  try {
    // Extract phone number from contact.id (remove @s.whatsapp.net if present)
    let phoneNumber = contact.id ? contact.id.replace('@s.whatsapp.net', '') : null
    
    // Clean phone number format
    if (phoneNumber && !phoneNumber.startsWith('+')) {
      // Add + if missing for international format
      phoneNumber = '+' + phoneNumber
    }
    
    if (!phoneNumber) {
      console.warn('⚠️ Skipping contact without valid phone number:', contact)
      return null
    }

    console.log('💾 Processing WhatsApp contact:', phoneNumber, contact.name || contact.notify || 'Unknown')

    // Step 1: Try to get detailed contact info and profile picture
    const detailedInfo = await fetchDetailedContactInfo(phoneNumber.replace('+', ''))
    const profilePictureUrl = await fetchContactPicture(phoneNumber.replace('+', ''))

    // Prepare WhatsApp contact data with enhanced info
    const whatsappData = {
      phone_number: phoneNumber,
      whatsapp_jid: contact.id, // Full WhatsApp ID
      push_name: detailedInfo?.name || contact.name || contact.notify || null,
      display_name: detailedInfo?.verifiedName || detailedInfo?.name || contact.verifiedName || contact.name || contact.notify || null,
      profile_picture_url: profilePictureUrl || detailedInfo?.imgUrl || contact.imgUrl || null,
      whatsapp_status: detailedInfo?.status || contact.status || null,
      is_active: true,
      last_seen_at: new Date().toISOString(),
      raw_contact_data: { 
        original: contact,
        detailed: detailedInfo
      }
    }

    const avatarStatus = whatsappData.profile_picture_url ? '🖼️' : '👤'
    console.log(`💾 Upserting contact: ${avatarStatus} ${phoneNumber} - ${whatsappData.push_name || 'Unknown'}`)

    // Step 1: Upsert WhatsApp contact (use whatsapp_jid as unique identifier)
    const { data: whatsappContact, error: whatsappError } = await supabase
      .from('whatsapp_contacts')
      .upsert(whatsappData, {
        onConflict: 'whatsapp_jid',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (whatsappError) {
      console.error('❌ Error storing WhatsApp contact:', whatsappError)
      return null
    }

    // Step 2: Check if CRM profile exists, if not create one
    const { data: existingProfile } = await supabase
      .from('crm_profiles')
      .select('id')
      .eq('whatsapp_contact_id', whatsappContact.id)
      .single()

    if (!existingProfile) {
      // Create new CRM profile
      const crmProfileData = {
        whatsapp_contact_id: whatsappContact.id,
        full_name: whatsappData.display_name,
        preferred_name: whatsappData.push_name,
        lifecycle_stage: 'prospect', // New contacts start as prospects
        engagement_score: 0,
        total_conversations: 0,
        total_messages: 0,
        customer_since: new Date().toISOString()
      }

      const { data: crmProfile, error: crmError } = await supabase
        .from('crm_profiles')
        .insert(crmProfileData)
        .select()
        .single()

      if (crmError) {
        console.error('❌ Error creating CRM profile:', crmError)
      } else {
        console.log('✅ Created new CRM profile for:', phoneNumber)
      }
    } else {
      // Update existing profile with fresh contact data
      const { error: updateError } = await supabase
        .from('crm_profiles')
        .update({
          full_name: whatsappData.display_name,
          preferred_name: whatsappData.push_name,
          updated_at: new Date().toISOString()
        })
        .eq('whatsapp_contact_id', whatsappContact.id)

      if (updateError) {
        console.error('❌ Error updating CRM profile:', updateError)
      } else {
        console.log('✅ Updated existing CRM profile for:', phoneNumber)
      }
    }

    console.log('✅ Contact synced successfully:', phoneNumber)
    return whatsappContact
  } catch (error) {
    console.error('❌ Error in storeContactInCRM:', error)
    return null
  }
}

async function syncAllContacts() {
  console.log('🚀 Starting CRM contact sync process...')
  console.log('📡 Will fetch contacts from WASender API and sync to CRM database')
  
  try {
    // Step 1: Fetch contacts from WASender
    const contacts = await fetchContactsFromWASender()
    
    if (contacts.length === 0) {
      console.log('📭 No contacts to sync')
      return
    }

    console.log(`📊 Processing ${contacts.length} contacts into CRM...`)
    
    // Step 2: Store each contact in database
    let successCount = 0
    let errorCount = 0
    
    for (const contact of contacts) {
      const stored = await storeContactInCRM(contact)
      if (stored) {
        successCount++
      } else {
        errorCount++
      }
    }

    console.log('\n📈 Sync Results:')
    console.log(`✅ Successfully stored: ${successCount} contacts`)
    console.log(`❌ Failed to store: ${errorCount} contacts`)
    console.log(`📊 Total processed: ${contacts.length} contacts`)
    
    // Step 3: Verify CRM database contents
    const { data: crmContacts, error: crmError } = await supabase
      .from('whatsapp_contacts')
      .select(`
        phone_number, 
        push_name, 
        display_name,
        profile_picture_url,
        created_at,
        crm_profiles!inner(
          lifecycle_stage,
          engagement_score
        )
      `)
      .order('created_at', { ascending: false })

    if (crmError) {
      console.error('❌ Error querying CRM database:', crmError)
    } else {
      console.log(`\n💾 CRM Database now contains ${crmContacts.length} contacts total`)
      console.log('📋 Recent contacts with CRM profiles:')
      crmContacts.slice(0, 5).forEach((contact, index) => {
        const name = contact.display_name || contact.push_name || 'Unknown'
        const lifecycle = contact.crm_profiles?.lifecycle_stage || 'N/A'
        const hasAvatar = contact.profile_picture_url ? '🖼️' : '👤'
        console.log(`  ${index + 1}. ${hasAvatar} ${contact.phone_number} - ${name} (${lifecycle})`)
      })
    }

  } catch (error) {
    console.error('❌ Sync process failed:', error)
    process.exit(1)
  }
}

// Run the sync
console.log('🔄 CRM Contact Sync Script Starting...')
console.log('📱 Syncing WhatsApp contacts to CRM database...')
syncAllContacts()
  .then(() => {
    console.log('🎉 CRM contact sync completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 CRM contact sync failed:', error)
    process.exit(1)
  }) 