'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { BargainBLogo } from '@/components/bargainb-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { getTranslation, type LanguageCode } from '@/lib/translations'

// Enhanced Background Lines with Mobile Optimization
const BeeBackgroundLines = ({
  className,
  svgOptions,
}: {
  className?: string;
  svgOptions?: {
    duration?: number;
  };
}) => {
  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full overflow-hidden",
        className
      )}
    >
      <SVGBackground svgOptions={svgOptions} />
    </div>
  );
};

const pathVariants = {
  initial: { strokeDashoffset: 1000, strokeDasharray: "30 1000" },
  animate: {
    strokeDashoffset: 0,
    strokeDasharray: "15 1000",
    opacity: [0, 0.4, 0.6, 0.3, 0],
  },
};

const SVGBackground = ({
  svgOptions,
}: {
  svgOptions?: {
    duration?: number;
  };
}) => {
  // Mobile-optimized elegant curved paths
  const beePaths = [
    "M-150 150 Q 200 120 400 160 Q 600 140 800 180 Q 1000 160 1200 200",
    "M-120 280 Q 250 240 450 290 Q 650 250 850 300 Q 1050 280 1250 320",
    "M-140 400 Q 220 370 420 410 Q 620 380 820 420 Q 1020 400 1220 440",
    "M-160 520 Q 180 490 380 530 Q 580 500 780 540 Q 980 520 1180 560",
    "M-100 640 Q 240 600 440 650 Q 640 620 840 660 Q 1040 640 1240 680",
    "M-130 80 Q 210 50 410 90 Q 610 70 810 110 Q 1010 90 1210 130",
    "M-170 350 Q 190 320 390 360 Q 590 340 790 380 Q 990 360 1190 400",
    "M-110 580 Q 230 550 430 590 Q 630 570 830 610 Q 1030 590 1230 630",
  ];

  // Responsive color palette
  const colors = [
    "rgba(var(--primary-rgb), 0.25)",
    "rgba(var(--primary-rgb), 0.15)", 
    "rgba(var(--primary-rgb), 0.3)",
    "rgba(var(--primary-rgb), 0.2)",
    "rgba(var(--primary-rgb), 0.25)",
    "rgba(var(--primary-rgb), 0.12)",
    "rgba(var(--primary-rgb), 0.22)",
    "rgba(var(--primary-rgb), 0.18)",
  ];

  return (
    <motion.svg
      viewBox="0 0 1200 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Primary flowing paths */}
      {beePaths.map((path, idx) => (
        <motion.path
          key={`bee-path-${idx}`}
          d={path}
          stroke={colors[idx % colors.length]}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          variants={pathVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: svgOptions?.duration || 14,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
            delay: idx * 1.8,
            repeatDelay: 4,
          }}
        />
      ))}
      
      {/* Secondary mobile-friendly paths */}
      {beePaths.slice(0, 4).map((path, idx) => (
        <motion.path
          key={`bee-path-secondary-${idx}`}
          d={path}
          stroke={colors[(idx + 4) % colors.length]}
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          variants={pathVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: svgOptions?.duration || 18,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
            delay: (idx * 3) + 7,
            repeatDelay: 5,
          }}
        />
      ))}
    </motion.svg>
  );
};

