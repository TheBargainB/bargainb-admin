import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Test environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        checks: {
          supabaseUrlConfigured: !!supabaseUrl,
          serviceKeyConfigured: !!supabaseServiceKey,
        }
      }, { status: 500 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Test basic connectivity
    const startTime = Date.now();
    
    try {
      // Test 1: Basic connection
      const { data: testData, error: testError } = await supabase
        .from('conversations')
        .select('id, title')
        .limit(1);

      if (testError) {
        return NextResponse.json({
          success: false,
          error: 'Supabase connection failed',
          details: testError.message,
          responseTime: Date.now() - startTime
        });
      }

      // Test 2: Check specific conversation (Focused Creativity)
      const focusedCreativityConvId = '74c46d53-4881-407c-b46b-ec695fb11c38';
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          ai_enabled,
          ai_thread_id,
          whatsapp_contact_id,
          whatsapp_contacts (
            id,
            phone_number,
            display_name,
            push_name
          )
        `)
        .eq('id', focusedCreativityConvId)
        .single();

      // Test 3: Try inserting a test message (to replicate the failing operation)
      const testMessageId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      let insertTest = null;
      try {
        const { data: insertData, error: insertError } = await supabase
          .from('messages')
          .insert({
            conversation_id: focusedCreativityConvId,
            whatsapp_message_id: testMessageId,
            content: 'Test message for database connectivity',
            message_type: 'text',
            direction: 'outbound',
            from_me: true,
            sender_type: 'test',
            is_ai_triggered: false,
          })
          .select();

        if (insertError) {
          insertTest = { success: false, error: insertError.message };
        } else {
          insertTest = { success: true, messageId: testMessageId };
          
          // Clean up test message
          await supabase
            .from('messages')
            .delete()
            .eq('whatsapp_message_id', testMessageId);
        }
      } catch (insertErr) {
        insertTest = { 
          success: false, 
          error: insertErr instanceof Error ? insertErr.message : String(insertErr) 
        };
      }

      // Test 4: Check database schema
      const { data: schemaData, error: schemaError } = await supabase
        .from('messages')
        .select('*')
        .limit(0); // Just check schema, don't return data

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        checks: {
          supabaseUrlConfigured: true,
          serviceKeyConfigured: true,
          basicConnection: !testError,
          conversationExists: !convError && !!conversation,
          insertTest: insertTest,
          schemaValid: !schemaError,
        },
        data: {
          conversation: convError ? null : conversation,
          totalConversations: testData?.length || 0,
        },
        errors: {
          connectionError: testError?.message,
          conversationError: convError?.message,
          schemaError: schemaError?.message,
        },
        recommendations: getRecommendations({
          testError: testError || null,
          convError: convError || null,
          insertTest: insertTest || null,
          schemaError: schemaError || null
        })
      });

    } catch (networkError) {
      return NextResponse.json({
        success: false,
        error: 'Network connectivity issue',
        details: networkError instanceof Error ? networkError.message : String(networkError),
        responseTime: Date.now() - startTime,
        recommendations: [
          'Check internet connectivity',
          'Verify Supabase URL is accessible',
          'Check if there are firewall restrictions',
          'Verify Supabase service is operational'
        ]
      });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Service initialization failed',
      details: error instanceof Error ? error.message : String(error),
      recommendations: [
        'Check environment variable configuration',
        'Verify Supabase credentials',
        'Ensure server-side execution context'
      ]
    }, { status: 500 });
  }
}

const getRecommendations = (errors: {
  testError?: unknown;
  convError?: unknown;
  insertTest?: unknown;
  schemaError?: unknown;
}): string[] => {
  const recommendations: string[] = [];
  
  if (errors.testError) {
    recommendations.push('Basic Supabase connection failed - check URL and service key');
    const errorMessage = typeof errors.testError === 'object' && errors.testError !== null && 'message' in errors.testError
      ? String((errors.testError as { message: unknown }).message) 
      : String(errors.testError);
    if (errorMessage.includes('auth')) {
      recommendations.push('Authentication failed - verify SUPABASE_SERVICE_ROLE_KEY');
    }
  }
  
  if (errors.convError) {
    recommendations.push('Conversation lookup failed - check if conversation exists');
  }
  
  if (errors.insertTest && !errors.insertTest.success) {
    recommendations.push(`Message insert test failed: ${errors.insertTest.error}`);
    if (errors.insertTest.error?.includes('column')) {
      recommendations.push('Database schema issue - check if all required columns exist');
    }
    if (errors.insertTest.error?.includes('foreign key')) {
      recommendations.push('Foreign key constraint issue - verify conversation exists');
    }
  }
  
  if (errors.schemaError) {
    recommendations.push('Database schema validation failed - check table structure');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All database tests passed - the issue may be intermittent');
    recommendations.push('Check Vercel logs for more specific error context');
  }
  
  return recommendations;
}; 