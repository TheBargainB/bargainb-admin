'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Brain, 
  Shield, 
  Clock, 
  MessageSquare, 
  Zap,
  Hash,
  Save,
  RotateCcw,
  Plus,
  X
} from 'lucide-react'

interface ConfigEditorProps {
  config: any
  onSave: (updatedConfig: any) => void
  className?: string
  readOnly?: boolean
}

export const AssistantConfigEditor = ({ config, onSave, className, readOnly = false }: ConfigEditorProps) => {
  const [formData, setFormData] = useState<any>({})
  const [keywords, setKeywords] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState('')
  const [newTag, setNewTag] = useState('')

  // Initialize form data
  useEffect(() => {
    if (config) {
      setFormData({
        // Core AI Settings
        model: config.model || config.model_name || '',
        temperature: config.temperature || 0.7,
        max_tokens: config.max_tokens || config.max_tokens_per_request || 4000,
        response_style: config.response_style || 'helpful',
        
        // Behavior & Safety
        auto_respond: config.auto_respond || false,
        guard_rails_enabled: config.guard_rails_enabled !== undefined ? config.guard_rails_enabled : true,
        spam_detection: config.spam_detection !== undefined ? config.spam_detection : true,
        content_filtering: config.content_filtering !== undefined ? config.content_filtering : true,
        fallback_responses: config.fallback_responses !== undefined ? config.fallback_responses : true,
        
        // Limits & Performance
        max_message_length: config.max_message_length || 500,
        max_tokens_per_hour: config.max_tokens_per_hour || 20000,
        request_timeout: config.request_timeout || 30,
        max_tool_calls: config.max_tool_calls || 5,
        
        // Custom Configuration
        custom_instructions: config.custom_instructions || ''
      })
      
      setKeywords(config.keywords || [])
      setTags(config.tags || [])
    }
  }, [config])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSwitchChange = (field: string, checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, [field]: checked }))
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords((prev: string[]) => [...prev, newKeyword.trim()])
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords((prev: string[]) => prev.filter(k => k !== keyword))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev: string[]) => [...prev, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setTags((prev: string[]) => prev.filter(t => t !== tag))
  }

  const handleSave = () => {
    const updatedConfig = {
      ...formData,
      keywords,
      tags
    }
    onSave(updatedConfig)
  }

  const handleReset = () => {
    // Reset to original config
    if (config) {
      setFormData({
        model: config.model || config.model_name || '',
        temperature: config.temperature || 0.7,
        max_tokens: config.max_tokens || config.max_tokens_per_request || 4000,
        response_style: config.response_style || 'helpful',
        auto_respond: config.auto_respond || false,
        guard_rails_enabled: config.guard_rails_enabled !== undefined ? config.guard_rails_enabled : true,
        spam_detection: config.spam_detection !== undefined ? config.spam_detection : true,
        content_filtering: config.content_filtering !== undefined ? config.content_filtering : true,
        fallback_responses: config.fallback_responses !== undefined ? config.fallback_responses : true,
        max_message_length: config.max_message_length || 500,
        max_tokens_per_hour: config.max_tokens_per_hour || 20000,
        request_timeout: config.request_timeout || 30,
        max_tool_calls: config.max_tool_calls || 5,
        custom_instructions: config.custom_instructions || ''
      })
      setKeywords(config.keywords || [])
      setTags(config.tags || [])
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Core AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Core AI Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model || ''}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="e.g., gpt-4, claude-3"
                disabled={readOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature || 0.7}
                onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                disabled={readOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_tokens">Max Tokens</Label>
              <Input
                id="max_tokens"
                type="number"
                min="1"
                max="32000"
                value={formData.max_tokens || 4000}
                onChange={(e) => handleInputChange('max_tokens', parseInt(e.target.value))}
                disabled={readOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="response_style">Response Style</Label>
              <Select
                value={formData.response_style || 'helpful'}
                onValueChange={(value) => handleInputChange('response_style', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="helpful">Helpful</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavior & Safety */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Behavior & Safety
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto_respond">Auto Respond</Label>
              <Switch
                id="auto_respond"
                checked={formData.auto_respond || false}
                onCheckedChange={(checked) => handleSwitchChange('auto_respond', checked)}
                disabled={readOnly}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="guard_rails">Guard Rails</Label>
              <Switch
                id="guard_rails"
                checked={formData.guard_rails_enabled !== undefined ? formData.guard_rails_enabled : true}
                onCheckedChange={(checked) => handleSwitchChange('guard_rails_enabled', checked)}
                disabled={readOnly}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="spam_detection">Spam Detection</Label>
              <Switch
                id="spam_detection"
                checked={formData.spam_detection !== undefined ? formData.spam_detection : true}
                onCheckedChange={(checked) => handleSwitchChange('spam_detection', checked)}
                disabled={readOnly}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="content_filtering">Content Filtering</Label>
              <Switch
                id="content_filtering"
                checked={formData.content_filtering !== undefined ? formData.content_filtering : true}
                onCheckedChange={(checked) => handleSwitchChange('content_filtering', checked)}
                disabled={readOnly}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="fallback_responses">Fallback Responses</Label>
              <Switch
                id="fallback_responses"
                checked={formData.fallback_responses !== undefined ? formData.fallback_responses : true}
                onCheckedChange={(checked) => handleSwitchChange('fallback_responses', checked)}
                disabled={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limits & Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Limits & Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_message_length">Max Message Length</Label>
              <Input
                id="max_message_length"
                type="number"
                min="1"
                max="10000"
                value={formData.max_message_length || 500}
                onChange={(e) => handleInputChange('max_message_length', parseInt(e.target.value))}
                disabled={readOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_tokens_per_hour">Tokens Per Hour</Label>
              <Input
                id="max_tokens_per_hour"
                type="number"
                min="1000"
                max="100000"
                value={formData.max_tokens_per_hour || 20000}
                onChange={(e) => handleInputChange('max_tokens_per_hour', parseInt(e.target.value))}
                disabled={readOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="request_timeout">Request Timeout (seconds)</Label>
              <Input
                id="request_timeout"
                type="number"
                min="5"
                max="300"
                value={formData.request_timeout || 30}
                onChange={(e) => handleInputChange('request_timeout', parseInt(e.target.value))}
                disabled={readOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_tool_calls">Max Tool Calls</Label>
              <Input
                id="max_tool_calls"
                type="number"
                min="1"
                max="20"
                value={formData.max_tool_calls || 5}
                onChange={(e) => handleInputChange('max_tool_calls', parseInt(e.target.value))}
                disabled={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Custom Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Keywords */}
          <div className="space-y-3">
            <Label>Keywords</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add keyword..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                disabled={readOnly}
              />
              <Button 
                type="button" 
                onClick={addKeyword}
                disabled={readOnly}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="gap-1">
                  <Hash className="h-3 w-3" />
                  {keyword}
                  {!readOnly && (
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                disabled={readOnly}
              />
              <Button 
                type="button" 
                onClick={addTag}
                disabled={readOnly}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {tag}
                  {!readOnly && (
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label htmlFor="custom_instructions">Custom Instructions</Label>
            <Textarea
              id="custom_instructions"
              placeholder="Enter custom instructions for the assistant..."
              value={formData.custom_instructions || ''}
              onChange={(e) => handleInputChange('custom_instructions', e.target.value)}
              rows={4}
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!readOnly && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              
              <Button 
                onClick={handleSave}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 