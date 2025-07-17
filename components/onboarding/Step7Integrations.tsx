import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Video, MessageSquare, Check, Lock, ArrowRight } from "lucide-react"

export type Step7IntegrationsProps = {
  selectedIntegrations: string[];
  setSelectedIntegrations: React.Dispatch<React.SetStateAction<string[]>>;
  loading: boolean;
  t: any;
  onNext: () => void;
  onBack: () => void;
};

const integrationOptions = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Chat with your AI assistant on WhatsApp",
    icon: MessageCircle,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    borderColor: "border-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    enabled: true,
    popular: true
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Get help through Telegram bot",
    icon: Send,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    enabled: false,
    popular: false
  },
  {
    id: "facetime",
    name: "FaceTime Messages",
    description: "AI assistance in iMessage",
    icon: Video,
    color: "bg-gray-500",
    hoverColor: "hover:bg-gray-600",
    borderColor: "border-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
    enabled: false,
    popular: false
  },
  {
    id: "facebook",
    name: "Facebook Messenger",
    description: "Connect via Facebook Messenger",
    icon: MessageSquare,
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    borderColor: "border-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    enabled: false,
    popular: false
  }
];

const Step7Integrations: React.FC<Step7IntegrationsProps> = (props) => {
  const { selectedIntegrations, setSelectedIntegrations, loading, t, onNext, onBack } = props;

  const handleIntegrationToggle = (integrationId: string) => {
    const integration = integrationOptions.find(i => i.id === integrationId);
    if (!integration?.enabled) return;

    setSelectedIntegrations(prev => {
      if (prev.includes(integrationId)) {
        return prev.filter(id => id !== integrationId);
      } else {
        return [...prev, integrationId];
      }
    });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-4xl mx-auto mt-4 shadow-2xl rounded-2xl border-0 bg-white/80 dark:bg-[#232B23]/80 backdrop-blur-md border border-white/20 dark:border-gray-700/30">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="text-center mb-1">
          <img src="/bb-icon.svg" alt="BargainB" className="w-6 h-6 mx-auto mb-2" />
        </div>
        <CardTitle className="text-lg sm:text-xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5] text-center mb-1" style={{ fontFamily: 'var(--font-paytone-one)' }}>
          {t.onboarding.step7.title}
        </CardTitle>
        <div className="text-xs sm:text-sm text-[#7A7A7A] dark:text-[#B7EACB] text-center leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
          {t.onboarding.step7.description}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        {/* Integration Options */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[#1F1F1F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-paytone-one)' }}>
            {t.onboarding.step7.availablePlatforms}
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {integrationOptions.map((integration) => {
              const isSelected = selectedIntegrations.includes(integration.id);
              const Icon = integration.icon;
              
              return (
                <button
                  key={integration.id}
                  onClick={() => handleIntegrationToggle(integration.id)}
                  disabled={!integration.enabled}
                  className={`relative p-3 rounded-xl border-2 transition-all duration-200 focus:outline-none text-left touch-manipulation backdrop-blur-sm ${
                    integration.enabled
                      ? isSelected
                        ? `${integration.borderColor} ${integration.bgColor} shadow-md hover:scale-[1.02]`
                        : `border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-[1.02]`
                      : 'border-gray-200/50 dark:border-gray-700/50 bg-gray-50/60 dark:bg-gray-900/60 opacity-60 cursor-not-allowed'
                  }`}
                  aria-label={`${integration.enabled ? (isSelected ? 'Deselect' : 'Select') : 'Disabled'} ${integration.name}`}
                >
                  {/* Popular Badge */}
                  {integration.popular && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5" style={{ fontFamily: 'var(--font-inter)' }}>
                        {t.onboarding.step7.popular}
                      </Badge>
                    </div>
                  )}

                  {/* Coming Soon Badge */}
                  {!integration.enabled && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-gray-500 text-white text-xs px-2 py-0.5" style={{ fontFamily: 'var(--font-inter)' }}>
                        {t.onboarding.step7.comingSoon}
                      </Badge>
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {integration.enabled && isSelected && (
                    <div className="absolute top-2 left-2 w-4 h-4 bg-[#00B207] rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}

                  {/* Lock Icon for Disabled */}
                  {!integration.enabled && (
                    <div className="absolute top-2 left-2 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`w-10 h-10 ${integration.enabled ? integration.color : 'bg-gray-400'} rounded-xl flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <span className={`text-sm font-semibold ${integration.enabled ? 'text-[#1F1F1F] dark:text-[#F5F5F5]' : 'text-gray-400'}`} style={{ fontFamily: 'var(--font-paytone-one)' }}>
                          {integration.name}
                        </span>
                      </div>
                      <div className={`text-xs ${integration.enabled ? 'text-[#7A7A7A] dark:text-[#B7EACB]' : 'text-gray-400'}`} style={{ fontFamily: 'var(--font-inter)' }}>
                        {integration.description}
                      </div>
                      {integration.enabled && isSelected && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium" style={{ fontFamily: 'var(--font-inter)' }}>
                          ✓ {t.onboarding.step7.selected}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selection Summary */}
        {selectedIntegrations.length > 0 && (
          <div className="bg-green-50/80 dark:bg-green-950/40 rounded-lg p-3 border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-[#1F1F1F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-inter)' }}>
                {t.onboarding.step7.selectedIntegrations} ({selectedIntegrations.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedIntegrations.map((integrationId) => {
                const integration = integrationOptions.find(i => i.id === integrationId);
                return (
                  <Badge
                    key={integrationId}
                    variant="secondary"
                    className="bg-[#00B207] text-white hover:bg-[#00A006] text-xs px-2 py-0.5"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    {integration?.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className="bg-blue-50/80 dark:bg-blue-950/40 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
          <div className="text-xs text-[#1F1F1F] dark:text-[#F5F5F5] space-y-1">
            <div className="font-medium" style={{ fontFamily: 'var(--font-paytone-one)' }}>{t.onboarding.step7.whatsappBenefits}</div>
            <ul className="text-xs text-[#7A7A7A] dark:text-[#B7EACB] space-y-0.5 ml-3" style={{ fontFamily: 'var(--font-inter)' }}>
              <li>{t.onboarding.step7.benefit1}</li>
              <li>{t.onboarding.step7.benefit2}</li>
              <li>{t.onboarding.step7.benefit3}</li>
              <li>{t.onboarding.step7.benefit4}</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] touch-manipulation bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
            style={{ fontFamily: 'var(--font-inter)' }}
            aria-label="Go back"
          >
            {t.onboarding.common.back}
          </Button>
          <Button
            onClick={handleNext}
            disabled={loading}
            className="w-full sm:flex-1 bg-gradient-to-r from-[#00B207] to-[#84D187] hover:from-[#00A006] hover:to-[#7BC682] text-white font-semibold h-11 sm:h-12 text-sm sm:text-base rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-1 touch-manipulation shadow-lg"
            style={{ fontFamily: 'var(--font-inter)' }}
            aria-label="Continue"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {selectedIntegrations.length > 0 ? t.onboarding.common.continue : t.onboarding.step7.skipForNow}
                {selectedIntegrations.length > 0 && ` (${selectedIntegrations.length} selected)`}
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-[#7A7A7A] dark:text-[#B7EACB]" style={{ fontFamily: 'var(--font-inter)' }}>
            {t.onboarding.step7.helpText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step7Integrations; 