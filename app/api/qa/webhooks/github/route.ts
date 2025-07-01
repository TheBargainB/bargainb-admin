import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import crypto from 'crypto'
import type { GitHubWebhookPayload } from '@/types/qa-testing'

// Webhook endpoint to handle GitHub push events and trigger QA tests
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const payload: GitHubWebhookPayload = JSON.parse(body)
    
    // Verify webhook signature (security)
    const headersList = await headers()
    const signature = headersList.get('x-hub-signature-256')
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET
    
    if (webhookSecret && signature) {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')}`
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Handle different GitHub events
    switch (payload.action) {
      case 'push':
        await handlePushEvent(supabase, payload)
        break
      case 'pull_request':
        await handlePullRequestEvent(supabase, payload)
        break
      case 'deployment':
        await handleDeploymentEvent(supabase, payload)
        break
      default:
        console.log(`Unhandled GitHub event: ${payload.action}`)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      event: payload.action
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' }, 
      { status: 500 }
    )
  }
}

async function handlePushEvent(supabase: any, payload: GitHubWebhookPayload) {
  console.log('Processing push event for:', payload.repository.full_name)
  
  // Get active CI triggers that match this push event
  const { data: triggers, error: triggersError } = await supabase
    .from('qa_ci_triggers')
    .select('*')
    .eq('is_active', true)
    .eq('trigger_type', 'git_push')
    .contains('branch_patterns', [getBranchFromRef(payload.commits?.[0]?.id || '')])

  if (triggersError) {
    console.error('Error fetching CI triggers:', triggersError)
    return
  }

  // Process each matching trigger
  for (const trigger of triggers || []) {
    await executeTrigger(supabase, trigger, {
      trigger_event_type: 'git_push',
      event_metadata: {
        repository: payload.repository.full_name,
        commits: payload.commits?.map(c => ({
          id: c.id,
          message: c.message,
          author: c.author,
          modified_files: c.modified?.length || 0,
          added_files: c.added?.length || 0,
          removed_files: c.removed?.length || 0
        })) || [],
        push_timestamp: new Date().toISOString()
      }
    })
  }
}

async function handlePullRequestEvent(supabase: any, payload: GitHubWebhookPayload) {
  if (!payload.pull_request) return
  
  console.log('Processing PR event:', payload.pull_request.number)
  
  // Get triggers for pull requests
  const { data: triggers, error: triggersError } = await supabase
    .from('qa_ci_triggers')
    .select('*')
    .eq('is_active', true)
    .eq('trigger_type', 'pull_request')
    .eq('run_on_pr', true)

  if (triggersError) {
    console.error('Error fetching PR triggers:', triggersError)
    return
  }

  // Process each matching trigger
  for (const trigger of triggers || []) {
    await executeTrigger(supabase, trigger, {
      trigger_event_type: 'pull_request',
      event_metadata: {
        repository: payload.repository.full_name,
        pr_number: payload.pull_request.number,
        pr_title: payload.pull_request.title,
        source_branch: payload.pull_request.head.ref,
        target_branch: payload.pull_request.base.ref,
        commit_sha: payload.pull_request.head.sha,
        pr_action: payload.action
      }
    })
  }
}

async function handleDeploymentEvent(supabase: any, payload: GitHubWebhookPayload) {
  if (!payload.deployment) return
  
  console.log('Processing deployment event:', payload.deployment.id)
  
  // Get deployment triggers
  const { data: triggers, error: triggersError } = await supabase
    .from('qa_ci_triggers')
    .select('*')
    .eq('is_active', true)
    .eq('trigger_type', 'deployment')
    .contains('target_environments', [payload.deployment.environment])

  if (triggersError) {
    console.error('Error fetching deployment triggers:', triggersError)
    return
  }

  // Process each matching trigger
  for (const trigger of triggers || []) {
    await executeTrigger(supabase, trigger, {
      trigger_event_type: 'deployment',
      event_metadata: {
        repository: payload.repository.full_name,
        deployment_id: payload.deployment.id,
        environment: payload.deployment.environment,
        commit_sha: payload.deployment.sha,
        ref: payload.deployment.ref
      }
    })
  }
}

