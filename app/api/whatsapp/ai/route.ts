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
      // IMMEDIATE TEST: Try to send WhatsApp message directly in this context
      try {
        const apiKey = process.env.WASENDER_API_KEY;
        if (apiKey && result.aiResponse) {
          const directResponse = await fetch('https://www.wasenderapi.com/api/send-message', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              to: '+31614539919',
              text: `[DIRECT TEST] ${result.aiResponse.substring(0, 100)}...`
            }),
          });
          
          if (directResponse.ok) {
            const directData = await directResponse.json();
            console.log('✅ DIRECT TEST SUCCESS:', directData);
          } else {
            console.log('❌ DIRECT TEST FAILED:', directResponse.status);
          }
        } else {
          console.log('❌ NO API KEY IN AI CONTEXT OR NO AI RESPONSE');
        }
      } catch (directError) {
        console.log('❌ DIRECT TEST ERROR:', directError);
      }

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