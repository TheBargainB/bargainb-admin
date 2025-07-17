import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, MessageCircle, ArrowRight, Sparkles } from "lucide-react"
import Image from "next/image"

export type Step8CompletionProps = {
  loading: boolean;
  t: any;
  onComplete: () => void;
  userData: {
    name: string;
    phone: string;
    selectedStores: string[];
    selectedIntegrations: string[];
  };
};

const Step8Completion: React.FC<Step8CompletionProps> = (props) => {
  const { loading, t, onComplete, userData } = props;

  const handleCompleteSetup = async () => {
    try {
      // Complete the onboarding setup
      await onComplete();
      console.log('Onboarding completed successfully');
    } catch (error) {
      console.error('Error completing setup:', error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl rounded-xl border-0 bg-white/80 dark:bg-[#232B23]/80 backdrop-blur-md border border-white/20 dark:border-gray-700/30">
      <CardHeader className="pb-4 px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <Image
              src="/bb-icon.svg"
              alt="BargainB"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl md:text-3xl text-[#1F1F1F] dark:text-[#F5F5F5] m-0" style={{ fontFamily: 'var(--font-paytone)' }}>
            {t.onboarding.step8.title}
          </CardTitle>
        </div>
        <div className="text-base text-[#7A7A7A] dark:text-[#B7EACB] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
          {t.onboarding.step8.subtitle.replace('{name}', userData.name.split(' ')[0])}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 px-6 pb-8">
        {/* Completion Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50/80 dark:bg-green-950/40 rounded-xl p-4 border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-base font-semibold text-[#1F1F1F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-paytone)' }}>
                {t.onboarding.step8.setupComplete}
              </span>
            </div>
            
            <div className="space-y-2 text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-[#1F1F1F] dark:text-[#F5F5F5]">
                  {t.onboarding.step8.profileCreated}
                </span>
              </div>
              
              {userData.selectedStores.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-[#1F1F1F] dark:text-[#F5F5F5]">
                    {t.onboarding.step8.storesConfigured.replace('{count}', userData.selectedStores.length.toString())}
                  </span>
                </div>
              )}
              
              {userData.selectedIntegrations.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-[#1F1F1F] dark:text-[#F5F5F5]">
                    {t.onboarding.step8.integrationsSetup}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp Integration Notice */}
          {userData.selectedIntegrations.includes('whatsapp') && (
            <div className="bg-blue-50/80 dark:bg-blue-950/40 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-base font-semibold text-[#1F1F1F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-paytone)' }}>
                  {t.onboarding.step8.whatsappTitle}
                </span>
              </div>
              <p className="text-sm text-[#7A7A7A] dark:text-[#B7EACB] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                {t.onboarding.step8.whatsappMessage}
              </p>
            </div>
          )}
        </div>



        {/* Next Steps - Compact Horizontal */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-[#1F1F1F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-paytone)' }}>
            {t.onboarding.step8.nextSteps}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50/80 dark:bg-gray-800/40 rounded-lg">
              <div className="w-6 h-6 bg-[#00B207] rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">1</div>
              <div>
                <div className="text-sm font-medium text-[#1F1F1F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-paytone)' }}>{t.onboarding.step8.step1Title}</div>
                <div className="text-xs text-[#7A7A7A] dark:text-[#B7EACB] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>{t.onboarding.step8.step1Desc}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50/80 dark:bg-gray-800/40 rounded-lg">
              <div className="w-6 h-6 bg-[#00B207] rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">2</div>
              <div>
                <div className="text-sm font-medium text-[#1F1F1F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-paytone)' }}>{t.onboarding.step8.step2Title}</div>
                <div className="text-xs text-[#7A7A7A] dark:text-[#B7EACB] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>{t.onboarding.step8.step2Desc}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50/80 dark:bg-gray-800/40 rounded-lg">
              <div className="w-6 h-6 bg-[#00B207] rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">3</div>
              <div>
                <div className="text-sm font-medium text-[#1F1F1F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-paytone)' }}>{t.onboarding.step8.step3Title}</div>
                <div className="text-xs text-[#7A7A7A] dark:text-[#B7EACB] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>{t.onboarding.step8.step3Desc}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Setup & Start Chat Button */}
        <div className="pt-4">
          <Button
            onClick={handleCompleteSetup}
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-[#00B207] to-[#84D187] hover:from-[#00A006] hover:to-[#7BC682] text-white font-semibold text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg"
            style={{ fontFamily: 'var(--font-paytone)' }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Setting up your account...
              </>
            ) : (
              <>
                              <>
                {t.onboarding.step8.getStarted}
                <ArrowRight className="w-5 h-5" />
              </>
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-[#7A7A7A] dark:text-[#B7EACB]" style={{ fontFamily: 'var(--font-inter)' }}>
            {t.onboarding.step8.helpText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step8Completion; 