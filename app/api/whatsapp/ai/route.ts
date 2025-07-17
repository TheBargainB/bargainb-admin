import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppAIService } from '@/lib/whatsapp-ai-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AI endpoint called');
    
    const { chatId, message, userId } = await request.json();

    // Validate required fields
    if (!chatId || !message || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: chatId, message, userId' 
      }, { status: 400 });
    }

    console.log('🔄 Processing AI request:', {
      chatId: chatId.substring(0, 8) + '...',
      message: message.substring(0, 50) + '...',
      userId: userId.substring(0, 8) + '...'
    });

    // Direct AI processing - no mention detection needed
    console.log('✅ Processing message with AI (direct communication)');

    try {
      // Process message directly with AI service
      const aiService = new WhatsAppAIService();
      const result = await aiService.processAIMessage(
        chatId, 
        message, // Use original message directly
        userId
      );

      if (result.success) {
        console.log('✅ AI processing successful');
        return NextResponse.json({ 
          aiResponse: result.aiResponse,
          success: true
        });
      } else {
        console.error('❌ AI processing failed:', result.error);
        return NextResponse.json({ 
          error: result.error,
          success: false
        }, { status: 500 });
      }

    } catch (processingError) {
      console.error('❌ AI processing error:', processingError);
      return NextResponse.json({ 
        error: `AI processing failed: ${processingError instanceof Error ? processingError.message : 'Unknown error'}`,
        success: false 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ AI API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 