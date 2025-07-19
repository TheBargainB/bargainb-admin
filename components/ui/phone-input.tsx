"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

type LanguageCode = 'nl' | 'en' | 'de' | 'fr' | 'it' | 'es' | 'ar';

const phoneInputTranslations: Record<LanguageCode, {
  placeholders: string[];
  floatingLabel: string;
  validMessage: string;
  helperText: string;
  errorMessage: string;
}> = {
  nl: {
    placeholders: [
      "Voer je telefoonnummer in...",
      "+31 612345678",
      "+1 5551234567",
      "+49 1751234567"
    ],
    floatingLabel: "Telefoonnummer",
    validMessage: "Geldig internationaal telefoonnummer",
    helperText: "Inclusief landcode, bijvoorbeeld +31 612345678",
    errorMessage: "Voer een geldig internationaal nummer in"
  },
  en: {
    placeholders: [
      "Enter your phone number...",
      "+31 612345678",
      "+1 5551234567",
      "+49 1751234567"
    ],
    floatingLabel: "Phone number",
    validMessage: "Valid mobile phone number",
    helperText: "Include country code, e.g. +31612345678",
    errorMessage: "Enter a valid international number"
  },
  de: {
    placeholders: [
      "Telefonnummer eingeben...",
      "+31 612345678",
      "+1 5551234567",
      "+49 1751234567"
    ],
    floatingLabel: "Telefonnummer",
    validMessage: "Gültige internationale Telefonnummer",
    helperText: "Mit Ländercode, z.B. +49 1751234567",
    errorMessage: "Gültige internationale Nummer eingeben"
  },
  fr: {
    placeholders: [
      "Entrez votre numéro de téléphone...",
      "+31 612345678",
      "+1 5551234567",
      "+33 123456789"
    ],
    floatingLabel: "Numéro de téléphone",
    validMessage: "Numéro de téléphone international valide",
    helperText: "Avec indicatif pays, ex. +33 123456789",
    errorMessage: "Entrez un numéro international valide"
  },
  it: {
    placeholders: [
      "Inserisci il tuo numero di telefono...",
      "+31 612345678",
      "+1 5551234567",
      "+39 3123456789"
    ],
    floatingLabel: "Numero di telefono",
    validMessage: "Numero di telefono internazionale valido",
    helperText: "Con prefisso paese, es. +39 3123456789",
    errorMessage: "Inserisci un numero internazionale valido"
  },
  es: {
    placeholders: [
      "Ingresa tu número de teléfono...",
      "+31 612345678",
      "+1 5551234567",
      "+34 123456789"
    ],
    floatingLabel: "Número de teléfono",
    validMessage: "Número de teléfono internacional válido",
    helperText: "Con código de país, ej. +34 123456789",
    errorMessage: "Ingresa un número internacional válido"
  },
  ar: {
    placeholders: [
      "أدخل رقم هاتفك...",
      "+31 612345678",
      "+1 5551234567",
      "+966 501234567"
    ],
    floatingLabel: "رقم الهاتف",
    validMessage: "رقم هاتف دولي صحيح",
    helperText: "مع رمز البلد، مثال: +966 501234567",
    errorMessage: "أدخل رقماً دولياً صحيحاً"
  }
};

export const BeautifulPhoneInput = ({
  value,
  onChange,
  onSubmit,
  className,
  disabled = false,
  language = 'en',
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  className?: string;
  disabled?: boolean;
  language?: LanguageCode;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = phoneInputTranslations[language] || phoneInputTranslations['en'];
  const placeholders = t.placeholders;

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  };

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  }, [placeholders.length]);

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Allow + at the beginning, numbers, spaces, hyphens, and parentheses
    newValue = newValue.replace(/[^+\d\s\-()]/g, '');
    
    // Ensure + is only at the beginning
    if (newValue.includes('+') && newValue.indexOf('+') > 0) {
      newValue = newValue.replace(/\+/g, '');
      newValue = '+' + newValue;
    }
    
    // Limit length to 20 characters
    newValue = newValue.slice(0, 20);
    
    onChange(newValue);
  };

  // International phone number validation
  const isValid = /^\+[1-9]\d{1,14}$/.test(value.replace(/[\s\-()]/g, '')) && value.length >= 8;

  return (
    <div className="w-full relative">
      {/* Beautiful Input Container */}
      <div
        className={cn(
          "w-full relative bg-white dark:bg-zinc-800 h-16 rounded-2xl overflow-hidden transition-all duration-300",
          "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]",
          "hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.06)]",
          isFocused && "ring-2 ring-primary ring-opacity-50 shadow-lg",
          isValid && "ring-2 ring-green-500 ring-opacity-50",
          className
        )}
      >
        {/* Main Input */}
        <input
          ref={inputRef}
          type="tel"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={cn(
            "w-full h-full bg-transparent border-none outline-none text-xl font-medium",
            "text-black dark:text-white px-6 py-4",
            "placeholder:text-transparent",
            disabled && "cursor-not-allowed opacity-50"
          )}
          maxLength={20}
          {...props}
        />

        {/* Animated Placeholder */}
        <div className="absolute inset-0 flex items-center pointer-events-none pl-6">
          <AnimatePresence mode="wait">
            {!value && !isFocused && (
              <motion.p
                initial={{ y: 5, opacity: 0 }}
                key={`current-placeholder-${currentPlaceholder}`}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.3, ease: "linear" }}
                className="text-neutral-500 dark:text-zinc-500 text-lg font-normal truncate w-full"
              >
                {placeholders[currentPlaceholder]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Label */}
        <AnimatePresence>
          {(isFocused || value) && (
            <motion.label
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-2 left-6 text-xs font-medium text-primary"
            >
              {t.floatingLabel}
            </motion.label>
          )}
        </AnimatePresence>

        {/* Validation Indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <AnimatePresence>
            {value.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isValid 
                    ? "bg-green-500 text-white" 
                    : value.length > 0 
                    ? "bg-orange-500 text-white" 
                    : "bg-gray-300"
                )}
              >
                {isValid ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">{value.length}</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-3 text-sm">
        <AnimatePresence mode="wait">
          {!isValid && value.length > 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-orange-600 dark:text-orange-400 flex items-center gap-2"
            >
              <span className="text-orange-500">⚠</span>
              {t.errorMessage}
            </motion.span>
          )}
          {isValid && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-green-600 dark:text-green-400 flex items-center gap-2"
            >
              <span className="text-green-500">✓</span>
              {t.validMessage}
            </motion.span>
          )}
          {!value && (
            <span className="text-muted-foreground">
              {t.helperText}
            </span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 