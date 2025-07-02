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

// WhatsApp types
interface WhatsAppMessage {
  id: string
  fromMe: boolean
  remoteJid: string
  conversation: string
  timestamp: number
  status?: number
}

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
  last_seen_at?: string // WhatsApp last seen timestamp
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
  // WhatsApp State
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([])
  const [whatsappContacts, setWhatsappContacts] = useState<WhatsAppContact[]>([])
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
  const [isSending, setIsSending] = useState(false)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  
  // Contacts dialog state
  const [isContactsDialogOpen, setIsContactsDialogOpen] = useState(false)
  const [allContacts, setAllContacts] = useState<WhatsAppContact[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [contactSearchTerm, setContactSearchTerm] = useState("")
  const [isSyncingContacts, setIsSyncingContacts] = useState(false)
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  
  // Contacts count for stats (separate from dialog contacts)
  const [contactsCount, setContactsCount] = useState(0)
  
  // Enhanced data viewing state
  const [mealPlanningData, setMealPlanningData] = useState<any[]>([])
  const [groceryListsData, setGroceryListsData] = useState<any[]>([])
  const [aiPromptsData, setAiPromptsData] = useState<any>(null)
  const [isLoadingMealData, setIsLoadingMealData] = useState(false)
  const [isLoadingGroceryData, setIsLoadingGroceryData] = useState(false)
  const [selectedMealPlan, setSelectedMealPlan] = useState<any>(null)
  const [isMealPlanModalOpen, setIsMealPlanModalOpen] = useState(false)
  const [selectedGroceryList, setSelectedGroceryList] = useState<any>(null)
  const [isGroceryListModalOpen, setIsGroceryListModalOpen] = useState(false)
  
  // Real-time subscriptions state - Optimized to prevent excessive re-renders
  const [messageSubscription, setMessageSubscription] = useState<any>(null)
  const [conversationSubscription, setConversationSubscription] = useState<any>(null)
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false)
  const [connectionRetryCount, setConnectionRetryCount] = useState(0)
  
  // Refs to avoid stale closures in real-time subscriptions
  const selectedContactRef = useRef(selectedContact)
  const databaseConversationsRef = useRef(databaseConversations)
  const selectedConversationRef = useRef<ChatConversation | undefined>(undefined)
  
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
  
  // Business WhatsApp account info
  const [businessContact, setBusinessContact] = useState<WhatsAppContact | null>(null)
  const BUSINESS_PHONE_NUMBER = '+31685414129'
  
  // Load business contact info for admin avatar
  useEffect(() => {
    const loadBusinessContact = async () => {
      try {
        console.log('📞 Loading business contact info for:', BUSINESS_PHONE_NUMBER)
        
        // Try to get business contact from database first
        const dbResponse = await fetch('/admin/chat/api/contacts/db')
        if (dbResponse.ok) {
          const dbData = await dbResponse.json()
          const contacts = dbData.data || []
          const businessContactFromDb = contacts.find((contact: any) => 
            contact.phone_number === BUSINESS_PHONE_NUMBER
          )
          
          if (businessContactFromDb) {
            console.log('✅ Found business contact in database:', businessContactFromDb)
            setBusinessContact({
              jid: businessContactFromDb.phone_number.replace('+', '') + '@s.whatsapp.net',
              name: businessContactFromDb.name,
              notify: businessContactFromDb.notify,
              verifiedName: businessContactFromDb.verified_name,
              imgUrl: businessContactFromDb.img_url,
              status: businessContactFromDb.status,
              phone_number: businessContactFromDb.phone_number
            })
            return
          }
        }
        
        // If not in database, fetch from API
        const phoneNumber = BUSINESS_PHONE_NUMBER.replace('+', '')
        const contactInfo = await fetchContactInfo(phoneNumber + '@s.whatsapp.net')
        const profilePicture = await fetchContactProfilePicture(phoneNumber + '@s.whatsapp.net')
        
        if (contactInfo || profilePicture) {
          console.log('✅ Fetched business contact from API')
          setBusinessContact({
            jid: phoneNumber + '@s.whatsapp.net',
            name: contactInfo?.name || 'BargainB Business',
            notify: contactInfo?.notify,
            verifiedName: contactInfo?.verifiedName,
            imgUrl: profilePicture || undefined,
            status: contactInfo?.status || 'active',
            phone_number: BUSINESS_PHONE_NUMBER
          })
        }
      } catch (error) {
        console.error('❌ Error loading business contact:', error)
      }
    }
    
    loadBusinessContact()
  }, [])

  // Keep refs updated with current values
  useEffect(() => {
    selectedContactRef.current = selectedContact
  }, [selectedContact])

  useEffect(() => {
    databaseConversationsRef.current = databaseConversations
  }, [databaseConversations])

  // Load WhatsApp data
  const loadWhatsAppData = async () => {
    try {
      setIsLoading(true)
      // Note: We no longer need to fetch from webhook since we're using database conversations
      // Just set empty arrays to avoid errors
      setWhatsappMessages([])
      setWhatsappContacts([])
      
      console.log('✅ WhatsApp data loading completed (using database instead)')
    } catch (error) {
      console.error('Error loading WhatsApp data:', error)
      toast({
        title: "Error loading data",
        description: "Failed to load WhatsApp data.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch profile picture for a contact
  const fetchContactProfilePicture = async (contactPhoneNumber: string): Promise<string | null> => {
    try {
      // Extract phone number from JID (remove @s.whatsapp.net)
      const phoneNumber = contactPhoneNumber.replace('@s.whatsapp.net', '')
      
      console.log(`📸 Fetching profile picture for: ${phoneNumber}`)
      const response = await fetch(`/admin/chat/api/contact-picture/${phoneNumber}`)
      
      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch profile picture for ${phoneNumber}: ${response.status}`)
        return null
      }
      
      const result = await response.json()
      
      if (result.success && result.data?.imgUrl) {
        console.log(`✅ Got profile picture for ${phoneNumber}:`, result.data.imgUrl)
        return result.data.imgUrl
      } else {
        console.log(`📷 No profile picture available for ${phoneNumber}`)
        return null
      }
    } catch (error) {
      console.error(`❌ Error fetching profile picture for ${contactPhoneNumber}:`, error)
      return null
    }
  }

  // Fetch detailed contact information
  const fetchContactInfo = async (contactPhoneNumber: string): Promise<any | null> => {
    try {
      // Extract phone number from JID (remove @s.whatsapp.net)
      const phoneNumber = contactPhoneNumber.replace('@s.whatsapp.net', '')
      
      console.log(`📋 Fetching contact info for: ${phoneNumber}`)
      const response = await fetch(`/admin/chat/api/contact-info/${phoneNumber}`)
      
      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch contact info for ${phoneNumber}: ${response.status}`)
        return null
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        console.log(`✅ Got contact info for ${phoneNumber}:`, result.data)
        return result.data
      } else {
        console.log(`📋 No detailed contact info available for ${phoneNumber}`)
        return null
      }
    } catch (error) {
      console.error(`❌ Error fetching contact info for ${contactPhoneNumber}:`, error)
      return null
    }
  }

  // Load all contacts from database first, then sync with API if needed
  const loadAllContacts = async () => {
    try {
      setIsLoadingContacts(true)
      console.log('💾 Loading contacts from database first...')
      
      // Load contacts from database first (fast)
      const dbResponse = await fetch('/admin/chat/api/contacts/db')
      
      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        const contactsFromDb = dbData.data || []
        console.log(`💾 Found ${contactsFromDb.length} contacts in database`)
        
        if (contactsFromDb.length > 0) {
          // ContactService returns legacy Contact format, transform to WhatsAppContact format for dialog
          const transformedContacts = contactsFromDb.map((contact: any) => {
            const transformed = {
              jid: contact.phone_number.replace('+', '') + '@s.whatsapp.net',
              id: contact.id,
              name: contact.name,
              notify: contact.notify,
              verifiedName: contact.verified_name,
              imgUrl: contact.img_url, // ContactService returns img_url field
              status: contact.status,
              phone_number: contact.phone_number,
              created_at: contact.created_at,
              updated_at: contact.updated_at
            }
            console.log('🔄 Raw contact from ContactService:', contact)
            console.log('🔄 Transformed for dialog:', transformed)
            return transformed
          })
          
          setAllContacts(transformedContacts)
          console.log(`✅ Loaded ${transformedContacts.length} contacts from database`)
          
          toast({
            title: "Contacts loaded",
            description: `Found ${transformedContacts.length} contacts in database.`,
            variant: "default"
          })
          return // Exit early - we have contacts from database
        }
      }
      
      // If no database contacts, show empty state
      console.log('💾 No contacts found in database')
      setAllContacts([])
      
      toast({
        title: "No contacts found",
        description: "Use the sync button to fetch contacts from WASender API.",
        variant: "default"
      })
      
    } catch (error) {
      console.error('❌ Error loading contacts:', error)
      
      // Fallback to existing whatsapp contacts if everything fails
      setAllContacts(whatsappContacts)
      
      toast({
        title: "Using conversation contacts",
        description: "Showing contacts from current conversations.",
        variant: "default"
      })
    } finally {
      setIsLoadingContacts(false)
      console.log('🏁 Finished loading contacts')
    }
  }

  // Sync contacts with WASender API
  const syncContactsWithWASender = async () => {
    try {
      setIsSyncingContacts(true)
      console.log('🔄 Manually syncing contacts with WASender API and storing in database...')
      
      // Call the new sync endpoint that both fetches from WASender and stores in database
      const response = await fetch('/admin/chat/api/contacts/sync', {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to sync contacts: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Contacts synced",
          description: result.message,
          variant: "default"
        })
        
        // Refresh the contacts from database
        await loadAllContacts()
        
        // Also refresh the contacts count for stats
        await loadContactsCount()
      } else {
        toast({
          title: "Sync failed",
          description: result.error || "Failed to sync contacts from WASender API.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Error syncing contacts:', error)
      toast({
        title: "Sync failed",
        description: "Failed to sync contacts from WASender API.",
        variant: "destructive"
      })
    } finally {
      setIsSyncingContacts(false)
    }
  }

  // Handle opening contacts dialog
  const handleOpenContactsDialog = async () => {
    setIsContactsDialogOpen(true)
    await loadAllContacts()
  }

  // Start conversation with a contact
  const startConversationWithContact = async (contact: WhatsAppContact) => {
    setIsCreatingConversation(true)
    
    try {
      // Create a new conversation in the database using the new API
      const response = await fetch('/admin/chat/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: {
            phone_number: contact.jid.replace('@s.whatsapp.net', ''),
            name: contact.name || contact.notify || 'Unknown',
            notify: contact.notify,
            img_url: contact.imgUrl
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`)
      }

      const result = await response.json()
      const conversation = result.data

      // Create a ChatConversation object for the UI
      const newChatConversation: ChatConversation = {
        id: conversation.id,
        user: contact.name || contact.notify || 'Unknown',
        email: contact.jid,
        avatar: contact.imgUrl || '',
        lastMessage: 'Conversation started',
        timestamp: new Date().toLocaleTimeString(),
        status: 'active',
        unread_count: 0,
        type: 'whatsapp',
        aiConfidence: confidenceThreshold[0],
        lastMessageAt: new Date().toISOString()
      }

      // Add to conversations list
      setDatabaseConversations(prev => [newChatConversation, ...prev])
      
      // Select the new conversation
      setSelectedContact(contact.jid)
      setIsContactsDialogOpen(false)
      setContactSearchTerm("")
      
      toast({
        title: "Conversation created",
        description: `Started new conversation with ${contact.name || contact.notify || "Unknown"}`,
      })
      
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast({
        title: "Error",
        description: "Failed to create conversation. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreatingConversation(false)
    }
  }

  // Helper functions (defined early to avoid initialization errors)
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getContactName = (jid: string) => {
    const contact = whatsappContacts.find(c => c.jid === jid)
    return contact?.name || contact?.notify || jid
  }

  // Get contact profile picture URL
  const getContactAvatar = (jid: string) => {
    const contact = whatsappContacts.find(c => c.jid === jid)
    return contact?.imgUrl || "/placeholder.svg"
  }

  // Helper function to safely get initials from a name
  const getInitials = (name: string | null | undefined): string => {
    if (!name || typeof name !== 'string') return '?'
    
    return name
      .split(" ")
      .filter(part => part.length > 0)
      .map((n) => n[0]?.toUpperCase() || '')
      .filter(initial => initial.length > 0)
      .join("")
      .slice(0, 2) || '?'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "escalated":
        return "bg-red-500"
      case "resolved":
        return "bg-muted-foreground"
      default:
        return "bg-blue-500"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  // Helper function to get message status icon and color
  const getMessageStatusIcon = (status?: string, metadata?: Record<string, any>) => {
    const whatsappStatus = metadata?.whatsapp_status
    const statusName = metadata?.whatsapp_status_name || status
    
    // Convert numeric status to string for comparison
    const statusStr = String(statusName)
    
    // Debug logging to understand status values
    console.log(`🔍 getMessageStatusIcon called - status: "${status}", statusName: "${statusName}", statusStr: "${statusStr}"`)
    console.log(`🔍 metadata:`, metadata)
    
    switch (statusStr) {
      case 'sent':
      case 'pending':
      case '1': // WhatsApp status code for pending
      case '2': // WhatsApp status code for sent
        console.log('🔍 Returning sent status icon')
        return { icon: '✓', color: 'text-muted-foreground', tooltip: 'Sent' }
      case 'delivered':
      case '3': // WhatsApp status code for delivered
        console.log('🔍 Returning delivered status icon')
        return { icon: '✓✓', color: 'text-muted-foreground', tooltip: 'Delivered' }
      case 'read':
      case '4': // WhatsApp status code for read
        console.log('🔍 Returning read status icon')
        return { icon: '✓✓', color: 'text-blue-600 dark:text-blue-400', tooltip: 'Read' }
      case 'failed':
      case 'error':
      case '0': // WhatsApp status code for error
        console.log('🔍 Returning error status icon')
        return { icon: '⚠', color: 'text-red-600 dark:text-red-400', tooltip: 'Failed to send' }
      default:
        // For messages without status, don't show any icon
        console.log('🔍 No status match, returning null for:', statusStr)
        return null
    }
  }

  // Send WhatsApp message
  const sendWhatsAppMessage = async () => {
    if (!newMessage.trim() || !selectedContact || isSending) return

    try {
      setIsSending(true)
      
      // Find the conversation to get the remoteJid
      const conversation = databaseConversations.find(conv => conv.id === selectedContact)
      const remoteJid = conversation?.remoteJid || conversation?.email
      
      if (!remoteJid) {
        throw new Error('Cannot find contact information for this conversation')
      }
      
      // Extract phone number for validation
      const phoneNumber = remoteJid.replace('@s.whatsapp.net', '')
      if (!phoneNumber.match(/^\+?\d+$/)) {
        throw new Error('Invalid phone number format for WhatsApp message.')
      }
      
      console.log('📤 Sending message to:', remoteJid, 'Conversation:', selectedContact)
      
      const response = await fetch('/admin/chat/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: remoteJid,
          text: newMessage.trim(),
          conversationId: selectedContact
        })
      })

      const result = await response.json()

      if (response.ok) {
        setNewMessage("")
        toast({
          title: "Message sent",
          description: "Your WhatsApp message has been sent successfully."
        })
        
        // Reload messages for the current conversation
        await loadMessagesFromDatabase(remoteJid)
        await loadConversationsFromDatabase()
      } else {
        throw new Error(result.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Failed to send WhatsApp message.",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

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
        user: whatsappContacts.find(c => c.jid === selectedContact)?.name || 
             whatsappContacts.find(c => c.jid === selectedContact)?.notify || 
             selectedContact,
        email: selectedContact,
        avatar: whatsappContacts.find(c => c.jid === selectedContact)?.imgUrl || "/placeholder.svg",
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
  }, [conversations, selectedContact, whatsappContacts])

  // Check if the selected conversation is with a system user (non-WhatsApp contact) - memoized to prevent re-calculations
  const isSystemConversation = useMemo(() => {
    if (!selectedConversation) return false
    const remoteJid = selectedConversation.remoteJid || selectedConversation.email
    if (!remoteJid) return false
    const phoneNumber = remoteJid.replace('@s.whatsapp.net', '')
    return phoneNumber === 'admin' || phoneNumber.includes('@') || !phoneNumber.match(/^\+?\d+$/)
  }, [selectedConversation])

  // Start a new chat with a contact
  const startNewChat = async (contact: WhatsAppContact) => {
    console.log('🎯 startNewChat called with contact:', contact)
    
    // Note: Admin panel handles user creation internally via API

    try {
      setIsCreatingConversation(true)
      console.log('🔄 Set isCreatingConversation to true')
      
      console.log('🚀 Starting new chat with contact:', contact)
      
      // First, check if a conversation already exists with this contact
      // Clean the phone number to remove @s.whatsapp.net if present
      const phoneNumber = contact.phone_number || contact.jid.replace('@s.whatsapp.net', '')
      const existingConversation = databaseConversations.find(conv => 
        conv.remoteJid === contact.jid || 
        conv.phoneNumber === phoneNumber ||
        conv.email === contact.jid
      )
      
      if (existingConversation) {
        console.log('📞 Found existing conversation:', existingConversation.id)
        setSelectedContact(existingConversation.id)
        setIsContactsDialogOpen(false)
        setContactSearchTerm("")
        
        // Load messages for the existing conversation
        await loadMessagesFromDatabase(existingConversation.remoteJid || existingConversation.email)
        
        toast({
          title: "Conversation opened",
          description: `Opened existing conversation with ${contact.name || contact.notify || phoneNumber}`,
        })
        return
      }
      
      // Create a new conversation via API
      console.log('💬 Creating new conversation for contact:', contact.name || contact.notify || phoneNumber)
      
      const response = await fetch('/admin/chat/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: {
            phone_number: phoneNumber,
            name: contact.name || contact.notify,
            notify: contact.notify,
            img_url: contact.imgUrl, // Dialog uses imgUrl field
            jid: contact.jid
          },
          type: 'direct',
          title: contact.name || contact.notify || `WhatsApp ${phoneNumber}`,
          description: `WhatsApp conversation with ${contact.name || contact.notify || phoneNumber}`,
          ai_enabled: aiEnabled
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create conversation')
      }

      const result = await response.json()
      console.log('✅ Created conversation:', result)

      if (result.success) {
        // Create a ChatConversation object for the UI
        const newChatConversation: ChatConversation = {
          id: result.data.conversation.id,
          conversationId: result.data.conversation.id,
          user: contact.name || contact.notify || 'Unknown',
          email: contact.jid,
          avatar: contact.imgUrl || '',
          lastMessage: 'Conversation started',
          timestamp: new Date().toLocaleTimeString(),
          status: 'active',
          unread_count: 0,
          type: 'whatsapp',
          aiConfidence: confidenceThreshold[0],
          lastMessageAt: new Date().toISOString(),
          remoteJid: contact.jid,
          phoneNumber: phoneNumber
        }

        // Add to conversations list
        setDatabaseConversations(prev => [newChatConversation, ...prev])
        
        // Select the new conversation
        setSelectedContact(result.data.conversation.id)
        setIsContactsDialogOpen(false)
        setContactSearchTerm("")
        
        // Initialize empty messages for the new conversation
        setDatabaseMessages([])
        
        // Refresh conversations from database to ensure consistency
        await loadConversationsFromDatabase()
        
        toast({
          title: "Conversation created",
          description: `Started new conversation with ${contact.name || contact.notify || phoneNumber}`,
        })
      } else {
        throw new Error(result.error || 'Failed to create conversation')
      }
      
    } catch (error) {
      console.error('❌ Error starting chat:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start chat. Please try again.",
      })
    } finally {
      setIsCreatingConversation(false)
    }
  }

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || isSending) return

    try {
      setIsSending(true)

      // Mark that we should auto-scroll after sending (user's own message)
      setShouldAutoScroll(true)

      // Send message via WhatsApp API
      await sendWhatsAppMessage()
      
      setNewMessage("")
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      })
    } finally {
      setIsSending(false)
    }
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

  // Mark conversation as read
  const markConversationAsRead = async (conversationId: string) => {
    try {
      console.log('📖 Marking conversation as read:', conversationId)
      
      const response = await fetch(`/admin/chat/api/conversations/${conversationId}/read`, {
        method: 'POST',
      })

      if (response.ok) {
        console.log('✅ Conversation marked as read')
        
        // Update local state to reset unread count
        setDatabaseConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unread_count: 0 }
              : conv
          )
        )
        
                  // Refresh global unread count
          setTimeout(() => refreshGlobalUnreadCount(), 300)
      } else {
        console.warn('⚠️ Failed to mark conversation as read:', response.status)
      }
    } catch (error) {
      console.error('❌ Error marking conversation as read:', error)
      // Don't show toast for this error - it's not critical to user experience
    }
  }
  
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

  // Clear all chat data (both Zustand store and component state)
  const clearAllChatData = () => {
    console.log('🧹 Clearing all chat data...')
    
    // Clear localStorage chat storage
    localStorage.removeItem('chat-storage')
    
    // Clear component state
    setDatabaseConversations([])
    setDatabaseMessages([])
    setSelectedContact(null)
    setWhatsappMessages([])
    setWhatsappContacts([])
    
    console.log('✅ All chat data cleared')
    
    toast({
      title: "Chat data cleared",
      description: "All conversations and messages have been cleared from cache.",
    })
  }

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

  // Check if user is at bottom of chat
  const isAtBottom = useCallback(() => {
    if (!scrollAreaRef.current) return true
    
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
    const threshold = 100 // pixels from bottom
    return scrollHeight - scrollTop - clientHeight < threshold
  }, [])

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

  // Update refs when values change to avoid stale closures in subscriptions
  useEffect(() => {
    selectedContactRef.current = selectedContact
    selectedConversationRef.current = selectedConversation
  }, [selectedContact, selectedConversation])

  // ✨ REAL-TIME MESSAGE DISPLAY - Like WhatsApp ✨
  // Set up real-time subscriptions for current conversation messages
  useEffect(() => {
    if (!selectedConversation?.conversationId && !selectedConversation?.id) {
      // Clean up existing subscriptions when no conversation is selected
      if (messageSubscription) {
        console.log('🧹 Cleaning up message subscription (no conversation selected)')
        supabase.removeChannel(messageSubscription)
        setMessageSubscription(null)
      }
      setIsRealTimeConnected(false)
      return
    }

    const conversationId = selectedConversation.conversationId || selectedConversation.id
    const remoteJid = selectedConversation.remoteJid || selectedConversation.email

    console.log('📡 Setting up real-time messages for conversation:', conversationId)

    // Clean up existing subscription first
    if (messageSubscription) {
      console.log('🧹 Cleaning up previous message subscription')
      supabase.removeChannel(messageSubscription)
    }

    // Create new subscription for instant message updates
    const newMessageSubscription = supabase
      .channel(`messages-${conversationId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          console.log('🔔 NEW MESSAGE ARRIVED:', payload.new?.content?.substring(0, 50) + '...')
          
                      // Instantly add the new message to the current view
            const newMessage = payload.new
            if (newMessage && selectedConversationRef.current?.remoteJid) {
              // Add message directly to state for instant display
              setDatabaseMessages(prevMessages => {
                // Check if message already exists to prevent duplicates
                const messageExists = prevMessages.some(msg => msg.id === newMessage.id)
                if (messageExists) return prevMessages
                
                // Convert database message to expected format and add to list
                const updatedMessages = [...prevMessages, newMessage as any]
                console.log('✅ Message added instantly to UI')
                return updatedMessages
              })
            
            // Auto-scroll to new message if user is at bottom
            setTimeout(() => {
              if (messagesEndRef.current && isAtBottom()) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
                console.log('📍 Auto-scrolled to new message')
              }
            }, 100)
            
            // Also refresh conversation list to update last message
            setTimeout(() => {
              loadConversationsFromDatabase(true)
            }, 200)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          console.log('🔄 Message updated (status change):', payload.new?.id)
          
          // Update the specific message in state
          const updatedMessage = payload.new
          if (updatedMessage) {
            setDatabaseMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === updatedMessage.id ? updatedMessage as any : msg
              )
            )
            console.log('✅ Message status updated instantly')
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time message subscription:', status)
        if (status === 'SUBSCRIBED') {
          setIsRealTimeConnected(true)
          setConnectionRetryCount(0)
          console.log('✅ Real-time messages CONNECTED - messages will appear instantly')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setIsRealTimeConnected(false)
          console.warn('⚠️ Real-time messages DISCONNECTED:', status)
          if (connectionRetryCount < 2) {
            setConnectionRetryCount(prev => prev + 1)
            console.log('🔄 Will retry connection...')
          }
        }
      })

    setMessageSubscription(newMessageSubscription)

    return () => {
      if (newMessageSubscription) {
        console.log('🧹 Cleaning up message subscription')
        supabase.removeChannel(newMessageSubscription)
      }
    }
  }, [selectedConversation?.conversationId, selectedConversation?.id, connectionRetryCount])

  // Real-time conversation list updates
  useEffect(() => {
    console.log('📡 Setting up real-time conversation list updates')

    // Clean up existing subscription first
    if (conversationSubscription) {
      supabase.removeChannel(conversationSubscription)
    }

    // Subscribe to new messages globally to update conversation list
    const newConversationSubscription = supabase
      .channel(`conversations-global-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log('🔔 New message globally - updating conversation list')
          
          // Update conversation list to show new last message
          setTimeout(() => {
            loadConversationsFromDatabase(true)
          }, 300)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        async (payload) => {
          console.log('🔔 Conversation updated - refreshing list')
          
          setTimeout(() => {
            loadConversationsFromDatabase(true)
          }, 500)
        }
      )
      .subscribe((status) => {
        console.log('📡 Conversation list subscription:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conversation list real-time CONNECTED')
        }
      })

    setConversationSubscription(newConversationSubscription)

    return () => {
      if (newConversationSubscription) {
        console.log('🧹 Cleaning up conversation subscription')
        supabase.removeChannel(newConversationSubscription)
      }
    }
  }, [])

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

  // Load messages for selected conversation from database
  const loadMessagesFromDatabase = async (remoteJid: string, silent: boolean = false) => {
    if (!remoteJid) return

    try {
      if (!silent) {
        setIsLoadingMessages(true)
      }
      console.log('📨 Loading messages from database for:', remoteJid)
      
      const url = `/admin/chat/api/messages?remoteJid=${encodeURIComponent(remoteJid)}`
      console.log('🔗 API URL:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('📦 API Response:', result)
      
      if (result.success) {
        console.log(`✅ Loaded ${result.data.messages.length} messages from database`)
        console.log('📋 Messages:', result.data.messages)
        setDatabaseMessages(result.data.messages || [])
      } else {
        console.log('📭 No messages found in database for this conversation')
        setDatabaseMessages([])
      }
    } catch (error) {
      console.error('❌ Error loading messages from database:', error)
      setDatabaseMessages([])
      if (!silent) {
        toast({
          title: "Error loading messages",
          description: "Failed to load conversation messages from database.",
          variant: "destructive"
        })
      }
    } finally {
      if (!silent) {
        setIsLoadingMessages(false)
      }
    }
  }

  // Load conversations from database
  const loadConversationsFromDatabase = async (silent: boolean = false) => {
    try {
      if (!silent) {
        console.log('💬 Loading conversations from database...')
      }
      
      const response = await fetch('/admin/chat/api/conversations')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        if (!silent) {
          console.log(`✅ Loaded ${result.data.conversations.length} conversations from database`)
        }
        setDatabaseConversations(result.data.conversations || [])
        
        // Refresh global unread count when conversations are loaded (but don't spam)
        if (!silent) {
          setTimeout(() => refreshGlobalUnreadCount(), 300)
        }
      } else {
        console.log('📭 No conversations found in database')
        setDatabaseConversations([])
      }
    } catch (error) {
      console.error('❌ Error loading conversations from database:', error)
      setDatabaseConversations([])
      if (!silent) {
        toast({
          title: "Error loading conversations",
          description: "Failed to load conversations from database.",
          variant: "destructive"
        })
      }
    }
  }



  // Load contacts count for stats
  const loadContactsCount = async () => {
    try {
      console.log('📋 Fetching contacts from database')
      const response = await fetch('/admin/chat/api/contacts/db')
      if (response.ok) {
        const result = await response.json()
        const contacts = result.data || []
        console.log(`📱 Found ${contacts.length} total contacts in database`)
        setContactsCount(contacts.length)
      }
    } catch (error) {
      console.error('❌ Error loading contacts count:', error)
    }
  }

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      setIsLoadingAnalytics(true)
      console.log('📊 Loading analytics data...')
      
      // Load insights and chart data in parallel
      const [insightsResponse, chartsResponse] = await Promise.all([
        fetch('/admin/chat/api/analytics/insights'),
        fetch('/admin/chat/api/analytics/charts?days=7')
      ])
      
      if (insightsResponse.ok) {
        const insightsResult = await insightsResponse.json()
        if (insightsResult.success) {
          setAnalyticsData(insightsResult.data)
          console.log('✅ Analytics insights loaded:', insightsResult.data)
        }
      }
      
      if (chartsResponse.ok) {
        const chartsResult = await chartsResponse.json()
        if (chartsResult.success) {
          setChartData(chartsResult.data)
          console.log('✅ Chart data loaded:', chartsResult.data.summary)
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading analytics data:', error)
      // Don't show toast for analytics errors - not critical for chat functionality
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

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

  // Load AI prompts and configuration
  const loadAiPromptsData = async () => {
    if (!selectedConversation?.remoteJid) return
    
    try {
      console.log('🤖 Loading AI prompts and config for:', selectedConversation.remoteJid)
      
      // Get AI thread and configuration data by joining with whatsapp_contacts
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          whatsapp_contacts!inner(whatsapp_jid)
        `)
        .eq('whatsapp_contacts.whatsapp_jid', selectedConversation.remoteJid)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error loading AI config:', error)
        return
      }
      
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('ai_thread_id, created_at')
        .eq('conversation_id', selectedConversation.conversationId || selectedConversation.remoteJid)
        .eq('sender_type', 'ai_agent')
        .not('ai_thread_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
      
      setAiPromptsData({
        conversation: conversations,
        aiThreadId: messages?.[0]?.ai_thread_id,
        lastAiInteraction: messages?.[0]?.created_at,
        totalAiMessages: messages?.length || 0,
        assistantId: '5fd12ecb-9268-51f0-8168-fc7952c7c8b8',
        apiUrl: 'https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app'
      })
      
      console.log('✅ Loaded AI config data')
      
    } catch (error) {
      console.error('❌ Failed to load AI prompts data:', error)
    }
  }

  // Delete conversation function
  const deleteConversation = async (conversationId: string) => {
    try {
      console.log('🗑️ Deleting conversation:', conversationId)
      
      const response = await fetch(`/admin/chat/api/conversations/${conversationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Conversation deleted successfully')
        
        // Remove from local state
        setDatabaseConversations(prev => prev.filter(conv => conv.id !== conversationId))
        
        // Clear selection if this conversation was selected
        if (selectedContact === conversationId) {
          setSelectedContact(null)
          setDatabaseMessages([])
        }
        
        toast({
          title: "Conversation deleted",
          description: "The conversation and all its messages have been removed.",
        })
        
        // Reload conversations to ensure consistency
        await loadConversationsFromDatabase()
      } else {
        throw new Error(result.error || 'Failed to delete conversation')
      }
    } catch (error) {
      console.error('❌ Error deleting conversation:', error)
      toast({
        title: "Error deleting conversation",
        description: "Failed to delete the conversation. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Helper function to get proper display name from conversation
  const getDisplayName = (conversation: ChatConversation | undefined): string => {
    if (!conversation) return "Select a contact"
    
    // If user field already has a proper name (not a phone number), use it
    if (conversation.user && conversation.user !== 'Unknown' && !conversation.user.includes('@') && !conversation.user.match(/^\+?\d+$/)) {
      return conversation.user
    }
    
    // Try to find the contact from our contacts list to get the proper name
    const remoteJid = conversation.remoteJid || conversation.email
    if (remoteJid) {
      const contact = allContacts.find(c => c.jid === remoteJid) || 
                     whatsappContacts.find(c => c.jid === remoteJid)
      
      if (contact) {
        return contact.name || contact.notify || contact.verifiedName || extractPhoneNumber(remoteJid)
      }
    }
    
    // Fallback to extracting phone number from email/jid
    return extractPhoneNumber(conversation.email || conversation.id)
  }

  // Helper function to extract clean phone number
  const extractPhoneNumber = (jidOrEmail: string) => {
    if (!jidOrEmail) return "Unknown"
    
    // Remove @s.whatsapp.net suffix
    const cleaned = jidOrEmail.replace('@s.whatsapp.net', '')
    
    // If it's a phone number, format it nicely
    if (cleaned.match(/^\+?\d+$/)) {
      // Add + if not present and format for readability
      const phoneNumber = cleaned.startsWith('+') ? cleaned : `+${cleaned}`
      return phoneNumber
    }
    
    return cleaned
  }

  // Helper function to get conversation subtitle (phone number or status)
  const getConversationSubtitle = (conversation: ChatConversation | undefined): string => {
    if (!conversation) return ""
    
    const remoteJid = conversation.remoteJid || conversation.email
    const phoneNumber = extractPhoneNumber(remoteJid || '')
    
    // If the display name is already the phone number, show status instead
    const displayName = getDisplayName(conversation)
    if (displayName === phoneNumber) {
      return conversation.status === 'active' ? 'Online' : 'Last seen recently'
    }
    
    return phoneNumber
  }

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
                    {selectedContact && selectedConversation ? (() => {
                      // Find the actual WhatsApp contact using the conversation's remoteJid or email
                      const remoteJid = selectedConversation.remoteJid || selectedConversation.email
                      const whatsappContact = whatsappContacts.find(c => c.jid === remoteJid) || 
                                            allContacts.find(c => c.jid === remoteJid)
                      
                      // Use actual contact data or fallback to conversation data
                      const contactData = whatsappContact || {
                        created_at: selectedConversation.lastMessageAt || new Date().toISOString(),
                        updated_at: selectedConversation.lastMessageAt || new Date().toISOString(),
                        last_seen_at: selectedConversation.lastMessageAt || new Date().toISOString(),
                        status: 'active'
                      }
                      
                      // Determine online status based on recent activity (last 5 minutes)
                      const isRecentlyActive = contactData?.last_seen_at ? 
                        (new Date().getTime() - new Date(contactData.last_seen_at).getTime()) < 5 * 60 * 1000 : false
                      const userStatus = isRecentlyActive ? 'online' : 
                        (contactData?.status === 'available' || contactData?.status === 'online' ? 'online' : 'offline')
                      
                      return (
                  <ChatUserProfile 
                    user={{
                      id: selectedContact,
                      authUserId: selectedContact,
                      username: selectedConversation.user,
                      displayName: selectedConversation.user,
                      email: selectedConversation.email,
                      avatarUrl: selectedConversation.avatar,
                      role: 'customer',
                            status: userStatus,
                            lastSeen: contactData?.last_seen_at,
                      preferences: {},
                      notificationSettings: {},
                      profileData: {},
                      isActive: true,
                            createdAt: contactData?.created_at || new Date().toISOString(),
                            updatedAt: contactData?.updated_at || selectedConversation.lastMessageAt || new Date().toISOString()
                    }}
                  />
                      )
                    })() : (
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
                  await deleteConversation(conversationToDelete);
                  setConversationToDelete(null);
                  setIsDeleteDialogOpen(false);
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
