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

interface WASenderContact {
  id: string
  phone: string
  name?: string
  pushName?: string
  verifiedName?: string
  profilePicture?: string
  isActive: boolean
  isBusiness: boolean
  lastSeen?: string
  status?: string
  jid: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { 
      force_full_sync = false,
      batch_size = 100,
      include_inactive = false 
    } = await request.json()

    const result: SyncResult = {
      success: false,
      stats: {
        total_contacts_processed: 0,
        new_contacts_added: 0,
        existing_contacts_updated: 0,
        contacts_deactivated: 0,
        contacts_reactivated: 0,
        errors: 0
      },
      sync_duration_ms: 0,
      last_sync_at: new Date().toISOString(),
      errors: []
    }

    // Get last sync timestamp if not forcing full sync
    let lastSyncTime: string | null = null
    if (!force_full_sync) {
      // For now, we'll use a mock last sync time
      // In a real implementation, you would store this in a settings table
      lastSyncTime = null
    }

    // Fetch contacts from WASender API
    const wasenderContacts = await fetchWASenderContacts(lastSyncTime, include_inactive)
    
    if (!wasenderContacts) {
      throw new Error('Failed to fetch contacts from WASender')
    }

    result.stats.total_contacts_processed = wasenderContacts.length

    // Process contacts in batches
    const batches = []
    for (let i = 0; i < wasenderContacts.length; i += batch_size) {
      batches.push(wasenderContacts.slice(i, i + batch_size))
    }

    for (const batch of batches) {
      const batchResult = await processBatch(batch)
      
      result.stats.new_contacts_added += batchResult.new_contacts_added
      result.stats.existing_contacts_updated += batchResult.existing_contacts_updated
      result.stats.contacts_deactivated += batchResult.contacts_deactivated
      result.stats.contacts_reactivated += batchResult.contacts_reactivated
      result.stats.errors += batchResult.errors
      
      if (batchResult.batch_errors) {
        result.errors!.push(...batchResult.batch_errors)
      }
    }

    // Update last sync timestamp
    // In a real implementation, you would store this in a settings table
    // For now, we'll just log the sync completion
    console.log('Contacts sync completed at:', new Date().toISOString())

    // Mark inactive contacts if doing full sync
    if (force_full_sync) {
      const activePhones = wasenderContacts.filter(c => c.isActive).map(c => c.phone)
      
      const { data: inactiveContacts } = await supabaseAdmin
        .from('whatsapp_contacts')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .not('phone_number', 'in', `(${activePhones.join(',')})`)
        .eq('is_active', true)
        .select('id')

      result.stats.contacts_deactivated += inactiveContacts?.length || 0
    }

    // Calculate sync duration
    result.sync_duration_ms = Date.now() - startTime
    result.success = result.stats.errors === 0

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in contacts sync:', error)
    
    const errorResult: SyncResult = {
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
    }

    return NextResponse.json(errorResult, { status: 500 })
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

async function fetchWASenderContacts(lastSyncTime: string | null, includeInactive: boolean): Promise<WASenderContact[] | null> {
  try {
    // This would integrate with your WASender API
    // For now, we'll return mock data that represents the expected structure
    
    const mockContacts: WASenderContact[] = [
      {
        id: 'contact_1',
        phone: '1234567890',
        name: 'John Doe',
        pushName: 'John',
        verifiedName: 'John Doe Verified',
        profilePicture: 'https://example.com/profile1.jpg',
        isActive: true,
        isBusiness: false,
        lastSeen: new Date().toISOString(),
        status: 'Available',
        jid: '1234567890@c.us'
      },
      {
        id: 'contact_2',
        phone: '0987654321',
        name: 'Jane Smith',
        pushName: 'Jane',
        profilePicture: 'https://example.com/profile2.jpg',
        isActive: true,
        isBusiness: true,
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
        status: 'Busy',
        jid: '0987654321@c.us'
      }
    ]

    // In a real implementation, you would:
    // 1. Make API call to WASender
    // 2. Handle pagination
    // 3. Filter by lastSyncTime if provided
    // 4. Handle rate limiting
    
    // Example API call structure:
    // const response = await fetch(`${WASENDER_API_URL}/contacts`, {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${WASENDER_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     last_sync: lastSyncTime,
    //     include_inactive: includeInactive,
    //     limit: 1000
    //   })
    // })

    return mockContacts
  } catch (error) {
    console.error('Error fetching WASender contacts:', error)
    return null
  }
}

async function processBatch(contacts: WASenderContact[]) {
  const batchResult = {
    new_contacts_added: 0,
    existing_contacts_updated: 0,
    contacts_deactivated: 0,
    contacts_reactivated: 0,
    errors: 0,
    batch_errors: [] as Array<{
      contact_id?: string
      phone_number?: string
      error_message: string
      error_type: 'validation' | 'database' | 'api' | 'network'
    }>
  }

  for (const contact of contacts) {
    try {
      // Validate contact data
      if (!contact.phone || !contact.jid) {
        batchResult.errors++
        batchResult.batch_errors.push({
          contact_id: contact.id,
          phone_number: contact.phone,
          error_message: 'Missing required fields: phone or jid',
          error_type: 'validation'
        })
        continue
      }

      // Normalize phone number
      const normalizedPhone = contact.phone.replace(/\D/g, '')

      // Check if contact exists
      const { data: existingContact } = await supabaseAdmin
        .from('whatsapp_contacts')
        .select('id, is_active, updated_at')
        .eq('phone_number', normalizedPhone)
        .single()

      const contactData = {
        phone_number: normalizedPhone,
        whatsapp_jid: contact.jid,
        display_name: contact.name || null,
        push_name: contact.pushName || null,
        verified_name: contact.verifiedName || null,
        profile_picture_url: contact.profilePicture || null,
        is_active: contact.isActive,
        is_business_account: contact.isBusiness,
        last_seen_at: contact.lastSeen || null,
        whatsapp_status: contact.status || null,
        updated_at: new Date().toISOString()
      }

      if (existingContact) {
        // Update existing contact
        const { error } = await supabaseAdmin
          .from('whatsapp_contacts')
          .update(contactData)
          .eq('id', existingContact.id)

        if (error) {
          batchResult.errors++
          batchResult.batch_errors.push({
            contact_id: contact.id,
            phone_number: contact.phone,
            error_message: error.message,
            error_type: 'database'
          })
        } else {
          batchResult.existing_contacts_updated++
          
          // Check if contact was reactivated
          if (!existingContact.is_active && contact.isActive) {
            batchResult.contacts_reactivated++
          }
        }
      } else {
        // Create new contact
        const { error } = await supabaseAdmin
          .from('whatsapp_contacts')
          .insert({
            ...contactData,
            created_at: new Date().toISOString()
          })

        if (error) {
          batchResult.errors++
          batchResult.batch_errors.push({
            contact_id: contact.id,
            phone_number: contact.phone,
            error_message: error.message,
            error_type: 'database'
          })
        } else {
          batchResult.new_contacts_added++
        }
      }
    } catch (error) {
      batchResult.errors++
      batchResult.batch_errors.push({
        contact_id: contact.id,
        phone_number: contact.phone,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        error_type: 'api'
      })
    }
  }

  return batchResult
} 