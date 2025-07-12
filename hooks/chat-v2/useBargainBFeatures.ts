import { useState, useCallback } from 'react'
import type { Conversation } from '@/types/chat-v2.types'

// =============================================================================
// BARGAINB BUSINESS FEATURES HOOK
// =============================================================================

interface MealPlan {
  id: string
  meal_type: string
  meal_date: string
  custom_meal_name: string | null
  is_completed: boolean
  created_at: string
  recipe?: {
    id: string
    name: string
    description: string
  }
}

interface GroceryList {
  id: string
  name: string
  status: string
  is_template: boolean
  created_at: string
  items?: any[]
}

interface BargainBFeaturesData {
  mealPlans: MealPlan[]
  groceryLists: GroceryList[]
  isLoadingMeals: boolean
  isLoadingGrocery: boolean
}

/**
 * Hook for BargainB-specific business features
 * Handles meal planning and grocery list functionality
 */
export const useBargainBFeatures = (conversation: Conversation | undefined) => {
  const [data, setData] = useState<BargainBFeaturesData>({
    mealPlans: [],
    groceryLists: [],
    isLoadingMeals: false,
    isLoadingGrocery: false
  })

  // =============================================================================
  // MEAL PLANNING FUNCTIONS
  // =============================================================================

  const loadMealPlans = useCallback(async () => {
    if (!conversation?.contact?.id) return

    setData(prev => ({ ...prev, isLoadingMeals: true }))
    
    try {
      console.log('🍽️ Loading meal plans for conversation:', conversation.id)
      
      // Get enhanced contact data which includes meal plans
      const response = await fetch(`/api/admin/chat/conversations/${conversation.id}/enhanced-contact`)
      
      if (!response.ok) {
        throw new Error(`Failed to load meal plans: ${response.status}`)
      }
      
      const result = await response.json()
      const mealPlans = result.data?.meals?.meal_plans || []
      
      console.log('✅ Loaded meal plans:', mealPlans.length)
      setData(prev => ({ ...prev, mealPlans, isLoadingMeals: false }))
      
    } catch (error) {
      console.error('❌ Error loading meal plans:', error)
      setData(prev => ({ ...prev, isLoadingMeals: false }))
    }
  }, [conversation?.id, conversation?.contact?.id])

  const getMealPlansByType = useCallback((mealType: string) => {
    return data.mealPlans.filter(plan => plan.meal_type === mealType)
  }, [data.mealPlans])

  const getCompletedMeals = useCallback(() => {
    return data.mealPlans.filter(plan => plan.is_completed)
  }, [data.mealPlans])

  const getUpcomingMeals = useCallback(() => {
    const today = new Date()
    return data.mealPlans.filter(plan => 
      !plan.is_completed && new Date(plan.meal_date) >= today
    )
  }, [data.mealPlans])

  // =============================================================================
  // GROCERY LIST FUNCTIONS
  // =============================================================================

  const loadGroceryLists = useCallback(async () => {
    if (!conversation?.contact?.id) return

    setData(prev => ({ ...prev, isLoadingGrocery: true }))
    
    try {
      console.log('🛒 Loading grocery lists for conversation:', conversation.id)
      
      // Get enhanced contact data which includes grocery lists
      const response = await fetch(`/api/admin/chat/conversations/${conversation.id}/enhanced-contact`)
      
      if (!response.ok) {
        throw new Error(`Failed to load grocery lists: ${response.status}`)
      }
      
      const result = await response.json()
      const groceryLists = result.data?.grocery?.lists || []
      
      console.log('✅ Loaded grocery lists:', groceryLists.length)
      setData(prev => ({ ...prev, groceryLists, isLoadingGrocery: false }))
      
    } catch (error) {
      console.error('❌ Error loading grocery lists:', error)
      setData(prev => ({ ...prev, isLoadingGrocery: false }))
    }
  }, [conversation?.id, conversation?.contact?.id])

  const getActiveGroceryLists = useCallback(() => {
    return data.groceryLists.filter(list => list.status === 'active')
  }, [data.groceryLists])

  const getTemplateGroceryLists = useCallback(() => {
    return data.groceryLists.filter(list => list.is_template)
  }, [data.groceryLists])

  // =============================================================================
  // COMBINED FUNCTIONS
  // =============================================================================

  const loadAllBargainBData = useCallback(async () => {
    if (!conversation?.contact?.id) return

    console.log('🏪 Loading all BargainB features for conversation:', conversation.id)
    
    await Promise.all([
      loadMealPlans(),
      loadGroceryLists()
    ])
    
    console.log('✅ All BargainB features loaded')
  }, [loadMealPlans, loadGroceryLists])

  const refreshData = useCallback(async () => {
    await loadAllBargainBData()
  }, [loadAllBargainBData])

  // =============================================================================
  // ANALYTICS FUNCTIONS
  // =============================================================================

  const getBargainBStats = useCallback(() => {
    return {
      totalMealPlans: data.mealPlans.length,
      completedMeals: getCompletedMeals().length,
      upcomingMeals: getUpcomingMeals().length,
      totalGroceryLists: data.groceryLists.length,
      activeGroceryLists: getActiveGroceryLists().length,
      templateGroceryLists: getTemplateGroceryLists().length
    }
  }, [data.mealPlans.length, data.groceryLists.length, getCompletedMeals, getUpcomingMeals, getActiveGroceryLists, getTemplateGroceryLists])

  return {
    // Data
    mealPlans: data.mealPlans,
    groceryLists: data.groceryLists,
    
    // Loading states
    isLoadingMeals: data.isLoadingMeals,
    isLoadingGrocery: data.isLoadingGrocery,
    isLoading: data.isLoadingMeals || data.isLoadingGrocery,
    
    // Meal planning functions
    loadMealPlans,
    getMealPlansByType,
    getCompletedMeals,
    getUpcomingMeals,
    
    // Grocery list functions
    loadGroceryLists,
    getActiveGroceryLists,
    getTemplateGroceryLists,
    
    // Combined functions
    loadAllBargainBData,
    refreshData,
    getBargainBStats
  }
} 