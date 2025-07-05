'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X, Plus, Save, Eye, Settings, User, Bot, Globe, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AssistantConfig {
  name: string
  description: string
  version: string
  language: string
  debug: boolean
  source: string
  user: {
    name: string
    phone: string
    location: {
      city: string
      country: string
      timezone: string
    }
    preferences: {
      family_size: number
      budget_range: string
      cooking_skill: string
      cultural_preferences: string[]
      dietary_restrictions: string[]
    }
  }
  assistant: {
    integration: {
      store_apis: boolean
      delivery_options: boolean
      price_comparison: boolean
      availability_check: boolean
    }
    personality: {
      tone: string
      expertise_level: string
      cultural_awareness: string
      communication_style: string
    }
    capabilities: {
      recipes: boolean
      nutrition: boolean
      meal_planning: boolean
      budget_tracking: boolean
      cultural_cuisine: boolean
      store_recommendations: boolean
    }
    cultural_knowledge: {
      local_stores: string[]
      traditional_meals: string[]
      cuisine_specialties: string[]
      seasonal_preferences: string[]
    }
  }
  recursion_limit: number
}

interface AssistantConfigFormProps {
  assistant?: any
  isOpen: boolean
  onClose: () => void
  onSave: (config: AssistantConfig) => void
  mode: 'create' | 'edit' | 'view'
}

