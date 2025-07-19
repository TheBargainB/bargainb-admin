import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"
import { Input } from "@/components/ui/input"
import { User, Phone, Mail, ArrowRight, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

export type Step1UserInfoProps = {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  phone: string;
  email: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  errors: { name?: string; phone?: string; email?: string; otp?: string };
  setErrors: React.Dispatch<React.SetStateAction<{ name?: string; phone?: string; email?: string; otp?: string }>>;
  t: any;
  setStep: () => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentLanguage?: string;
};

const Step1UserInfo: React.FC<Step1UserInfoProps> = (props) => {
  const { name, setName, phone, email, setPhone, setEmail, loading, errors, setErrors, t, setStep, setLoading, currentLanguage = 'en' } = props;
  const [validatingPhone, setValidatingPhone] = React.useState(false);
  const [checkingExisting, setCheckingExisting] = React.useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);

  const validatePhoneNumber = async (phoneNumber: string): Promise<boolean> => {
    try {
      setValidatingPhone(true);
      const response = await fetch('/api/onboarding/validate-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });

      const data = await response.json();

      if (!data.success) {
        setErrors(prev => ({ ...prev, phone: t.phoneInvalid || "Invalid phone number" }));
        return false;
      }

      if (!data.data.exists) {
        setErrors(prev => ({ ...prev, phone: t.phoneNotOnWhatsApp || "This number is not registered on WhatsApp" }));
        return false;
      }

      // Update phone with formatted version
      setPhone(data.data.formatted);
      return true;

    } catch (error) {
      console.error('Error validating phone:', error);
      setErrors(prev => ({ ...prev, phone: t.phoneValidationError || "Could not validate phone number" }));
      return false;
    } finally {
      setValidatingPhone(false);
    }
  };

  const checkExistingUser = async (phoneNumber: string, emailAddress: string): Promise<boolean> => {
    try {
      setCheckingExisting(true);
      const response = await fetch('/api/onboarding/check-existing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, email: emailAddress })
      });

      const data = await response.json();

      if (!data.success) {
        setErrors(prev => ({ ...prev, phone: "Could not check existing users" }));
        return false;
      }

      if (data.data.phoneExists) {
        setErrors(prev => ({ ...prev, phone: t.phoneAlreadyRegistered || "This phone number is already registered" }));
        return false;
      }

      if (data.data.emailExists) {
        setErrors(prev => ({ ...prev, email: t.emailAlreadyRegistered || "This email address is already registered" }));
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error checking existing user:', error);
      setErrors(prev => ({ ...prev, phone: "Could not check existing users" }));
      return false;
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    console.log('handleNext called with:', { name, phone, email });
    
    // Basic validation before proceeding
    const newErrors: { name?: string; phone?: string; email?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = t.nameRequired || "Name is required";
    }
    
    if (!phone.trim()) {
      newErrors.phone = t.phoneRequired || "Phone number is required";
    }
    
    if (!email.trim()) {
      newErrors.email = t.emailRequired || "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t.emailInvalid || "Email is invalid";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // Validate phone number with WASender
    const isPhoneValid = await validatePhoneNumber(phone);
    if (!isPhoneValid) {
      setLoading(false);
      return;
    }

    // Check if user already exists in our database
    const isUserNew = await checkExistingUser(phone, email);
    if (!isUserNew) {
      setLoading(false);
      return;
    }
    
    // Clear errors and proceed to next step
    setErrors({});
    console.log('Calling setStep...');
    setStep();
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-lg mx-auto mt-4 sm:mt-8 shadow-2xl rounded-2xl sm:rounded-3xl border-0 bg-white/80 dark:bg-[#232B23]/80 backdrop-blur-md border border-white/20 dark:border-gray-700/30">
      <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6">
          <div className="text-center mb-3 sm:mb-4">
            <div className="flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Image src="/bb-icon.svg" alt="BargainB" width={48} height={48} className="w-12 h-12 sm:w-16 sm:h-16" />
            </div>
          </div>
        <CardTitle className={`text-xl sm:text-2xl md:text-3xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5] text-center mb-2 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem] flex items-center justify-center ${
          currentLanguage === 'ar' ? 'noto-sans-arabic-bold' : 'font-[family-name:var(--font-paytone-one)]'
        }`}>
          {t.welcome}
        </CardTitle>
        <div className={`text-sm md:text-base text-[#7A7A7A] dark:text-[#B7EACB] text-center leading-relaxed min-h-[3rem] sm:min-h-[3.5rem] flex items-center justify-center ${
          currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
        }`}>
          {t.start}
        </div>
      </CardHeader>
      <CardContent className={`space-y-5 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8 ${
        currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
      }`}>
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className={`flex items-center gap-2 font-medium text-[#1F1F1F] dark:text-[#F5F5F5] text-sm ${
            currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
          }`}>
            <User className="w-4 h-4" />
            {t.nameLabel || "Name *"}
          </Label>
          <Input
            id="name"
            value={name}
            onChange={handleNameChange}
            placeholder={t.namePlaceholder || "e.g. John Doe"}
            className={`h-11 sm:h-12 text-base transition-all duration-300 focus:scale-[1.02] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/30 dark:border-gray-600/30 ${
              currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
            } ${errors.name ? 'border-red-500 ring-red-500/20' : 'focus:border-[#00B207] focus:ring-[#00B207]/20'}`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
          />
          {errors.name && (
            <div id="name-error" className={`text-red-500 text-sm flex items-center gap-1 ${
              currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
            }`}>
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.name}
            </div>
          )}
          <div className={`text-xs text-[#7A7A7A] dark:text-[#B7EACB] ${
            currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
          }`}>
            {t.nameHelper || "Enter your full name."}
          </div>
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className={`flex items-center gap-2 font-medium text-[#1F1F1F] dark:text-[#F5F5F5] text-sm ${
            currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
          }`}>
            <Phone className="w-4 h-4" />
            {t.phoneLabel}
          </Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder={t.phonePlaceholders[0] || "Enter your phone number"}
              className={`h-11 sm:h-12 text-base transition-all duration-300 focus:scale-[1.02] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/30 dark:border-gray-600/30 ${
                currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
              } ${errors.phone ? 'border-red-500 ring-red-500/20' : 'focus:border-[#00B207] focus:ring-[#00B207]/20'}`}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
            {validatingPhone && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
          {errors.phone && (
            <div id="phone-error" className={`text-red-500 text-sm flex items-center gap-1 ${
              currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
            }`}>
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.phone}
            </div>
          )}
          <div className={`text-xs text-[#7A7A7A] dark:text-[#B7EACB] ${
            currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
          }`}>
            {t.phoneHelper}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className={`flex items-center gap-2 font-medium text-[#1F1F1F] dark:text-[#F5F5F5] text-sm ${
            currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
          }`}>
            <Mail className="w-4 h-4" />
            {t.emailLabel}
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder={t.emailPlaceholders[0] || "Enter your email address"}
            className={`h-11 sm:h-12 text-base transition-all duration-300 focus:scale-[1.02] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/30 dark:border-gray-600/30 ${
              currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
            } ${errors.email ? 'border-red-500 ring-red-500/20' : 'focus:border-[#00B207] focus:ring-[#00B207]/20'}`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
          />
          {errors.email && (
            <div id="email-error" className={`text-red-500 text-sm flex items-center gap-1 ${
              currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
            }`}>
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.email}
            </div>
          )}
          <div className={`text-xs text-[#7A7A7A] dark:text-[#B7EACB] ${
            currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
          }`}>
            {t.emailHelper}
          </div>
        </div>

        {/* Next Button */}
        <div className="pt-3 sm:pt-4">
          <Button
            onClick={handleNext}
            disabled={loading || validatingPhone || checkingExisting}
            className={`w-full h-12 sm:h-14 bg-gradient-to-r from-[#00B207] to-[#84D187] hover:from-[#00A006] hover:to-[#7BC682] text-white font-semibold text-base sm:text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 touch-manipulation shadow-lg ${
              currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
            }`}
            aria-label={t.next}
          >
            {(loading || validatingPhone || checkingExisting) ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className={`text-sm sm:text-base ${
                  currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : ''
                }`}>
                  {checkingExisting ? (t.checkingExistingUser || "Checking...") : (t.sending || "Loading...")}
                </span>
              </div>
            ) : (
              <>
                {t.next}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default Step1UserInfo 