'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  User, 
  Phone,
  Clock,
  MessageCircle,
  CheckCircle,
  Mail,
  Calendar,
  ShoppingCart,
  Heart,
  Tag,
  TrendingUp,
  Star,
  Activity,
  Bot,
  ChefHat,
  Database,
  DollarSign,
  Target,
  Timer,
  Utensils,
  Receipt,
  Calendar as CalendarIcon,
  Settings,
  BarChart3,
  AlertCircle,
  FileText
} from 'lucide-react'

interface Contact {
  id: string
  phone_number: string
  jid?: string
  display_name?: string
  is_business?: boolean
  is_verified?: boolean
  profile_picture_url?: string | null
  status?: string
  last_seen?: string
  created_at: string
  updated_at: string
}

interface CrmProfile {
  id: string
  full_name?: string
  preferred_name?: string
  email?: string
  lifecycle_stage?: string
  customer_since?: string
  preferred_stores?: string[]
  shopping_persona?: string
  dietary_restrictions?: string[]
  budget_range?: string
  shopping_frequency?: string
  engagement_score?: string
  total_conversations?: number
  total_messages?: number
  communication_style?: string
  product_interests?: string[]
  price_sensitivity?: string
  tags?: string[]
  notes?: string
}

interface GroceryList {
  id: string
  list_name: string
  products: any[]
  estimated_total: string
  preferred_store?: string
  shopping_date?: string
  status: string
  created_at: string
}

interface MealPlan {
  id: string
  plan_name: string
  meal_date: string
  meal_type: string
  recipe_id?: string
  custom_meal_name?: string
  planned_servings: number
  is_completed: boolean
  recipes?: {
    id: string
    name: string
    description?: string
    prep_time_minutes?: number
    difficulty_level?: string
    dietary_tags?: string[]
  }
}

interface BudgetPeriod {
  id: string
  period_name: string
  period_type: string
  start_date: string
  end_date: string
  total_budget: string
  total_spent: string
  currency: string
  is_active: boolean
}

interface UserData {
  contact: {
    whatsapp: Contact
    crm: CrmProfile | null
  }
  aiConfig: {
    conversation: {
      ai_enabled: boolean
      ai_config: any
      assistant_config: any
      assistant_name?: string
    }
    interactions: any[]
    stats: {
      total_interactions: number
      avg_response_time: number
      success_rate: number
    }
  }
  meals: {
    meal_plans: MealPlan[]
    recipes: any[]
    stats: {
      total_meal_plans: number
      completed_meals: number
      custom_recipes: number
    }
  }
  data: {
    grocery_lists: GroceryList[]
    budget: {
      periods: BudgetPeriod[]
      expenses: any[]
      savings_goals: any[]
    }
    activity: any[]
    stats: {
      active_grocery_lists: number
      total_budget: number
      total_spent: number
      recent_events: number
    }
  }
}

interface ChatUserProfileProps {
  conversationId: string
}

