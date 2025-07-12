'use client'

import { memo, useState, useEffect, useMemo } from 'react'
import { 
  Edit3, 
  Save, 
  X, 
  Users, 
  MessageCircle, 
  Clock, 
  Star, 
  MoreVertical, 
  Bot, 
  UserPlus, 
  Settings, 
  TrendingUp, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  ShoppingCart, 
  Heart, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  DollarSign,
  Target,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { ContactService } from '@/lib/ContactService'
import { ChatHelpers } from '@/lib/chat-helpers'
import { BusinessService } from '@/lib/BusinessService'
import { formatPhoneNumber } from '@/lib/api-utils'
import type { Contact, Conversation, CrmProfile } from '@/types/chat-v2.types'

interface AdvancedContactProfileProps {
  contact?: Contact | null
  conversation?: Conversation | null
  is_visible: boolean
  
  // Event handlers
  onCall?: (phoneNumber: string) => void
  onVideoCall?: (phoneNumber: string) => void
  onSendMessage?: () => void
  onEditContact?: (contactId: string, updates: Partial<Contact>) => void
  onBlockContact?: (contactId: string) => void
  onDeleteContact?: (contactId: string) => void
  onAssignAI?: (contactId: string) => void
  
  className?: string
}

interface ContactStats {
  totalConversations: number
  totalMessages: number
  avgResponseTime: number
  lastInteraction: string | null
  engagementScore: number
  lifetimeValue: number
}

interface ActivityItem {
  id: string
  type: 'message' | 'call' | 'ai_interaction' | 'status_change'
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

export const AdvancedContactProfile = memo<AdvancedContactProfileProps>(({
  contact,
  conversation,
  is_visible,
  onCall,
  onVideoCall,
  onSendMessage,
  onEditContact,
  onBlockContact,
  onDeleteContact,
  onAssignAI,
  className
}) => {
  // =============================================================================
  // STATE
  // =============================================================================
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedContact, setEditedContact] = useState<Partial<Contact>>({})
  const [contactStats, setContactStats] = useState<ContactStats | null>(null)
  const [activityHistory, setActivityHistory] = useState<ActivityItem[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isCollapsed, setIsCollapsed] = useState(false)

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const displayName = contact ? ChatHelpers.getContactDisplayName(contact) : 'Unknown Contact'
  const avatarUrl = contact ? ChatHelpers.getContactAvatarUrl(contact) : '/placeholder-user.jpg'
  const initials = contact ? ChatHelpers.getContactInitials(contact) : 'UK'
  const phoneNumber = contact ? formatPhoneNumber(contact.phone_number) : ''
  const isActive = contact ? ChatHelpers.isContactActive(contact) : false
  const statusIndicator = contact ? ChatHelpers.getContactStatusIndicator(contact) : { color: 'gray', text: 'Unknown' }

  const crmProfile = contact?.crm_profile
  const engagementLevel = crmProfile?.engagement_score ? ContactService.getEngagementLevel(crmProfile.engagement_score) : 'unknown'
  const lifecycleStage = crmProfile?.lifecycle_stage || 'prospect'
  const lifecycleColor = ContactService.getLifecycleColor(lifecycleStage)

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    if (contact && is_visible) {
      loadContactStats()
      loadActivityHistory()
    }
  }, [contact, is_visible])

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const loadContactStats = async () => {
    if (!contact) return
    
    setIsLoadingStats(true)
    try {
      const stats = await ContactService.getContactStats(contact.id)
      
      // Calculate additional metrics
      const engagementScore = crmProfile?.engagement_score || 50
      const lifetimeValue = calculateLifetimeValue()
      
      setContactStats({
        ...stats,
        engagementScore,
        lifetimeValue
      })
    } catch (error) {
      console.error('❌ Error loading contact stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const loadActivityHistory = async () => {
    if (!contact) return
    
    try {
      // Mock activity history - in real implementation, fetch from API
      const mockActivity: ActivityItem[] = [
        {
          id: '1',
          type: 'message',
          description: 'Sent message about grocery deals',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        },
        {
          id: '2',
          type: 'ai_interaction',
          description: 'AI assisted with price comparison',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: '3',
          type: 'status_change',
          description: 'Contact status updated to active customer',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        }
      ]
      
      setActivityHistory(mockActivity)
    } catch (error) {
      console.error('❌ Error loading activity history:', error)
    }
  }

  const calculateLifetimeValue = (): number => {
    // Mock calculation - in real implementation, calculate based on purchase history
    const baseValue = 50
    const engagementMultiplier = (crmProfile?.engagement_score || 50) / 100
    const conversationMultiplier = Math.min((contactStats?.totalConversations || 1) / 10, 2)
    
    return Math.round(baseValue * engagementMultiplier * conversationMultiplier)
  }

  const handleEdit = () => {
    if (!contact) return
    setEditedContact({ ...contact })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!contact || !onEditContact) return
    
    try {
      await onEditContact(contact.id, editedContact)
      setIsEditing(false)
      setEditedContact({})
    } catch (error) {
      console.error('❌ Error saving contact:', error)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedContact({})
  }

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const getEngagementColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEngagementIcon = (level: string) => {
    switch (level) {
      case 'high': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'medium': return <Activity className="w-4 h-4 text-blue-600" />
      case 'low': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default: return <Target className="w-4 h-4 text-gray-400" />
    }
  }

  const formatActivityTime = (timestamp: string): string => {
    return ChatHelpers.formatMessageTime(timestamp)
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'message': return <MessageCircle className="w-4 h-4 text-blue-500" />
      case 'call': return <Phone className="w-4 h-4 text-green-500" />
      case 'ai_interaction': return <Bot className="w-4 h-4 text-purple-500" />
      case 'status_change': return <Settings className="w-4 h-4 text-gray-500" />
      default: return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  // =============================================================================
  // RENDER METHODS
  // =============================================================================

  const renderHeader = () => (
    <div className={cn(
      'flex items-start justify-between border-b border-border transition-all duration-200',
      isCollapsed ? 'p-2' : 'p-6'
    )}>
      <div className={cn(
        'flex items-start gap-4',
        isCollapsed && 'flex-col items-center gap-2'
      )}>
        <div className="relative">
          <Avatar className={cn(
            isCollapsed ? 'h-8 w-8' : 'h-16 w-16'
          )}>
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className={cn(
              'font-semibold',
              isCollapsed ? 'text-xs' : 'text-lg'
            )}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div 
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-background',
              isCollapsed ? 'w-2 h-2' : 'w-4 h-4',
              statusIndicator.color === 'green' ? 'bg-green-500' : 'bg-gray-400'
            )}
          />
        </div>
        
        {!isCollapsed && (
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editedContact.display_name || ''}
                  onChange={(e) => setEditedContact(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Display name"
                />
                <Input
                  value={editedContact.phone_number || ''}
                  onChange={(e) => setEditedContact(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-foreground">{displayName}</h3>
                <p className="text-sm text-muted-foreground">{phoneNumber}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={lifecycleStage === 'customer' ? 'default' : 'secondary'}>
                    {lifecycleStage}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {getEngagementIcon(engagementLevel)}
                    <span className="text-xs text-muted-foreground">
                      {engagementLevel} engagement
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isCollapsed && (
          <>
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={handleEdit}>
                  <Edit3 className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onCall?.(contact?.phone_number || '')}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Contact
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAssignAI?.(contact?.id || '')}>
                      <Bot className="w-4 h-4 mr-2" />
                      Assign AI Assistant
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onBlockContact?.(contact?.id || '')}
                      className="text-orange-600"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Block Contact
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteContact?.(contact?.id || '')}
                      className="text-red-600"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Delete Contact
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </>
        )}
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handleToggleCollapse}
          className="p-2"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  )

  const renderQuickActions = () => (
    <div className="p-4 border-b border-border">
      <div className="grid grid-cols-2 gap-2">
        <Button 
          size="sm" 
          onClick={onSendMessage}
          className="justify-start"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Send Message
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onCall?.(contact?.phone_number || '')}
          className="justify-start"
        >
          <Phone className="w-4 h-4 mr-2" />
          Call
        </Button>
      </div>
    </div>
  )

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Engagement Score</p>
              <div className="flex items-center gap-2">
                <Progress 
                  value={contactStats?.engagementScore || 0} 
                  className="flex-1 h-2" 
                />
                <span className={cn(
                  'text-xs font-medium',
                  getEngagementColor(contactStats?.engagementScore || 0)
                )}>
                  {contactStats?.engagementScore || 0}%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Lifetime Value</p>
              <p className="text-sm font-semibold text-green-600">
                €{contactStats?.lifetimeValue || 0}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Messages</p>
              <p className="text-sm font-semibold">
                {contactStats?.totalMessages || 0}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Conversations</p>
              <p className="text-sm font-semibold">
                {contactStats?.totalConversations || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{phoneNumber}</span>
          </div>
          
          {crmProfile?.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{crmProfile.email}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Customer since {ChatHelpers.formatDetailedTime(contact?.created_at || '')}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{statusIndicator.text}</span>
          </div>
        </CardContent>
      </Card>

      {/* Preferences & Tags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Preferences & Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {crmProfile?.tags && crmProfile.tags.length > 0 ? (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {crmProfile.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tags assigned</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderActivityTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activityHistory.length > 0 ? (
              activityHistory.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatActivityTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotesTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add notes about this contact..."
            value={crmProfile?.notes || ''}
            className="min-h-[120px] resize-none"
            readOnly={!isEditing}
          />
          {!isEditing && (
            <Button size="sm" onClick={handleEdit} className="mt-2">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Notes
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // =============================================================================
  // RENDER
  // =============================================================================

  if (!is_visible || !contact) {
    return null
  }

  return (
    <div className={cn(
      'flex flex-col h-full bg-background border-l border-border transition-all duration-200',
      isCollapsed ? 'w-12' : 'w-full',
      className
    )}>
      {/* Header */}
      {renderHeader()}
      
      {/* Only show content when not collapsed */}
      {!isCollapsed && (
        <>
          {/* Quick Actions */}
          {renderQuickActions()}
          
          {/* Content Tabs */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-4 pt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
                </TabsList>
              </div>
              
              <ScrollArea className="flex-1 px-4 pb-4">
                <TabsContent value="overview" className="mt-4">
                  {renderOverviewTab()}
                </TabsContent>
                
                <TabsContent value="activity" className="mt-4">
                  {renderActivityTab()}
                </TabsContent>
                
                <TabsContent value="notes" className="mt-4">
                  {renderNotesTab()}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </>
      )}
    </div>
  )
})

AdvancedContactProfile.displayName = 'AdvancedContactProfile' 