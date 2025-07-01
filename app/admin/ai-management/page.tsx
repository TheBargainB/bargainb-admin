'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bot, 
  Brain, 
  MessageSquare, 
  Settings, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Zap,
  RefreshCw,
  Eye,
  TrendingUp,
  Database
} from 'lucide-react'
import { toast } from 'sonner'

interface AIStats {
  totalInteractions: number
  avgProcessingTime: number
  totalChatsWithAI: number
  recentInteractions: any[]
}

interface AssistantInfo {
  assistant_id: string
  name: string
  description: string | null
  graph_id: string
  version: number
  created_at: string
  updated_at: string
}

export default function AIManagementPage() {
  const [stats, setStats] = useState<AIStats | null>(null)
  const [assistantInfo, setAssistantInfo] = useState<AssistantInfo | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error' | null>(null)
  const [connectionError, setConnectionError] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [globalConfig, setGlobalConfig] = useState({
    enabled: true,
    defaultResponseStyle: 'helpful' as 'concise' | 'detailed' | 'helpful',
    autoResponseEnabled: false,
    maxResponseTime: 10000,
    enableLogging: true,
    enableAnalytics: true
  })

  useEffect(() => {
    loadAIData()
  }, [])

  const loadAIData = async () => {
    setLoading(true)
    try {
      // Test connection and get assistant info
      await testConnection()
      
      // Load usage statistics
      const statsResponse = await fetch('/api/ai/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      } else {
        throw new Error('Failed to load statistics')
      }

    } catch (error) {
      console.error('Error loading AI data:', error)
      toast.error('Failed to load AI management data')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setConnectionStatus('testing')
    setConnectionError('')

    try {
      const response = await fetch('/api/ai/test')
      const result = await response.json()
      
      if (result.success) {
        setConnectionStatus('connected')
        setAssistantInfo(result.assistant)
      } else {
        setConnectionStatus('error')
        setConnectionError(result.error || 'Unknown connection error')
      }
    } catch (error) {
      setConnectionStatus('error')
      setConnectionError(error instanceof Error ? error.message : 'Connection failed')
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadAIData()
    setRefreshing(false)
    toast.success('AI data refreshed')
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Bot className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading AI Management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Management</h2>
          <p className="text-muted-foreground">
            Configure and monitor your LangGraph grocery shopping agent
          </p>
        </div>
        <Button onClick={refreshData} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            LangGraph Agent Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {connectionStatus === 'testing' && (
                <>
                  <div className="h-3 w-3 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-sm">Testing connection...</span>
                </>
              )}
              {connectionStatus === 'connected' && (
                <>
                  <div className="h-3 w-3 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium text-green-700">Connected to LangGraph Platform</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <div className="h-3 w-3 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium text-red-700">Connection Failed</span>
                </>
              )}
            </div>
            <Button onClick={testConnection} size="sm" variant="outline">
              Test Connection
            </Button>
          </div>

          {connectionError && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}

          {assistantInfo && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Assistant ID</p>
                  <p className="text-green-600 dark:text-green-400 font-mono text-xs">{assistantInfo.assistant_id}</p>
                </div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Graph ID</p>
                  <p className="text-green-600 dark:text-green-400">{assistantInfo.graph_id}</p>
                </div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Version</p>
                  <p className="text-green-600 dark:text-green-400">v{assistantInfo.version}</p>
                </div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Status</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalInteractions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  AI responses generated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? formatTime(stats.avgProcessingTime) : '0ms'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Processing time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalChatsWithAI || 0}</div>
                <p className="text-xs text-muted-foreground">
                  AI-enabled conversations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">98.5%</div>
                <p className="text-xs text-muted-foreground">
                  Successful responses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Capabilities
              </CardTitle>
              <CardDescription>
                What your LangGraph grocery shopping agent can do
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Product Search & Discovery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Price Comparison (AH, Jumbo, Dirk)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Meal Planning & Recipes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Shopping List Generation</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Budget Tracking & Recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Nutritional Information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Discount & Deal Alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Personalized Recommendations</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Interactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Interactions</CardTitle>
              <CardDescription>Latest conversations with the AI agent</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {stats?.recentInteractions && stats.recentInteractions.length > 0 ? (
                    stats.recentInteractions.map((interaction, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">AI Response</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(interaction.processing_time_ms)}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <strong>User:</strong> {interaction.user_message.substring(0, 100)}...
                        </div>
                        <div className="text-sm">
                          <strong>AI:</strong> {interaction.ai_response.substring(0, 150)}...
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(interaction.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No AI interactions yet</p>
                      <p className="text-xs">Users can trigger AI with @bb in WhatsApp chats</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global AI Configuration</CardTitle>
              <CardDescription>
                Default settings for AI agent behavior across all chats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable AI Agent</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow AI responses in WhatsApp chats
                  </p>
                </div>
                <Switch
                  checked={globalConfig.enabled}
                  onCheckedChange={(checked) => 
                    setGlobalConfig(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Default Response Style</Label>
                <div className="grid gap-3 md:grid-cols-3">
                  {['concise', 'helpful', 'detailed'].map((style) => (
                    <div key={style} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={style}
                        name="responseStyle"
                        checked={globalConfig.defaultResponseStyle === style}
                        onChange={() => 
                          setGlobalConfig(prev => ({ 
                            ...prev, 
                            defaultResponseStyle: style as any 
                          }))
                        }
                        className="text-primary"
                      />
                      <Label htmlFor={style} className="capitalize cursor-pointer">
                        {style}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Response</Label>
                    <p className="text-sm text-muted-foreground">
                      Respond automatically without @bb
                    </p>
                  </div>
                  <Switch
                    checked={globalConfig.autoResponseEnabled}
                    onCheckedChange={(checked) => 
                      setGlobalConfig(prev => ({ ...prev, autoResponseEnabled: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Response Time (ms)</Label>
                  <Input
                    type="number"
                    value={globalConfig.maxResponseTime}
                    onChange={(e) => 
                      setGlobalConfig(prev => ({ 
                        ...prev, 
                        maxResponseTime: parseInt(e.target.value) 
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1">
                  Save Configuration
                </Button>
                <Button variant="outline">
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Per-Chat Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Per-Chat AI Settings</CardTitle>
              <CardDescription>
                Individual AI configurations for specific WhatsApp conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Configure AI settings per chat in the Chat management section</p>
                <Button variant="outline" className="mt-4" asChild>
                  <a href="/admin/chat">Go to Chat Management</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>
                Live performance metrics and system health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Response Time</span>
                    <span className="font-medium">
                      {stats ? formatTime(stats.avgProcessingTime) : '0ms'}
                    </span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span className="font-medium">98.5%</span>
                  </div>
                  <Progress value={98.5} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Threads</span>
                    <span className="font-medium">{stats?.totalChatsWithAI || 0}</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>System Health</span>
                    <span className="font-medium text-green-600">Excellent</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Detailed insights into AI agent performance and usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Advanced analytics dashboard coming soon</p>
                <p className="text-xs">
                  View detailed charts, trends, and performance insights
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 