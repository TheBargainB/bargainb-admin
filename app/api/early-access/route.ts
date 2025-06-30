import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

// Validation schema for early access signup
const earlyAccessSchema = z.object({
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(15, 'Phone number must be at most 15 characters')
    .regex(/^\+31[0-9]{8,11}$/, 'Invalid Dutch phone number format')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the phone number
    const { phoneNumber } = earlyAccessSchema.parse(body)

    // Check if phone number already exists in CRM by looking for any CRM profile with this phone
    // We'll check via WhatsApp contacts first
    const { data: existingContact } = await (supabaseAdmin as any)
      .from('whatsapp_contacts')
      .select('id')
      .eq('phone_number', phoneNumber)
      .single()

    let contactId: string

    if (existingContact) {
      // Check if there's already a CRM profile for this contact
      const { data: existingProfile } = await (supabaseAdmin as any)
        .from('crm_profiles')
        .select('id, lifecycle_stage, tags')
        .eq('whatsapp_contact_id', existingContact.id)
        .single()

      if (existingProfile) {
        // Check if they're already in early access by looking at tags
        const isEarlyAccess = existingProfile.tags && existingProfile.tags.includes('early_access_signup')
        
        if (isEarlyAccess) {
          return NextResponse.json({
            success: true,
            message: 'Je staat al op de early access lijst!',
            alreadyExists: true
          })
        } else {
          return NextResponse.json({
            success: true,
            message: 'Dit telefoonnummer is al in ons systeem!',
            alreadyExists: true
          })
        }
      }

      // Contact exists but no CRM profile, use existing contact
      contactId = existingContact.id
    } else {
      // Create a placeholder WhatsApp contact for phone-only signup
      const placeholderJid = `early_${Date.now()}_${Math.random().toString(36).substring(7)}@phone.early`
      
      const { data: whatsappContact, error: whatsappError } = await (supabaseAdmin as any)
        .from('whatsapp_contacts')
        .insert({
          phone_number: phoneNumber,
          whatsapp_jid: placeholderJid,
          push_name: 'Early Access User',
          display_name: phoneNumber,
          whatsapp_status: 'early_access',
          is_active: true,
          raw_contact_data: {
            source: 'early_access_signup',
            signup_method: 'phone_only',
            original_phone: phoneNumber
          }
        })
        .select()
        .single()

      if (whatsappError) {
        console.error('Error creating WhatsApp contact for early access:', whatsappError)
        return NextResponse.json(
          { success: false, error: 'Failed to process early access signup' },
          { status: 500 }
        )
      }

      contactId = whatsappContact.id
    }

    // Create CRM profile linked to the WhatsApp contact
    const { data: crmProfile, error: crmError } = await (supabaseAdmin as any)
      .from('crm_profiles')
      .insert({
        whatsapp_contact_id: contactId,
        email: null,
        full_name: null,
        preferred_name: phoneNumber.split('+31')[1] || phoneNumber, // Use phone number as preferred name
        lifecycle_stage: 'prospect', // Use valid lifecycle stage
        customer_since: new Date().toISOString(),
        preferred_stores: [],
        shopping_persona: null,
        dietary_restrictions: [],
        engagement_score: 25, // Higher score for early access signup
        total_conversations: 0,
        total_messages: 0,
        tags: ['early_access_signup', 'phone_only'], // Use tags to identify early access users
        notes: 'Signed up for early access via website'
      })
      .select()
      .single()

    if (crmError) {
      console.error('Error creating CRM profile for early access:', crmError)
      return NextResponse.json(
        { success: false, error: 'Failed to process early access signup' },
        { status: 500 }
      )
    }

    // Create a customer event to track the early access signup
    try {
      await (supabaseAdmin as any)
        .from('customer_events')
        .insert({
          crm_profile_id: crmProfile.id,
          event_type: 'early_access_signup',
          event_description: 'User signed up for early access via website',
          event_data: {
            phone_number: phoneNumber,
            signup_source: 'website_early_access',
            user_agent: request.headers.get('user-agent'),
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
          }
        })
    } catch (eventError) {
      console.warn('Failed to create customer event:', eventError)
      // Don't fail the request if event tracking fails
    }

    console.log('✅ New early access signup:', {
      phoneNumber,
      contactId: contactId,
      profileId: crmProfile.id
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully joined early access!',
      data: {
        profileId: crmProfile.id,
        lifecycle_stage: crmProfile.lifecycle_stage
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
      .from('crm_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('lifecycle_stage', 'prospect')
      .contains('tags', ['early_access_signup'])

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