// QA Testing Center Types - Matches Supabase database schema

export interface QATestScript {
  id: string
  name: string
  description: string | null
  category: 'authentication' | 'navigation' | 'forms' | 'api' | 'ui' | 'performance' | 'general'
  script_content: string
  script_language: 'javascript' | 'typescript'
  timeout_seconds: number
  retry_count: number
  browser_type: 'chromium' | 'firefox' | 'webkit'
  headless: boolean
  test_environment: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  base_url: string | null
  viewport_width: number | null
  viewport_height: number | null
  prerequisites: string[] | null
  expected_outcomes: string[] | null
  is_active: boolean
  is_template: boolean
  version: number
  parent_script_id: string | null
  created_by: string | null
  last_modified_by: string | null
  created_at: string
  updated_at: string
}

export interface QATestRun {
  id: string
  script_id: string
  run_number: number
  run_name: string | null
  trigger_type: 'manual' | 'scheduled' | 'ci_deploy' | 'api' | 'dependency'
  triggered_by: string | null
  test_environment: string
  browser_type: string
  browser_version: string | null
  viewport_width: number | null
  viewport_height: number | null
  status: 'pending' | 'running' | 'passed' | 'failed' | 'cancelled' | 'timeout'
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
  steps_total: number
  steps_passed: number
  steps_failed: number
  steps_skipped: number
  error_message: string | null
  error_code: string | null
  error_stack_trace: string | null
  performance_metrics: Record<string, any>
  resource_usage: Record<string, any>
  exit_code: number | null
  artifacts_stored: boolean
  video_url: string | null
  report_url: string | null
  logs_url: string | null
  retry_attempt: number
  parent_run_id: string | null
  execution_context: Record<string, any>
  created_at: string
  updated_at: string
}

export interface QATestResult {
  id: string
  test_run_id: string
  step_number: number
  step_name: string
  step_description: string | null
  step_type: 'action' | 'assertion' | 'navigation' | 'wait' | 'data_extraction'
  status: 'passed' | 'failed' | 'skipped' | 'warning'
  started_at: string
  completed_at: string | null
  duration_ms: number | null
  expected_result: string | null
  actual_result: string | null
  comparison_result: Record<string, any> | null
  error_message: string | null
  error_type: string | null
  screenshot_id: string | null
  element_selector: string | null
  element_text: string | null
  element_attributes: Record<string, any> | null
  page_url: string | null
  page_title: string | null
  network_activity: Record<string, any> | null
  console_logs: string[] | null
  performance_timing: Record<string, any> | null
  retry_count: number
  is_critical_step: boolean
  custom_data: Record<string, any>
  created_at: string
}

export interface QAScreenshot {
  id: string
  test_run_id: string | null
  test_result_id: string | null
  screenshot_type: 'step' | 'error' | 'comparison' | 'manual'
  file_path: string
  file_size_bytes: number
  image_width: number | null
  image_height: number | null
  viewport_width: number | null
  viewport_height: number | null
  page_url: string | null
  element_selector: string | null
  timestamp: string
  description: string | null
  is_baseline: boolean
  baseline_screenshot_id: string | null
  difference_percentage: number | null
  annotations: Record<string, any> | null
  compression_quality: number | null
  created_at: string
}

export interface QADetectedIssue {
  id: string
  detected_from_run_id: string | null
  detected_from_result_id: string | null
  issue_type: 'broken_link' | 'missing_element' | 'slow_performance' | 'console_error' | 
              'accessibility_violation' | 'visual_regression' | 'form_validation_error' |
              'api_error' | 'timeout' | 'memory_leak' | 'security_issue' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  affected_url: string | null
  affected_element: string | null
  error_message: string | null
  error_code: string | null
  stack_trace: string | null
  steps_to_reproduce: string[] | null
  browser_context: Record<string, any> | null
  screenshot_ids: string[] | null
  evidence_data: Record<string, any>
  status: 'new' | 'confirmed' | 'in_progress' | 'resolved' | 'false_positive' | 'wont_fix'
  assigned_to: string | null
  resolved_at: string | null
  resolved_by: string | null
  resolution_notes: string | null
  first_seen_at: string
  last_seen_at: string
  occurrence_count: number
  auto_test_generated: boolean
  auto_test_script_id: string | null
  user_impact_score: number
  business_impact: 'low' | 'medium' | 'high' | 'blocker' | null
  created_at: string
  updated_at: string
}

export interface QAAutoTestCase {
  id: string
  source_issue_id: string
  test_name: string
  test_description: string
  test_objective: string | null
  generated_script: string
  test_steps: string[]
  test_category: string
  estimated_duration_minutes: number
  complexity_level: 'simple' | 'moderate' | 'complex'
  status: 'generated' | 'reviewed' | 'approved' | 'implemented' | 'rejected'
  reviewed_by: string | null
  review_notes: string | null
  implemented_as_script_id: string | null
  implementation_notes: string | null
  generation_method: 'rule_based' | 'ai_assisted' | 'pattern_matching'
  generation_confidence: number
  tags: string[]
  preconditions: string[] | null
  expected_outcomes: string[] | null
  created_at: string
  updated_at: string
}

