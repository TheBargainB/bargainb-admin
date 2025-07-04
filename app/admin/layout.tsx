"use client"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log("🚀 REBUILD: AdminLayout is executing!")
  
  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">🔄 Auth Rebuild - Step 1: Basic Layout Working</h1>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
} 