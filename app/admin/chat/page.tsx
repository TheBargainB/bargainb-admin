"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import {
  Search,
  Send,
  Bot,
  User,
  Clock,
  MessageSquare,
  Settings,
  MoreVertical,
  Plus,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Activity,
  Zap,
  Brain,
  Target,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Smartphone,
  Users,
  Trash2,
  ChevronDown,
  BarChart3,
  TrendingUp
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'
import { refreshGlobalUnreadCount } from '@/hooks/useGlobalNotifications'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"

import { ChatUserProfile } from './components/ChatUserProfile'
import AIConfigTab from './components/AIConfigTab'
import { useRealTimeChat } from './lib/useRealTimeChat'
import { useGroceryLists } from './lib/useGroceryLists'
import { useMealPlanning } from './lib/useMealPlanning'
import { useBusiness } from './lib/useBusiness'
import { useWASender } from './lib/useWASender'
import { useAnalytics } from './lib/useAnalytics'
import { useDatabase } from './lib/useDatabase'
import { useContacts } from './lib/useContacts'
import { useChatActions } from './lib/useChatActions'
import { useHelpers } from './lib/useHelpers'

// Import contact types from service
import { ContactService, WhatsAppContact as DbWhatsAppContact, Contact } from './lib/contact-service'

// WhatsApp types
interface WhatsAppMessage {
  id: string
  fromMe: boolean
  remoteJid: string
  conversation: string
  timestamp: number
  status?: number
}

// UI-friendly WhatsApp contact interface (mapped from database)
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

// Message status enum
enum MessageStatus {
  ERROR = 0,
  PENDING = 1,
  SENT = 2,
  DELIVERED = 3,
  READ = 4,
  PLAYED = 5,
}

// Chat conversation interface for UI consistency
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

// Chat message interface for UI consistency
interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai' | 'admin'
  senderName: string
  timestamp: string
  confidence?: number
  status?: string
  metadata?: Record<string, any>
}

