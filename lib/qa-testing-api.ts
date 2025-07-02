// QA Testing Center API Functions - Supabase Integration

import { supabase } from '@/lib/supabase'
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
import { Database } from './database.types'

// Database types for easier reference
type DbQATestScript = Database['public']['Tables']['qa_test_scripts']['Row']
type DbQATestRun = Database['public']['Tables']['qa_test_runs']['Row']
type DbQATestResult = Database['public']['Tables']['qa_test_results']['Row']
type DbQAScreenshot = Database['public']['Tables']['qa_screenshots']['Row']
type DbQADetectedIssue = Database['public']['Tables']['qa_detected_issues']['Row']
type DbQAAutoTestCase = Database['public']['Tables']['qa_auto_test_cases']['Row']
type DbQACITrigger = Database['public']['Tables']['qa_ci_triggers']['Row']

// Helper functions to convert database rows to application interfaces
const mapDbScriptToInterface = (dbScript: DbQATestScript): QATestScript => ({
  id: dbScript.id,
  name: dbScript.name || dbScript.script_name,
  description: dbScript.description,
  category: 'general' as const, // Default since not in DB
  script_content: dbScript.script_content,
  script_language: 'javascript' as const, // Default since not in DB
  timeout_seconds: 30, // Default since not in DB
  retry_count: 1, // Default since not in DB
  browser_type: 'chromium' as const, // Default since not in DB
  headless: true, // Default since not in DB
  test_environment: 'staging', // Default since not in DB
  priority: 'medium' as const, // Default since not in DB
  tags: [], // Default since not in DB
  base_url: null, // Default since not in DB
  viewport_width: null, // Default since not in DB
  viewport_height: null, // Default since not in DB
  prerequisites: null, // Default since not in DB
  expected_outcomes: null, // Default since not in DB
  is_active: dbScript.is_active ?? true,
  is_template: false, // Default since not in DB
  version: 1, // Default since not in DB
  parent_script_id: null, // Default since not in DB
  created_by: dbScript.created_by,
  last_modified_by: dbScript.created_by, // Use created_by as fallback
  created_at: dbScript.created_at || new Date().toISOString(),
  updated_at: dbScript.updated_at || new Date().toISOString()
})

const mapDbRunToInterface = (dbRun: DbQATestRun & { qa_test_scripts?: { name: string | null }[] }): QATestRun => ({
  id: dbRun.id,
  script_id: dbRun.script_id || '',
  run_number: dbRun.run_number || 1,
  run_name: dbRun.run_name,
  trigger_type: 'manual' as const, // Default since not in DB
  triggered_by: null, // Default since not in DB
  test_environment: dbRun.environment || 'staging',
  browser_type: 'chromium', // Default since not in DB
  browser_version: null, // Default since not in DB
  viewport_width: null, // Default since not in DB
  viewport_height: null, // Default since not in DB
  status: dbRun.status as any, // Cast to match interface
  started_at: dbRun.started_at || new Date().toISOString(),
  completed_at: dbRun.completed_at,
  duration_seconds: null, // Default since not in DB
  steps_total: 0, // Default since not in DB
  steps_passed: 0, // Default since not in DB
  steps_failed: 0, // Default since not in DB
  steps_skipped: 0, // Default since not in DB
  error_message: null, // Default since not in DB
  error_code: null, // Default since not in DB
  error_stack_trace: null, // Default since not in DB
  performance_metrics: {}, // Default since not in DB
  resource_usage: {}, // Default since not in DB
  exit_code: null, // Default since not in DB
  artifacts_stored: false, // Default since not in DB
  video_url: null, // Default since not in DB
  report_url: null, // Default since not in DB
  logs_url: null, // Default since not in DB
  retry_attempt: 0, // Default since not in DB
  parent_run_id: null, // Default since not in DB
  execution_context: {}, // Default since not in DB
  created_at: dbRun.created_at || new Date().toISOString(),
  updated_at: new Date().toISOString() // Default since not in DB
})

