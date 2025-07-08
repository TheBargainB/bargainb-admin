import { NextRequest, NextResponse } from 'next/server'

// This endpoint handles sidebar state changes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { state } = body

    // Return success response
    return NextResponse.json({
      success: true,
      data: { state }
    })
  } catch (error) {
    console.error('Error in POST /admin/changed:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// This endpoint returns the current sidebar state
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: { state: 'expanded' } // Default state
    })
  } catch (error) {
    console.error('Error in GET /admin/changed:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 