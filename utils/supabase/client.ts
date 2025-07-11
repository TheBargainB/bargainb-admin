import { createBrowserClient } from '@supabase/ssr'

// Singleton instance to prevent multiple GoTrueClient instances
let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Only create one instance per browser session
  if (!clientInstance) {
    clientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return clientInstance
} 