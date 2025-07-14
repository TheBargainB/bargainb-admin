import { NextRequest, NextResponse } from 'next/server'
import { AGENT_BB_CONFIG } from '@/lib/constants'

const BB_AGENT_URL = AGENT_BB_CONFIG.BASE_URL
const LANGSMITH_API_KEY = process.env[AGENT_BB_CONFIG.API_KEY_ENV]

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

    const payload: any = {}
    
    if (name) {
      payload.name = name
    }
    
    if (config) {
      payload.config = config
    }
    
    if (description !== undefined) {
      payload.metadata = {
        description: description,
        updated_via: 'bargainb-admin'
      }
    }

    // Update assistant using BB Agent API
    const response = await fetch(`${BB_AGENT_URL}/assistants/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LANGSMITH_API_KEY
      },
      body: JSON.stringify(payload)
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