const mapDbResultToInterface = (dbResult: DbQATestResult): QATestResult => ({
  id: dbResult.id,
  test_run_id: dbResult.test_run_id || '',
  step_number: 1, // Default since not in DB
  step_name: 'Test Step', // Default since not in DB
  step_description: null, // Default since not in DB
  step_type: 'action' as const, // Default since not in DB
  status: dbResult.status as any, // Cast to match interface
  started_at: dbResult.created_at || new Date().toISOString(),
  completed_at: null, // Default since not in DB
  duration_ms: dbResult.execution_time || null,
  expected_result: null, // Default since not in DB
  actual_result: null, // Default since not in DB
  comparison_result: null, // Default since not in DB
  error_message: dbResult.error_message,
  error_type: null, // Default since not in DB
  screenshot_id: null, // Default since not in DB
  element_selector: null, // Default since not in DB
  element_text: null, // Default since not in DB
  element_attributes: null, // Default since not in DB
  page_url: null, // Default since not in DB
  page_title: null, // Default since not in DB
  network_activity: null, // Default since not in DB
  console_logs: null, // Default since not in DB
  performance_timing: null, // Default since not in DB
  retry_count: 0, // Default since not in DB
  is_critical_step: false, // Default since not in DB
  custom_data: dbResult.result_data as any || {}, // Cast Json to Record
  created_at: dbResult.created_at || new Date().toISOString()
})

const mapDbScreenshotToInterface = (dbScreenshot: DbQAScreenshot): QAScreenshot => ({
  id: dbScreenshot.id,
  test_run_id: dbScreenshot.test_run_id,
  test_result_id: null, // Default since not in DB
  screenshot_type: (dbScreenshot.screenshot_type as any) || 'step',
  file_path: dbScreenshot.screenshot_url,
  file_size_bytes: 0, // Default since not in DB
  image_width: null, // Default since not in DB
  image_height: null, // Default since not in DB
  viewport_width: null, // Default since not in DB
  viewport_height: null, // Default since not in DB
  page_url: null, // Default since not in DB
  element_selector: null, // Default since not in DB
  timestamp: dbScreenshot.created_at || new Date().toISOString(),
  description: null, // Default since not in DB
  is_baseline: false, // Default since not in DB
  baseline_screenshot_id: null, // Default since not in DB
  difference_percentage: null, // Default since not in DB
  annotations: null, // Default since not in DB
  compression_quality: null, // Default since not in DB
  created_at: dbScreenshot.created_at || new Date().toISOString()
})

const mapDbIssueToInterface = (dbIssue: DbQADetectedIssue): QADetectedIssue => ({
  id: dbIssue.id,
  detected_from_run_id: dbIssue.test_run_id,
  detected_from_result_id: null, // Default since not in DB
  issue_type: (dbIssue.issue_type as any) || 'other',
  severity: (dbIssue.issue_severity || dbIssue.severity) as any || 'medium',
  title: dbIssue.title || 'Detected Issue',
  description: dbIssue.issue_description,
  affected_url: null, // Default since not in DB
  affected_element: null, // Default since not in DB
  error_message: null, // Default since not in DB
  error_code: null, // Default since not in DB
  stack_trace: null, // Default since not in DB
  steps_to_reproduce: null, // Default since not in DB
  browser_context: null, // Default since not in DB
  screenshot_ids: dbIssue.screenshot_url ? [dbIssue.screenshot_url] : null,
  evidence_data: {}, // Default since not in DB
  status: (dbIssue.resolution_status || dbIssue.status) as any || 'new',
  assigned_to: null, // Default since not in DB
  resolved_at: null, // Default since not in DB
  resolved_by: null, // Default since not in DB
  resolution_notes: null, // Default since not in DB
  first_seen_at: dbIssue.created_at || new Date().toISOString(),
  last_seen_at: dbIssue.updated_at || dbIssue.created_at || new Date().toISOString(),
  occurrence_count: 1, // Default since not in DB
  auto_test_generated: dbIssue.auto_test_generated ?? false,
  auto_test_script_id: null, // Default since not in DB
  user_impact_score: 1, // Default since not in DB
  business_impact: null, // Default since not in DB
  created_at: dbIssue.created_at || new Date().toISOString(),
  updated_at: dbIssue.updated_at || new Date().toISOString()
})

