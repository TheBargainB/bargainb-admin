"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Database, Bot, Loader2, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"

interface AdminUser {
  id: string
  email: string
  role: string
  permissions: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
  auth_users?: {
    email: string
    user_metadata?: {
      full_name?: string
      username?: string
      department?: string
    }
  }
}

export default function SettingsPage() {
  const { toast } = useToast()
  
  // Admin user management state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    role: 'admin',
    department: '',
    password: '',
    sendWelcomeEmail: true,
    requirePasswordChange: true,
    enableTwoFA: false,
    permissions: {
      userManagement: false,
      chatManagement: true,
      productManagement: false,
      analyticsAccess: true,
      systemSettings: false,
      apiAccess: false
    }
  })

  // Load admin users
  const loadAdminUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const response = await fetch('/admin/settings/api/admin-users')
      const result = await response.json()

      if (result.success) {
        setAdminUsers(result.data.users)
      } else {
        toast({
          title: "Error loading users",
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading admin users:', error)
      toast({
        title: "Error loading users",
        description: "Failed to load admin users",
        variant: "destructive"
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Create admin user
  const createAdminUser = async (sendInviteOnly = false) => {
    try {
      setIsCreatingUser(true)

      // Basic validation
      if (!formData.fullName.trim()) {
        toast({
          title: "Validation Error",
          description: "Full name is required",
          variant: "destructive"
        })
        return
      }

      if (!formData.email.trim()) {
        toast({
          title: "Validation Error", 
          description: "Email is required",
          variant: "destructive"
        })
        return
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address",
          variant: "destructive"
        })
        return
      }

      // Password validation for non-invite users
      if (!sendInviteOnly && formData.password && formData.password.length < 8) {
        toast({
          title: "Validation Error",
          description: "Password must be at least 8 characters long",
          variant: "destructive"
        })
        return
      }

      const payload = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        fullName: formData.fullName.trim(),
        username: formData.username.trim() || formData.email.split('@')[0],
        password: sendInviteOnly ? '' : formData.password
      }

      const response = await fetch('/admin/settings/api/admin-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: result.data.message
        })

        // Reset form
        setFormData({
          fullName: '',
          username: '',
          email: '',
          role: 'admin',
          department: '',
          password: '',
          sendWelcomeEmail: true,
          requirePasswordChange: true,
          enableTwoFA: false,
          permissions: {
            userManagement: false,
            chatManagement: true,
            productManagement: false,
            analyticsAccess: true,
            systemSettings: false,
            apiAccess: false
          }
        })

        // Reload users list
        await loadAdminUsers()
      } else {
        toast({
          title: "Error creating user",
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating admin user:', error)
      toast({
        title: "Error creating user",
        description: "Failed to create admin user",
        variant: "destructive"
      })
    } finally {
      setIsCreatingUser(false)
    }
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'default'
      case 'admin':
        return 'secondary'
      case 'moderator':
        return 'outline'
      default:
        return 'outline'
    }
  }

  // Load users on mount
  useEffect(() => {
    loadAdminUsers()
  }, [])
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Configure system settings, integrations, and platform preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
              <CardDescription>Basic platform settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="BargainB" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input id="admin-email" type="email" defaultValue="admin@bargainb.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-description">Platform Description</Label>
                <Textarea
                  id="platform-description"
                  defaultValue="AI-powered discount discovery platform helping users find the best deals across multiple stores."
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable maintenance mode to prevent user access</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable detailed logging for troubleshooting</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Configuration</CardTitle>
              <CardDescription>Configure AI behavior, prompts, and response settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ai-model">AI Model</Label>
                <Select defaultValue="gpt-4">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  rows={4}
                  defaultValue="You are a helpful AI assistant for BargainB, a discount discovery platform. Help users find the best deals and answer questions about products and discounts. Be friendly, informative, and concise."
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input id="max-tokens" type="number" defaultValue="500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input id="temperature" type="number" step="0.1" defaultValue="0.7" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-escalation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically escalate complex queries to human agents
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Confidence Threshold</Label>
                  <p className="text-sm text-muted-foreground">Minimum confidence level for AI responses (0.8)</p>
                </div>
                <Input type="number" step="0.1" defaultValue="0.8" className="w-20" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Admin User</CardTitle>
              <CardDescription>Add new authenticated admin users to the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-full-name">Full Name</Label>
                  <Input 
                    id="admin-full-name" 
                    placeholder="John Doe" 
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Username</Label>
                  <Input 
                    id="admin-username" 
                    placeholder="johndoe" 
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email Address</Label>
                <Input 
                  id="admin-email" 
                  type="email" 
                  placeholder="john@bargainb.com" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-role">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-department">Department</Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="customer_support">Customer Support</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Initial Password</Label>
                <Input 
                  id="admin-password" 
                  type="password" 
                  placeholder="Generate secure password" 
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to send invitation email with password setup link
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Send Welcome Email</Label>
                    <p className="text-sm text-muted-foreground">Send account creation notification to user</p>
                  </div>
                  <Switch 
                    checked={formData.sendWelcomeEmail}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendWelcomeEmail: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Password Change</Label>
                    <p className="text-sm text-muted-foreground">Force password change on first login</p>
                  </div>
                  <Switch 
                    checked={formData.requirePasswordChange}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requirePasswordChange: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA setup for this user</p>
                  </div>
                  <Switch 
                    checked={formData.enableTwoFA}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableTwoFA: checked }))}
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">User Management</Label>
                      <p className="text-xs text-muted-foreground">Create, edit, delete users</p>
                    </div>
                    <Switch 
                      checked={formData.permissions.userManagement}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        permissions: { ...prev.permissions, userManagement: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Chat Management</Label>
                      <p className="text-xs text-muted-foreground">Access chat conversations</p>
                    </div>
                    <Switch 
                      checked={formData.permissions.chatManagement}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        permissions: { ...prev.permissions, chatManagement: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Product Management</Label>
                      <p className="text-xs text-muted-foreground">Manage product catalog</p>
                    </div>
                    <Switch 
                      checked={formData.permissions.productManagement}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        permissions: { ...prev.permissions, productManagement: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Analytics Access</Label>
                      <p className="text-xs text-muted-foreground">View reports and analytics</p>
                    </div>
                    <Switch 
                      checked={formData.permissions.analyticsAccess}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        permissions: { ...prev.permissions, analyticsAccess: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">System Settings</Label>
                      <p className="text-xs text-muted-foreground">Modify platform settings</p>
                    </div>
                    <Switch 
                      checked={formData.permissions.systemSettings}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        permissions: { ...prev.permissions, systemSettings: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">API Access</Label>
                      <p className="text-xs text-muted-foreground">Generate and manage API keys</p>
                    </div>
                    <Switch 
                      checked={formData.permissions.apiAccess}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        permissions: { ...prev.permissions, apiAccess: checked }
                      }))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => createAdminUser(false)}
                  disabled={isCreatingUser || !formData.fullName.trim() || !formData.email.trim()}
                >
                  {isCreatingUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Admin User'
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => createAdminUser(true)}
                  disabled={isCreatingUser || !formData.fullName.trim() || !formData.email.trim()}
                >
                  Send Invitation Only
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Admin Users</CardTitle>
              <CardDescription>Manage current admin accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading admin users...</span>
                </div>
              ) : adminUsers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No admin users found</h3>
                  <p className="text-sm text-muted-foreground">Create your first admin user above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adminUsers.map((user) => {
                    const fullName = user.auth_users?.user_metadata?.full_name || 'Admin User'
                    const username = user.auth_users?.user_metadata?.username || user.email.split('@')[0]
                    const department = user.auth_users?.user_metadata?.department
                    
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {getInitials(fullName)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{fullName}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {department && (
                              <p className="text-xs text-muted-foreground">{department}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role === 'super_admin' ? 'Super Admin' : 
                             user.role === 'admin' ? 'Admin' : 
                             user.role === 'moderator' ? 'Moderator' : user.role}
                          </Badge>
                          <Badge variant={user.is_active ? "secondary" : "outline"}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
              <CardDescription>Manage connections to external services and APIs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">HubSpot CRM</h4>
                      <p className="text-sm text-muted-foreground">Lead capture and user management</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Connected</Badge>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Supabase</h4>
                      <p className="text-sm text-muted-foreground">User authentication and database</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Connected</Badge>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Bot className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">OpenAI API</h4>
                      <p className="text-sm text-muted-foreground">AI model for chat assistant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Connected</Badge>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Stripe</h4>
                      <p className="text-sm text-muted-foreground">Payment processing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Not Connected</Badge>
                    <Button size="sm">Connect</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure alerts and notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about system issues</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>User Registration</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new users register</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>ETL Pipeline Status</Label>
                    <p className="text-sm text-muted-foreground">Alerts for data pipeline issues</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Chat Escalations</Label>
                    <p className="text-sm text-muted-foreground">Notify when chats need human intervention</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly analytics summaries</p>
                  </div>
                  <Switch />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input id="notification-email" type="email" defaultValue="admin@bargainb.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                <Input id="slack-webhook" placeholder="https://hooks.slack.com/..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage security policies and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity (minutes)</p>
                  </div>
                  <Input type="number" defaultValue="30" className="w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>IP Whitelist</Label>
                    <p className="text-sm text-muted-foreground">Restrict admin access to specific IPs</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">Log all admin actions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                <Textarea id="allowed-ips" placeholder="192.168.1.1&#10;10.0.0.1&#10;..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Manage API keys, rate limits, and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Production API Key</h4>
                    <p className="text-sm text-muted-foreground font-mono">bb_prod_••••••••••••••••</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm">
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Development API Key</h4>
                    <p className="text-sm text-muted-foreground font-mono">bb_dev_••••••••••••••••</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm">
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rate-limit">Rate Limit (requests/minute)</Label>
                  <Input id="rate-limit" type="number" defaultValue="1000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="burst-limit">Burst Limit</Label>
                  <Input id="burst-limit" type="number" defaultValue="100" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>API Documentation</Label>
                  <p className="text-sm text-muted-foreground">Enable public API documentation</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>CORS Enabled</Label>
                  <p className="text-sm text-muted-foreground">Allow cross-origin requests</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}