// Mobile-Responsive Flying Bee Component
const ElegantFlyingBee = ({ 
  pathIndex,
  delay,
  size = 'medium',
  duration = 20
}: { 
  pathIndex: number
  delay: number
  size?: 'small' | 'medium' | 'large'
  duration?: number
}) => {
  const sizeClasses = {
    small: 'w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8',
    medium: 'w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12',
    large: 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14'
  }

  const sizeValues = {
    small: { width: 24, height: 24 },
    medium: { width: 32, height: 32 },
    large: { width: 40, height: 40 }
  }

  // Mobile-optimized Y positions
  const yPositions = [150, 280, 400, 520, 640, 80, 350, 580]
  const yPos = yPositions[pathIndex % yPositions.length]

  return (
    <motion.div
      className={`absolute pointer-events-none z-10 ${sizeClasses[size]}`}
      initial={{ 
        x: -80, 
        y: yPos,
        rotate: 0,
        scale: 0.7,
        opacity: 0
      }}
      animate={{ 
        x: [
          -80, 
          200, 
          400, 
          600, 
          800, 
          1000, 
          1200
        ],
        y: [
          yPos,
          yPos - 30 + Math.sin(pathIndex) * 20,
          yPos + 20 + Math.cos(pathIndex) * 15,
          yPos - 15 + Math.sin(pathIndex + 1) * 18,
          yPos + 30 + Math.cos(pathIndex + 2) * 22,
          yPos - 20 + Math.sin(pathIndex + 3) * 16,
          yPos
        ],
        rotate: [0, 8, -12, 15, -8, 12, 0],
        scale: [0.7, 1.0, 0.8, 1.1, 0.75, 0.95, 0.7],
        opacity: [0, 0.7, 0.9, 0.8, 0.9, 0.6, 0]
      }}
      transition={{
        duration: duration,
        ease: "easeInOut",
        repeat: Infinity,
        delay: delay,
        repeatDelay: Math.random() * 4 + 2
      }}
      style={{
        filter: 'drop-shadow(0 1px 4px rgba(0, 178, 7, 0.2))',
      }}
    >
      {/* Light mode bee */}
      <Image
        src="/bee.png"
        alt="Flying bee"
        width={sizeValues[size].width}
        height={sizeValues[size].height}
        className="w-full h-full object-contain dark:hidden"
        style={{
          animation: 'gentleBuzz 0.5s ease-in-out infinite alternate'
        }}
      />
      {/* Dark mode bee */}
      <Image
        src="/bee-dark.png"
        alt="Flying bee dark"
        width={sizeValues[size].width}
        height={sizeValues[size].height}
        className="w-full h-full object-contain hidden dark:block"
        style={{
          filter: 'drop-shadow(0 1px 4px rgba(154, 137, 255, 0.25))',
          animation: 'gentleBuzz 0.5s ease-in-out infinite alternate'
        }}
      />
    </motion.div>
  )
}

