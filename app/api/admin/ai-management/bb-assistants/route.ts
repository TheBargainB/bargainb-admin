import { NextRequest, NextResponse } from 'next/server'

const BB_AGENT_URL = 'https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app'
const BB_AGENT_API_KEY = process.env.BB_AGENT_API_KEY || process.env.LANGGRAPH_API_KEY

export async function GET() {
  try {
    if (!BB_AGENT_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'BB Agent API key not configured' 
      }, { status: 500 })
    }

    // Search for all assistants using BB Agent API
    const response = await fetch(`${BB_AGENT_URL}/assistants/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': BB_AGENT_API_KEY
      },
      body: JSON.stringify({
        metadata: {},
        graph_id: "product_retrieval_agent",
        limit: 100,
        offset: 0,
        sort_by: "created_at",
        sort_order: "desc"
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
      assistants: assistants || []
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
    if (!BB_AGENT_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'BB Agent API key not configured' 
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

    // Create assistant using BB Agent API
    const response = await fetch(`${BB_AGENT_URL}/assistants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': BB_AGENT_API_KEY
      },
      body: JSON.stringify({
        graph_id: "product_retrieval_agent",
        name: name,
        description: description || null,
        config: {
          recursion_limit: config?.recursion_limit || 25,
          configurable: config?.configurable || {}
        },
        metadata: {},
        if_exists: "raise"
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
      assistant
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating BB Agent assistant:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create assistant' 
    }, { status: 500 })
  }
} 