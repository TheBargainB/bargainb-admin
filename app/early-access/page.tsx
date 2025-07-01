'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { BargainBLogo } from '@/components/bargainb-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { getTranslation, type LanguageCode } from '@/lib/translations'

// Email form validation schema
const earlyAccessSchema = z.object({
  email: z.string()
    .email('Voer een geldig e-mailadres in')
    .min(1, 'E-mailadres is verplicht')
})

type EarlyAccessFormData = z.infer<typeof earlyAccessSchema>

// Countdown hook with target date
const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return timeLeft
}

// Social Media Icons Component
const SocialIcon = ({ icon, href, ariaLabel }: { icon: React.ReactNode, href: string, ariaLabel: string }) => (
  <a
    href={href}
    target="_blank" 
    rel="noopener noreferrer"
    aria-label={ariaLabel}
    className="w-10 h-10 rounded-full bg-secondary hover:bg-accent transition-colors duration-200 flex items-center justify-center group"
  >
    <div className="text-primary group-hover:scale-110 transition-transform duration-200">
      {icon}
    </div>
  </a>
)

// People Avatar Component
const PeopleAvatars = () => (
  <div className="flex -space-x-2">
    {[...Array(5)].map((_, i) => (
      <div 
        key={i}
        className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium text-primary"
      >
        {String.fromCharCode(65 + i)}
      </div>
    ))}
  </div>
  )

export default function EarlyAccessPage() {
  const [language, setLanguage] = useState<LanguageCode>('nl')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [peopleCount, setPeopleCount] = useState(9847)

  // Set target launch date (example: 30 days from now)
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 30)

  const timeLeft = useCountdown(targetDate)

  // Listen for language changes from LanguageToggle component
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail.language as LanguageCode)
    }
    
    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EarlyAccessFormData>({
    resolver: zodResolver(earlyAccessSchema)
  })

  const handleEarlyAccessSubmit = async (data: EarlyAccessFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          language: language
        }),
      })

      if (response.ok) {
        toast.success('Bedankt! Je bent toegevoegd aan de wachtlijst.')
        reset()
        setPeopleCount(prev => prev + 1)
      } else {
        toast.error('Er ging iets mis. Probeer het opnieuw.')
      }
    } catch (error) {
      console.error('Error submitting early access form:', error)
      toast.error('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full px-4 py-6">
        <div className="max-w-7xl mx-auto flex justify-end items-center gap-4">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        {/* Logo */}
        <div className="mb-16">
          <BargainBLogo className="mx-auto h-12 w-auto" />
        </div>

        {/* Countdown Label */}
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            LANCERING OVER
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="mb-16">
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { value: timeLeft.days, label: 'Dagen' },
              { value: timeLeft.hours, label: 'Uren' },
              { value: timeLeft.minutes, label: 'Minuten' },
              { value: timeLeft.seconds, label: 'Seconden' }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-card rounded-xl p-6 shadow-lg dark:figma-countdown-shadow-dark figma-countdown-shadow-light"
              >
                <div className="text-4xl font-bold text-primary mb-2 paytone-one">
                  {item.value.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Heading */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 paytone-one">
            Word Lid Van Onze
                  <br />
            Lanceer Wachtlijst
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Wees de eerste die hoort wanneer BargainB live gaat. Krijg vroege toegang tot exclusieve deals en kortingen voordat anderen dat doen.
          </p>
              </div>

        {/* Email Form */}
        <div className="mb-12">
          <form onSubmit={handleSubmit(handleEarlyAccessSubmit)} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                      <input
                  {...register('email')}
                  type="email"
                  placeholder="Voer je e-mailadres in"
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-transparent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-foreground placeholder:text-muted-foreground"
                      />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1 text-left">
                    {errors.email.message}
                  </p>
                    )}
                  </div>
              <button
                    type="submit"
                    disabled={isSubmitting}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                {isSubmitting ? 'Bezig...' : 'Ontvang Melding'}
              </button>
                      </div>
                </form>
        </div>

        {/* People Counter */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <PeopleAvatars />
            <span className="font-medium">
              {peopleCount.toLocaleString('nl-NL')}+ mensen op de wachtlijst
            </span>
                    </div>
                </div>

        {/* Social Media Icons */}
        <div className="mb-12">
          <div className="flex justify-center gap-4">
            <SocialIcon
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              }
              href="https://facebook.com"
              ariaLabel="Facebook"
            />
            <SocialIcon
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              }
              href="https://instagram.com"
              ariaLabel="Instagram"
            />
            <SocialIcon
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              }
              href="https://linkedin.com"
              ariaLabel="LinkedIn"
            />
            <SocialIcon
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              }
              href="https://tiktok.com"
              ariaLabel="TikTok"
            />
            <SocialIcon
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              }
              href="https://twitter.com"
              ariaLabel="Twitter"
            />
          </div>
          </div>

        {/* Product Hunt Button */}
        <div className="mb-16">
          <a
            href="https://www.producthunt.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-accent text-foreground rounded-lg transition-all duration-200 font-medium"
                >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.337 9h-2.838v3h2.838c.83 0 1.5-.67 1.5-1.5S14.167 9 13.337 9z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.337 14h-2.838v4H8.501V6h4.836C16.194 6 18 7.806 18 10.5S16.194 14 13.337 14z"/>
            </svg>
            Volg ons op Product Hunt
          </a>
                    </div>
      </main>
                  
      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-muted-foreground">
            <span>© 2024 BargainB. Alle rechten voorbehouden.</span>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Privacybeleid
              </a>
              <a href="/terms" className="hover:text-foreground transition-colors">
                Voorwaarden
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div>
  )
} 