const mapDbAutoTestCaseToInterface = (dbCase: DbQAAutoTestCase): QAAutoTestCase => ({
  id: dbCase.id,
  source_issue_id: '', // Default since not in DB
  test_name: dbCase.test_name,
  test_description: dbCase.description || '',
  test_objective: null, // Default since not in DB
  generated_script: '', // Default since not in DB
  test_steps: Array.isArray(dbCase.test_steps) ? dbCase.test_steps as string[] : [],
  test_category: 'general', // Default since not in DB
  estimated_duration_minutes: 5, // Default since not in DB
  complexity_level: 'simple' as const, // Default since not in DB
  status: 'generated' as const, // Default since not in DB
  reviewed_by: null, // Default since not in DB
  review_notes: null, // Default since not in DB
  implemented_as_script_id: null, // Default since not in DB
  implementation_notes: null, // Default since not in DB
  generation_method: 'rule_based' as const, // Default since not in DB
  generation_confidence: 0.8, // Default since not in DB
  tags: [], // Default since not in DB
  preconditions: null, // Default since not in DB
  expected_outcomes: null, // Default since not in DB
  created_at: dbCase.created_at || new Date().toISOString(),
  updated_at: dbCase.updated_at || new Date().toISOString()
})

const mapDbTriggerToInterface = (dbTrigger: DbQACITrigger): QACITrigger => ({
  id: dbTrigger.id,
  name: dbTrigger.trigger_name,
  description: null, // Default since not in DB
  trigger_type: dbTrigger.trigger_type as any,
  branch_patterns: [], // Default since not in DB
  file_patterns: null, // Default since not in DB
  exclude_patterns: null, // Default since not in DB
  repository_url: null, // Default since not in DB
  repository_provider: null, // Default since not in DB
  webhook_secret: null, // Default since not in DB
  scripts_to_run: [], // Default since not in DB
  execution_order: 'parallel' as const, // Default since not in DB
  max_parallel_runs: 1, // Default since not in DB
  target_environments: ['staging'], // Default since not in DB
  browser_matrix: ['chromium'], // Default since not in DB
  run_on_pr: false, // Default since not in DB
  run_on_merge: false, // Default since not in DB
  run_on_schedule: false, // Default since not in DB
  schedule_cron: null, // Default since not in DB
  notify_on_failure: true, // Default since not in DB
  notify_on_success: false, // Default since not in DB
  notification_channels: {}, // Default since not in DB
  stop_on_first_failure: false, // Default since not in DB
  retry_failed_tests: false, // Default since not in DB
  max_retries: 0, // Default since not in DB
  is_active: dbTrigger.is_active ?? true,
  total_triggers: 0, // Default since not in DB
  successful_runs: 0, // Default since not in DB
  failed_runs: 0, // Default since not in DB
  average_duration_minutes: null, // Default since not in DB
  last_triggered_at: null, // Default since not in DB
  last_run_id: null, // Default since not in DB
  last_status: null, // Default since not in DB
  created_by: dbTrigger.created_by,
  created_at: dbTrigger.created_at || new Date().toISOString(),
  updated_at: dbTrigger.updated_at || new Date().toISOString()
})

