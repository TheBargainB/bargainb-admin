import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Get total interactions
    const { count: totalInteractions } = await supabaseAdmin
      .from('ai_interactions')
      .select('*', { count: 'exact', head: true });

    // Get average processing time
    const { data: avgData } = await supabaseAdmin
      .from('ai_interactions')
      .select('processing_time_ms');

    const avgProcessingTime = avgData && avgData.length > 0
      ? avgData.reduce((sum: number, record: any) => sum + (record.processing_time_ms || 0), 0) / avgData.length
      : 0;

    // Get total chats with AI enabled
    const { count: totalChatsWithAI } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('ai_enabled', true);

    // Get recent interactions
    const { data: recentInteractions } = await supabaseAdmin
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