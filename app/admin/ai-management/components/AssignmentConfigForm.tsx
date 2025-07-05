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
import { X, Plus, Save, Eye, Settings, User, Bot, Globe, Zap, UserPlus, Phone, MessageSquare, Clock, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AssignmentConfig {
  contact: {
    phone_number: string
    display_name: string
    push_name: string
    profile_picture_url: string
    last_seen_at: string
    is_business_account: boolean
    verified_name: string
  }
  assistant: {
    assistant_id: string
    name: string
    description: string | null
    version: string
    capabilities: string[]
    config: any
  }
  assignment: {
    priority: 'low' | 'medium' | 'high'
    auto_enable: boolean
    notification_settings: {
      notify_on_assignment: boolean
      notify_on_failure: boolean
      notify_on_success: boolean
    }
    schedule: {
      enabled: boolean
      start_time: string
      end_time: string
      days: string[]
    }
    custom_config: {
      welcome_message: string
      max_daily_interactions: number
      response_delay: number
      fallback_to_human: boolean
      human_handoff_conditions: string[]
    }
  }
  notes: string
}

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

interface BBAssistant {
  assistant_id: string
  name: string
  description: string | null
  version: number
  config: any
  metadata: any
  created_at: string
  updated_at: string
}

interface AssignmentConfigFormProps {
  assignment?: any
  isOpen: boolean
  onClose: () => void
  onSave: (config: AssignmentConfig) => void
  mode: 'create' | 'edit' | 'view'
  availableContacts: WhatsAppContact[]
  availableAssistants: BBAssistant[]
  isLoadingContacts: boolean
}

export const AssignmentConfigForm: React.FC<AssignmentConfigFormProps> = ({
  assignment,
  isOpen,
  onClose,
  onSave,
  mode,
  availableContacts,
  availableAssistants,
  isLoadingContacts
}) => {
  const { toast } = useToast()
  const [config, setConfig] = useState<AssignmentConfig>({
    contact: {
      phone_number: '',
      display_name: '',
      push_name: '',
      profile_picture_url: '',
      last_seen_at: '',
      is_business_account: false,
      verified_name: ''
    },
    assistant: {
      assistant_id: '',
      name: '',
      description: '',
      version: '',
      capabilities: [],
      config: {}
    },
    assignment: {
      priority: 'medium',
      auto_enable: true,
      notification_settings: {
        notify_on_assignment: true,
        notify_on_failure: true,
        notify_on_success: false
      },
      schedule: {
        enabled: false,
        start_time: '09:00',
        end_time: '17:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      custom_config: {
        welcome_message: 'Hello! I\'m your AI assistant. How can I help you today?',
        max_daily_interactions: 50,
        response_delay: 1000,
        fallback_to_human: true,
        human_handoff_conditions: ['angry', 'complex_request', 'payment_issues']
      }
    },
    notes: ''
  })

  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null)
  const [selectedAssistant, setSelectedAssistant] = useState<BBAssistant | null>(null)

  // Load assignment data when editing
  useEffect(() => {
    if (assignment && mode !== 'create') {
      const contact = availableContacts.find(c => c.phone_number === assignment.phone_number)
      const assistant = availableAssistants.find(a => a.assistant_id === assignment.assistant_id)
      
      if (contact) {
        setSelectedContact(contact)
      }
      if (assistant) {
        setSelectedAssistant(assistant)
      }

      setConfig(prev => ({
        ...prev,
        contact: {
          phone_number: assignment.phone_number || '',
          display_name: assignment.display_name || '',
          push_name: contact?.push_name || '',
          profile_picture_url: contact?.profile_picture_url || '',
          last_seen_at: contact?.last_seen_at || '',
          is_business_account: contact?.is_business_account || false,
          verified_name: contact?.verified_name || ''
        },
        assistant: {
          assistant_id: assignment.assistant_id || '',
          name: assignment.assistant_name || '',
          description: assistant?.description || '',
          version: assistant?.version?.toString() || '',
          capabilities: [],
          config: assignment.assistant_config || {}
        },
        notes: assignment.notes || ''
      }))
    }
  }, [assignment, availableContacts, availableAssistants, mode])

  const handleContactChange = (contactId: string) => {
    const contact = availableContacts.find(c => c.id === contactId)
    if (contact) {
      setSelectedContact(contact)
      setConfig(prev => ({
        ...prev,
        contact: {
          phone_number: contact.phone_number,
          display_name: contact.display_name || '',
          push_name: contact.push_name || '',
          profile_picture_url: contact.profile_picture_url || '',
          last_seen_at: contact.last_seen_at || '',
          is_business_account: contact.is_business_account,
          verified_name: contact.verified_name || ''
        }
      }))
    }
  }

  const handleAssistantChange = (assistantId: string) => {
    const assistant = availableAssistants.find(a => a.assistant_id === assistantId)
    if (assistant) {
      setSelectedAssistant(assistant)
      setConfig(prev => ({
        ...prev,
        assistant: {
          assistant_id: assistant.assistant_id,
          name: assistant.name,
          description: assistant.description,
          version: assistant.version.toString(),
          capabilities: [],
          config: assistant.config || {}
        }
      }))
    }
  }

  const handleSave = () => {
    if (!selectedContact || !selectedAssistant) {
      toast({
        title: "Missing Information",
        description: "Please select both a contact and an assistant.",
        variant: "destructive"
      })
      return
    }

    onSave(config)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  const toggleDay = (day: string) => {
    setConfig(prev => ({
      ...prev,
      assignment: {
        ...prev.assignment,
        schedule: {
          ...prev.assignment.schedule,
          days: prev.assignment.schedule.days.includes(day)
            ? prev.assignment.schedule.days.filter(d => d !== day)
            : [...prev.assignment.schedule.days, day]
        }
      }
    }))
  }

  const addHandoffCondition = () => {
    const condition = prompt("Enter handoff condition:")
    if (condition) {
      setConfig(prev => ({
        ...prev,
        assignment: {
          ...prev.assignment,
          custom_config: {
            ...prev.assignment.custom_config,
            human_handoff_conditions: [...prev.assignment.custom_config.human_handoff_conditions, condition]
          }
        }
      }))
    }
  }

  const removeHandoffCondition = (index: number) => {
    setConfig(prev => ({
      ...prev,
      assignment: {
        ...prev.assignment,
        custom_config: {
          ...prev.assignment.custom_config,
          human_handoff_conditions: prev.assignment.custom_config.human_handoff_conditions.filter((_, i) => i !== index)
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
            {mode === 'create' && <UserPlus className="h-5 w-5" />}
            {mode === 'edit' && <Settings className="h-5 w-5" />}
            {mode === 'view' && <Eye className="h-5 w-5" />}
            {mode === 'create' ? 'Create Assignment' : 
             mode === 'edit' ? 'Edit Assignment' : 
             'View Assignment'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Create a new assistant assignment for a WhatsApp contact' :
             mode === 'edit' ? 'Edit the existing assistant assignment' :
             'View assignment details'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(95vh-8rem)] px-1">
          <div className="space-y-6 pr-4">
            {/* Contact Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-select">WhatsApp Contact</Label>
                    {isLoadingContacts ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="text-sm text-gray-500">Loading contacts...</div>
                      </div>
                    ) : (
                      <Select
                        value={selectedContact?.id || ''}
                        onValueChange={handleContactChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a contact" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableContacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {contact.display_name || contact.push_name || contact.phone_number}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {contact.phone_number}
                                  </span>
                                </div>
                                {contact.is_business_account && (
                                  <Badge variant="secondary">Business</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {selectedContact && (
                    <div className="space-y-2">
                      <Label>Contact Details</Label>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-mono">{selectedContact.phone_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Display Name:</span>
                          <span>{selectedContact.display_name || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge variant={selectedContact.is_active ? "default" : "secondary"}>
                            {selectedContact.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        {selectedContact.last_seen_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Seen:</span>
                            <span className="text-xs">
                              {new Date(selectedContact.last_seen_at).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assistant Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Assistant Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assistant-select">BB Agent Assistant</Label>
                    <Select
                      value={selectedAssistant?.assistant_id || ''}
                      onValueChange={handleAssistantChange}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an assistant" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAssistants.map((assistant) => (
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

                  {selectedAssistant && (
                    <div className="space-y-2">
                      <Label>Assistant Details</Label>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span>{selectedAssistant.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Version:</span>
                          <Badge variant="outline">v{selectedAssistant.version}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID:</span>
                          <span className="font-mono text-xs">{selectedAssistant.assistant_id.slice(0, 12)}...</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="text-xs">
                            {new Date(selectedAssistant.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assignment Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Assignment Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select
                      value={config.assignment.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high') => 
                        setConfig(prev => ({ ...prev, assignment: { ...prev.assignment, priority: value } }))
                      }
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="auto-enable">Auto-enable AI</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-enable"
                        checked={config.assignment.auto_enable}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({ ...prev, assignment: { ...prev.assignment, auto_enable: checked } }))
                        }
                        disabled={isReadOnly}
                      />
                      <span className="text-sm text-gray-600">
                        {config.assignment.auto_enable ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Notification Settings */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Notification Settings</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.assignment.notification_settings.notify_on_assignment}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({ 
                            ...prev, 
                            assignment: { 
                              ...prev.assignment, 
                              notification_settings: { 
                                ...prev.assignment.notification_settings, 
                                notify_on_assignment: checked 
                              } 
                            } 
                          }))
                        }
                        disabled={isReadOnly}
                      />
                      <span className="text-sm">On Assignment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.assignment.notification_settings.notify_on_failure}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({ 
                            ...prev, 
                            assignment: { 
                              ...prev.assignment, 
                              notification_settings: { 
                                ...prev.assignment.notification_settings, 
                                notify_on_failure: checked 
                              } 
                            } 
                          }))
                        }
                        disabled={isReadOnly}
                      />
                      <span className="text-sm">On Failure</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.assignment.notification_settings.notify_on_success}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({ 
                            ...prev, 
                            assignment: { 
                              ...prev.assignment, 
                              notification_settings: { 
                                ...prev.assignment.notification_settings, 
                                notify_on_success: checked 
                              } 
                            } 
                          }))
                        }
                        disabled={isReadOnly}
                      />
                      <span className="text-sm">On Success</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Schedule Settings */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.assignment.schedule.enabled}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ 
                          ...prev, 
                          assignment: { 
                            ...prev.assignment, 
                            schedule: { 
                              ...prev.assignment.schedule, 
                              enabled: checked 
                            } 
                          } 
                        }))
                      }
                      disabled={isReadOnly}
                    />
                    <Label className="text-base font-medium">Schedule Restrictions</Label>
                  </div>

                  {config.assignment.schedule.enabled && (
                    <div className="space-y-4 pl-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-time">Start Time</Label>
                          <Input
                            id="start-time"
                            type="time"
                            value={config.assignment.schedule.start_time}
                            onChange={(e) => 
                              setConfig(prev => ({ 
                                ...prev, 
                                assignment: { 
                                  ...prev.assignment, 
                                  schedule: { 
                                    ...prev.assignment.schedule, 
                                    start_time: e.target.value 
                                  } 
                                } 
                              }))
                            }
                            disabled={isReadOnly}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-time">End Time</Label>
                          <Input
                            id="end-time"
                            type="time"
                            value={config.assignment.schedule.end_time}
                            onChange={(e) => 
                              setConfig(prev => ({ 
                                ...prev, 
                                assignment: { 
                                  ...prev.assignment, 
                                  schedule: { 
                                    ...prev.assignment.schedule, 
                                    end_time: e.target.value 
                                  } 
                                } 
                              }))
                            }
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Active Days</Label>
                        <div className="flex flex-wrap gap-2">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                            <Button
                              key={day}
                              variant={config.assignment.schedule.days.includes(day) ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleDay(day)}
                              disabled={isReadOnly}
                            >
                              {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Custom Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Custom Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcome-message">Welcome Message</Label>
                  <Textarea
                    id="welcome-message"
                    value={config.assignment.custom_config.welcome_message}
                    onChange={(e) => 
                      setConfig(prev => ({ 
                        ...prev, 
                        assignment: { 
                          ...prev.assignment, 
                          custom_config: { 
                            ...prev.assignment.custom_config, 
                            welcome_message: e.target.value 
                          } 
                        } 
                      }))
                    }
                    placeholder="Enter welcome message for the user"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-interactions">Max Daily Interactions</Label>
                    <Input
                      id="max-interactions"
                      type="number"
                      value={config.assignment.custom_config.max_daily_interactions}
                      onChange={(e) => 
                        setConfig(prev => ({ 
                          ...prev, 
                          assignment: { 
                            ...prev.assignment, 
                            custom_config: { 
                              ...prev.assignment.custom_config, 
                              max_daily_interactions: parseInt(e.target.value) || 0 
                            } 
                          } 
                        }))
                      }
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="response-delay">Response Delay (ms)</Label>
                    <Input
                      id="response-delay"
                      type="number"
                      value={config.assignment.custom_config.response_delay}
                      onChange={(e) => 
                        setConfig(prev => ({ 
                          ...prev, 
                          assignment: { 
                            ...prev.assignment, 
                            custom_config: { 
                              ...prev.assignment.custom_config, 
                              response_delay: parseInt(e.target.value) || 0 
                            } 
                          } 
                        }))
                      }
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.assignment.custom_config.fallback_to_human}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ 
                          ...prev, 
                          assignment: { 
                            ...prev.assignment, 
                            custom_config: { 
                              ...prev.assignment.custom_config, 
                              fallback_to_human: checked 
                            } 
                          } 
                        }))
                      }
                      disabled={isReadOnly}
                    />
                    <Label>Fallback to Human</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Human Handoff Conditions</Label>
                  <div className="flex flex-wrap gap-2">
                    {config.assignment.custom_config.human_handoff_conditions.map((condition, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {condition}
                        {!isReadOnly && (
                          <button
                            onClick={() => removeHandoffCondition(index)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {!isReadOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addHandoffCondition}
                        className="h-6 px-2"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={config.notes}
                  onChange={(e) => setConfig(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes about this assignment..."
                  disabled={isReadOnly}
                />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create Assignment' : 'Update Assignment'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 