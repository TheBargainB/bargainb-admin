import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  getContacts,
  getContactById,
  getContactByPhone,
  createContact,
  updateContact,
  deleteContact,
  upsertContact,
  searchContacts,
  syncContactsFromWASender,
  getContactDisplayName
} from '@/actions/chat-v2/contacts.actions'
import type { ContactFilters, ContactInsert } from '@/types/chat-v2.types'

// =============================================================================
// GET CONTACTS
// =============================================================================

export async function GET(request: NextRequest) {
  console.log('👥 GET contacts request received...')

  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const search = searchParams.get('search') || undefined
    const hasConversations = searchParams.get('has_conversations') === 'true' || undefined
    const isActive = searchParams.get('is_active') === 'true' || undefined
    const phoneNumber = searchParams.get('phone_number')
    const contactId = searchParams.get('contact_id')
    const searchQuery = searchParams.get('query')

    // Get single contact by ID
    if (contactId) {
      const contact = await getContactById(contactId)
      
      if (!contact) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Contact not found' 
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: contact
      })
    }

    // Get contact by phone number
    if (phoneNumber) {
      const contact = await getContactByPhone(phoneNumber)
      
      if (!contact) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Contact not found' 
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: contact
      })
    }

    // Search contacts
    if (searchQuery) {
      const limit = parseInt(searchParams.get('limit') || '20')
      const contacts = await searchContacts(searchQuery, limit)
      
      return NextResponse.json({
        success: true,
        data: {
          contacts,
          total_count: contacts.length
        },
        meta: {
          search_query: searchQuery,
          limit
        }
      })
    }

    // Get all contacts with filters
    const filters: ContactFilters = {
      search,
      has_conversations: hasConversations,
      is_active: isActive
    }

    const response = await getContacts(filters)

    console.log(`✅ Retrieved ${response.contacts.length} contacts`)
    
    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        total: response.total_count,
        filters
      }
    })

  } catch (error) {
    console.error('❌ GET contacts error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contacts' 
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// CREATE CONTACT
// =============================================================================

export async function POST(request: NextRequest) {
  console.log('📝 POST contact request received...')

  try {
    const body = await request.json()
    const {
      phone_number,
      whatsapp_jid,
      display_name,
      push_name,
      verified_name,
      profile_picture_url,
      is_active = true,
      upsert = false
    } = body

    // Validate required fields
    if (!phone_number || !whatsapp_jid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: phone_number, whatsapp_jid' 
        },
        { status: 400 }
      )
    }

    // Use upsert if requested
    if (upsert) {
      const contactData = {
        phone_number,
        whatsapp_jid,
        display_name,
        push_name,
        verified_name,
        profile_picture_url,
        is_active
      }

      const contact = await upsertContact(phone_number, contactData)

      console.log('✅ Contact upserted:', contact.id)
      
      return NextResponse.json({
        success: true,
        data: contact,
        action: 'upserted'
      }, { status: 201 })
    }

    // Create new contact
    const contactData: ContactInsert = {
      phone_number,
      whatsapp_jid,
      display_name,
      push_name,
      verified_name,
      profile_picture_url,
      is_active
    }

    const newContact = await createContact(contactData)

    console.log('✅ Contact created:', newContact.id)
    
    return NextResponse.json({
      success: true,
      data: newContact,
      action: 'created'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ POST contact error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create contact' 
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// UPDATE CONTACT
// =============================================================================

export async function PATCH(request: NextRequest) {
  console.log('🔄 PATCH contact request received...')

  try {
    const body = await request.json()
    const { contact_id, ...updates } = body

    // Validate required fields
    if (!contact_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required field: contact_id' 
        },
        { status: 400 }
      )
    }

    // Update contact
    const updatedContact = await updateContact(contact_id, updates)

    console.log('✅ Contact updated:', contact_id)
    
    return NextResponse.json({
      success: true,
      data: updatedContact
    })

  } catch (error) {
    console.error('❌ PATCH contact error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update contact' 
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// DELETE CONTACT
// =============================================================================

export async function DELETE(request: NextRequest) {
  console.log('🗑️ DELETE contact request received...')

  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contact_id')

    // Validate required fields
    if (!contactId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required parameter: contact_id' 
        },
        { status: 400 }
      )
    }

    // Delete contact
    await deleteContact(contactId)

    console.log('✅ Contact deleted:', contactId)
    
    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully'
    })

  } catch (error) {
    console.error('❌ DELETE contact error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete contact' 
      },
      { status: 500 }
    )
  }
} 