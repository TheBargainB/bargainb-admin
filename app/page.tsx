"use client"

import { BargainBLogoMassive } from "@/components/bargainb-logo"
import Footer from "@/components/footer"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle, Facebook, Instagram, Linkedin, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const translations = {
  nl: {
    launchingIn: "Lancering Over",
    days: "Dagen",
    hours: "Uren", 
    minutes: "Minuten",
    seconds: "Seconden",
    joinWaitlist: "Word Lid Van Onze",
    launchWaitlist: "Lanceer Wachtlijst",
    subtitle: "Wees de eerste die toegang krijgt tot het ultieme prijsvergelijkingsplatform. Sluit je aan bij duizenden slimme shoppers die al vroege toegang krijgen tot onverslaanbare deals.",
    emailPlaceholder: "Voer je e-mailadres in",
    getNotified: "Ontvang Melding",
    joining: "Lid Worden...",
    youreIn: "Je Bent Erbij!",
    notifyMessage: "We sturen je een melding zodra BargainB wordt gelanceerd!",
    peopleWaitlist: "mensen op de wachtlijst",
    successTitle: "🎉 Welkom bij BargainB!",
    successDesc: "Je bent nu onderdeel van de exclusieve lanceerploeg!",
    errorTitle: "Oeps! Er is iets misgegaan",
    errorDesc: "Probeer het opnieuw of neem contact op met de ondersteuning als het probleem aanhoudt.",
    emailError: "Voer een geldig e-mailadres in."
  },
  en: {
    launchingIn: "Launching In",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    joinWaitlist: "Join Our",
    launchWaitlist: "Launch Waitlist",
    subtitle: "Be first to access the ultimate price comparison platform. Join thousands of smart shoppers already gaining early access to unbeatable deals.",
    emailPlaceholder: "Enter your email address",
    getNotified: "Get Notified",
    joining: "Joining...",
    youreIn: "You're In!",
    notifyMessage: "We'll notify you the moment BargainB launches!",
    peopleWaitlist: "people on the waitlist",
    successTitle: "🎉 Welcome to BargainB!",
    successDesc: "You're now part of the exclusive launch crew!",
    errorTitle: "Oops! Something went wrong",
    errorDesc: "Please try again or contact support if the problem persists.",
    emailError: "Please enter a valid email address."
  },
  de: {
    launchingIn: "Start In",
    days: "Tage",
    hours: "Stunden",
    minutes: "Minuten", 
    seconds: "Sekunden",
    joinWaitlist: "Treten Sie Unserer",
    launchWaitlist: "Start-Warteliste Bei",
    subtitle: "Seien Sie der Erste, der Zugang zur ultimativen Preisvergleichsplattform erhält. Schließen Sie sich Tausenden von intelligenten Käufern an, die bereits frühen Zugang zu unschlagbaren Angeboten erhalten.",
    emailPlaceholder: "E-Mail-Adresse eingeben",
    getNotified: "Benachrichtigung Erhalten",
    joining: "Beitreten...",
    youreIn: "Sie Sind Dabei!",
    notifyMessage: "Wir benachrichtigen Sie, sobald BargainB startet!",
    peopleWaitlist: "Personen auf der Warteliste",
    successTitle: "🎉 Willkommen bei BargainB!",
    successDesc: "Sie sind jetzt Teil der exklusiven Start-Crew!",
    errorTitle: "Ups! Etwas ist schiefgelaufen",
    errorDesc: "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support, wenn das Problem weiterhin besteht.",
    emailError: "Bitte geben Sie eine gültige E-Mail-Adresse ein."
  },
  fr: {
    launchingIn: "Lancement Dans",
    days: "Jours",
    hours: "Heures",
    minutes: "Minutes",
    seconds: "Secondes", 
    joinWaitlist: "Rejoignez Notre",
    launchWaitlist: "Liste D'Attente De Lancement",
    subtitle: "Soyez le premier à accéder à la plateforme ultime de comparaison de prix. Rejoignez des milliers d'acheteurs intelligents qui ont déjà un accès anticipé à des offres imbattables.",
    emailPlaceholder: "Entrez votre adresse e-mail",
    getNotified: "Être Notifié",
    joining: "Rejoindre...",
    youreIn: "Vous Y Êtes!",
    notifyMessage: "Nous vous préviendrons dès que BargainB sera lancé!",
    peopleWaitlist: "personnes sur la liste d'attente",
    successTitle: "🎉 Bienvenue chez BargainB!",
    successDesc: "Vous faites maintenant partie de l'équipe de lancement exclusive!",
    errorTitle: "Oops! Quelque chose s'est mal passé",
    errorDesc: "Veuillez réessayer ou contacter le support si le problème persiste.",
    emailError: "Veuillez saisir une adresse e-mail valide."
  },
  it: {
    launchingIn: "Lancio Tra",
    days: "Giorni",
    hours: "Ore",
    minutes: "Minuti",
    seconds: "Secondi",
    joinWaitlist: "Unisciti Alla Nostra",
    launchWaitlist: "Lista D'Attesa Di Lancio",
    subtitle: "Sii il primo ad accedere alla piattaforma definitiva di confronto prezzi. Unisciti a migliaia di acquirenti intelligenti che stanno già ottenendo accesso anticipato a offerte imbattibili.",
    emailPlaceholder: "Inserisci la tua email",
    getNotified: "Ricevi Notifica",
    joining: "Iscrizione...",
    youreIn: "Sei Dentro!",
    notifyMessage: "Ti avviseremo non appena BargainB sarà lanciato!",
    peopleWaitlist: "persone in lista d'attesa",
    successTitle: "🎉 Benvenuto in BargainB!",
    successDesc: "Ora fai parte del team di lancio esclusivo!",
    errorTitle: "Ops! Qualcosa è andato storto",
    errorDesc: "Riprova o contatta il supporto se il problema persiste.",
    emailError: "Inserisci un indirizzo email valido."
  },
  es: {
    launchingIn: "Lanzamiento En",
    days: "Días",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
    joinWaitlist: "Únete A Nuestra",
    launchWaitlist: "Lista De Espera De Lanzamiento",
    subtitle: "Sé el primero en acceder a la plataforma definitiva de comparación de precios. Únete a miles de compradores inteligentes que ya están obteniendo acceso temprano a ofertas inmejorables.",
    emailPlaceholder: "Ingresa tu correo electrónico",
    getNotified: "Recibir Notificación",
    joining: "Uniéndose...",
    youreIn: "¡Estás Dentro!",
    notifyMessage: "¡Te notificaremos en cuanto se lance BargainB!",
    peopleWaitlist: "personas en la lista de espera",
    successTitle: "🎉 ¡Bienvenido a BargainB!",
    successDesc: "¡Ahora eres parte del equipo de lancio exclusivo!",
    errorTitle: "¡Ups! Algo salió mal",
    errorDesc: "Inténtalo de nuevo o contacta al soporte si el problema persiste.",
    emailError: "Ingresa una dirección de correo válida."
  }
}

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

