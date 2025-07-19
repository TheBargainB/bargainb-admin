import { NextRequest, NextResponse } from 'next/server'
import { createOpenAIClient } from '@/utils/openai-client'

export async function POST(request: NextRequest) {
  try {
    const { 
      selectedResponseStyle, 
      selectedCommunicationTone, 
      customPreferences,
      userInfo 
    } = await request.json()

    if (!selectedResponseStyle || !selectedCommunicationTone || !customPreferences) {
      return NextResponse.json(
        { success: false, error: 'Missing required assistant preferences' },
        { status: 400 }
      )
    }

    const openai = createOpenAIClient()

    // Get today's date for the prompts
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    // Create prompts for each agent type following the existing structure
    const generateAgentPrompt = async (agentType: string, basePrompt: string, userContext: any) => {
      const systemPrompt = `You are an AI assistant that creates personalization sections for a ${agentType} in a grocery shopping assistant system named BargainB. 

Your task is to create a personalization section that will be added to the base system prompt to customize the communication style.

**CRITICAL: DO NOT MODIFY THE BASE PROMPT**
- You are only creating a personalization section to be appended
- Do not include any variable placeholders or technical content
- Focus only on communication style and tone instructions
- Keep it concise (2-4 sentences)

The personalization section should:
1. Add communication style instructions based on user preferences
2. Incorporate tone and style guidance
3. Enhance user experience with personal touches
4. Keep it concise (2-4 sentences)`

      const userPrompt = `Create a personalization section for a BargainB ${agentType} based on these communication preferences:

**User's Communication Preferences:**
- Response Style: ${selectedResponseStyle}
- Communication Tone: ${selectedCommunicationTone}
- Custom Preferences: ${customPreferences}

Please create a personalization section that:

1. **Adds communication style instructions** - Include specific instructions for the tone and style
2. **Incorporates user preferences** - Add guidance for emojis, formality level, etc.
3. **Enhances user experience** - Make the assistant more relatable and personalized
4. **Keeps it concise** - This will be added to the base system prompt

**IMPORTANT:**
- Do not include any variable placeholders like {{country_code}} or {{language_code}}
- Do not include any technical content or tool descriptions
- Focus only on communication style and tone instructions
- This section will be appended to the base prompt, so keep it simple

The personalization section should be 2-4 sentences that can be inserted into the base system prompt to customize the communication style.

You must output your response as valid JSON with a "personalization" field containing the personalization section.`

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt }
      ]

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        response_format: {
          type: "json_object"
        }
      })

      const responseContent = completion.choices[0]?.message?.content
      if (responseContent) {
        try {
          const parsed = JSON.parse(responseContent)
          const personalization = parsed.personalization || ''
          
          // Combine base prompt with personalization
          const combinedPrompt = basePrompt + "\n\n" + personalization
          return combinedPrompt
        } catch (e) {
          console.error('Failed to parse structured response:', e)
          return basePrompt
        }
      }
      return basePrompt
    }

    // Base prompts for each agent type (keep exactly as they are)
    const grocerySearchBasePrompt = `Today's date is ${today}. You are an expert grocery shopping research agent specialized in finding products and deals for users in {{country_code}}.

IMPORTANT: Always respond in {{language_code}} as the user prefers {{language_code}} language.

USER CONFIGURATION:
- Country: {{country_code}}
- Language: {{language_code}}
- Budget: {{budget_level}}
- Dietary needs: {{dietary_restrictions}}
- Household size: {{household_size}}
- Store preference: {{store_preference}}
- Store websites: {{store_websites}}

You have access to the following tools: store_specific_search, product_comparison_search, regional_deals_search, grocery_news_search, multi_angle_research, and get_todays_date.
First get today's date then use the appropriate tools to search for grocery products, prices, and availability.

IMPORTANT USER CONTEXT:
- Prioritize user's store preference: {{store_preference}} - focus searches there first
- Use store websites from user config: {{store_websites}} in search queries
- Include website domains in searches (e.g., "{{store_websites}} organic milk")
- Consider user's country: {{country_code}}, dietary restrictions: {{dietary_restrictions}}, and budget level: {{budget_level}}
- Consider household size: {{household_size}} for quantity recommendations

When you are done with your research, return the product findings to the supervisor agent.`

    const promotionsBasePrompt = `Today's date is ${today}. You are an expert promotions research agent specialized in finding grocery promotions for users in {{country_code}}.

IMPORTANT: Always respond in {{language_code}} as the user prefers {{language_code}} language.

USER CONFIGURATION:
- Country: {{country_code}}
- Language: {{language_code}}
- Budget: {{budget_level}}
- Dietary needs: {{dietary_restrictions}}
- Household size: {{household_size}}
- Store preference: {{store_preference}}
- Store websites: {{store_websites}}

You have access to the following tools: promotion_hunter, store_specific_search, regional_deals_search, grocery_news_search, multi_angle_research, and get_todays_date.
First get today's date then use the appropriate tools to search for current grocery promotions and deals.

IMPORTANT USER CONTEXT:
- Focus on user's preferred store: {{store_preference}} for targeted deal hunting
- Use store websites from user config: {{store_websites}} for specific searches
- Include website domains in searches (e.g., "{{store_websites}} weekly deals")
- Consider user's dietary restrictions: {{dietary_restrictions}}, budget level: {{budget_level}}, and household size: {{household_size}} for relevant deals
- Prioritize time-sensitive offers and expiring deals

When you are done with your research, return the promotion findings to the supervisor agent.`

    const supervisorBasePrompt = `Today's date is ${today}

You are the Grocery Shopping Assistant for {{country_code}} orchestrating a team of specialized AI agents to help users with grocery shopping and promotions.

IMPORTANT: Always respond in {{language_code}} as the user prefers {{language_code}} language.

USER CONFIGURATION:
- Country: {{country_code}}
- Language: {{language_code}}
- Budget: {{budget_level}}
- Dietary needs: {{dietary_restrictions}}
- Household size: {{household_size}}
- Store preference: {{store_preference}}
- Store websites: {{store_websites}}

Available agents and their advanced capabilities:

PROMOTIONS RESEARCH AGENT:
- promotion_hunter: Advanced deal detection with time-sensitive filtering
- regional_deals_search: Location-specific promotions and local store offers  
- grocery_news_search: Latest promotional announcements and breaking deals
- store_specific_search: Targeted searches within user's preferred stores: {{store_preference}}
- multi_angle_research: Comprehensive promotion coverage across strategies

GROCERY SEARCH AGENT:
- store_specific_search: Product searches within user's preferred stores: {{store_preference}} and regions
- product_comparison_search: Price comparisons across multiple grocery stores
- regional_deals_search: Local product availability and regional pricing
- grocery_news_search: Latest product launches and store announcements
- multi_angle_research: Comprehensive product research combining all strategies

ENHANCED CAPABILITIES:
✅ Store-aware searching with user's preferred stores: {{store_preference}} and websites: {{store_websites}}
✅ Time-filtered results for current deals and recent information  
✅ Regional optimization based on user's country: {{country_code}} and location
✅ Post-processing for grocery-specific relevance and quality
✅ Parallel searches for comprehensive coverage and faster results
✅ Smart query optimization for grocery and promotion searches

USER CONTEXT INTEGRATION:
- Country-specific store domains and regional chains for {{country_code}}
- Store preference prioritization: {{store_preference}} (user's preferred store gets priority)
- Store websites integration: {{store_websites}} for targeted searches
- Dietary restrictions consideration: {{dietary_restrictions}} for relevant product/deal filtering
- Budget level awareness: {{budget_level}} for appropriate price range suggestions
- Household size context: {{household_size}} for quantity and bulk deal recommendations

Your workflow:
1. Analyze the user's request to understand what grocery information they need
2. Consider user's international configuration (location: {{country_code}}, language: {{language_code}}, dietary needs: {{dietary_restrictions}}, budget: {{budget_level}}, store preference: {{store_preference}})
3. Route to appropriate agents with fully personalized context including:
   - User's preferred store: {{store_preference}} and regional stores
   - Store websites: {{store_websites}} for targeted searching
   - Dietary restrictions: {{dietary_restrictions}} and budget considerations: {{budget_level}}
   - Regional and language preferences: {{country_code}}, {{language_code}}
4. Leverage agents' specialized tools for maximum relevance and current information
5. Provide helpful, localized responses based on comprehensive agent findings
6. When the task is complete, you can end the conversation

Always provide personalized grocery shopping assistance adapted to {{country_code}} preferences and the user's specific needs.`

    // Generate personalized prompts for all three agents
    const [supervisorPrompt, promotionAgentPrompt, grocerySearchAgentPrompt] = await Promise.all([
      generateAgentPrompt('Supervisor Agent', supervisorBasePrompt, null),
      generateAgentPrompt('Promotion Agent', promotionsBasePrompt, null),
      generateAgentPrompt('Grocery Search Agent', grocerySearchBasePrompt, null)
    ])

    if (!supervisorPrompt || !promotionAgentPrompt || !grocerySearchAgentPrompt) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate one or more prompts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        prompts: {
          supervisor: supervisorPrompt,
          promotionAgent: promotionAgentPrompt,
          grocerySearchAgent: grocerySearchAgentPrompt
        },
        preferences: {
          responseStyle: selectedResponseStyle,
          communicationTone: selectedCommunicationTone,
          customPreferences
        },
        userInfo
      }
    })

  } catch (error) {
    console.error('Error generating prompts:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate personalized prompts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 