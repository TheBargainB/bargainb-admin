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
      <DialogContent className="max-w-[900px] p-0 gap-0">
        <div className="flex h-[600px]">
          {/* Left Panel - Main Configuration */}
          <div className="w-[350px] border-r flex flex-col">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle>
                {mode === 'create' ? 'Create Assignment' : mode === 'edit' ? 'Edit Assignment' : 'View Assignment'}
              </DialogTitle>
              <DialogDescription>
                {mode === 'create' ? 'Assign an AI assistant to a user' : mode === 'edit' ? 'Modify existing assignment' : 'Assignment details'}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 p-6">
              {/* Contact Selection */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Contact</Label>
                  <Badge variant="outline" className="font-normal">
                    <User className="h-3 w-3 mr-1" />
                    User
                  </Badge>
                </div>
                
                <Select
                  value={selectedContact?.id}
                  onValueChange={handleContactChange}
                  disabled={mode === 'view' || isLoadingContacts}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        <div className="flex flex-col">
                          <span>{contact.display_name || contact.push_name}</span>
                          <span className="text-sm text-gray-500">{contact.phone_number}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assistant Selection */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Assistant</Label>
                  <Badge variant="outline" className="font-normal">
                    <Bot className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                </div>
                
                <Select
                  value={selectedAssistant?.assistant_id}
                  onValueChange={handleAssistantChange}
                  disabled={mode === 'view'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAssistants.map((assistant) => (
                      <SelectItem key={assistant.assistant_id} value={assistant.assistant_id}>
                        <div className="flex flex-col">
                          <span>{assistant.name}</span>
                          <span className="text-sm text-gray-500">{assistant.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Notes</Label>
                <Textarea
                  value={config.notes}
                  onChange={(e) => setConfig(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this assignment..."
                  disabled={mode === 'view'}
                  className="h-[100px]"
                />
              </div>
            </ScrollArea>

            {/* Action Buttons - Always visible at bottom */}
            <div className="border-t p-4 flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              {mode !== 'view' && (
                <Button
                  onClick={handleSave}
                  className="flex-1"
                  disabled={!selectedContact || !selectedAssistant}
                >
                  {mode === 'create' ? 'Create' : 'Save Changes'}
                </Button>
              )}
            </div>
          </div>

          {/* Right Panel - Advanced Settings */}
          <div className="flex-1 flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <h3 className="font-semibold">Advanced Settings</h3>
              </div>
              {selectedAssistant && (
                <Badge variant="outline" className="font-normal">
                  v{selectedAssistant.version}
                </Badge>
              )}
            </div>

            <ScrollArea className="flex-1 p-6">
              {/* Priority Settings */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Priority Level</Label>
                  <Select
                    value={config.assignment.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setConfig(prev => ({
                        ...prev,
                        assignment: { ...prev.assignment, priority: value }
                      }))
                    }
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Auto-Enable Switch */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">Auto-Enable</Label>
                    <p className="text-sm text-gray-500">
                      Automatically enable the assistant for this user
                    </p>
                  </div>
                  <Switch
                    checked={config.assignment.auto_enable}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({
                        ...prev,
                        assignment: { ...prev.assignment, auto_enable: checked }
                      }))
                    }
                    disabled={mode === 'view'}
                  />
                </div>

                {/* Notification Settings */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Notifications</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer">Notify on Assignment</Label>
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
                        disabled={mode === 'view'}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer">Notify on Failure</Label>
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
                        disabled={mode === 'view'}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer">Notify on Success</Label>
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
                        disabled={mode === 'view'}
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Configuration */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Custom Configuration</Label>
                  <div className="space-y-4">
                    <div>
                      <Label>Welcome Message</Label>
                      <Textarea
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
                        placeholder="Enter welcome message..."
                        disabled={mode === 'view'}
                      />
                    </div>
                    <div>
                      <Label>Max Daily Interactions</Label>
                      <Input
                        type="number"
                        value={config.assignment.custom_config.max_daily_interactions}
                        onChange={(e) =>
                          setConfig(prev => ({
                            ...prev,
                            assignment: {
                              ...prev.assignment,
                              custom_config: {
                                ...prev.assignment.custom_config,
                                max_daily_interactions: parseInt(e.target.value)
                              }
                            }
                          }))
                        }
                        disabled={mode === 'view'}
                      />
                    </div>
                    <div>
                      <Label>Response Delay (ms)</Label>
                      <Input
                        type="number"
                        value={config.assignment.custom_config.response_delay}
                        onChange={(e) =>
                          setConfig(prev => ({
                            ...prev,
                            assignment: {
                              ...prev.assignment,
                              custom_config: {
                                ...prev.assignment.custom_config,
                                response_delay: parseInt(e.target.value)
                              }
                            }
                          }))
                        }
                        disabled={mode === 'view'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 