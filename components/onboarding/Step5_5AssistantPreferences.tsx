import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, MessageSquare, Sparkles, User, Settings } from "lucide-react"
import Image from "next/image"

export type Step5_5AssistantPreferencesProps = {
  selectedResponseStyle: string;
  selectedCommunicationTone: string;
  customPreferences: string;
  setSelectedResponseStyle: React.Dispatch<React.SetStateAction<string>>;
  setSelectedCommunicationTone: React.Dispatch<React.SetStateAction<string>>;
  setCustomPreferences: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  t: any;
  onNext: () => void;
  onBack: () => void;
  currentLanguage?: string;
};

const Step5_5AssistantPreferences: React.FC<Step5_5AssistantPreferencesProps> = (props) => {
  const { 
    selectedResponseStyle, 
    selectedCommunicationTone, 
    customPreferences,
    setSelectedResponseStyle, 
    setSelectedCommunicationTone, 
    setCustomPreferences,
    loading, 
    t, 
    onNext, 
    onBack, 
    currentLanguage = 'en' 
  } = props;

  // Add null checks and fallbacks for translations
  const safeT = t || {};
  const onboardingT = safeT.onboarding || {};
  const step5_5T = onboardingT.step5_5 || {};
  const commonT = onboardingT.common || {};

  const responseStyleOptions = [
    { id: "concise", name: step5_5T.responseStyles?.concise || "Concise", icon: MessageSquare },
    { id: "detailed", name: step5_5T.responseStyles?.detailed || "Detailed", icon: Sparkles },
    { id: "friendly", name: step5_5T.responseStyles?.friendly || "Friendly", icon: User },
    { id: "professional", name: step5_5T.responseStyles?.professional || "Professional", icon: Settings },
    { id: "casual", name: step5_5T.responseStyles?.casual || "Casual", icon: MessageSquare },
    { id: "formal", name: step5_5T.responseStyles?.formal || "Formal", icon: Settings }
  ];

  const communicationToneOptions = [
    { id: "helpful", name: step5_5T.communicationTones?.helpful || "Helpful & Supportive", icon: User },
    { id: "direct", name: step5_5T.communicationTones?.direct || "Direct & Efficient", icon: MessageSquare },
    { id: "encouraging", name: step5_5T.communicationTones?.encouraging || "Encouraging & Motivational", icon: Sparkles },
    { id: "informative", name: step5_5T.communicationTones?.informative || "Informative & Educational", icon: Settings },
    { id: "friendly", name: step5_5T.communicationTones?.friendly || "Friendly & Warm", icon: User },
    { id: "professional", name: step5_5T.communicationTones?.professional || "Professional & Reliable", icon: Settings }
  ];

  const handleResponseStyleToggle = (styleId: string) => {
    setSelectedResponseStyle(styleId);
  };

  const handleCommunicationToneToggle = (toneId: string) => {
    setSelectedCommunicationTone(toneId);
  };

  const handleCustomPreferencesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomPreferences(e.target.value);
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="w-full max-w-sm sm:max-w-2xl mx-auto">
      <Card className="w-full shadow-2xl rounded-xl sm:rounded-2xl border-0 bg-white/80 dark:bg-[#232B23]/80 backdrop-blur-md border border-white/20 dark:border-gray-700/30 max-h-[85vh] sm:max-h-none overflow-hidden flex flex-col">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 flex-shrink-0">
          <div className="text-center mb-1 sm:mb-2">
            <Image src="/bb-icon.svg" alt="BargainB" width={20} height={20} className="mx-auto mb-1 sm:mb-2" />
          </div>
          <CardTitle className={`text-sm sm:text-lg md:text-xl text-[#1F1F1F] dark:text-[#F5F5F5] text-center mb-1 ${
            currentLanguage === 'ar' ? 'noto-sans-arabic-bold' : 'font-[family-name:var(--font-paytone-one)]'
          }`}>
            {step5_5T.title || "How should your assistant respond?"}
          </CardTitle>
          <div className={`text-xs sm:text-sm text-[#7A7A7A] dark:text-[#B7EACB] text-center leading-relaxed ${
            currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
          }`}>
            {step5_5T.description || "Now that we've gathered your store and food preferences, how would you like the assistant to respond to you?"}
          </div>
        </CardHeader>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 space-y-3 sm:space-y-4 min-h-0 max-h-[50vh] sm:max-h-none">
          
          {/* Response Style Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-3 h-3 sm:w-4 h-4 text-[#00B207]" />
              <span className={`text-xs sm:text-sm font-semibold text-[#1F1F1F] dark:text-[#F5F5F5] ${
                currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
              }`}>
                {step5_5T.responseStyle || "Response Style"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
              {responseStyleOptions.map((option) => {
                const isSelected = selectedResponseStyle === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleResponseStyleToggle(option.id)}
                    className={`relative p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#00B207] h-[60px] sm:h-[70px] touch-manipulation backdrop-blur-sm ${
                      isSelected
                        ? 'border-[#00B207] bg-green-50/80 dark:bg-green-950/40 shadow-lg'
                        : 'border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 hover:border-[#00B207]/50'
                    }`}
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                    aria-label={`${isSelected ? 'Deselect' : 'Select'} ${option.name}`}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-3 h-3 sm:w-4 sm:h-4 bg-[#00B207] rounded-full flex items-center justify-center">
                        <Check className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex flex-col items-center space-y-1 h-full justify-center">
                      <option.icon className="w-3 h-3 sm:w-4 sm:h-4 text-[#00B207]" />
                      <span className={`text-xs font-medium text-[#1F1F1F] dark:text-[#F5F5F5] text-center leading-tight ${
                        currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
                      }`}>
                        {option.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Communication Tone Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3 h-3 sm:w-4 h-4 text-[#00B207]" />
              <span className={`text-xs sm:text-sm font-semibold text-[#1F1F1F] dark:text-[#F5F5F5] ${
                currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
              }`}>
                {step5_5T.communicationTone || "Communication Tone"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
              {communicationToneOptions.map((option) => {
                const isSelected = selectedCommunicationTone === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleCommunicationToneToggle(option.id)}
                    className={`relative p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#00B207] h-[60px] sm:h-[70px] touch-manipulation backdrop-blur-sm ${
                      isSelected
                        ? 'border-[#00B207] bg-green-50/80 dark:bg-green-950/40 shadow-lg'
                        : 'border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 hover:border-[#00B207]/50'
                    }`}
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                    aria-label={`${isSelected ? 'Deselect' : 'Select'} ${option.name}`}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-3 h-3 sm:w-4 sm:h-4 bg-[#00B207] rounded-full flex items-center justify-center">
                        <Check className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex flex-col items-center space-y-1 h-full justify-center">
                      <option.icon className="w-3 h-3 sm:w-4 sm:h-4 text-[#00B207]" />
                      <span className={`text-xs font-medium text-[#1F1F1F] dark:text-[#F5F5F5] text-center leading-tight ${
                        currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
                      }`}>
                        {option.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Preferences Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-3 h-3 sm:w-4 h-4 text-[#00B207]" />
              <span className={`text-xs sm:text-sm font-semibold text-[#1F1F1F] dark:text-[#F5F5F5] ${
                currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
              }`}>
                How should your assistant communicate with you? *
              </span>
            </div>
            <div className="space-y-1">
              <Label htmlFor="customPreferences" className={`text-xs sm:text-sm text-[#1F1F1F] dark:text-[#F5F5F5] ${
                currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
              }`}>
                Tell us how you'd like your assistant to respond to you
              </Label>
              <Textarea
                id="customPreferences"
                value={customPreferences}
                onChange={handleCustomPreferencesChange}
                placeholder="e.g., I prefer when the assistant uses emojis, or I like detailed explanations with examples, or Keep responses short and to the point..."
                className={`min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm transition-all duration-300 focus:scale-[1.01] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/30 dark:border-gray-600/30 focus:border-[#00B207] focus:ring-[#00B207]/20 ${
                  currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
                }`}
                aria-describedby="custom-preferences-helper"
                required
              />
              <div className={`text-xs text-[#7A7A7A] dark:text-[#B7EACB] ${
                currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
              }`}>
                Share your specific preferences for how your assistant should respond to you
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          {(selectedResponseStyle || selectedCommunicationTone || customPreferences.trim()) && (
            <div className="bg-green-50/80 dark:bg-green-950/40 rounded-lg p-2 sm:p-3 border border-[#00B207]/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-[#00B207]" />
                <span className={`text-xs sm:text-sm font-medium text-[#1F1F1F] dark:text-[#F5F5F5] ${
                  currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
                }`}>
                  Your Assistant Preferences
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {selectedResponseStyle && (
                  <span className={`px-2 py-1 bg-[#00B207] text-white text-xs rounded-full shadow-sm flex items-center gap-1 ${
                    currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
                  }`}>
                    <MessageSquare className="w-2 h-2 sm:w-3 sm:h-3" />
                    {responseStyleOptions.find(opt => opt.id === selectedResponseStyle)?.name}
                  </span>
                )}
                {selectedCommunicationTone && (
                  <span className={`px-2 py-1 bg-blue-500 text-white text-xs rounded-full shadow-sm flex items-center gap-1 ${
                    currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
                  }`}>
                    <User className="w-2 h-2 sm:w-3 sm:h-3" />
                    {communicationToneOptions.find(opt => opt.id === selectedCommunicationTone)?.name}
                  </span>
                )}
              </div>
              
              {customPreferences.trim() && (
                <div className="mt-2 p-2 bg-white/60 dark:bg-gray-800/60 rounded border border-gray-200/50 dark:border-gray-600/50">
                  <div className={`text-xs font-medium text-[#1F1F1F] dark:text-[#F5F5F5] mb-1 ${
                    currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
                  }`}>
                    Your Communication Preferences:
                  </div>
                  <div className={`text-xs text-[#7A7A7A] dark:text-[#B7EACB] ${
                    currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
                  }`}>
                    {customPreferences}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Bottom Section - Always visible */}
        <CardContent className="p-3 sm:px-6 sm:pb-6 pt-2 space-y-2 flex-shrink-0 bg-white/90 dark:bg-[#232B23]/90 backdrop-blur-sm border-t border-gray-200/30 dark:border-gray-700/30">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className={`w-full sm:flex-1 h-9 sm:h-10 text-xs sm:text-sm transition-all duration-300 active:scale-95 touch-manipulation bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border-white/30 dark:border-gray-600/30 ${
                currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="Go back"
            >
              {commonT.back || "Back"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={loading || !customPreferences.trim()}
              className={`w-full sm:flex-1 h-9 sm:h-10 bg-gradient-to-r from-[#00B207] to-[#84D187] hover:from-[#00A006] hover:to-[#7BC682] text-white font-semibold text-xs sm:text-sm rounded-xl transition-all duration-300 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 touch-manipulation shadow-lg ${
                currentLanguage === 'ar' ? 'noto-sans-arabic-semibold' : 'font-[family-name:var(--font-inter)]'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="Continue"
            >
              {loading ? (
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {commonT.continue || "Continue"}
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className={`text-xs text-[#7A7A7A] dark:text-[#B7EACB] ${
              currentLanguage === 'ar' ? 'noto-sans-arabic-regular' : 'font-[family-name:var(--font-inter)]'
            }`}>
              {step5_5T.helpText || "You can adjust these preferences later in settings"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step5_5AssistantPreferences; 