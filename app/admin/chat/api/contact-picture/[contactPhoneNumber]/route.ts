import { NextRequest, NextResponse } from 'next/server'
import { ContactService } from '../../../lib/contact-service'

const apiKey = process.env.WASENDER_API_KEY;

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

    console.log(`📸 Fetching profile picture for contact: ${contactPhoneNumber}`)

    // Call WaSender API to get contact profile picture
    const response = await fetch(
      `https://www.wasenderapi.com/api/contacts/${contactPhoneNumber}/picture`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    )

    if (!response.ok) {
      console.error(`❌ WaSender API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { success: false, error: `WaSender API error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log(`✅ Profile picture response:`, result)

    if (result.success && result.data?.imgUrl) {
      // Update contact image in database
      console.log('💾 Updating contact image in database...');
      const updated = await ContactService.updateContactImage(contactPhoneNumber, result.data.imgUrl);

      return NextResponse.json({
        success: true,
        data: {
          contactPhoneNumber,
          imgUrl: result.data.imgUrl,
          updated
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'No profile picture available',
        data: {
          contactPhoneNumber,
          imgUrl: null
        }
      })
    }

  } catch (error) {
    console.error('❌ Error fetching contact profile picture:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact profile picture' },
      { status: 500 }
    )
  }
} 