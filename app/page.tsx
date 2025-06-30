"use client"

import type React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { BargainBLogoMassive } from "@/components/bargainb-logo"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { CheckCircle, Loader2, Twitter, Instagram, Facebook, Linkedin } from "lucide-react"
import { useTheme } from "next-themes"

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
    successDesc: "¡Ahora eres parte del equipo de lanzamiento exclusivo!",
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
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({ days: 42, hours: 18, minutes: 37, seconds: 23 })
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
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // Random fluctuations instead of actual countdown
        const fluctuation = () => Math.floor(Math.random() * 7) - 3 // -3 to +3

        let newDays = prev.days + (Math.random() < 0.1 ? fluctuation() : 0)
        let newHours = prev.hours + (Math.random() < 0.2 ? fluctuation() : -1)
        let newMinutes = prev.minutes + (Math.random() < 0.3 ? fluctuation() : -1)
        let newSeconds = prev.seconds + (Math.random() < 0.8 ? fluctuation() : -1)

        // Handle rollovers and keep numbers in realistic ranges
        if (newSeconds < 0) {
          newSeconds = 59
          newMinutes -= 1
        }
        if (newSeconds > 59) newSeconds = 0

        if (newMinutes < 0) {
          newMinutes = 59
          newHours -= 1
        }
        if (newMinutes > 59) newMinutes = 0

        if (newHours < 0) {
          newHours = 23
          newDays -= 1
        }
        if (newHours > 23) newHours = 0

        // Keep days in a reasonable range
        if (newDays < 20) newDays = 20 + Math.floor(Math.random() * 10)
        if (newDays > 60) newDays = 40 + Math.floor(Math.random() * 10)

        return {
          days: Math.max(0, newDays),
          hours: Math.max(0, newHours),
          minutes: Math.max(0, newMinutes),
          seconds: Math.max(0, newSeconds),
        }
      })

      // Random jump effects
      const units = ["days", "hours", "minutes", "seconds"]
      units.forEach((unit) => {
        if (Math.random() < 0.08) {
          setJumpEffect((prev) => ({ ...prev, [unit]: true }))
          setTimeout(() => {
            setJumpEffect((prev) => ({ ...prev, [unit]: false }))
          }, 400)
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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
      <div className="flex flex-col items-center space-y-1">
        <div
          className={`text-lg md:text-2xl lg:text-4xl xl:text-5xl font-black text-foreground tabular-nums transition-all duration-300 ${
            isJumping ? "animate-bounce" : ""
          }`}
          style={{
            color: "hsl(var(--primary))",
            textShadow: "0 0 20px hsla(var(--primary), 0.3)",
          }}
        >
          {value.toString().padStart(2, "0")}
        </div>
        <div className="min-h-[16px] md:min-h-[18px] lg:min-h-[20px] flex items-center justify-center">
          <div className="text-xs md:text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center">
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
            <BargainBLogoMassive className="mb-3 md:mb-4" />
            
            {/* Launching In - Right below logo */}
            <div className="min-h-[20px] md:min-h-[24px] mb-3 md:mb-4 flex items-center justify-center">
              <h3 className="text-xs md:text-sm lg:text-base font-semibold text-muted-foreground uppercase tracking-wide">
                {t.launchingIn}
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-3 md:gap-4 lg:gap-8 max-w-sm md:max-w-xl mx-auto mb-4 md:mb-6">
              <CountdownNumber value={timeLeft.days} label={t.days} unit="days" />
              <CountdownNumber value={timeLeft.hours} label={t.hours} unit="hours" />
              <CountdownNumber value={timeLeft.minutes} label={t.minutes} unit="minutes" />
              <CountdownNumber value={timeLeft.seconds} label={t.seconds} unit="seconds" />
            </div>
          </div>

          {/* Main Heading */}
          <div className="min-h-[80px] md:min-h-[100px] lg:min-h-[120px] flex flex-col justify-center mb-3 md:mb-4">
            <h2 className="text-xl md:text-2xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight px-4">
              {t.joinWaitlist}
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {t.launchWaitlist}
              </span>
            </h2>
          </div>

          {/* Subtitle */}
          <div className="min-h-[50px] md:min-h-[60px] flex items-center justify-center mb-3 md:mb-4">
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-xl lg:max-w-2xl mx-auto leading-relaxed px-4">
              {t.subtitle}
            </p>
          </div>

          {/* Success State */}
          <div className="min-h-[100px] md:min-h-[120px] flex items-center justify-center mb-3 md:mb-4">
            {isSuccess && (
              <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-lg max-w-sm md:max-w-lg mx-auto transform animate-pulse">
                <div className="flex items-center justify-center mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-foreground text-center mb-2">{t.youreIn}</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center">{t.notifyMessage}</p>
              </div>
            )}
          </div>

          {/* Email Form */}
          <div className="min-h-[70px] md:min-h-[80px] flex flex-col justify-center mb-4 md:mb-6">
            <div className="max-w-xs md:max-w-md mx-auto px-2 md:px-4">
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
                              className="h-9 md:h-10 lg:h-12 px-3 md:px-4 text-xs md:text-sm lg:text-base bg-background/80 backdrop-blur-sm border-2 border-border/50 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground w-full"
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
                    className="h-9 md:h-10 lg:h-12 px-4 md:px-6 text-xs md:text-sm lg:text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap w-full sm:w-auto md:min-w-[140px]"
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

          {/* User Avatars and Count */}
          <div className="min-h-[35px] md:min-h-[40px] flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6 px-4">
            <div className="flex -space-x-1 md:-space-x-2">
              {userAvatars.map((user, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 md:w-8 md:h-8 ${user.bg} rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-background`}
                >
                  {user.initials}
                </div>
              ))}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
                              <span className="font-bold text-foreground">{waitlistCount.toLocaleString()}+</span> {t.peopleWaitlist}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6">
            <a
              href="https://x.com/thebargainb"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 md:w-8 md:h-8 bg-muted/50 hover:bg-muted rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <Twitter className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
            </a>
            <a
              href="https://www.instagram.com/thebargainbhq/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 md:w-8 md:h-8 bg-muted/50 hover:bg-muted rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <Instagram className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
            </a>
            <a
              href="https://www.facebook.com/thebargainbapp"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 md:w-8 md:h-8 bg-muted/50 hover:bg-muted rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <Facebook className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
            </a>
            <a
              href="https://www.linkedin.com/company/bargainb/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 md:w-8 md:h-8 bg-muted/50 hover:bg-muted rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <Linkedin className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
            </a>
          </div>

          {/* Product Hunt Badge */}
          <div className="flex justify-center">
            <ProductHuntBadge />
          </div>
        </div>
      </div>
    </div>
  )
} 