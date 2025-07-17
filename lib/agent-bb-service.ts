// ===================================================
// Agent BB v2 Service
// Integration with LangGraph Platform for Assistant Management
// ===================================================

import { AGENT_BB_CONFIG, ASSISTANT_CONFIG_TEMPLATES } from '@/lib/constants'
import { supabaseAdmin } from '@/lib/supabase'

// Types based on Agent BB v2 API documentation
export interface AgentBBAssistant {
  assistant_id: string
  graph_id: string
  name: string
  description: string | null
  version: number
  created_at: string
  updated_at: string
  config: {
    tags: string[]
    recursion_limit: number
    configurable: any
  }
  metadata: any
}

export interface UserAIConfig {
  user_id: string
  country_code: string
  language_code: string
  dietary_restrictions: string
  budget_level: string
  household_size: number
  store_preference: string
  store_websites: string
  // Agent BB v2 Assistant fields
  assistant_id?: string
  assistant_name?: string
  assistant_config?: any
  assistant_metadata?: any
  assistant_created_at?: string
}

export interface CreateAssistantRequest {
  user_id: string
  country_code: string
  language_code: string
  dietary_restrictions: string
  budget_level: string
  household_size: number
  store_preference: string
  store_websites: string
}

/**
 * Agent BB v2 Service Class
 */
export class AgentBBService {
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor() {
    const apiKey = process.env[AGENT_BB_CONFIG.API_KEY_ENV]
    if (!apiKey) {
      throw new Error(`${AGENT_BB_CONFIG.API_KEY_ENV} environment variable is not set`)
    }
    this.apiKey = apiKey
    this.baseUrl = AGENT_BB_CONFIG.BASE_URL
  }

  /**
   * Create an Agent BB v2 Assistant with user-specific configuration
   */
  async createUserAssistant(userConfig: CreateAssistantRequest): Promise<AgentBBAssistant> {
    try {
      // Clean phone number (remove any double + or formatting issues)
      const cleanUserId = userConfig.user_id.replace(/^\++/, '+').replace(/\s+/g, '')
      console.log('🤖 Creating Agent BB v2 Assistant for user:', cleanUserId)

      // Map user config to new Agent BB v2 supervisor_agent configuration format
      const storeWebsites = userConfig.store_websites || this.mapStoreWebsites(userConfig.store_preference, userConfig.country_code)
      const storePreference = userConfig.store_preference || this.mapStorePreference(userConfig.store_preference, userConfig.country_code)
      
      const assistantConfig = {
        configurable: {
          user_id: cleanUserId,
          country_code: userConfig.country_code,
          language_code: userConfig.language_code,
          budget_level: userConfig.budget_level,
          household_size: userConfig.household_size,
          dietary_restrictions: userConfig.dietary_restrictions || 'none',
          store_preference: storePreference,
          store_websites: storeWebsites,
          
          // AI Models Configuration
          supervisor_model: "openai/gpt-4.1",
          grocery_model: "openai/gpt-4.1", 
          promotions_model: "openai/gpt-4.1",
          
          // Tools Configuration
          grocery_tools: ["advanced_research_tool", "get_todays_date"],
          promotions_tools: ["advanced_research_tool", "get_todays_date"],
          
          // System Prompts
          supervisor_system_prompt: this.generateSupervisorPrompt(userConfig),
          grocery_system_prompt: this.generateGroceryPrompt(),
          promotions_system_prompt: this.generatePromotionsPrompt()
        }
      }

      // Generate assistant name
      const assistantName = `BargainB Assistant for ${userConfig.user_id}`

      // Create assistant using Agent BB v2 API
      const response = await fetch(`${this.baseUrl}/assistants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey
        },
        body: JSON.stringify({
          graph_id: AGENT_BB_CONFIG.GRAPH_ID,
          name: assistantName,
          config: assistantConfig,
          metadata: {
            user_id: userConfig.user_id,
            country: userConfig.country_code,
            language: userConfig.language_code,
            created_via: 'onboarding',
            store_preference: userConfig.store_preference,
            dietary_restrictions: userConfig.dietary_restrictions,
            budget_level: userConfig.budget_level,
            household_size: userConfig.household_size,
            store_websites: userConfig.store_websites
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Agent BB v2 API error:', errorText)
        throw new Error(`Failed to create assistant: ${response.status} - ${errorText}`)
      }

      const assistant = await response.json() as AgentBBAssistant
      console.log('✅ Created Agent BB v2 Assistant:', assistant.assistant_id)

      return assistant

    } catch (error) {
      console.error('❌ Error creating Agent BB v2 assistant:', error)
      throw error
    }
  }

  /**
   * Get an existing Assistant by ID
   */
  async getAssistant(assistantId: string): Promise<AgentBBAssistant> {
    try {
      const response = await fetch(`${this.baseUrl}/assistants/${assistantId}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get assistant: ${response.status}`)
      }

      return await response.json() as AgentBBAssistant

    } catch (error) {
      console.error('❌ Error getting Agent BB v2 assistant:', error)
      throw error
    }
  }

  /**
   * Update an existing Assistant
   */
  async updateAssistant(assistantId: string, updates: Partial<{
    name: string
    config: any
    metadata: any
  }>): Promise<AgentBBAssistant> {
    try {
      const response = await fetch(`${this.baseUrl}/assistants/${assistantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`Failed to update assistant: ${response.status}`)
      }

      return await response.json() as AgentBBAssistant

    } catch (error) {
      console.error('❌ Error updating Agent BB v2 assistant:', error)
      throw error
    }
  }

