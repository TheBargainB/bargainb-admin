import { NextRequest, NextResponse } from 'next/server'
import { AGENT_BB_CONFIG, ASSISTANT_CONFIG_TEMPLATES } from '@/lib/constants'

const BB_AGENT_URL = AGENT_BB_CONFIG.BASE_URL
const LANGSMITH_API_KEY = process.env[AGENT_BB_CONFIG.API_KEY_ENV]

export async function GET() {
  try {
    if (!LANGSMITH_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'LANGSMITH_API_KEY not configured' 
      }, { status: 500 })
    }

    // Search for all assistants using BB Agent API
    const response = await fetch(`${BB_AGENT_URL}/assistants/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LANGSMITH_API_KEY
      },
      body: JSON.stringify({
        metadata: {},
        graph_id: AGENT_BB_CONFIG.GRAPH_ID,
        limit: 100,
        offset: 0
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('BB Agent API error:', errorText)
      return NextResponse.json({ 
        success: false,
        error: `BB Agent API error: ${response.status}` 
      }, { status: 500 })
    }

    const assistants = await response.json()

    return NextResponse.json({
      success: true,
      data: assistants || []
    })
  } catch (error) {
    console.error('Error fetching BB Agent assistants:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to connect to BB Agent' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!LANGSMITH_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'LANGSMITH_API_KEY not configured' 
      }, { status: 500 })
    }

    const body = await request.json()
    const { name, description, config } = body

    if (!name) {
      return NextResponse.json({ 
        success: false,
        error: 'Assistant name is required' 
      }, { status: 400 })
    }

    // Use template-based configuration with overrides
    const baseConfig = ASSISTANT_CONFIG_TEMPLATES.DEFAULT
    const finalConfig = {
      recursion_limit: config?.recursion_limit || baseConfig.recursion_limit,
      configurable: {
        ...baseConfig.configurable,
        ...(config?.configurable || {})
      }
    }

    // Create assistant using BB Agent API
    const response = await fetch(`${BB_AGENT_URL}/assistants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LANGSMITH_API_KEY
      },
      body: JSON.stringify({
        graph_id: AGENT_BB_CONFIG.GRAPH_ID,
        name: name,
        config: finalConfig,
        metadata: {
          description: description || '',
          created_via: 'bargainb-admin',
          template_used: 'DEFAULT'
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('BB Agent API error:', errorText)
      return NextResponse.json({ 
        success: false,
        error: `Failed to create assistant: ${response.status}` 
      }, { status: 500 })
    }

    const assistant = await response.json()

    return NextResponse.json({
      success: true,
      data: assistant
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating BB Agent assistant:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create assistant' 
    }, { status: 500 })
  }
} 