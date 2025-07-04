"use client"

import React from "react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function FreshAdminLayout({ children }: AdminLayoutProps) {
  // IMMEDIATE EXECUTION TEST
  console.log("🔥 FRESH LAYOUT EXECUTING!")
  console.log("🔥 Timestamp:", new Date().toISOString())
  console.log("🔥 Multiple Supabase instances fix - bypassing global notifications")
  
  // Force immediate render without any async operations
  React.useEffect(() => {
    console.log("🔥 FRESH LAYOUT useEffect executing!")
    console.log("🔥 This should appear in browser console immediately")
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Success Banner */}
      <div className="bg-green-600 text-white p-4 text-center">
        <h1 className="text-xl font-bold">
          🔥 FRESH LAYOUT WORKING! - Multiple Supabase Fix Applied
        </h1>
        <p className="text-sm">
          Timestamp: {new Date().toLocaleString()} | No Global Notifications | No Complex Auth
        </p>
      </div>
      
      {/* Layout Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            ✅ Authentication Rebuild Status
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h3 className="font-semibold text-green-700">✅ FIXED</h3>
              <ul className="text-sm text-green-600 mt-2 space-y-1">
                <li>• Layout execution working</li>
                <li>• Multiple Supabase instances bypassed</li>
                <li>• Global notifications disabled</li>
                <li>• Fresh React components</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold text-blue-700">🔄 NEXT STEPS</h3>
              <ul className="text-sm text-blue-600 mt-2 space-y-1">
                <li>• Add simple authentication</li>
                <li>• Test admin panel access</li>
                <li>• Restore functionality gradually</li>
                <li>• Consolidate Supabase clients</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Children Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Admin Panel Content:</h3>
          {children}
        </div>
      </div>
    </div>
  )
} 