import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppAIService } from '@/lib/whatsapp-ai-service';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing WhatsApp and AI connections...');
    
    const aiService = new WhatsAppAIService();
    
    // Test WhatsApp API connection
    const whatsappTest = await aiService.testWhatsAppConnection();
    
    // Test AI service connection
    const aiTest = await aiService.testAIConnection();
    
    // Check environment variables
    const envCheck = {
      WASENDER_API_KEY: !!process.env.WASENDER_API_KEY,
      WASENDER_API_KEY_LENGTH: process.env.WASENDER_API_KEY?.length || 0,
      WASENDER_API_URL: process.env.WASENDER_API_URL || 'https://www.wasenderapi.com',
      BARGAINB_API_URL: !!process.env.BARGAINB_API_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    };
    
    return NextResponse.json({
      success: true,
      tests: {
        whatsapp_connection: whatsappTest,
        ai_connection: aiTest,
        environment_variables: envCheck
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 