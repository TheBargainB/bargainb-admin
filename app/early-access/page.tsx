'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { BargainBLogo } from '@/components/bargainb-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { OrbitingCircles } from '@/components/ui/orbiting-circles'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { BeautifulPhoneInput } from '@/components/ui/phone-input'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { getTranslation, type LanguageCode } from '@/lib/translations'
import { Check } from 'lucide-react'

// Dutch mobile phone validation schema
const earlyAccessSchema = z.object({
  phoneNumber: z.string()
    .min(8, 'Mobiel nummer moet minimaal 8 cijfers bevatten')
    .max(8, 'Mobiel nummer mag maximaal 8 cijfers bevatten')
    .regex(/^6[0-9]{7}$/, 'Voer een geldig Nederlands mobiel nummer in (start met 6)')
})

type EarlyAccessFormData = z.infer<typeof earlyAccessSchema>

// Beautiful Floating Bees Component using Magic UI Orbiting Circles
const FloatingBees = () => {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const beeImage = theme === 'dark' ? '/bee-dark.png' : '/bee.png'

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main orbiting bees */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
        <OrbitingCircles radius={200} duration={25} reverse={false} path={false} iconSize={32}>
          <div className="opacity-70">
            <Image src={beeImage} alt="" width={32} height={32} />
          </div>
        </OrbitingCircles>
        <OrbitingCircles radius={120} duration={20} reverse={true} path={false} iconSize={28}>
          <div className="opacity-60">
            <Image src={beeImage} alt="" width={28} height={28} />
          </div>
        </OrbitingCircles>
        <OrbitingCircles radius={320} duration={35} reverse={false} path={false} iconSize={24}>
          <div className="opacity-50">
            <Image src={beeImage} alt="" width={24} height={24} />
          </div>
        </OrbitingCircles>
      </div>

      {/* Additional scattered bees with different orbits */}
      <div className="absolute top-[20%] right-[15%] w-[300px] h-[300px]">
        <OrbitingCircles radius={80} duration={18} reverse={true} path={false} iconSize={20}>
          <div className="opacity-40">
            <Image src={beeImage} alt="" width={20} height={20} />
          </div>
        </OrbitingCircles>
      </div>

      <div className="absolute bottom-[25%] left-[10%] w-[200px] h-[200px]">
        <OrbitingCircles radius={60} duration={22} reverse={false} path={false} iconSize={24}>
          <div className="opacity-45">
            <Image src={beeImage} alt="" width={24} height={24} />
          </div>
        </OrbitingCircles>
      </div>
    </div>
  )
}

