import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

// Validation schema for waitlist signup
const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the email
    const { email } = waitlistSchema.parse(body)
    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists in CRM
    const { data: existingProfile } = await (supabaseAdmin as any)
      .from('crm_profiles')
      .select('id, lifecycle_stage')
      .eq('email', normalizedEmail)
      .single()

    if (existingProfile) {
      // Email already exists in CRM
      if (existingProfile.lifecycle_stage === 'prospect') {
        return NextResponse.json({
          success: true,
          message: 'You\'re already on our waitlist!',
          alreadyExists: true
        })
      } else {
        return NextResponse.json({
          success: true,
          message: 'You\'re already in our system!',
          alreadyExists: true
        })
      }
    }

    // Create a placeholder WhatsApp contact for email-only signup
    const placeholderJid = `waitlist_${Date.now()}_${Math.random().toString(36).substring(7)}@email.waitlist`
    
    const { data: whatsappContact, error: whatsappError } = await (supabaseAdmin as any)
      .from('whatsapp_contacts')
      .insert({
        phone_number: `waitlist_${Date.now()}`, // Unique placeholder
        whatsapp_jid: placeholderJid,
        push_name: 'Waitlist User',
        display_name: normalizedEmail,
        whatsapp_status: 'waitlist',
        is_active: true,
        raw_contact_data: {
          source: 'waitlist_signup',
          signup_method: 'email_only',
          original_email: normalizedEmail
        }
      })
      .select()
      .single()

    if (whatsappError) {
      console.error('Error creating WhatsApp contact for waitlist:', whatsappError)
      return NextResponse.json(
        { success: false, error: 'Failed to process waitlist signup' },
        { status: 500 }
      )
    }

    // Create CRM profile linked to the WhatsApp contact
    const { data: crmProfile, error: crmError } = await (supabaseAdmin as any)
      .from('crm_profiles')
      .insert({
        whatsapp_contact_id: whatsappContact.id,
        email: normalizedEmail,
        full_name: null, // Will be filled when they provide more info
        preferred_name: normalizedEmail.split('@')[0], // Use email prefix as preferred name
        lifecycle_stage: 'prospect', // Waitlist users start as prospects
        customer_since: new Date().toISOString(),
        preferred_stores: [],
        shopping_persona: null,
        dietary_restrictions: [],
        engagement_score: 10, // Low score for email-only signup
        total_conversations: 0,
        total_messages: 0,
        tags: ['waitlist_signup', 'email_only'],
        notes: 'Signed up for waitlist via website'
      })
      .select()
      .single()

    if (crmError) {
      console.error('Error creating CRM profile for waitlist:', crmError)
      // Clean up the WhatsApp contact if CRM profile creation fails
      await (supabaseAdmin as any)
        .from('whatsapp_contacts')
        .delete()
        .eq('id', whatsappContact.id)
      
      return NextResponse.json(
        { success: false, error: 'Failed to process waitlist signup' },
        { status: 500 }
      )
    }

    // Create a customer event to track the waitlist signup
    try {
      await (supabaseAdmin as any)
        .from('customer_events')
        .insert({
          crm_profile_id: crmProfile.id,
          event_type: 'waitlist_signup',
          event_description: 'User signed up for the waitlist via website',
          event_data: {
            email: normalizedEmail,
            signup_source: 'website_waitlist',
            user_agent: request.headers.get('user-agent'),
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
          }
        })
    } catch (eventError) {
      console.warn('Failed to create customer event:', eventError)
      // Don't fail the request if event tracking fails
    }

    console.log('✅ New waitlist signup:', {
      email: normalizedEmail,
      contactId: whatsappContact.id,
      profileId: crmProfile.id
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      data: {
        profileId: crmProfile.id,
        lifecycle_stage: crmProfile.lifecycle_stage
      }
    })

  } catch (error) {
    console.error('Error in waitlist signup:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.errors[0]?.message || 'Invalid email address' 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint to get waitlist stats
export async function GET() {
  try {
    const { count } = await (supabaseAdmin as any)
      .from('crm_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('lifecycle_stage', 'prospect')
      .contains('tags', ['waitlist_signup'])

    return NextResponse.json({
      success: true,
      data: {
        waitlistCount: count || 0
      }
    })
  } catch (error) {
    console.error('Error getting waitlist stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get waitlist stats' },
      { status: 500 }
    )
  }
} 