import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppAIService } from '@/lib/whatsapp-ai-service';
import { 
  detectBBMention, 
  processIncomingMessageWithFullPipeline 
} from '@/actions/chat-v2/messages.actions';
import { 
  ensureConversationHasAssistant,
  processBBMentionWithAssignment,
  getConversationPhoneNumber
} from '@/actions/chat-v2/assistant-assignment.actions';

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

    console.log('🔍 Processing @bb mention for:', {
      chatId: chatId.substring(0, 8) + '...',
      messageLength: message.length,
      userId: userId.substring(0, 8) + '...'
    });

    // Use enhanced @bb detection instead of simple regex
    const bbDetection = detectBBMention(message);
    
    if (!bbDetection.is_bb_mention) {
      console.log('❌ No @bb mention detected with enhanced detection');
      return NextResponse.json({ 
        error: 'No @bb mention found',
        requiresAI: false,
        detection: bbDetection
      }, { status: 400 });
    }

    console.log('✅ @bb mention detected:', {
      patterns: bbDetection.mention_patterns,
      userQuery: bbDetection.user_query
    });

    // Process with full pipeline (detection + assistant assignment)
    try {
      const pipelineResult = await processBBMentionWithAssignment(
        chatId,
        bbDetection
      );

      console.log('🔄 Pipeline result:', pipelineResult);

      if (!pipelineResult.ready_for_ai_processing) {
        console.error('❌ Pipeline processing failed:', pipelineResult.error);
        return NextResponse.json({ 
          error: `Pipeline error: ${pipelineResult.error}`,
          success: false 
        }, { status: 500 });
      }

      if (!pipelineResult.assistant_assigned) {
        console.warn('⚠️ No assistant assigned, attempting manual assignment...');
        
        // Get phone number for manual assignment
        const phoneNumber = await getConversationPhoneNumber(chatId);
        
        if (!phoneNumber) {
          console.error('❌ Could not get phone number for manual assignment');
          return NextResponse.json({ 
            error: 'Could not get phone number for assistant assignment',
            success: false 
          }, { status: 500 });
        }

        // Try manual assistant assignment as fallback
        const assistantId = await ensureConversationHasAssistant(chatId, phoneNumber, bbDetection);
        
        if (!assistantId) {
          console.error('❌ Manual assistant assignment failed');
          return NextResponse.json({ 
            error: 'Assistant assignment failed',
            success: false 
          }, { status: 500 });
        }

        console.log('✅ Manual assistant assignment successful:', assistantId);
      }

      // Process AI message with assigned assistant
      const aiService = new WhatsAppAIService();
      const result = await aiService.processAIMessage(
        chatId, 
        bbDetection.user_query, // Use cleaned query instead of raw message
        userId
      );

      if (result.success) {
        console.log('✅ AI processing successful');
        return NextResponse.json({ 
          aiResponse: result.aiResponse,
          success: true,
          pipeline: {
            bb_mention_detected: true,
            assistant_assigned: pipelineResult.assistant_assigned,
            assistant_id: pipelineResult.assistant_id,
            user_query: bbDetection.user_query,
            mention_patterns: bbDetection.mention_patterns
          }
        });
      } else {
        console.error('❌ AI processing failed:', result.error);
        return NextResponse.json({ 
          error: result.error,
          success: false,
          pipeline: {
            bb_mention_detected: true,
            assistant_assigned: pipelineResult.assistant_assigned,
            assistant_id: pipelineResult.assistant_id,
            user_query: bbDetection.user_query
          }
        }, { status: 500 });
      }

    } catch (pipelineError) {
      console.error('❌ Pipeline processing error:', pipelineError);
      return NextResponse.json({ 
        error: `Pipeline processing failed: ${pipelineError instanceof Error ? pipelineError.message : 'Unknown error'}`,
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