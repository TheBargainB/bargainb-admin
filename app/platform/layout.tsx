import type React from "react"
import type { Metadata } from "next"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: "BargainB Platform - Compare Prices & Shop Smart",
  description: "Find the best deals on groceries and everyday items by comparing prices across multiple stores",
}

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">BargainB</h1>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href="#" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                    Browse
                  </a>
                  <a href="#" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                    Categories
                  </a>
                  <a href="#" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                    Deals
                  </a>
                  <a href="#" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                    Stores
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="text-foreground hover:text-primary p-2 rounded-md">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
                </button>
              </div>
              <div className="relative">
                <button className="text-foreground hover:text-primary p-2 rounded-md">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-.4-2L3 3M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
                </button>
              </div>
              <ThemeToggle />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-foreground">JD</span>
                </div>
                <span className="text-sm text-foreground">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {children}
    </div>
  )
} 