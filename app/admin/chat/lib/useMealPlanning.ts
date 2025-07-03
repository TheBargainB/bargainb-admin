import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ChatConversation {
  id: string
  user: string
  email: string
  avatar: string
  lastMessage: string
  timestamp: string
  status: 'active' | 'resolved' | 'escalated'
  unread_count: number
  type: string
  aiConfidence: number
  lastMessageAt?: string
  remoteJid?: string
  conversationId?: string
  phoneNumber?: string
}

interface UseMealPlanningOptions {
  selectedConversation: ChatConversation | undefined
}

export const useMealPlanning = ({ selectedConversation }: UseMealPlanningOptions) => {
  const [mealPlanningData, setMealPlanningData] = useState<any[]>([])
  const [isLoadingMealData, setIsLoadingMealData] = useState(false)
  const [selectedMealPlan, setSelectedMealPlan] = useState<any>(null)
  const [isMealPlanModalOpen, setIsMealPlanModalOpen] = useState(false)

  // Load meal planning data for current conversation
  const loadMealPlanningData = async () => {
    if (!selectedConversation?.remoteJid) return
    
    setIsLoadingMealData(true)
    try {
      console.log('🍽️ Loading meal planning data for:', selectedConversation.remoteJid)
      
      // Query messages that contain meal planning AI responses
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation.conversationId || selectedConversation.remoteJid)
        .eq('sender_type', 'ai_agent')
        .ilike('content', '%meal%')
        .or('content.ilike.%recipe%,content.ilike.%dinner%,content.ilike.%breakfast%,content.ilike.%lunch%')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) {
        console.error('❌ Error loading meal planning data:', error)
        return
      }
      
      console.log('✅ Loaded meal planning data:', messages?.length || 0, 'messages')
      setMealPlanningData(messages || [])
      
    } catch (error) {
      console.error('❌ Failed to load meal planning data:', error)
    } finally {
      setIsLoadingMealData(false)
    }
  }

  return {
    mealPlanningData,
    isLoadingMealData,
    loadMealPlanningData,
    selectedMealPlan,
    setSelectedMealPlan,
    isMealPlanModalOpen,
    setIsMealPlanModalOpen
  }
} 