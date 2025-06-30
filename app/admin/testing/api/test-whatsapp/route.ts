import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json()

    // Validate input
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Phone number and message are required' 
        },
        { status: 400 }
      )
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid phone number format. Use international format (+1234567890)' 
        },
        { status: 400 }
      )
    }

    // Check if WASender API key is available
    if (!process.env.WASENDER_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'WASender API key not configured' 
        },
        { status: 500 }
      )
    }

    // Prepare test message with QA prefix
    const testMessage = `[QA TEST - ${new Date().toLocaleString()}] ${message}`

    // Test WASender API endpoint
    const wasenderResponse = await fetch('https://api.wasender.co.uk/api/v1/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WASENDER_API_KEY}`
      },
      body: JSON.stringify({
        phone: phoneNumber,
        message: testMessage,
        type: 'text'
      })
    })

    const wasenderData = await wasenderResponse.json()

    if (!wasenderResponse.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'WASender API error',
          details: wasenderData,
          status: wasenderResponse.status
        },
        { status: 400 }
      )
    }

    // Log successful test for audit
    console.log(`[QA TEST] WhatsApp message sent successfully to ${phoneNumber}`)

    return NextResponse.json({
      success: true,
      data: {
        messageId: wasenderData.id || 'unknown',
        phoneNumber,
        message: testMessage,
        timestamp: new Date().toISOString(),
        wasenderResponse: wasenderData
      },
      message: 'Test message sent successfully'
    })

  } catch (error) {
    console.error('WhatsApp test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send test message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Health check for WhatsApp integration
export async function GET() {
  try {
    // Check if WASender API key is configured
    const hasApiKey = !!process.env.WASENDER_API_KEY
    
    return NextResponse.json({
      success: true,
      data: {
        apiKeyConfigured: hasApiKey,
        endpoint: 'https://api.wasender.co.uk/api/v1',
        lastChecked: new Date().toISOString()
      }
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'WhatsApp health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
