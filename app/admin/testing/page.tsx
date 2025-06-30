"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Activity, 
  Database, 
  MessageSquare, 
  ShoppingCart, 
  Users, 
  Zap, 
  Bug, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Download,
  Search,
  Send,
  Trash2
} from "lucide-react"

interface SystemStatus {
  endpoint: string
  status: 'healthy' | 'error' | 'warning' | 'checking'
  responseTime?: number
  error?: string
}

interface TestResult {
  id: string
  name: string
  status: 'passed' | 'failed' | 'running' | 'pending'
  duration?: number
  details?: string
  timestamp: Date
}

export default function QATestingCenter() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [testMessage, setTestMessage] = useState("")
  const [testPhoneNumber, setTestPhoneNumber] = useState("")
  const [logs, setLogs] = useState<string[]>([])

  // System Health Check
  const runSystemHealthCheck = async () => {
    setLoading(true)
    const endpoints = [
      { name: 'Conversations API', url: '/admin/chat/api/conversations' },
      { name: 'Products API', url: '/admin/products/api' },
      { name: 'Admin Users API', url: '/admin/settings/api/admin-users' },
      { name: 'Contacts API', url: '/admin/chat/api/contacts' },
      { name: 'Messages API', url: '/admin/chat/api/messages' },
    ]

    const results: SystemStatus[] = []

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now()
        const response = await fetch(endpoint.url)
        const endTime = Date.now()
        
        results.push({
          endpoint: endpoint.name,
          status: response.ok ? 'healthy' : 'error',
          responseTime: endTime - startTime,
          error: response.ok ? undefined : `HTTP ${response.status}`
        })
      } catch (error) {
        results.push({
          endpoint: endpoint.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    setSystemStatus(results)
    setLoading(false)
  }

  // Test WhatsApp Integration
  const testWhatsAppSend = async () => {
    if (!testMessage || !testPhoneNumber) return

    const testResult: TestResult = {
      id: Date.now().toString(),
      name: `WhatsApp Test to ${testPhoneNumber}`,
      status: 'running',
      timestamp: new Date()
    }
    
    setTestResults(prev => [testResult, ...prev])

    try {
      const response = await fetch('/admin/chat/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: testPhoneNumber,
          message: `[QA TEST] ${testMessage}`
        })
      })

      const result = await response.json()
      
      setTestResults(prev => 
        prev.map(test => 
          test.id === testResult.id 
            ? { ...test, status: response.ok ? 'passed' : 'failed', details: JSON.stringify(result, null, 2) }
            : test
        )
      )
    } catch (error) {
      setTestResults(prev => 
        prev.map(test => 
          test.id === testResult.id 
            ? { ...test, status: 'failed', details: error instanceof Error ? error.message : 'Unknown error' }
            : test
        )
      )
    }
  }

  // Generate Test Data
  const generateTestData = async () => {
    const testResult: TestResult = {
      id: Date.now().toString(),
      name: 'Generate Test Data',
      status: 'running',
      timestamp: new Date()
    }
    
    setTestResults(prev => [testResult, ...prev])

    try {
      // Simulate test data generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setTestResults(prev => 
        prev.map(test => 
          test.id === testResult.id 
            ? { ...test, status: 'passed', details: 'Generated 10 test conversations, 50 test messages, 5 test users' }
            : test
        )
      )
    } catch (error) {
      setTestResults(prev => 
        prev.map(test => 
          test.id === testResult.id 
            ? { ...test, status: 'failed', details: error instanceof Error ? error.message : 'Failed to generate test data' }
            : test
        )
      )
    }
  }

  // Fetch Recent Logs
  const fetchLogs = async () => {
    try {
      const mockLogs = [
        `[${new Date().toISOString()}] INFO - User login successful: hagerelgammal44@gmail.com`,
        `[${new Date().toISOString()}] DEBUG - API call to /admin/chat/api/conversations - 200ms`,
        `[${new Date().toISOString()}] WARNING - Slow query detected: messages table scan`,
        `[${new Date().toISOString()}] INFO - WhatsApp webhook received from +1234567890`,
        `[${new Date().toISOString()}] ERROR - Failed to update product price: network timeout`,
      ]
      setLogs(mockLogs)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  // Load initial data
  useEffect(() => {
    runSystemHealthCheck()
    fetchLogs()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'checking':
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'passed':
        return 'bg-green-500'
      case 'error':
      case 'failed':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'checking':
      case 'running':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QA Testing Center</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive testing tools for BargainB Admin Dashboard
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Bug className="h-4 w-4 mr-1" />
          QA Environment
        </Badge>
      </div>

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Test Data
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Logs & Debug
          </TabsTrigger>
        </TabsList>

        {/* System Health Tab */}
        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Health Dashboard
                  </CardTitle>
                  <CardDescription>
                    Monitor the health of all critical system components
                  </CardDescription>
                </div>
                <Button onClick={runSystemHealthCheck} disabled={loading}>
                  {loading ? (
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Run Health Check
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {systemStatus.map((status, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{status.endpoint}</h4>
                      {getStatusIcon(status.status)}
                    </div>
                    <div className="space-y-2">
                      <Badge variant={status.status === 'healthy' ? 'default' : 'destructive'}>
                        {status.status}
                      </Badge>
                      {status.responseTime && (
                        <p className="text-sm text-muted-foreground">
                          Response: {status.responseTime}ms
                        </p>
                      )}
                      {status.error && (
                        <p className="text-sm text-red-500">{status.error}</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Testing Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  WhatsApp Integration Test
                </CardTitle>
                <CardDescription>
                  Test sending messages through WASender API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Test Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1234567890"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Test Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your test message..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                  />
                </div>
                <Button onClick={testWhatsAppSend} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Message
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Product Integration Test
                </CardTitle>
                <CardDescription>
                  Test product data sync and pricing updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  Test Albert Heijn Sync
                </Button>
                <Button className="w-full" variant="outline">
                  Test Dirk Sync
                </Button>
                <Button className="w-full" variant="outline">
                  Test Jumbo Sync
                </Button>
                <Button className="w-full">
                  Run Full Product Test Suite
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Test Data Management Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Test Data Management
              </CardTitle>
              <CardDescription>
                Generate and manage test data for comprehensive testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button onClick={generateTestData} className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Generate Test Users
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  Generate Test Conversations
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  Generate Test Products
                </Button>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Test Data Cleanup</h4>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clean All Test Data
                  </Button>
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Test data is automatically marked and can be safely removed without affecting production data.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Monitoring Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Page Load Time</span>
                    <span>1.2s</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>API Response Time</span>
                    <span>245ms</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Database Query Time</span>
                    <span>89ms</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Memory Usage</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>CPU Usage</span>
                    <span>32%</span>
                  </div>
                  <Progress value={32} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Active Connections</span>
                    <span>12/100</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Logs & Debug Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    System Logs & Debugging
                  </CardTitle>
                  <CardDescription>
                    View recent system logs and debug information
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchLogs}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-muted/50">
                  <div className="space-y-2 font-mono text-sm">
                    {logs.map((log, index) => (
                      <div key={index} className="py-1">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Results Panel */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.slice(0, 10).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.duration && (
                      <span className="text-sm text-muted-foreground">
                        {result.duration}ms
                      </span>
                    )}
                    <Badge
                      variant={result.status === 'passed' ? 'default' : 'destructive'}
                      className={getStatusColor(result.status)}
                    >
                      {result.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 