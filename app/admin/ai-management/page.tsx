'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { 
  Bot, 
  Brain, 
  MessageSquare, 
  Settings, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  Clock,
  Users,
  BarChart3,
  Zap,
  Timer,
  RefreshCw,
  Eye,
  TrendingUp,
  UserCheck,
  Database,
  User,
  UserPlus,
  Info,
  Plus,
  Edit3,
  Trash2,
  Search,
  Edit,
  Link,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from 'lucide-react'
import { AssistantConfigForm } from './components/AssistantConfigForm'
import { AssignmentConfigForm } from './components/AssignmentConfigForm'

// Real BB Agent Assistant interface
interface BBAssistant {
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

// User Assignment from database
interface UserAssignment {
  conversation_id: string
  assistant_id: string
  assistant_name: string
  phone_number: string
  display_name: string
  assistant_created_at: string
  conversation_created_at: string
  assistant_config: any
  assistant_metadata: any
}

// AI Interaction from database
interface AIInteraction {
  id: string
  whatsapp_chat_id: string | null
  user_id: string
  user_message: string
  ai_response: string
  thread_id: string
  processing_time_ms: number | null
  tokens_used: number | null
  response_style: string | null
  success: boolean
  error_message: string | null
  created_at: string
}

// Usage Analytics from database
interface UsageAnalytics {
  id: string
  date: string
  total_interactions: number
  avg_processing_time_ms: number
  total_tokens_used: number
  unique_users: number
  unique_chats: number
  success_rate: number
}

// WhatsApp Contact interface for assignment selection
interface WhatsAppContact {
  id: string
  phone_number: string
  whatsapp_jid: string
  push_name: string | null
  display_name: string | null
  profile_picture_url: string | null
  verified_name: string | null
  whatsapp_status: string | null
  last_seen_at: string | null
  is_business_account: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AIManagementPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('assistants')
  const [bbAssistants, setBBAssistants] = useState<BBAssistant[]>([])
  const [userAssignments, setUserAssignments] = useState<UserAssignment[]>([])
  const [interactions, setInteractions] = useState<AIInteraction[]>([])
  const [analytics, setAnalytics] = useState<UsageAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Connection status
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error' | null>(null)
  const [connectionError, setConnectionError] = useState<string>('')
  
