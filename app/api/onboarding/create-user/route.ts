import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Country name to ISO 2-letter code mapping
const getCountryCode = (countryName: string): string => {
  const countryMap: Record<string, string> = {
    'Netherlands': 'NL',
    'Germany': 'DE',
    'Belgium': 'BE',
    'France': 'FR',
    'Spain': 'ES',
    'Italy': 'IT',
    'United Kingdom': 'GB',
    'United States': 'US',
    'Canada': 'CA',
    'Australia': 'AU',
    'Austria': 'AT',
    'Switzerland': 'CH',
    'Denmark': 'DK',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Finland': 'FI',
    'Poland': 'PL',
    'Czech Republic': 'CZ',
    'Portugal': 'PT',
    'Greece': 'GR',
    'Ireland': 'IE',
    'Luxembourg': 'LU'
  }
  
  return countryMap[countryName] || countryName.substring(0, 2).toUpperCase()
}

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
    
    // Store phone number WITHOUT + sign for database (E.164 format without +)
    const phoneForStorage = cleanPhone.replace(/^\+/, '')
    
    // Create WhatsApp JID from phone number
    const whatsappJid = phoneForStorage + '@s.whatsapp.net'

    // Convert country name to ISO 2-letter code
    const countryCode = getCountryCode(country)

    if (!name || !cleanPhone || !email || !country || !city) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user already exists (by phone number or whatsapp_jid)
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`phone_number.eq.${phoneForStorage},whatsapp_jid.eq.${whatsappJid}`)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError)
      return NextResponse.json(
        { success: false, error: 'Database error', details: checkError.message },
        { status: 500 }
      )
    }

    // Create Assistant using Agent BB v2 API
    let assistantId = null
    let assistantCreated = false
    let threadId = null
    let introMessageSent = false
    let runId = null
    
    try {
      const assistantConfig = {
        configurable: {
          user_id: phoneForStorage,
          country_code: countryCode,
          language_code: preferredLanguage,
          dietary_restrictions: selectedDietary?.length > 0 ? selectedDietary.join(', ') : 'none',
          budget_level: 'medium',
          household_size: 1,
          store_preference: selectedStores?.length > 0 
            ? (typeof selectedStores[0] === 'object' && selectedStores[0].name 
               ? selectedStores[0].name 
               : typeof selectedStores[0] === 'string' ? selectedStores[0] : 'Albert Heijn')
            : 'Albert Heijn',
          store_websites: selectedStores?.length > 0 
            ? (typeof selectedStores[0] === 'object' && selectedStores[0].url 
               ? selectedStores.map((store: any) => store.url).join(', ')
               : selectedStores.map((store: string) => {
                   const storeMap: Record<string, string> = {
                     'Albert Heijn': 'ah.nl',
                     'Jumbo': 'jumbo.com',
                     'Lidl': 'lidl.nl',
                     'Dirk': 'dirk.nl',
                     'Aldi': 'aldi.nl'
                   }
                   return storeMap[store] || store.toLowerCase() + '.nl'
                 }).join(', '))
            : 'ah.nl'
        }
      }

      const assistantResponse = await fetch('https://agnet-bb-v2-cc009669aec9511e9dd20dc4263f4b67.us.langgraph.app/assistants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': process.env.LANGSMITH_API_KEY!
        },
        body: JSON.stringify({
          graph_id: 'supervisor_agent',
          config: assistantConfig,
          metadata: {
            user_phone: phoneForStorage,
            user_name: name,
            country: country,
            language: preferredLanguage
          },
          if_exists: 'do_nothing',
          name: `BargainB Assistant for ${name}`,
          description: `Personal grocery assistant for ${name} in ${city}, ${country}`
        })
      })

      if (assistantResponse.ok) {
        const assistantData = await assistantResponse.json()
        assistantId = assistantData.assistant_id
        assistantCreated = true
        console.log('✅ Created Agent BB v2 Assistant:', assistantId)

        // Create a thread for the conversation
        const threadResponse = await fetch('https://agnet-bb-v2-cc009669aec9511e9dd20dc4263f4b67.us.langgraph.app/threads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': process.env.LANGSMITH_API_KEY!
          },
          body: JSON.stringify({
            metadata: {
              user_phone: phoneForStorage,
              user_name: name,
              assistant_id: assistantId
            }
          })
        })

        if (threadResponse.ok) {
          const threadData = await threadResponse.json()
          threadId = threadData.thread_id
          console.log('✅ Created thread:', threadId)

          // Send intro message to AI (but don't wait for response)
          const introMessage = preferredLanguage === 'nl' 
            ? `Hoi ${name.split(' ')[0]}! Ik ben je persoonlijke BargainB grocery assistant. Ik help je met het vinden van de beste deals, het plannen van maaltijden en het besparen van geld bij het boodschappen doen in ${country}. Wat kan ik voor je doen?`
            : `Hi ${name.split(' ')[0]}! I'm your personal BargainB grocery assistant. I'll help you find the best deals, plan meals, and save money on groceries in ${country}. How can I help you today?`

          const runResponse = await fetch(`https://agnet-bb-v2-cc009669aec9511e9dd20dc4263f4b67.us.langgraph.app/threads/${threadId}/runs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': process.env.LANGSMITH_API_KEY!
            },
            body: JSON.stringify({
              assistant_id: assistantId,
              input: {
                messages: [{
                  role: 'user',
                  content: introMessage
                }]
              }
            })
          })

          if (runResponse.ok) {
            const runData = await runResponse.json()
            runId = runData.run_id
            console.log('✅ Sent intro message, run ID:', runId)
            introMessageSent = true

            // Save the intro message immediately (without waiting for AI response)
            // AI response will be processed asynchronously by a separate background job
          }
        }
      } else {
        const errorText = await assistantResponse.text()
        console.error('❌ Failed to create assistant:', assistantResponse.status, errorText)
        // Continue without assistant - don't fail the user creation
      }
    } catch (assistantError) {
      console.error('❌ Error creating assistant:', assistantError)
      // Continue without assistant - don't fail the user creation
    }

    // Prepare user data for the unified table
    const userData = {
      email: email,
      phone_number: phoneForStorage,
          full_name: name,
      preferred_name: name.split(' ')[0], // Use first name as preferred name
          lifecycle_stage: 'onboarding',
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      assistant_created: assistantCreated,
      assistant_id: assistantId,
      ai_introduction_sent: introMessageSent,
      
      // WhatsApp Metadata
      whatsapp_jid: whatsappJid,
      push_name: name.split(' ')[0],
      display_name: name,
      is_business_account: false,
      
      // AI Personalization Config
      country_code: countryCode, // Use proper 2-letter ISO code
      language_code: preferredLanguage,
      dietary_restrictions: selectedDietary?.length > 0 ? selectedDietary.join(', ') : null,
      budget_level: 'medium', // Default
      household_size: 1, // Default
      store_preference: selectedStores?.length > 0 
        ? (typeof selectedStores[0] === 'object' && selectedStores[0].name 
           ? selectedStores[0].name 
           : typeof selectedStores[0] === 'string' ? selectedStores[0] : 'Albert Heijn')
        : 'Albert Heijn',
      preferred_stores: selectedStores?.length > 0 ? selectedStores : null,
      store_websites: selectedStores?.length > 0 
        ? (typeof selectedStores[0] === 'object' && selectedStores[0].url 
           ? selectedStores.map((store: any) => store.url).join(', ')
           : selectedStores.map((store: string) => {
               const storeMap: Record<string, string> = {
                 'Albert Heijn': 'ah.nl',
                 'Jumbo': 'jumbo.com',
                 'Lidl': 'lidl.nl',
                 'Dirk': 'dirk.nl',
                 'Aldi': 'aldi.nl'
               }
               return storeMap[store] || store.toLowerCase() + '.nl'
             }).join(', '))
        : 'ah.nl'
    }

    let userProfile

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('user_profiles')
        .update(userData)
        .eq('id', existingUser.id)
        .select('*')
        .single()

      if (updateError) {
        console.error('Error updating user profile:', updateError)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to update user profile',
            details: updateError.message 
          },
          { status: 500 }
        )
      }

      userProfile = updatedUser
      console.log('Updated existing user profile:', updatedUser.id)
        } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('user_profiles')
        .insert(userData)
      .select('*')
      .single()

      if (createError) {
        console.error('Error creating user profile:', createError)
      return NextResponse.json(
        { 
          success: false, 
            error: 'Failed to create user profile',
            details: createError.message 
        },
        { status: 500 }
      )
    }

      userProfile = newUser
      console.log('Created new user profile:', newUser.id)
    }

    // Save the intro message immediately (AI response will be processed separately)
    if (introMessageSent && userProfile && assistantId && threadId && runId) {
      try {
        const introMessage = preferredLanguage === 'nl' 
          ? `Hoi ${name.split(' ')[0]}! Ik ben je persoonlijke BargainB grocery assistant. Ik help je met het vinden van de beste deals, het plannen van maaltijden en het besparen van geld bij het boodschappen doen in ${country}. Wat kan ik voor je doen?`
          : `Hi ${name.split(' ')[0]}! I'm your personal BargainB grocery assistant. I'll help you find the best deals, plan meals, and save money on groceries in ${country}. How can I help you today?`

        const { error: messageError } = await supabase
          .from('ai_messages')
          .insert({
            user_profile_id: userProfile.id,
            assistant_id: assistantId,
            thread_id: threadId,
            message_type: 'intro',
            content: introMessage,
            run_id: runId,
            status: 'sent'
          })

        if (messageError) {
          console.error('Error saving intro message:', messageError)
        } else {
          console.log('✅ Saved intro message to database')
        }

        // Start background process to check for AI response (non-blocking)
        // This will poll for the AI response and save it when ready
        processAIResponseAsync(userProfile.id, assistantId, threadId, runId)
          .catch(error => console.error('Background AI response processing failed:', error))

      } catch (msgError) {
        console.error('Error processing intro message:', msgError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user_profile: userProfile,
        assistant_created: assistantCreated,
        assistant_id: assistantId,
        thread_id: threadId,
        ai_introduction_sent: introMessageSent,
        country_code: countryCode, // Include this for debugging
        message: existingUser ? 'User profile updated successfully' : 'User profile created successfully',
        note: introMessageSent ? 'AI introduction sent - response will be processed asynchronously' : 'No AI introduction sent'
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

// Background function to poll for AI response (runs asynchronously)
async function processAIResponseAsync(
  userProfileId: string, 
  assistantId: string, 
  threadId: string, 
  runId: string
): Promise<void> {
  const maxAttempts = 20 // Maximum number of polling attempts
  const pollInterval = 3000 // 3 seconds between polls
  let attempts = 0

  console.log('🔄 Starting background AI response polling for run:', runId)

  while (attempts < maxAttempts) {
    try {
      attempts++
      console.log(`📊 Polling attempt ${attempts}/${maxAttempts} for AI response...`)

      // Check thread state for AI response
      const stateResponse = await fetch(`https://agnet-bb-v2-cc009669aec9511e9dd20dc4263f4b67.us.langgraph.app/threads/${threadId}/state`, {
        method: 'GET',
        headers: {
          'X-Api-Key': process.env.LANGSMITH_API_KEY!
        }
      })

      if (stateResponse.ok) {
        const stateData = await stateResponse.json()
        const messages = stateData.values?.messages || []
        
        // Find the AI response (last message that's not from human)
        const aiMessage = messages.find((msg: any) => msg.type === 'ai')
        
        if (aiMessage?.content) {
          console.log('✅ Found AI response! Saving to database...')
          
          // Save AI response to database
          const supabase = await createClient()
          const { error: saveError } = await supabase
            .from('ai_messages')
            .insert({
              user_profile_id: userProfileId,
              assistant_id: assistantId,
              thread_id: threadId,
              message_type: 'assistant',
              content: aiMessage.content,
              run_id: runId,
              agent_response_metadata: stateData,
              status: 'delivered'
            })

          if (saveError) {
            console.error('❌ Error saving AI response:', saveError)
          } else {
            console.log('✅ Successfully saved AI response to database')
          }
          
          // Response found and saved, exit the polling loop
          return
        }
      } else {
        console.error(`❌ Failed to get thread state (attempt ${attempts}):`, stateResponse.status)
      }

      // Wait before next poll (unless this was the last attempt)
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }

    } catch (error) {
      console.error(`❌ Error during polling attempt ${attempts}:`, error)
      
      // Wait before retrying (unless this was the last attempt)
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }
    }
  }

  console.log(`⏰ AI response polling timed out after ${maxAttempts} attempts (${maxAttempts * pollInterval / 1000} seconds)`)
  
  // Optionally, you could mark the message as failed or create a notification
  // that the AI response took too long to process
} 