import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Globe, ArrowRight } from "lucide-react"
import Image from "next/image"

export type Step3CountryCityProps = {
  country: string;
  city: string;
  setCountry: React.Dispatch<React.SetStateAction<string>>;
  setCity: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  errors: { country?: string; city?: string };
  setErrors: React.Dispatch<React.SetStateAction<{ country?: string; city?: string }>>;
  t: any;
  onNext: () => void;
  onBack: () => void;
  currentLanguage?: string;
};

const countries = [
  // Primary supported countries
  { code: "NL", name: "Netherlands" },
  { code: "US", name: "United States" },
  { code: "DE", name: "Germany" },
  { code: "BE", name: "Belgium" },
  { code: "FR", name: "France" },
  { code: "CA", name: "Canada" },
  { code: "UK", name: "United Kingdom" },
  { code: "ES", name: "Spain" },
  { code: "EG", name: "Egypt" },
  { code: "QA", name: "Qatar" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "United Arab Emirates" },
];

const Step3CountryCity: React.FC<Step3CountryCityProps> = (props) => {
  const { country, city, setCountry, setCity, loading, errors, setErrors, t, onNext, onBack, currentLanguage = 'en' } = props;

  const handleNext = () => {
    const newErrors: { country?: string; city?: string } = {};
    
    if (!country.trim()) {
      newErrors.country = t.onboarding.step3.countryRequired;
    }
    
    if (!city.trim()) {
      newErrors.city = t.onboarding.step3.cityRequired;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onNext();
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
          {t.onboarding.step3.title}
        </CardTitle>
        <div className={`text-sm md:text-base text-[#7A7A7A] dark:text-[#B7EACB] text-center leading-relaxed min-h-[3rem] sm:min-h-[3.5rem] flex items-center justify-center ${
          currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
        }`}>
          {t.onboarding.step3.description}
        </div>
      </CardHeader>
      <CardContent className={`space-y-5 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8 ${
        currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
      }`}>
        {/* Country Field */}
        <div className="space-y-2">
          <Label htmlFor="country" className={`flex items-center gap-2 font-medium text-[#1F1F1F] dark:text-[#F5F5F5] text-sm ${
            currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
          }`}>
            <Globe className="w-4 h-4" />
            {t.onboarding.step3.country} *
          </Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className={`h-11 sm:h-12 text-base transition-all duration-300 focus:scale-[1.02] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/30 dark:border-gray-600/30 ${
              currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
            } ${errors.country ? 'border-red-500 ring-red-500/20' : 'focus:border-[#00B207] focus:ring-[#00B207]/20'}`}>
              <SelectValue placeholder={t.onboarding.step3.countryPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {countries.map((countryOption) => (
                <SelectItem key={countryOption.code} value={countryOption.code} className={`text-base ${
                  currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
                }`}>
                  {t.countries[countryOption.code.toLowerCase()] || countryOption.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <div className={`text-red-500 text-sm flex items-center gap-1 ${
              currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
            }`}>
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.country}
            </div>
          )}
          <div className={`text-xs text-[#7A7A7A] dark:text-[#B7EACB] ${
            currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
          }`}>
            {t.onboarding.step3.countryHelper}
          </div>
        </div>

        {/* City Field */}
        <div className="space-y-2">
          <Label htmlFor="city" className={`flex items-center gap-2 font-medium text-[#1F1F1F] dark:text-[#F5F5F5] text-sm ${
            currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
          }`}>
            <MapPin className="w-4 h-4" />
            {t.onboarding.step3.city} *
          </Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t.onboarding.step3.cityPlaceholder}
            className={`h-11 sm:h-12 text-base transition-all duration-300 focus:scale-[1.02] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/30 dark:border-gray-600/30 ${
              currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
            } ${errors.city ? 'border-red-500 ring-red-500/20' : 'focus:border-[#00B207] focus:ring-[#00B207]/20'}`}
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? "city-error" : undefined}
            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
          />
          {errors.city && (
            <div id="city-error" className={`text-red-500 text-sm flex items-center gap-1 ${
              currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
            }`}>
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.city}
            </div>
          )}
          <div className={`text-xs text-[#7A7A7A] dark:text-[#B7EACB] ${
            currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
          }`}>
            {t.onboarding.step3.cityHelper}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className={`w-full sm:flex-1 h-11 sm:h-12 text-base transition-all duration-300 hover:scale-[1.02] touch-manipulation bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border-white/30 dark:border-gray-600/30 ${
              currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
            }`}
            aria-label="Go back"
          >
            {t.onboarding.common.back}
          </Button>
          <Button
            onClick={handleNext}
            disabled={loading}
            className={`w-full sm:flex-1 h-11 sm:h-12 bg-gradient-to-r from-[#00B207] to-[#84D187] hover:from-[#00A006] hover:to-[#7BC682] text-white font-semibold text-base rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 touch-manipulation shadow-lg ${
              currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
            }`}
            aria-label="Continue"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {t.onboarding.common.continue}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step3CountryCity; 