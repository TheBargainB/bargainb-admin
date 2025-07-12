import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface ContactPicture {
  contact_id: string
  phone_number: string
  profile_picture_url?: string
  has_picture: boolean
  last_updated?: string
  fallback_initials?: string
  fallback_color?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { contactPhoneNumber: string } }
) {
  try {
    const { contactPhoneNumber } = params
    const { searchParams } = request.nextUrl
    const size = searchParams.get('size') || 'medium' // small, medium, large
    const format = searchParams.get('format') || 'json' // json, redirect, base64

    if (!contactPhoneNumber) {
      return NextResponse.json({ error: 'Contact phone number is required' }, { status: 400 })
    }

    // Normalize phone number
    const normalizedPhone = contactPhoneNumber.replace(/\D/g, '')

    // Get contact information
    const contactQuery = await supabaseAdmin
      .from('whatsapp_contacts')
      .select('id, phone_number, profile_picture_url, display_name, push_name, verified_name, updated_at')
      .eq('phone_number', normalizedPhone)
      .single()

    if (contactQuery.error) {
      if (contactQuery.error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
      }
      console.error('Error fetching contact:', contactQuery.error)
      return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 })
    }

    const contact = contactQuery.data

    // Generate fallback initials and color
    const fallbackInitials = generateInitials(contact.display_name || contact.push_name || contact.verified_name || undefined)
    const fallbackColor = generateColor(contact.phone_number)

    const contactPicture: ContactPicture = {
      contact_id: contact.id,
      phone_number: contact.phone_number,
      profile_picture_url: contact.profile_picture_url || undefined,
      has_picture: !!contact.profile_picture_url,
      last_updated: contact.updated_at || undefined,
      fallback_initials: fallbackInitials,
      fallback_color: fallbackColor
    }

    // Handle different response formats
    switch (format) {
      case 'redirect':
        if (contact.profile_picture_url) {
          // Redirect to the actual image URL
          return NextResponse.redirect(contact.profile_picture_url)
        } else {
          // Return a placeholder image URL or generate SVG
          const svgPlaceholder = generateSVGPlaceholder(fallbackInitials, fallbackColor, size)
          return new NextResponse(svgPlaceholder, {
            headers: {
              'Content-Type': 'image/svg+xml',
              'Cache-Control': 'public, max-age=3600'
            }
          })
        }

      case 'base64':
        if (contact.profile_picture_url) {
          try {
            // Fetch and convert to base64
            const imageResponse = await fetch(contact.profile_picture_url)
            if (imageResponse.ok) {
              const buffer = await imageResponse.arrayBuffer()
              const base64 = Buffer.from(buffer).toString('base64')
              const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'
              
              return NextResponse.json({
                ...contactPicture,
                base64_data: `data:${mimeType};base64,${base64}`
              })
            }
          } catch (error) {
            console.error('Error fetching image for base64:', error)
            // Fall through to return JSON with fallback
          }
        }
        
        // Return JSON with fallback SVG as base64
        const svgPlaceholder = generateSVGPlaceholder(fallbackInitials, fallbackColor, size)
        const base64SVG = Buffer.from(svgPlaceholder).toString('base64')
        
        return NextResponse.json({
          ...contactPicture,
          base64_data: `data:image/svg+xml;base64,${base64SVG}`
        })

      default:
        // Return JSON format
        return NextResponse.json(contactPicture)
    }
  } catch (error) {
    console.error('Error in contact picture API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT endpoint for updating contact picture
export async function PUT(
  request: NextRequest,
  { params }: { params: { contactPhoneNumber: string } }
) {
  try {
    const { contactPhoneNumber } = params
    const { profile_picture_url } = await request.json()

    if (!contactPhoneNumber) {
      return NextResponse.json({ error: 'Contact phone number is required' }, { status: 400 })
    }

    // Normalize phone number
    const normalizedPhone = contactPhoneNumber.replace(/\D/g, '')

    // Update contact picture
    const { error } = await supabaseAdmin
      .from('whatsapp_contacts')
      .update({
        profile_picture_url,
        updated_at: new Date().toISOString()
      })
      .eq('phone_number', normalizedPhone)

    if (error) {
      console.error('Error updating contact picture:', error)
      return NextResponse.json({ error: 'Failed to update contact picture' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in contact picture PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE endpoint for removing contact picture
export async function DELETE(
  request: NextRequest,
  { params }: { params: { contactPhoneNumber: string } }
) {
  try {
    const { contactPhoneNumber } = params

    if (!contactPhoneNumber) {
      return NextResponse.json({ error: 'Contact phone number is required' }, { status: 400 })
    }

    // Normalize phone number
    const normalizedPhone = contactPhoneNumber.replace(/\D/g, '')

    // Remove contact picture
    const { error } = await supabaseAdmin
      .from('whatsapp_contacts')
      .update({
        profile_picture_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('phone_number', normalizedPhone)

    if (error) {
      console.error('Error removing contact picture:', error)
      return NextResponse.json({ error: 'Failed to remove contact picture' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in contact picture DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions
function generateInitials(name?: string): string {
  if (!name) return '?'
  
  const words = name.trim().split(' ')
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }
  
  return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('')
}

function generateColor(phoneNumber: string): string {
  // Generate a consistent color based on phone number
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  
  const hash = phoneNumber.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)
  
  return colors[hash % colors.length]
}

function generateSVGPlaceholder(initials: string, color: string, size: string): string {
  const dimensions = {
    small: 32,
    medium: 64,
    large: 128
  }
  
  const dim = dimensions[size as keyof typeof dimensions] || dimensions.medium
  const fontSize = Math.floor(dim * 0.4)
  
  return `
    <svg width="${dim}" height="${dim}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${dim/2}" cy="${dim/2}" r="${dim/2}" fill="${color}"/>
      <text x="${dim/2}" y="${dim/2}" font-family="Arial, sans-serif" font-size="${fontSize}" 
            fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    </svg>
  `.trim()
} 