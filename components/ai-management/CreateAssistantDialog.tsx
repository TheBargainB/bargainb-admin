'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bot, 
  Plus, 
  Loader2, 
  User, 
  Settings, 
  Zap, 
  Brain,
  Globe,
  ShoppingCart,
  DollarSign,
  Clock,
  Shield,
  Edit
} from 'lucide-react'
import { CreateAssistantData, BBAssistant } from '@/types/ai-management.types'

interface CreateAssistantDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: CreateAssistantData) => Promise<void>
  // New props for edit mode
  editMode?: boolean
  assistant?: BBAssistant | null
  onUpdate?: (assistantId: string, data: CreateAssistantData) => Promise<void>
}

interface AssistantConfiguration {
  // Basic Info
  name: string
  description: string
  recursion_limit: number
  
  // User Preferences
  user_preferences: {
    budget_limit: number
    dietary_restrictions: string[]
    preferred_stores: string[]
    language: string
    region: string
  }
  
  // AI Behavior
  ai_behavior: {
    response_style: 'concise' | 'detailed' | 'friendly'
    price_sensitivity: 'budget' | 'balanced' | 'premium'
    health_focus: boolean
    tone: 'professional' | 'friendly' | 'casual'
    expertise_level: 'beginner' | 'intermediate' | 'expert'
  }
  
  // Capabilities
  capabilities: {
    recipes: boolean
    nutrition: boolean
    meal_planning: boolean
    budget_tracking: boolean
    cultural_cuisine: boolean
    store_recommendations: boolean
    price_comparison: boolean
    delivery_options: boolean
  }
  
  // Advanced Settings
  advanced: {
    guard_rails_enabled: boolean
    max_message_length: number
    max_tokens_per_request: number
    request_timeout: number
    temperature: number
    custom_instructions: string
  }
}

// Default configuration
const getDefaultConfig = (): AssistantConfiguration => ({
  name: '',
  description: '',
  recursion_limit: 25,
  user_preferences: {
    budget_limit: 100,
    dietary_restrictions: [],
    preferred_stores: ['Albert Heijn', 'Jumbo', 'Dirk'],
    language: 'dutch',
    region: 'netherlands'
  },
  ai_behavior: {
    response_style: 'friendly',
    price_sensitivity: 'balanced',
    health_focus: true,
    tone: 'friendly',
    expertise_level: 'expert'
  },
  capabilities: {
    recipes: true,
    nutrition: true,
    meal_planning: true,
    budget_tracking: true,
    cultural_cuisine: true,
    store_recommendations: true,
    price_comparison: true,
    delivery_options: true
  },
  advanced: {
    guard_rails_enabled: true,
    max_message_length: 500,
    max_tokens_per_request: 4000,
    request_timeout: 30,
    temperature: 0.7,
    custom_instructions: ''
  }
})

