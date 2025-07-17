import { NextRequest, NextResponse } from 'next/server'
import { agentBBService } from '@/lib/agent-bb-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'user_id parameter is required'
      }, { status: 400 })
    }

    // Get user's assistant configuration
    const userConfig = await agentBBService.getUserConfigWithAssistant(userId)

    if (!userConfig || !userConfig.assistant_id) {
      return NextResponse.json({
        success: false,
        error: 'No assistant found for this user'
      }, { status: 404 })
    }

    // Get assistant details from Agent BB v2 API
    const assistant = await agentBBService.getAssistant(userConfig.assistant_id)

    return NextResponse.json({
      success: true,
      data: {
        user_config: userConfig,
        assistant: assistant
      }
    })

  } catch (error) {
    console.error('Error getting user assistant:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get user assistant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      country_code = 'NL',
      language_code = 'nl',
      dietary_restrictions = 'none',
      budget_level = 'medium',
      household_size = 1,
      store_preference = 'any',
      store_websites = 'ah.nl, jumbo.com, lidl.nl'
    } = body

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'user_id is required'
      }, { status: 400 })
    }

    console.log('🤖 Creating Agent BB v2 Assistant for user:', user_id)

    // Check if user already has an assistant
    const existingConfig = await agentBBService.getUserConfigWithAssistant(user_id)
    if (existingConfig && existingConfig.assistant_id) {
      return NextResponse.json({
        success: false,
        error: 'User already has an assistant',
        assistant_id: existingConfig.assistant_id
      }, { status: 409 })
    }

    // Create new assistant
    const assistant = await agentBBService.createUserAssistant({
      user_id,
      country_code,
      language_code,
      dietary_restrictions,
      budget_level,
      household_size,
      store_preference,
      store_websites
    })

    // Store assistant in conversation
    await agentBBService.storeAssistantInConversation(user_id, assistant)

    return NextResponse.json({
      success: true,
      data: {
        assistant: assistant,
        message: 'Assistant created and stored successfully'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user assistant:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create user assistant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const assistantId = searchParams.get('assistant_id')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'user_id parameter is required'
      }, { status: 400 })
    }

    // Get user's current assistant if not provided
    let targetAssistantId = assistantId
    if (!targetAssistantId) {
      const userConfig = await agentBBService.getUserConfigWithAssistant(userId)
      if (!userConfig || !userConfig.assistant_id) {
        return NextResponse.json({
          success: false,
          error: 'No assistant found for this user'
        }, { status: 404 })
      }
      targetAssistantId = userConfig.assistant_id
    }

    // Delete assistant from Agent BB v2
    await agentBBService.deleteAssistant(targetAssistantId)

    // Clear assistant data from conversation
    // Implementation would depend on having the conversation ID or user lookup

    return NextResponse.json({
      success: true,
      message: 'Assistant deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting user assistant:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user assistant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 