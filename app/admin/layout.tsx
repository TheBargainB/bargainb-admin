"use client"

import React from "react"

interface LayoutProps {
  children: React.ReactNode
}

// **FRESH REBUILD** - Completely new admin layout
export default function NewAdminLayout({ children }: LayoutProps) {
  console.log("🔥 FRESH REBUILD: New AdminLayout is executing!")
  console.log("🔥 FRESH REBUILD: Timestamp:", new Date().toISOString())
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <h1 className="text-2xl font-bold text-green-600">
          🔥 FRESH AUTH REBUILD - WORKING!
        </h1>
        <p className="text-sm text-gray-600">
          New layout executing successfully - {new Date().toLocaleString()}
        </p>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold text-blue-600 mb-2">
            ✅ Basic Layout Working
          </h2>
          <p className="text-gray-700">
            The admin layout is now executing properly. Next step: Add authentication.
          </p>
        </div>
        
        {children}
      </div>
    </div>
  )
} 