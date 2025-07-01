import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get total interactions
    const { count: totalInteractions } = await supabase
      .from('ai_interactions')
      .select('*', { count: 'exact', head: true });

    // Get average processing time
    const { data: avgData } = await supabase
      .from('ai_interactions')
      .select('processing_time_ms');

    const avgProcessingTime = avgData && avgData.length > 0
      ? avgData.reduce((sum, record) => sum + (record.processing_time_ms || 0), 0) / avgData.length
      : 0;

    // Get total chats with AI enabled
    const { count: totalChatsWithAI } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('ai_enabled', true);

    // Get recent interactions
    const { data: recentInteractions } = await supabase
      .from('ai_interactions')
      .select(`
        id,
        user_message,
        ai_response,
        processing_time_ms,
        tokens_used,
        created_at,
        success,
        error_message
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      totalInteractions: totalInteractions || 0,
      avgProcessingTime: Math.round(avgProcessingTime),
      totalChatsWithAI: totalChatsWithAI || 0,
      recentInteractions: recentInteractions || []
    });

  } catch (error) {
    console.error('Error fetching AI stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI statistics' },
      { status: 500 }
    );
  }
} 