export const AssistantConfigForm: React.FC<AssistantConfigFormProps> = ({
  assistant,
  isOpen,
  onClose,
  onSave,
  mode
}) => {
  const { toast } = useToast()
  const [config, setConfig] = useState<AssistantConfig>({
    name: '',
    description: '',
    version: '1.0.0',
    language: 'en',
    debug: false,
    source: 'whatsapp',
    user: {
      name: '',
      phone: '',
      location: {
        city: '',
        country: '',
        timezone: 'UTC'
      },
      preferences: {
        family_size: 1,
        budget_range: 'medium',
        cooking_skill: 'intermediate',
        cultural_preferences: [],
        dietary_restrictions: []
      }
    },
    assistant: {
      integration: {
        store_apis: true,
        delivery_options: true,
        price_comparison: true,
        availability_check: true
      },
      personality: {
        tone: 'friendly',
        expertise_level: 'expert',
        cultural_awareness: 'global',
        communication_style: 'detailed'
      },
      capabilities: {
        recipes: true,
        nutrition: true,
        meal_planning: true,
        budget_tracking: true,
        cultural_cuisine: true,
        store_recommendations: true
      },
      cultural_knowledge: {
        local_stores: [],
        traditional_meals: [],
        cuisine_specialties: [],
        seasonal_preferences: []
      }
    },
    recursion_limit: 25
  })

  const [newCulturalItem, setNewCulturalItem] = useState({
    stores: '',
    meals: '',
    specialties: '',
    seasonal: ''
  })

  const [newPreference, setNewPreference] = useState({
    cultural: '',
    dietary: ''
  })

  // Load assistant data when editing
  useEffect(() => {
    if (assistant && mode !== 'create') {
      try {
        const assistantConfig = assistant.config?.configurable || {}
        setConfig({
          name: assistant.name || '',
          description: assistant.description || '',
          version: assistant.version?.toString() || '1.0.0',
          language: assistantConfig.core?.language || 'en',
          debug: assistantConfig.core?.debug || false,
          source: assistantConfig.core?.source || 'whatsapp',
          user: {
            name: assistantConfig.user?.name || '',
            phone: assistantConfig.user?.phone || '',
            location: {
              city: assistantConfig.user?.location?.city || '',
              country: assistantConfig.user?.location?.country || '',
              timezone: assistantConfig.user?.location?.timezone || 'UTC'
            },
            preferences: {
              family_size: assistantConfig.user?.preferences?.family_size || 1,
              budget_range: assistantConfig.user?.preferences?.budget_range || 'medium',
              cooking_skill: assistantConfig.user?.preferences?.cooking_skill || 'intermediate',
              cultural_preferences: assistantConfig.user?.preferences?.cultural_preferences || [],
              dietary_restrictions: assistantConfig.user?.preferences?.dietary_restrictions || []
            }
          },
          assistant: {
            integration: {
              store_apis: assistantConfig.assistant?.integration?.store_apis !== false,
              delivery_options: assistantConfig.assistant?.integration?.delivery_options !== false,
              price_comparison: assistantConfig.assistant?.integration?.price_comparison !== false,
              availability_check: assistantConfig.assistant?.integration?.availability_check !== false
            },
            personality: {
              tone: assistantConfig.assistant?.personality?.tone || 'friendly',
              expertise_level: assistantConfig.assistant?.personality?.expertise_level || 'expert',
              cultural_awareness: assistantConfig.assistant?.personality?.cultural_awareness || 'global',
              communication_style: assistantConfig.assistant?.personality?.communication_style || 'detailed'
            },
            capabilities: {
              recipes: assistantConfig.assistant?.capabilities?.recipes !== false,
              nutrition: assistantConfig.assistant?.capabilities?.nutrition !== false,
              meal_planning: assistantConfig.assistant?.capabilities?.meal_planning !== false,
              budget_tracking: assistantConfig.assistant?.capabilities?.budget_tracking !== false,
              cultural_cuisine: assistantConfig.assistant?.capabilities?.cultural_cuisine !== false,
              store_recommendations: assistantConfig.assistant?.capabilities?.store_recommendations !== false
            },
            cultural_knowledge: {
              local_stores: assistantConfig.assistant?.cultural_knowledge?.local_stores || [],
              traditional_meals: assistantConfig.assistant?.cultural_knowledge?.traditional_meals || [],
              cuisine_specialties: assistantConfig.assistant?.cultural_knowledge?.cuisine_specialties || [],
              seasonal_preferences: assistantConfig.assistant?.cultural_knowledge?.seasonal_preferences || []
            }
          },
          recursion_limit: assistant.config?.recursion_limit || 25
        })
      } catch (error) {
        console.error('Error loading assistant config:', error)
      }
    }
  }, [assistant, mode])

  const handleSave = () => {
    if (!config.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Assistant name is required.",
        variant: "destructive"
      })
      return
    }

    onSave(config)
  }

  const addCulturalItem = (type: 'stores' | 'meals' | 'specialties' | 'seasonal') => {
    const value = newCulturalItem[type].trim()
    if (!value) return

    setConfig(prev => ({
      ...prev,
      assistant: {
        ...prev.assistant,
        cultural_knowledge: {
          ...prev.assistant.cultural_knowledge,
          [type === 'stores' ? 'local_stores' : 
           type === 'meals' ? 'traditional_meals' :
           type === 'specialties' ? 'cuisine_specialties' : 'seasonal_preferences']: [
            ...prev.assistant.cultural_knowledge[
              type === 'stores' ? 'local_stores' : 
              type === 'meals' ? 'traditional_meals' :
              type === 'specialties' ? 'cuisine_specialties' : 'seasonal_preferences'
            ],
            value
          ]
        }
      }
    }))

    setNewCulturalItem(prev => ({ ...prev, [type]: '' }))
  }

  const removeCulturalItem = (type: 'local_stores' | 'traditional_meals' | 'cuisine_specialties' | 'seasonal_preferences', index: number) => {
    setConfig(prev => ({
      ...prev,
      assistant: {
        ...prev.assistant,
        cultural_knowledge: {
          ...prev.assistant.cultural_knowledge,
          [type]: prev.assistant.cultural_knowledge[type].filter((_, i) => i !== index)
        }
      }
    }))
  }

  const addPreference = (type: 'cultural' | 'dietary') => {
    const value = newPreference[type].trim()
    if (!value) return

    const field = type === 'cultural' ? 'cultural_preferences' : 'dietary_restrictions'
    
    setConfig(prev => ({
      ...prev,
      user: {
        ...prev.user,
        preferences: {
          ...prev.user.preferences,
          [field]: [...prev.user.preferences[field], value]
        }
      }
    }))

    setNewPreference(prev => ({ ...prev, [type]: '' }))
  }

  const removePreference = (type: 'cultural_preferences' | 'dietary_restrictions', index: number) => {
    setConfig(prev => ({
      ...prev,
      user: {
        ...prev.user,
        preferences: {
          ...prev.user.preferences,
          [type]: prev.user.preferences[type].filter((_, i) => i !== index)
        }
      }
    }))
  }

  const isReadOnly = mode === 'view'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'view' ? <Eye className="h-5 w-5 text-blue-600" /> : 
             mode === 'edit' ? <Settings className="h-5 w-5 text-orange-600" /> : 
             <Plus className="h-5 w-5 text-green-600" />}
            {mode === 'view' ? 'View Assistant Configuration' :
             mode === 'edit' ? 'Edit Assistant Configuration' :
             'Create New Assistant'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'view' ? 'View assistant configuration details' :
             mode === 'edit' ? 'Modify assistant configuration settings' :
             'Configure a new AI assistant with form-based inputs'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(95vh-8rem)] px-1">
          <div className="space-y-6 pr-4">
            
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Assistant Name *</Label>
                    <Input
                      id="name"
                      value={config.name}
                      onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Alex Dutch Assistant"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={config.version}
                      onChange={(e) => setConfig(prev => ({ ...prev, version: e.target.value }))}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={config.description}
                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the assistant's purpose and capabilities..."
                    rows={3}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={config.language} 
                      onValueChange={(value) => setConfig(prev => ({ ...prev, language: value }))}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                        <SelectItem value="nl">Dutch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="source">Source Platform</Label>
                    <Select 
                      value={config.source} 
                      onValueChange={(value) => setConfig(prev => ({ ...prev, source: value }))}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="web">Web</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="recursion_limit">Recursion Limit</Label>
                    <Input
                      id="recursion_limit"
                      type="number"
                      value={config.recursion_limit}
                      onChange={(e) => setConfig(prev => ({ ...prev, recursion_limit: parseInt(e.target.value) || 25 }))}
                      min={1}
                      max={100}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="debug"
                    checked={config.debug}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, debug: checked }))}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor="debug">Enable Debug Mode</Label>
                </div>
              </CardContent>
            </Card>

            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user_name">User Name</Label>
                    <Input
                      id="user_name"
                      value={config.user.name}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        user: { ...prev.user, name: e.target.value }
                      }))}
                      placeholder="e.g., Alex"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="user_phone">Phone Number</Label>
                    <Input
                      id="user_phone"
                      value={config.user.phone}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        user: { ...prev.user, phone: e.target.value }
                      }))}
                      placeholder="e.g., +31654254623"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <Separator />
                <h4 className="font-medium">Location</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={config.user.location.city}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        user: {
                          ...prev.user,
                          location: { ...prev.user.location, city: e.target.value }
                        }
                      }))}
                      placeholder="e.g., Amsterdam"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={config.user.location.country}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        user: {
                          ...prev.user,
                          location: { ...prev.user.location, country: e.target.value }
                        }
                      }))}
                      placeholder="e.g., Netherlands"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={config.user.location.timezone} 
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        user: {
                          ...prev.user,
                          location: { ...prev.user.location, timezone: value }
                        }
                      }))}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="Europe/Amsterdam">Europe/Amsterdam</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                        <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />
                <h4 className="font-medium">User Preferences</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="family_size">Family Size</Label>
                    <Input
                      id="family_size"
                      type="number"
                      value={config.user.preferences.family_size}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        user: {
                          ...prev.user,
                          preferences: {
                            ...prev.user.preferences,
                            family_size: parseInt(e.target.value) || 1
                          }
                        }
                      }))}
                      min={1}
                      max={20}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget_range">Budget Range</Label>
                    <Select 
                      value={config.user.preferences.budget_range} 
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        user: {
                          ...prev.user,
                          preferences: { ...prev.user.preferences, budget_range: value }
                        }
                      }))}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Budget</SelectItem>
                        <SelectItem value="medium">Medium Budget</SelectItem>
                        <SelectItem value="high">High Budget</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cooking_skill">Cooking Skill</Label>
                    <Select 
                      value={config.user.preferences.cooking_skill} 
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        user: {
                          ...prev.user,
                          preferences: { ...prev.user.preferences, cooking_skill: value }
                        }
                      }))}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert/Chef</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Cultural Preferences */}
                <div>
                  <Label>Cultural Preferences</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.user.preferences.cultural_preferences.map((pref, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {pref}
                        {!isReadOnly && (
                          <button
                            onClick={() => removePreference('cultural_preferences', index)}
                            className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {!isReadOnly && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newPreference.cultural}
                        onChange={(e) => setNewPreference(prev => ({ ...prev, cultural: e.target.value }))}
                        placeholder="Add cultural preference..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addPreference('cultural')
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPreference('cultural')}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <Label>Dietary Restrictions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.user.preferences.dietary_restrictions.map((restriction, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {restriction}
                        {!isReadOnly && (
                          <button
                            onClick={() => removePreference('dietary_restrictions', index)}
                            className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {!isReadOnly && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newPreference.dietary}
                        onChange={(e) => setNewPreference(prev => ({ ...prev, dietary: e.target.value }))}
                        placeholder="Add dietary restriction..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addPreference('dietary')
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPreference('dietary')}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assistant Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Assistant Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Integration Settings */}
                <div>
                  <h4 className="font-medium mb-3">Integration Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.assistant.integration.store_apis}
                        onCheckedChange={(checked) => setConfig(prev => ({
                          ...prev,
                          assistant: {
                            ...prev.assistant,
                            integration: { ...prev.assistant.integration, store_apis: checked }
                          }
                        }))}
                        disabled={isReadOnly}
                      />
                      <Label>Store APIs Integration</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.assistant.integration.delivery_options}
                        onCheckedChange={(checked) => setConfig(prev => ({
                          ...prev,
                          assistant: {
                            ...prev.assistant,
                            integration: { ...prev.assistant.integration, delivery_options: checked }
                          }
                        }))}
                        disabled={isReadOnly}
                      />
                      <Label>Delivery Options</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.assistant.integration.price_comparison}
                        onCheckedChange={(checked) => setConfig(prev => ({
                          ...prev,
                          assistant: {
                            ...prev.assistant,
                            integration: { ...prev.assistant.integration, price_comparison: checked }
                          }
                        }))}
                        disabled={isReadOnly}
                      />
                      <Label>Price Comparison</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.assistant.integration.availability_check}
                        onCheckedChange={(checked) => setConfig(prev => ({
                          ...prev,
                          assistant: {
                            ...prev.assistant,
                            integration: { ...prev.assistant.integration, availability_check: checked }
                          }
                        }))}
                        disabled={isReadOnly}
                      />
                      <Label>Availability Check</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Personality Settings */}
                <div>
                  <h4 className="font-medium mb-3">Personality Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Communication Tone</Label>
                      <Select 
                        value={config.assistant.personality.tone} 
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          assistant: {
                            ...prev.assistant,
                            personality: { ...prev.assistant.personality, tone: value }
                          }
                        }))}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Expertise Level</Label>
                      <Select 
                        value={config.assistant.personality.expertise_level} 
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          assistant: {
                            ...prev.assistant,
                            personality: { ...prev.assistant.personality, expertise_level: value }
                          }
                        }))}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner-friendly</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                          <SelectItem value="master">Master Chef</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Cultural Awareness</Label>
                      <Input
                        value={config.assistant.personality.cultural_awareness}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          assistant: {
                            ...prev.assistant,
                            personality: { ...prev.assistant.personality, cultural_awareness: e.target.value }
                          }
                        }))}
                        placeholder="e.g., dutch, global, middle_eastern"
                        disabled={isReadOnly}
                      />
                    </div>
                    <div>
                      <Label>Communication Style</Label>
                      <Select 
                        value={config.assistant.personality.communication_style} 
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          assistant: {
                            ...prev.assistant,
                            personality: { ...prev.assistant.personality, communication_style: value }
                          }
                        }))}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brief">Brief & Concise</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                          <SelectItem value="explanatory">Explanatory</SelectItem>
                          <SelectItem value="interactive">Interactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Capabilities */}
                <div>
                  <h4 className="font-medium mb-3">Assistant Capabilities</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.assistant.capabilities.recipes}
                        onCheckedChange={(checked) => setConfig(prev => ({
                          ...prev,
                          assistant: {
                            ...prev.assistant,
                            capabilities: { ...prev.assistant.capabilities, recipes: checked }
                          }
                        }))}
                        disabled={isReadOnly}
                      />
                      <Label>Recipe Suggestions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.assistant.capabilities.nutrition}
                        onCheckedChange={(checked) => setConfig(prev => ({
                          ...prev,
                          assistant: {
                            ...prev.assistant,
                            capabilities: { ...prev.assistant.capabilities, nutrition: checked }
                          }
                        }))}
                        disabled={isReadOnly}
                      />
                      <Label>Nutrition Analysis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.assistant.capabilities.meal_planning}
                        onCheckedChange={(checked) => setConfig(prev => ({
                          ...prev,
                          assistant: {
                            ...prev.assistant,
                            capabilities: { ...prev.assistant.capabilities, meal_planning: checked }
                          }
                        }))}
                        disabled={isReadOnly}
                      />
                      <Label>Meal Planning</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.assistant.capabilities.budget_tracking}
                        onCheckedChange={(checked) => setConfig(prev => ({
                          ...prev,
                          assistant: {
                            ...prev.assistant,
                            capabilities: { ...prev.assistant.capabilities, budget_tracking: checked }
                          }
                        }))}
                        disabled={isReadOnly}
                      />
                      <Label>Budget Tracking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.assistant.capabilities.cultural_cuisine}
                        onCheckedChange={(checked) => setConfig(prev => ({
                          ...prev,
                          assistant: {
                            ...prev.assistant,
                            capabilities: { ...prev.assistant.capabilities, cultural_cuisine: checked }
                          }
                        }))}
                        disabled={isReadOnly}
                      />
                      <Label>Cultural Cuisine</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.assistant.capabilities.store_recommendations}
                        onCheckedChange={(checked) => setConfig(prev => ({
                          ...prev,
                          assistant: {
                            ...prev.assistant,
                            capabilities: { ...prev.assistant.capabilities, store_recommendations: checked }
                          }
                        }))}
                        disabled={isReadOnly}
                      />
                      <Label>Store Recommendations</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Cultural Knowledge */}
                <div>
                  <h4 className="font-medium mb-3">Cultural Knowledge</h4>
                  
                  {/* Local Stores */}
                  <div className="mb-4">
                    <Label>Local Stores</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {config.assistant.cultural_knowledge.local_stores.map((store, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {store}
                          {!isReadOnly && (
                            <button
                              onClick={() => removeCulturalItem('local_stores', index)}
                              className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    {!isReadOnly && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newCulturalItem.stores}
                          onChange={(e) => setNewCulturalItem(prev => ({ ...prev, stores: e.target.value }))}
                          placeholder="Add local store..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addCulturalItem('stores')
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addCulturalItem('stores')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Traditional Meals */}
                  <div className="mb-4">
                    <Label>Traditional Meals</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {config.assistant.cultural_knowledge.traditional_meals.map((meal, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {meal}
                          {!isReadOnly && (
                            <button
                              onClick={() => removeCulturalItem('traditional_meals', index)}
                              className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    {!isReadOnly && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newCulturalItem.meals}
                          onChange={(e) => setNewCulturalItem(prev => ({ ...prev, meals: e.target.value }))}
                          placeholder="Add traditional meal..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addCulturalItem('meals')
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addCulturalItem('meals')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Cuisine Specialties */}
                  <div className="mb-4">
                    <Label>Cuisine Specialties</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {config.assistant.cultural_knowledge.cuisine_specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {specialty}
                          {!isReadOnly && (
                            <button
                              onClick={() => removeCulturalItem('cuisine_specialties', index)}
                              className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    {!isReadOnly && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newCulturalItem.specialties}
                          onChange={(e) => setNewCulturalItem(prev => ({ ...prev, specialties: e.target.value }))}
                          placeholder="Add cuisine specialty..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addCulturalItem('specialties')
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addCulturalItem('specialties')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Seasonal Preferences */}
                  <div>
                    <Label>Seasonal Preferences</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {config.assistant.cultural_knowledge.seasonal_preferences.map((preference, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {preference}
                          {!isReadOnly && (
                            <button
                              onClick={() => removeCulturalItem('seasonal_preferences', index)}
                              className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    {!isReadOnly && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newCulturalItem.seasonal}
                          onChange={(e) => setNewCulturalItem(prev => ({ ...prev, seasonal: e.target.value }))}
                          placeholder="Add seasonal preference..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addCulturalItem('seasonal')
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addCulturalItem('seasonal')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {mode === 'create' ? 'Create Assistant' : 'Save Changes'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 