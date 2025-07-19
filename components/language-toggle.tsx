"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import * as React from "react"

const languages = [
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
]

export function LanguageToggle() {
  const [currentLanguage, setCurrentLanguage] = React.useState(languages[0])
  const [mounted, setMounted] = React.useState(false)

  // Ensure component is mounted before rendering to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Globe className="h-4 w-4" />
      </Button>
    )
  }

  const handleLanguageChange = (language: typeof languages[0]) => {
    setCurrentLanguage(language)
    
    // Handle RTL languages
    const isRTL = language.code === 'ar'
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = language.code
    
    // Emit custom event for the main page to listen to
    const event = new CustomEvent('languageChange', {
      detail: { language: language.code, isRTL }
    })
    window.dispatchEvent(event)
    
    // Here you would typically integrate with your i18n solution
    console.log("Language changed to:", language.code, "RTL:", isRTL)
  }

  return (
    <div className="pointer-events-auto z-[60]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="flex items-center bg-[#F4FBF4] dark:bg-[#323232] text-[#00B207] dark:text-[#FFFFFF] py-5 px-6 rounded-xl space-x-2 pointer-events-auto"
            title="Change language"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:block">{currentLanguage.flag}</span>
            <span className="hidden md:block text-xs ml-1">{currentLanguage.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 z-[70] pointer-events-auto">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language)}
              className="flex items-center space-x-2 cursor-pointer pointer-events-auto"
            >
              <span className="text-lg">{language.flag}</span>
              <span className={language.code === 'ar' ? 'font-arabic' : ''}>{language.name}</span>
              {currentLanguage.code === language.code && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 