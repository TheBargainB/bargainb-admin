import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

// Validation schema for early access signup - now accepts international phone numbers
const earlyAccessSchema = z.object({
  phoneNumber: z.string()
    .min(8, 'Phone number must be at least 8 characters')
    .max(20, 'Phone number must be at most 20 characters')
    .regex(/^\+[1-9]\d{1,14}$/, 'Please enter a valid international phone number')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the phone number
    const { phoneNumber } = earlyAccessSchema.parse(body)

    // Check if phone number already exists in user_profiles
    const { data: existingProfile } = await (supabaseAdmin as any)
      .from('user_profiles')
      .select('id, lifecycle_stage')
      .eq('phone_number', phoneNumber)
      .single()

    if (existingProfile) {
      // Check if they're already in early access
      if (existingProfile.lifecycle_stage === 'early_access') {
        return NextResponse.json({
          success: true,
          message: 'You are already on the early access list!',
          alreadyExists: true
        })
      } else {
        return NextResponse.json({
          success: true,
          message: 'This phone number is already in our system!',
          alreadyExists: true
        })
      }
    }

    // Create a placeholder WhatsApp JID for phone-only signup
    const placeholderJid = `early_${Date.now()}_${Math.random().toString(36).substring(7)}@phone.early`
    
    // Create user profile with integrated WhatsApp data
    const { data: userProfile, error: profileError } = await (supabaseAdmin as any)
      .from('user_profiles')
      .insert({
        phone_number: phoneNumber,
        email: null,
        full_name: null,
        preferred_name: phoneNumber.replace('+', ''), // Use phone number as preferred name
        lifecycle_stage: 'early_access', // Use early_access lifecycle stage
        onboarding_completed: false,
        assistant_created: false,
        ai_introduction_sent: false,
        whatsapp_jid: placeholderJid,
        push_name: 'Early Access User',
        display_name: phoneNumber,
        whatsapp_raw_data: {
          source: 'early_access_signup',
          signup_method: 'phone_only',
          original_phone: phoneNumber
        },
        country_code: null, // Let the system detect based on phone number
        language_code: 'en', // Default to English
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
      console.error('Error creating user profile for early access:', profileError)
      return NextResponse.json(
        { success: false, error: 'Failed to process early access signup' },
        { status: 500 }
      )
    }

    console.log('✅ New early access signup:', {
      phoneNumber,
      profileId: userProfile.id
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully joined early access!',
      data: {
        profileId: userProfile.id,
        lifecycle_stage: userProfile.lifecycle_stage
      }
    })

  } catch (error) {
    console.error('Error in early access signup:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.errors[0]?.message || 'Invalid phone number format' 
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

// Optional: GET endpoint to get early access stats
export async function GET() {
  try {
    const { count } = await (supabaseAdmin as any)
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('lifecycle_stage', 'early_access')

    return NextResponse.json({
      success: true,
      data: {
        earlyAccessCount: count || 0
      }
    })
  } catch (error) {
    console.error('Error getting early access stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get early access stats' },
      { status: 500 }
    )
  }
} 