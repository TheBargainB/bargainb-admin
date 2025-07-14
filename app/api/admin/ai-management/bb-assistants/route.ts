import { NextRequest, NextResponse } from 'next/server'

const BB_AGENT_URL = 'https://agent-bb-cad80ee101cc572f9a46a59272c39cf5.us.langgraph.app'
const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY

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

    // Create assistant using BB Agent API
    const response = await fetch(`${BB_AGENT_URL}/assistants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LANGSMITH_API_KEY
      },
      body: JSON.stringify({
        graph_id: "product_retrieval_agent",
        name: name,
        config: {
          recursion_limit: config?.recursion_limit || 25,
          configurable: config?.configurable || {}
        },
        metadata: {
          description: description || '',
          created_via: 'bargainb-admin'
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