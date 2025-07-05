import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        ai_enabled, 
        ai_config, 
        ai_thread_id,
        assistant_id,
        assistant_name,
        assistant_created_at,
        assistant_config,
        assistant_metadata
      `)
      .eq('id', chatId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching AI config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('conversations')
      .update({
        ai_enabled: body.enabled,
        ai_config: {
          enabled: body.enabled,
          response_style: body.response_style || 'helpful',
          auto_respond: body.auto_respond || false,
          keywords: body.keywords || [],
          // Enhanced configuration options
          guard_rails_enabled: body.guard_rails_enabled !== undefined ? body.guard_rails_enabled : true,
          max_message_length: body.max_message_length || 500,
          spam_detection: body.spam_detection !== undefined ? body.spam_detection : true,
          content_filtering: body.content_filtering !== undefined ? body.content_filtering : true,
          max_tokens_per_request: body.max_tokens_per_request || 4000,
          request_timeout: body.request_timeout || 30,
          max_tool_calls: body.max_tool_calls || 5,
          fallback_responses: body.fallback_responses !== undefined ? body.fallback_responses : true,
          custom_instructions: body.custom_instructions || '',
          temperature: body.temperature || 0.7,
          max_tokens_per_hour: body.max_tokens_per_hour || 20000
        }
      })
      .eq('id', chatId)
      .select(`
        ai_enabled, 
        ai_config, 
        ai_thread_id,
        assistant_id,
        assistant_name,
        assistant_created_at,
        assistant_config,
        assistant_metadata
      `);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error updating AI config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 