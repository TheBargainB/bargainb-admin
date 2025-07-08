import { NextRequest, NextResponse } from 'next/server'

const BB_AGENT_URL = 'https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app'
const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY

export async function GET(
  request: NextRequest,
  { params }: { params: { assistantId: string } }
) {
  try {
    if (!LANGSMITH_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'LANGSMITH_API_KEY not configured' 
      }, { status: 500 })
    }

    const { assistantId } = params

    // Get assistant details using BB Agent API
    const response = await fetch(`${BB_AGENT_URL}/assistants/${assistantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LANGSMITH_API_KEY
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('BB Agent API error:', errorText)
      return NextResponse.json({ 
        success: false,
        error: `BB Agent API error: ${response.status}` 
      }, { status: 500 })
    }

    const assistant = await response.json()

    return NextResponse.json({
      success: true,
      assistant
    })
  } catch (error) {
    console.error('Error fetching BB Agent assistant:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch assistant' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { assistantId: string } }
) {
  try {
    if (!LANGSMITH_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'LANGSMITH_API_KEY not configured' 
      }, { status: 500 })
    }

    const { assistantId } = params

    // Delete assistant using BB Agent API
    const response = await fetch(`${BB_AGENT_URL}/assistants/${assistantId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LANGSMITH_API_KEY
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('BB Agent API error:', errorText)
      return NextResponse.json({ 
        success: false,
        error: `Failed to delete assistant: ${response.status}` 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Assistant deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting BB Agent assistant:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete assistant' 
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { assistantId: string } }
) {
  try {
    if (!LANGSMITH_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'LANGSMITH_API_KEY not configured' 
      }, { status: 500 })
    }

    const { assistantId } = params
    const body = await request.json()
    const { name, description, config } = body

    // Update assistant using BB Agent API
    const response = await fetch(`${BB_AGENT_URL}/assistants/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LANGSMITH_API_KEY
      },
      body: JSON.stringify({
        name: name,
        description: description,
        config: config
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('BB Agent API error:', errorText)
      return NextResponse.json({ 
        success: false,
        error: `Failed to update assistant: ${response.status}` 
      }, { status: 500 })
    }

    const assistant = await response.json()

    return NextResponse.json({
      success: true,
      assistant
    })
  } catch (error) {
    console.error('Error updating BB Agent assistant:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update assistant' 
    }, { status: 500 })
  }
} 