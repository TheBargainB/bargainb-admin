"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Phone, Mail, Calendar, MapPin, MessageSquare, ShoppingCart, Edit2, Save, X } from "lucide-react"

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
}

interface ContactDetailsModalProps {
  user: CRMUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdate: (updatedUser: CRMUser) => void
}

export function ContactDetailsModal({ user, open, onOpenChange, onUserUpdate }: ContactDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<CRMUser | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = () => {
    setEditedUser(user)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedUser(null)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!editedUser) return
    
    try {
      setIsSaving(true)
      // TODO: Call API to update user
      console.log('Saving user:', editedUser)
      
      // For now, just update locally
      onUserUpdate(editedUser)
      setIsEditing(false)
      setEditedUser(null)
    } catch (error) {
      console.error('Error saving user:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEngagementColor = (status: string) => {
    const colors = {
      highly_active: "bg-green-100 text-green-800",
      active: "bg-blue-100 text-blue-800", 
      dormant: "bg-yellow-100 text-yellow-800",
      churned: "bg-gray-100 text-gray-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getLifecycleColor = (stage: string) => {
    const colors = {
      prospect: "bg-yellow-100 text-yellow-800",
      lead: "bg-orange-100 text-orange-800",
      onboarding: "bg-blue-100 text-blue-800", 
      customer: "bg-green-100 text-green-800",
      vip: "bg-purple-100 text-purple-800",
      churned: "bg-gray-100 text-gray-800",
      blocked: "bg-red-100 text-red-800",
    }
    return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (!user) return null

  const currentUser = isEditing ? editedUser : user

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={currentUser?.profile_picture_url && currentUser.profile_picture_url !== 'removed' 
                    ? currentUser.profile_picture_url 
                    : "/placeholder-user.jpg"} 
                />
                <AvatarFallback>
                  {(currentUser?.full_name || currentUser?.preferred_name || currentUser?.phone_number || '')
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing ? 'Edit Contact Details' : 'Contact Details'}
            </DialogTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} size="sm" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} size="sm">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="full_name"
                      value={editedUser?.full_name || ''}
                      onChange={(e) => setEditedUser(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                      placeholder="Enter full name"
                    />
                  ) : (
                    <p className="text-sm font-medium">{currentUser?.full_name || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="preferred_name">Preferred Name</Label>
                  {isEditing ? (
                    <Input
                      id="preferred_name" 
                      value={editedUser?.preferred_name || ''}
                      onChange={(e) => setEditedUser(prev => prev ? { ...prev, preferred_name: e.target.value } : null)}
                      placeholder="Enter preferred name"
                    />
                  ) : (
                    <p className="text-sm font-medium">{currentUser?.preferred_name || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {currentUser?.phone_number}
                  </p>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedUser?.email || ''}
                      onChange={(e) => setEditedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                      placeholder="Enter email address"
                    />
                  ) : (
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {currentUser?.email || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Status & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Lifecycle Stage</Label>
                {isEditing ? (
                  <Select 
                    value={editedUser?.lifecycle_stage} 
                    onValueChange={(value) => setEditedUser(prev => prev ? { ...prev, lifecycle_stage: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="churned">Churned</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getLifecycleColor(currentUser?.lifecycle_stage || '')}>
                    {currentUser?.lifecycle_stage}
                  </Badge>
                )}
              </div>

              <div>
                <Label>Engagement Status</Label>
                <Badge className={getEngagementColor(currentUser?.engagement_status || '')}>
                  {currentUser?.engagement_status?.replace('_', ' ')}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Conversations</span>
                  <span className="text-sm font-medium">{currentUser?.total_conversations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Messages</span>
                  <span className="text-sm font-medium">{currentUser?.total_messages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Message</span>
                  <span className="text-sm font-medium">{formatDate(currentUser?.last_message_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Customer Since</span>
                  <span className="text-sm font-medium">{formatDate(currentUser?.customer_since)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shopping Profile */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Shopping Persona</Label>
                  {isEditing ? (
                    <Select 
                      value={editedUser?.shopping_persona || ''} 
                      onValueChange={(value) => setEditedUser(prev => prev ? { ...prev, shopping_persona: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select persona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healthHero">Health Hero</SelectItem>
                        <SelectItem value="ecoShopper">Eco Shopper</SelectItem>
                        <SelectItem value="sensitiveStomach">Sensitive Stomach</SelectItem>
                        <SelectItem value="budgetSaver">Budget Saver</SelectItem>
                        <SelectItem value="convenienceShopper">Convenience Shopper</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium">
                      {currentUser?.shopping_persona?.replace(/([A-Z])/g, ' $1').trim() || 'Not set'}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Preferred Stores</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {currentUser?.preferred_stores?.length ? (
                      currentUser.preferred_stores.map((store, index) => (
                        <Badge key={index} variant="outline">
                          {store}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No preferences set</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 