async function executeTrigger(supabase: any, trigger: any, executionData: any) {
  console.log(`Executing trigger: ${trigger.name}`)
  
  try {
    // Create trigger execution record
    const { data: execution, error: executionError } = await supabase
      .from('qa_trigger_executions')
      .insert({
        trigger_id: trigger.id,
        trigger_event_type: executionData.trigger_event_type,
        event_metadata: executionData.event_metadata,
        total_scripts: trigger.scripts_to_run.length,
        scripts_queued: trigger.scripts_to_run.length,
        status: 'pending'
      })
      .select()
      .single()

    if (executionError) {
      console.error('Error creating trigger execution:', executionError)
      return
    }

    // Get scripts to run
    const { data: scripts, error: scriptsError } = await supabase
      .from('qa_test_scripts')
      .select('*')
      .in('id', trigger.scripts_to_run)
      .eq('is_active', true)

    if (scriptsError) {
      console.error('Error fetching scripts to run:', scriptsError)
      return
    }

    const testRunIds: string[] = []

    // Create test runs for each script
    for (const script of scripts || []) {
      try {
        // Get next run number
        const { data: lastRun } = await supabase
          .from('qa_test_runs')
          .select('run_number')
          .eq('script_id', script.id)
          .order('run_number', { ascending: false })
          .limit(1)
          .single()

        const nextRunNumber = (lastRun?.run_number || 0) + 1

        // Create test run
        const { data: testRun, error: runError } = await supabase
          .from('qa_test_runs')
          .insert({
            script_id: script.id,
            run_number: nextRunNumber,
            run_name: `${executionData.trigger_event_type} - ${trigger.name}`,
            trigger_type: 'ci_deploy',
            test_environment: trigger.target_environments[0] || 'production',
            browser_type: trigger.browser_matrix[0] || 'chromium',
            status: 'pending',
            started_at: new Date().toISOString(),
            steps_total: 0,
            steps_passed: 0,
            steps_failed: 0,
            steps_skipped: 0,
            execution_context: {
              trigger_execution_id: execution.id,
              trigger_name: trigger.name,
              event_data: executionData.event_metadata
            }
          })
          .select()
          .single()

        if (runError) {
          console.error('Error creating test run:', runError)
          continue
        }

        testRunIds.push(testRun.id)
        
        // In a real implementation, here you would:
        // 1. Queue the test run for execution in your test runner
        // 2. Execute the Playwright script
        // 3. Update the test run status based on results
        
        // For now, simulate test execution with a random result
        setTimeout(async () => {
          const success = Math.random() > 0.3 // 70% success rate
          
          await supabase
            .from('qa_test_runs')
            .update({
              status: success ? 'passed' : 'failed',
              completed_at: new Date().toISOString(),
              duration_seconds: Math.floor(Math.random() * 120) + 30, // 30-150 seconds
              steps_total: 5,
              steps_passed: success ? 5 : Math.floor(Math.random() * 4) + 1,
              steps_failed: success ? 0 : Math.floor(Math.random() * 3) + 1,
              error_message: success ? null : 'Simulated test failure for CI trigger'
            })
            .eq('id', testRun.id)
        }, Math.random() * 10000 + 5000) // Complete between 5-15 seconds

        console.log(`Queued test run for script: ${script.name}`)
        
      } catch (scriptError) {
        console.error(`Error processing script ${script.name}:`, scriptError)
      }
    }

    // Update trigger execution with test run IDs
    await supabase
      .from('qa_trigger_executions')
      .update({
        test_run_ids: testRunIds,
        status: 'running',
        scripts_running: testRunIds.length,
        scripts_queued: 0
      })
      .eq('id', execution.id)

    // Simulate completion of trigger execution
    setTimeout(async () => {
      // Get latest status of all test runs
      const { data: completedRuns } = await supabase
        .from('qa_test_runs')
        .select('status')
        .in('id', testRunIds)

      const allPassed = completedRuns?.every((run: any) => run.status === 'passed') || false
      const failedCount = completedRuns?.filter((run: any) => run.status === 'failed').length || 0

      await supabase
        .from('qa_trigger_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          total_duration_minutes: Math.floor((Math.random() * 10) + 5), // 5-15 minutes
          all_tests_passed: allPassed,
          critical_failures_count: failedCount,
          scripts_running: 0,
          scripts_completed: testRunIds.length
        })
        .eq('id', execution.id)

      console.log(`Trigger execution completed: ${trigger.name}`)
      
      // Send notifications if configured
      if ((!allPassed && trigger.notify_on_failure) || (allPassed && trigger.notify_on_success)) {
        await sendNotification(trigger, execution, allPassed, failedCount)
      }
      
    }, 15000) // Complete after 15 seconds

  } catch (error) {
    console.error('Error executing trigger:', error)
  }
}

async function sendNotification(trigger: any, execution: any, success: boolean, failedCount: number) {
  console.log(`Sending notification for trigger: ${trigger.name}`)
  
  // In a real implementation, you would integrate with:
  // - Slack API
  // - Email service
  // - Discord webhooks
  // - Microsoft Teams
  // etc.
  
  const notification = {
    trigger_name: trigger.name,
    status: success ? 'SUCCESS' : 'FAILURE',
    failed_tests: failedCount,
    execution_id: execution.id,
    timestamp: new Date().toISOString(),
    message: success 
      ? `✅ All tests passed for trigger: ${trigger.name}`
      : `❌ ${failedCount} test(s) failed for trigger: ${trigger.name}`
  }
  
  console.log('Notification:', notification)
  
  // Store notification in database for tracking
  // await supabase.from('qa_notifications').insert(notification)
}

function getBranchFromRef(ref: string): string {
  // Extract branch name from git ref
  if (ref.startsWith('refs/heads/')) {
    return ref.replace('refs/heads/', '')
  }
  return ref
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ 
    message: 'QA Testing Center GitHub Webhook Endpoint',
    status: 'active',
    supported_events: ['push', 'pull_request', 'deployment']
  })
} 