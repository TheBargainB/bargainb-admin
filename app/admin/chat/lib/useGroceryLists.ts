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

interface UseGroceryListsOptions {
  selectedConversation: ChatConversation | undefined
}

export const useGroceryLists = ({ selectedConversation }: UseGroceryListsOptions) => {
  const [groceryListsData, setGroceryListsData] = useState<any[]>([])
  const [isLoadingGroceryData, setIsLoadingGroceryData] = useState(false)

  // Load grocery lists data for current conversation
  const loadGroceryListsData = async () => {
    if (!selectedConversation?.remoteJid) return
    
    setIsLoadingGroceryData(true)
    try {
      console.log('🛒 Loading grocery lists data for:', selectedConversation.remoteJid)
      
      // Query messages that contain grocery list AI responses
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation.conversationId || selectedConversation.remoteJid)
        .eq('sender_type', 'ai_agent')
        .or('content.ilike.%grocery%,content.ilike.%shopping list%,content.ilike.%€%,content.ilike.%budget%')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) {
        console.error('❌ Error loading grocery lists data:', error)
        return
      }
      
      console.log('✅ Loaded grocery lists data:', messages?.length || 0, 'messages')
      setGroceryListsData(messages || [])
      
    } catch (error) {
      console.error('❌ Failed to load grocery lists data:', error)
    } finally {
      setIsLoadingGroceryData(false)
    }
  }

  return {
    groceryListsData,
    isLoadingGroceryData,
    loadGroceryListsData
  }
} 