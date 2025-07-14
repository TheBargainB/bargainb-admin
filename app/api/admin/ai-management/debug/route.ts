import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { AGENT_BB_CONFIG } from '@/lib/constants'

const BB_AGENT_URL = AGENT_BB_CONFIG.BASE_URL
const LANGSMITH_API_KEY = process.env[AGENT_BB_CONFIG.API_KEY_ENV]

interface DebugRequest {
  assistant_id?: string
  thread_id?: string
  conversation_id?: string
  phone_number?: string
  test_message?: string
}

interface DebugResult {
  success: boolean
  assistant_debug?: any
  thread_debug?: any
  conversation_debug?: any
  api_connectivity?: any
  test_result?: any
  recommendations?: string[]
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: DebugRequest = await request.json()
    const { assistant_id, thread_id, conversation_id, phone_number, test_message } = body

    console.log('🔍 Starting AI debugging with params:', {
      assistant_id: assistant_id?.substring(0, 8) + '...',
      thread_id: thread_id?.substring(0, 8) + '...',
      conversation_id: conversation_id?.substring(0, 8) + '...',
      phone_number: phone_number ? `${phone_number.substring(0, 3)}***${phone_number.substring(phone_number.length - 3)}` : undefined,
      has_test_message: !!test_message
    })

    const debugResult: DebugResult = {
      success: true,
      recommendations: []
    }

    // 1. Check API connectivity
    debugResult.api_connectivity = await debugApiConnectivity()

    // 2. Debug assistant if provided
    if (assistant_id) {
      debugResult.assistant_debug = await debugAssistant(assistant_id)
    }

    // 3. Debug thread if provided
    if (thread_id) {
      debugResult.thread_debug = await debugThread(thread_id)
    }

    // 4. Debug conversation if provided
    if (conversation_id) {
      debugResult.conversation_debug = await debugConversation(conversation_id)
    }

    // 5. Debug by phone number if provided
    if (phone_number) {
      const phoneDebug = await debugByPhoneNumber(phone_number)
      debugResult.conversation_debug = phoneDebug
      
      if (phoneDebug.assistant_id && !assistant_id) {
        debugResult.assistant_debug = await debugAssistant(phoneDebug.assistant_id)
      }
      
      if (phoneDebug.thread_id && !thread_id) {
        debugResult.thread_debug = await debugThread(phoneDebug.thread_id)
      }
    }

    // 6. Test message if provided
    if (test_message && assistant_id && thread_id) {
      debugResult.test_result = await testMessageWithAssistant(assistant_id, thread_id, test_message)
    }

    // 7. Generate recommendations
    debugResult.recommendations = generateRecommendations(debugResult)

