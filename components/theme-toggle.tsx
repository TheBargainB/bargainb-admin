"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Ensure component is mounted before rendering to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const toggleTheme = () => {
    // Use resolvedTheme to get the actual applied theme (resolves "system" to "light" or "dark")
    const currentTheme = resolvedTheme
    setTheme(currentTheme === "dark" ? "light" : "dark")
  }

  // Use resolvedTheme for display logic too
  const currentTheme = resolvedTheme

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={toggleTheme}
      className="flex items-center space-x-2"
      title={`Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`}
    >
      {currentTheme === "dark" ? (
        <>
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </>
      )}
    </Button>
  )
} 