export default function ChatPage() {
  // WhatsApp State (using hook for whatsappMessages and whatsappContacts)
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  
  // Chat interface state
  const [databaseConversations, setDatabaseConversations] = useState<ChatConversation[]>([])
  const [databaseMessages, setDatabaseMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [aiEnabled, setAiEnabled] = useState(false)
  const [autoResponse, setAutoResponse] = useState(true)
  const [responseDelay, setResponseDelay] = useState([2])
  const [confidenceThreshold, setConfidenceThreshold] = useState([75])
  const [isLoading, setIsLoading] = useState(false)
  // Note: isSending is now handled by useChatActions hook
  // Note: Contact-related state is now handled by useContacts hook
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)
  
  // Analytics functionality
  const { 
    analyticsData, 
    chartData, 
    isLoadingAnalytics, 
    loadAnalyticsData,
    getAnalyticsSummary,
    getChartDataForPeriod,
    calculateTrends 
  } = useAnalytics()
  
  // Database functionality
  const databaseHook = useDatabase({
    onConversationsUpdate: setDatabaseConversations,
    onMessagesUpdate: setDatabaseMessages,
    onContactsCountUpdate: (count) => console.log('📊 Contacts count updated:', count)
  })
  
  // Extract database state and functions
  const {
    isLoadingMessages,
    isLoadingConversations,
    isLoadingContactsCount,
    isDeletingConversation,
    contactsCount,
    aiPromptsData,
    loadMessagesFromDatabase,
    loadConversationsFromDatabase,
    markConversationAsRead,
    deleteConversation: deleteDatabaseConversation,
    loadContactsCount,
    loadAiPromptsData,
    clearDatabaseState,
    refreshAllData
  } = databaseHook
  const [selectedGroceryList, setSelectedGroceryList] = useState<any>(null)
  const [isGroceryListModalOpen, setIsGroceryListModalOpen] = useState(false)
  

  
  // Refs for smooth scrolling
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Smart scrolling state
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false)
  const lastMessageCountRef = useRef(0)
  
  // Polling control refs to prevent multiple intervals
  const conversationPollingRef = useRef<NodeJS.Timeout | null>(null)
  const messagePollingRef = useRef<NodeJS.Timeout | null>(null)
  const refreshPollingRef = useRef<NodeJS.Timeout | null>(null)
  
  const { toast } = useToast()
  
  // Business contact functionality
  const { businessContact, BUSINESS_PHONE_NUMBER, fetchContactInfo, fetchContactProfilePicture } = useBusiness()

  // Initialize WASender hook (gradually replacing existing functions)
  const wasenderHook = useWASender({
    selectedContact: selectedContact || undefined,
    selectedConversation: selectedContact ? databaseConversations.find(c => c.email === selectedContact) : undefined,
    newMessage,
    setNewMessage,
    loadConversationsFromDatabase: () => loadConversationsFromDatabase(true),
    onConversationCreated: (conversation) => {
      setDatabaseConversations(prev => [conversation, ...prev])
    }
  })

  // Extract WASender state and functions for use in component
  const {
    whatsappMessages: hookWhatsappMessages,
    whatsappContacts: hookWhatsappContacts,
    allContacts: wasenderAllContacts,
    isLoadingContacts: wasenderLoadingContacts,
    isSyncingContacts: wasenderSyncingContacts,
    isCreatingConversation: wasenderCreatingConversation
    // Note: extractPhoneNumber is now provided by useHelpers hook
  } = wasenderHook

  // Contacts functionality
  // Pure contacts functionality (no chat dependencies)
  const contactsHook = useContacts()

  // Extract contacts functions for use in component
  const {
    allContacts,
    filteredContacts,
    isLoadingContacts,
    isSyncingContacts,
    contactSearchTerm,
    isContactsDialogOpen,
    filteredContactsCount,
    loadAllContacts,
    syncContactsWithWASender,
    handleOpenContactsDialog,
    setContactSearchTerm,
    setIsContactsDialogOpen,
    closeContactsDialog
  } = contactsHook

  // Chat actions functionality (conversation creation, messaging, etc.)
  const chatActionsHook = useChatActions({
    selectedContact: selectedContact || undefined,
    newMessage,
    setNewMessage,
    loadConversationsFromDatabase: databaseHook.loadConversationsFromDatabase,
    loadMessagesFromDatabase: databaseHook.loadMessagesFromDatabase,
    setSelectedContact,
    setDatabaseMessages,
    databaseConversations,
    onConversationCreated: (conversation: ChatConversation) => {
      console.log('📞 Conversation created via chat actions:', conversation.id)
      setSelectedContact(conversation.id)
      setDatabaseMessages([])
    },
    wasenderHook
  })

  // Extract chat action functions for use in component
  const {
    isLoading: isChatLoading,
    isSending,
    isCreatingConversation,
    loadWhatsAppData,
    sendWhatsAppMessage,
    startNewChat,
    startConversationWithContact,
    clearAllChatData
  } = chatActionsHook

  // Helper utilities functionality
  const helpersHook = useHelpers({
    contacts: hookWhatsappContacts,
    allContacts
  })

  // Extract helper functions for use in component
  const {
    formatTime,
    getContactName,
    getContactAvatar,
    getInitials,
    getStatusColor,
    getConfidenceColor,
    getMessageStatusIcon,
    getDisplayName,
    getConversationSubtitle,
    extractPhoneNumber,
    isSystemConversation,
    isAtBottom,
    formatFileSize,
    truncateText,
    isValidPhoneNumber
  } = helpersHook
  


  // Keep database conversations ref updated
  const databaseConversationsRef = useRef(databaseConversations)
  useEffect(() => {
    databaseConversationsRef.current = databaseConversations
  }, [databaseConversations])

  // Note: loadWhatsAppData is now handled by useChatActions hook



    // Note: Utility functions are now handled by useHelpers hook

  // Note: sendWhatsAppMessage is now handled by useChatActions hook

  // Convert database messages to chat messages format
  // Memoize messages to prevent unnecessary re-calculations
  const messages = useMemo((): ChatMessage[] => {
    // Return empty array if no contact is selected
    if (!selectedContact) return []
    
    // Use database messages instead of webhook messages
    return databaseMessages
  }, [selectedContact, databaseMessages])

  // Use database conversations instead of generating from webhook messages
  const conversations = useMemo((): ChatConversation[] => {
    return databaseConversations
  }, [databaseConversations])

  // Get selected conversation - memoized to prevent re-calculations
  const selectedConversation = useMemo(() => {
    return conversations.find(conv => conv.id === selectedContact) || 
      (selectedContact ? {
        id: selectedContact,
        user: hookWhatsappContacts.find((c: WhatsAppContact) => c.jid === selectedContact)?.name || 
             hookWhatsappContacts.find((c: WhatsAppContact) => c.jid === selectedContact)?.notify || 
             selectedContact,
        email: selectedContact,
        avatar: hookWhatsappContacts.find((c: WhatsAppContact) => c.jid === selectedContact)?.imgUrl || "/placeholder.svg",
        lastMessage: "No messages yet",
        timestamp: "Never",
        status: 'active' as const,
        unread_count: 0,
        type: 'whatsapp',
        aiConfidence: 85,
        lastMessageAt: new Date().toISOString(),
        remoteJid: selectedContact,
        phoneNumber: selectedContact.replace('@s.whatsapp.net', '')
      } : undefined)
  }, [conversations, selectedContact, hookWhatsappContacts])

  // Note: isSystemConversation function is now handled by useHelpers hook

  // Grocery lists functionality
  const { groceryListsData, isLoadingGroceryData, loadGroceryListsData } = useGroceryLists({
    selectedConversation
  })

  // Meal planning functionality
  const { 
    mealPlanningData, 
    isLoadingMealData, 
    loadMealPlanningData,
    selectedMealPlan,
    setSelectedMealPlan,
    isMealPlanModalOpen,
    setIsMealPlanModalOpen
  } = useMealPlanning({
    selectedConversation
  })

  // Note: startNewChat is now handled by useChatActions hook

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || isSending) return

    try {
      // Mark that we should auto-scroll after sending (user's own message)
      setShouldAutoScroll(true)

      // Send message via WhatsApp API - hook handles isSending state internally
      await sendWhatsAppMessage()
      
      setNewMessage("")
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      })
    }
    // Note: isSending state is now managed by useChatActions hook
  }

  // Handle selecting a conversation
  const handleSelectConversation = (conversationId: string) => {
    setSelectedContact(conversationId)
    
    // Find the conversation to get the remoteJid
    const conversation = databaseConversations.find(conv => conv.id === conversationId)
    const remoteJid = conversation?.remoteJid || conversation?.email || conversationId
    
    console.log('🎯 Selected conversation:', conversationId, 'RemoteJid:', remoteJid)
    
    // Mark conversation as read by admin
    markConversationAsRead(conversationId)
    
    // Load messages from database when conversation is selected
    loadMessagesFromDatabase(remoteJid)
    
    // Auto-scroll to bottom when selecting a conversation
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
        console.log('📍 Auto-scrolled to bottom after conversation selection')
      }
    }, 300) // Small delay to ensure messages are loaded
    
    // Refresh global unread count after marking as read
    setTimeout(() => refreshGlobalUnreadCount(), 500)
  }

  // Mark conversation as read (now handled by database hook)
  
  // Filter conversations by search term - memoized to prevent re-calculations
  const filteredConversations = useMemo(() => {
    return conversations.filter(
      (conv) =>
        conv.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [conversations, searchTerm])

  // Filter all contacts by search term - memoized to prevent re-calculations
  const filteredAllContacts = useMemo(() => {
    return allContacts.filter(
      (contact) =>
        (contact.name || "").toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
        (contact.notify || "").toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
        contact.jid.toLowerCase().includes(contactSearchTerm.toLowerCase())
    )
  }, [allContacts, contactSearchTerm])

  // Note: clearAllChatData is now handled by useChatActions hook

  // Load data on mount - OPTIMIZED to prevent constant loading
  useEffect(() => {
    let isMounted = true
    
    const initializeData = async () => {
      try {
        // Clear cache on first load to ensure fresh data
        localStorage.removeItem('chat-storage')
        setDatabaseConversations([])
        setDatabaseMessages([])
        setSelectedContact(null)
        
        // Load initial data only once
        if (isMounted) {
          await Promise.all([
            loadWhatsAppData(),
            loadConversationsFromDatabase(true), // Silent initial load
            loadContactsCount(), // Load contacts count for stats
            loadAnalyticsData()
          ])
        }
      } catch (error) {
        console.error('❌ Error initializing chat data:', error)
      }
    }
    
    initializeData()
    
    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array - only run once on mount

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedContact && selectedConversation?.remoteJid) {
      console.log('🔄 Loading messages for selected conversation:', selectedConversation.remoteJid)
      loadMessagesFromDatabase(selectedConversation.remoteJid)
      // Load additional data for the new enhanced panels
      loadMealPlanningData()
      loadGroceryListsData()
      loadAiPromptsData()
    } else {
      setDatabaseMessages([])
    }
  }, [selectedContact, selectedConversation?.remoteJid])

  // Add manual refresh function for messages
  const refreshCurrentConversationMessages = useCallback(() => {
    if (selectedConversation?.remoteJid) {
      console.log('🔄 Manually refreshing current conversation messages')
      loadMessagesFromDatabase(selectedConversation.remoteJid)
    }
  }, [selectedConversation?.remoteJid])

  // Refresh messages after sending to get latest status updates
  const handleSendMessageWithRefresh = async () => {
    await handleSendMessage()
    
    // Refresh messages after a short delay to get status updates
    setTimeout(() => {
      if (selectedConversation?.remoteJid) {
        console.log('🔄 Refreshing messages after send to get status updates')
        loadMessagesFromDatabase(selectedConversation.remoteJid)
      }
    }, 1000)
  }

  // Note: Conversation list polling is handled globally by useGlobalNotifications hook
  // This prevents duplicate polling and ensures notifications work across all pages

  // Note: isAtBottom function is now handled by useHelpers hook

  // Handle scroll position tracking
  const handleScroll = useCallback(() => {
    if (!scrollAreaRef.current) return
    
    const atBottom = isAtBottom()
    setIsUserScrolledUp(!atBottom)
    
    if (atBottom) {
      setUnreadMessagesCount(0)
    }
  }, [isAtBottom])

  // Smart auto-scroll logic
  useEffect(() => {
    const currentMessageCount = databaseMessages.length
    const previousMessageCount = lastMessageCountRef.current
    
    // Update the ref
    lastMessageCountRef.current = currentMessageCount
    
    // Don't scroll on initial load or when switching conversations
    if (previousMessageCount === 0) {
      if (messagesEndRef.current && currentMessageCount > 0) {
        messagesEndRef.current.scrollIntoView({ behavior: 'instant', block: 'end' })
      }
      return
    }
    
    // If we should auto-scroll (user sent message), do it regardless of position
    if (shouldAutoScroll) {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
      setShouldAutoScroll(false)
      return
    }
    
    // For new messages from others, only scroll if user is at bottom
    if (currentMessageCount > previousMessageCount) {
      const newMessagesCount = currentMessageCount - previousMessageCount
      
      if (isAtBottom()) {
        // User is at bottom, auto-scroll to show new messages
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
      } else {
        // User is scrolled up, increment unread counter instead
        setUnreadMessagesCount(prev => prev + newMessagesCount)
      }
    }
  }, [databaseMessages, shouldAutoScroll, isAtBottom])

  // Reset counters when conversation changes
  useEffect(() => {
    setUnreadMessagesCount(0)
    setIsUserScrolledUp(false)
    lastMessageCountRef.current = 0
  }, [selectedContact])



  // REMOVE ALL POLLING - Real-time should handle everything
  useEffect(() => {
    // Clear any existing polling intervals - we don't need them with proper real-time
    if (conversationPollingRef.current) {
      clearInterval(conversationPollingRef.current)
      conversationPollingRef.current = null
    }
    if (messagePollingRef.current) {
      clearInterval(messagePollingRef.current)
      messagePollingRef.current = null
    }
    if (refreshPollingRef.current) {
      clearInterval(refreshPollingRef.current)
      refreshPollingRef.current = null
    }
    
    console.log('🚫 All polling disabled - using real-time only')

    return () => {
      // Clean up on unmount
      if (conversationPollingRef.current) clearInterval(conversationPollingRef.current)
      if (messagePollingRef.current) clearInterval(messagePollingRef.current)
      if (refreshPollingRef.current) clearInterval(refreshPollingRef.current)
    }
  }, []) // Only run once on mount

  // Handle Enter key for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessageWithRefresh()
    }
  }

  // Load messages (now handled by database hook)

  // Load conversations (now handled by database hook)

  // Real-time chat functionality
  const { isRealTimeConnected, connectionRetryCount } = useRealTimeChat({
    selectedContact,
    selectedConversation,
    loadConversationsFromDatabase,
    messagesEndRef,
    isAtBottom,
    setDatabaseMessages
  })

  // Load contacts count (now handled by database hook)

  // Analytics data is now handled by useAnalytics hook





  // Load AI prompts (now handled by database hook)

  // Delete conversation (now handled by database hook)

  // Note: Display name and conversation subtitle functions are now handled by useHelpers hook

  return (
    <div className="space-y-6">
      {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">WhatsApp Chat Management</h2>
            <p className="text-muted-foreground">
              Monitor and manage WhatsApp business conversations
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Dialog open={isContactsDialogOpen} onOpenChange={setIsContactsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenContactsDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Chat
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Start New Conversation
                    </DialogTitle>
                    <DialogDescription>
                      Choose a contact to start a new WhatsApp conversation
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Search and sync controls */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search contacts..."
                        className="pl-8"
                        value={contactSearchTerm}
                        onChange={(e) => setContactSearchTerm(e.target.value)}
                      />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={syncContactsWithWASender}
                        disabled={isSyncingContacts || isLoadingContacts}
                        title="Sync with WASender"
                      >
                        {isSyncingContacts ? (
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        ) : (
                          <Activity className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Contact count and source info */}
                    {!isLoadingContacts && allContacts.length > 0 && (
                      <div className="text-xs text-muted-foreground bg-muted/30 dark:bg-muted/70 p-2 rounded border border-muted-foreground/20">
                        📱 {allContacts.length} contacts available {contactSearchTerm && `(${filteredAllContacts.length} filtered)`}
                      </div>
                    )}

                    {/* Contacts list */}
                    <ScrollArea className="h-[300px]">
                      {isLoadingContacts ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Loading contacts...</p>
                          </div>
                        </div>
                      ) : filteredAllContacts.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">No contacts found</p>
                            {contactSearchTerm && (
                              <p className="text-xs mt-1">Try adjusting your search</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredAllContacts.map((contact) => (
                            <div
                              key={contact.jid}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                isCreatingConversation 
                                  ? "opacity-50 cursor-not-allowed" 
                                  : "cursor-pointer hover:bg-muted/30 dark:hover:bg-muted/60"
                              }`}
                              onClick={() => {
                                console.log('🖱️ Contact clicked:', contact)
                                console.log('🔄 isCreatingConversation:', isCreatingConversation)
                                if (!isCreatingConversation) {
                                  startNewChat(contact)
                                }
                              }}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={contact.imgUrl || undefined} />
                                <AvatarFallback>
                                  {getInitials(contact.name || contact.notify || contact.jid)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium truncate">
                                    {contact.name || contact.notify || "Unknown"}
                                  </p>
                                  {contact.verifiedName && (
                                    <div className="h-3 w-3 text-primary">✓</div>
                                  )}
                                </div>
                                {contact.verifiedName && (
                                  <p className="text-xs text-primary truncate">
                                    {contact.verifiedName}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground truncate">
                                  {contact.phone_number || contact.jid.replace('@s.whatsapp.net', '')}
                                </p>
                                {contact.status && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {contact.status}
                                  </p>
                                )}
                                {contact.updated_at && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Updated: {new Date(contact.updated_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {isCreatingConversation ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                                ) : (
                                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                                )}
                                {contact.created_at && (
                                  <span className="text-xs text-muted-foreground">
                                    💾
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
        </div>
      </div>

      {/* Stats Overview - Always Visible */}
      <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  WhatsApp Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="animate-pulse bg-muted h-6 w-8 rounded"></div>
                  ) : (
                    contactsCount
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Active contacts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Active Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="animate-pulse bg-muted h-6 w-12 rounded"></div>
                  ) : (
                    databaseConversations.length || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Total conversations</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Unread Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="animate-pulse bg-muted h-6 w-10 rounded"></div>
                  ) : (
                    databaseConversations.reduce((total, conv) => total + (conv.unread_count || 0), 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Enabled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="animate-pulse bg-muted h-6 w-8 rounded"></div>
                  ) : (
                    databaseConversations.filter(conv => conv.aiConfidence > 0).length || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">AI active chats</p>
              </CardContent>
            </Card>
          </div>


          {/* Chat Interface */}
          {/* 3-Panel Chat Interface - FIXED HEIGHT TO FIT SCREEN */}
          <div className="grid gap-3 sm:gap-4 grid-cols-12 h-[calc(100vh-200px)] max-h-[800px]">
            {/* Left Panel - Chat List */}
            <Card className="col-span-12 lg:col-span-3 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">WhatsApp Conversations</CardTitle>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading conversations...</p>
                  </div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No WhatsApp conversations yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Conversations will appear when messages are received</p>
                  </div>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const displayName = getDisplayName(conversation)
                  const subtitle = getConversationSubtitle(conversation)
                  
                  return (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/30 dark:hover:bg-muted/60 transition-all duration-200 min-h-[88px] ${
                        selectedContact === conversation.id ? "bg-primary/5 border-l-4 border-l-primary" : ""
                      }`}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={conversation.avatar || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getInitials(displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(conversation.status)}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold truncate">{displayName}</h4>
                            <div className="flex items-center gap-1">
                                  {conversation.unread_count > 0 && (
                                <Badge
                                  variant="destructive"
                                      className="h-5 w-5 min-w-[20px] p-0 text-xs flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 text-white font-medium"
                                >
                                      {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
                          <p className="text-xs text-foreground/80 mt-1 font-medium line-clamp-2 leading-relaxed">{conversation.lastMessage}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                            <div className="flex items-center gap-1">
                              <Smartphone className="h-3 w-3 text-green-600" />
                              <span className={`text-xs font-medium ${getConfidenceColor(conversation.aiConfidence)}`}>
                                {conversation.aiConfidence}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Middle Panel - Chat Window - FIXED HEIGHT ISSUES */}
        <Card className="col-span-12 lg:col-span-6 flex flex-col">
          <CardHeader className="pb-3 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-background">
                  <AvatarImage src={selectedConversation?.avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(getDisplayName(selectedConversation))}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold">
                    {getDisplayName(selectedConversation)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    {selectedConversation ? getConversationSubtitle(selectedConversation) : "No conversation selected"}
                    {selectedConversation && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <Badge
                          variant={selectedConversation.status === "active" ? "default" : "secondary"}
                          className="text-xs capitalize"
                        >
                          {selectedConversation.status}
                        </Badge>
                      </>
                    )}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={!selectedContact}>
                  <Shield className="h-4 w-4 mr-2" />
                  Take Over
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={!selectedContact}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => {
                        if (selectedContact) {
                          const conversation = databaseConversations.find(conv => conv.id === selectedContact);
                          if (conversation?.id) {
                            setConversationToDelete(conversation.id);
                            setIsDeleteDialogOpen(true);
                          }
                        }
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 p-4 min-h-0 max-h-[calc(100vh-400px)]" ref={scrollAreaRef} onScrollCapture={handleScroll}>
                  {/* New messages indicator */}
                  {unreadMessagesCount > 0 && isUserScrolledUp && (
                    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-10">
                      <Button
                       variant="secondary"
                       size="sm"
                       onClick={() => {
                         if (messagesEndRef.current) {
                           messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
                           setUnreadMessagesCount(0)
                         }
                       }}
                       className="shadow-lg animate-pulse bg-primary text-primary-foreground hover:bg-primary/90"
                     >
                      <ChevronDown className="h-4 w-4 mr-1" />
                      {unreadMessagesCount} new message{unreadMessagesCount > 1 ? 's' : ''}
                    </Button>
                    </div>
                  )}
              <div className="space-y-4">
                {!selectedContact ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
                      <p className="text-sm">Choose a WhatsApp conversation from the left to start chatting</p>
                    </div>
                  </div>
                ) : isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                      <p className="text-sm text-muted-foreground">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                        <MessageSquare className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Start the Conversation</h3>
                      <p className="text-sm">Send your first message to begin chatting</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isLastMessage = index === messages.length - 1
                    const showAvatar = index === 0 || messages[index - 1]?.sender !== message.sender
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 mb-4 px-2 sm:px-4 ${
                          message.sender === "user" 
                            ? "justify-start" 
                            : message.sender === "ai"
                            ? "justify-start" // AI messages on left for distinction
                            : "justify-end"   // Business admin messages on right
                        }`}
                      >
                        {/* Left side avatars for user and AI */}
                        {(message.sender === "user" || message.sender === "ai") && (
                          <div className="flex flex-col items-center">
                            {showAvatar ? (
                              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                                {message.sender === "ai" ? (
                                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                    <Bot className="h-4 w-4" />
                                  </AvatarFallback>
                                ) : (
                                  <>
                                <AvatarImage src={selectedConversation?.avatar || undefined} />
                                    <AvatarFallback className="bg-muted text-muted-foreground">
                                  {getInitials(getDisplayName(selectedConversation))}
                                </AvatarFallback>
                                  </>
                                )}
                              </Avatar>
                            ) : (
                              <div className="h-8 w-8 sm:h-9 sm:w-9" />
                            )}
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-3 shadow-sm border ${
                            message.sender === "user" 
                              ? "bg-muted/30 dark:bg-muted/60 border-muted" 
                              : message.sender === "ai"
                              ? "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800"
                              : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400"
                          }`}
                        >
                          {/* Message Headers with improved styling */}
                          {message.sender === "ai" && (
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-primary/20">
                              <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold text-primary">AI Assistant</span>
                              </div>
                              {message.confidence && (
                                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary">
                                  {message.confidence}% confidence
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {message.sender === "admin" && (
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-400/30">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-emerald-100" />
                                <span className="text-sm font-semibold text-emerald-50">
                                  Business Admin
                                  </span>
                              </div>
                              <Badge variant="outline" className="text-xs px-2 py-0.5 bg-emerald-400/20 text-emerald-100 border-emerald-300">
                                {businessContact?.name || businessContact?.verifiedName || 'BargainB'}
                              </Badge>
                            </div>
                          )}
                          
                          {message.sender === "user" && showAvatar && (
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-muted-foreground/20">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-semibold text-foreground">
                                {getDisplayName(selectedConversation)}
                              </span>
                            </div>
                          )}
                          
                          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                            message.sender === "ai" 
                              ? "text-foreground" 
                              : message.sender === "admin"
                              ? "text-white"
                              : "text-foreground"
                          }`}>
                            {message.content}
                          </p>
                          
                          <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
                            message.sender === "ai" 
                              ? "border-primary/20" 
                              : message.sender === "admin"
                              ? "border-emerald-400/30"
                              : "border-muted-foreground/20"
                          }`}>
                            <span className={`text-xs ${
                              message.sender === "admin" 
                                ? "text-emerald-100" 
                                : "opacity-75"
                            }`}>
                              {message.timestamp}
                            </span>
                            
                            <div className="flex items-center gap-2">
                                  {/* Show status icons for all outbound messages (admin, AI, and sent messages) */}
                                  {(() => {
                                    const shouldShow = message.sender === "admin" || message.sender === "ai" || (message.metadata && message.metadata.direction === "outbound") || (message.metadata && message.metadata.from_me);
                                    
                                    if (shouldShow) {
                                      const statusInfo = getMessageStatusIcon(message.status, message.metadata);
                                return statusInfo ? (
                                  <div 
                                          className={`text-sm ${statusInfo.color} flex items-center font-bold`}
                                    title={statusInfo.tooltip}
                                  >
                                          <span className="font-bold text-shadow">{statusInfo.icon}</span>
                                  </div>
                                      ) : null;
                                    }
                                    return null;
                              })()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Right side avatar for business admin */}
                        {message.sender === "admin" && showAvatar && (
                          <div className="flex flex-col items-center">
                            <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                                    <AvatarImage 
                                      src={businessContact?.imgUrl || '/placeholder-user.jpg'} 
                                      alt={businessContact?.name || businessContact?.verifiedName || 'BargainB Business'} 
                                    />
                              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                                      {businessContact?.name ? getInitials(businessContact.name) : 
                                       businessContact?.verifiedName ? getInitials(businessContact.verifiedName) : 'BB'}
                              </AvatarFallback>
                          </Avatar>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </ScrollArea>
            <Separator className="flex-shrink-0" />
                          <div className="p-3 sm:p-4 bg-muted/30 dark:bg-muted/60 border-t flex-shrink-0">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <div className="flex gap-2 sm:gap-3">
                    <div className="relative flex-1">
                      <Textarea
                        placeholder={`💬 Message ${getDisplayName(selectedConversation)}...`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="min-h-[44px] max-h-32 resize-none border-2 border-border bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl"
                        disabled={!selectedContact || isSending}
                        rows={1}
                      />
                    </div>
                    <Button 
                      size="icon" 
                          onClick={handleSendMessageWithRefresh}
                      disabled={!newMessage.trim() || !selectedContact || isSending}
                      className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 disabled:bg-muted disabled:text-muted-foreground disabled:to-slate-500"
                    >
                      {isSending ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Enhanced status indicators */}
              <div className="flex items-center justify-between mt-3 px-1">
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                  {/* Real-time connection status - IMPROVED */}
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${
                      isRealTimeConnected 
                        ? 'bg-emerald-500 animate-pulse' 
                        : connectionRetryCount > 0 
                          ? 'bg-yellow-500 animate-pulse' 
                          : 'bg-red-500 animate-pulse'
                    }`}></div>
                    <span className="hidden sm:inline">Real-time</span>
                    <span className={`font-medium ${
                      isRealTimeConnected 
                        ? 'text-emerald-600' 
                        : connectionRetryCount > 0 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                    }`}>
                      {isRealTimeConnected 
                        ? 'Connected' 
                        : connectionRetryCount > 0 
                          ? `Retrying... (${connectionRetryCount}/3)` 
                          : 'Disconnected'}
                    </span>
                </div>
                  
                  {/* WhatsApp API status */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="hidden sm:inline">WhatsApp</span>
                    <span className="font-medium text-green-600">Online</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {aiEnabled ? (
                    <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-green-600">AI Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs font-medium text-red-600">AI Disabled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Enhanced User Details & AI Management - FIXED HEIGHT ISSUES */}
        <Card className="col-span-12 lg:col-span-3 flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="user" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 text-xs flex-shrink-0">
                <TabsTrigger value="user" className="text-xs">Contact</TabsTrigger>
                <TabsTrigger value="ai" className="text-xs">AI Config</TabsTrigger>
                <TabsTrigger value="meals" className="text-xs">Meals</TabsTrigger>
                <TabsTrigger value="data" className="text-xs">Data</TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="p-4 space-y-4 flex-1 min-h-0">
                {selectedContact && selectedConversation ? (
                  <ChatUserProfile 
                    conversationId={selectedConversation.id}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a contact to view details</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ai" className="p-4 space-y-4 flex-1 min-h-0">
                {selectedContact ? (
                  <div className="space-y-4">
                    <AIConfigTab 
                      conversationId={selectedContact}
                      userId={selectedContact}
                      onConfigChange={(config) => {
                        setAiEnabled(config.enabled);
                      }}
                    />
                    
                    {/* AI Technical Details */}
                    {aiPromptsData && (
                      <div className="mt-6 space-y-4">
                        <Separator />
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Technical Details
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="bg-muted/30 dark:bg-muted/60 p-3 rounded-lg">
                              <div className="font-medium text-muted-foreground">Assistant ID</div>
                              <div className="font-mono text-foreground break-all">
                                {aiPromptsData.assistantId?.slice(0, 8)}...
                              </div>
                            </div>
                            <div className="bg-muted/30 dark:bg-muted/60 p-3 rounded-lg">
                              <div className="font-medium text-muted-foreground">Thread ID</div>
                              <div className="font-mono text-foreground break-all">
                                {aiPromptsData.aiThreadId ? `${aiPromptsData.aiThreadId.slice(0, 8)}...` : 'None'}
                              </div>
                            </div>
                            <div className="bg-muted/30 dark:bg-muted/60 p-3 rounded-lg">
                              <div className="font-medium text-muted-foreground">Last AI Response</div>
                              <div className="text-foreground">
                                {aiPromptsData.lastAiInteraction ? 
                                  new Date(aiPromptsData.lastAiInteraction).toLocaleString() : 
                                  'No interactions yet'
                                }
                              </div>
                            </div>
                            <div className="bg-muted/30 dark:bg-muted/60 p-3 rounded-lg">
                              <div className="font-medium text-muted-foreground">AI Messages</div>
                              <div className="text-foreground">
                                {aiPromptsData.totalAiMessages} sent
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* API Configuration */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            API Configuration
                          </h4>
                          <div className="bg-muted/30 dark:bg-muted/60 p-3 rounded-lg text-xs space-y-2">
                            <div>
                              <span className="font-medium text-muted-foreground">Endpoint:</span>
                              <div className="font-mono text-foreground break-all">
                                {aiPromptsData.apiUrl}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Graph ID:</span>
                              <span className="ml-2 text-foreground">product_retrieval_agent</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center text-muted-foreground">
                      <Bot className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a conversation to configure AI settings</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Meals Planning Tab */}
              <TabsContent value="meals" className="p-4 space-y-4 flex-1 min-h-0">
                {selectedContact ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        Meal Planning History
                      </h4>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadMealPlanningData}
                        disabled={isLoadingMealData}
                      >
                        {isLoadingMealData ? (
                          <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                        ) : (
                          'Refresh'
                        )}
                      </Button>
                    </div>
                    
                    {isLoadingMealData ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : mealPlanningData.length > 0 ? (
                      <ScrollArea className="h-[400px] space-y-2">
                        {mealPlanningData.map((meal, index) => (
                          <div key={meal.id} className="border rounded-lg p-3 hover:bg-muted/30 dark:hover:bg-muted/60 cursor-pointer transition-colors"
                               onClick={() => {
                                 setSelectedMealPlan(meal)
                                 setIsMealPlanModalOpen(true)
                               }}>
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {new Date(meal.created_at).toLocaleDateString()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                AI Generated
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {meal.content.slice(0, 150)}...
                            </p>
                          </div>
                        ))}
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        <p>No meal planning data found</p>
                        <p className="text-xs">Ask the AI about meals, recipes, or dinner plans</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      <p>Select a conversation to view meal planning</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Data Verification Tab */}
              <TabsContent value="data" className="p-4 space-y-4 flex-1 min-h-0">
                {selectedContact ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Grocery Lists & Data
                      </h4>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadGroceryListsData}
                        disabled={isLoadingGroceryData}
                      >
                        {isLoadingGroceryData ? (
                          <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                        ) : (
                          'Refresh'
                        )}
                      </Button>
                    </div>
                    
                    {isLoadingGroceryData ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : groceryListsData.length > 0 ? (
                      <ScrollArea className="h-[400px] space-y-2">
                        {groceryListsData.map((list, index) => (
                          <div key={list.id} className="border rounded-lg p-3 hover:bg-muted/30 dark:hover:bg-muted/60 cursor-pointer transition-colors"
                               onClick={() => {
                                 setSelectedGroceryList(list)
                                 setIsGroceryListModalOpen(true)
                               }}>
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {new Date(list.created_at).toLocaleDateString()}
                              </Badge>
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-xs">
                                  AI Generated
                                </Badge>
                                {list.content.includes('€') && (
                                  <Badge variant="outline" className="text-xs text-green-600">
                                    Pricing
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {list.content.slice(0, 150)}...
                            </p>
                            {/* Extract pricing info if available */}
                            {list.content.match(/€\d+\.?\d*/g) && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="text-xs text-green-600 font-medium">
                                  Detected prices: {list.content.match(/€\d+\.?\d*/g)?.slice(0, 3).join(', ')}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No grocery list data found</p>
                        <p className="text-xs">Ask the AI about shopping lists, budgets, or prices</p>
                      </div>
                    )}

                    {/* Database verification info */}
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Database Verification
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded border border-blue-200 dark:border-blue-800">
                          <div className="font-medium text-blue-700 dark:text-blue-300">Meal Messages</div>
                          <div className="text-blue-800 dark:text-blue-200">{mealPlanningData.length} found</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded border border-green-200 dark:border-green-800">
                          <div className="font-medium text-green-700 dark:text-green-300">Grocery Messages</div>
                          <div className="text-green-800 dark:text-green-200">{groceryListsData.length} found</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-950/30 p-2 rounded border border-purple-200 dark:border-purple-800">
                          <div className="font-medium text-purple-700 dark:text-purple-300">AI Thread</div>
                          <div className="text-purple-800 dark:text-purple-200">
                            {aiPromptsData?.aiThreadId ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-950/30 p-2 rounded border border-orange-200 dark:border-orange-800">
                          <div className="font-medium text-orange-700 dark:text-orange-300">Total Messages</div>
                          <div className="text-orange-800 dark:text-orange-200">{databaseMessages.length}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a conversation to view data</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Delete Conversation Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action will permanently remove all messages and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConversationToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (conversationToDelete) {
                  const success = await deleteDatabaseConversation(conversationToDelete);
                  if (success) {
                    // Clear selection if this conversation was selected
                    if (selectedContact === conversationToDelete) {
                      setSelectedContact(null);
                      setDatabaseMessages([]);
                    }
                    setConversationToDelete(null);
                    setIsDeleteDialogOpen(false);
                  }
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Meal Plan Details Modal */}
      <Dialog open={isMealPlanModalOpen} onOpenChange={setIsMealPlanModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              Meal Planning Details
            </DialogTitle>
            <DialogDescription>
              {selectedMealPlan && (
                <div className="flex items-center gap-4 text-sm">
                  <span>Generated: {new Date(selectedMealPlan.created_at).toLocaleString()}</span>
                  <Badge variant="secondary">AI Assistant</Badge>
                  {selectedMealPlan.ai_thread_id && (
                    <Badge variant="outline" className="font-mono text-xs">
                      Thread: {selectedMealPlan.ai_thread_id.slice(0, 8)}...
                    </Badge>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMealPlan && (
            <ScrollArea className="h-[60vh] mt-4">
              <div className="space-y-4">
                {/* Parse and display meal content in a structured way */}
                <div className="bg-muted/30 dark:bg-muted/60 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-lg">Complete AI Response</h4>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedMealPlan.content}
                  </div>
                </div>
                
                {/* Extract structured information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recipe/Meal Info */}
                  {selectedMealPlan.content.match(/recipe|meal|dish/gi) && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Meal Details</h4>
                      <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        {selectedMealPlan.content.includes('recipe') && <div>✅ Recipe included</div>}
                        {selectedMealPlan.content.includes('ingredient') && <div>✅ Ingredients listed</div>}
                        {selectedMealPlan.content.includes('step') && <div>✅ Step-by-step instructions</div>}
                        {selectedMealPlan.content.match(/\d+\s*(minute|hour)/gi) && <div>✅ Cooking time specified</div>}
                      </div>
                    </div>
                  )}
                  
                  {/* Pricing Info */}
                  {selectedMealPlan.content.match(/€\d+\.?\d*/g) && (
                    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Pricing Information</h4>
                      <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                                 {selectedMealPlan.content.match(/€\d+\.?\d*/g)?.map((price: string, index: number) => (
                           <div key={index} className="flex items-center gap-2">
                             <span className="font-mono font-semibold">{price}</span>
                           </div>
                         ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Metadata */}
                <div className="bg-muted/30 dark:bg-muted/60 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Technical Metadata</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-muted-foreground">Message ID:</span>
                      <div className="font-mono">{selectedMealPlan.id}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Conversation ID:</span>
                      <div className="font-mono break-all">{selectedMealPlan.conversation_id}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Character Count:</span>
                      <div>{selectedMealPlan.content.length} characters</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Word Count:</span>
                      <div>{selectedMealPlan.content.split(/\s+/).length} words</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Grocery List Details Modal */}
      <Dialog open={isGroceryListModalOpen} onOpenChange={setIsGroceryListModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Grocery List Details
            </DialogTitle>
            <DialogDescription>
              {selectedGroceryList && (
                <div className="flex items-center gap-4 text-sm">
                  <span>Generated: {new Date(selectedGroceryList.created_at).toLocaleString()}</span>
                  <Badge variant="secondary">AI Assistant</Badge>
                  {selectedGroceryList.ai_thread_id && (
                    <Badge variant="outline" className="font-mono text-xs">
                      Thread: {selectedGroceryList.ai_thread_id.slice(0, 8)}...
                    </Badge>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedGroceryList && (
            <ScrollArea className="h-[60vh] mt-4">
              <div className="space-y-4">
                {/* Complete AI Response */}
                <div className="bg-muted/30 dark:bg-muted/60 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-lg">Complete AI Response</h4>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedGroceryList.content}
                  </div>
                </div>
                
                {/* Extract structured information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Budget/Pricing Analysis */}
                  {selectedGroceryList.content.match(/€\d+\.?\d*/g) && (
                    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Pricing Analysis</h4>
                      <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
                        <div className="font-semibold">Detected Prices:</div>
                                                 {selectedGroceryList.content.match(/€\d+\.?\d*/g)?.map((price: string, index: number) => (
                           <div key={index} className="flex items-center gap-2">
                             <span className="font-mono font-semibold text-lg">{price}</span>
                           </div>
                         ))}
                        {selectedGroceryList.content.match(/€\d+\.?\d*/g) && (
                          <div className="pt-2 border-t border-green-200 dark:border-green-700">
                            <div className="font-medium">
                              Total Count: {selectedGroceryList.content.match(/€\d+\.?\d*/g)?.length} prices found
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Shopping List Analysis */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">List Analysis</h4>
                    <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      {selectedGroceryList.content.includes('shopping list') && <div>✅ Shopping list format</div>}
                      {selectedGroceryList.content.includes('budget') && <div>✅ Budget-conscious</div>}
                      {selectedGroceryList.content.match(/\d+\s*(item|product)/gi) && <div>✅ Item counts specified</div>}
                      {selectedGroceryList.content.includes('supermarket') && <div>✅ Store recommendations</div>}
                      {selectedGroceryList.content.includes('healthy') && <div>✅ Health-focused</div>}
                      {selectedGroceryList.content.match(/breakfast|lunch|dinner/gi) && <div>✅ Meal planning included</div>}
                    </div>
                  </div>
                </div>
                
                {/* Extract items if list format is detected */}
                {selectedGroceryList.content.match(/^\d+\./gm) && (
                  <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Extracted Items</h4>
                    <div className="text-sm text-orange-700 dark:text-orange-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                 {selectedGroceryList.content.match(/^\d+\..*$/gm)?.slice(0, 10).map((item: string, index: number) => (
                           <div key={index} className="bg-white dark:bg-orange-900/20 p-2 rounded border">
                             {item.trim()}
                           </div>
                         ))}
                      </div>
                      {selectedGroceryList.content.match(/^\d+\./gm)?.length > 10 && (
                        <div className="mt-2 text-center italic">
                          +{selectedGroceryList.content.match(/^\d+\./gm)?.length - 10} more items...
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Database Verification */}
                <div className="bg-muted/30 dark:bg-muted/60 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Database Storage Verification</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-muted-foreground">Stored in Table:</span>
                      <div className="font-mono">messages</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Sender Type:</span>
                      <div className="font-mono">{selectedGroceryList.sender_type}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Message ID:</span>
                      <div className="font-mono">{selectedGroceryList.id}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Thread Status:</span>
                      <div className={selectedGroceryList.ai_thread_id ? "text-green-600" : "text-orange-600"}>
                        {selectedGroceryList.ai_thread_id ? "Linked to AI Thread" : "No Thread Link"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
