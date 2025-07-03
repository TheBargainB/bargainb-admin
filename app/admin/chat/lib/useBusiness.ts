import { useState, useEffect } from 'react'

interface WhatsAppContact {
  jid: string
  name?: string
  notify?: string
  status?: string
  imgUrl?: string
  verifiedName?: string
  id?: string
  phone_number?: string
  created_at?: string
  updated_at?: string
  last_seen_at?: string
}

export const useBusiness = () => {
  const [businessContact, setBusinessContact] = useState<WhatsAppContact | null>(null)
  const BUSINESS_PHONE_NUMBER = '+31685414129'

  // Fetch profile picture for a contact
  const fetchContactProfilePicture = async (contactPhoneNumber: string): Promise<string | null> => {
    try {
      // Extract phone number from JID (remove @s.whatsapp.net)
      const phoneNumber = contactPhoneNumber.replace('@s.whatsapp.net', '')
      
      console.log(`📸 Fetching profile picture for: ${phoneNumber}`)
      const response = await fetch(`/admin/chat/api/contact-picture/${phoneNumber}`)
      
      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch profile picture for ${phoneNumber}: ${response.status}`)
        return null
      }
      
      const result = await response.json()
      
      if (result.success && result.data?.imgUrl) {
        console.log(`✅ Got profile picture for ${phoneNumber}:`, result.data.imgUrl)
        return result.data.imgUrl
      } else {
        console.log(`📷 No profile picture available for ${phoneNumber}`)
        return null
      }
    } catch (error) {
      console.error(`❌ Error fetching profile picture for ${contactPhoneNumber}:`, error)
      return null
    }
  }

  // Fetch detailed contact information
  const fetchContactInfo = async (contactPhoneNumber: string): Promise<any | null> => {
    try {
      // Extract phone number from JID (remove @s.whatsapp.net)
      const phoneNumber = contactPhoneNumber.replace('@s.whatsapp.net', '')
      
      console.log(`📋 Fetching contact info for: ${phoneNumber}`)
      const response = await fetch(`/admin/chat/api/contact-info/${phoneNumber}`)
      
      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch contact info for ${phoneNumber}: ${response.status}`)
        return null
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        console.log(`✅ Got contact info for ${phoneNumber}:`, result.data)
        return result.data
      } else {
        console.log(`📋 No detailed contact info available for ${phoneNumber}`)
        return null
      }
    } catch (error) {
      console.error(`❌ Error fetching contact info for ${contactPhoneNumber}:`, error)
      return null
    }
  }

  // Load business contact info for admin avatar
  const loadBusinessContact = async () => {
    try {
      console.log('📞 Loading business contact info for:', BUSINESS_PHONE_NUMBER)
      
      // Try to get business contact from database first
      const dbResponse = await fetch('/admin/chat/api/contacts/db')
      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        const contacts = dbData.data || []
        const businessContactFromDb = contacts.find((contact: any) => 
          contact.phone_number === BUSINESS_PHONE_NUMBER
        )
        
        if (businessContactFromDb) {
          console.log('✅ Found business contact in database:', businessContactFromDb)
          setBusinessContact({
            jid: businessContactFromDb.phone_number.replace('+', '') + '@s.whatsapp.net',
            name: businessContactFromDb.name,
            notify: businessContactFromDb.notify,
            verifiedName: businessContactFromDb.verified_name,
            imgUrl: businessContactFromDb.img_url,
            status: businessContactFromDb.status,
            phone_number: businessContactFromDb.phone_number
          })
          return
        }
      }
      
      // If not in database, fetch from API
      const phoneNumber = BUSINESS_PHONE_NUMBER.replace('+', '')
      const contactInfo = await fetchContactInfo(phoneNumber + '@s.whatsapp.net')
      const profilePicture = await fetchContactProfilePicture(phoneNumber + '@s.whatsapp.net')
      
      if (contactInfo || profilePicture) {
        console.log('✅ Fetched business contact from API')
        setBusinessContact({
          jid: phoneNumber + '@s.whatsapp.net',
          name: contactInfo?.name || 'BargainB Business',
          notify: contactInfo?.notify,
          verifiedName: contactInfo?.verifiedName,
          imgUrl: profilePicture || undefined,
          status: contactInfo?.status || 'active',
          phone_number: BUSINESS_PHONE_NUMBER
        })
      }
    } catch (error) {
      console.error('❌ Error loading business contact:', error)
    }
  }

  // Load business contact on mount
  useEffect(() => {
    loadBusinessContact()
  }, [])

  return {
    businessContact,
    BUSINESS_PHONE_NUMBER,
    loadBusinessContact,
    fetchContactInfo,
    fetchContactProfilePicture
  }
} 