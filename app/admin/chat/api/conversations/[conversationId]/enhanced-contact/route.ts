import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params
    
    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'Conversation ID is required'
      }, { status: 400 })
    }
    
    console.log('📋 Getting comprehensive user data for conversation:', conversationId)
    
    // Get conversation with AI config and WhatsApp contact
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        *,
        whatsapp_contacts (
          id,
          whatsapp_jid,
          display_name,
          phone_number,
          is_business_account,
          verified_name,
          profile_picture_url,
          whatsapp_status,
          last_seen_at,
          created_at,
          updated_at
        )
      `)
      .eq('id', conversationId)
      .single()
    
    if (conversationError) {
      console.error('❌ Error fetching conversation:', conversationError)
      return NextResponse.json({
        success: false,
        error: 'Conversation not found'
      }, { status: 404 })
    }

    const whatsappContactId = conversation.whatsapp_contacts?.id
    if (!whatsappContactId) {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp contact not found for this conversation'
      }, { status: 404 })
    }

    // Get CRM profile data
    const { data: crmProfile, error: crmError } = await supabase
      .from('crm_profiles')
      .select('*')
      .eq('whatsapp_contact_id', whatsappContactId)
      .single()

    // Get grocery lists
    const { data: groceryLists, error: groceryError } = await supabase
      .from('grocery_lists')
      .select('*')
      .eq('crm_profile_id', crmProfile?.id)
      .order('created_at', { ascending: false })

    // Get meal plans with recipes
    const { data: mealPlans, error: mealError } = await supabase
      .from('meal_plans')
      .select(`
        *,
        recipes (
          id,
          name,
          description,
          prep_time_minutes,
          cook_time_minutes,
          difficulty_level,
          cuisine_type,
          dietary_tags
        )
      `)
      .eq('crm_profile_id', crmProfile?.id)
      .order('meal_date', { ascending: false })

    // Get user's recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .eq('created_by', crmProfile?.id)
      .order('created_at', { ascending: false })

    // Get budget periods
    const { data: budgetPeriods, error: budgetError } = await supabase
      .from('budget_periods')
      .select('*')
      .eq('crm_profile_id', crmProfile?.id)
      .order('start_date', { ascending: false })

    // Get budget expenses
    const { data: budgetExpenses, error: expensesError } = await supabase
      .from('budget_expenses')
      .select('*')
      .eq('crm_profile_id', crmProfile?.id)
      .order('date', { ascending: false })
      .limit(10)

    // Get budget savings goals
    const { data: savingsGoals, error: savingsError } = await supabase
      .from('budget_savings_goals')
      .select('*')
      .eq('crm_profile_id', crmProfile?.id)
      .order('target_date', { ascending: false })

    // Get customer events
    const { data: customerEvents, error: eventsError } = await supabase
      .from('customer_events')
      .select('*')
      .eq('crm_profile_id', crmProfile?.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Get AI interactions
    const { data: aiInteractions, error: aiError } = await supabase
      .from('ai_interactions')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Prepare comprehensive user data
    const userData = {
      // Contact Info
      contact: {
        whatsapp: conversation.whatsapp_contacts,
        crm: crmProfile || null
      },
      
      // AI Configuration
      aiConfig: {
        conversation: {
          ai_enabled: conversation.ai_enabled,
          ai_config: conversation.ai_config,
          assistant_config: conversation.assistant_config,
          assistant_name: conversation.assistant_name
        },
        interactions: aiInteractions || [],
        stats: {
          total_interactions: aiInteractions?.length || 0,
          avg_response_time: aiInteractions?.length > 0 
            ? aiInteractions.reduce((sum, i) => sum + (i.processing_time_ms || 0), 0) / aiInteractions.length
            : 0,
          success_rate: aiInteractions?.length > 0
            ? (aiInteractions.filter(i => i.success).length / aiInteractions.length) * 100
            : 0
        }
      },

      // Meals Data
      meals: {
        meal_plans: mealPlans || [],
        recipes: recipes || [],
        stats: {
          total_meal_plans: mealPlans?.length || 0,
          completed_meals: mealPlans?.filter(m => m.is_completed).length || 0,
          custom_recipes: recipes?.length || 0
        }
      },

      // Data & Activity
      data: {
        grocery_lists: groceryLists || [],
        budget: {
          periods: budgetPeriods || [],
          expenses: budgetExpenses || [],
          savings_goals: savingsGoals || []
        },
        activity: customerEvents || [],
        stats: {
          active_grocery_lists: groceryLists?.filter(g => g.status === 'active').length || 0,
          total_budget: budgetPeriods?.[0]?.total_budget || 0,
          total_spent: budgetPeriods?.[0]?.total_spent || 0,
          recent_events: customerEvents?.length || 0
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: userData
    })

  } catch (error) {
    console.error('❌ Error fetching enhanced contact data:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 