// QA Testing API functions
export class QATestingAPI {
  // Test Scripts
  static async getTestScripts(filters?: TestScriptFilters, pagination?: PaginationParams): Promise<PaginatedResponse<QATestScript>> {
    try {
      let query = supabase.from('qa_test_scripts').select('*')
      
    if (filters?.search) {
        query = query.or(`script_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      
      const { data, error, count } = await query
        .range((pagination?.page || 1 - 1) * (pagination?.limit || 10), (pagination?.page || 1) * (pagination?.limit || 10) - 1)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Failed to fetch test scripts:', error)
        throw error
      }

    return {
        data: (data || []).map(mapDbScriptToInterface),
      pagination: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 10,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / (pagination?.limit || 10)),
          has_next: ((pagination?.page || 1) * (pagination?.limit || 10)) < (count || 0),
          has_prev: (pagination?.page || 1) > 1
        }
      }
    } catch (error) {
      console.error('Error fetching test scripts:', error)
      throw error
    }
  }

  static async getTestScript(id: string): Promise<QATestScript> {
    const { data, error } = await supabase
      .from('qa_test_scripts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapDbScriptToInterface(data)
  }

  static async createTestScript(script: CreateTestScriptRequest & { created_by?: string }): Promise<QATestScript> {
    const { data, error } = await supabase
      .from('qa_test_scripts')
      .insert({
        script_name: script.name,
        script_content: script.script_content,
        description: script.description || null,
        created_by: script.created_by || null,
        is_active: true,
        name: script.name
      })
      .select()
      .single()

    if (error) throw error
    return mapDbScriptToInterface(data)
  }

  static async updateTestScript(id: string, script: Partial<CreateTestScriptRequest>): Promise<QATestScript> {
    const { data, error } = await supabase
      .from('qa_test_scripts')
      .update({
        script_name: script.name,
        script_content: script.script_content,
        description: script.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapDbScriptToInterface(data)
  }

  static async deleteTestScript(id: string): Promise<void> {
    const { error } = await supabase
      .from('qa_test_scripts')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async getActiveTestScripts(): Promise<QATestScript[]> {
    const { data, error } = await supabase
      .from('qa_test_scripts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapDbScriptToInterface)
  }

  // Test Runs
  static async getTestRuns(filters?: TestRunFilters, pagination?: PaginationParams): Promise<PaginatedResponse<QATestRun & { script_name: string }>> {
    try {
    let query = supabase
      .from('qa_test_runs')
        .select('*, qa_test_scripts!qa_test_runs_script_id_fkey(name)')

    if (filters?.script_id) {
      query = query.eq('script_id', filters.script_id)
    }
      
      if (filters?.status) {
      query = query.eq('status', filters.status)
    }
      
      const page = pagination?.page || 1
      const limit = pagination?.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit - 1
      
      const { data, error } = await query
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Failed to fetch test runs:', error)
        throw error
      }
      
      const transformedData = (data || []).map(run => ({
        ...mapDbRunToInterface(run),
        script_name: (run as any).qa_test_scripts?.name || 'Unknown Script'
      }))

    return {
      data: transformedData,
      pagination: {
          page: page,
          limit: limit,
          total: transformedData.length,
          total_pages: Math.ceil(transformedData.length / limit),
          has_next: false,
          has_prev: page > 1
        }
      }
    } catch (error) {
      console.error('Error fetching test runs:', error)
      throw error
    }
  }

  static async getTestRunResults(runId: string): Promise<{ results: QATestResult[]; screenshots: QAScreenshot[] }> {
    const [resultsRes, screenshotsRes] = await Promise.all([
      supabase.from('qa_test_results').select('*').eq('test_run_id', runId),
      supabase.from('qa_screenshots').select('*').eq('test_run_id', runId)
    ])
    
    if (resultsRes.error) throw resultsRes.error
    if (screenshotsRes.error) throw screenshotsRes.error

    return {
      results: (resultsRes.data || []).map(mapDbResultToInterface),
      screenshots: (screenshotsRes.data || []).map(mapDbScreenshotToInterface)
    }
  }

  static async createTestRun(request: RunTestScriptRequest & { created_by?: string }): Promise<QATestRun> {
    if (!request.script_id) {
      throw new Error('script_id is required')
    }

    const { data, error } = await supabase
      .from('qa_test_runs')
      .insert({
        script_id: request.script_id,
        run_name: request.run_name || `Run ${Date.now()}`,
        test_environment: request.test_environment || 'staging',
        browser_type: request.browser_type || 'chromium',
        trigger_type: request.trigger_type || 'manual',
        status: 'pending',
        started_at: new Date().toISOString(),
        run_number: 1
      })
      .select()
      .single()

    if (error) throw error
    return mapDbRunToInterface(data)
  }

  static async updateTestRun(id: string, updates: Partial<Pick<QATestRun, 'status' | 'completed_at' | 'error_message'>>): Promise<QATestRun> {
    const { data, error } = await supabase
      .from('qa_test_runs')
      .update({
        status: updates.status,
        completed_at: updates.completed_at || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapDbRunToInterface(data)
  }

  // Analytics
  static async getTestRunSummaries(): Promise<TestRunSummary[]> {
    try {
      // Get runs with script names
      const { data: runs, error } = await supabase
      .from('qa_test_runs')
        .select('script_id, status, started_at, qa_test_scripts!qa_test_runs_script_id_fkey(name)')
        .order('created_at', { ascending: false })
        .limit(1000)
      
      if (error) {
        console.error('Failed to fetch test runs for summary:', error)
        throw error
      }
      
      // Define the type for the run data from database  
      type RunData = {
        script_id: string | null
        status: string
        started_at: string | null
        qa_test_scripts?: { name: string | null }[] | null
      }
      
      // Group by script_id and calculate summaries
      const scriptSummaries = new Map<string, TestRunSummary>()
      
      ;(runs as RunData[] || []).forEach((run: RunData) => {
      const scriptId = run.script_id
        if (!scriptId) return
        
      if (!scriptSummaries.has(scriptId)) {
        scriptSummaries.set(scriptId, {
            script_name: run.qa_test_scripts?.[0]?.name || 'Unknown',
            total_runs: 0,
            passed_runs: 0,
            failed_runs: 0,
            success_rate: 0,
            average_duration: 0,
            last_run_at: null,
            last_status: null
          })
        }
        
        const summary = scriptSummaries.get(scriptId)!
        summary.total_runs++
        
        if (run.status === 'passed') summary.passed_runs++
        if (run.status === 'failed') summary.failed_runs++
        
        if (!summary.last_run_at || (run.started_at && run.started_at > summary.last_run_at)) {
          summary.last_run_at = run.started_at
          summary.last_status = run.status
        }
      })
      
      // Calculate success rates and return array
      const summariesArray: TestRunSummary[] = []
      scriptSummaries.forEach((summary) => {
        summariesArray.push({
          ...summary,
          success_rate: summary.total_runs > 0 ? (summary.passed_runs / summary.total_runs) * 100 : 0
        })
      })
      
      return summariesArray
      
    } catch (error) {
      console.error('Error generating test run summaries:', error)
      throw error
    }
  }

  // Issues
  static async getDetectedIssues(filters?: IssueFilters, pagination?: PaginationParams): Promise<PaginatedResponse<QADetectedIssue>> {
    try {
      let query = supabase.from('qa_detected_issues').select('*')
      
    if (filters?.search) {
        query = query.or(`issue_description.ilike.%${filters.search}%,title.ilike.%${filters.search}%`)
      }
      
      if (filters?.severity) {
        query = query.or(`issue_severity.eq.${filters.severity},severity.eq.${filters.severity}`)
      }
      
      const page = pagination?.page || 1
      const limit = pagination?.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit - 1
      
      const { data, error } = await query
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false })

    if (error) throw error

    return {
        data: (data || []).map(mapDbIssueToInterface),
      pagination: {
          page: page,
          limit: limit,
          total: data?.length || 0,
          total_pages: Math.ceil((data?.length || 0) / limit),
          has_next: false,
          has_prev: page > 1
        }
      }
    } catch (error) {
      console.error('Error fetching detected issues:', error)
      throw error
    }
  }

  static async createDetectedIssue(issue: Partial<QADetectedIssue> & { issue_description: string }): Promise<QADetectedIssue> {
    const { data, error } = await supabase
      .from('qa_detected_issues')
      .insert({
        issue_description: issue.issue_description,
        issue_type: issue.issue_type || null,
        issue_severity: issue.severity || null,
        severity: issue.severity || null,
        title: issue.title || null,
        description: issue.description || null,
        status: issue.status || null,
        auto_test_generated: issue.auto_test_generated || false,
        test_run_id: issue.detected_from_run_id || null,
        screenshot_url: issue.screenshot_ids?.[0] || null,
        resolution_status: issue.status || null
      })
      .select()
      .single()

    if (error) throw error
    return mapDbIssueToInterface(data)
  }

  static async updateDetectedIssue(id: string, updates: Partial<QADetectedIssue>): Promise<QADetectedIssue> {
    const { data, error } = await supabase
      .from('qa_detected_issues')
      .update({
        issue_description: updates.description || undefined,
        issue_type: updates.issue_type || undefined,
        issue_severity: updates.severity || undefined,
        severity: updates.severity || undefined,
        status: updates.status || undefined,
        resolution_status: updates.status || undefined,
        title: updates.title || undefined,
        description: updates.description || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapDbIssueToInterface(data)
  }

  // CI Triggers
  static async getCITriggers(): Promise<QACITrigger[]> {
    const { data, error } = await supabase
      .from('qa_ci_triggers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapDbTriggerToInterface)
  }

  static async createCITrigger(trigger: Partial<QACITrigger> & { name: string; trigger_type: string }): Promise<QACITrigger> {
    const { data, error } = await supabase
      .from('qa_ci_triggers')
      .insert({
        trigger_name: trigger.name,
        trigger_type: trigger.trigger_type,
        is_active: trigger.is_active ?? true,
        created_by: trigger.created_by || null,
        conditions: trigger.notification_channels as any || null
      })
      .select()
      .single()

    if (error) throw error
    return mapDbTriggerToInterface(data)
  }

  static async updateCITrigger(id: string, updates: Partial<QACITrigger>): Promise<QACITrigger> {
    const { data, error } = await supabase
      .from('qa_ci_triggers')
      .update({
        trigger_name: updates.name,
        trigger_type: updates.trigger_type,
        is_active: updates.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapDbTriggerToInterface(data)
  }

  // Auto Test Case Generation
  static async generateAutoTestCase(issue: QADetectedIssue): Promise<QAAutoTestCase> {
    // Auto-generate test case from detected issue
    const testCase: Partial<QAAutoTestCase> = {
      test_name: `Auto Test: ${issue.title || 'Issue Detection'}`,
      test_description: issue.description || 'Auto-generated test case',
      generated_script: generatePlaywrightScript(issue),
      test_steps: generateTestSteps(issue),
      test_category: mapIssueTypeToCategory(issue.issue_type || 'other'),
      status: 'generated',
      generation_method: 'ai_assisted',
      generation_confidence: 0.8,
      tags: ['auto-generated', issue.issue_type || 'general', issue.severity || 'medium'].filter(Boolean)
    }

    const { data, error } = await supabase
      .from('qa_auto_test_cases')
      .insert({
        test_name: testCase.test_name!,
        description: testCase.test_description || null,
        test_steps: testCase.test_steps as any,
        test_data: testCase as any,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    
    return mapDbAutoTestCaseToInterface(data)
  }
}

// Helper functions for auto-generation
function generatePlaywrightScript(issue: QADetectedIssue): string {
  return `
import { test, expect } from '@playwright/test';

test('${issue.title || 'Auto-generated test'}', async ({ page }) => {
  // Navigate to the affected page
  await page.goto('${issue.affected_url || 'https://example.com'}');
  
  // Test case generated from issue: ${issue.description}
  // TODO: Add specific test steps based on issue analysis
  
  await expect(page).toHaveTitle(/.*$/);
});
  `.trim()
}

function generateTestSteps(issue: QADetectedIssue): string[] {
  return [
    'Navigate to the application',
    `Verify issue: ${issue.description}`,
    'Validate expected behavior',
    'Capture results'
  ]
}

function mapIssueTypeToCategory(issueType: string): string {
  const categoryMap: Record<string, string> = {
    'broken_link': 'navigation',
    'missing_element': 'ui',
    'form_validation_error': 'forms',
    'api_error': 'api',
    'console_error': 'general',
    'accessibility_violation': 'ui',
    'visual_regression': 'ui',
    'slow_performance': 'performance',
    'security_issue': 'general'
  }
  
  return categoryMap[issueType] || 'general'
}

// Export singleton instance
export const qaAPI = QATestingAPI

// Export individual API objects for backward compatibility
export const qaTestScriptsApi = {
  getTestScripts: QATestingAPI.getTestScripts,
  getTestScript: QATestingAPI.getTestScript,
  createTestScript: QATestingAPI.createTestScript,
  updateTestScript: QATestingAPI.updateTestScript,
  deleteTestScript: QATestingAPI.deleteTestScript,
  getActiveTestScripts: QATestingAPI.getActiveTestScripts,
  getAll: async () => {
    const result = await QATestingAPI.getTestScripts()
    return { data: result.data }
  }
}

export const qaTestRunsApi = {
  getTestRuns: QATestingAPI.getTestRuns,
  getTestRunResults: QATestingAPI.getTestRunResults,
  createTestRun: QATestingAPI.createTestRun,
  updateTestRun: QATestingAPI.updateTestRun,
  getTestRunSummaries: QATestingAPI.getTestRunSummaries,
  getAll: async (filters?: any, pagination?: any) => {
    const result = await QATestingAPI.getTestRuns(filters, pagination)
    return result
  },
  create: async (request: any) => {
    return await QATestingAPI.createTestRun(request)
  },
  updateStatus: async (runId: string, status: string, updates?: any) => {
    return await QATestingAPI.updateTestRun(runId, { status, ...updates })
  }
}

export const qaDetectedIssuesApi = {
  getDetectedIssues: QATestingAPI.getDetectedIssues,
  createDetectedIssue: QATestingAPI.createDetectedIssue,
  updateDetectedIssue: QATestingAPI.updateDetectedIssue,
  getAll: async () => {
    const result = await QATestingAPI.getDetectedIssues()
    return { data: result.data }
  }
} 