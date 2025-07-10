import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { processWASenderWebhook } from '@/lib/whatsapp-ai-service'

// =============================================================================
// WEBHOOK VERIFICATION
// =============================================================================

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.log('⚠️  Missing signature or secret')
    return false
  }

  try {
    // For WASender, we typically just check if the signature matches the secret
    // This is a simple verification - in production you might want HMAC verification
    return signature === secret
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error)
    return false
  }
}

// =============================================================================
// WEBHOOK HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Received WASender webhook')
    
    // Get headers
    const headersList = headers()
    const signature = headersList.get('x-webhook-signature')
    const contentType = headersList.get('content-type')
    
    // Verify content type
    if (!contentType?.includes('application/json')) {
      console.error('❌ Invalid content type:', contentType)
      return NextResponse.json(
        { success: false, error: 'Invalid content type' },
        { status: 400 }
      )
    }

    // Get the raw body
    const body = await request.text()
    
    // Verify webhook signature if configured
    const webhookSecret = process.env.WASENDER_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      if (!verifyWebhookSignature(body, signature, webhookSecret)) {
        console.error('❌ Invalid webhook signature')
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    // Parse payload
    let payload
    try {
      payload = JSON.parse(body)
    } catch (error) {
      console.error('❌ Invalid JSON payload:', error)
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    console.log('📨 Webhook payload received:', {
      event: payload.event,
      messageCount: payload.data?.messages?.length || 0
    })

    // Process the webhook
    const result = await processWASenderWebhook(payload)

    if (!result.success) {
      console.error('❌ Webhook processing failed:', result.message)
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      )
    }

    console.log('✅ Webhook processed successfully')
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      received: true
    })

  } catch (error) {
    console.error('❌ Webhook handler error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// WEBHOOK VERIFICATION ENDPOINT (FOR WASENDER SETUP)
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Webhook verification request')
    
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')
    
    const verifyToken = process.env.WASENDER_VERIFY_TOKEN
    
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ Webhook verified successfully')
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    } else {
      console.error('❌ Webhook verification failed')
      return NextResponse.json(
        { success: false, error: 'Verification failed' },
        { status: 403 }
      )
    }
    
  } catch (error) {
    console.error('❌ Webhook verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Verification error' },
      { status: 500 }
    )
  }
}

// =============================================================================
// WEBHOOK STATUS ENDPOINT
// =============================================================================

export async function HEAD(request: NextRequest) {
  // Simple health check for webhook endpoint
  return new Response(null, { status: 200 })
} 