"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

// For now, we'll use the placeholder logo and style it to match your brand colors
// The Figma assets are on localhost which won't work in production
// We'll create a styled version using your brand colors

export function BargainBLogo({ className = "", size = "normal" }: { className?: string; size?: "small" | "normal" | "large" | "massive" }) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const sizeClasses = {
    small: "h-8 w-auto",
    normal: "h-12 w-auto", 
    large: "h-20 w-auto",
    massive: "h-32 md:h-40 lg:h-48 xl:h-56 w-auto"
  }

  const logoSrc = mounted && (resolvedTheme === 'dark' || theme === 'dark') 
    ? "/logo-darkmode.svg" 
    : "/logo.svg"

  if (!mounted) {
    // Return a placeholder during hydration
    return (
      <div className={`${sizeClasses[size]} bg-muted/20 rounded ${className}`} />
    )
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Image
        src={logoSrc}
        alt="BargainB Logo"
        width={174}
        height={49}
        className={`${sizeClasses[size]} object-contain`}
        priority={size === "massive"}
      />
    </div>
  )
}

// For the massive waitlist page, we want extra large scaling
export function BargainBLogoMassive({ className = "" }: { className?: string }) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const logoSrc = mounted && (resolvedTheme === 'dark' || theme === 'dark') 
    ? "/logo-darkmode.svg" 
    : "/logo.svg"

  if (!mounted) {
    return (
      <div className="h-12 md:h-16 lg:h-20 w-auto bg-muted/20 rounded" />
    )
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Image
        src={logoSrc}
        alt="BargainB Logo"
        width={174}
        height={49}
        className="h-12 md:h-16 lg:h-20 w-auto object-contain"
        priority
      />
    </div>
  )
}

// Alternative version using the exact colors from your Figma design
export function BargainBLogoStyled({ className = "", size = "massive" }: { className?: string; size?: "small" | "normal" | "large" | "massive" }) {
  const sizeClasses = {
    small: "text-xl",
    normal: "text-2xl md:text-3xl", 
    large: "text-4xl md:text-5xl lg:text-6xl",
    massive: "text-6xl md:text-8xl lg:text-9xl"
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className={`font-black tracking-tight ${sizeClasses[size]}`}>
        <span style={{ color: '#00b207' }}>Bargain</span>
        <span style={{ color: '#002401' }} className="dark:text-primary">B</span>
        <span 
          className="ml-1 align-top"
          style={{ 
            fontSize: size === "massive" ? "0.4em" : "0.5em",
            color: '#00b207'
          }}
        >
          🌱
        </span>
      </div>
    </div>
  )
} 