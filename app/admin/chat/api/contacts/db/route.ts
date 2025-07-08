import { NextRequest, NextResponse } from 'next/server'
import { ContactService } from '../../../lib/contact-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const query = searchParams.get('search')

    console.log(`📋 Fetching contacts from database${query ? ` with search: "${query}"` : ''}`)

    let contacts
    if (query) {
      contacts = await ContactService.searchContacts(query)
      console.log(`🔍 Found ${contacts.length} contacts matching "${query}"`)
    } else {
      contacts = await ContactService.getAllContacts()
      console.log(`📱 Found ${contacts.length} total contacts in database`)
    }

    return NextResponse.json({
      success: true,
      data: contacts,
      count: contacts.length,
      source: 'database'
    })

  } catch (error) {
    console.error('❌ Error fetching contacts from database:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contacts from database' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phoneNumber = searchParams.get('phone')

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required for deletion' },
        { status: 400 }
      )
    }

            console.log(`🗑️ Deleting contact from WhatsApp CRM: ${phoneNumber}`)

    const deleted = await ContactService.deleteContact(phoneNumber)

    if (deleted) {
      return NextResponse.json({
        success: true,
        message: 'Contact deleted successfully from unified system',
        phoneNumber
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete contact from unified system' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Error deleting contact from unified system:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete contact from unified system' },
      { status: 500 }
    )
  }
} 