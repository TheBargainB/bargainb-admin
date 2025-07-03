import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: assignments, error } = await supabase
      .from('conversation_assistants')
      .select('*')
      .order('assistant_created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user assignments:', error)
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
    }

    return NextResponse.json(assignments || [])
  } catch (error) {
    console.error('Error in assignments API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 