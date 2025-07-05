import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to test database operations
const testDatabaseOperations = async () => {
  console.log('🔄 Testing database operations...')
  
  const startTime = Date.now()
  
  const results = {
    basicSelect: false,
    contactsTable: false,
    conversationsTable: false,
    messagesTable: false,
    adminUsersTable: false,
    error: null as string | null
  }

  try {
    // Test 1: Basic connection test
    console.log('📊 Testing basic connection...')
    const { data: basicTest, error: basicError } = await supabaseAdmin
      .from('conversations')
      .select('count')
      .limit(1)
      .single()
    
    if (!basicError) {
      results.basicSelect = true
      console.log('✅ Basic database connection successful')
    } else {
      console.error('❌ Basic connection failed:', basicError.message)
    }

    // Test 2: Check specific conversation (Focused Creativity)
    const focusedCreativityConvId = '74c46d53-4881-407c-b46b-ec695fb11c38';
    const { data: conversation, error: convError } = await supabaseAdmin
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
      const { data: insertData, error: insertError } = await supabaseAdmin
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
        await supabaseAdmin
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
    const { data: schemaData, error: schemaError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .limit(0); // Just check schema, don't return data

    return {
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      checks: {
        supabaseUrlConfigured: true,
        serviceKeyConfigured: true,
        basicConnection: !basicError,
        conversationExists: !convError && !!conversation,
        insertTest: insertTest,
        schemaValid: !schemaError,
      },
      data: {
        conversation: convError ? null : conversation,
        totalConversations: basicTest?.count || 0,
      },
      errors: {
        connectionError: basicError?.message,
        conversationError: convError?.message,
        schemaError: schemaError?.message,
      },
      recommendations: getRecommendations({
        testError: basicError || null,
        convError: convError || null,
        insertTest: insertTest || null,
        schemaError: schemaError || null
      })
    };

  } catch (networkError) {
    return {
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
    };
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
  
  if (errors.insertTest && typeof errors.insertTest === 'object' && errors.insertTest !== null) {
    const insertTest = errors.insertTest as { success?: boolean; error?: string };
    if (!insertTest.success) {
      recommendations.push(`Message insert test failed: ${insertTest.error}`);
      if (insertTest.error?.includes('column')) {
        recommendations.push('Database schema issue - check if all required columns exist');
      }
      if (insertTest.error?.includes('foreign key')) {
        recommendations.push('Foreign key constraint issue - verify conversation exists');
      }
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
    const supabase = supabaseAdmin;

    // Test basic connectivity
    const startTime = Date.now();
    
    try {
      const results = await testDatabaseOperations();
      return NextResponse.json(results);
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