  // Form states for assistant creation
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAssistant, setSelectedAssistant] = useState<BBAssistant | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    recursion_limit: 25,
    configurable: '{}'
  })

  // Form states for assignment creation
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [availableContacts, setAvailableContacts] = useState<WhatsAppContact[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({
    contact_id: '',
    assistant_id: ''
  })

  // States for viewing and editing user assignments
  const [selectedAssignment, setSelectedAssignment] = useState<UserAssignment | null>(null)
  const [isAssignmentDetailsOpen, setIsAssignmentDetailsOpen] = useState(false)
  const [isEditAssignmentOpen, setIsEditAssignmentOpen] = useState(false)
  const [editAssignmentForm, setEditAssignmentForm] = useState({
    conversation_id: '',
    assistant_id: '',
    current_assistant_id: ''
  })

  // Enhanced form modal states
  const [isConfigFormOpen, setIsConfigFormOpen] = useState(false)
  const [configFormMode, setConfigFormMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedAssistantForForm, setSelectedAssistantForForm] = useState<BBAssistant | null>(null)

  // Enhanced assignment form modal states
  const [isAssignmentFormOpen, setIsAssignmentFormOpen] = useState(false)
  const [assignmentFormMode, setAssignmentFormMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedAssignmentForForm, setSelectedAssignmentForForm] = useState<UserAssignment | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState({
    assistants: 1,
    assignments: 1,
    interactions: 1,
    analytics: 1
  })
  const itemsPerPage = 10

  // Enhanced analytics state
  const [costMetrics, setCostMetrics] = useState({
    totalCost: 0,
    avgCostPerInteraction: 0,
    monthlyCost: 0,
    projectedMonthlyCost: 0
  })

  // Fetch all data
  const fetchData = async () => {
    if (loading) return // Prevent multiple fetches
    
    setLoading(true)
    try {
      // Test BB Agent connection and fetch assistants
      await testBBAgentConnection()
      
      // Fetch user assignments from database
      const assignmentsRes = await fetch('/api/admin/ai-management/assignments')
      if (!assignmentsRes.ok) throw new Error('Failed to fetch assignments')
      const assignmentsData = await assignmentsRes.json()
      setUserAssignments(assignmentsData)

      // Fetch recent interactions
      const interactionsRes = await fetch('/api/admin/ai-management/interactions?limit=100')
      if (!interactionsRes.ok) throw new Error('Failed to fetch interactions')
      const interactionsData = await interactionsRes.json()
      setInteractions(interactionsData)

      // Fetch analytics from database
      const analyticsRes = await fetch('/api/admin/ai-management/analytics')
      if (!analyticsRes.ok) throw new Error('Failed to fetch analytics')
      const analyticsData = await analyticsRes.json()
      setAnalytics(analyticsData)

      // Fetch real-time AI stats from interactions
      const aiStatsRes = await fetch('/api/ai/stats')
      if (!aiStatsRes.ok) throw new Error('Failed to fetch AI stats')
      const aiStatsData = await aiStatsRes.json()
      
      // Update real-time metrics if available
      if (aiStatsData && !aiStatsData.error) {
        setCostMetrics(prev => ({
          ...prev,
          totalCost: (aiStatsData.totalInteractions || 0) * 0.002, // Rough estimate
          avgCostPerInteraction: 0.002,
          projectedMonthlyCost: ((aiStatsData.totalInteractions || 0) * 0.002) * 30 / Math.max(1, new Date().getDate())
        }))
      }

      toast({
        title: "Data refreshed",
        description: "All data has been updated successfully.",
      })
    } catch (error) {
      console.error('Failed to fetch AI management data:', error)
      toast({
        title: "Error refreshing data",
        description: error instanceof Error ? error.message : "Failed to fetch updated data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Initialize data on mount
  useEffect(() => {
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle refresh click
  const handleRefresh = async (e: React.MouseEvent) => {
    e.preventDefault()
    await fetchData()
  }

  // Fetch available contacts for assignment
  const fetchAvailableContacts = async () => {
    setIsLoadingContacts(true)
    try {
      const response = await fetch('/admin/chat/api/contacts/db')
      const result = await response.json()
      
      if (response.ok && result.success) {
        // Map the contact data to match our interface
        const mappedContacts = result.data.map((contact: any) => ({
          id: contact.id,
          phone_number: contact.phone_number,
          whatsapp_jid: `${contact.phone_number}@s.whatsapp.net`,
          push_name: contact.notify,
          display_name: contact.name || contact.notify,
          profile_picture_url: contact.img_url,
          verified_name: contact.verified_name,
          whatsapp_status: contact.status,
          last_seen_at: contact.last_seen_at,
          is_business_account: false,
          is_active: true,
          created_at: contact.created_at,
          updated_at: contact.updated_at
        }))
        setAvailableContacts(mappedContacts)
      } else {
        toast({
          title: "Error loading contacts", 
          description: "Failed to fetch WhatsApp contacts",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
      toast({
        title: "Error loading contacts",
        description: "Failed to fetch WhatsApp contacts",
        variant: "destructive"
      })
    } finally {
      setIsLoadingContacts(false)
    }
  }

  const testBBAgentConnection = async () => {
    setConnectionStatus('testing')
    setConnectionError('')

    try {
      // Search for all assistants using BB Agent API
      const response = await fetch('/api/admin/ai-management/bb-assistants')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setBBAssistants(result.assistants)
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('error')
        setConnectionError(result.error || 'Failed to fetch assistants from BB Agent')
      }
    } catch (error) {
      setConnectionStatus('error')
      setConnectionError(error instanceof Error ? error.message : 'Connection failed')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateAssistant = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/ai-management/bb-assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          config: {
            recursion_limit: formData.recursion_limit,
            configurable: JSON.parse(formData.configurable)
          }
        })
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setFormData({ name: '', description: '', recursion_limit: 25, configurable: '{}' })
        fetchData()
        toast({
          title: "Assistant created",
          description: "BB Agent assistant has been created successfully.",
        })
      }
    } catch (error) {
      console.error('Failed to create assistant:', error)
      toast({
        title: "Error creating assistant",
        description: "Failed to create BB Agent assistant.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAssistant = async (assistantId: string) => {
    try {
      const response = await fetch(`/api/admin/ai-management/bb-assistants/${assistantId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
        toast({
          title: "Assistant deleted",
          description: "BB Agent assistant has been deleted successfully.",
        })
      }
    } catch (error) {
      console.error('Failed to delete assistant:', error)
      toast({
        title: "Error deleting assistant",
        description: "Failed to delete BB Agent assistant.",
        variant: "destructive"
      })
    }
  }

  const handleCreateAssignment = async (config: any) => {
    try {
      const response = await fetch('/api/admin/ai-management/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: config.contact.phone_number,
          assistant_id: config.assistant.assistant_id,
          priority: config.assignment.priority,
          auto_enable: config.assignment.auto_enable,
          notification_settings: config.assignment.notification_settings,
          schedule: config.assignment.schedule,
          custom_config: config.assignment.custom_config,
          notes: config.notes
        })
      })

      if (response.ok) {
        setIsAssignmentFormOpen(false)
        fetchData()
        toast({
          title: "Assignment created",
          description: `Assistant "${config.assistant.name}" has been assigned to ${config.contact.display_name || config.contact.phone_number}.`,
        })
      } else {
        const result = await response.json()
        toast({
          title: "Error creating assignment",
          description: result.error || "Failed to create assignment.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to create assignment:', error)
      toast({
        title: "Error creating assignment",
        description: "Failed to create assignment.",
        variant: "destructive"
      })
    }
  }

  const handleAssignAssistant = async (phoneNumber: string, assistantId: string) => {
    try {
      const response = await fetch('/api/admin/ai-management/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          assistant_id: assistantId
        })
      })

      if (response.ok) {
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Failed to assign assistant:', error)
    }
  }

  // Handle viewing assignment details
  const handleViewAssignment = (assignment: UserAssignment) => {
    setSelectedAssignmentForForm(assignment)
    setAssignmentFormMode('view')
    fetchAvailableContacts() // Load contacts for viewing
    setIsAssignmentFormOpen(true)
  }

  // Handle editing assignment
  const handleEditAssignment = (assignment: UserAssignment) => {
    setSelectedAssignmentForForm(assignment)
    setAssignmentFormMode('edit')
    fetchAvailableContacts() // Load contacts for editing
    setIsAssignmentFormOpen(true)
  }

  // Handle creating new assignment
  const handleCreateNewAssignment = () => {
    setSelectedAssignmentForForm(null)
    setAssignmentFormMode('create')
    fetchAvailableContacts() // Load contacts for creating
    setIsAssignmentFormOpen(true)
  }

  // Handle updating assignment
  const handleUpdateAssignment = async (config: any) => {
    try {
      const response = await fetch('/api/admin/ai-management/assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedAssignmentForForm?.conversation_id,
          new_assistant_id: config.assistant.assistant_id,
          priority: config.assignment.priority,
          auto_enable: config.assignment.auto_enable,
          notification_settings: config.assignment.notification_settings,
          schedule: config.assignment.schedule,
          custom_config: config.assignment.custom_config,
          notes: config.notes
        })
      })

      if (response.ok) {
        setIsAssignmentFormOpen(false)
        fetchData()
        toast({
          title: "Assignment updated",
          description: `Assistant changed to "${config.assistant.name}".`,
        })
      } else {
        const result = await response.json()
        toast({
          title: "Error updating assignment",
          description: result.error || "Failed to update assignment.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to update assignment:', error)
      toast({
        title: "Error updating assignment",
        description: "Failed to update assignment.",
        variant: "destructive"
      })
    }
  }

  // Handle deleting assignment
  const handleDeleteAssignment = async (conversationId: string, displayName: string) => {
    if (!confirm(`Are you sure you want to remove the AI assistant assignment for ${displayName}?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/ai-management/assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId })
      })

      if (response.ok) {
        fetchData()
        toast({
          title: "Assignment removed",
          description: `AI assistant assignment removed for ${displayName}.`,
        })
      } else {
        const result = await response.json()
        toast({
          title: "Error removing assignment",
          description: result.error || "Failed to remove assignment.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to delete assignment:', error)
      toast({
        title: "Error removing assignment",
        description: "Failed to remove assignment.",
        variant: "destructive"
      })
    }
  }

  // Enhanced form handlers
  const handleViewAssistant = (assistant: BBAssistant) => {
    setSelectedAssistantForForm(assistant)
    setConfigFormMode('view')
    setIsConfigFormOpen(true)
  }

  const handleEditAssistant = (assistant: BBAssistant) => {
    setSelectedAssistantForForm(assistant)
    setConfigFormMode('edit')
    setIsConfigFormOpen(true)
  }

  const handleCreateNewAssistant = () => {
    setSelectedAssistantForForm(null)
    setConfigFormMode('create')
    setIsConfigFormOpen(true)
  }

  const handleConfigFormSave = async (config: any) => {
    try {
      const url = configFormMode === 'create' 
        ? '/api/admin/ai-management/bb-assistants'
        : `/api/admin/ai-management/bb-assistants/${selectedAssistantForForm?.assistant_id}`
      
      const method = configFormMode === 'create' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.name,
          description: config.description,
          config: {
            recursion_limit: config.recursion_limit,
            configurable: {
              core: {
                language: config.language,
                debug: config.debug,
                source: config.source,
                version: config.version
              },
              user: config.user,
              assistant: config.assistant
            }
          }
        })
      })

      if (response.ok) {
        setIsConfigFormOpen(false)
        fetchData()
        toast({
          title: configFormMode === 'create' ? "Assistant created" : "Assistant updated",
          description: `${config.name} has been ${configFormMode === 'create' ? 'created' : 'updated'} successfully.`,
        })
      } else {
        const result = await response.json()
        toast({
          title: `Error ${configFormMode === 'create' ? 'creating' : 'updating'} assistant`,
          description: result.error || `Failed to ${configFormMode} assistant.`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error(`Failed to ${configFormMode} assistant:`, error)
      toast({
        title: `Error ${configFormMode === 'create' ? 'creating' : 'updating'} assistant`,
        description: `Failed to ${configFormMode} assistant.`,
        variant: "destructive"
      })
    }
  }

  const handleAssignmentFormSave = async (config: any) => {
    if (assignmentFormMode === 'create') {
      await handleCreateAssignment(config)
    } else if (assignmentFormMode === 'edit') {
      await handleUpdateAssignment(config)
    }
  }

  // Calculate cost metrics
  const calculateCostMetrics = () => {
    const totalTokens = interactions.reduce((sum, interaction) => sum + (interaction.tokens_used || 0), 0)
    const avgTokensPerInteraction = interactions.length > 0 ? totalTokens / interactions.length : 0
    
    // Rough cost calculation (adjust based on actual pricing)
    const costPerThousandTokens = 0.002 // $0.002 per 1K tokens (example rate)
    const totalCost = (totalTokens / 1000) * costPerThousandTokens
    const avgCostPerInteraction = avgTokensPerInteraction * costPerThousandTokens / 1000
    
    // Monthly projection based on current usage
    const interactionsThisMonth = interactions.filter(interaction => {
      const interactionDate = new Date(interaction.created_at)
      const currentDate = new Date()
      return interactionDate.getMonth() === currentDate.getMonth() && 
             interactionDate.getFullYear() === currentDate.getFullYear()
    }).length
    
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const currentDayOfMonth = new Date().getDate()
    const projectedMonthlyCost = (totalCost / currentDayOfMonth) * daysInMonth
    
    setCostMetrics({
      totalCost,
      avgCostPerInteraction,
      monthlyCost: totalCost,
      projectedMonthlyCost
    })
  }

  // Calculate pagination
  const getPaginatedData = (data: any[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = (dataLength: number) => {
    return Math.ceil(dataLength / itemsPerPage)
  }

  const changePage = (type: 'assistants' | 'assignments' | 'interactions' | 'analytics', newPage: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [type]: newPage
    }))
  }

  // Pagination component
  const PaginationControls = ({ type, dataLength }: { type: 'assistants' | 'assignments' | 'interactions' | 'analytics', dataLength: number }) => {
    const totalPages = getTotalPages(dataLength)
    const currentPageNum = currentPage[type]
    
    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-gray-700">
          Showing {((currentPageNum - 1) * itemsPerPage) + 1} to {Math.min(currentPageNum * itemsPerPage, dataLength)} of {dataLength} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(type, 1)}
            disabled={currentPageNum === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(type, currentPageNum - 1)}
            disabled={currentPageNum === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {currentPageNum} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(type, currentPageNum + 1)}
            disabled={currentPageNum === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(type, totalPages)}
            disabled={currentPageNum === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Calculate enhanced analytics
  useEffect(() => {
    if (interactions.length > 0) {
      calculateCostMetrics()
    }
  }, [interactions])

  const filteredAssistants = bbAssistants.filter(assistant =>
    (assistant.name && assistant.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (assistant.assistant_id && assistant.assistant_id.includes(searchTerm)) ||
    (assistant.description && assistant.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredAssignments = userAssignments.filter(assignment =>
    (assignment.phone_number && assignment.phone_number.includes(searchTerm)) ||
    (assignment.display_name && assignment.display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (assignment.assistant_name && assignment.assistant_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const recentAnalytics = analytics.slice(0, 7) // Last 7 days
  
  // Calculate real-time metrics from interactions data
  const totalInteractions = interactions.length
  const successfulInteractions = interactions.filter(i => i.success).length
  const avgSuccessRate = totalInteractions > 0 ? (successfulInteractions / totalInteractions) * 100 : 0
  
  // Calculate processing time metrics  
  const processingTimes = interactions.filter(i => i.processing_time_ms != null).map(i => i.processing_time_ms!)
  const avgProcessingTime = processingTimes.length > 0 ? 
    processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length : 0
  
  // Calculate daily interactions for current week
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()
  
  const dailyInteractionCounts = last7Days.map(date => {
    const dayInteractions = interactions.filter(i => i.created_at.startsWith(date))
    return {
      date,
      count: dayInteractions.length,
      success: dayInteractions.filter(i => i.success).length
    }
  })
  
  const todayInteractions = dailyInteractionCounts[dailyInteractionCounts.length - 1]?.count || 0
  const yesterdayInteractions = dailyInteractionCounts[dailyInteractionCounts.length - 2]?.count || 0
  const interactionsTrend = yesterdayInteractions > 0 ? 
    ((todayInteractions - yesterdayInteractions) / yesterdayInteractions) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
              <p className="text-gray-500">Loading AI Management...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bot className="h-8 w-8 text-blue-600" />
              AI Management
            </h1>
            <p className="text-gray-600 mt-2">Manage BB Agent assistants and user assignments</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>

        {/* BB Agent Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              BB Agent Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {connectionStatus === 'testing' && (
                  <>
                    <div className="h-3 w-3 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="text-sm">Testing connection...</span>
                  </>
                )}
                {connectionStatus === 'connected' && (
                  <>
                    <div className="h-3 w-3 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium text-green-700">Connected to BB Agent</span>
                    <Badge variant="outline">{bbAssistants.length} assistants</Badge>
                  </>
                )}
                {connectionStatus === 'error' && (
                  <>
                    <div className="h-3 w-3 bg-red-500 rounded-full" />
                    <span className="text-sm font-medium text-red-700">Connection Failed</span>
                  </>
                )}
              </div>
              <Button onClick={testBBAgentConnection} size="sm" variant="outline">
                Test Connection
              </Button>
            </div>

            {connectionError && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>{connectionError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">BB Assistants</p>
                  <p className="text-2xl font-bold text-blue-900">{bbAssistants.length}</p>
                  <p className="text-xs text-blue-700">Active assistants</p>
                </div>
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">User Assignments</p>
                  <p className="text-2xl font-bold text-purple-900">{userAssignments.length}</p>
                  <p className="text-xs text-purple-700">Active assignments</p>
                </div>
                <UserCheck className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Interactions</p>
                  <p className="text-2xl font-bold text-green-900">{totalInteractions}</p>
                  <p className="text-xs text-green-700">
                    Today: {todayInteractions} 
                    {interactionsTrend !== 0 && (
                      <span className={`ml-1 ${interactionsTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({interactionsTrend > 0 ? '+' : ''}{interactionsTrend.toFixed(1)}%)
                      </span>
                    )}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Success Rate</p>
                  <p className="text-2xl font-bold text-yellow-900">{avgSuccessRate.toFixed(1)}%</p>
                  <p className="text-xs text-yellow-700">
                    {avgProcessingTime > 0 ? 
                      `${Math.round(avgProcessingTime)}ms avg` : 
                      'No processing data'
                    }
                    {avgProcessingTime > 0 && (
                      <span className={`ml-1 ${
                        avgProcessingTime < 1000 ? 'text-green-600' : 
                        avgProcessingTime < 3000 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {avgProcessingTime < 1000 ? '⚡ Fast' : 
                         avgProcessingTime < 3000 ? '⚖️ Normal' : 
                         '🐌 Slow'}
                      </span>
                    )}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Monthly Cost</p>
                  <p className="text-2xl font-bold text-orange-900">${costMetrics.projectedMonthlyCost.toFixed(2)}</p>
                  <p className="text-xs text-orange-700">
                    ${costMetrics.avgCostPerInteraction.toFixed(4)}/interaction
                    {totalInteractions > 0 && (
                      <span className="block text-xs text-orange-600 mt-1">
                        Total: ${costMetrics.totalCost.toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assistants" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              BB Assistants ({bbAssistants.length})
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Assignments ({userAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="interactions" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Interactions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* BB Assistants Tab */}
          <TabsContent value="assistants" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">BB Agent Assistants</h2>
              <Button onClick={handleCreateNewAssistant} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Assistant
              </Button>
            </div>

            {filteredAssistants.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bot className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No BB Assistants</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Create your first BB Agent assistant to get started.
                  </p>
                  <Button onClick={handleCreateNewAssistant}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assistant
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {getPaginatedData(filteredAssistants, currentPage.assistants).map((assistant) => (
                  <Card key={assistant.assistant_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <Bot className="h-5 w-5 text-blue-600" />
                              <h3 className="text-lg font-semibold">{assistant.name}</h3>
                            </div>
                            <Badge variant="outline">v{assistant.version}</Badge>
                          </div>
                          <p className="text-gray-600 mb-4">{assistant.description}</p>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p><strong>ID:</strong> {assistant.assistant_id.slice(0, 8)}...</p>
                            <p><strong>Graph:</strong> {assistant.graph_id}</p>
                            <p><strong>Created:</strong> {new Date(assistant.created_at).toLocaleDateString()}</p>
                            <p><strong>Recursion Limit:</strong> {assistant.config.recursion_limit}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewAssistant(assistant)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditAssistant(assistant)}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteAssistant(assistant.assistant_id)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <PaginationControls type="assistants" dataLength={filteredAssistants.length} />
              </div>
            )}
          </TabsContent>

          {/* Dialog for old create form - kept for backward compatibility but hidden */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-7xl">
              <DialogHeader className="pb-4">
                <DialogTitle>Create BB Agent Assistant</DialogTitle>
                <DialogDescription>
                  Create a new assistant using the BB Agent LangGraph API
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Assistant Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Assistant name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recursion_limit">Recursion Limit</Label>
                    <Input
                      id="recursion_limit"
                      type="number"
                      value={formData.recursion_limit}
                      onChange={(e) => setFormData({ ...formData, recursion_limit: parseInt(e.target.value) })}
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="configurable">Configurable (JSON)</Label>
                    <Textarea
                      id="configurable"
                      value={formData.configurable}
                      onChange={(e) => setFormData({ ...formData, configurable: e.target.value })}
                      placeholder="{}"
                      className="h-[80px] font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-end space-y-4">
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => setIsCreateDialogOpen(false)} variant="outline">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAssistant} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Assistant"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* User Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Assistant Assignments</h2>
              <Button 
                onClick={handleCreateNewAssignment} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Current Assignments</CardTitle>
                <CardDescription>Users who have BB Agent assistants assigned</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Assistant</TableHead>
                      <TableHead>Assistant ID</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPaginatedData(filteredAssignments, currentPage.assignments).length > 0 ? (
                      getPaginatedData(filteredAssignments, currentPage.assignments).map((assignment, index) => (
                        <TableRow key={assignment.conversation_id || `assignment-${index}`} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{assignment.display_name}</TableCell>
                          <TableCell>{assignment.phone_number}</TableCell>
                          <TableCell>{assignment.assistant_name}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {assignment.assistant_id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>{new Date(assignment.assistant_created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewAssignment(assignment)}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                title="View Assignment Details"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditAssignment(assignment)}
                                className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                                title="Edit Assignment"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteAssignment(assignment.conversation_id, assignment.display_name)}
                                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                title="Remove Assignment"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          No assignments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <PaginationControls type="assignments" dataLength={filteredAssignments.length} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interactions Tab */}
          <TabsContent value="interactions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">AI Interactions</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{interactions.length} total interactions</Badge>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Interactions</CardTitle>
                <CardDescription>Latest AI-powered WhatsApp conversations and their performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Message Preview</TableHead>
                      <TableHead>Processing Time</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPaginatedData(interactions, currentPage.interactions).length > 0 ? (
                      getPaginatedData(interactions, currentPage.interactions).map((interaction, index) => (
                        <TableRow key={interaction.id || `interaction-${index}`} className="hover:bg-gray-50">
                          <TableCell className="text-sm">
                            {new Date(interaction.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm font-mono bg-gray-50 rounded px-2 py-1">
                            {interaction.user_id.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="max-w-md truncate text-sm">
                            <span className="line-clamp-2" title={interaction.user_message}>
                              {interaction.user_message}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              interaction.processing_time_ms 
                                ? interaction.processing_time_ms < 1000 
                                  ? 'bg-green-100 text-green-800'
                                  : interaction.processing_time_ms < 3000
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {interaction.processing_time_ms ? `${interaction.processing_time_ms}ms` : 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            <span className="px-2 py-1 bg-blue-50 text-blue-800 rounded text-xs">
                              {interaction.tokens_used?.toLocaleString() || '0'} tokens
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={interaction.success ? "default" : "destructive"} className="flex items-center gap-1 w-fit">
                              {interaction.success ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              {interaction.success ? "Success" : "Failed"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          <div className="flex flex-col items-center">
                            <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                            <p>No interactions data available</p>
                            <p className="text-sm text-gray-400">Interactions will appear here once users start chatting with AI assistants</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <PaginationControls type="interactions" dataLength={interactions.length} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">AI Usage Analytics</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{analytics.length} days of data</Badge>
                <Badge variant="secondary">Live Metrics</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recentAnalytics.length > 0 
                          ? Math.round(recentAnalytics.reduce((sum, day) => sum + day.avg_processing_time_ms, 0) / recentAnalytics.length)
                          : 0}ms
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {recentAnalytics.length > 0 && recentAnalytics[0].avg_processing_time_ms < 2000 ? '⚡ Fast' : 
                         recentAnalytics.length > 0 && recentAnalytics[0].avg_processing_time_ms < 5000 ? '⚖️ Normal' : '🐌 Slow'}
                      </p>
                    </div>
                    <Timer className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tokens Used</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recentAnalytics.reduce((sum, day) => sum + day.total_tokens_used, 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Avg: {recentAnalytics.length > 0 ? Math.round(recentAnalytics.reduce((sum, day) => sum + day.total_tokens_used, 0) / recentAnalytics.length).toLocaleString() : 0}/day
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Unique Users</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recentAnalytics.reduce((sum, day) => sum + day.unique_users, 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {recentAnalytics.length > 0 ? `+${recentAnalytics[0].unique_users} today` : 'No data today'}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Unique Chats</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recentAnalytics.reduce((sum, day) => sum + day.unique_chats, 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {recentAnalytics.length > 0 ? `${recentAnalytics[0].unique_chats} active today` : 'No chats today'}
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Estimated Cost</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${costMetrics.projectedMonthlyCost.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ${costMetrics.avgCostPerInteraction.toFixed(4)}/interaction
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Daily Analytics
                </CardTitle>
                <CardDescription>Detailed performance metrics and trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Interactions</TableHead>
                      <TableHead>Avg Processing Time</TableHead>
                      <TableHead>Tokens Used</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Unique Users</TableHead>
                      <TableHead>Cost Estimate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPaginatedData(recentAnalytics, currentPage.analytics).length > 0 ? (
                      getPaginatedData(recentAnalytics, currentPage.analytics).map((day, index) => (
                        <TableRow key={day.id || `analytics-${index}`} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {new Date(day.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-blue-50 text-blue-800 rounded text-sm font-medium">
                              {day.total_interactions}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-sm ${
                              day.avg_processing_time_ms < 1000 
                                ? 'bg-green-100 text-green-800'
                                : day.avg_processing_time_ms < 3000
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {Math.round(day.avg_processing_time_ms)}ms
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-purple-50 text-purple-800 rounded text-sm">
                              {day.total_tokens_used.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={day.success_rate >= 90 ? "default" : day.success_rate >= 75 ? "secondary" : "destructive"} className="font-medium">
                              {day.success_rate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-green-50 text-green-800 rounded text-sm">
                              {day.unique_users} users
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-orange-50 text-orange-800 rounded text-sm font-mono">
                              ${((day.total_tokens_used / 1000) * 0.002).toFixed(3)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          <div className="flex flex-col items-center">
                            <BarChart3 className="h-12 w-12 text-gray-300 mb-2" />
                            <p>No analytics data available</p>
                            <p className="text-sm text-gray-400">Analytics will appear here once AI interactions begin</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <PaginationControls type="analytics" dataLength={recentAnalytics.length} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Assistant Details Dialog */}
        {selectedAssistant && (
          <Dialog open={!!selectedAssistant} onOpenChange={() => setSelectedAssistant(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedAssistant.name}</DialogTitle>
                <DialogDescription>BB Agent assistant details and configuration</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium">Assistant ID</label>
                    <p className="text-gray-600 font-mono">{selectedAssistant.assistant_id}</p>
                  </div>
                  <div>
                    <label className="font-medium">Graph ID</label>
                    <p className="text-gray-600">{selectedAssistant.graph_id}</p>
                  </div>
                  <div>
                    <label className="font-medium">Version</label>
                    <p className="text-gray-600">v{selectedAssistant.version}</p>
                  </div>
                  <div>
                    <label className="font-medium">Recursion Limit</label>
                    <p className="text-gray-600">{selectedAssistant.config.recursion_limit}</p>
                  </div>
                </div>
                
                <div>
                  <label className="font-medium">Description</label>
                  <p className="text-gray-600 mt-1">
                    {selectedAssistant.description || 'No description provided'}
                  </p>
                </div>

                <div>
                  <label className="font-medium">Configuration</label>
                  <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto max-h-48">
                    {JSON.stringify(selectedAssistant.config, null, 2)}
                  </pre>
                </div>

                {Object.keys(selectedAssistant.metadata || {}).length > 0 && (
                  <div>
                    <label className="font-medium">Metadata</label>
                    <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto max-h-48">
                      {JSON.stringify(selectedAssistant.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Assignment Details Dialog */}
        {selectedAssignment && (
          <Dialog open={isAssignmentDetailsOpen} onOpenChange={setIsAssignmentDetailsOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Assignment Details</DialogTitle>
                <DialogDescription>
                  {selectedAssignment.display_name} - {selectedAssignment.assistant_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium">User</label>
                    <p className="text-gray-600">{selectedAssignment.display_name}</p>
                  </div>
                  <div>
                    <label className="font-medium">Phone Number</label>
                    <p className="text-gray-600">{selectedAssignment.phone_number}</p>
                  </div>
                  <div>
                    <label className="font-medium">Assistant Name</label>
                    <p className="text-gray-600">{selectedAssignment.assistant_name}</p>
                  </div>
                  <div>
                    <label className="font-medium">Assistant ID</label>
                    <p className="text-gray-600 font-mono">{selectedAssignment.assistant_id}</p>
                  </div>
                  <div>
                    <label className="font-medium">Conversation ID</label>
                    <p className="text-gray-600 font-mono">{selectedAssignment.conversation_id}</p>
                  </div>
                  <div>
                    <label className="font-medium">Assignment Created</label>
                    <p className="text-gray-600">{new Date(selectedAssignment.assistant_created_at).toLocaleString()}</p>
                  </div>
                </div>

                {selectedAssignment.assistant_config && Object.keys(selectedAssignment.assistant_config).length > 0 && (
                  <div>
                    <label className="font-medium">Assistant Configuration</label>
                    <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto max-h-48">
                      {JSON.stringify(selectedAssignment.assistant_config, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedAssignment.assistant_metadata && Object.keys(selectedAssignment.assistant_metadata).length > 0 && (
                  <div>
                    <label className="font-medium">Assistant Metadata</label>
                    <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto max-h-48">
                      {JSON.stringify(selectedAssignment.assistant_metadata, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsAssignmentDetailsOpen(false)
                      handleEditAssignment(selectedAssignment)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Assignment
                  </Button>
                  <Button onClick={() => setIsAssignmentDetailsOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Assignment Dialog */}
        <Dialog open={isEditAssignmentOpen} onOpenChange={setIsEditAssignmentOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
              <DialogDescription>
                Change the assistant assigned to {selectedAssignment?.display_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Current User</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedAssignment?.display_name} ({selectedAssignment?.phone_number})
                </p>
              </div>
              
              <div>
                <Label>Current Assistant</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedAssignment?.assistant_name}</p>
              </div>

              <div>
                <Label htmlFor="new-assistant">New Assistant</Label>
                <Select 
                  value={editAssignmentForm.assistant_id} 
                  onValueChange={(value) => setEditAssignmentForm({ ...editAssignmentForm, assistant_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a new assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    {bbAssistants.map((assistant) => (
                      <SelectItem key={assistant.assistant_id} value={assistant.assistant_id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{assistant.name}</span>
                          <span className="text-sm text-gray-500">{assistant.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => setIsEditAssignmentOpen(false)} 
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateAssignment}
                  disabled={!editAssignmentForm.assistant_id || editAssignmentForm.assistant_id === editAssignmentForm.current_assistant_id}
                  className="flex-1"
                >
                  Update Assignment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Assistant Configuration Form */}
        <AssistantConfigForm
          assistant={selectedAssistantForForm}
          isOpen={isConfigFormOpen}
          onClose={() => setIsConfigFormOpen(false)}
          onSave={handleConfigFormSave}
          mode={configFormMode}
        />

        {/* Enhanced Assignment Configuration Form */}
        <AssignmentConfigForm
          assignment={selectedAssignmentForForm}
          isOpen={isAssignmentFormOpen}
          onClose={() => setIsAssignmentFormOpen(false)}
          onSave={handleAssignmentFormSave}
          mode={assignmentFormMode}
          availableContacts={availableContacts}
          availableAssistants={bbAssistants}
          isLoadingContacts={isLoadingContacts}
        />

      </div>
    </div>
  )
} 