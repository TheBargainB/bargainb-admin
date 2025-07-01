import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppAIService } from '@/lib/whatsapp-ai-service';

export async function POST(request: NextRequest) {
  try {
    const { chatId, message, userId } = await request.json();

    // Validate required fields
    if (!chatId || !message || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: chatId, message, userId' 
      }, { status: 400 });
    }

    // Check if message contains @bb mention
    const containsBBMention = /@bb/i.test(message);
    
    if (!containsBBMention) {
      return NextResponse.json({ 
        error: 'No @bb mention found',
        requiresAI: false 
      }, { status: 400 });
    }

    const aiService = new WhatsAppAIService();
    const result = await aiService.processAIMessage(chatId, message, userId);

    if (result.success) {
      return NextResponse.json({ 
        aiResponse: result.aiResponse,
        success: true 
      });
    } else {
      return NextResponse.json({ 
        error: result.error,
        success: false 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 