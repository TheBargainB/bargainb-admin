import { NextRequest, NextResponse } from 'next/server'
import { ContactService } from '../../../lib/contact-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contactPhoneNumber: string }> }
) {
  try {
    const { contactPhoneNumber } = await params
    
    if (!contactPhoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Contact phone number is required' },
        { status: 400 }
      )
    }

    console.log(`📋 Fetching contact info for: ${contactPhoneNumber}`)

    const apiKey = process.env.WASENDER_API_KEY;
    const apiUrl = process.env.WASENDER_API_URL || 'https://www.wasenderapi.com';
    
    if (!apiKey) {
      console.error('❌ WASENDER_API_KEY not found in environment variables');
      return NextResponse.json(
        { success: false, error: 'WASender API key not configured' }, 
        { status: 500 }
      );
    }

    // Call WaSender API to get contact information
    const response = await fetch(
      `${apiUrl}/api/contacts/${contactPhoneNumber}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log(`📡 WaSender API response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      console.error(`❌ WaSender API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { success: false, error: `WaSender API error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log(`✅ Contact info response:`, result)

    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: {
          id: result.data.id,
          name: result.data.name,
          notify: result.data.notify,
          verifiedName: result.data.verifiedName,
          imgUrl: result.data.imgUrl,
          status: result.data.status,
          contactPhoneNumber
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Contact not found or invalid response',
        data: null
      })
    }

  } catch (error) {
    console.error('❌ Error fetching contact information:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact information' },
      { status: 500 }
    )
  }
} 