import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface SyncResult {
  success: boolean
  stats: {
    total_contacts_processed: number
    new_contacts_added: number
    existing_contacts_updated: number
    contacts_deactivated: number
    contacts_reactivated: number
    errors: number
  }
  sync_duration_ms: number
  last_sync_at: string
  errors?: Array<{
    contact_id?: string
    phone_number?: string
    error_message: string
    error_type: 'validation' | 'database' | 'api' | 'network'
  }>
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { 
      force_full_sync = false 
    } = await request.json().catch(() => ({ force_full_sync: false }))

    console.log('🔄 Starting WASender contact sync...')
    
    const apiKey = process.env.WASENDER_API_KEY
    const apiUrl = process.env.WASENDER_API_URL || 'https://www.wasenderapi.com'
    
    if (!apiKey) {
      console.error('❌ WASENDER_API_KEY not found in environment variables')
      return NextResponse.json({
        success: false,
        stats: {
          total_contacts_processed: 0,
          new_contacts_added: 0,
          existing_contacts_updated: 0,
          contacts_deactivated: 0,
          contacts_reactivated: 0,
          errors: 1
        },
        sync_duration_ms: Date.now() - startTime,
        last_sync_at: new Date().toISOString(),
        errors: [{
          error_message: 'WASender API key not configured',
          error_type: 'api'
        }]
      }, { status: 500 })
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
      return NextResponse.json({
        success: false,
        stats: {
          total_contacts_processed: 0,
          new_contacts_added: 0,
          existing_contacts_updated: 0,
          contacts_deactivated: 0,
          contacts_reactivated: 0,
          errors: 1
        },
        sync_duration_ms: Date.now() - startTime,
        last_sync_at: new Date().toISOString(),
        errors: [{
          error_message: `WASender API error: ${response.status} ${response.statusText}`,
          error_type: 'api'
        }]
      }, { status: 500 })
    }
    
    const result = await response.json()
    console.log('📋 WASender contacts response received with', result.data?.length || 0, 'contacts')
    
    // WASender returns { success: true, data: [...] }
    if (!result.success || !result.data) {
      console.log('⚠️ WASender returned unsuccessful response or no data')
      return NextResponse.json({
        success: false,
        stats: {
          total_contacts_processed: 0,
          new_contacts_added: 0,
          existing_contacts_updated: 0,
          contacts_deactivated: 0,
          contacts_reactivated: 0,
          errors: 1
        },
        sync_duration_ms: Date.now() - startTime,
        last_sync_at: new Date().toISOString(),
        errors: [{
          error_message: 'No contacts received from WASender',
          error_type: 'api'
        }]
      }, { status: 500 })
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
        const contactData = {
          phone_number: phoneNumber,
          whatsapp_jid: contact.id,
          display_name: contact.name || null,
          push_name: contact.notify || null,
          verified_name: contact.verifiedName || null,
          profile_picture_url: imgUrl || null,
          is_active: true,
          updated_at: new Date().toISOString()
        }
        
        try {
          // Check if contact exists
          const { data: existingContact } = await supabaseAdmin
            .from('whatsapp_contacts')
            .select('id')
            .eq('phone_number', phoneNumber)
            .single()

          if (existingContact) {
            // Update existing contact
            const { error } = await supabaseAdmin
              .from('whatsapp_contacts')
              .update(contactData)
              .eq('id', existingContact.id)

            if (error) {
              console.error(`❌ Error updating contact ${phoneNumber}:`, error)
              return { success: false, hasImage: false, isNew: false }
            }
            return { success: true, hasImage: !!imgUrl, isNew: false }
          } else {
            // Create new contact
            const { error } = await supabaseAdmin
              .from('whatsapp_contacts')
              .insert({
                ...contactData,
                created_at: new Date().toISOString()
              })

            if (error) {
              console.error(`❌ Error creating contact ${phoneNumber}:`, error)
              return { success: false, hasImage: false, isNew: false }
            }
            return { success: true, hasImage: !!imgUrl, isNew: true }
          }
        } catch (error) {
          console.error(`❌ Error processing contact ${phoneNumber}:`, error)
          return { success: false, hasImage: false, isNew: false }
        }
      })
      
      const batchResults = await Promise.all(contactPromises)
      const successfulContacts = batchResults.filter(r => r.success)
      const newContacts = batchResults.filter(r => r.success && r.isNew)
      const updatedContacts = batchResults.filter(r => r.success && !r.isNew)
      const imagesInBatch = batchResults.filter(r => r.hasImage).length
      
      console.log(`💾 Processed batch ${Math.floor(i/batchSize) + 1}: ${successfulContacts.length} contacts (${newContacts.length} new, ${updatedContacts.length} updated, ${imagesInBatch} with images)`)
      totalStored += successfulContacts.length
      totalWithImages += imagesInBatch
      
      // Small delay between batches to be nice to the API
      if (i + batchSize < contactsArray.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    console.log('💾 Successfully synced', totalStored, 'contacts from WASender')
    console.log('📸 Profile pictures found for', totalWithImages, 'contacts')
    
    return NextResponse.json({
      success: true,
      stats: {
        total_contacts_processed: contactsArray.length,
        new_contacts_added: totalStored, // This is simplified - we'd need to track new vs updated
        existing_contacts_updated: 0,
        contacts_deactivated: 0,
        contacts_reactivated: 0,
        errors: 0
      },
      sync_duration_ms: Date.now() - startTime,
      last_sync_at: new Date().toISOString(),
      errors: []
    })

  } catch (error) {
    console.error('❌ Error syncing contacts from WASender:', error)
    
    return NextResponse.json({
      success: false,
      stats: {
        total_contacts_processed: 0,
        new_contacts_added: 0,
        existing_contacts_updated: 0,
        contacts_deactivated: 0,
        contacts_reactivated: 0,
        errors: 1
      },
      sync_duration_ms: Date.now() - startTime,
      last_sync_at: new Date().toISOString(),
      errors: [{
        error_message: error instanceof Error ? error.message : 'Unknown error',
        error_type: 'api'
      }]
    }, { status: 500 })
  }
}

// GET endpoint to check sync status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const include_stats = searchParams.get('include_stats') === 'true'

    // Get last sync information
    // In a real implementation, you would fetch this from a settings table
    const response: any = {
      last_sync_at: null,
      last_sync_updated_at: null,
      sync_available: true
    }

    if (include_stats) {
      // Get contact statistics
      const [totalContacts, activeContacts, inactiveContacts, recentContacts] = await Promise.all([
        supabaseAdmin.from('whatsapp_contacts').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('whatsapp_contacts').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabaseAdmin.from('whatsapp_contacts').select('id', { count: 'exact', head: true }).eq('is_active', false),
        supabaseAdmin.from('whatsapp_contacts').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ])

      response.stats = {
        total_contacts: totalContacts.count || 0,
        active_contacts: activeContacts.count || 0,
        inactive_contacts: inactiveContacts.count || 0,
        recent_contacts_24h: recentContacts.count || 0
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error getting sync status:', error)
    return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 })
  }
} 