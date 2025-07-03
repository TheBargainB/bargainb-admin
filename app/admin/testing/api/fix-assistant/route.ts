import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateAssistantForConversation } from '@/lib/assistant-service';

export async function POST(request: NextRequest) {
  try {
    const { conversationId } = await request.json();
    
    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'conversationId is required' },
        { status: 400 }
      );
    }

    console.log('🔧 Manually triggering assistant creation for conversation:', conversationId);
    
    // Try to create or get assistant for this conversation
    const assistantId = await getOrCreateAssistantForConversation(conversationId);
    
    if (assistantId) {
      console.log('✅ Successfully created/retrieved assistant:', assistantId);
      return NextResponse.json({
        success: true,
        data: {
          conversationId,
          assistantId,
          message: 'Assistant created/retrieved successfully'
        }
      });
    } else {
      console.log('❌ Failed to create/retrieve assistant');
      return NextResponse.json({
        success: false,
        error: 'Failed to create or retrieve assistant'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in fix-assistant endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 