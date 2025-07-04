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
  Link
} from 'lucide-react'

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

  // Fetch all data
  const fetchData = async () => {
    setLoading(true)
    try {
      // Test BB Agent connection and fetch assistants
      await testBBAgentConnection()
      
      // Fetch user assignments from database
      const assignmentsRes = await fetch('/api/admin/ai-management/assignments')
      const assignmentsData = await assignmentsRes.json()
      setUserAssignments(assignmentsData)

      // Fetch recent interactions
      const interactionsRes = await fetch('/api/admin/ai-management/interactions?limit=50')
      const interactionsData = await interactionsRes.json()
      setInteractions(interactionsData)

      // Fetch analytics
      const analyticsRes = await fetch('/api/admin/ai-management/analytics')
      const analyticsData = await analyticsRes.json()
      setAnalytics(analyticsData)

    } catch (error) {
      console.error('Failed to fetch AI management data:', error)
    } finally {
      setLoading(false)
    }
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

  const handleCreateAssignment = async () => {
    try {
      const selectedContact = availableContacts.find(c => c.id === assignmentForm.contact_id)
      const selectedAssistant = bbAssistants.find(a => a.assistant_id === assignmentForm.assistant_id)
      
      if (!selectedContact || !selectedAssistant) {
        toast({
          title: "Invalid selection",
          description: "Please select both a contact and an assistant.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/admin/ai-management/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: selectedContact.phone_number,
          assistant_id: assignmentForm.assistant_id
        })
      })

      if (response.ok) {
        setIsAssignDialogOpen(false)
        setAssignmentForm({ contact_id: '', assistant_id: '' })
        fetchData()
        toast({
          title: "Assignment created",
          description: `Assistant "${selectedAssistant.name}" has been assigned to ${selectedContact.display_name || selectedContact.phone_number}.`,
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



  const filteredAssistants = bbAssistants.filter(assistant =>
    assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assistant.assistant_id.includes(searchTerm) ||
    (assistant.description && assistant.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredAssignments = userAssignments.filter(assignment =>
    assignment.phone_number.includes(searchTerm) ||
    assignment.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.assistant_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const recentAnalytics = analytics.slice(0, 7) // Last 7 days
  const totalInteractions = analytics.reduce((sum, day) => sum + day.total_interactions, 0)
  const avgSuccessRate = analytics.length > 0 
    ? analytics.reduce((sum, day) => sum + day.success_rate, 0) / analytics.length 
    : 0

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
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">BB Assistants</p>
                  <p className="text-2xl font-bold text-gray-900">{bbAssistants.length}</p>
                </div>
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">User Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">{userAssignments.length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Interactions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalInteractions}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{avgSuccessRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
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
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assistant
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create BB Agent Assistant</DialogTitle>
                    <DialogDescription>
                      Create a new assistant using the BB Agent LangGraph API
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Assistant Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Assistant Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recursion_limit">Recursion Limit</Label>
                      <Input
                        id="recursion_limit"
                        type="number"
                        value={formData.recursion_limit}
                        onChange={(e) => setFormData({ ...formData, recursion_limit: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="configurable">Configurable (JSON)</Label>
                      <Textarea
                        id="configurable"
                        value={formData.configurable}
                        onChange={(e) => setFormData({ ...formData, configurable: e.target.value })}
                        placeholder="{}"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setIsCreateDialogOpen(false)} variant="outline">
                        Cancel
                      </Button>
                      <Button onClick={handleCreateAssistant}>
                        Create Assistant
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {filteredAssistants.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bot className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No BB Assistants</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Create your first BB Agent assistant to get started.
                  </p>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assistant
                    </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredAssistants.map((assistant) => (
                  <Card key={assistant.assistant_id}>
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
                        </div>
                        <div className="flex flex-col items-end gap-4">
                          <div className="text-right text-sm text-gray-500">
                        <p><strong>ID:</strong> {assistant.assistant_id.slice(0, 8)}...</p>
                        <p><strong>Graph:</strong> {assistant.graph_id}</p>
                        <p><strong>Created:</strong> {new Date(assistant.created_at).toLocaleDateString()}</p>
                        <p><strong>Recursion Limit:</strong> {assistant.config.recursion_limit}</p>
                      </div>
                      <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteAssistant(assistant.assistant_id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* User Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">User Assistant Assignments</h2>
              <Dialog open={isAssignDialogOpen} onOpenChange={(open) => {
                setIsAssignDialogOpen(open)
                if (open) {
                  fetchAvailableContacts()
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Assistant Assignment</DialogTitle>
                    <DialogDescription>
                      Assign a BB Agent assistant to a WhatsApp contact
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="contact">WhatsApp Contact</Label>
                      {isLoadingContacts ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="text-sm text-gray-500">Loading contacts...</div>
                        </div>
                      ) : (
                        <Select value={assignmentForm.contact_id} onValueChange={(value) => setAssignmentForm({ ...assignmentForm, contact_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a contact" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableContacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {contact.display_name || contact.push_name || contact.phone_number}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    ({contact.phone_number})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="assistant">BB Agent Assistant</Label>
                      <Select value={assignmentForm.assistant_id} onValueChange={(value) => setAssignmentForm({ ...assignmentForm, assistant_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an assistant" />
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
                    <div className="flex gap-2">
                      <Button onClick={() => setIsAssignDialogOpen(false)} variant="outline">
                        Cancel
                      </Button>
                      <Button onClick={handleCreateAssignment}>
                        Create Assignment
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
                    {filteredAssignments.map((assignment) => (
                      <TableRow key={assignment.conversation_id}>
                        <TableCell className="font-medium">{assignment.display_name}</TableCell>
                        <TableCell>{assignment.phone_number}</TableCell>
                        <TableCell>{assignment.assistant_name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {assignment.assistant_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>{new Date(assignment.assistant_created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interactions Tab */}
          <TabsContent value="interactions" className="space-y-6">
            <h2 className="text-xl font-semibold">Recent AI Interactions</h2>
            
            <Card>
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
                    {interactions.slice(0, 20).map((interaction) => (
                      <TableRow key={interaction.id}>
                        <TableCell className="text-sm">
                          {new Date(interaction.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">{interaction.user_id.slice(0, 8)}...</TableCell>
                        <TableCell className="max-w-md truncate text-sm">
                          {interaction.user_message}
                        </TableCell>
                        <TableCell className="text-sm">
                          {interaction.processing_time_ms ? `${interaction.processing_time_ms}ms` : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {interaction.tokens_used || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={interaction.success ? "default" : "destructive"}>
                            {interaction.success ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {interaction.success ? "Success" : "Failed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold">AI Usage Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recentAnalytics.length > 0 
                          ? Math.round(recentAnalytics.reduce((sum, day) => sum + day.avg_processing_time_ms, 0) / recentAnalytics.length)
                          : 0}ms
                      </p>
                    </div>
                    <Timer className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tokens Used</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recentAnalytics.reduce((sum, day) => sum + day.total_tokens_used, 0).toLocaleString()}
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Unique Users</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recentAnalytics.reduce((sum, day) => sum + day.unique_users, 0)}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Unique Chats</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recentAnalytics.reduce((sum, day) => sum + day.unique_chats, 0)}
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Daily Analytics</CardTitle>
                <CardDescription>Performance metrics over the last 7 days</CardDescription>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAnalytics.map((day) => (
                      <TableRow key={day.id}>
                        <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                        <TableCell>{day.total_interactions}</TableCell>
                        <TableCell>{Math.round(day.avg_processing_time_ms)}ms</TableCell>
                        <TableCell>{day.total_tokens_used.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={day.success_rate >= 90 ? "default" : day.success_rate >= 75 ? "secondary" : "destructive"}>
                            {day.success_rate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{day.unique_users}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

      </div>
    </div>
  )
} 