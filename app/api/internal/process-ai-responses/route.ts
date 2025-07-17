import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Find AI responses that haven't been sent via WhatsApp yet
    const { data: pendingAIResponses, error: fetchError } = await supabase
      .rpc('get_pending_ai_responses')

    if (fetchError) {
      console.error('❌ Error fetching pending AI responses:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch pending responses' },
        { status: 500 }
      )
    }

    if (!pendingAIResponses || pendingAIResponses.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No pending AI responses to process'
      })
    }

    console.log(`📋 Processing ${pendingAIResponses.length} pending AI responses...`)

    const results = []

    // Process each pending AI response
    for (const aiResponse of pendingAIResponses) {
      try {
        const phoneNumber = `+${aiResponse.phone_number}`
        
        console.log(`📤 Sending WhatsApp message to ${phoneNumber}...`)

        // Send WhatsApp message
        const whatsappResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/whatsapp/send-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: phoneNumber,
            text: aiResponse.content
          })
        })

        const whatsappData = await whatsappResponse.json()
        
        let whatsappStatus = 'failed'
        let whatsappMessageId = null
        let failureReason = null

        if (whatsappResponse.ok && whatsappData.success) {
          whatsappStatus = 'sent'
          whatsappMessageId = whatsappData.data?.data?.msgId?.toString()
          console.log(`✅ WhatsApp sent successfully, message ID: ${whatsappMessageId}`)
        } else {
          failureReason = whatsappData.error || 'Unknown WhatsApp API error'
          console.error(`❌ WhatsApp send failed:`, failureReason)
        }

        // Save to user_conversations
        const { error: saveError } = await supabase
          .from('user_conversations')
          .insert({
            user_profile_id: aiResponse.user_profile_id,
            assistant_id: aiResponse.assistant_id,
            thread_id: aiResponse.thread_id,
            message_type: 'ai_response',
            content: aiResponse.content,
            ai_message_id: aiResponse.id,
            run_id: aiResponse.run_id,
            whatsapp_jid: aiResponse.whatsapp_jid,
            whatsapp_message_id: whatsappMessageId,
            whatsapp_status: whatsappStatus,
            sent_at: whatsappStatus === 'sent' ? new Date().toISOString() : null,
            failed_at: whatsappStatus === 'failed' ? new Date().toISOString() : null,
            failure_reason: failureReason
          })

        if (saveError) {
          console.error('❌ Error saving to user_conversations:', saveError)
          results.push({
            ai_message_id: aiResponse.id,
            status: 'error',
            error: 'Failed to save conversation record'
          })
        } else {
          console.log('✅ Saved conversation record')
          results.push({
            ai_message_id: aiResponse.id,
            status: whatsappStatus,
            whatsapp_message_id: whatsappMessageId,
            phone_number: phoneNumber
          })
        }

      } catch (error) {
        console.error(`❌ Error processing AI response ${aiResponse.id}:`, error)
        results.push({
          ai_message_id: aiResponse.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results: results,
      message: `Processed ${results.length} AI responses`
    })

  } catch (error) {
    console.error('❌ Error in process-ai-responses route:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 