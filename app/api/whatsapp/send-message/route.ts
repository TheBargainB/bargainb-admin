import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { to, text, imageUrl, videoUrl, documentUrl, audioUrl, stickerUrl, contact, location } = await request.json()

    // Validate required fields
    if (!to || !text) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to and text are required' },
        { status: 400 }
      )
    }

    // Get WASender API credentials from environment
    const wasenderApiKey = process.env.WASENDER_API_KEY
    const wasenderApiUrl = process.env.WASENDER_API_URL || 'https://www.wasenderapi.com'

    if (!wasenderApiKey) {
      console.error('WASENDER_API_KEY not found in environment variables')
      return NextResponse.json(
        { success: false, error: 'WASender API key not configured' },
        { status: 500 }
      )
    }

    // Prepare the payload for WASender API
    const payload: any = {
      to: to,
      text: text
    }

    // Add optional fields if provided
    if (imageUrl) payload.imageUrl = imageUrl
    if (videoUrl) payload.videoUrl = videoUrl
    if (documentUrl) payload.documentUrl = documentUrl
    if (audioUrl) payload.audioUrl = audioUrl
    if (stickerUrl) payload.stickerUrl = stickerUrl
    if (contact) payload.contact = contact
    if (location) payload.location = location

    console.log('📤 Sending WhatsApp message via WASender API:', {
      to: to,
      textPreview: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      hasMedia: !!(imageUrl || videoUrl || documentUrl || audioUrl || stickerUrl)
    })

    // Send message via WASender API
    const wasenderResponse = await fetch(`${wasenderApiUrl}/api/send-message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${wasenderApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const responseData = await wasenderResponse.json()

    if (wasenderResponse.ok) {
      console.log('✅ WASender API success:', responseData)
      
      return NextResponse.json({
        success: true,
        data: responseData,
        message: 'Message sent successfully'
      })
    } else {
      console.error('❌ WASender API error:', responseData)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to send message via WASender API',
        details: responseData
      }, { status: wasenderResponse.status })
    }

  } catch (error) {
    console.error('❌ Error in WhatsApp send-message route:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 