// Product Hunt Badge component that switches based on theme
const ProductHuntBadge = () => {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = resolvedTheme === 'dark' || theme === 'dark'
  const imageUrl = isDark 
    ? "https://api.producthunt.com/widgets/embed-image/v1/follow.svg?product_id=552361&theme=dark"
    : "https://api.producthunt.com/widgets/embed-image/v1/follow.svg?product_id=552361&theme=light"

  return (
    <a 
      href="https://www.producthunt.com/products/bargainb?utm_source=badge-follow&utm_medium=badge&utm_source=badge-bargainb" 
      target="_blank" 
      rel="noopener noreferrer"
      className="block transition-opacity hover:opacity-80"
    >
      <img 
        src={imageUrl}
        alt="BargainB - Your ultimate grocery shopping companion! | Product Hunt" 
        className="w-[150px] md:w-[180px] lg:w-[200px] h-auto"
        width="200"
        height="43"
      />
    </a>
  )
}

export default function PublicHomePage() {
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof translations>("nl")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Calculate time since 5pm yesterday
  const getInitialTime = (): CountdownTime => {
    const now = new Date()
    const yesterday5pm = new Date()
    yesterday5pm.setDate(yesterday5pm.getDate() - 1)
    yesterday5pm.setHours(17, 0, 0, 0) // 5pm yesterday
    
    const timeDiff = now.getTime() - yesterday5pm.getTime()
    const totalSeconds = Math.floor(timeDiff / 1000)
    
    const days = Math.floor(totalSeconds / (24 * 60 * 60))
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
    const seconds = totalSeconds % 60
    
    // Calculate remaining time from 90 days
    const totalRemainingSeconds = (90 * 24 * 60 * 60) - totalSeconds
    
    const remainingDays = Math.floor(totalRemainingSeconds / (24 * 60 * 60))
    const remainingHours = Math.floor((totalRemainingSeconds % (24 * 60 * 60)) / (60 * 60))
    const remainingMinutes = Math.floor((totalRemainingSeconds % (60 * 60)) / 60)
    const remainingSeconds = totalRemainingSeconds % 60
    
    return {
      days: Math.max(0, remainingDays),
      hours: Math.max(0, remainingHours),
      minutes: Math.max(0, remainingMinutes),
      seconds: Math.max(0, remainingSeconds)
    }
  }
  
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({ days: 89, hours: 19, minutes: 0, seconds: 0 })
  const [jumpEffect, setJumpEffect] = useState<{ [key: string]: boolean }>({})
  const [waitlistCount, setWaitlistCount] = useState<number>(9847) // Default fallback number

  const t = translations[currentLanguage]

  const formSchema = z.object({
    email: z.string().email({
      message: t.emailError,
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  // Set mounted state and initialize countdown on client
  useEffect(() => {
    setMounted(true)
    setTimeLeft(getInitialTime())
  }, [])

  // Fetch waitlist count on mount
  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const response = await fetch('/api/waitlist')
        const result = await response.json()
        if (result.success && result.data.waitlistCount !== undefined) {
          // Add some padding to make it look more impressive
          const paddedCount = result.data.waitlistCount + 9800
          setWaitlistCount(paddedCount)
        }
      } catch (error) {
        console.log('Failed to fetch waitlist count, using default')
        // Keep the default value if API fails
      }
    }
    
    fetchWaitlistCount()
  }, [])

  // Listen to language changes from window events (from LanguageToggle)
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language)
    }

    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return // Don't start timer until mounted

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // Real countdown from 90 days
        let newDays = prev.days
        let newHours = prev.hours
        let newMinutes = prev.minutes
        let newSeconds = prev.seconds

        // Decrease seconds
        if (newSeconds > 0) {
          newSeconds -= 1
        } else {
          newSeconds = 59
          // Decrease minutes
          if (newMinutes > 0) {
            newMinutes -= 1
          } else {
            newMinutes = 59
            // Decrease hours
            if (newHours > 0) {
              newHours -= 1
            } else {
              newHours = 23
              // Decrease days
              if (newDays > 0) {
                newDays -= 1
              }
            }
          }
        }

        const newTime = {
          days: Math.max(0, newDays),
          hours: Math.max(0, newHours),
          minutes: Math.max(0, newMinutes),
          seconds: Math.max(0, newSeconds),
        }

        // Trigger jump effects only when numbers change
        if (newTime.seconds !== prev.seconds) {
          // Only animate seconds when it goes from 00 to 59 (minute change)
          if (prev.seconds === 0 && newTime.seconds === 59) {
            setJumpEffect((prev) => ({ ...prev, seconds: true }))
            setTimeout(() => {
              setJumpEffect((prev) => ({ ...prev, seconds: false }))
            }, 400)
          }
        }
        
        if (newTime.minutes !== prev.minutes) {
          setJumpEffect((prev) => ({ ...prev, minutes: true }))
          setTimeout(() => {
            setJumpEffect((prev) => ({ ...prev, minutes: false }))
          }, 400)
        }
        
        if (newTime.hours !== prev.hours) {
          setJumpEffect((prev) => ({ ...prev, hours: true }))
          setTimeout(() => {
            setJumpEffect((prev) => ({ ...prev, hours: false }))
          }, 400)
        }
        
        if (newTime.days !== prev.days) {
          setJumpEffect((prev) => ({ ...prev, days: true }))
          setTimeout(() => {
            setJumpEffect((prev) => ({ ...prev, days: false }))
          }, 400)
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [mounted])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        
        // Update waitlist count immediately for new signups
        if (!result.alreadyExists) {
          setWaitlistCount(prev => prev + 1)
        }
        
        if (result.alreadyExists) {
          toast.success(t.successTitle, {
            description: result.message,
            duration: 5000,
          })
        } else {
          toast.success(t.successTitle, {
            description: t.successDesc,
            duration: 5000,
          })
        }
        
        // Reset form after success
        form.reset()
      } else {
        throw new Error(result.error || 'Failed to join waitlist')
      }
    } catch (error) {
      console.error('Waitlist signup error:', error)
      toast.error(t.errorTitle, {
        description: error instanceof Error ? error.message : t.errorDesc,
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const CountdownNumber = ({ value, label, unit }: { value: number; label: string; unit: string }) => {
    const isJumping = jumpEffect[unit]

    return (
      <div className="flex flex-col items-center space-y-4">
        <div
          className={`text-lg md:text-2xl lg:text-4xl xl:text-5xl font-black text-foreground dark:text-[#84D187] tabular-nums transition-all duration-300 font-[family-name:var(--font-paytone-one)] shadow-[0px_9.338px_33.35px_0px_rgba(100,_100,_111,_0.15)] dark:shadow-[0px_9.338px_33.35px_0px_rgba(167,_167,_167,_0.15)] bg-white dark:bg-[#1F1F1F] p-5 rounded-3xl ${
            isJumping ? "animate-bounce" : ""
          }`}
          style={{
            color: "hsl(var(--primary))",
            textShadow: "0 0 20px hsla(var(--primary), 0.3)",
          }}
        >
          {mounted ? value.toString().padStart(2, "0") : "00"}
        </div>
        <div className="min-h-[16px] md:min-h-[18px] lg:min-h-[20px] flex items-center justify-center">
          <div className="font-[family-name:var(--font-inter)] text-xs md:text-sm lg:text-base font-medium text-[#7A7A7A] tracking-wider text-center">
            {label}
          </div>
        </div>
      </div>
    )
  }

  // Mock user avatars
  const userAvatars = [
    { initials: "JD", bg: "bg-primary" },
    { initials: "AS", bg: "bg-purple-500" },
    { initials: "MK", bg: "bg-pink-500" },
  ]

  return (
    <div className="min-h-screen bg-custom-gradient dark:bg-dark-green-gradient relative overflow-hidden">
      <Image
          src={`/background-effect.svg`}
          alt='shadow'
          width={1500}
          height={350}
          className='absolute top-0 left-1/2 z-1 -translate-x-1/2 pointer-events-none'
      />
      {/* Theme and Language Toggles - Upper Right */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50 flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsla(var(--primary),0.1),transparent_50%)]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-2 md:p-4 px-4 md:px-6">
        <div className="w-full max-w-sm md:max-w-4xl text-center animate-fade-in">
          {/* Big Centered Logo - Right above countdown */}
          <div className="mb-4 md:mb-6 text-center">
            <BargainBLogoMassive className="mt-16 md:mt-4 mb-3 md:mb-4" />
            
            {/* Launching In - Right below logo */}
            <div className="min-h-[20px] md:min-h-[24px] mb-3 md:mb-10 mt-12 flex items-center justify-center">
              <h3 className="font-[family-name:var(--font-inter)] text-sm md:text-base lg:text-lg font-medium text-[#7A7A7A] dark:text-[#F5F5F5] uppercase tracking-wide">
                {t.launchingIn}
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-3 md:gap-4 lg:gap-8 max-w-sm md:max-w-xl mx-auto my-5 md:my-10">
              <CountdownNumber value={timeLeft.days} label={t.days} unit="days" />
              <CountdownNumber value={timeLeft.hours} label={t.hours} unit="hours" />
              <CountdownNumber value={timeLeft.minutes} label={t.minutes} unit="minutes" />
              <CountdownNumber value={timeLeft.seconds} label={t.seconds} unit="seconds" />
            </div>
          </div>

          {/* Main Heading */}
          <div className=" flex flex-col justify-center my-5 md:mt-16 md:mb-8">
            <h2 className="font-[family-name:var(--font-paytone-one)] text-xl md:text-2xl lg:text-4xl xl:text-[40px] font-bold text-[#1F1F1F] dark:text-[#F5F5F5] leading-tight px-4">
              {t.joinWaitlist} {' '}
              
              <span className="text-[#00B207] dark:text-[#84D187]">
                {t.launchWaitlist}
              </span>
            </h2>
          </div>

          {/* Subtitle */}
          <div className="flex items-center justify-center mb-3 md:mb-4">
            <p className="font-[family-name:var(--font-inter)] text-xs sm:text-sm md:text-base lg:text-base text-[#3D3D3D] dark:text-[#F5F5F5] max-w-xl lg:max-w-3xl mx-auto leading-relaxed px-4">
              {t.subtitle}
            </p>
          </div>

          {/* Success State */}
          <div className="flex items-center justify-center mb-3 md:mb-4">
            {isSuccess && (
              <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-lg max-w-sm md:max-w-lg mx-auto transform animate-pulse">
                <div className="flex items-center justify-center mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="font-[family-name:var(--font-paytone-one)] text-lg md:text-xl font-bold text-foreground text-center mb-2">{t.youreIn}</h3>
                <p className="font-[family-name:var(--font-inter)] text-xs md:text-sm text-muted-foreground text-center">{t.notifyMessage}</p>
              </div>
            )}
          </div>

          {/* Email Form */}
          <div className="min-h-[70px] md:min-h-[80px] flex flex-col justify-center mb-4 md:mb-6">
            <div className="w-full md:max-w-xl m-auto px-2 md:px-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="email"
                              placeholder={t.emailPlaceholder}
                              {...field}
                              className="h-9 md:h-10 lg:h-12 px-3 md:px-4 text-xs md:text-sm lg:text-base bg-[#F4FBF4] dark:bg-[#323232] text-[#00B207] rounded-xl border-0 focus-visible:ring-0 focus:ring-0 placeholder:text-muted-foreground w-full font-[family-name:var(--font-inter)]"
                              disabled={isLoading}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-9 md:h-10 lg:h-12 px-4 md:px-6 text-xs md:text-sm lg:text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap w-full sm:w-auto md:min-w-[140px] font-[family-name:var(--font-inter)]"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-2 animate-spin" />
                        <span className="text-xs md:text-sm">{t.joining}</span>
                      </div>
                    ) : (
                      <span className="text-xs md:text-sm">{t.getNotified}</span>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>

       

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6 mt-28">
            
            <a
              href="https://www.facebook.com/thebargainbapp"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 md:w-8 md:h-8 bg-[#F4FBF4] dark:bg-[#323232] hover:bg-muted rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <Facebook className="w-3 h-3 md:w-4 md:h-4 text-[#00B207] dark:text-[#84D187]" />
            </a>
            <a
              href="https://www.instagram.com/thebargainbhq/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 md:w-8 md:h-8 bg-[#F4FBF4] dark:bg-[#323232] hover:bg-muted rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <Instagram className="w-3 h-3 md:w-4 md:h-4 text-[#00B207] dark:text-[#84D187]" />
            </a>
            
            <a
              href="https://www.linkedin.com/company/bargainb/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 md:w-8 md:h-8 bg-[#F4FBF4] dark:bg-[#323232] hover:bg-muted rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <Linkedin className="w-3 h-3 md:w-4 md:h-4 text-[#00B207] dark:text-[#84D187]" />
            </a>
            <a
              href="https://www.tiktok.com/@thebargainb_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 md:w-8 md:h-8 bg-[#F4FBF4] dark:bg-[#323232] hover:bg-muted rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                <path d="M14.1608 5.96855C13.6749 5.41384 13.3828 4.69055 13.3828 3.89984H12.774M14.1608 5.96855C14.6036 6.47426 15.2031 6.84204 15.8858 6.98605C16.098 7.03203 16.3194 7.05658 16.55 7.05658V9.32445C15.3692 9.32445 14.2744 8.94753 13.3827 8.31003V12.9225C13.3827 15.2272 11.5007 17.0998 9.19135 17.0998C7.98282 17.0998 6.89117 16.5849 6.12548 15.7666C5.42744 15.0189 5 14.0197 5 12.9225C5 10.6515 6.8266 8.8004 9.08986 8.75136M14.1608 5.96855C14.149 5.96086 14.1372 5.95311 14.1254 5.94527M7.64154 14.032C7.41399 13.7194 7.27868 13.3363 7.27868 12.9195C7.27868 11.8683 8.13663 11.0132 9.19141 11.0132C9.3882 11.0132 9.35915 10.8572 9.5375 10.9123V8.76328C9.35299 8.73873 9.38512 8.74522 9.19141 8.74522C9.15756 8.74522 8.88509 8.76328 8.85126 8.76328M12.7707 3.89984H11.104L11.101 12.993C11.0641 14.0105 10.2215 14.8288 9.19135 14.8288C8.55172 14.8288 7.98897 14.5132 7.63842 14.0351" stroke="#84D187" strokeWidth="1.0725" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="https://x.com/thebargainb"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 md:w-8 md:h-8 bg-[#F4FBF4] dark:bg-[#323232] hover:bg-muted rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
                <path d="M0.831707 0.846462C0.760028 0.749098 0.829547 0.611591 0.950451 0.611591H4.66153C4.70816 0.611591 4.75205 0.633648 4.77987 0.671071L8.39682 5.53631C8.45229 5.61093 8.56213 5.61621 8.6245 5.54726L13.1497 0.545113C13.1783 0.513551 13.2191 0.495865 13.2616 0.496604L13.9879 0.50922C14.114 0.51141 14.1794 0.660553 14.0955 0.754713L9.1395 6.31998C9.09299 6.3722 9.08956 6.44991 9.13129 6.50603L14.2682 13.4146C14.3405 13.5118 14.2711 13.65 14.1498 13.65H10.4415C10.3952 13.65 10.3516 13.6282 10.3237 13.5912L6.91902 9.06952C6.86318 8.99536 6.75352 8.99063 6.69151 9.05971L2.51019 13.7172C2.48222 13.7484 2.44233 13.7661 2.40047 13.7661H1.69725C1.57012 13.7661 1.50258 13.616 1.58691 13.5209L6.19265 8.32509C6.23878 8.27306 6.24228 8.19587 6.20106 8.13987L0.831707 0.846462ZM4.39545 1.41957C4.36762 1.38218 4.32376 1.36015 4.27716 1.36015H2.49246C2.37106 1.36015 2.30167 1.49866 2.37436 1.59589L10.7679 12.8229C10.7958 12.8601 10.8395 12.8821 10.886 12.8821H12.633C12.7542 12.8821 12.8236 12.7439 12.7512 12.6466L4.39545 1.41957Z" fill="#84D187" stroke="#84D187" strokeWidth="0.294905"/>
              </svg>
            </a>
          </div>

          {/* Product Hunt Badge */}
          <div className="flex justify-center">
            <ProductHuntBadge />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
} 