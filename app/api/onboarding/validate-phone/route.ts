import { NextRequest, NextResponse } from 'next/server'

const WASENDER_API_KEY = process.env.WASENDER_API_KEY

if (!WASENDER_API_KEY) {
  throw new Error('Missing WASENDER_API_KEY environment variable')
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Clean the phone number and format for WhatsApp
    const cleanPhone = phone
      .replace(/\D/g, '')        // Remove non-digits
      .replace(/^00/, '')        // Remove leading 00
      .replace(/^\+/, '')        // Remove leading +

    // Add @s.whatsapp.net suffix for WASender API
    const whatsappJid = `${cleanPhone}@s.whatsapp.net`

    // Call WASender API to check if number exists
    const response = await fetch(
      `https://www.wasenderapi.com/api/on-whatsapp/${whatsappJid}`,
      {
        headers: {
          'Authorization': `Bearer ${WASENDER_API_KEY}`
        }
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to validate phone number',
          details: data
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        phone: `+${cleanPhone}`,
        exists: data.data.exists,
        formatted: `+${cleanPhone.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4')}`
      }
    })

  } catch (error) {
    console.error('Error validating phone number:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to validate phone number',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 