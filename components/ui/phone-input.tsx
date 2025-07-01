"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const BeautifulPhoneInput = ({
  value,
  onChange,
  onSubmit,
  className,
  disabled = false,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  className?: string;
  disabled?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholders = [
    "Voer je mobiele nummer in...",
    "61234567 (8 cijfers)",
    "Start met 6, bijvoorbeeld 61234567",
    "Nederlandse mobiele nummer"
  ];

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
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 8);
    onChange(newValue);
  };

  const formatDisplayValue = (val: string) => {
    if (!val) return "";
    // Format as: 6 1234 567 or similar
    if (val.length <= 2) return val;
    if (val.length <= 6) return `${val.slice(0, 1)} ${val.slice(1)}`;
    return `${val.slice(0, 1)} ${val.slice(1, 5)} ${val.slice(5)}`;
  };

  const isValid = value.length === 8 && /^6[0-9]{7}$/.test(value);

  return (
    <div className="w-full relative">
      {/* Country Code Display */}
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 bg-gradient-to-b from-red-500 via-white to-blue-500 rounded-sm shadow-sm" />
          <span className="font-medium">Nederland</span>
          <span className="text-foreground font-semibold">+31</span>
        </div>
      </div>

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
            "text-black dark:text-white px-6 py-4 pl-16",
            "placeholder:text-transparent",
            disabled && "cursor-not-allowed opacity-50"
          )}
          maxLength={8}
          {...props}
        />

        {/* Prefix Display */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-primary">6</span>
          </div>
        </div>

        {/* Animated Placeholder */}
        <div className="absolute inset-0 flex items-center pointer-events-none pl-20">
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
              Mobiel nummer
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
              Voer 8 cijfers in die beginnen met 6
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
              Geldig Nederlands mobiel nummer
            </motion.span>
          )}
          {!value && (
            <span className="text-muted-foreground">
              Nederlandse mobiele nummers beginnen met 6 en hebben 8 cijfers
            </span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 