import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { phone, email } = await request.json()

    if (!phone && !email) {
      return NextResponse.json(
        { success: false, error: 'Phone number or email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if phone number or email exists in user_profiles (new system)
    let phoneExists = false
    let emailExists = false

    if (phone) {
      // Clean phone number to match database format
      const cleanPhone = phone.replace(/^\+/, '')
      
      const { data: phoneData, error: phoneError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('phone_number', cleanPhone)
        .single()

      if (phoneError && phoneError.code !== 'PGRST116') {
        console.error('Error checking phone:', phoneError)
        return NextResponse.json(
          { success: false, error: 'Failed to check phone number' },
          { status: 500 }
        )
      }

      phoneExists = !!phoneData
    }

    if (email) {
      const { data: emailData, error: emailError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()

      if (emailError && emailError.code !== 'PGRST116') {
        console.error('Error checking email:', emailError)
        return NextResponse.json(
          { success: false, error: 'Failed to check email address' },
          { status: 500 }
        )
      }

      emailExists = !!emailData
    }

    return NextResponse.json({
      success: true,
      data: {
        phoneExists,
        emailExists,
        phone,
        email
      }
    })

  } catch (error) {
    console.error('Error in check-existing API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 