export default function EarlyAccessPage() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('nl')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedPhoneNumber, setSubmittedPhoneNumber] = useState('')
  const [earlyAccessCount, setEarlyAccessCount] = useState(127)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Get current translations
  const t = getTranslation(currentLanguage)

  // Dynamic form validation schema for Dutch mobile numbers (+31 6XXXXXXXX)
  const earlyAccessSchema = z.object({
    phoneNumber: z.string()
      .length(9, t.validation.phoneLength)
      .regex(/^6[0-9]{8}$/, t.validation.phoneFormat)
      .regex(/^[0-9]+$/, t.validation.phoneNumbers)
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof earlyAccessSchema>>({
    resolver: zodResolver(earlyAccessSchema)
  })

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Language change listener
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language as LanguageCode)
    }
    
    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener)
  }, [])

  // Fetch early access count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/early-access')
        const data = await response.json()
        if (data.success) {
          setEarlyAccessCount(data.count + 120)
        }
      } catch (error) {
        console.log('Failed to fetch early access count')
      }
    }
    fetchCount()
  }, [])

  const onSubmit = async (data: z.infer<typeof earlyAccessSchema>) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: `+31${data.phoneNumber}` })
      })

      const result = await response.json()

      if (result.success) {
        setSubmittedPhoneNumber(`+31${data.phoneNumber}`)
        setEarlyAccessCount(prev => prev + 1)
        toast.success(t.toast.success.title, {
          description: t.toast.success.description,
          duration: 5000,
        })
        reset()
      } else {
        if (result.message?.includes('al op de early access lijst')) {
          toast.info(t.toast.exists.title, {
            description: t.toast.exists.description,
            duration: 4000,
          })
        } else {
          throw new Error(result.message || 'Er ging iets mis')
        }
      }
    } catch (error) {
      toast.error(t.toast.error.title, {
        description: error instanceof Error ? error.message : t.toast.error.description,
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Enhanced CSS for mobile-responsive animations */}
      <style jsx global>{`
        :root {
          --primary-rgb: 0, 178, 7;
        }
        
        .dark {
          --primary-rgb: 154, 137, 255;
        }
        
        @keyframes gentleBuzz {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.05) rotate(1deg); }
        }
        
        @keyframes floatGlow {
          0%, 100% { 
            transform: translateY(0px) scale(1);
            opacity: 0.5;
          }
          50% { 
            transform: translateY(-8px) scale(1.03);
            opacity: 0.7;
          }
        }

        @media (max-width: 768px) {
          @keyframes gentleBuzz {
            0% { transform: scale(1) rotate(0deg); }
            100% { transform: scale(1.02) rotate(0.5deg); }
          }
          
          @keyframes floatGlow {
            0%, 100% { 
              transform: translateY(0px) scale(1);
              opacity: 0.3;
            }
            50% { 
              transform: translateY(-4px) scale(1.02);
              opacity: 0.5;
            }
          }
        }
      `}</style>

      <div className="min-h-screen bg-custom-gradient dark:bg-dark-green-gradient relative overflow-hidden">
        {/* Mobile-Optimized Animated Background Lines */}
        <BeeBackgroundLines svgOptions={{ duration: isMobile ? 16 : 14 }} />
        
        {/* Responsive Flying Bees */}
        <ElegantFlyingBee pathIndex={0} delay={0} size="large" duration={isMobile ? 25 : 22} />
        <ElegantFlyingBee pathIndex={1} delay={3} size="medium" duration={isMobile ? 28 : 25} />
        <ElegantFlyingBee pathIndex={2} delay={7} size="small" duration={isMobile ? 23 : 20} />
        <ElegantFlyingBee pathIndex={3} delay={12} size="medium" duration={isMobile ? 31 : 28} />
        <ElegantFlyingBee pathIndex={4} delay={6} size="large" duration={isMobile ? 27 : 24} />
        <ElegantFlyingBee pathIndex={5} delay={15} size="small" duration={isMobile ? 24 : 21} />
        {!isMobile && (
          <>
            <ElegantFlyingBee pathIndex={6} delay={9} size="medium" duration={26} />
            <ElegantFlyingBee pathIndex={7} delay={18} size="large" duration={23} />
          </>
        )}

        {/* Mobile-Responsive Header */}
        <div className="absolute top-3 right-3 md:top-6 md:right-6 z-50 flex items-center gap-2 md:gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <div className="absolute top-3 left-3 md:top-6 md:left-6 z-50">
          <BargainBLogo className="h-6 w-auto sm:h-8 md:h-10" />
        </div>

        {/* Mobile-First Main Content */}
        <div className="relative z-20 container mx-auto px-3 py-6 sm:px-4 md:px-6 lg:px-8 md:py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-16 xl:gap-24 items-center min-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-8rem)]">
            
            {/* Mobile-Optimized Phone Mockup */}
            <motion.div 
              className="relative flex justify-center lg:justify-start order-2 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div className="relative">
                {/* Responsive Phone Container */}
                <div className="relative w-[280px] h-[560px] sm:w-[320px] sm:h-[640px] md:w-[380px] md:h-[760px] lg:w-[420px] lg:h-[840px] xl:w-[480px] xl:h-[960px]">
                  <Image
                    src="/iPhone-13-Pro-Front.png"
                    alt="iPhone 13 Pro with BargainB WhatsApp Demo"
                    width={480}
                    height={960}
                    className="w-full h-full object-contain drop-shadow-xl md:drop-shadow-2xl"
                    priority
                  />
                </div>

                {/* Responsive Floating Elements */}
                <div 
                  className="absolute -top-3 -right-3 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-primary/20 rounded-full blur-lg md:blur-xl"
                  style={{ animation: 'floatGlow 4s ease-in-out infinite' }}
                ></div>
                <div 
                  className="absolute -bottom-6 -left-4 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary/15 rounded-full blur-xl md:blur-2xl"
                  style={{ animation: 'floatGlow 5s ease-in-out infinite', animationDelay: '1s' }}
                ></div>
                <div 
                  className="absolute top-1/3 -right-2 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-primary/10 rounded-full blur-md md:blur-lg"
                  style={{ animation: 'floatGlow 3s ease-in-out infinite', animationDelay: '2s' }}
                ></div>
              </div>
            </motion.div>

            {/* Mobile-First Content */}
            <motion.div 
              className="space-y-6 md:space-y-8 order-1 lg:order-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              {/* Mobile-Responsive Hero Section */}
              <div className="text-center lg:text-left space-y-4 md:space-y-6">
                <motion.div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-primary/10 border border-primary/20 rounded-full text-xs md:text-sm font-medium text-primary"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full animate-pulse"></span>
                  {earlyAccessCount} {t.hero.peopleWaiting}
                </motion.div>
                
                <motion.h1 
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-foreground leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                    {t.hero.earlyAccess}
                  </span>
                  <br />
                  <span className="text-foreground">{t.hero.bargainB}</span>
                </motion.h1>
                
                <motion.p 
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  {t.hero.description.split('eerste toegang').map((part, index) => (
                    index === 0 ? (
                      <span key={index}>
                        {part}<span className="font-semibold text-primary">{t.hero.firstAccess}</span>
                      </span>
                    ) : (
                      <span key={index}>
                        {part} <span className="text-foreground font-medium">{t.hero.exclusiveWhatsApp}</span>
                      </span>
                    )
                  ))}
                </motion.p>
              </div>

              {/* Mobile-Responsive Form */}
              <motion.div 
                className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl md:shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground block">
                      {t.form.phoneLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                        <span className="text-base md:text-lg">🇳🇱</span>
                        <span className="text-sm font-medium">+31</span>
                      </div>
                      <input
                        {...register('phoneNumber')}
                        type="tel"
                        placeholder={t.form.phonePlaceholder}
                        className="w-full pl-16 md:pl-20 pr-3 md:pr-4 py-3 md:py-4 bg-background border border-border rounded-xl md:rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-base md:text-lg"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-destructive text-sm font-medium">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold py-3 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base md:text-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2 md:gap-3">
                        <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        {t.form.submitting}
                      </div>
                    ) : (
                      t.form.submitButton
                    )}
                  </motion.button>
                </form>

                {submittedPhoneNumber && (
                  <motion.div 
                    className="mt-4 md:mt-6 p-3 md:p-4 bg-primary/10 border border-primary/20 rounded-xl md:rounded-2xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-primary font-medium text-center text-sm md:text-base">
                      {t.form.successMessage} {submittedPhoneNumber}
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Mobile-Responsive Social Proof */}
              <motion.div 
                className="flex items-center justify-center lg:justify-start gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                <div className="flex -space-x-1 md:-space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="font-medium">{t.socialProof.joinText} {earlyAccessCount}+ {t.socialProof.earlyAdopters}</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Mobile-Responsive FAQ Section */}
          <motion.div 
            className="mt-16 md:mt-20 lg:mt-32 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center text-foreground mb-8 md:mb-12">
              {t.faq.title}
            </h2>
            
            <div className="space-y-3 md:space-y-4">
              {Object.values(t.faq.questions).map((faq, index) => (
                <motion.div 
                  key={index} 
                  className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl md:rounded-2xl overflow-hidden shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.5 + (index * 0.1) }}
                >
                  <button
                    className="w-full px-4 py-4 sm:px-6 sm:py-6 text-left flex items-center justify-between hover:bg-muted/20 transition-colors duration-200"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <h3 className="font-bold text-base md:text-lg text-foreground pr-3 md:pr-4">{faq.question}</h3>
                    <div className="flex-shrink-0">
                      {openFaq === index ? (
                        <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  
                  {openFaq === index && (
                    <motion.div 
                      className="px-4 pb-4 sm:px-6 sm:pb-6 border-t border-border/30"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-muted-foreground leading-relaxed pt-3 md:pt-4 text-sm md:text-base">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mobile-Responsive Final CTA */}
          <motion.div 
            className="mt-16 md:mt-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            <p className="text-base md:text-lg text-muted-foreground mb-3 md:mb-4">
              {t.finalCta.question}
            </p>
            <motion.button
              onClick={() => (document.querySelector('input[type="tel"]') as HTMLInputElement)?.focus()}
              className="inline-flex items-center gap-2 px-6 py-2.5 md:px-8 md:py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full text-primary font-semibold transition-all duration-200 text-sm md:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>👆</span>
              {t.finalCta.action}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </>
  )
} 