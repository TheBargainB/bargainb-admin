"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function TestAuthPage() {
  const [result, setResult] = useState<string>("Click test button")
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    setLoading(true)
    try {
      console.log("Testing Supabase connection...")
      
      // Test 1: Check if Supabase is initialized
      if (!supabase) {
        setResult("❌ Supabase not initialized")
        return
      }
      
      // Test 2: Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        setResult(`❌ Session error: ${sessionError.message}`)
        return
      }
      
      // Test 3: Check admin users table
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .limit(1)
      
      if (adminError) {
        setResult(`❌ Admin users error: ${adminError.message}`)
        return
      }
      
      setResult(`✅ Tests passed! Session: ${session ? 'Found' : 'None'}, Admin users: ${adminUsers?.length || 0}`)
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Auth Test</h1>
        
        <button
          onClick={testAuth}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Authentication"}
        </button>
        
        <div className="mt-6 p-4 bg-gray-100 rounded min-h-[100px]">
          <p className="text-sm whitespace-pre-wrap">{result}</p>
        </div>
      </div>
    </div>
  )
} 