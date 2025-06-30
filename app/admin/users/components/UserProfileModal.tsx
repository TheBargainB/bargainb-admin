"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  MessageSquare, 
  ShoppingCart, 
  FileText, 
  Shield, 
  Phone, 
  MapPin, 
  Calendar,
  TrendingUp,
  Heart,
  Trash2,
  Ban,
  CheckCircle,
  Star,
  Clock
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

type CRMUser = {
  contact_id: string
  phone_number: string
  whatsapp_name: string | null
  full_name: string | null
  preferred_name: string | null
  email: string | null
  lifecycle_stage: string
  shopping_persona: string | null
  preferred_stores: string[]
  engagement_status: string
  last_message_at: string | null
  total_conversations: number
  total_messages: number
  customer_since: string | null
  profile_picture_url?: string | null
  engagement_score?: number
}

type Message = {
  id: string
  content: string
  direction: 'inbound' | 'outbound'
  sender_name: string | null
  created_at: string
}

type GroceryList = {
  id: string
  name: string
  items: any[]
  created_at: string
  status: string
}

type Note = {
  id: string
  content: string
  created_at: string
  author: string
}

interface UserProfileModalProps {
  user: CRMUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdate?: (user: CRMUser) => void
  onUserDelete?: (userId: string) => void
}

export function UserProfileModal({ user, open, onOpenChange, onUserUpdate, onUserDelete }: UserProfileModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<CRMUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setEditedUser({ ...user })
      if (activeTab === "chat" && messages.length === 0) {
        fetchChatHistory()
      }
      if (activeTab === "grocery" && groceryLists.length === 0) {
        fetchGroceryLists()
      }
      if (activeTab === "notes" && notes.length === 0) {
        fetchNotes()
      }
    }
  }, [user, activeTab])

  const fetchChatHistory = async () => {
    if (!user) return
    try {
      setLoading(true)
      const normalizedPhone = user.phone_number.replace('+', '')
      const remoteJid = `${normalizedPhone}@s.whatsapp.net`
      const response = await fetch(`/admin/chat/api/messages?remoteJid=${encodeURIComponent(remoteJid)}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.data?.messages || [])
      }
    } catch (error) {
      console.error('Error fetching chat history:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGroceryLists = async () => {
    // Mock data for now - replace with actual API call
    setGroceryLists([
      {
        id: "1",
        name: "Weekly Shopping",
        items: ["Milk", "Bread", "Eggs", "Bananas"],
        created_at: "2024-01-15T10:00:00Z",
        status: "completed"
      },
      {
        id: "2", 
        name: "Party Supplies",
        items: ["Chips", "Soda", "Cake", "Candles"],
        created_at: "2024-01-20T14:30:00Z",
        status: "pending"
      }
    ])
  }

  const fetchNotes = async () => {
    // Mock data for now - replace with actual API call
    setNotes([
      {
        id: "1",
        content: "Customer prefers organic products",
        created_at: "2024-01-10T09:00:00Z",
        author: "Admin"
      },
      {
        id: "2",
        content: "Requested gluten-free options",
        created_at: "2024-01-15T11:30:00Z", 
        author: "Support"
      }
    ])
  }

  const handleSave = async () => {
    if (!editedUser) return
    try {
      setLoading(true)
      // API call to update user
      const response = await fetch(`/admin/users/api/${editedUser.contact_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedUser)
      })
      
      if (response.ok) {
        onUserUpdate?.(editedUser)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    try {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote,
        created_at: new Date().toISOString(),
        author: "Admin"
      }
      setNotes(prev => [note, ...prev])
      setNewNote("")
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  const handleBlock = async () => {
    if (!user) return
    // Implement block functionality
    console.log('Blocking user:', user.contact_id)
  }

  const handleOpenChat = () => {
    if (!user) return
    // Close modal and navigate to chat page
    onOpenChange(false)
    router.push('/admin/chat')
  }

  const handleDelete = async () => {
    if (!user) return
    onUserDelete?.(user.contact_id)
    onOpenChange(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEngagementColor = (status: string) => {
    switch (status) {
      case 'highly_active': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLifecycleColor = (stage: string) => {
    switch (stage) {
      case 'customer': return 'bg-green-100 text-green-800'
      case 'prospect': return 'bg-yellow-100 text-yellow-800'
      case 'vip': return 'bg-purple-100 text-purple-800'
      case 'blocked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user || !editedUser) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={user.profile_picture_url && user.profile_picture_url !== 'removed' 
                  ? user.profile_picture_url 
                  : "/placeholder-user.jpg"} 
              />
              <AvatarFallback>
                {(user.full_name || user.preferred_name || user.phone_number)
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-semibold">
                {user.full_name || user.preferred_name || 'Unknown Customer'}
              </div>
              <div className="text-sm text-muted-foreground font-normal">
                {user.phone_number}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat History
            </TabsTrigger>
            <TabsTrigger value="grocery" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Grocery Lists
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Actions
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[600px] mt-4">
            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={editedUser.full_name || ''}
                        onChange={(e) => setEditedUser(prev => prev ? {...prev, full_name: e.target.value} : null)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferred_name">Preferred Name</Label>
                      <Input
                        id="preferred_name"
                        value={editedUser.preferred_name || ''}
                        onChange={(e) => setEditedUser(prev => prev ? {...prev, preferred_name: e.target.value} : null)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedUser.email || ''}
                        onChange={(e) => setEditedUser(prev => prev ? {...prev, email: e.target.value} : null)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={editedUser.phone_number}
                        disabled
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Customer Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="lifecycle_stage">Lifecycle Stage</Label>
                      <Select
                        value={editedUser.lifecycle_stage}
                        onValueChange={(value) => setEditedUser(prev => prev ? {...prev, lifecycle_stage: value} : null)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="churned">Churned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="shopping_persona">Shopping Persona</Label>
                      <Select
                        value={editedUser.shopping_persona || ''}
                        onValueChange={(value) => setEditedUser(prev => prev ? {...prev, shopping_persona: value} : null)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select persona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="healthHero">Health Hero</SelectItem>
                          <SelectItem value="ecoShopper">Eco Shopper</SelectItem>
                          <SelectItem value="budgetSaver">Budget Saver</SelectItem>
                          <SelectItem value="convenienceShopper">Convenience Shopper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Engagement Status</Label>
                        <div className="mt-1">
                          <Badge className={getEngagementColor(editedUser.engagement_status)}>
                            {editedUser.engagement_status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label>Lifecycle Stage</Label>
                        <div className="mt-1">
                          <Badge className={getLifecycleColor(editedUser.lifecycle_stage)}>
                            {editedUser.lifecycle_stage}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label>Engagement Score</Label>
                        <div className="mt-1">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-semibold">{user.engagement_score || 0}/100</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${user.engagement_score || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Activity Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Total Conversations</Label>
                        <div className="text-2xl font-bold">{user.total_conversations}</div>
                      </div>
                      <div>
                        <Label>Total Messages</Label>
                        <div className="text-2xl font-bold">{user.total_messages}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Customer Since</Label>
                        <div className="text-sm font-medium">{user.customer_since ? formatDate(user.customer_since) : 'Unknown'}</div>
                      </div>
                    </div>
                    <div>
                      <Label>Last Message</Label>
                      <div className="text-sm text-muted-foreground">
                        {user.last_message_at 
                          ? formatDistanceToNow(new Date(user.last_message_at), { addSuffix: true })
                          : 'No messages yet'
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Preferred Stores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Preferred Stores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.preferred_stores?.length > 0 ? (
                        user.preferred_stores.map((store, index) => (
                          <Badge key={index} variant="outline">{store}</Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No preferred stores set</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Chat History</CardTitle>
                  <CardDescription>
                    Recent messages with {user.full_name || user.preferred_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading messages...</div>
                  ) : messages.length > 0 ? (
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.direction === 'outbound'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <div className="text-sm">{message.content}</div>
                              <div className={`text-xs mt-1 ${
                                message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {message.sender_name} • {formatDate(message.created_at)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No messages found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grocery" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Grocery Lists</CardTitle>
                  <CardDescription>
                    Shopping lists created by {user.full_name || user.preferred_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {groceryLists.length > 0 ? (
                    <div className="space-y-4">
                      {groceryLists.map((list) => (
                        <Card key={list.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{list.name}</CardTitle>
                              <Badge variant={list.status === 'completed' ? 'default' : 'secondary'}>
                                {list.status}
                              </Badge>
                            </div>
                            <CardDescription>
                              Created {formatDate(list.created_at)} • {list.items.length} items
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {list.items.map((item, index) => (
                                <Badge key={index} variant="outline">{item}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No grocery lists found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Notes</CardTitle>
                  <CardDescription>
                    Internal notes about {user.full_name || user.preferred_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      Add Note
                    </Button>
                  </div>
                  <Separator />
                  {notes.length > 0 ? (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <Card key={note.id}>
                          <CardContent className="pt-4">
                            <div className="text-sm">{note.content}</div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {note.author} • {formatDate(note.created_at)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No notes added yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Customer Actions
                  </CardTitle>
                  <CardDescription>
                    Manage customer account and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <Button variant="outline" className="justify-start" onClick={handleOpenChat}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Open Chat Conversation
                    </Button>
                    <Separator />
                    <Button 
                      variant="outline" 
                      className="justify-start text-orange-600 hover:text-orange-700"
                      onClick={handleBlock}
                    >
                      {user.lifecycle_stage === 'blocked' ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Unblock Customer
                        </>
                      ) : (
                        <>
                          <Ban className="mr-2 h-4 w-4" />
                          Block Customer
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start text-red-600 hover:text-red-700"
                      onClick={handleDelete}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Customer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 