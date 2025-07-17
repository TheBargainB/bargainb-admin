import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { agentBBService } from '@/lib/agent-bb-service'

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      phone: rawPhone, 
      email, 
      country, 
      city, 
      selectedStores = [],
      selectedDietary = [],
      selectedAllergies = [],
      selectedItems = [],
      selectedIntegrations = [],
      preferredLanguage = 'nl'
    } = await request.json()

    // Clean phone number (fix double + issue and formatting)
    const cleanPhone = rawPhone.replace(/^\++/, '+').replace(/\s+/g, '')
    
    // Store phone number WITHOUT + sign (database format)
    const phoneForStorage = cleanPhone.replace(/^\+/, '')
    
    // Keep display version with + for user-facing purposes
    const phoneDisplay = cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone

    if (!name || !cleanPhone || !email || !country || !city) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // First check if WhatsApp contact already exists (using phone number without +)
    const { data: existingContact, error: checkError } = await supabase
      .from('whatsapp_contacts')
      .select('id')
      .eq('phone_number', phoneForStorage)
      .single()

    let whatsappContact

    if (existingContact) {
      whatsappContact = existingContact
      console.log('Using existing WhatsApp contact:', existingContact.id)
    } else {
      // Create WhatsApp contact
      // Generate WhatsApp JID from phone number (required field)
      const whatsappJid = phoneForStorage + '@s.whatsapp.net'
      
      const { data: newContact, error: contactError } = await supabase
        .from('whatsapp_contacts')
        .insert({
          phone_number: phoneForStorage,
          whatsapp_jid: whatsappJid,
          display_name: name,
          push_name: name.split(' ')[0],
          is_business_account: false,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (contactError) {
        console.error('Error creating WhatsApp contact:', contactError)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to create WhatsApp contact',
            details: contactError.message 
          },
          { status: 500 }
        )
      }

      whatsappContact = newContact
      console.log('Created new WhatsApp contact:', newContact.id)
    }

    // Check if CRM profile already exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('crm_profiles')
      .select('*')
      .eq('whatsapp_contact_id', whatsappContact.id)
      .single()

    if (existingProfile) {
      // Update existing profile with new onboarding data
      const { data: updatedProfile, error: updateError } = await supabase
        .from('crm_profiles')
        .update({
          full_name: name,
          email: email,
          preferred_name: name.split(' ')[0],
          country: country,
          city: city,
          selected_stores: selectedStores,
          dietary_preferences: selectedDietary,
          food_allergies: selectedAllergies,
          grocery_items: selectedItems,
          integrations: selectedIntegrations,
          preferred_language: preferredLanguage,
          lifecycle_stage: 'onboarding',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id)
        .select('*')
        .single()

      if (updateError) {
        console.error('Error updating CRM profile:', updateError)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to update user profile',
            details: updateError.message 
          },
          { status: 500 }
        )
      }

      console.log('Updated existing CRM profile:', updatedProfile.id)
      
      // Create or update AI configuration with Agent BB v2 assistant
      try {
        const { data: aiConfigResult, error: aiConfigError } = await supabase
          .rpc('create_user_ai_config', {
            p_user_id: phoneDisplay,
            p_country: country,
            p_language: preferredLanguage,
            p_dietary_preferences: selectedDietary || [],
            p_food_allergies: selectedAllergies || [],
            p_selected_stores: selectedStores || []
          })

        if (aiConfigError) {
          console.error('Error creating AI config:', aiConfigError)
        } else {
          console.log('Created/updated AI config:', aiConfigResult)
          
          // Create Agent BB v2 Assistant
          try {
            // Filter out null values from selectedStores
            const validStores = (selectedStores || []).filter((store: any) => store !== null && store !== undefined);
            
            const userConfig = {
              user_id: phoneDisplay,
              country_code: country.toUpperCase(),
              language_code: preferredLanguage,
              dietary_restrictions: selectedDietary?.length > 0 ? selectedDietary.join(', ') : 'none',
              budget_level: 'medium', // Default from onboarding
              household_size: 1, // Default from onboarding
              store_preference: validStores?.length > 0 
                ? (typeof validStores[0] === 'object' && validStores[0].name 
                   ? validStores[0].name 
                   : typeof validStores[0] === 'string' ? validStores[0] : 'Albert Heijn')
                : 'Albert Heijn',
              store_websites: validStores?.length > 0 
                ? (typeof validStores[0] === 'object' && validStores[0].url 
                   ? validStores.map((store: any) => store.url).join(', ')
                   : validStores.map((store: string) => {
                       const storeMap: Record<string, string> = {
                         'Albert Heijn': 'ah.nl',
                         'Jumbo': 'jumbo.com',
                         'Lidl': 'lidl.nl',
                         'Dirk': 'dirk.nl',
                         'Aldi': 'aldi.nl'
                       }
                       return storeMap[store] || store.toLowerCase() + '.nl'
                     }).join(', '))
                : 'ah.nl, jumbo.com, lidl.nl'
            }

            const assistant = await agentBBService.createUserAssistant(userConfig)
            console.log('✅ Created Agent BB v2 Assistant:', assistant.assistant_id)

            // Store assistant details in conversation
            await agentBBService.storeAssistantInConversation(phoneDisplay, assistant)
            console.log('✅ Stored assistant details in database')

            // Update CRM profile with onboarding completion and assistant tracking
            await supabase
              .from('crm_profiles')
              .update({
                onboarding_completed: true,
                assistant_created: true,
                onboarding_completed_at: new Date().toISOString(),
                assistant_id: assistant.assistant_id,
                updated_at: new Date().toISOString()
              })
              .eq('id', updatedProfile.id)
            
            console.log('✅ Updated CRM profile with onboarding completion tracking')

          } catch (assistantError) {
            console.error('❌ Error creating Agent BB v2 assistant:', assistantError)
            // Continue without failing the whole request
          }
        }
      } catch (aiError) {
        console.error('AI config creation failed:', aiError)
        // Continue without failing the request
      }
      
      return NextResponse.json({
        success: true,
        data: {
          whatsapp_contact: whatsappContact,
          crm_profile: updatedProfile,
          message: 'User profile updated successfully'
        }
      })
    }

    // Create new CRM profile (only reached if no existing profile found)
    const { data: crmProfile, error: crmError } = await supabase
      .from('crm_profiles')
      .insert({
        whatsapp_contact_id: whatsappContact.id,
        full_name: name,
        email: email,
        preferred_name: name.split(' ')[0], // Use first name as preferred name
        country: country,
        city: city,
        selected_stores: selectedStores,
        dietary_preferences: selectedDietary,
        food_allergies: selectedAllergies,
        grocery_items: selectedItems,
        integrations: selectedIntegrations,
        preferred_language: preferredLanguage,
        lifecycle_stage: 'onboarding',
        engagement_score: 0,
        total_conversations: 0,
        total_messages: 0
      })
      .select('*')
      .single()

    if (crmError) {
      console.error('Error creating CRM profile:', crmError)
      
      // Only cleanup WhatsApp contact if we created it in this request (not existing)
      if (!existingContact) {
        console.log('Cleaning up newly created WhatsApp contact due to CRM profile creation failure')
        await supabase
          .from('whatsapp_contacts')
          .delete()
          .eq('id', whatsappContact.id)
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create CRM profile',
          details: crmError.message 
        },
        { status: 500 }
      )
    }

    console.log('Created new CRM profile:', crmProfile.id)

    // Create AI configuration for the new user with Agent BB v2 assistant
    try {
      const { data: aiConfigResult, error: aiConfigError } = await supabase
        .rpc('create_user_ai_config', {
          p_user_id: phoneDisplay,
          p_country: country,
          p_language: preferredLanguage,
          p_dietary_preferences: selectedDietary || [],
          p_food_allergies: selectedAllergies || [],
          p_selected_stores: selectedStores || []
        })

      if (aiConfigError) {
        console.error('Error creating AI config:', aiConfigError)
      } else {
        console.log('Created AI config:', aiConfigResult)
        
        // Create Agent BB v2 Assistant
        try {
          // Filter out null values from selectedStores
          const validStores = (selectedStores || []).filter((store: any) => store !== null && store !== undefined);
          
          const userConfig = {
            user_id: phoneDisplay,
            country_code: country.toUpperCase(),
            language_code: preferredLanguage,
            dietary_restrictions: selectedDietary?.length > 0 ? selectedDietary.join(', ') : 'none',
            budget_level: 'medium', // Default from onboarding
            household_size: 1, // Default from onboarding
            store_preference: validStores?.length > 0 
              ? (typeof validStores[0] === 'object' && validStores[0].name 
                 ? validStores[0].name 
                 : typeof validStores[0] === 'string' ? validStores[0] : 'Albert Heijn')
              : 'Albert Heijn',
            store_websites: validStores?.length > 0 
              ? (typeof validStores[0] === 'object' && validStores[0].url 
                 ? validStores.map((store: any) => store.url).join(', ')
                 : validStores.map((store: string) => {
                     const storeMap: Record<string, string> = {
                       'Albert Heijn': 'ah.nl',
                       'Jumbo': 'jumbo.com',
                       'Lidl': 'lidl.nl',
                       'Dirk': 'dirk.nl',
                       'Aldi': 'aldi.nl'
                     }
                     return storeMap[store] || store.toLowerCase() + '.nl'
                   }).join(', '))
              : 'ah.nl, jumbo.com, lidl.nl'
          }

                    const assistant = await agentBBService.createUserAssistant(userConfig)
          console.log('✅ Created Agent BB v2 Assistant:', assistant.assistant_id)

          // Store assistant details in conversation
          await agentBBService.storeAssistantInConversation(phoneDisplay, assistant)
          console.log('✅ Stored assistant details in database')

          // Update CRM profile with onboarding completion and assistant tracking
          await supabase
            .from('crm_profiles')
            .update({
              onboarding_completed: true,
              assistant_created: true,
              onboarding_completed_at: new Date().toISOString(),
              assistant_id: assistant.assistant_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', crmProfile.id)
          
          console.log('✅ Updated CRM profile with onboarding completion tracking')

        } catch (assistantError) {
          console.error('❌ Error creating Agent BB v2 assistant:', assistantError)
          // Continue without failing the whole request
        }
      }
    } catch (aiError) {
      console.error('AI config creation failed:', aiError)
      // Continue without failing the request
    }

    return NextResponse.json({
      success: true,
      data: {
        whatsapp_contact: whatsappContact,
        crm_profile: crmProfile,
        message: 'User profile created successfully'
      }
    })

  } catch (error) {
    console.error('Error in create-user route:', error)
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