import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type CRMUser = {
  contact_id: string
  phone_number: string
  whatsapp_name: string | null
  full_name: string | null
  preferred_name: string | null
  email: string | null
  lifecycle_stage: string
  shopping_persona: string | null
  preferred_stores: string[]
  engagement_status: string
  engagement_score: number
  last_message_at: string | null
  total_conversations: number
  total_messages: number
  customer_since: string | null
  profile_picture_url?: string | null
}

// Mock data for now - will be replaced with real database when types are updated
const mockUsers = [
  {
    contact_id: "2a4baeea-ecfe-468d-8eda-9892ddd34fdb",
    phone_number: "31654254623",
    whatsapp_name: null,
    full_name: "John Doe",
    preferred_name: "Test User", 
    email: "test@example.com",
    lifecycle_stage: "customer",
    shopping_persona: "healthHero",
    preferred_stores: ["Albert Heijn", "Jumbo"],
    engagement_status: "active",
    engagement_score: 65,
    last_message_at: "2025-01-06T10:00:00Z",
    total_conversations: 3,
    total_messages: 15,
    customer_since: "2024-12-01T00:00:00Z"
  },
  {
    contact_id: "b885b6be-5cc0-4a2d-b6a1-793de963977e",
    phone_number: "31614539919",
    whatsapp_name: null,
    full_name: "Jane Smith",
    preferred_name: "Focused Creativity",
    email: "jane@example.com",
    lifecycle_stage: "prospect",
    shopping_persona: "ecoShopper",
    preferred_stores: ["Ekoplaza", "Albert Heijn"],
    engagement_status: "highly_active",
    engagement_score: 85,
    last_message_at: "2025-06-29T10:34:39Z",
    total_conversations: 1,
    total_messages: 8,
    customer_since: "2025-01-01T00:00:00Z"
  },
  {
    contact_id: "f2e1235b-aa7d-4a79-9cc8-615f45bdb9da",
    phone_number: "31652035621",
    whatsapp_name: null,
    full_name: "Ahmed Hassan",
    preferred_name: "Test Contact",
    email: null,
    lifecycle_stage: "customer",
    shopping_persona: "budgetSaver",
    preferred_stores: ["Lidl", "Aldi"],
    engagement_status: "churned",
    engagement_score: 15,
    last_message_at: "2024-11-15T14:22:00Z",
    total_conversations: 2,
    total_messages: 6,
    customer_since: "2024-10-01T00:00:00Z"
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const persona = searchParams.get('persona') || 'all'

    // Try to fetch real CRM data from database
    try {
      // Use type assertion to access the new CRM tables
      const { data: crmProfiles, error: crmError } = await (supabaseAdmin as any)
        .from('crm_profiles')
        .select(`
          id,
          full_name,
          preferred_name,
          email,
          lifecycle_stage,
          shopping_persona,
          preferred_stores,
          engagement_score,
          total_conversations,
          total_messages,
          customer_since,
          created_at,
          whatsapp_contacts!inner(
            id,
            phone_number,
            push_name,
            display_name,
            profile_picture_url
          )
        `)

      if (crmError) {
        console.warn('CRM query failed:', crmError)
        throw new Error('CRM query failed')
      }

      // Business/Admin phone numbers to exclude from customer list
      const adminPhoneNumbers = [
        '+31685414129', // Admin/Business WhatsApp number
        '31685414129',  // Without + prefix
      ]

      // Transform the real data to match our expected format, filtering out admin numbers
      const realUsers: CRMUser[] = crmProfiles
        ?.filter((profile: any) => {
          const phoneNumber = profile.whatsapp_contacts?.phone_number
          return phoneNumber && !adminPhoneNumbers.includes(phoneNumber)
        })
        ?.map((profile: any) => ({
        contact_id: profile.id,
        phone_number: profile.whatsapp_contacts.phone_number,
        whatsapp_name: profile.whatsapp_contacts.push_name || profile.whatsapp_contacts.display_name,
        full_name: profile.full_name || profile.whatsapp_contacts.display_name,
        preferred_name: profile.preferred_name || profile.whatsapp_contacts.push_name,
        email: profile.email,
        lifecycle_stage: profile.lifecycle_stage,
        shopping_persona: profile.shopping_persona,
        preferred_stores: profile.preferred_stores || [],
        engagement_score: profile.engagement_score || 0,
        total_conversations: profile.total_conversations || 0,
        total_messages: profile.total_messages || 0,
        customer_since: profile.customer_since,
        created_at: profile.created_at,
        engagement_status: profile.engagement_score >= 80 ? 'highly_active' :
                          profile.engagement_score >= 50 ? 'active' :
                          profile.engagement_score >= 20 ? 'moderate' : 'inactive',
        last_message_at: null, // Will be calculated below
        profile_picture_url: profile.whatsapp_contacts.profile_picture_url,
        whatsapp_contact_id: profile.whatsapp_contacts.id // Add this for message counting
      })) || []

      // Update message counts and last message timestamps dynamically
      if (realUsers.length > 0) {
        try {
          // Get WhatsApp contact IDs for all users
          const contactIds = realUsers.map((user: any) => user.whatsapp_contact_id).filter(Boolean)
          
          if (contactIds.length > 0) {
            // Get conversations for these WhatsApp contacts
            const { data: conversations, error: convError } = await (supabaseAdmin as any)
              .from('conversations')
              .select('id, whatsapp_contact_id, total_messages, last_message_at')
              .in('whatsapp_contact_id', contactIds)

            if (!convError && conversations) {
              // Create maps for quick lookup
              const contactToConversations = new Map()
              const contactToTotalMessages = new Map()
              const contactToLastMessage = new Map()

              conversations.forEach((conv: any) => {
                const contactId = conv.whatsapp_contact_id
                
                // Group conversations by contact
                if (!contactToConversations.has(contactId)) {
                  contactToConversations.set(contactId, [])
                }
                contactToConversations.get(contactId).push(conv)

                // Sum total messages
                const currentTotal = contactToTotalMessages.get(contactId) || 0
                contactToTotalMessages.set(contactId, currentTotal + (conv.total_messages || 0))

                // Find latest message timestamp
                if (conv.last_message_at) {
                  const currentLatest = contactToLastMessage.get(contactId)
                  if (!currentLatest || new Date(conv.last_message_at) > new Date(currentLatest)) {
                    contactToLastMessage.set(contactId, conv.last_message_at)
                  }
                }
              })

              // Update each user with correct counts
              realUsers.forEach((user: any) => {
                const contactId = user.whatsapp_contact_id
                if (contactId) {
                  const userConversations = contactToConversations.get(contactId) || []
                  const totalMessages = contactToTotalMessages.get(contactId) || 0
                  const lastMessageAt = contactToLastMessage.get(contactId)

                  // Update user data
                  user.total_conversations = userConversations.length
                  user.total_messages = totalMessages
                  user.last_message_at = lastMessageAt

                  // Update engagement score based on activity
                  if (totalMessages > 10) {
                    user.engagement_score = Math.min(80, user.engagement_score + 20)
                    user.engagement_status = 'highly_active'
                  } else if (totalMessages > 5) {
                    user.engagement_score = Math.min(60, user.engagement_score + 10)
                    user.engagement_status = 'active'
                  } else if (totalMessages > 0) {
                    user.engagement_status = 'moderate'
                  }
                }
              })

              console.log(`📊 Updated message counts for ${realUsers.length} users`)
            }
          }
        } catch (messageError) {
          console.warn('Error updating message counts:', messageError)
          // Continue without message data if this fails
        }
      }

      // Apply filters to real data
      let filteredUsers = realUsers

      if (search) {
        const searchLower = search.toLowerCase()
        filteredUsers = filteredUsers.filter(user =>
          user.full_name?.toLowerCase().includes(searchLower) ||
          user.preferred_name?.toLowerCase().includes(searchLower) ||
          user.phone_number.includes(search) ||
          user.email?.toLowerCase().includes(searchLower)
        )
      }

      if (status !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.lifecycle_stage === status)
      }

      if (persona !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.shopping_persona === persona)
      }

      // Calculate stats from real data
      const stats = {
        totalUsers: filteredUsers.length,
        activeUsers: filteredUsers.filter(u => u.engagement_status === 'active' || u.engagement_status === 'highly_active').length,
        prospects: filteredUsers.filter(u => u.lifecycle_stage === 'prospect').length,
        customers: filteredUsers.filter(u => u.lifecycle_stage === 'customer' || u.lifecycle_stage === 'vip').length,
      }

      return NextResponse.json({
        success: true,
        data: { users: filteredUsers, stats },
        source: 'database',
        message: `Connected to live database! Found ${realUsers.length} real customers.`
      })

    } catch (dbError) {
      // Fall back to mock data if database connection fails
      console.warn('Database connection failed, using mock data:', dbError)
      
      let filteredUsers = [...mockUsers]

      if (search) {
        const searchLower = search.toLowerCase()
        filteredUsers = filteredUsers.filter(user =>
          user.full_name?.toLowerCase().includes(searchLower) ||
          user.preferred_name?.toLowerCase().includes(searchLower) ||
          user.phone_number.includes(search) ||
          user.email?.toLowerCase().includes(searchLower)
        )
      }

      if (status !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.lifecycle_stage === status)
      }

      if (persona !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.shopping_persona === persona)
      }

      const stats = {
        totalUsers: filteredUsers.length,
        activeUsers: filteredUsers.filter(u => u.engagement_status === 'active' || u.engagement_status === 'highly_active').length,
        prospects: filteredUsers.filter(u => u.lifecycle_stage === 'prospect').length,
        customers: filteredUsers.filter(u => u.lifecycle_stage === 'customer' || u.lifecycle_stage === 'vip').length,
      }

      return NextResponse.json({
        success: true,
        data: { users: filteredUsers, stats },
        source: 'mock',
        message: 'Using mock data (database connection issue)'
      })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Update user profile - TODO: Connect to real database when types are updated
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { contact_id, ...updateData } = body

    // Mock update for now - returns success
    return NextResponse.json({
      success: true,
      message: 'User updated successfully (mock)',
      data: { contact_id, ...updateData }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 