export default function EarlyAccessPage() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('nl')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')

  const t = getTranslation(currentLanguage)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Listen to language changes from LanguageToggle
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language)
    }

    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener)
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger
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
          phoneNumber: `+316${data.phoneNumber}`,
        }),
      })

      if (response.ok) {
        toast.success(t.toast.success.title, {
          description: t.toast.success.description
        })
        reset()
        setPhoneNumber('')
      } else {
        toast.error(t.toast.error.title, {
          description: t.toast.error.description
        })
      }
    } catch (error) {
      console.error('Error submitting early access form:', error)
      toast.error(t.toast.error.title, {
        description: t.toast.error.description
      })
    } finally {
      setIsSubmitting(false)
    }
  }



  if (!mounted) {
    return null
  }

  const placeholders = [
    "Voer je mobiele nummer in...",
    "61234567 (zonder +31)",
    "8 cijfers beginnend met 6",
    "Bijvoorbeeld: 61234567"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Beautiful Floating Bees using Magic UI */}
      <FloatingBees />
      
      {/* Header */}
      <header className="relative z-20 w-full px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <BargainBLogo className="h-8 w-auto" />
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          {/* Left side - iPhone Mockup */}
          <div className="flex justify-center lg:justify-start order-2 lg:order-1">
            <div className="relative">
              <div className="relative w-[400px] lg:w-[480px] xl:w-[520px]">
                <Image
                  src="/iPhone-13-Pro-Front.png"
                  alt="BargainB WhatsApp Interface"
                  width={520}
                  height={1050}
                  className="w-full h-auto drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Right side - Content & Form */}
          <div className="order-1 lg:order-2">
            <div className="max-w-lg lg:max-w-none">
              
              {/* Title */}
              <div className="space-y-6 mb-10">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                  Krijg gratis early access tot{' '}
                  <span className="text-primary">BargainB!</span>
                </h1>
              </div>
              
              {/* Benefits list */}
              <div className="space-y-4 mb-8">
                {[
                  'Persoonlijke aanbiedingen op basis van jouw winkelgedrag',
                  'Werkt met supermarkten bij jou in de buurt',
                  'Automatische updates via WhatsApp',
                  'Geen gedoe met folders of apps'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-primary rounded-sm flex items-center justify-center mt-0.5">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Beautiful Form using Aceternity UI */}
              <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl p-8 shadow-lg dark:bg-card/50 dark:border-border/50">
                <div className="space-y-6">
                  
                  {/* Beautiful Phone Input */}
                  <BeautifulPhoneInput
                    value={phoneNumber}
                    onChange={(value) => {
                      setPhoneNumber(value)
                      setValue('phoneNumber', value)
                      if (value.length === 8) {
                        trigger('phoneNumber')
                      }
                    }}
                    onSubmit={() => {
                      if (phoneNumber && /^6[0-9]{7}$/.test(phoneNumber)) {
                        handleSubmit(handleEarlyAccessSubmit)()
                      }
                    }}
                    disabled={isSubmitting}
                  />
                    
                  <div className="text-xs text-muted-foreground text-right">
                    Beperkte beschikbaarheid! Slechts 100 plekken over.
                  </div>
                  
                  {/* Beautiful Shimmer Button */}
                  <ShimmerButton
                    onClick={() => handleSubmit(handleEarlyAccessSubmit)()}
                    disabled={isSubmitting || !phoneNumber || phoneNumber.length !== 8}
                    className="w-full py-4 text-lg rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold disabled:opacity-50"
                    shimmerColor="#ffffff40"
                    background="hsl(var(--primary))"
                  >
                    {isSubmitting ? 'Even geduld...' : 'Vraag Early Access Aan'}
                  </ShimmerButton>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FAQ Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            {t.faq.title}
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-6">
            <AccordionItem value="item-1" className="bg-background/60 backdrop-blur-sm border border-border rounded-xl px-6 py-2 shadow-sm dark:bg-card/30">
              <AccordionTrigger className="text-left font-semibold text-lg py-4">
                {t.faq.questions.free.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                {t.faq.questions.free.answer}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="bg-background/60 backdrop-blur-sm border border-border rounded-xl px-6 py-2 shadow-sm dark:bg-card/30">
              <AccordionTrigger className="text-left font-semibold text-lg py-4">
                {t.faq.questions.whenAccess.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                {t.faq.questions.whenAccess.answer}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="bg-background/60 backdrop-blur-sm border border-border rounded-xl px-6 py-2 shadow-sm dark:bg-card/30">
              <AccordionTrigger className="text-left font-semibold text-lg py-4">
                {t.faq.questions.whatIs.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                {t.faq.questions.whatIs.answer}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="bg-background/60 backdrop-blur-sm border border-border rounded-xl px-6 py-2 shadow-sm dark:bg-card/30">
              <AccordionTrigger className="text-left font-semibold text-lg py-4">
                {t.faq.questions.benefits.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                {t.faq.questions.benefits.answer}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-background/80 backdrop-blur-sm dark:bg-card/20 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-muted-foreground">
            <span>© 2024 BargainB - Alle rechten voorbehouden</span>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="hover:text-foreground transition-colors duration-200 underline-offset-4 hover:underline">
                Privacybeleid
              </a>
              <a href="/terms" className="hover:text-foreground transition-colors duration-200 underline-offset-4 hover:underline">
                Algemene voorwaarden
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 