export interface QACITrigger {
  id: string
  name: string
  description: string | null
  trigger_type: 'git_push' | 'pull_request' | 'deployment' | 'scheduled' | 'manual' | 'webhook'
  branch_patterns: string[]
  file_patterns: string[] | null
  exclude_patterns: string[] | null
  repository_url: string | null
  repository_provider: 'github' | 'gitlab' | 'bitbucket' | null
  webhook_secret: string | null
  scripts_to_run: string[]
  execution_order: 'parallel' | 'sequential'
  max_parallel_runs: number
  target_environments: string[]
  browser_matrix: string[]
  run_on_pr: boolean
  run_on_merge: boolean
  run_on_schedule: boolean
  schedule_cron: string | null
  notify_on_failure: boolean
  notify_on_success: boolean
  notification_channels: Record<string, any>
  stop_on_first_failure: boolean
  retry_failed_tests: boolean
  max_retries: number
  is_active: boolean
  total_triggers: number
  successful_runs: number
  failed_runs: number
  average_duration_minutes: number | null
  last_triggered_at: string | null
  last_run_id: string | null
  last_status: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface QATriggerExecution {
  id: string
  trigger_id: string
  trigger_event_type: string
  event_metadata: Record<string, any>
  total_scripts: number
  scripts_queued: number
  scripts_running: number
  scripts_completed: number
  scripts_failed: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'
  started_at: string
  completed_at: string | null
  total_duration_minutes: number | null
  all_tests_passed: boolean | null
  critical_failures_count: number
  new_issues_detected: number
  test_run_ids: string[] | null
  deployment_id: string | null
  deployment_environment: string | null
  commit_hash: string | null
  commit_message: string | null
  branch_name: string | null
  pr_number: number | null
  notifications_sent: Record<string, any>
  created_at: string
  updated_at: string
}

// API Request/Response Types
export interface CreateTestScriptRequest {
  name: string
  description?: string
  category: QATestScript['category']
  script_content: string
  script_language?: 'javascript' | 'typescript'
  priority?: QATestScript['priority']
  tags?: string[]
  base_url?: string
  browser_type?: QATestScript['browser_type']
  timeout_seconds?: number
}

export interface RunTestScriptRequest {
  script_id: string
  test_environment?: string
  browser_type?: string
  trigger_type?: QATestRun['trigger_type']
  run_name?: string
}

export interface TestRunSummary {
  script_name: string
  total_runs: number
  passed_runs: number
  failed_runs: number
  success_rate: number
  average_duration: number
  last_run_at: string | null
  last_status: string | null
}

export interface IssuesSummary {
  total_issues: number
  critical_issues: number
  high_issues: number
  medium_issues: number
  low_issues: number
  new_issues: number
  resolved_issues: number
  in_progress_issues: number
}

export interface SystemHealthStatus {
  authentication: 'healthy' | 'degraded' | 'down'
  database: 'healthy' | 'degraded' | 'down'
  api_services: 'healthy' | 'degraded' | 'down'
  overall_status: 'healthy' | 'degraded' | 'down'
  last_check: string
}

// Filter and Search Types
export interface TestScriptFilters {
  search?: string
  category?: string
  priority?: string
  status?: string
  tags?: string[]
  created_by?: string
  date_range?: {
    start: string
    end: string
  }
}

export interface TestRunFilters {
  search?: string
  script_id?: string
  status?: string
  trigger_type?: string
  browser_type?: string
  environment?: string
  date_range?: {
    start: string
    end: string
  }
}

export interface IssueFilters {
  search?: string
  issue_type?: string
  severity?: string
  status?: string
  affected_url?: string
  date_range?: {
    start: string
    end: string
  }
}

// Pagination Types
export interface PaginationParams {
  page: number
  limit: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// Webhook Types for CI/CD Integration
export interface GitHubWebhookPayload {
  action: string
  repository: {
    name: string
    full_name: string
    html_url: string
  }
  commits?: Array<{
    id: string
    message: string
    author: {
      name: string
      email: string
    }
    modified: string[]
    added: string[]
    removed: string[]
  }>
  pull_request?: {
    number: number
    title: string
    head: {
      ref: string
      sha: string
    }
    base: {
      ref: string
    }
  }
  deployment?: {
    id: string
    environment: string
    sha: string
    ref: string
  }
}

export interface VercelWebhookPayload {
  type: string
  deployment: {
    id: string
    url: string
    name: string
    state: string
    target: string
    alias?: string[]
    creator: {
      uid: string
      email: string
      username: string
    }
    meta: {
      githubCommitSha?: string
      githubCommitMessage?: string
      githubCommitRef?: string
      githubCommitAuthorName?: string
    }
  }
  project: {
    id: string
    name: string
  }
  team?: {
    id: string
    name: string
  }
}

// Real-time Updates Types
export interface QATestingRealtimeEvent {
  type: 'test_run_started' | 'test_run_completed' | 'test_run_failed' | 'issue_detected' | 'script_created' | 'trigger_executed'
  data: QATestRun | QADetectedIssue | QATestScript | QATriggerExecution
  timestamp: string
  user_id?: string
}

// Export utility type for database operations
export type DatabaseTables = {
  qa_test_scripts: QATestScript
  qa_test_runs: QATestRun
  qa_test_results: QATestResult
  qa_screenshots: QAScreenshot
  qa_detected_issues: QADetectedIssue
  qa_auto_test_cases: QAAutoTestCase
  qa_ci_triggers: QACITrigger
  qa_trigger_executions: QATriggerExecution
} 