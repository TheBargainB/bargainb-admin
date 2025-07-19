"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { BargainBLogo } from '@/components/bargainb-logo'
import Footer from '@/components/footer'
import { LanguageToggle } from '@/components/language-toggle'
import { ThemeToggle } from '@/components/theme-toggle'
import { OrbitingCircles } from '@/components/ui/orbiting-circles'
import bgEffect from '@/public/background-effect.svg'
import { useTheme } from 'next-themes'
import {
  Step1UserInfo,
  Step3CountryCity,
  Step4GroceryStores,
  Step5DietaryAllergies,
  Step6GroceryLists,
  Step7Integrations,
  Step8Completion,
  onboardingTranslations
} from '@/components/onboarding'

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
          <div className="opacity-30">
            <Image src={beeImage} alt="" width={48} height={48} />
          </div>
        </OrbitingCircles>
        <OrbitingCircles radius={120} duration={20} reverse={true} path={false} iconSize={42}>
          <div className="opacity-25">
            <Image src={beeImage} alt="" width={42} height={42} />
          </div>
        </OrbitingCircles>
        <OrbitingCircles radius={320} duration={35} reverse={false} path={false} iconSize={36}>
          <div className="opacity-20">
            <Image src={beeImage} alt="" width={36} height={36} />
          </div>
        </OrbitingCircles>
      </div>

      {/* Additional scattered bees with different orbits */}
      <div className="absolute top-[20%] right-[15%] w-[300px] h-[300px]">
        <OrbitingCircles radius={80} duration={18} reverse={true} path={false} iconSize={30}>
          <div className="opacity-15">
            <Image src={beeImage} alt="" width={30} height={30} />
          </div>
        </OrbitingCircles>
      </div>

      <div className="absolute bottom-[25%] left-[10%] w-[200px] h-[200px]">
        <OrbitingCircles radius={60} duration={22} reverse={false} path={false} iconSize={36}>
          <div className="opacity-20">
            <Image src={beeImage} alt="" width={36} height={36} />
          </div>
        </OrbitingCircles>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Step 1: User Info
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  
  // Step 3: Location
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  
  // Step 4: Grocery Stores
  const [selectedStores, setSelectedStores] = useState<Array<{id: string; name: string; url: string}>>([])
  
  // Step 5: Dietary & Allergies
  const [selectedDietary, setSelectedDietary] = useState<string[]>([])
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  
  // Step 6: Grocery Lists
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  
  // Step 7: Integrations
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([])
  
  // Modal state for grocery stores
  const [isGroceryStoresModalOpen, setIsGroceryStoresModalOpen] = useState(false)
  
  const [errors, setErrors] = useState<any>({})
  const [currentLanguage, setCurrentLanguage] = useState("nl")
  const t = onboardingTranslations[currentLanguage as keyof typeof onboardingTranslations]

  useEffect(() => {
    setMounted(true)
    
    // Restore saved progress on page load
    const savedProgress = localStorage.getItem('onboarding_progress')
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        
        // Restore all form data
        setName(progress.name || "")
        setPhone(progress.phone || "")
        setEmail(progress.email || "")
        setCountry(progress.country || "")
        setCity(progress.city || "")
        setSelectedStores(progress.selectedStores || [])
        setSelectedDietary(progress.selectedDietary || [])
        setSelectedAllergies(progress.selectedAllergies || [])
        setSelectedItems(progress.selectedItems || [])
        setSelectedIntegrations(progress.selectedIntegrations || [])
        setCurrentStep(progress.currentStep || 1)
      } catch (error) {
        console.error('Error restoring progress:', error)
      }
    }
  }, [])

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language)
      // Clear errors when language changes to prevent stale error messages
      setErrors({})
    }
    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener)
    }
  }, [])

  if (!mounted) {
    return null
  }

  // Save progress to localStorage
  const saveProgress = () => {
    const progress = {
      currentStep,
      name,
      phone,
      email,
      country,
      city,
      selectedStores,
      selectedDietary,
      selectedAllergies,
      selectedItems,
      selectedIntegrations
    }
    localStorage.setItem('onboarding_progress', JSON.stringify(progress))
  }

  // Clear progress when onboarding is complete
  const clearProgress = () => {
    localStorage.removeItem('onboarding_progress')
  }

  const handleNext = () => {
    saveProgress()
    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleOpenGroceryStoresModal = () => {
    setIsGroceryStoresModalOpen(true)
  }

  const handleCloseGroceryStoresModal = () => {
    setIsGroceryStoresModalOpen(false)
  }

  const handleGroceryStoresNext = () => {
    setIsGroceryStoresModalOpen(false)
    handleNext()
  }

  // User creation moved to before final completion step
  const handleCreateUser = async () => {
    try {
      setLoading(true)

      // Create user in database
      const response = await fetch('/api/onboarding/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          country,
          city,
          selectedStores: selectedStores.map(store => store.name), // Send store names for backend compatibility
          selectedDietary,
          selectedAllergies,
          selectedItems,
          selectedIntegrations,
          preferredLanguage: currentLanguage
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create user')
      }

      // Store user data for completion screen
      localStorage.setItem('userData', JSON.stringify({
        name,
        phone,
        email,
        country,
        city,
        selectedStores,
        selectedIntegrations,
        language: currentLanguage
      }))

      // Move to completion step
      setCurrentStep(6)

    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to complete setup', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    // Clear onboarding progress
    clearProgress()

    // Show success message
    toast.success('Welcome to BargainB!', {
      description: "You'll receive a WhatsApp message shortly to start using your AI assistant."
    })

    // No redirect - users stay on completion screen
    // Only admin users should access /admin panel through proper authentication
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effect */}
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

      {/* Header with Logo and Controls */}
      <header className="relative z-20 w-full px-3 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <BargainBLogo className="h-6 sm:h-8 w-auto" />
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-3 sm:p-4">
        {/* Progress Indicator */}
        <div className="mb-6 sm:mb-8 w-full max-w-sm sm:max-w-2xl px-2">
          <div className="flex items-center justify-center mb-2">
            <span className="text-xs sm:text-sm text-[#7A7A7A] dark:text-[#B7EACB]">
              Step {currentStep} of 6
            </span>
          </div>
          <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-1.5 sm:h-2 backdrop-blur-sm">
            <div 
              className="bg-gradient-to-r from-[#00B207] to-[#84D187] h-1.5 sm:h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: User Info */}
        {currentStep === 1 && (
          <Step1UserInfo
            name={name}
            setName={setName}
            phone={phone}
            email={email}
            setPhone={setPhone}
            setEmail={setEmail}
            loading={loading}
            errors={errors}
            setErrors={setErrors}
            t={t}
            setStep={handleNext}
            setLoading={setLoading}
          />
        )}

        {/* Step 2: Country & City */}
        {currentStep === 2 && (
          <Step3CountryCity
            country={country}
            city={city}
            setCountry={setCountry}
            setCity={setCity}
            loading={loading}
            errors={errors}
            setErrors={setErrors}
            t={t}
            onNext={handleOpenGroceryStoresModal}
            onBack={handleBack}
          />
        )}

        {/* Grocery Stores Modal - overlays on city step */}
        <Step4GroceryStores
          selectedStores={selectedStores}
          setSelectedStores={setSelectedStores}
          loading={loading}
          t={t}
          onNext={handleGroceryStoresNext}
          onBack={handleBack}
          isOpen={isGroceryStoresModalOpen}
          onClose={handleCloseGroceryStoresModal}
          country={country}
        />

        {/* Step 3: Dietary & Allergies */}
        {currentStep === 3 && (
          <Step5DietaryAllergies
            selectedDietary={selectedDietary}
            selectedAllergies={selectedAllergies}
            setSelectedDietary={setSelectedDietary}
            setSelectedAllergies={setSelectedAllergies}
            loading={loading}
            t={t}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {/* Step 4: Grocery Lists */}
        {currentStep === 4 && (
          <Step6GroceryLists
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            loading={loading}
            t={t}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {/* Step 5: Integrations */}
        {currentStep === 5 && (
          <Step7Integrations
            selectedIntegrations={selectedIntegrations}
            setSelectedIntegrations={setSelectedIntegrations}
            loading={loading}
            t={t}
            onNext={handleCreateUser}
            onBack={handleBack}
          />
        )}

        {/* Step 6: Completion */}
        {currentStep === 6 && (
          <Step8Completion
            loading={loading}
            t={t}
            onComplete={handleComplete}
            userData={{
              name,
              phone,
              selectedStores: selectedStores.map(store => store.name),
              selectedIntegrations
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
} 