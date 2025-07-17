import { NextRequest, NextResponse } from 'next/server';
import { AGENT_BB_CONFIG } from '@/lib/constants';

const config = {
  baseUrl: AGENT_BB_CONFIG.BASE_URL,
  apiKey: process.env[AGENT_BB_CONFIG.API_KEY_ENV],
  assistantId: '550e8400-e29b-41d4-a716-446655440000' // Use the UUID we created
}

export async function GET() {
  console.log('🔍 AI Test Route - Starting connection test...');
  console.log('📋 Config validation:');
  console.log('  - Base URL:', config.baseUrl);
  console.log('  - API Key present:', !!config.apiKey);
  console.log('  - API Key length:', config.apiKey?.length || 0);
  console.log('  - Assistant ID:', config.assistantId);
  console.log('  - Environment:', process.env.NODE_ENV);

  try {
    // Skip test during build time if no API key
    if (!config.apiKey) {
      console.log('⚠️ Skipping test - API key not available');
      return NextResponse.json({
        success: false,
        connection: 'skipped',
        message: 'API key not available during build',
        debug: {
          envVarName: AGENT_BB_CONFIG.API_KEY_ENV,
          nodeEnv: process.env.NODE_ENV
        }
      });
    }

    console.log('🚀 Step 1: Testing basic connection by creating thread...');
    
    // Test basic connection by creating a simple thread
    const threadPayload = {
      metadata: { test: true, source: 'connection_test', timestamp: new Date().toISOString() }
    };
    console.log('📤 Thread creation payload:', JSON.stringify(threadPayload, null, 2));

    const testResponse = await fetch(`${config.baseUrl}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.apiKey
      },
      body: JSON.stringify(threadPayload)
    });

    console.log('📥 Thread creation response status:', testResponse.status);
    console.log('📥 Thread creation response headers:', Object.fromEntries(testResponse.headers.entries()));

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('❌ Thread creation failed:');
      console.error('  - Status:', testResponse.status);
      console.error('  - Error text:', errorText);
      throw new Error(`Connection test failed: ${testResponse.status} ${errorText}`);
    }

    const testData = await testResponse.json();
    console.log('✅ Thread created successfully:', JSON.stringify(testData, null, 2));

    console.log('🚀 Step 2: Getting assistant information...');
    
    // Get assistant information
    const assistantResponse = await fetch(`${config.baseUrl}/assistants/${config.assistantId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': config.apiKey
      }
    });

    console.log('📥 Assistant response status:', assistantResponse.status);
    console.log('📥 Assistant response headers:', Object.fromEntries(assistantResponse.headers.entries()));

    let assistantInfo = null;
    if (assistantResponse.ok) {
      assistantInfo = await assistantResponse.json();
      console.log('✅ Assistant found:', JSON.stringify(assistantInfo, null, 2));
    } else {
      const assistantErrorText = await assistantResponse.text();
      console.warn('⚠️ Assistant not found or error:');
      console.warn('  - Status:', assistantResponse.status);
      console.warn('  - Error text:', assistantErrorText);
      console.warn('  - May need to create assistant');
    }

    console.log('🚀 Step 3: Cleaning up test thread...');
    
    // Clean up test thread
    if (testData.thread_id) {
      try {
        const deleteResponse = await fetch(`${config.baseUrl}/threads/${testData.thread_id}`, {
          method: 'DELETE',
          headers: {
            'X-Api-Key': config.apiKey
          }
        });
        
        console.log('📥 Thread deletion response status:', deleteResponse.status);
        
        if (deleteResponse.ok) {
          console.log('✅ Test thread cleaned up successfully');
        } else {
          const deleteErrorText = await deleteResponse.text();
          console.warn('⚠️ Failed to delete test thread:', deleteErrorText);
        }
      } catch (error) {
        console.warn('⚠️ Exception during test thread cleanup:', error);
      }
    } else {
      console.warn('⚠️ No thread_id to clean up');
    }

    console.log('🎉 AI connection test completed successfully!');

    return NextResponse.json({
      success: true,
      connection: 'connected',
      assistant: assistantInfo,
      testThreadId: testData.thread_id,
      debug: {
        config: {
          baseUrl: config.baseUrl,
          apiKeyLength: config.apiKey?.length || 0,
          assistantId: config.assistantId
        },
        steps: {
          threadCreation: 'success',
          assistantFetch: assistantResponse.ok ? 'success' : 'failed',
          threadCleanup: 'attempted'
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ AI connection test failed with error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    // Additional debugging info
    const debugInfo = {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      config: {
        baseUrl: config.baseUrl,
        apiKeyPresent: !!config.apiKey,
        apiKeyLength: config.apiKey?.length || 0,
        assistantId: config.assistantId
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    };
    
    console.error('🔍 Debug info:', JSON.stringify(debugInfo, null, 2));
    
    // Don't fail the build, just log the error
    return NextResponse.json({
      success: false,
      connection: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: debugInfo
    }, { status: 200 }); // Return 200 to prevent build failure
  }
} 