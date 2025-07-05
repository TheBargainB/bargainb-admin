import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')

    const { data: interactions, error } = await supabaseAdmin
      .from('ai_interactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching AI interactions:', error)
      return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: 500 })
    }

    return NextResponse.json(interactions || [])
  } catch (error) {
    console.error('Error in interactions API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 