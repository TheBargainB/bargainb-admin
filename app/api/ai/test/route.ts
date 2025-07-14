import { NextRequest, NextResponse } from 'next/server';
import { AGENT_BB_CONFIG } from '@/lib/constants';

const config = {
  baseUrl: process.env.BARGAINB_API_URL || AGENT_BB_CONFIG.BASE_URL,
  apiKey: process.env[AGENT_BB_CONFIG.API_KEY_ENV] || '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',
  assistantId: process.env.BARGAINB_ASSISTANT_ID || '5fd12ecb-9268-51f0-8168-fc7952c7c8b8'
}

export async function GET() {
  try {
    // Test basic connection by creating a simple thread
    const testResponse = await fetch(`${config.baseUrl}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.apiKey
      },
      body: JSON.stringify({
        metadata: { test: true, source: 'connection_test' }
      })
    });

    if (!testResponse.ok) {
      throw new Error(`Connection test failed: ${testResponse.statusText}`);
    }

    const testData = await testResponse.json();

    // Get assistant information
    const assistantResponse = await fetch(`${config.baseUrl}/assistants/${config.assistantId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': config.apiKey
      }
    });

    let assistantInfo = null;
    if (assistantResponse.ok) {
      assistantInfo = await assistantResponse.json();
    }

    // Clean up test thread
    if (testData.thread_id) {
      try {
        await fetch(`${config.baseUrl}/threads/${testData.thread_id}`, {
          method: 'DELETE',
          headers: {
            'X-Api-Key': config.apiKey
          }
        });
      } catch (error) {
        console.warn('Failed to clean up test thread:', error);
      }
    }

    return NextResponse.json({
      success: true,
      connection: 'connected',
      assistant: assistantInfo,
      testThreadId: testData.thread_id
    });

  } catch (error) {
    console.error('AI connection test failed:', error);
    return NextResponse.json({
      success: false,
      connection: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 