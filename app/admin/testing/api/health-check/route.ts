import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface HealthCheckResult {
  service: string
  status: 'healthy' | 'error' | 'warning'
  responseTime: number
  details?: string
  error?: string
}

export async function GET() {
  try {
    const results: HealthCheckResult[] = []
    
    // Test Supabase Database Connection
    const dbStart = Date.now()
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('count')
        .limit(1)
      
      results.push({
        service: 'Supabase Database',
        status: error ? 'error' : 'healthy',
        responseTime: Date.now() - dbStart,
        details: error ? undefined : 'Connection successful',
        error: error?.message
      })
    } catch (error) {
      results.push({
        service: 'Supabase Database',
        status: 'error',
        responseTime: Date.now() - dbStart,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test Environment Variables
    const envStart = Date.now()
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'WASENDER_API_KEY'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    results.push({
      service: 'Environment Variables',
      status: missingEnvVars.length > 0 ? 'warning' : 'healthy',
      responseTime: Date.now() - envStart,
      details: missingEnvVars.length > 0 
        ? `Missing: ${missingEnvVars.join(', ')}` 
        : 'All required variables present'
    })

    // Calculate overall health
    const healthyCount = results.filter(r => r.status === 'healthy').length
    const warningCount = results.filter(r => r.status === 'warning').length
    const errorCount = results.filter(r => r.status === 'error').length
    
    let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy'
    if (errorCount > 0) overallStatus = 'error'
    else if (warningCount > 0) overallStatus = 'warning'

    return NextResponse.json({
      success: true,
      data: {
        overall: {
          status: overallStatus,
          summary: `${healthyCount} healthy, ${warningCount} warnings, ${errorCount} errors`,
          timestamp: new Date().toISOString()
        },
        results,
        stats: {
          total: results.length,
          healthy: healthyCount,
          warnings: warningCount,
          errors: errorCount
        }
      }
    })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 