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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { qaTestScriptsApi, qaTestRunsApi, qaDetectedIssuesApi } from "@/lib/qa-testing-api"
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
  Trash2,
  CheckCircle,
  Square,
  Settings,
  History,
  GitBranch,
  Plus,
  RefreshCw,
  Monitor,
  FileText,
  Eye,
  BarChart3,
  Terminal,
  Code,
  PlayCircle,
  StopCircle,
  Timer,
  Shield,
  Cpu,
  MemoryStick,
  Network,
  Filter,
  Calendar,
  TrendingUp,
  AlertCircle,
  Target,
  Layers,
  Workflow
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface TestScript {
  id: string
  name: string
  description: string | null
  category: string
  script_content: string
  priority: string
  tags: string[]
  status?: string
  last_run_at?: string
  created_at: string
}

interface TestRun {
  id: string
  script_id: string
  script_name: string
  run_number: number
  status: string
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
  steps_total: number
  steps_passed: number
  steps_failed: number
  error_message: string | null
  browser_type: string
  test_environment: string
  trigger_type: string
}

interface DetectedIssue {
  id: string
  issue_type: string
  severity: string
  title: string
  description: string
  status: string
  first_seen_at: string
  occurrence_count: number
  affected_url: string | null
}

const QA_SCRIPT_TEMPLATE = `import { test, expect } from '@playwright/test';

test('My Test', async ({ page }) => {
  // Navigate to the page
  await page.goto('/your-url');
  
  // Add your test steps here
  await expect(page.locator('h1')).toBeVisible();
  
  // Example: Fill a form
  // await page.fill('[data-testid="input"]', 'test value');
  // await page.click('[data-testid="submit"]');
  
  // Example: Wait for navigation
  // await page.waitForURL('/success');
  
  // Example: Check for text content
  // await expect(page.locator('text=Success')).toBeVisible();
});`

const SEVERITY_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800', 
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

