'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Settings, 
  Shield, 
  Zap, 
  Brain, 
  Target,
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  MessageSquare,
  Lock,
  TrendingUp,
  Gauge,
  Filter,
  User,
  Save
} from 'lucide-react';

interface AIConfigTabProps {
  conversationId: string;
  userId: string;
  onConfigChange?: (config: any) => void;
}

interface AIConfig {
  enabled: boolean;
  response_style: 'concise' | 'detailed' | 'helpful';
  auto_respond: boolean;
  keywords: string[];
  // Safety & Security
  guard_rails_enabled: boolean;
  spam_detection: boolean;
  content_filtering: boolean;
  // Performance & Limits
  max_message_length: number;
  max_tokens_per_request: number;
  max_tokens_per_hour: number;
  request_timeout: number;
  max_tool_calls: number;
  // Advanced
  temperature: number;
  fallback_responses: boolean;
  custom_instructions: string;
}

export default function AIConfigTab({ conversationId, userId, onConfigChange }: AIConfigTabProps) {
  const [config, setConfig] = useState<AIConfig>({
    enabled: false,
    response_style: 'helpful',
    auto_respond: false,
    keywords: [],
    // Safety & Security defaults
    guard_rails_enabled: true,
    spam_detection: true,
    content_filtering: true,
    // Performance & Limits defaults
    max_message_length: 500,
    max_tokens_per_request: 4000,
    max_tokens_per_hour: 20000,
    request_timeout: 30,
    max_tool_calls: 5,
    // Advanced defaults
    temperature: 0.7,
    fallback_responses: true,
    custom_instructions: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'testing' | null>(null);
  const [usage, setUsage] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (conversationId) {
      loadConfig();
      loadUsageStats();
    }
  }, [conversationId]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/whatsapp/chats/${conversationId}/ai-config`);
      if (response.ok) {
        const data = await response.json();
        const newConfig = {
          enabled: data.ai_enabled || false,
          response_style: data.ai_config?.response_style || 'helpful',
          auto_respond: data.ai_config?.auto_respond || false,
          keywords: data.ai_config?.keywords || [],
          // Safety & Security
          guard_rails_enabled: data.ai_config?.guard_rails_enabled ?? true,
          spam_detection: data.ai_config?.spam_detection ?? true,
          content_filtering: data.ai_config?.content_filtering ?? true,
          // Performance & Limits
          max_message_length: data.ai_config?.max_message_length || 500,
          max_tokens_per_request: data.ai_config?.max_tokens_per_request || 4000,
          max_tokens_per_hour: data.ai_config?.max_tokens_per_hour || 20000,
          request_timeout: data.ai_config?.request_timeout || 30,
          max_tool_calls: data.ai_config?.max_tool_calls || 5,
          // Advanced
          temperature: data.ai_config?.temperature || 0.7,
          fallback_responses: data.ai_config?.fallback_responses ?? true,
          custom_instructions: data.ai_config?.custom_instructions || ''
        };
        setConfig(newConfig);
        onConfigChange?.(newConfig);
      }
    } catch (error) {
      console.error('Error loading AI config:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load AI configuration",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsageStats = async () => {
    try {
      const response = await fetch(`/api/ai/stats?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setUsage(data.recent || []);
      }
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/whatsapp/chats/${conversationId}/ai-config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "AI configuration saved successfully",
        });
        onConfigChange?.(config);
        await loadUsageStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save configuration",
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus('testing');
    try {
      const response = await fetch('/api/ai/test');
      const result = await response.json();
      
      if (result.success) {
        setConnectionStatus('connected');
        toast({
          title: "AI Connected",
          description: "LangGraph agent is working properly",
        });
      } else {
        setConnectionStatus('error');
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: result.error || "Unknown error",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to test AI connection",
      });
    } finally {
      setTesting(false);
    }
  };

  const sendTestMessage = async () => {
    try {
      const response = await fetch('/api/whatsapp/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: conversationId,
          message: "@bb Hello! Can you help me find some good breakfast cereals?",
          userId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Test Success",
          description: "AI responded successfully",
        });
        await loadUsageStats();
      } else {
        toast({
          variant: "destructive",
          title: "Test Failed",
          description: result.error || "Unknown error",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send test message",
      });
    }
  };

  const updateConfig = (updates: Partial<AIConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading AI configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Status Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                config.enabled 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-gray-400'
              }`} />
              <div>
                <CardTitle className="text-lg">BargainB AI Assistant</CardTitle>
                <CardDescription>
                  {config.enabled 
                    ? 'Active for this conversation' 
                    : 'Disabled for this conversation'
                  }
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={testing}
              >
                {testing ? (
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                Test Connection
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Connection Status */}
        {connectionStatus && (
          <CardContent className="pt-0">
            <Alert className={
              connectionStatus === 'connected' 
                ? 'border-green-200 bg-green-50' 
                : connectionStatus === 'error' 
                  ? 'border-red-200 bg-red-50'
                  : 'border-yellow-200 bg-yellow-50'
            }>
              <AlertDescription className="flex items-center gap-2">
                {connectionStatus === 'connected' && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-800">LangGraph agent is connected and ready</span>
                  </>
                )}
                {connectionStatus === 'error' && (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-800">AI connection failed</span>
                  </>
                )}
                {connectionStatus === 'testing' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-800">Testing AI connection...</span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Basic Settings */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Basic Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enable/Disable AI */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Enable AI Assistant</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Allow users to trigger AI with @bb mentions
                  </p>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(checked) => updateConfig({ enabled: checked })}
                />
              </div>

              {config.enabled && (
                <>
                  {/* Response Style */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Response Style</Label>
                    <Select
                      value={config.response_style}
                      onValueChange={(value: 'concise' | 'detailed' | 'helpful') =>
                        updateConfig({ response_style: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concise">Concise & Quick</SelectItem>
                        <SelectItem value="detailed">Detailed & Thorough</SelectItem>
                        <SelectItem value="helpful">Helpful & Friendly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Auto Response */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Auto Response</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        AI responds automatically to @bb mentions
                      </p>
                    </div>
                    <Switch
                      checked={config.auto_respond}
                      onCheckedChange={(checked) => updateConfig({ auto_respond: checked })}
                    />
                  </div>

                  {/* Test AI Button */}
                  <Button
                    onClick={sendTestMessage}
                    variant="outline"
                    className="w-full"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Send Test Message
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Product search across Dutch supermarkets
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Price comparison (Albert Heijn, Jumbo, Dirk)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Meal planning and recipe suggestions
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Budget tracking and recommendations
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Personalized shopping lists
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Guard Rails</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enable safety checks for AI responses
                  </p>
                </div>
                <Switch
                  checked={config.guard_rails_enabled}
                  onCheckedChange={(checked) => updateConfig({ guard_rails_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Spam Detection</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Detect and filter spam messages
                  </p>
                </div>
                <Switch
                  checked={config.spam_detection}
                  onCheckedChange={(checked) => updateConfig({ spam_detection: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Content Filtering</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Filter inappropriate content
                  </p>
                </div>
                <Switch
                  checked={config.content_filtering}
                  onCheckedChange={(checked) => updateConfig({ content_filtering: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Performance & Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Max Message Length</Label>
                <Input
                  type="number"
                  value={config.max_message_length}
                  onChange={(e) => updateConfig({ max_message_length: parseInt(e.target.value) || 500 })}
                  min="100"
                  max="2000"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum characters for AI responses (100-2000)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Request Timeout (seconds)</Label>
                <Input
                  type="number"
                  value={config.request_timeout}
                  onChange={(e) => updateConfig({ request_timeout: parseInt(e.target.value) || 30 })}
                  min="10"
                  max="120"
                />
                <p className="text-xs text-muted-foreground">
                  Timeout for AI requests (10-120 seconds)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Max Tool Calls</Label>
                <Input
                  type="number"
                  value={config.max_tool_calls}
                  onChange={(e) => updateConfig({ max_tool_calls: parseInt(e.target.value) || 5 })}
                  min="1"
                  max="20"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum tool calls per AI response (1-20)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Max Tokens per Request</Label>
                <Input
                  type="number"
                  value={config.max_tokens_per_request}
                  onChange={(e) => updateConfig({ max_tokens_per_request: parseInt(e.target.value) || 4000 })}
                  min="1000"
                  max="10000"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum tokens per AI request (1000-10000)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Max Tokens per Hour</Label>
                <Input
                  type="number"
                  value={config.max_tokens_per_hour}
                  onChange={(e) => updateConfig({ max_tokens_per_hour: parseInt(e.target.value) || 20000 })}
                  min="5000"
                  max="100000"
                />
                <p className="text-xs text-muted-foreground">
                  Hourly token limit per user (5000-100000)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Temperature: {config.temperature}</Label>
                <Slider
                  value={[config.temperature]}
                  onValueChange={(value) => updateConfig({ temperature: value[0] })}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Controls AI creativity (0 = focused, 1 = creative)
                </p>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Fallback Responses</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use fallback responses when AI fails
                  </p>
                </div>
                <Switch
                  checked={config.fallback_responses}
                  onCheckedChange={(checked) => updateConfig({ fallback_responses: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Custom Instructions</Label>
                <Textarea
                  value={config.custom_instructions}
                  onChange={(e) => updateConfig({ custom_instructions: e.target.value })}
                  placeholder="Enter custom instructions for the AI agent..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Additional instructions to guide AI behavior
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Usage Statistics */}
      {config.enabled && usage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent AI Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usage.slice(0, 3).map((interaction, index) => (
                <div key={index} className="text-sm p-3 bg-muted/50 rounded border">
                  <div className="font-medium truncate mb-1">
                    {interaction.user_message?.substring(0, 60)}...
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {interaction.processing_time_ms}ms
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {interaction.tokens_used} tokens
                    </span>
                    <span>{new Date(interaction.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Configuration */}
      <div className="flex gap-2">
        <Button
          onClick={saveConfig}
          disabled={saving}
          className="flex-1"
        >
          {saving ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Configuration
        </Button>
      </div>
    </div>
  );
} 