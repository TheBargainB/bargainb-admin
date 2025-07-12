import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface RecentMessage {
  id: string
  content: string
  created_at: string
  from_me: boolean
  is_ai_triggered: boolean
  sender_type: string
  message_type: string
  whatsapp_status: string
  conversation_id: string
  conversation_title: string
  contact_name: string
  contact_phone: string
  contact_picture?: string
  unread: boolean
  priority: 'high' | 'medium' | 'low'
}

interface RecentMessagesResponse {
  messages: RecentMessage[]
  unread_count: number
  high_priority_count: number
  last_updated: string
  pagination: {
    total: number
    page: number
    limit: number
    has_more: boolean
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const filter = searchParams.get('filter') || 'all' // 'all', 'unread', 'high_priority', 'customer_only'
    const since = searchParams.get('since') // ISO timestamp for incremental updates
    const conversation_id = searchParams.get('conversation_id') // Filter by specific conversation

    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        from_me,
        is_ai_triggered,
        sender_type,
        message_type,
        whatsapp_status,
        conversation_id,
        conversations!inner(
          id,
          title,
          unread_count,
          whatsapp_contact_id,
          whatsapp_contacts!inner(
            id,
            display_name,
            phone_number,
            profile_picture_url
          )
        )
      `)

    // Apply filters
    if (since) {
      query = query.gt('created_at', since)
    }

    if (conversation_id) {
      query = query.eq('conversation_id', conversation_id)
    }

    switch (filter) {
             case 'unread':
         query = query.gt('conversations.unread_count', 0)
         break
      case 'customer_only':
        query = query.eq('from_me', false).eq('is_ai_triggered', false)
        break
      case 'high_priority':
        // High priority: customer messages with keywords or in urgent conversations
        query = query.eq('from_me', false).eq('is_ai_triggered', false)
        break
    }

    // Get total count for pagination
    const { count } = await query.select('*', { count: 'exact', head: true })

    // Get messages with pagination
    const { data: messagesData, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching recent messages:', error)
      return NextResponse.json({ error: 'Failed to fetch recent messages' }, { status: 500 })
    }

    // Process messages
    const messages: RecentMessage[] = (messagesData || []).map(msg => {
      const conversation = msg.conversations
      const contact = conversation?.whatsapp_contacts

             // Determine priority based on content and context
       const priority = determinePriority(msg.content, msg.from_me, msg.is_ai_triggered || false)

             return {
         id: msg.id,
         content: msg.content,
         created_at: msg.created_at || new Date().toISOString(),
         from_me: msg.from_me,
         is_ai_triggered: msg.is_ai_triggered || false,
         sender_type: msg.sender_type || 'user',
         message_type: msg.message_type || 'text',
         whatsapp_status: msg.whatsapp_status || 'sent',
         conversation_id: msg.conversation_id,
         conversation_title: conversation?.title || 'Untitled Conversation',
         contact_name: contact?.display_name || 'Unknown Contact',
         contact_phone: contact?.phone_number || '',
         contact_picture: contact?.profile_picture_url || undefined,
         unread: (conversation?.unread_count || 0) > 0,
         priority
       }
    })

    // Calculate summary statistics
    const unread_count = messages.filter(msg => msg.unread).length
    const high_priority_count = messages.filter(msg => msg.priority === 'high').length

    const response: RecentMessagesResponse = {
      messages,
      unread_count,
      high_priority_count,
      last_updated: new Date().toISOString(),
      pagination: {
        total: count || 0,
        page,
        limit,
        has_more: (count || 0) > offset + limit
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in recent messages API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST endpoint for marking messages as read
export async function POST(request: NextRequest) {
  try {
    const { action, message_ids, conversation_id } = await request.json()

    if (action === 'mark_read') {
      if (conversation_id) {
        // Mark entire conversation as read
        const { error } = await supabaseAdmin
          .from('conversations')
          .update({ unread_count: 0 })
          .eq('id', conversation_id)

        if (error) {
          console.error('Error marking conversation as read:', error)
          return NextResponse.json({ error: 'Failed to mark conversation as read' }, { status: 500 })
        }
      } else if (message_ids && Array.isArray(message_ids)) {
        // Mark specific messages as read (implementation depends on your read tracking system)
        // This is a placeholder - you might need to implement a separate read_status table
        console.log('Marking messages as read:', message_ids)
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in recent messages POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function determinePriority(content: string, fromMe: boolean, isAiTriggered: boolean): 'high' | 'medium' | 'low' {
  // High priority: urgent keywords from customers
  if (!fromMe && !isAiTriggered) {
    const urgentKeywords = [
      'urgent', 'emergency', 'asap', 'immediately', 'help', 'problem', 'issue', 'broken', 'not working',
      'complaint', 'refund', 'cancel', 'angry', 'disappointed', 'frustrated', 'terrible', 'awful',
      'manager', 'supervisor', 'escalate', 'legal', 'lawsuit', 'report'
    ]
    
    const lowerContent = content.toLowerCase()
    if (urgentKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'high'
    }

    // Medium priority: questions or requests from customers
    const questionKeywords = ['?', 'how', 'when', 'where', 'what', 'why', 'can you', 'could you', 'please']
    if (questionKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'medium'
    }
  }

  // Low priority: everything else (AI messages, admin messages, general chat)
  return 'low'
} 