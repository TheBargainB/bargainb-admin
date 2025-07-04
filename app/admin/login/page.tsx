"use client"

import React, { useState } from "react"

// **FRESH REBUILD** - Brand new login page
export default function FreshLoginPage() {
  console.log("🔥 FRESH REBUILD: Login page executing!")
  console.log("🔥 FRESH REBUILD: Login timestamp:", new Date().toISOString())
  
  const [email, setEmail] = useState("")
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            🔥 FRESH REBUILD SUCCESS!
          </h1>
          <p className="text-green-600">
            Login page is executing properly at {new Date().toLocaleString()}
          </p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            BargainB Admin Login
          </h2>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@bargainb.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Sign In (Demo)
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Status:</strong> Layout rebuild successful!<br/>
              <strong>Next:</strong> Add Supabase authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 