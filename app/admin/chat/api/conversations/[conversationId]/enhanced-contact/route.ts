import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const conversationId = params.conversationId
    
    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'Conversation ID is required'
      }, { status: 400 })
    }
    
    console.log('📋 Getting comprehensive user data for conversation:', conversationId)
    
    // Get conversation with AI config and WhatsApp contact
    const { data: conversation, error: conversationError } = await supabaseAdmin
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
    const phoneNumber = conversation.whatsapp_contacts?.phone_number
    
    if (!whatsappContactId || !phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp contact not found for this conversation'
      }, { status: 404 })
    }

    // Get CRM profile
    const { data: crmProfile, error: crmError } = await supabaseAdmin
      .from('crm_profiles')
      .select('*')
      .eq('whatsapp_contact_id', whatsappContactId)
      .single()

    if (crmError || !crmProfile || !crmProfile.id) {
      return NextResponse.json(
        { success: false, error: 'CRM profile not found or invalid' },
        { status: 404 }
      )
    }

    // Get grocery lists
    const { data: groceryLists, error: groceryError } = await supabaseAdmin
      .from('grocery_lists')
      .select('*')
      .eq('crm_profile_id', crmProfile.id)
      .order('created_at', { ascending: false })

    // Get meal plans with recipes
    const { data: mealPlans, error: mealError } = await supabaseAdmin
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
      .eq('crm_profile_id', crmProfile.id)
      .order('meal_date', { ascending: false })

    // Get user's recipes
    const { data: recipes, error: recipesError } = await supabaseAdmin
      .from('recipes')
      .select('*')
      .eq('created_by', crmProfile.id)
      .order('created_at', { ascending: false })

    // Get budget periods
    const { data: budgetPeriods, error: budgetError } = await supabaseAdmin
      .from('budget_periods')
      .select('*')
      .eq('crm_profile_id', crmProfile.id)
      .order('start_date', { ascending: false })

    // Get budget expenses - first get budget category IDs, then get expenses
    let budgetExpenses: any[] = []
    if (budgetPeriods && budgetPeriods.length > 0) {
      const budgetPeriodIds = budgetPeriods.map(p => p.id)
      
      // Get budget categories for these periods
      const { data: budgetCategories } = await supabaseAdmin
        .from('budget_categories')
        .select('id')
        .in('budget_period_id', budgetPeriodIds)
      
      if (budgetCategories && budgetCategories.length > 0) {
        const categoryIds = budgetCategories.map(c => c.id)
        
        // Get expenses for these categories
        const { data: expenses } = await supabaseAdmin
          .from('budget_expenses')
          .select('*')
          .in('budget_category_id', categoryIds)
          .order('expense_date', { ascending: false })
          .limit(10)
        
        budgetExpenses = expenses || []
      }
    }

    // Get budget savings goals
    const { data: savingsGoals, error: savingsError } = await supabaseAdmin
      .from('budget_savings_goals')
      .select('*')
      .eq('crm_profile_id', crmProfile.id)
      .order('target_date', { ascending: false })

    // Get customer events
    const { data: customerEvents, error: eventsError } = await supabaseAdmin
      .from('customer_events')
      .select('*')
      .eq('crm_profile_id', crmProfile.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Get AI interactions
    const { data: aiInteractions, error: aiError } = await supabaseAdmin
      .from('ai_interactions')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Calculate analytics based on available data
    const totalGroceryLists = groceryLists?.length || 0
    const totalMealPlans = mealPlans?.length || 0
    const completedMealPlans = mealPlans?.filter(m => m.is_completed).length || 0
    const totalRecipes = recipes?.length || 0
    const totalBudgetPeriods = budgetPeriods?.length || 0
    const totalExpenses = budgetExpenses?.length || 0
    const totalSavingsGoals = savingsGoals?.length || 0
    const achievedGoals = savingsGoals?.filter(g => g.is_achieved).length || 0
    const totalEvents = customerEvents?.length || 0

    // AI interaction analytics with proper null checks
    const aiInteractionsArray = aiInteractions || []
    const aiAnalytics = {
      total_interactions: aiInteractionsArray.length,
      avg_response_time: aiInteractionsArray.length > 0
        ? aiInteractionsArray.reduce((sum: number, i: any) => sum + (i.processing_time_ms || 0), 0) / aiInteractionsArray.length
        : 0,
      success_rate: aiInteractionsArray.length > 0
        ? (aiInteractionsArray.filter((i: any) => i.success).length / aiInteractionsArray.length) * 100
        : 0
    }

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
        stats: aiAnalytics
      },

      // Meals Data
      meals: {
        meal_plans: mealPlans || [],
        recipes: recipes || [],
        stats: {
          total_meal_plans: totalMealPlans,
          completed_meals: completedMealPlans,
          custom_recipes: totalRecipes
        }
      },

      // Grocery Data
      grocery: {
        lists: groceryLists || [],
        stats: {
          total_lists: totalGroceryLists,
          active_lists: groceryLists?.filter(l => l.status === 'active').length || 0,
          template_lists: groceryLists?.filter(l => l.is_template).length || 0
        }
      },

      // Budget Data
      budget: {
        periods: budgetPeriods || [],
        expenses: budgetExpenses || [],
        savings_goals: savingsGoals || [],
        stats: {
          total_periods: totalBudgetPeriods,
          active_periods: budgetPeriods?.filter(p => p.is_active).length || 0,
          total_expenses: totalExpenses,
          total_savings_goals: totalSavingsGoals,
          achieved_goals: achievedGoals
        }
      },

      // Customer Events
      events: {
        recent_events: customerEvents || [],
        stats: {
          total_events: totalEvents
        }
      },

      // Summary Analytics
      summary: {
        engagement_score: crmProfile.engagement_score || 0,
        lifecycle_stage: crmProfile.lifecycle_stage || 'unknown',
        shopping_persona: crmProfile.shopping_persona || 'unknown',
        total_conversations: crmProfile.total_conversations || 0,
        total_messages: crmProfile.total_messages || 0,
        customer_since: crmProfile.customer_since,
        last_activity: conversation.last_message_at
      }
    }

    console.log('✅ Successfully compiled comprehensive user data')
    
    return NextResponse.json({
      success: true,
      data: userData
    })

  } catch (error) {
    console.error('❌ Error in enhanced contact endpoint:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch enhanced contact data'
    }, { status: 500 })
  }
} 