export function ChatUserProfile({ conversationId }: ChatUserProfileProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = async () => {
    if (!conversationId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/admin/chat/api/conversations/${conversationId}/enhanced-contact`)
      const result = await response.json()
      
      if (result.success) {
        setUserData(result.data)
      } else {
        setError(result.error || 'Failed to load user data')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [conversationId])

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !userData) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No User Data</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error || 'Select a conversation to view user information'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const contact = userData.contact.whatsapp
  const crm = userData.contact.crm
  const displayName = crm?.preferred_name || crm?.full_name || contact.display_name || 'Unknown'
  const avatarFallback = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={contact.profile_picture_url || undefined} alt={displayName} />
            <AvatarFallback className="text-lg bg-muted text-muted-foreground">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-semibold truncate">{displayName}</h3>
              {contact.is_verified && (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
              {contact.is_business && (
                <Badge variant="secondary" className="text-xs">
                  Business
                </Badge>
              )}
            </div>
            
            {crm?.full_name && crm.full_name !== displayName && (
              <p className="text-sm text-muted-foreground mb-1">{crm.full_name}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>{contact.phone_number}</span>
              </span>
              {crm?.email && (
                <span className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{crm.email}</span>
                </span>
              )}
            </div>

            {/* Status and Engagement */}
            <div className="flex items-center space-x-4 mt-3">
              <Badge variant={crm?.lifecycle_stage === 'customer' ? 'default' : 'secondary'}>
                {crm?.lifecycle_stage || 'Contact'}
              </Badge>
              
              {crm?.engagement_score && (
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">{crm.engagement_score}</span>
                </div>
              )}
              
              {contact.status && (
                <Badge variant="outline" className={
                  contact.status === 'online' ? 'border-green-500 text-green-700' : 'border-muted'
                }>
                  {contact.status}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <MessageCircle className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">{crm?.total_messages || 0}</p>
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">{userData.data?.stats?.active_grocery_lists || 0}</p>
              <p className="text-xs text-muted-foreground">Active Lists</p>
            </div>
          </div>
        </div>

        {/* Preferred Stores */}
        {crm?.preferred_stores && crm.preferred_stores.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Preferred Stores</h4>
            <div className="flex flex-wrap gap-1">
              {crm.preferred_stores.map((store, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {store}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Dietary Restrictions */}
        {crm?.dietary_restrictions && crm.dietary_restrictions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Dietary Restrictions</h4>
            <div className="flex flex-wrap gap-1">
              {crm.dietary_restrictions.map((restriction, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                  {restriction}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Full Details Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              View Complete Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={contact.profile_picture_url || undefined} />
                  <AvatarFallback className="text-sm">{avatarFallback}</AvatarFallback>
                </Avatar>
                <span>{displayName} - Complete Profile & AI Data</span>
              </DialogTitle>
              <DialogDescription>
                Comprehensive view of user data, AI configuration, meals, and activity
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-[70vh] mt-4 pr-4">
              <div className="space-y-8">
                {/* Contact Information Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Contact Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <User className="w-5 h-5" />
                          <span>Basic Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                          <p className="text-sm">{contact.display_name || 'N/A'}</p>
                        </div>
                        {crm?.full_name && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                            <p className="text-sm">{crm.full_name}</p>
                          </div>
                        )}
                        {crm?.preferred_name && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Preferred Name</label>
                            <p className="text-sm">{crm.preferred_name}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                          <p className="text-sm">{contact.phone_number}</p>
                        </div>
                        {crm?.email && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p className="text-sm">{crm.email}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Customer Since</label>
                          <p className="text-sm">
                            {crm?.customer_since 
                              ? new Date(crm.customer_since).toLocaleDateString()
                              : new Date(contact.created_at).toLocaleDateString()
                            }
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* CRM Details */}
                    {crm && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5" />
                            <span>CRM Profile</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Lifecycle Stage</label>
                            <Badge className="ml-2">{crm.lifecycle_stage || 'N/A'}</Badge>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Engagement Score</label>
                            <p className="text-sm">{crm.engagement_score || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Shopping Persona</label>
                            <p className="text-sm">{crm.shopping_persona || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Budget Range</label>
                            <p className="text-sm">{crm.budget_range || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Shopping Frequency</label>
                            <p className="text-sm">{crm.shopping_frequency || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Price Sensitivity</label>
                            <p className="text-sm">{crm.price_sensitivity || 'N/A'}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Tags and Notes */}
                  {crm && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {crm.tags && crm.tags.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <Tag className="w-5 h-5" />
                              <span>Tags</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {crm.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {crm.notes && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Notes</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{crm.notes}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* AI Configuration Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Bot className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">AI Assistant Configuration</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Bot className="w-5 h-5" />
                          <span>AI Assistant Status</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">AI Enabled</label>
                          <Badge className={`ml-2 ${userData.aiConfig.conversation.ai_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {userData.aiConfig.conversation.ai_enabled ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        {userData.aiConfig.conversation.assistant_name && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Assistant Name</label>
                            <p className="text-sm">{userData.aiConfig.conversation.assistant_name}</p>
                          </div>
                        )}
                        {userData.aiConfig.conversation.ai_config && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Auto Respond</label>
                            <Badge className={`ml-2 ${userData.aiConfig.conversation.ai_config.auto_respond ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {userData.aiConfig.conversation.ai_config.auto_respond ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* AI Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Activity className="w-5 h-5" />
                          <span>AI Interaction Stats</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Total Interactions</label>
                          <p className="text-sm font-semibold">{userData.aiConfig?.stats?.total_interactions || 0}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Success Rate</label>
                          <p className="text-sm font-semibold">{userData.aiConfig?.stats?.success_rate?.toFixed(1) || 0}%</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Avg Response Time</label>
                          <p className="text-sm font-semibold">{userData.aiConfig?.stats?.avg_response_time ? (userData.aiConfig.stats.avg_response_time / 1000).toFixed(2) : 0}s</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent AI Interactions */}
                  {userData.aiConfig?.interactions?.length > 0 && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="text-lg">Recent AI Interactions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {userData.aiConfig.interactions.slice(0, 5).map((interaction) => (
                            <div key={interaction.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant={interaction.success ? 'default' : 'destructive'}>
                                  {interaction.success ? 'Success' : 'Failed'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(interaction.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                <strong>User:</strong> {interaction.user_message?.substring(0, 100)}...
                              </p>
                              <p className="text-sm">
                                <strong>AI:</strong> {interaction.ai_response?.substring(0, 100)}...
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Separator />

                {/* Meals & Recipes Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <ChefHat className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Meals & Recipes</h2>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="flex items-center space-x-2 p-4">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{userData.meals?.stats?.total_meal_plans || 0}</p>
                          <p className="text-xs text-muted-foreground">Total Plans</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex items-center space-x-2 p-4">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">{userData.meals?.stats?.completed_meals || 0}</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex items-center space-x-2 p-4">
                        <ChefHat className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium">{userData.meals?.stats?.custom_recipes || 0}</p>
                          <p className="text-xs text-muted-foreground">Custom Recipes</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Meal Plans */}
                  {userData.meals?.meal_plans?.length > 0 && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Utensils className="w-5 h-5" />
                          <span>Recent Meal Plans</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {userData.meals.meal_plans.slice(0, 5).map((plan) => (
                            <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="text-sm font-medium">
                                  {plan.recipes?.name || plan.custom_meal_name || 'Unnamed Meal'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(plan.meal_date).toLocaleDateString()} • {plan.meal_type} • {plan.planned_servings} servings
                                </p>
                                {plan.recipes?.dietary_tags && plan.recipes.dietary_tags.length > 0 && (
                                  <div className="flex space-x-1 mt-1">
                                    {plan.recipes.dietary_tags.map((tag, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Badge variant={plan.is_completed ? 'default' : 'secondary'}>
                                {plan.is_completed ? 'Completed' : 'Planned'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Custom Recipes */}
                  {userData.meals?.recipes?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <ChefHat className="w-5 h-5" />
                          <span>Custom Recipes</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {userData.meals.recipes.slice(0, 3).map((recipe) => (
                            <div key={recipe.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium">{recipe.name}</h4>
                                <Badge variant="outline">{recipe.difficulty_level || 'medium'}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {recipe.description?.substring(0, 150)}...
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                {recipe.prep_time_minutes && (
                                  <span className="flex items-center space-x-1">
                                    <Timer className="w-3 h-3" />
                                    <span>{recipe.prep_time_minutes}m prep</span>
                                  </span>
                                )}
                                {recipe.servings && (
                                  <span>{recipe.servings} servings</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Separator />

                {/* Data & Activity Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Database className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Shopping Data & Activity</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="flex items-center space-x-2 p-4">
                        <ShoppingCart className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">{userData.data?.stats?.active_grocery_lists || 0}</p>
                          <p className="text-xs text-muted-foreground">Active Lists</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex items-center space-x-2 p-4">
                        <DollarSign className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">€{userData.data?.stats?.total_budget || 0}</p>
                          <p className="text-xs text-muted-foreground">Total Budget</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex items-center space-x-2 p-4">
                        <Receipt className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="text-sm font-medium">€{userData.data?.stats?.total_spent || 0}</p>
                          <p className="text-xs text-muted-foreground">Total Spent</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex items-center space-x-2 p-4">
                        <Activity className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="text-sm font-medium">{userData.data?.stats?.recent_events || 0}</p>
                          <p className="text-xs text-muted-foreground">Recent Events</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Active Grocery Lists */}
                  {userData.data?.grocery_lists?.length > 0 && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <ShoppingCart className="w-5 h-5" />
                          <span>Active Grocery Lists</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {userData.data.grocery_lists.filter(list => list.status === 'active').slice(0, 3).map((list) => (
                            <div key={list.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium">{list.list_name}</h4>
                                <Badge variant="outline">€{list.estimated_total}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {list.products.length} items • {list.preferred_store || 'No store preference'}
                              </p>
                              {list.shopping_date && (
                                <p className="text-xs text-muted-foreground">
                                  Planned for: {new Date(list.shopping_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Budget Overview */}
                  {userData.data?.budget?.periods?.length > 0 && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Target className="w-5 h-5" />
                          <span>Budget Overview</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {userData.data.budget.periods.slice(0, 2).map((period) => {
                          const totalBudget = parseFloat(period.total_budget) || 0
                          const totalSpent = parseFloat(period.total_spent) || 0
                          const spentPercentage = totalBudget > 0 
                            ? (totalSpent / totalBudget) * 100 
                            : 0
                         
                         return (
                           <div key={period.id} className="border rounded-lg p-3 mb-3">
                             <div className="flex items-center justify-between mb-2">
                               <h4 className="text-sm font-medium">{period.period_name}</h4>
                               <Badge variant={period.is_active ? 'default' : 'secondary'}>
                                 {period.is_active ? 'Active' : 'Inactive'}
                               </Badge>
                             </div>
                             <div className="space-y-1">
                               <div className="flex justify-between text-xs">
                                 <span>Budget: €{period.total_budget}</span>
                                 <span>Spent: €{period.total_spent}</span>
                               </div>
                               <div className="w-full bg-muted rounded-full h-2">
                                 <div 
                                   className={`h-2 rounded-full ${spentPercentage > 90 ? 'bg-red-500' : spentPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                   style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                                 ></div>
                               </div>
                               <p className="text-xs text-muted-foreground">
                                 {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                               </p>
                             </div>
                           </div>
                         )
                       })}
                      </CardContent>
                    </Card>
                  )}

                  {/* Recent Activity */}
                  {userData.data?.activity?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Activity className="w-5 h-5" />
                          <span>Recent Activity</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {userData.data.activity.slice(0, 5).map((event) => (
                            <div key={event.id} className="flex items-start space-x-3 p-2 border-l-2 border-primary/20 pl-3">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{event.event_type.replace(/_/g, ' ').toUpperCase()}</p>
                                <p className="text-xs text-muted-foreground">{event.event_description}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(event.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
} 