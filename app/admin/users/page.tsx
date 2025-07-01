"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus, Download, MessageSquare, ShoppingCart, Users, TrendingUp, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { UserProfileModal } from "./components/UserProfileModal"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

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

type CRMStats = {
  totalUsers: number
  activeUsers: number
  prospects: number
  customers: number
}

// Status color mappings for lifecycle stages
const lifecycleColors = {
  prospect: "bg-yellow-100 text-yellow-800",
  lead: "bg-orange-100 text-orange-800", 
  onboarding: "bg-blue-100 text-blue-800",
  customer: "bg-green-100 text-green-800",
  vip: "bg-purple-100 text-purple-800",
  churned: "bg-gray-100 text-gray-800",
  blocked: "bg-red-100 text-red-800",
}

// Persona color mappings
const personaColors = {
  healthHero: "bg-green-100 text-green-800",
  ecoShopper: "bg-emerald-100 text-emerald-800",
  sensitiveStomach: "bg-pink-100 text-pink-800", 
  budgetSaver: "bg-blue-100 text-blue-800",
  convenienceShopper: "bg-gray-100 text-gray-800",
}

// Engagement status colors
const engagementColors = {
  highly_active: "bg-green-100 text-green-800",
  active: "bg-blue-100 text-blue-800",
  dormant: "bg-yellow-100 text-yellow-800",
  churned: "bg-gray-100 text-gray-800",
}