export const CreateAssistantDialog = ({
  isOpen,
  onClose,
  onCreate,
  editMode = false,
  assistant = null,
  onUpdate
}: CreateAssistantDialogProps) => {
  const [config, setConfig] = useState<AssistantConfiguration>(getDefaultConfig())
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [newDietaryRestriction, setNewDietaryRestriction] = useState('')

  // Load assistant data when in edit mode
  useEffect(() => {
    if (editMode && assistant && isOpen) {
      try {
        // Parse the existing configurable JSON
        const existingConfig = assistant.config?.configurable ? JSON.parse(assistant.config.configurable) : {}
        
        setConfig({
          name: assistant.name || '',
          description: assistant.description || '',
          recursion_limit: assistant.config?.recursion_limit || 25,
          user_preferences: {
            budget_limit: existingConfig.user_preferences?.budget_limit || 100,
            dietary_restrictions: existingConfig.user_preferences?.dietary_restrictions || [],
            preferred_stores: existingConfig.user_preferences?.preferred_stores || ['Albert Heijn', 'Jumbo', 'Dirk'],
            language: existingConfig.user_preferences?.language || 'dutch',
            region: existingConfig.user_preferences?.region || 'netherlands'
          },
          ai_behavior: {
            response_style: existingConfig.ai_behavior?.response_style || 'friendly',
            price_sensitivity: existingConfig.ai_behavior?.price_sensitivity || 'balanced',
            health_focus: existingConfig.ai_behavior?.health_focus !== undefined ? existingConfig.ai_behavior.health_focus : true,
            tone: existingConfig.ai_behavior?.tone || 'friendly',
            expertise_level: existingConfig.ai_behavior?.expertise_level || 'expert'
          },
          capabilities: {
            recipes: existingConfig.capabilities?.recipes !== undefined ? existingConfig.capabilities.recipes : true,
            nutrition: existingConfig.capabilities?.nutrition !== undefined ? existingConfig.capabilities.nutrition : true,
            meal_planning: existingConfig.capabilities?.meal_planning !== undefined ? existingConfig.capabilities.meal_planning : true,
            budget_tracking: existingConfig.capabilities?.budget_tracking !== undefined ? existingConfig.capabilities.budget_tracking : true,
            cultural_cuisine: existingConfig.capabilities?.cultural_cuisine !== undefined ? existingConfig.capabilities.cultural_cuisine : true,
            store_recommendations: existingConfig.capabilities?.store_recommendations !== undefined ? existingConfig.capabilities.store_recommendations : true,
            price_comparison: existingConfig.capabilities?.price_comparison !== undefined ? existingConfig.capabilities.price_comparison : true,
            delivery_options: existingConfig.capabilities?.delivery_options !== undefined ? existingConfig.capabilities.delivery_options : true
          },
          advanced: {
            guard_rails_enabled: existingConfig.advanced?.guard_rails_enabled !== undefined ? existingConfig.advanced.guard_rails_enabled : true,
            max_message_length: existingConfig.advanced?.max_message_length || 500,
            max_tokens_per_request: existingConfig.advanced?.max_tokens_per_request || 4000,
            request_timeout: existingConfig.advanced?.request_timeout || 30,
            temperature: existingConfig.advanced?.temperature !== undefined ? existingConfig.advanced.temperature : 0.7,
            custom_instructions: existingConfig.advanced?.custom_instructions || ''
          }
        })
      } catch (error) {
        console.error('Error parsing assistant configuration:', error)
        // Fall back to default config if parsing fails
        setConfig(getDefaultConfig())
      }
    } else if (!editMode && isOpen) {
      // Reset to default when creating new assistant
      setConfig(getDefaultConfig())
    }
  }, [editMode, assistant, isOpen])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!config.name.trim()) {
      newErrors.name = 'Assistant name is required'
    }
    
    if (config.recursion_limit < 1 || config.recursion_limit > 100) {
      newErrors.recursion_limit = 'Recursion limit must be between 1 and 100'
    }
    
    if (config.user_preferences.budget_limit < 10) {
      newErrors.budget_limit = 'Budget limit must be at least €10'
    }
    
    if (config.advanced.temperature < 0 || config.advanced.temperature > 1) {
      newErrors.temperature = 'Temperature must be between 0 and 1'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      // Convert our form data to the format expected by the API
      const formData: CreateAssistantData = {
        name: config.name,
        description: config.description,
        recursion_limit: config.recursion_limit,
        configurable: JSON.stringify({
          user_preferences: config.user_preferences,
          ai_behavior: config.ai_behavior,
          capabilities: config.capabilities,
          advanced: config.advanced
        })
      }
      
      if (editMode && assistant && onUpdate) {
        await onUpdate(assistant.assistant_id, formData)
      } else {
        await onCreate(formData)
      }
      
      handleClose()
    } catch (error) {
      console.error(`Failed to ${editMode ? 'update' : 'create'} assistant:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!editMode) {
      setConfig(getDefaultConfig())
    }
    setErrors({})
    setNewDietaryRestriction('')
    onClose()
  }

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const keys = path.split('.')
      const newConfig = { ...prev }
      let current = newConfig as any
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newConfig
    })
    
    // Clear error for this field
    if (errors[path]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[path]
        return newErrors
      })
    }
  }

  const addDietaryRestriction = () => {
    if (newDietaryRestriction.trim()) {
      updateConfig('user_preferences.dietary_restrictions', [
        ...config.user_preferences.dietary_restrictions,
        newDietaryRestriction.trim()
      ])
      setNewDietaryRestriction('')
    }
  }

  const removeDietaryRestriction = (index: number) => {
    updateConfig('user_preferences.dietary_restrictions', 
      config.user_preferences.dietary_restrictions.filter((_, i) => i !== index)
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            {editMode ? (
              <Edit className="h-6 w-6 text-blue-600" />
            ) : (
              <Bot className="h-6 w-6 text-blue-600" />
            )}
            <div>
              <DialogTitle className="text-xl">
                {editMode ? `Edit Assistant: ${assistant?.name || 'Unknown'}` : 'Create New Assistant'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {editMode 
                  ? 'Modify the configuration of this BB Agent assistant'
                  : 'Configure a new BB Agent assistant with advanced settings'
                }
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic" className="gap-2">
                <Settings className="h-4 w-4" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <User className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="behavior" className="gap-2">
                <Brain className="h-4 w-4" />
                Behavior
              </TabsTrigger>
              <TabsTrigger value="capabilities" className="gap-2">
                <Zap className="h-4 w-4" />
                Capabilities
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2">
                <Shield className="h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Basic Settings */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Assistant Name *</Label>
                      <Input
                        id="name"
                        value={config.name}
                        onChange={(e) => updateConfig('name', e.target.value)}
                        placeholder="e.g., Dutch Food Helper"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="recursion_limit">Recursion Limit</Label>
                      <Input
                        id="recursion_limit"
                        type="number"
                        min="1"
                        max="100"
                        value={config.recursion_limit}
                        onChange={(e) => updateConfig('recursion_limit', parseInt(e.target.value) || 25)}
                        className={errors.recursion_limit ? 'border-red-500' : ''}
                      />
                      {errors.recursion_limit && (
                        <p className="text-sm text-red-500">{errors.recursion_limit}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={config.description}
                      onChange={(e) => updateConfig('description', e.target.value)}
                      placeholder="Brief description of what this assistant does..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Preferences */}
            <TabsContent value="preferences">
              <ScrollArea className="h-[400px]">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      User Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={config.user_preferences.language}
                          onValueChange={(value) => updateConfig('user_preferences.language', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dutch">Dutch</SelectItem>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Select
                          value={config.user_preferences.region}
                          onValueChange={(value) => updateConfig('user_preferences.region', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="netherlands">Netherlands</SelectItem>
                            <SelectItem value="belgium">Belgium</SelectItem>
                            <SelectItem value="germany">Germany</SelectItem>
                            <SelectItem value="france">France</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget_limit">Budget Limit (€)</Label>
                      <Input
                        id="budget_limit"
                        type="number"
                        min="10"
                        value={config.user_preferences.budget_limit}
                        onChange={(e) => updateConfig('user_preferences.budget_limit', parseInt(e.target.value) || 100)}
                        className={errors.budget_limit ? 'border-red-500' : ''}
                      />
                      {errors.budget_limit && (
                        <p className="text-sm text-red-500">{errors.budget_limit}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Stores</Label>
                      <div className="flex flex-wrap gap-2">
                        {config.user_preferences.preferred_stores.map((store, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            <ShoppingCart className="h-3 w-3" />
                            {store}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Dietary Restrictions</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newDietaryRestriction}
                          onChange={(e) => setNewDietaryRestriction(e.target.value)}
                          placeholder="Add dietary restriction..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDietaryRestriction())}
                        />
                        <Button type="button" onClick={addDietaryRestriction} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {config.user_preferences.dietary_restrictions.map((restriction, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-red-50"
                            onClick={() => removeDietaryRestriction(index)}
                          >
                            {restriction} ✕
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>

            {/* AI Behavior */}
            <TabsContent value="behavior">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Behavior
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Response Style</Label>
                      <Select
                        value={config.ai_behavior.response_style}
                        onValueChange={(value: any) => updateConfig('ai_behavior.response_style', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concise">Concise</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Price Sensitivity</Label>
                      <Select
                        value={config.ai_behavior.price_sensitivity}
                        onValueChange={(value: any) => updateConfig('ai_behavior.price_sensitivity', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="budget">Budget-Focused</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tone</Label>
                      <Select
                        value={config.ai_behavior.tone}
                        onValueChange={(value: any) => updateConfig('ai_behavior.tone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Expertise Level</Label>
                      <Select
                        value={config.ai_behavior.expertise_level}
                        onValueChange={(value: any) => updateConfig('ai_behavior.expertise_level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Health Focus</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prioritize healthy food options and nutritional advice
                      </p>
                    </div>
                    <Switch
                      checked={config.ai_behavior.health_focus}
                      onCheckedChange={(checked) => updateConfig('ai_behavior.health_focus', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Capabilities */}
            <TabsContent value="capabilities">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Assistant Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(config.capabilities).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label className="text-sm font-medium capitalize">
                            {key.replace(/_/g, ' ')}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getCapabilityDescription(key)}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => updateConfig(`capabilities.${key}`, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced">
              <ScrollArea className="h-[400px]">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Advanced Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Guard Rails</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enable safety guardrails for AI responses
                        </p>
                      </div>
                      <Switch
                        checked={config.advanced.guard_rails_enabled}
                        onCheckedChange={(checked) => updateConfig('advanced.guard_rails_enabled', checked)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Max Message Length</Label>
                        <Input
                          type="number"
                          min="100"
                          max="2000"
                          value={config.advanced.max_message_length}
                          onChange={(e) => updateConfig('advanced.max_message_length', parseInt(e.target.value) || 500)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Max Tokens Per Request</Label>
                        <Input
                          type="number"
                          min="1000"
                          max="8000"
                          value={config.advanced.max_tokens_per_request}
                          onChange={(e) => updateConfig('advanced.max_tokens_per_request', parseInt(e.target.value) || 4000)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Request Timeout (seconds)</Label>
                        <Input
                          type="number"
                          min="10"
                          max="120"
                          value={config.advanced.request_timeout}
                          onChange={(e) => updateConfig('advanced.request_timeout', parseInt(e.target.value) || 30)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Temperature (0-1)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={config.advanced.temperature}
                          onChange={(e) => updateConfig('advanced.temperature', parseFloat(e.target.value) || 0.7)}
                          className={errors.temperature ? 'border-red-500' : ''}
                        />
                        {errors.temperature && (
                          <p className="text-sm text-red-500">{errors.temperature}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Instructions</Label>
                      <Textarea
                        value={config.advanced.custom_instructions}
                        onChange={(e) => updateConfig('advanced.custom_instructions', e.target.value)}
                        placeholder="Additional instructions for the assistant behavior..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {editMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {editMode ? (
                    <>
                      <Edit className="h-4 w-4" />
                      Update Assistant
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Assistant
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to get capability descriptions
const getCapabilityDescription = (capability: string): string => {
  const descriptions: { [key: string]: string } = {
    recipes: 'Find and suggest recipes based on user preferences',
    nutrition: 'Provide nutritional information and dietary advice',
    meal_planning: 'Help plan meals for the week or month',
    budget_tracking: 'Track spending and suggest budget-friendly options',
    cultural_cuisine: 'Suggest dishes from specific cultures and regions',
    store_recommendations: 'Recommend stores based on location and preferences',
    price_comparison: 'Compare prices across different stores',
    delivery_options: 'Find and compare delivery services'
  }
  
  return descriptions[capability] || 'Enable this feature for enhanced functionality'
} 