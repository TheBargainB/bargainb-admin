'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Phone,
  Clock,
  MessageCircle,
  CheckCircle
} from 'lucide-react'

export interface ContactProfileData {
  id: string
  authUserId: string
  username: string
  displayName: string
  email: string
  avatarUrl: string
  role: string
  status: string
  lastSeen?: string
  preferences: any
  notificationSettings: any
  profileData: any
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ContactProfileProps {
  user: ContactProfileData
  onClose?: () => void
}

export const ChatUserProfile = ({ user, onClose }: ContactProfileProps) => {
  // Extract phone number from email (WhatsApp format)
  const phoneNumber = user.email?.replace('@s.whatsapp.net', '') || 'Unknown'
  
  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (phone === 'Unknown') return phone
    // Add formatting for better readability
    if (phone.length > 10) {
      return `+${phone.slice(0, -10)} ${phone.slice(-10, -7)} ${phone.slice(-7, -4)} ${phone.slice(-4)}`
    }
    return phone
  }

  // Get initials from display name
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .filter(part => part.length > 0)
      .map((n) => n[0]?.toUpperCase() || '')
      .filter(initial => initial.length > 0)
      .join("")
      .slice(0, 2) || '?'
  }

  // Format last seen time
  const formatLastSeen = (timestamp?: string) => {
    if (!timestamp) return 'Never'
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "online":
      case "active":
        return "bg-green-500 dark:bg-green-400"
      case "away":
        return "bg-yellow-500 dark:bg-yellow-400"
      case "busy":
        return "bg-red-500 dark:bg-red-400"
      default:
        return "bg-muted-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "online":
      case "active":
        return "Online"
      case "away":
        return "Away"
      case "busy":
        return "Busy"
      default:
        return "Offline"
    }
  }

  return (
    <div className="space-y-4">
      {/* Contact Header */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-muted">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
              <AvatarFallback className="text-lg bg-muted text-muted-foreground">
                {getInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg text-foreground">{user.displayName}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1 text-muted-foreground">
                <Phone className="h-3 w-3" />
                {formatPhoneNumber(phoneNumber)}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`} />
                <span className="text-xs text-muted-foreground">
                  {getStatusLabel(user.status)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contact Details */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <User className="h-4 w-4" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium text-foreground">{user.displayName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium text-foreground">{formatPhoneNumber(phoneNumber)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform:</span>
              <Badge variant="outline" className="text-xs border-border">
                <MessageCircle className="h-3 w-3 mr-1" />
                WhatsApp
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={user.status === 'active' || user.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                {user.status === 'active' || user.status === 'online' && <CheckCircle className="h-3 w-3 mr-1" />}
                {getStatusLabel(user.status)}
              </Badge>
            </div>
            
            <Separator className="bg-border" />
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Seen:</span>
              <span className="text-xs flex items-center gap-1 text-foreground">
                <Clock className="h-3 w-3" />
                {formatLastSeen(user.lastSeen)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">First Contact:</span>
              <span className="text-xs text-foreground">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Contact information is read-only</p>
            <p className="text-xs mt-1">Use the chat interface to communicate</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 