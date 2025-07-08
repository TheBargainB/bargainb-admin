import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a singleton instance for the regular client
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    // Server-side: Create new instance each time
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  }

  // Client-side: Use singleton pattern
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  }
  return supabaseInstance
}

export const supabase = getSupabaseClient()

// Admin client is only for server-side API routes
const createAdminClient = () => {
  if (typeof window !== "undefined") {
    // Return regular client for client-side code
    return supabase
  }

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseServiceKey) {
    console.warn('Missing Supabase service role key, falling back to regular client')
    return supabase
  }

  return createClient<Database>(
    supabaseUrl, 
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export const supabaseAdmin = createAdminClient()

// Export types for convenience
export type { Database } from '../types/database.types' 