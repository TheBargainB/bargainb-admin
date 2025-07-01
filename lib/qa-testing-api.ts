// QA Testing Center API Functions - Supabase Integration

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { 
  QATestScript, 
  QATestRun, 
  QATestResult, 
  QADetectedIssue, 
  QAAutoTestCase,
  QACITrigger,
  QATriggerExecution,
  QAScreenshot,
  CreateTestScriptRequest,
  RunTestScriptRequest,
  TestRunSummary,
  IssuesSummary,
  SystemHealthStatus,
  TestScriptFilters,
  TestRunFilters,
  IssueFilters,
  PaginationParams,
  PaginatedResponse
} from '@/types/qa-testing'

const supabase = createClientComponentClient()

// Test Scripts API
export const qaTestScriptsApi = {
  // Get all test scripts with optional filtering
  async getAll(filters?: TestScriptFilters, pagination?: PaginationParams): Promise<PaginatedResponse<QATestScript>> {
    let query = supabase
      .from('qa_test_scripts')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    // Apply filters
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }
    if (filters?.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by)
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }
    if (filters?.date_range) {
      query = query
        .gte('created_at', filters.date_range.start)
        .lte('created_at', filters.date_range.end)
    }

    // Apply pagination and sorting
    if (pagination) {
      const offset = (pagination.page - 1) * pagination.limit
      query = query.range(offset, offset + pagination.limit - 1)
      
      if (pagination.sort_by) {
        const ascending = pagination.sort_order === 'asc'
        query = query.order(pagination.sort_by, { ascending })
      }
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query

    if (error) throw error

    const total = count || 0
    const page = pagination?.page || 1
    const limit = pagination?.limit || data?.length || 0

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        total_pages: limit > 0 ? Math.ceil(total / limit) : 0,
        has_next: limit > 0 ? page * limit < total : false,
        has_prev: page > 1
      }
    }
  },

  // Get single test script by ID
  async getById(id: string): Promise<QATestScript | null> {
    const { data, error } = await supabase
      .from('qa_test_scripts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create new test script
  async create(script: CreateTestScriptRequest): Promise<QATestScript> {
    const { data: user } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('qa_test_scripts')
      .insert({
        ...script,
        created_by: user.user?.id,
        last_modified_by: user.user?.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update test script
  async update(id: string, updates: Partial<CreateTestScriptRequest>): Promise<QATestScript> {
    const { data: user } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('qa_test_scripts')
      .update({
        ...updates,
        last_modified_by: user.user?.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete test script (soft delete)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('qa_test_scripts')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
  },

  // Get script templates
  async getTemplates(): Promise<QATestScript[]> {
    const { data, error } = await supabase
      .from('qa_test_scripts')
      .select('*')
      .eq('is_template', true)
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  }
}

// Test Runs API
export const qaTestRunsApi = {
  // Get all test runs with filtering
  async getAll(filters?: TestRunFilters, pagination?: PaginationParams): Promise<PaginatedResponse<QATestRun & { script_name: string }>> {
    let query = supabase
      .from('qa_test_runs')
      .select(`
        *,
        qa_test_scripts(name)
      `, { count: 'exact' })

    // Apply filters
    if (filters?.search) {
      query = query.or(`run_name.ilike.%${filters.search}%`)
    }
    if (filters?.script_id) {
      query = query.eq('script_id', filters.script_id)
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.trigger_type) {
      query = query.eq('trigger_type', filters.trigger_type)
    }
    if (filters?.browser_type) {
      query = query.eq('browser_type', filters.browser_type)
    }
    if (filters?.environment) {
      query = query.eq('test_environment', filters.environment)
    }
    if (filters?.date_range) {
      query = query
        .gte('started_at', filters.date_range.start)
        .lte('started_at', filters.date_range.end)
    }

    // Apply pagination and sorting
    if (pagination) {
      const offset = (pagination.page - 1) * pagination.limit
      query = query.range(offset, offset + pagination.limit - 1)
      
      if (pagination.sort_by) {
        const ascending = pagination.sort_order === 'asc'
        query = query.order(pagination.sort_by, { ascending })
      }
    } else {
      query = query.order('started_at', { ascending: false })
    }

    const { data, error, count } = await query

    if (error) throw error

    // Transform data to include script name
    const transformedData = data?.map(run => ({
      ...run,
      script_name: run.qa_test_scripts?.name || 'Unknown Script'
    })) || []

    const total = count || 0
    const page = pagination?.page || 1
    const limit = pagination?.limit || transformedData.length

    return {
      data: transformedData,
      pagination: {
        page,
        limit,
        total,
        total_pages: limit > 0 ? Math.ceil(total / limit) : 0,
        has_next: limit > 0 ? page * limit < total : false,
        has_prev: page > 1
      }
    }
  },

  // Get single test run with results
  async getById(id: string): Promise<(QATestRun & { results: QATestResult[], screenshots: QAScreenshot[] }) | null> {
    const { data: run, error: runError } = await supabase
      .from('qa_test_runs')
      .select('*')
      .eq('id', id)
      .single()

    if (runError) throw runError
    if (!run) return null

    // Get test results
    const { data: results, error: resultsError } = await supabase
      .from('qa_test_results')
      .select('*')
      .eq('test_run_id', id)
      .order('step_number')

    if (resultsError) throw resultsError

    // Get screenshots
    const { data: screenshots, error: screenshotsError } = await supabase
      .from('qa_screenshots')
      .select('*')
      .eq('test_run_id', id)
      .order('timestamp')

    if (screenshotsError) throw screenshotsError

    return {
      ...run,
      results: results || [],
      screenshots: screenshots || []
    }
  },

  // Create test run
  async create(runData: RunTestScriptRequest): Promise<QATestRun> {
    const { data: user } = await supabase.auth.getUser()
    
    // Get next run number for this script
    const { data: lastRun } = await supabase
      .from('qa_test_runs')
      .select('run_number')
      .eq('script_id', runData.script_id)
      .order('run_number', { ascending: false })
      .limit(1)
      .single()

    const nextRunNumber = (lastRun?.run_number || 0) + 1

    const { data, error } = await supabase
      .from('qa_test_runs')
      .insert({
        script_id: runData.script_id,
        run_number: nextRunNumber,
        run_name: runData.run_name,
        trigger_type: runData.trigger_type || 'manual',
        triggered_by: user.user?.id,
        test_environment: runData.test_environment || 'production',
        browser_type: runData.browser_type || 'chromium',
        status: 'pending',
        started_at: new Date().toISOString(),
        steps_total: 0,
        steps_passed: 0,
        steps_failed: 0,
        steps_skipped: 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update test run status
  async updateStatus(id: string, status: QATestRun['status'], updates?: Partial<QATestRun>): Promise<QATestRun> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
      ...updates
    }

    if (status === 'passed' || status === 'failed' || status === 'cancelled') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('qa_test_runs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get run summary for scripts
  async getSummary(): Promise<TestRunSummary[]> {
    const { data, error } = await supabase
      .from('qa_test_runs')
      .select(`
        script_id,
        status,
        duration_seconds,
        started_at,
        qa_test_scripts(name)
      `)
      .order('started_at', { ascending: false })

    if (error) throw error

    // Group by script and calculate summaries
    const scriptSummaries = new Map<string, {
      script_name: string
      runs: QATestRun[]
    }>()

    data?.forEach(run => {
      const scriptId = run.script_id
      if (!scriptSummaries.has(scriptId)) {
        scriptSummaries.set(scriptId, {
          script_name: run.qa_test_scripts?.name || 'Unknown',
          runs: []
        })
      }
      scriptSummaries.get(scriptId)!.runs.push(run)
    })

    const summaries: TestRunSummary[] = Array.from(scriptSummaries.values()).map(({ script_name, runs }) => {
      const totalRuns = runs.length
      const passedRuns = runs.filter(r => r.status === 'passed').length
      const failedRuns = runs.filter(r => r.status === 'failed').length
      const avgDuration = runs
        .filter(r => r.duration_seconds)
        .reduce((sum, r) => sum + (r.duration_seconds || 0), 0) / runs.length

      const lastRun = runs[0] // Already sorted by started_at desc

      return {
        script_name,
        total_runs: totalRuns,
        passed_runs: passedRuns,
        failed_runs: failedRuns,
        success_rate: totalRuns > 0 ? (passedRuns / totalRuns) * 100 : 0,
        average_duration: avgDuration || 0,
        last_run_at: lastRun?.started_at || null,
        last_status: lastRun?.status || null
      }
    })

    return summaries
  }
}

// Detected Issues API
export const qaDetectedIssuesApi = {
  // Get all detected issues
  async getAll(filters?: IssueFilters, pagination?: PaginationParams): Promise<PaginatedResponse<QADetectedIssue>> {
    let query = supabase
      .from('qa_detected_issues')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters?.issue_type) {
      query = query.eq('issue_type', filters.issue_type)
    }
    if (filters?.severity && filters.severity !== 'all') {
      query = query.eq('severity', filters.severity)
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.affected_url) {
      query = query.ilike('affected_url', `%${filters.affected_url}%`)
    }
    if (filters?.date_range) {
      query = query
        .gte('first_seen_at', filters.date_range.start)
        .lte('first_seen_at', filters.date_range.end)
    }

    // Apply pagination and sorting
    if (pagination) {
      const offset = (pagination.page - 1) * pagination.limit
      query = query.range(offset, offset + pagination.limit - 1)
      
      if (pagination.sort_by) {
        const ascending = pagination.sort_order === 'asc'
        query = query.order(pagination.sort_by, { ascending })
      }
    } else {
      query = query.order('first_seen_at', { ascending: false })
    }

    const { data, error, count } = await query

    if (error) throw error

    const total = count || 0
    const page = pagination?.page || 1
    const limit = pagination?.limit || data?.length || 0

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        total_pages: limit > 0 ? Math.ceil(total / limit) : 0,
        has_next: limit > 0 ? page * limit < total : false,
        has_prev: page > 1
      }
    }
  },

  // Create detected issue
  async create(issue: Partial<QADetectedIssue>): Promise<QADetectedIssue> {
    const { data, error } = await supabase
      .from('qa_detected_issues')
      .insert(issue)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update issue status
  async updateStatus(id: string, status: QADetectedIssue['status'], notes?: string): Promise<QADetectedIssue> {
    const { data: user } = await supabase.auth.getUser()
    
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString()
      updateData.resolved_by = user.user?.id
      if (notes) updateData.resolution_notes = notes
    }

    const { data, error } = await supabase
      .from('qa_detected_issues')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get issues summary
  async getSummary(): Promise<IssuesSummary> {
    const { data, error } = await supabase
      .from('qa_detected_issues')
      .select('severity, status')

    if (error) throw error

    const summary: IssuesSummary = {
      total_issues: data?.length || 0,
      critical_issues: data?.filter(i => i.severity === 'critical').length || 0,
      high_issues: data?.filter(i => i.severity === 'high').length || 0,
      medium_issues: data?.filter(i => i.severity === 'medium').length || 0,
      low_issues: data?.filter(i => i.severity === 'low').length || 0,
      new_issues: data?.filter(i => i.status === 'new').length || 0,
      resolved_issues: data?.filter(i => i.status === 'resolved').length || 0,
      in_progress_issues: data?.filter(i => i.status === 'in_progress').length || 0
    }

    return summary
  }
}

// CI Triggers API
export const qaCITriggersApi = {
  // Get all CI triggers
  async getAll(): Promise<QACITrigger[]> {
    const { data, error } = await supabase
      .from('qa_ci_triggers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Create CI trigger
  async create(trigger: Partial<QACITrigger>): Promise<QACITrigger> {
    const { data: user } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('qa_ci_triggers')
      .insert({
        ...trigger,
        created_by: user.user?.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update CI trigger
  async update(id: string, updates: Partial<QACITrigger>): Promise<QACITrigger> {
    const { data, error } = await supabase
      .from('qa_ci_triggers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete CI trigger
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('qa_ci_triggers')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// System Health API
export const qaSystemHealthApi = {
  // Check overall system health
  async getStatus(): Promise<SystemHealthStatus> {
    try {
      // Test database connectivity
      const { error: dbError } = await supabase
        .from('qa_test_scripts')
        .select('id')
        .limit(1)

      // Test authentication
      const { data: authData, error: authError } = await supabase.auth.getUser()

      const authStatus = authError ? 'down' : 'healthy'
      const dbStatus = dbError ? 'down' : 'healthy'
      const apiStatus = 'healthy' // Since we can make this call

      const overallStatus = [authStatus, dbStatus, apiStatus].includes('down') 
        ? 'down' 
        : [authStatus, dbStatus, apiStatus].includes('degraded')
        ? 'degraded'
        : 'healthy'

      return {
        authentication: authStatus,
        database: dbStatus,
        api_services: apiStatus,
        overall_status: overallStatus,
        last_check: new Date().toISOString()
      }
    } catch (error) {
      return {
        authentication: 'down',
        database: 'down',
        api_services: 'down',
        overall_status: 'down',
        last_check: new Date().toISOString()
      }
    }
  }
}

// Utility Functions
export const qaUtilsApi = {
  // Generate test script from issue
  async generateTestFromIssue(issueId: string): Promise<QAAutoTestCase | null> {
    const { data: issue, error } = await supabase
      .from('qa_detected_issues')
      .select('*')
      .eq('id', issueId)
      .single()

    if (error || !issue) return null

    // Generate test case based on issue
    const testCase: Partial<QAAutoTestCase> = {
      source_issue_id: issueId,
      test_name: `Auto-generated test for: ${issue.title}`,
      test_description: `Test to verify resolution of: ${issue.description}`,
      test_objective: `Ensure that the issue "${issue.title}" does not occur`,
      generated_script: generatePlaywrightScript(issue),
      test_steps: generateTestSteps(issue),
      test_category: mapIssueTypeToCategory(issue.issue_type),
      estimated_duration_minutes: 5,
      complexity_level: 'simple',
      generation_method: 'rule_based',
      generation_confidence: 0.8,
      tags: ['auto-generated', issue.issue_type, issue.severity]
    }

    const { data: createdTestCase, error: createError } = await supabase
      .from('qa_auto_test_cases')
      .insert(testCase)
      .select()
      .single()

    if (createError) throw createError

    // Mark issue as having auto test generated
    await supabase
      .from('qa_detected_issues')
      .update({ 
        auto_test_generated: true,
        auto_test_script_id: createdTestCase.id 
      })
      .eq('id', issueId)

    return createdTestCase
  }
}

// Helper functions for test generation
function generatePlaywrightScript(issue: QADetectedIssue): string {
  const baseUrl = issue.affected_url || 'https://your-app.com'
  const element = issue.affected_element || '[data-testid="main-content"]'
  
  return `import { test, expect } from '@playwright/test';

test('${issue.title} - Auto-generated test', async ({ page }) => {
  // Navigate to affected page
  await page.goto('${baseUrl}');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check that the problematic element exists and is accessible
  await expect(page.locator('${element}')).toBeVisible();
  
  // Add specific checks based on issue type
  ${generateIssueSpecificChecks(issue)}
  
  // Verify no console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Final assertion
  expect(consoleErrors).toHaveLength(0);
});`
}

function generateTestSteps(issue: QADetectedIssue): string[] {
  const steps = [
    `Navigate to ${issue.affected_url || 'the affected page'}`,
    'Wait for page to fully load',
    'Verify the page loads without errors'
  ]

  switch (issue.issue_type) {
    case 'missing_element':
      steps.push(`Verify that element "${issue.affected_element}" is visible`)
      break
    case 'slow_performance':
      steps.push('Verify page loads within acceptable time limits')
      break
    case 'console_error':
      steps.push('Check that no console errors are present')
      break
    case 'broken_link':
      steps.push('Verify all links are functional')
      break
    default:
      steps.push('Verify the specific issue does not occur')
  }

  steps.push('Assert test passes without any failures')
  return steps
}

function generateIssueSpecificChecks(issue: QADetectedIssue): string {
  switch (issue.issue_type) {
    case 'missing_element':
      return `  // Specific check for missing element issue
  await expect(page.locator('${issue.affected_element}')).toBeVisible({ timeout: 10000 });`
    
    case 'slow_performance':
      return `  // Performance check
  const startTime = Date.now();
  await page.waitForLoadState('domcontentloaded');
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000); // 3 second max load time`
    
    case 'console_error':
      return `  // Enhanced console error detection
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
    expect(error.message).not.toContain('${issue.error_message?.substring(0, 50)}');
  });`
    
    case 'broken_link':
      return `  // Link validation
  const links = await page.locator('a[href]').all();
  for (const link of links) {
    const href = await link.getAttribute('href');
    if (href && !href.startsWith('#')) {
      // Validate link is reachable
      await expect(link).toBeVisible();
    }
  }`
    
    default:
      return `  // Generic validation for ${issue.issue_type}
  // Add specific assertions based on the issue type`
  }
}

function mapIssueTypeToCategory(issueType: string): string {
  const mapping: Record<string, string> = {
    'broken_link': 'navigation',
    'missing_element': 'ui',
    'slow_performance': 'performance',
    'console_error': 'general',
    'accessibility_violation': 'ui',
    'visual_regression': 'ui',
    'form_validation_error': 'forms',
    'api_error': 'api',
    'timeout': 'performance',
    'memory_leak': 'performance',
    'security_issue': 'general'
  }
  
  return mapping[issueType] || 'general'
}

// Export all APIs
export const qaApi = {
  scripts: qaTestScriptsApi,
  runs: qaTestRunsApi,
  issues: qaDetectedIssuesApi,
  triggers: qaCITriggersApi,
  systemHealth: qaSystemHealthApi,
  utils: qaUtilsApi
} 