  /**
   * Delete an Assistant
   */
  async deleteAssistant(assistantId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/assistants/${assistantId}`, {
        method: 'DELETE',
        headers: {
          'X-Api-Key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to delete assistant: ${response.status}`)
      }

      console.log('✅ Deleted Agent BB v2 Assistant:', assistantId)

    } catch (error) {
      console.error('❌ Error deleting Agent BB v2 assistant:', error)
      throw error
    }
  }

  /**
   * Store assistant details in conversations table for now
   * (until user_ai_configs table is properly set up with assistant fields)
   */
  async storeAssistantInConversation(userId: string, assistant: AgentBBAssistant): Promise<void> {
    try {
      console.log('💾 Storing assistant details in conversation:', userId)

      // Clean phone number for database query (remove + and any formatting)
      const cleanPhone = userId.replace(/\+/g, '').replace(/\s+/g, '')
      console.log('🔍 Looking for WhatsApp contact with phone:', cleanPhone)

      // First, find or create a conversation for this user
      const { data: whatsappContact } = await supabaseAdmin
        .from('whatsapp_contacts')
        .select('id')
        .eq('phone_number', cleanPhone)
        .single()

      if (!whatsappContact) {
        throw new Error(`WhatsApp contact not found for user: ${userId} (cleaned: ${cleanPhone})`)
      }

      // Check if conversation exists
      let { data: conversation } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('whatsapp_contact_id', whatsappContact.id)
        .single()

      if (!conversation) {
        // Create conversation if it doesn't exist
        const { data: newConversation, error: createError } = await supabaseAdmin
          .from('conversations')
          .insert({
            whatsapp_contact_id: whatsappContact.id,
            whatsapp_conversation_id: `conv_${userId}_${Date.now()}`,
            ai_enabled: true,
            status: 'active',
            created_at: new Date().toISOString()
          })
          .select('id')
          .single()

        if (createError) {
          throw new Error(`Failed to create conversation: ${createError.message}`)
        }

        conversation = newConversation
      }

      // Update conversation with assistant details
      const { error: updateError } = await supabaseAdmin
        .from('conversations')
        .update({
          assistant_id: assistant.assistant_id,
          assistant_name: assistant.name,
          assistant_config: assistant.config,
          assistant_metadata: assistant.metadata,
          assistant_created_at: assistant.created_at,
          ai_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id)

      if (updateError) {
        console.error('❌ Error updating conversation with assistant:', updateError)
        throw new Error(`Failed to update conversation: ${updateError.message}`)
      }

      console.log('✅ Successfully stored assistant details in conversation')

    } catch (error) {
      console.error('❌ Error storing assistant in conversation:', error)
      throw error
    }
  }

  /**
   * Get user AI config with assistant details from conversation
   */
  async getUserConfigWithAssistant(userId: string): Promise<UserAIConfig | null> {
    try {
      // Get from conversations table for now
      const { data: whatsappContact } = await supabaseAdmin
        .from('whatsapp_contacts')
        .select('id')
        .eq('phone_number', userId)
        .single()

      if (!whatsappContact) {
        return null
      }

      const { data: conversation } = await supabaseAdmin
        .from('conversations')
        .select(`
          assistant_id,
          assistant_name,
          assistant_config,
          assistant_metadata,
          assistant_created_at
        `)
        .eq('whatsapp_contact_id', whatsappContact.id)
        .single()

      if (!conversation || !conversation.assistant_id) {
        return null
      }

      // Mock the UserAIConfig structure for now
      return {
        user_id: userId,
        country_code: 'NL', // Default values - should come from CRM profile
        language_code: 'nl',
        dietary_restrictions: 'none',
        budget_level: 'medium',
        household_size: 1,
        store_preference: 'any',
        store_websites: 'ah.nl, jumbo.com, lidl.nl',
        assistant_id: conversation.assistant_id,
        assistant_name: conversation.assistant_name,
        assistant_config: conversation.assistant_config,
        assistant_metadata: conversation.assistant_metadata,
        assistant_created_at: conversation.assistant_created_at
      } as UserAIConfig

    } catch (error) {
      console.error('❌ Error getting user config with assistant:', error)
      return null
    }
  }

  /**
   * Map budget level to actual budget amount
   */
  private mapBudgetLevel(budgetLevel: string): number {
    switch (budgetLevel.toLowerCase()) {
      case 'low':
        return 50
      case 'high':
        return 200
      case 'medium':
      default:
        return 100
    }
  }

  /**
   * Map store preference to comma-separated string for new deployment
   */
  private mapStorePreference(storePreference: string, countryCode: string): string {
    if (countryCode === 'NL') {
      if (storePreference === 'albert-heijn') return 'Albert Heijn, Jumbo, Lidl'
      if (storePreference === 'jumbo') return 'Jumbo, Albert Heijn, Lidl'
      if (storePreference === 'lidl') return 'Lidl, Albert Heijn, Jumbo'
      return 'Albert Heijn, Jumbo, Lidl, Dirk'
    }
    if (countryCode === 'US') {
      return 'Kroger, Trader Joes, Costco, Walmart'
    }
    return 'Local Grocery Store'
  }

  /**
   * Map store websites for new deployment
   */
  private mapStoreWebsites(storePreference: string, countryCode: string): string {
    if (countryCode === 'NL') {
      return 'ah.nl, jumbo.com, lidl.nl, dirk.nl'
    }
    if (countryCode === 'US') {
      return 'kroger.com, traderjoes.com, costco.com, walmart.com'
    }
    return 'local-store.com'
  }

  /**
   * Generate supervisor system prompt for new deployment
   */
  private generateSupervisorPrompt(userConfig: CreateAssistantRequest): string {
    const countryName = userConfig.country_code === 'NL' ? 'Dutch' : 'International'
    return `Today's date is ${new Date().toISOString().split('T')[0]}

You are the ${countryName} Grocery Shopping Assistant orchestrating a team of specialized AI agents to help users with grocery shopping and promotions worldwide.

Available agents and their advanced capabilities:

PROMOTIONS RESEARCH AGENT:
- promotion_hunter: Advanced deal detection with time-sensitive filtering
- regional_deals_search: Location-specific promotions and local store offers  
- grocery_news_search: Latest promotional announcements and breaking deals
- store_specific_search: Targeted searches within user's preferred stores
- multi_angle_research: Comprehensive promotion coverage across strategies

GROCERY SEARCH AGENT:
- store_specific_search: Product searches within user's preferred stores and regions
- product_comparison_search: Price comparisons across multiple grocery stores
- regional_deals_search: Local product availability and regional pricing
- grocery_news_search: Latest product launches and store announcements
- multi_angle_research: Comprehensive product research combining all strategies

ENHANCED CAPABILITIES:
✅ Store-aware searching with user's preferred stores and websites
✅ Time-filtered results for current deals and recent information  
✅ Regional optimization based on user's country and location
✅ Post-processing for grocery-specific relevance and quality
✅ Parallel searches for comprehensive coverage and faster results
✅ Smart query optimization for grocery and promotion searches

USER CONTEXT INTEGRATION:
- Country-specific store domains and regional chains
- Store preference prioritization (user's preferred store gets priority)
- Store websites integration for targeted searches
- Dietary restrictions consideration for relevant product/deal filtering
- Budget level awareness for appropriate price range suggestions
- Household size context for quantity and bulk deal recommendations

Your workflow:
1. Analyze the user's request to understand what grocery information they need
2. Consider user's international configuration (location, language, dietary needs, budget, store preference)
3. Route to appropriate agents with fully personalized context including:
   - User's preferred store and regional stores
   - Store websites for targeted searching
   - Dietary restrictions and budget considerations
   - Regional and language preferences
4. Leverage agents' specialized tools for maximum relevance and current information
5. Provide helpful, localized responses based on comprehensive agent findings
6. When the task is complete, you can end the conversation

Always provide personalized grocery shopping assistance adapted to the user's location and preferences.`
  }

  /**
   * Generate grocery system prompt for new deployment
   */
  private generateGroceryPrompt(): string {
    return `Today's date is ${new Date().toISOString().split('T')[0]}. You are an expert grocery shopping research agent specialized in finding products and deals.

You have access to the following tools: advanced_research_tool and get_todays_date.
First get today's date then continue to use the advanced_research_tool to search for grocery products, prices, and availability.

When you are done with your research, return the product findings to the supervisor agent.`
  }

  /**
   * Generate promotions system prompt for new deployment
   */
  private generatePromotionsPrompt(): string {
    return `Today's date is ${new Date().toISOString().split('T')[0]}. You are an expert promotions research agent specialized in finding grocery promotions.

You have access to the following tools: advanced_research_tool and get_todays_date.
First get today's date then continue to use the advanced_research_tool to search for current grocery promotions and deals.

When you are done with your research, return the promotion findings to the supervisor agent.`
  }
}

// Singleton instance
export const agentBBService = new AgentBBService() 