    return NextResponse.json(debugResult)

  } catch (error) {
    console.error('❌ Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function debugApiConnectivity(): Promise<any> {
  try {
    console.log('🔍 Testing API connectivity...')
    
    if (!LANGSMITH_API_KEY) {
      return {
        status: 'error',
        error: 'LANGSMITH_API_KEY not configured'
      }
    }

    // Test basic connectivity
    const response = await fetch(`${BB_AGENT_URL}/assistants/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LANGSMITH_API_KEY
      },
      body: JSON.stringify({
        metadata: {},
        graph_id: AGENT_BB_CONFIG.GRAPH_ID,
        limit: 1,
        offset: 0
      })
    })

    if (!response.ok) {
      return {
        status: 'error',
        error: `API request failed: ${response.status} ${response.statusText}`
      }
    }

    const data = await response.json()
    return {
      status: 'connected',
      assistants_count: data.length || 0,
      api_url: BB_AGENT_URL
    }

  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function debugAssistant(assistantId: string): Promise<any> {
  try {
    console.log('🔍 Debugging assistant:', assistantId)
    
    if (!LANGSMITH_API_KEY) {
      return {
        status: 'error',
        error: 'LANGSMITH_API_KEY not configured'
      }
    }

    // Get assistant details from BB Agent
    const response = await fetch(`${BB_AGENT_URL}/assistants/${assistantId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': LANGSMITH_API_KEY
      }
    })

    if (!response.ok) {
      return {
        status: 'error',
        error: `Assistant not found: ${response.status} ${response.statusText}`
      }
    }

    const assistantData = await response.json()
    
    // Check if assistant exists in our database
    const { data: dbAssignment, error: dbError } = await supabaseAdmin
      .from('conversations')
      .select('id, assistant_id, assistant_name, assistant_config, ai_enabled')
      .eq('assistant_id', assistantId)
      .limit(5)

    return {
      status: 'found',
      assistant_data: assistantData,
      database_assignments: dbAssignment || [],
      database_error: dbError?.message,
      config_size: JSON.stringify(assistantData.config || {}).length,
      metadata_size: JSON.stringify(assistantData.metadata || {}).length,
      is_active: true // BB Agent doesn't have inactive status
    }

  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function debugThread(threadId: string): Promise<any> {
  try {
    console.log('🔍 Debugging thread:', threadId)
    
    if (!LANGSMITH_API_KEY) {
      return {
        status: 'error',
        error: 'LANGSMITH_API_KEY not configured'
      }
    }

    // Get thread details from BB Agent
    const response = await fetch(`${BB_AGENT_URL}/threads/${threadId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': LANGSMITH_API_KEY
      }
    })

    if (!response.ok) {
      return {
        status: 'error',
        error: `Thread not found: ${response.status} ${response.statusText}`
      }
    }

    const threadData = await response.json()
    
    // Get thread state
    const stateResponse = await fetch(`${BB_AGENT_URL}/threads/${threadId}/state`, {
      method: 'GET',
      headers: {
        'X-Api-Key': LANGSMITH_API_KEY
      }
    })

    let threadState = null
    if (stateResponse.ok) {
      threadState = await stateResponse.json()
    }

    // Get thread history
    const historyResponse = await fetch(`${BB_AGENT_URL}/threads/${threadId}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LANGSMITH_API_KEY
      },
      body: JSON.stringify({
        limit: 10,
        offset: 0
      })
    })

    let threadHistory = null
    if (historyResponse.ok) {
      threadHistory = await historyResponse.json()
    }

    // Check if thread exists in our database
    const { data: dbThread, error: dbError } = await supabaseAdmin
      .from('conversations')
      .select('id, ai_thread_id, whatsapp_contact_id, ai_enabled')
      .eq('ai_thread_id', threadId)
      .single()

    return {
      status: 'found',
      thread_data: threadData,
      thread_state: threadState,
      thread_history: threadHistory,
      database_conversation: dbThread || null,
      database_error: dbError?.message,
      message_count: threadHistory?.length || 0
    }

  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function debugConversation(conversationId: string): Promise<any> {
  try {
    console.log('🔍 Debugging conversation:', conversationId)
    
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        assistant_id,
        assistant_name,
        assistant_config,
        assistant_metadata,
        ai_enabled,
        ai_thread_id,
        ai_config,
        whatsapp_contact_id,
        whatsapp_contacts (
          phone_number,
          display_name,
          push_name
        )
      `)
      .eq('id', conversationId)
      .single()

    if (convError) {
      return {
        status: 'error',
        error: `Conversation not found: ${convError.message}`
      }
    }

    // Get recent messages
    const { data: messages, error: msgError } = await supabaseAdmin
      .from('messages')
      .select('id, content, direction, whatsapp_status, created_at, raw_message_data')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get AI interactions
    const { data: aiInteractions, error: aiError } = await supabaseAdmin
      .from('ai_interactions')
      .select('id, user_message, ai_response, thread_id, processing_time_ms, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      status: 'found',
      conversation_data: conversation,
      recent_messages: messages || [],
      ai_interactions: aiInteractions || [],
      messages_error: msgError?.message,
      ai_interactions_error: aiError?.message,
      has_assistant: !!conversation.assistant_id,
      has_thread: !!conversation.ai_thread_id,
      ai_enabled: conversation.ai_enabled
    }

  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function debugByPhoneNumber(phoneNumber: string): Promise<any> {
  try {
    console.log('🔍 Debugging by phone number:', phoneNumber.substring(0, 3) + '***')
    
    // Clean phone number
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '')
    
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('whatsapp_contacts')
      .select('id, phone_number, display_name, push_name')
      .eq('phone_number', cleanPhone)
      .single()

    if (contactError) {
      return {
        status: 'error',
        error: `Contact not found: ${contactError.message}`
      }
    }

    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        assistant_id,
        assistant_name,
        ai_enabled,
        ai_thread_id,
        ai_config
      `)
      .eq('whatsapp_contact_id', contact.id)
      .single()

    if (convError) {
      return {
        status: 'error',
        error: `Conversation not found: ${convError.message}`
      }
    }

    return {
      status: 'found',
      contact_data: contact,
      conversation_data: conversation,
      assistant_id: conversation.assistant_id,
      thread_id: conversation.ai_thread_id,
      ai_enabled: conversation.ai_enabled
    }

  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testMessageWithAssistant(assistantId: string, threadId: string, message: string): Promise<any> {
  try {
    console.log('🔍 Testing message with assistant:', assistantId, 'thread:', threadId)
    
    if (!LANGSMITH_API_KEY) {
      return {
        status: 'error',
        error: 'LANGSMITH_API_KEY not configured'
      }
    }

    const startTime = Date.now()
    
    const response = await fetch(`${BB_AGENT_URL}/threads/${threadId}/runs/wait`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LANGSMITH_API_KEY
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        input: {
          messages: [{ role: 'user', content: message }]
        },
        config: {
          configurable: {
            user_id: 'debug-test',
            source: 'debug',
            ENABLE_FALLBACK_RESPONSES: true,
            MAX_TOOL_CALLS_PER_REQUEST: 3,
            REQUEST_TIMEOUT_SECONDS: 30
          }
        }
      })
    })

    const processingTime = Date.now() - startTime

    if (!response.ok) {
      return {
        status: 'error',
        error: `AI agent request failed: ${response.status} ${response.statusText}`,
        processing_time_ms: processingTime
      }
    }

    const data = await response.json()
    
    return {
      status: 'success',
      processing_time_ms: processingTime,
      response_data: data,
      has_error: !!data.__error__,
      error_details: data.__error__,
      response_type: typeof data,
      response_length: JSON.stringify(data).length
    }

  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

function generateRecommendations(debugResult: DebugResult): string[] {
  const recommendations: string[] = []

  // API connectivity recommendations
  if (debugResult.api_connectivity?.status === 'error') {
    recommendations.push('❌ Fix API connectivity issue: ' + debugResult.api_connectivity.error)
  }

  // Assistant recommendations
  if (debugResult.assistant_debug?.status === 'error') {
    recommendations.push('❌ Assistant issue: ' + debugResult.assistant_debug.error)
  } else if (debugResult.assistant_debug?.status === 'found') {
    const assistantData = debugResult.assistant_debug.assistant_data
    if (!assistantData.config || Object.keys(assistantData.config).length === 0) {
      recommendations.push('⚠️ Assistant has no configuration - this might cause tool access issues')
    }
    if (debugResult.assistant_debug.database_assignments.length === 0) {
      recommendations.push('⚠️ Assistant is not assigned to any conversations in database')
    }
  }

  // Thread recommendations
  if (debugResult.thread_debug?.status === 'error') {
    recommendations.push('❌ Thread issue: ' + debugResult.thread_debug.error)
  } else if (debugResult.thread_debug?.status === 'found') {
    if (!debugResult.thread_debug.database_conversation) {
      recommendations.push('⚠️ Thread exists in BB Agent but not linked to any conversation in database')
    }
    if (debugResult.thread_debug.message_count === 0) {
      recommendations.push('ℹ️ Thread has no message history - this is normal for new threads')
    }
  }

  // Conversation recommendations
  if (debugResult.conversation_debug?.status === 'found') {
    const conv = debugResult.conversation_debug.conversation_data
    if (!conv.ai_enabled) {
      recommendations.push('❌ AI is not enabled for this conversation')
    }
    if (!conv.assistant_id) {
      recommendations.push('❌ No assistant assigned to this conversation')
    }
    if (!conv.ai_thread_id) {
      recommendations.push('❌ No AI thread associated with this conversation')
    }
  }

  // Test result recommendations
  if (debugResult.test_result?.status === 'error') {
    recommendations.push('❌ Test message failed: ' + debugResult.test_result.error)
  } else if (debugResult.test_result?.has_error) {
    recommendations.push('❌ AI agent returned error: ' + debugResult.test_result.error_details?.message)
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ No obvious issues detected - check logs for more details')
  }

  return recommendations
}

// GET endpoint for simple health check
export async function GET() {
  try {
    const connectivity = await debugApiConnectivity()
    
    return NextResponse.json({
      status: 'ok',
      api_connectivity: connectivity,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 