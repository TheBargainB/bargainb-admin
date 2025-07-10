'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Thermometer,
  Eye,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'

interface ConfigDisplayProps {
  config: any
  className?: string
}

export const AssistantConfigDisplay = ({ config, className }: ConfigDisplayProps) => {
  if (!config || typeof config !== 'object') {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="h-4 w-4" />
            <p className="text-sm">No configuration data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Helper function to render boolean values
  const BooleanBadge = ({ value }: { value: boolean }) => (
    <Badge variant={value ? "default" : "secondary"} className="gap-1">
      {value ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {value ? 'Enabled' : 'Disabled'}
    </Badge>
  )

  // Helper function to render arrays as badges
  const ArrayBadges = ({ items, icon: Icon }: { items: string[], icon?: any }) => (
    <div className="flex flex-wrap gap-1">
      {items.map((item, index) => (
        <Badge key={index} variant="outline" className="text-xs gap-1">
          {Icon && <Icon className="h-3 w-3" />}
          {item}
        </Badge>
      ))}
    </div>
  )

  // Extract common configuration sections
  const coreSettings = {
    temperature: config.temperature,
    max_tokens: config.max_tokens || config.max_tokens_per_request,
    response_style: config.response_style,
    model: config.model || config.model_name
  }

  const behaviorSettings = {
    auto_respond: config.auto_respond,
    guard_rails_enabled: config.guard_rails_enabled,
    spam_detection: config.spam_detection,
    content_filtering: config.content_filtering,
    fallback_responses: config.fallback_responses
  }

  const limitSettings = {
    max_message_length: config.max_message_length,
    max_tokens_per_hour: config.max_tokens_per_hour,
    request_timeout: config.request_timeout,
    max_tool_calls: config.max_tool_calls
  }

  const customSettings = {
    keywords: config.keywords,
    custom_instructions: config.custom_instructions,
    tags: config.tags
  }

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Core AI Settings */}
      {Object.values(coreSettings).some(v => v !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              Core AI Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {coreSettings.model && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Model</p>
                  <Badge variant="outline">{coreSettings.model}</Badge>
                </div>
              )}
              {coreSettings.temperature !== undefined && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Temperature</p>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-mono">{coreSettings.temperature}</span>
                  </div>
                </div>
              )}
              {coreSettings.max_tokens && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Max Tokens</p>
                  <Badge variant="secondary">{coreSettings.max_tokens.toLocaleString()}</Badge>
                </div>
              )}
              {coreSettings.response_style && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Response Style</p>
                  <Badge variant="outline">{coreSettings.response_style}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Behavior & Safety */}
      {Object.values(behaviorSettings).some(v => v !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              Behavior & Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {behaviorSettings.auto_respond !== undefined && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Auto Respond</p>
                  <BooleanBadge value={behaviorSettings.auto_respond} />
                </div>
              )}
              {behaviorSettings.guard_rails_enabled !== undefined && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Guard Rails</p>
                  <BooleanBadge value={behaviorSettings.guard_rails_enabled} />
                </div>
              )}
              {behaviorSettings.spam_detection !== undefined && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Spam Detection</p>
                  <BooleanBadge value={behaviorSettings.spam_detection} />
                </div>
              )}
              {behaviorSettings.content_filtering !== undefined && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Content Filtering</p>
                  <BooleanBadge value={behaviorSettings.content_filtering} />
                </div>
              )}
              {behaviorSettings.fallback_responses !== undefined && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Fallback Responses</p>
                  <BooleanBadge value={behaviorSettings.fallback_responses} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Limits & Performance */}
      {Object.values(limitSettings).some(v => v !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4" />
              Limits & Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {limitSettings.max_message_length && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Max Message Length</p>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{limitSettings.max_message_length} chars</span>
                  </div>
                </div>
              )}
              {limitSettings.max_tokens_per_hour && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tokens Per Hour</p>
                  <Badge variant="secondary">{limitSettings.max_tokens_per_hour.toLocaleString()}</Badge>
                </div>
              )}
              {limitSettings.request_timeout && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Request Timeout</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{limitSettings.request_timeout}s</span>
                  </div>
                </div>
              )}
              {limitSettings.max_tool_calls && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Max Tool Calls</p>
                  <Badge variant="secondary">{limitSettings.max_tool_calls}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Configuration */}
      {(customSettings.keywords?.length || customSettings.custom_instructions || customSettings.tags?.length) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4" />
              Custom Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customSettings.keywords?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Keywords</p>
                <ArrayBadges items={customSettings.keywords} icon={Hash} />
              </div>
            )}
            
            {customSettings.tags?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Tags</p>
                <ArrayBadges items={customSettings.tags} icon={Hash} />
              </div>
            )}
            
            {customSettings.custom_instructions && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Custom Instructions</p>
                <div className="bg-muted p-3 rounded text-sm text-muted-foreground">
                  {customSettings.custom_instructions}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Raw Configuration (Collapsible) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4" />
            Raw Configuration
            <Badge variant="outline" className="text-xs">Advanced</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <details className="group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              Click to view raw JSON configuration
            </summary>
            <div className="mt-3">
              <pre className="text-xs bg-card text-foreground p-3 rounded border font-mono overflow-auto max-h-48">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  )
} 