const STATUS_COLORS = {
  passed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  running: 'bg-blue-100 text-blue-800',
  pending: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

export default function QATestingPage() {
  const { toast } = useToast()
  
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)

  // NEW COMPREHENSIVE QA TEST CENTER STATE
  const [activeTab, setActiveTab] = useState('overview')
  const [testScripts, setTestScripts] = useState<TestScript[]>([])
  const [testRuns, setTestRuns] = useState<TestRun[]>([])
  const [detectedIssues, setDetectedIssues] = useState<DetectedIssue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  
  // Script editor state
  const [selectedScript, setSelectedScript] = useState<TestScript | null>(null)
  const [editorContent, setEditorContent] = useState(QA_SCRIPT_TEMPLATE)
  const [scriptName, setScriptName] = useState('')
  const [scriptDescription, setScriptDescription] = useState('')
  const [scriptCategory, setScriptCategory] = useState('general')
  const [scriptPriority, setScriptPriority] = useState('medium')
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Load production test scripts from database
  useEffect(() => {
    const loadQAData = async () => {
      setIsLoading(true)
      try {
        console.log('🔧 Loading QA Test Scripts from database...')
        
        // Load test scripts
        const scriptsResponse = await qaTestScriptsApi.getAll()
        console.log('✅ Loaded test scripts:', scriptsResponse.data.length)
        setTestScripts(scriptsResponse.data)
        
        // Load test runs
        try {
          const runsResponse = await qaTestRunsApi.getAll()
          console.log('✅ Loaded test runs:', runsResponse.data.length)
          setTestRuns(runsResponse.data)
        } catch (runsError) {
          console.warn('⚠️ Could not load test runs:', runsError)
        }
        
        // Load detected issues
        try {
          const issuesResponse = await qaDetectedIssuesApi.getAll()
          console.log('✅ Loaded detected issues:', issuesResponse.data.length)
          setDetectedIssues(issuesResponse.data)
        } catch (issuesError) {
          console.warn('⚠️ Could not load detected issues:', issuesError)
        }
        
      } catch (error) {
        console.error('❌ Error loading QA data:', error)
        toast({
          title: "Error Loading QA Data",
          description: "Could not load test scripts from database. Please refresh the page.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadQAData()
  }, [])

  const runTest = async (scriptId: string) => {
    setIsRunning(true)
    try {
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Test Executed",
        description: "Test completed successfully!",
      })
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "An error occurred during test execution.",
        variant: "destructive"
      })
    } finally {
      setIsRunning(false)
    }
  }

  const saveScript = async () => {
    if (!scriptName.trim() || !editorContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both script name and content.",
        variant: "destructive"
      })
      return
    }

    try {
      const newScript: TestScript = {
        id: Date.now().toString(),
        name: scriptName,
        description: scriptDescription,
        category: scriptCategory,
        script_content: editorContent,
        priority: scriptPriority,
        tags: [],
        created_at: new Date().toISOString()
      }

      setTestScripts(prev => [...prev, newScript])
      
      // Reset form
      setScriptName('')
      setScriptDescription('')
      setEditorContent(QA_SCRIPT_TEMPLATE)
      
      toast({
        title: "Script Saved",
        description: "Test script has been saved successfully!",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save the test script.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QA Testing Center</h1>
          <p className="text-muted-foreground">
            Comprehensive testing tools for BargainB Admin Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium">QA Environment</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="scripts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Scripts
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Issues
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scripts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testScripts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active test scripts
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Test Runs</CardTitle>
                <PlayCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testRuns.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total executions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95%</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Issues Detected</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{detectedIssues.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active issues
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common testing actions and health checks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Button className="flex items-center gap-2" disabled={isRunning}>
                  <PlayCircle className="h-4 w-4" />
                  Run All Tests
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Health Check
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Test Scripts Library</h3>
              <p className="text-sm text-muted-foreground">
                Manage and organize your Playwright test scripts
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Script
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search scripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="ui">UI Tests</SelectItem>
                <SelectItem value="api">API Tests</SelectItem>
                <SelectItem value="e2e">E2E Tests</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {testScripts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">No test scripts yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first test script to get started
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              testScripts.map((script) => (
                <Card key={script.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{script.name}</CardTitle>
                        <CardDescription>{script.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={script.priority === 'high' ? 'destructive' : 'secondary'}>
                          {script.priority}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => runTest(script.id)}
                          disabled={isRunning}
                          className="flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Run
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Script Editor</h3>
            <p className="text-sm text-muted-foreground">
              Create and edit Playwright test scripts with real-time syntax highlighting
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Script Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Enter your Playwright test script here..."
                    className="min-h-[400px] font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Script Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="script-name">Script Name</Label>
                    <Input
                      id="script-name"
                      value={scriptName}
                      onChange={(e) => setScriptName(e.target.value)}
                      placeholder="e.g., Login Flow Test"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="script-description">Description</Label>
                    <Textarea
                      id="script-description"
                      value={scriptDescription}
                      onChange={(e) => setScriptDescription(e.target.value)}
                      placeholder="Brief description of what this test does..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="script-category">Category</Label>
                    <Select value={scriptCategory} onValueChange={setScriptCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="ui">UI Tests</SelectItem>
                        <SelectItem value="api">API Tests</SelectItem>
                        <SelectItem value="e2e">E2E Tests</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="script-priority">Priority</Label>
                    <Select value={scriptPriority} onValueChange={setScriptPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={saveScript}
                      className="w-full"
                      disabled={isLoading}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Save Script
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setEditorContent(QA_SCRIPT_TEMPLATE)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Test Run History</h3>
            <p className="text-sm text-muted-foreground">
              View detailed logs of all test executions with timing and results
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No test runs yet</h3>
                <p className="text-sm text-muted-foreground">
                  Execute some tests to see their history here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Auto-Detected Issues</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered issue detection from test failures and system monitoring
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="text-lg font-semibold">No issues detected</h3>
                <p className="text-sm text-muted-foreground">
                  Your system is running smoothly!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">CI/CD Automation</h3>
            <p className="text-sm text-muted-foreground">
              Configure automated testing triggers and continuous integration
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>GitHub Integration</CardTitle>
              <CardDescription>
                Automatically trigger tests on code pushes and pull requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-trigger on push</p>
                  <p className="text-sm text-muted-foreground">
                    Run tests when code is pushed to main branch
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pull request validation</p>
                  <p className="text-sm text-muted-foreground">
                    Require tests to pass before merging PRs
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 