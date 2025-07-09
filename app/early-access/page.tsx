'use client'

import { BargainBLogo } from '@/components/bargainb-logo'
import Footer from '@/components/footer'
import { LanguageToggle } from '@/components/language-toggle'
import { ThemeToggle } from '@/components/theme-toggle'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { OrbitingCircles } from '@/components/ui/orbiting-circles'
import { BeautifulPhoneInput } from '@/components/ui/phone-input'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { getTranslation, type LanguageCode } from '@/lib/translations'
import bgEffect from '@/public/background-effect.svg'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

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
        <OrbitingCircles radius={200} duration={25} reverse={false} path={false} iconSize={48}>
          <div className="opacity-70">
            <Image src={beeImage} alt="" width={48} height={48} />
          </div>
        </OrbitingCircles>
        <OrbitingCircles radius={120} duration={20} reverse={true} path={false} iconSize={42}>
          <div className="opacity-60">
            <Image src={beeImage} alt="" width={42} height={42} />
          </div>
        </OrbitingCircles>
        <OrbitingCircles radius={320} duration={35} reverse={false} path={false} iconSize={36}>
          <div className="opacity-50">
            <Image src={beeImage} alt="" width={36} height={36} />
          </div>
        </OrbitingCircles>
      </div>

      {/* Additional scattered bees with different orbits */}
      <div className="absolute top-[20%] right-[15%] w-[300px] h-[300px]">
        <OrbitingCircles radius={80} duration={18} reverse={true} path={false} iconSize={30}>
          <div className="opacity-40">
            <Image src={beeImage} alt="" width={30} height={30} />
          </div>
        </OrbitingCircles>
      </div>

      <div className="absolute bottom-[25%] left-[10%] w-[200px] h-[200px]">
        <OrbitingCircles radius={60} duration={22} reverse={false} path={false} iconSize={36}>
          <div className="opacity-45">
            <Image src={beeImage} alt="" width={36} height={36} />
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

  // Dynamic validation schema that responds to language changes
  const earlyAccessSchema = z.object({
    phoneNumber: z.string()
      .min(8, t.validation.phoneLength)
      .max(8, t.validation.phoneLength)
      .regex(/^6[0-9]{7}$/, t.validation.phoneFormat)
  })

  type EarlyAccessFormData = z.infer<typeof earlyAccessSchema>

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

  // Dynamic benefits list based on language
  const benefits = [
    t.hero.description,
    currentLanguage === 'nl' ? 'Werkt met supermarkten bij jou in de buurt' : 
    currentLanguage === 'en' ? 'Works with supermarkets near you' :
    currentLanguage === 'de' ? 'Funktioniert mit Supermärkten in Ihrer Nähe' :
    currentLanguage === 'fr' ? 'Fonctionne avec les supermarchés près de chez vous' :
    currentLanguage === 'it' ? 'Funziona con i supermercati vicino a te' :
    'Funciona con supermercados cerca de ti',
    t.hero.exclusiveWhatsApp,
    currentLanguage === 'nl' ? 'Geen gedoe met folders of apps' : 
    currentLanguage === 'en' ? 'No hassle with flyers or apps' :
    currentLanguage === 'de' ? 'Kein Ärger mit Flyern oder Apps' :
    currentLanguage === 'fr' ? 'Pas de tracas avec les dépliants ou les applications' :
    currentLanguage === 'it' ? 'Niente seccature con volantini o app' :
    'Sin complicaciones con folletos o aplicaciones'
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Image
          src={bgEffect}
          alt='shadow'
          width={1800}
          height={550}
          className='absolute top-0 left-1/2 -z-10 -translate-x-1/2 pointer-events-none'
          priority
      />
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
      <main className="container lg:h-screen flex items-center relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          {/* Left side - iPhone Mockup */}
          <div className="flex justify-center lg:justify-start order-2 lg:order-1">
            <div className="relative">
              <div className="relative w-[400px] lg:w-[480px] xl:w-[520px]">
                <Image
                  src="/iPhone-13-Pro-Front.png"
                  alt="BargainB WhatsApp Interface"
                  width={520}
                  height={1050}
                  className="w-full h-auto hidden md:flex"
                  priority
                />
                <Image
                        src='/iPhone-sm.png'
                        alt='iPhone'
                        width={650}
                        height={686}
                        priority
                        quality={100}
                        className='flex md:hidden w-[326px] h-[344px] m-auto mt-5 object-contain'
                    />
              </div>
            </div>
          </div>

          {/* Right side - Content & Form */}
          <div className="order-1 lg:order-2">
            <div className="w-full lg:max-w-none">
              
              {/* Title */}
              <div className="space-y-6 mb-10">
                <h1 className="font-[family-name:var(--font-paytone-one)] text-[30px] lg:text-[35px] xl:text-[35px] 2xl:text-[45px] text-[#3D3D3D] dark:text-[#F5F5F5] text-center md:text-start tracking-[0.9px] leading-9 md:leading-[50px] 2xl:leading-[55px]">
                  {currentLanguage === 'nl' ? 'Krijg gratis early access tot' : 
                   currentLanguage === 'en' ? 'Get free early access to' :
                   currentLanguage === 'de' ? 'Erhalten Sie kostenlosen frühen Zugang zu' :
                   currentLanguage === 'fr' ? 'Obtenez un accès anticipé gratuit à' :
                   currentLanguage === 'it' ? 'Ottieni accesso anticipato gratuito a' :
                   'Obtén acceso anticipado gratuito a'}{' '}
                  <span className="text-primary">{t.hero.bargainB}!</span>
                </h1>
              </div>
              
              {/* Benefits list */}
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-primary rounded-sm flex items-center justify-center mt-0.5">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <span className="font-[family-name:var(--font-inter)] text-sm xl:text-base text-[#7A7A7A] dark:text-[#F5F5F5] leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Beautiful Form using Aceternity UI */}
              <div className="mt-14">
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
                    language={currentLanguage}
                  />
                    
                  <div className="text-xs text-muted-foreground text-right">
                    {currentLanguage === 'nl' ? 'Beperkte beschikbaarheid! Slechts 100 plekken over.' : 
                     currentLanguage === 'en' ? 'Limited availability! Only 100 spots left.' :
                     currentLanguage === 'de' ? 'Begrenzte Verfügbarkeit! Nur noch 100 Plätze.' :
                     currentLanguage === 'fr' ? 'Disponibilité limitée! Seulement 100 places restantes.' :
                     currentLanguage === 'it' ? 'Disponibilità limitata! Solo 100 posti rimasti.' :
                     '¡Disponibilidad limitada! Solo quedan 100 lugares.'}
                  </div>
                  
                  {/* Beautiful Shimmer Button */}
                  <ShimmerButton
                    onClick={() => handleSubmit(handleEarlyAccessSubmit)()}
                    disabled={isSubmitting || !phoneNumber || phoneNumber.length !== 8}
                    className="max-w-max py-4 text-lg rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold disabled:opacity-50"
                    shimmerColor="#ffffff40"
                    background="hsl(var(--primary))"
                  >
                    {isSubmitting ? t.form.submitting : t.form.submitButton}
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
          <h2 className="font-[family-name:var(--font-paytone-one)] text-center my-10 text-[30px] sm:text-[35px] md:text-[45px] text-[#3D3D3D] dark:text-[#F5F5F5] tracking-[0.9px] leading-[50px] px-4">
            {t.faq.title}
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-6">
            <AccordionItem value="item-1" className="bg-background/60 backdrop-blur-sm border border-border rounded-xl px-6 py-2 shadow-sm dark:bg-card/30">
              <AccordionTrigger className="font-[family-name:var(--font-inter)] font-bold text-base text-[#3D3D3D] dark:text-[#F5F5F5] py-4">
                {t.faq.questions.free.question}
              </AccordionTrigger>
              <AccordionContent className="font-[family-name:var(--font-inter)] text-sm text-[#7A7A7A] dark:text-[#F5F5F5] leading-relaxed pb-4">
                {t.faq.questions.free.answer}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="bg-background/60 backdrop-blur-sm border border-border rounded-xl px-6 py-2 shadow-sm dark:bg-card/30">
              <AccordionTrigger className="font-[family-name:var(--font-inter)] font-bold text-base text-[#3D3D3D] dark:text-[#F5F5F5] py-4">
                {t.faq.questions.whenAccess.question}
              </AccordionTrigger>
              <AccordionContent className="font-[family-name:var(--font-inter)] text-sm text-[#7A7A7A] dark:text-[#F5F5F5] leading-relaxed pb-4">
                {t.faq.questions.whenAccess.answer}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="bg-background/60 backdrop-blur-sm border border-border rounded-xl px-6 py-2 shadow-sm dark:bg-card/30">
              <AccordionTrigger className="font-[family-name:var(--font-inter)] font-bold text-base text-[#3D3D3D] dark:text-[#F5F5F5] py-4">
                {t.faq.questions.whatIs.question}
              </AccordionTrigger>
              <AccordionContent className="font-[family-name:var(--font-inter)] text-sm text-[#7A7A7A] dark:text-[#F5F5F5] leading-relaxed pb-4">
                {t.faq.questions.whatIs.answer}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="bg-background/60 backdrop-blur-sm border border-border rounded-xl px-6 py-2 shadow-sm dark:bg-card/30">
              <AccordionTrigger className="font-[family-name:var(--font-inter)] font-bold text-base text-[#3D3D3D] dark:text-[#F5F5F5] py-4">
                {t.faq.questions.benefits.question}
              </AccordionTrigger>
              <AccordionContent className="font-[family-name:var(--font-inter)] text-sm text-[#7A7A7A] dark:text-[#F5F5F5] leading-relaxed pb-4">
                {t.faq.questions.benefits.answer}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
} 