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

    // Check if email already exists in user_profiles
    const { data: existingProfile } = await (supabaseAdmin as any)
      .from('user_profiles')
      .select('id, lifecycle_stage')
      .eq('email', normalizedEmail)
      .single()

    if (existingProfile) {
      // Email already exists in user_profiles
      if (existingProfile.lifecycle_stage === 'waitlist') {
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

    // Create a placeholder WhatsApp JID for email-only signup
    const placeholderJid = `waitlist_${Date.now()}_${Math.random().toString(36).substring(7)}@email.waitlist`
    
    // Create user profile with integrated WhatsApp data
    const { data: userProfile, error: profileError } = await (supabaseAdmin as any)
      .from('user_profiles')
      .insert({
        email: normalizedEmail,
        full_name: null, // Will be filled when they provide more info
        preferred_name: normalizedEmail.split('@')[0], // Use email prefix as preferred name
        lifecycle_stage: 'waitlist', // Waitlist users have their own lifecycle stage
        onboarding_completed: false,
        assistant_created: false,
        ai_introduction_sent: false,
        whatsapp_jid: placeholderJid,
        push_name: 'Waitlist User',
        display_name: normalizedEmail,
        whatsapp_raw_data: {
          source: 'waitlist_signup',
          signup_method: 'email_only',
          original_email: normalizedEmail
        },
        country_code: 'NL',
        language_code: 'nl',
        dietary_restrictions: null,
        budget_level: null,
        household_size: 1,
        store_preference: null,
        preferred_stores: [],
        store_websites: null
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating user profile for waitlist:', profileError)
      return NextResponse.json(
        { success: false, error: 'Failed to process waitlist signup' },
        { status: 500 }
      )
    }

    console.log('✅ New waitlist signup:', {
      email: normalizedEmail,
      profileId: userProfile.id
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      data: {
        profileId: userProfile.id,
        lifecycle_stage: userProfile.lifecycle_stage
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
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('lifecycle_stage', 'waitlist')

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