// Custom debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function CRMUsersPage() {
  const [users, setUsers] = useState<CRMUser[]>([])
  const [stats, setStats] = useState<CRMStats>({ totalUsers: 0, activeUsers: 0, prospects: 0, customers: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [personaFilter, setPersonaFilter] = useState("all")
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Modal states
  const [selectedUser, setSelectedUser] = useState<CRMUser | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<CRMUser | null>(null)
  
  const { toast } = useToast()

  // Memoized fetch function to avoid recreation on every render
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: debouncedSearchTerm,
        status: statusFilter,
        persona: personaFilter,
      })
      
      const response = await fetch(`/admin/users/api?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')
      
      const result = await response.json()
      if (result.success) {
        setUsers(result.data.users)
        setStats(result.data.stats)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error loading customers",
        description: "Failed to load customer data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, statusFilter, personaFilter, toast])

  // Fetch CRM data with debounced search
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Memoized utility functions
  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }, [])

  const formatRelativeTime = useCallback((dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday' 
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }, [])

  // Memoized event handlers
  const handleViewProfile = useCallback((user: CRMUser) => {
    setSelectedUser(user)
    setProfileModalOpen(true)
  }, [])

  const handleDeleteCustomer = useCallback((user: CRMUser) => {
    setCustomerToDelete(user)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleUserUpdate = useCallback((updatedUser: CRMUser) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.contact_id === updatedUser.contact_id ? updatedUser : user
      )
    )
  }, [])

  const handleUserDelete = useCallback(async (userId: string) => {
    const user = users.find(u => u.contact_id === userId)
    if (user) {
      await deleteCustomer(user)
    }
  }, [users])

  const deleteCustomer = useCallback(async (customer: CRMUser) => {
    try {
      setDeletingUserId(customer.contact_id)
      console.log('🗑️ Deleting customer:', customer.contact_id)
      
      const response = await fetch(`/admin/users/api/${customer.contact_id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to delete customer: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Customer deleted successfully')
        
        // Remove from local state
        setUsers(prevUsers => prevUsers.filter(user => user.contact_id !== customer.contact_id))
        
        // Update stats with safer calculations
        setStats(prevStats => {
          const isActiveUser = customer.engagement_status === 'highly_active' || customer.engagement_status === 'active'
          const isProspect = customer.lifecycle_stage === 'prospect'
          const isCustomer = customer.lifecycle_stage === 'customer' || customer.lifecycle_stage === 'vip'
          
          return {
            ...prevStats,
            totalUsers: Math.max(0, prevStats.totalUsers - 1),
            activeUsers: Math.max(0, isActiveUser ? prevStats.activeUsers - 1 : prevStats.activeUsers),
            prospects: Math.max(0, isProspect ? prevStats.prospects - 1 : prevStats.prospects),
            customers: Math.max(0, isCustomer ? prevStats.customers - 1 : prevStats.customers),
          }
        })
        
        toast({
          title: "Customer deleted",
          description: `${customer.full_name || customer.preferred_name || customer.phone_number} has been permanently removed from the CRM.`,
        })
        
        // Refresh data to ensure consistency
        await fetchUsers()
      } else {
        throw new Error(result.error || 'Failed to delete customer')
      }
    } catch (error) {
      console.error('❌ Error deleting customer:', error)
      toast({
        title: "Error deleting customer",
        description: error instanceof Error ? error.message : "Failed to delete the customer. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeletingUserId(null)
    }
  }, [toast, fetchUsers])

  // Memoized filtered users for better performance
  const filteredUsers = useMemo(() => {
    return users // API already handles filtering, but could add client-side sorting here
  }, [users])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">CRM - Customer Management</h2>
          <p className="text-muted-foreground">Manage WhatsApp customers, lifecycle stages, and shopping preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Broadcast
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">WhatsApp contacts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">{stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Prospects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prospects}</div>
            <p className="text-xs text-muted-foreground">Potential customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">Active shoppers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Database</CardTitle>
          <CardDescription>View and manage WhatsApp customer profiles and shopping data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                aria-label="Search customers"
                disabled={loading}
              />
              {searchTerm !== debouncedSearchTerm && (
                <div className="absolute right-2 top-2.5">
                  <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full opacity-60" />
                </div>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lifecycle Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="prospect">Prospects</SelectItem>
                <SelectItem value="lead">Leads</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={personaFilter} onValueChange={setPersonaFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Shopping Persona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Personas</SelectItem>
                <SelectItem value="healthHero">Health Hero</SelectItem>
                <SelectItem value="ecoShopper">Eco Shopper</SelectItem>
                <SelectItem value="sensitiveStomach">Sensitive Stomach</SelectItem>
                <SelectItem value="budgetSaver">Budget Saver</SelectItem>
                <SelectItem value="convenienceShopper">Convenience Shopper</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading customers...</div>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Lifecycle</TableHead>
                  <TableHead>Shopping Persona</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Messages</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.contact_id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewProfile(user)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleViewProfile(user)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for customer ${user.full_name || user.preferred_name || user.phone_number}`}
                  >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
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
                          <div className="font-medium">
                            {user.full_name || user.preferred_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.phone_number}
                          </div>
                          {user.email && (
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          )}
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                      <Badge className={lifecycleColors[user.lifecycle_stage as keyof typeof lifecycleColors] || "bg-gray-100 text-gray-800"}>
                        {user.lifecycle_stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                      {user.shopping_persona ? (
                        <Badge variant="outline" className={personaColors[user.shopping_persona as keyof typeof personaColors] || "bg-gray-100 text-gray-800"}>
                          {user.shopping_persona.replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={engagementColors[user.engagement_status as keyof typeof engagementColors] || "bg-gray-100 text-gray-800"}>
                          {user.engagement_status.replace('_', ' ')}
                    </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{user.total_conversations} conversations</div>
                        <div className="text-muted-foreground">{user.total_messages} messages</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{formatRelativeTime(user.last_message_at)}</div>
                        <div className="text-xs text-muted-foreground">
                          Customer since {formatDate(user.customer_since)}
                        </div>
                      </div>
                  </TableCell>
                  <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewProfile(user)
                        }}
                        className="h-8"
                        disabled={deletingUserId === user.contact_id}
                        aria-label={`View profile for ${user.full_name || user.preferred_name || user.phone_number}`}
                      >
                        {deletingUserId === user.contact_id ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                            Deleting...
                          </div>
                        ) : (
                          "View"
                        )}
                        </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || statusFilter !== "all" || personaFilter !== "all" 
                  ? "No customers found" 
                  : "No customers yet"}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                {searchTerm || statusFilter !== "all" || personaFilter !== "all"
                  ? "Try adjusting your search criteria or filters to find customers."
                  : "Customers will appear here when they interact with your WhatsApp business."}
              </p>
              {(searchTerm || statusFilter !== "all" || personaFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setPersonaFilter("all")
                  }}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        onUserUpdate={handleUserUpdate}
        onUserDelete={handleUserDelete}
      />

      {/* Delete Customer Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Customer
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div>
                Are you sure you want to permanently delete{" "}
                <strong className="font-semibold">
                  {customerToDelete?.full_name || customerToDelete?.preferred_name || customerToDelete?.phone_number}
                </strong>
                ?
              </div>
              
              {customerToDelete && (
                <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                  <div><strong>Phone:</strong> {customerToDelete.phone_number}</div>
                  <div><strong>Lifecycle:</strong> {customerToDelete.lifecycle_stage}</div>
                  <div><strong>Messages:</strong> {customerToDelete.total_messages} messages in {customerToDelete.total_conversations} conversations</div>
                  {customerToDelete.customer_since && (
                    <div><strong>Customer since:</strong> {formatDate(customerToDelete.customer_since)}</div>
                  )}
                </div>
              )}
              
              <div className="space-y-1 text-sm">
                <p className="font-medium text-destructive">This will permanently remove:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Contact information and profile data</li>
                  <li>All conversation history and messages</li>
                  <li>Shopping preferences and lists</li>
                  <li>Customer notes and interaction history</li>
                </ul>
              </div>
              
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-sm font-medium text-destructive">
                  ⚠️ This action cannot be undone
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setCustomerToDelete(null)
                setIsDeleteDialogOpen(false)
              }}
              disabled={deletingUserId === customerToDelete?.contact_id}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (customerToDelete) {
                  await deleteCustomer(customerToDelete);
                  setCustomerToDelete(null);
                  setIsDeleteDialogOpen(false);
                }
              }}
              disabled={deletingUserId === customerToDelete?.contact_id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingUserId === customerToDelete?.contact_id ? (
                <>
                  <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Customer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
