import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, AlertTriangle, ArrowRight, Check, Leaf, Wheat, Milk, Egg, Fish, Beef, Droplets, Stethoscope, Star, ShieldCheck } from "lucide-react"
import Image from "next/image"

export type Step5DietaryAllergiesProps = {
  selectedDietary: string[];
  selectedAllergies: string[];
  setSelectedDietary: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedAllergies: React.Dispatch<React.SetStateAction<string[]>>;
  loading: boolean;
  t: any;
  onNext: () => void;
  onBack: () => void;
};

const Step5DietaryAllergies: React.FC<Step5DietaryAllergiesProps> = (props) => {
  const { selectedDietary, selectedAllergies, setSelectedDietary, setSelectedAllergies, loading, t, onNext, onBack } = props;

  const dietaryOptions = [
    { id: "vegetarian", name: t.onboarding.step5.dietaryOptions.vegetarian, icon: Leaf },
    { id: "vegan", name: t.onboarding.step5.dietaryOptions.vegan, icon: Leaf },
    { id: "gluten-free", name: t.onboarding.step5.dietaryOptions.glutenFree, icon: Wheat },
    { id: "dairy-free", name: t.onboarding.step5.dietaryOptions.dairyFree, icon: Milk },
    { id: "keto", name: t.onboarding.step5.dietaryOptions.keto, icon: Beef },
    { id: "paleo", name: t.onboarding.step5.dietaryOptions.paleo, icon: Beef },
    { id: "low-sodium", name: t.onboarding.step5.dietaryOptions.lowSodium, icon: Droplets },
    { id: "diabetic", name: t.onboarding.step5.dietaryOptions.diabetic, icon: Stethoscope },
    { id: "halal", name: t.onboarding.step5.dietaryOptions.halal, icon: Star },
    { id: "kosher", name: t.onboarding.step5.dietaryOptions.kosher, icon: ShieldCheck }
  ];

  const allergyOptions = [
    { id: "nuts", name: t.onboarding.step5.allergyOptions.nuts, icon: Leaf, severity: "high" },
    { id: "peanuts", name: t.onboarding.step5.allergyOptions.peanuts, icon: Leaf, severity: "high" },
    { id: "dairy", name: t.onboarding.step5.allergyOptions.dairy, icon: Milk, severity: "medium" },
    { id: "eggs", name: t.onboarding.step5.allergyOptions.eggs, icon: Egg, severity: "medium" },
    { id: "soy", name: t.onboarding.step5.allergyOptions.soy, icon: Leaf, severity: "medium" },
    { id: "gluten", name: t.onboarding.step5.allergyOptions.gluten, icon: Wheat, severity: "medium" },
    { id: "shellfish", name: t.onboarding.step5.allergyOptions.shellfish, icon: Fish, severity: "high" },
    { id: "fish", name: t.onboarding.step5.allergyOptions.fish, icon: Fish, severity: "medium" },
    { id: "sesame", name: t.onboarding.step5.allergyOptions.sesame, icon: Leaf, severity: "medium" },
    { id: "sulfites", name: t.onboarding.step5.allergyOptions.sulfites, icon: AlertTriangle, severity: "low" }
  ];

  const handleDietaryToggle = (dietaryId: string) => {
    setSelectedDietary(prev => {
      if (prev.includes(dietaryId)) {
        return prev.filter(id => id !== dietaryId);
      } else {
        return [...prev, dietaryId];
      }
    });
  };

  const handleAllergyToggle = (allergyId: string) => {
    setSelectedAllergies(prev => {
      if (prev.includes(allergyId)) {
        return prev.filter(id => id !== allergyId);
      } else {
        return [...prev, allergyId];
      }
    });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-4xl mx-auto">
      <Card className="w-full shadow-2xl rounded-2xl sm:rounded-3xl border-0 bg-white/80 dark:bg-[#232B23]/80 backdrop-blur-md border border-white/20 dark:border-gray-700/30">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
          <div className="text-center mb-2 sm:mb-3">
            <Image src="/bb-icon.svg" alt="BargainB" width={24} height={24} className="mx-auto mb-2 sm:mb-3" />
          </div>
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-[family-name:var(--font-paytone-one)] text-[#1F1F1F] dark:text-[#F5F5F5] text-center mb-1">
            {t.onboarding.step5.title}
          </CardTitle>
          <div className="text-sm md:text-base font-[family-name:var(--font-inter)] text-[#7A7A7A] dark:text-[#B7EACB] text-center leading-relaxed">
            {t.onboarding.step5.description}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6 pb-4 sm:pb-6">
          
          {/* Dietary Preferences Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-[#00B207]" />
              <span className="text-sm font-semibold font-[family-name:var(--font-inter)] text-[#1F1F1F] dark:text-[#F5F5F5]">
                {t.onboarding.step5.dietaryPreferences}
              </span>
              <span className="text-xs font-[family-name:var(--font-inter)] text-[#7A7A7A] dark:text-[#B7EACB]">
                ({t.onboarding.common.optional})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {dietaryOptions.map((option) => {
                const isSelected = selectedDietary.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleDietaryToggle(option.id)}
                    className={`relative p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#00B207] min-h-[60px] sm:min-h-[70px] touch-manipulation backdrop-blur-sm ${
                      isSelected
                        ? 'border-[#00B207] bg-green-50/80 dark:bg-green-950/40 shadow-lg'
                        : 'border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 hover:border-[#00B207]/50'
                    }`}
                    aria-label={`${isSelected ? 'Deselect' : 'Select'} ${option.name}`}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#00B207] rounded-full flex items-center justify-center">
                        <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex flex-col items-center space-y-1 h-full justify-center">
                      <option.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#00B207]" />
                      <span className="text-xs font-medium font-[family-name:var(--font-inter)] text-[#1F1F1F] dark:text-[#F5F5F5] text-center leading-tight">
                        {option.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergies Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold font-[family-name:var(--font-inter)] text-[#1F1F1F] dark:text-[#F5F5F5]">
                {t.onboarding.step5.foodAllergies}
              </span>
              <span className="text-xs font-[family-name:var(--font-inter)] text-[#7A7A7A] dark:text-[#B7EACB]">
                ({t.onboarding.common.optional})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {allergyOptions.map((allergy) => {
                const isSelected = selectedAllergies.includes(allergy.id);
                const severityColors = {
                  high: isSelected ? 'border-red-500 bg-red-50/80 dark:bg-red-950/40' : 'border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 hover:border-red-500/50',
                  medium: isSelected ? 'border-orange-500 bg-orange-50/80 dark:bg-orange-950/40' : 'border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 hover:border-orange-500/50',
                  low: isSelected ? 'border-yellow-500 bg-yellow-50/80 dark:bg-yellow-950/40' : 'border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 hover:border-yellow-500/50'
                };
                
                return (
                  <button
                    key={allergy.id}
                    onClick={() => handleAllergyToggle(allergy.id)}
                    className={`relative p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[60px] sm:min-h-[70px] touch-manipulation backdrop-blur-sm ${
                      severityColors[allergy.severity as keyof typeof severityColors]
                    }`}
                    aria-label={`${isSelected ? 'Deselect' : 'Select'} ${allergy.name} allergy`}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex flex-col items-center space-y-1 h-full justify-center">
                      <allergy.icon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                      <span className="text-xs font-medium font-[family-name:var(--font-inter)] text-[#1F1F1F] dark:text-[#F5F5F5] text-center leading-tight">
                        {allergy.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selection Summary */}
          {(selectedDietary.length > 0 || selectedAllergies.length > 0) && (
            <div className="bg-green-50/80 dark:bg-green-950/40 rounded-lg p-3 border border-[#00B207]/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-[#00B207]" />
                <span className="text-sm font-medium font-[family-name:var(--font-inter)] text-[#1F1F1F] dark:text-[#F5F5F5]">
                  {t.onboarding.step5.yourSelections} ({selectedDietary.length + selectedAllergies.length})
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {selectedDietary.map((dietaryId) => {
                  const dietary = dietaryOptions.find(d => d.id === dietaryId);
                  if (!dietary) return null;
                  const IconComponent = dietary.icon;
                  return (
                    <span
                      key={dietaryId}
                      className="px-2 py-1 bg-[#00B207] text-white text-xs font-[family-name:var(--font-inter)] rounded-full shadow-sm flex items-center gap-1"
                    >
                      <IconComponent className="w-3 h-3" />
                      {dietary.name}
                    </span>
                  );
                })}
                {selectedAllergies.map((allergyId) => {
                  const allergy = allergyOptions.find(a => a.id === allergyId);
                  if (!allergy) return null;
                  const IconComponent = allergy.icon;
                  return (
                    <span
                      key={allergyId}
                      className="px-2 py-1 bg-red-500 text-white text-xs font-[family-name:var(--font-inter)] rounded-full shadow-sm flex items-center gap-1"
                    >
                      <IconComponent className="w-3 h-3" />
                      {allergy.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full sm:flex-1 h-10 sm:h-11 text-sm font-[family-name:var(--font-inter)] transition-all duration-300 hover:scale-[1.02] touch-manipulation bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
              aria-label="Go back"
            >
              {t.onboarding.common.back}
            </Button>
            <Button
              onClick={handleNext}
              disabled={loading}
              className="w-full sm:flex-1 h-10 sm:h-11 bg-gradient-to-r from-[#00B207] to-[#84D187] hover:from-[#00A006] hover:to-[#7BC682] text-white font-semibold text-sm font-[family-name:var(--font-inter)] rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 touch-manipulation shadow-lg"
              aria-label="Continue"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t.onboarding.common.continue} {(selectedDietary.length > 0 || selectedAllergies.length > 0) && `(${selectedDietary.length + selectedAllergies.length})`}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs font-[family-name:var(--font-inter)] text-[#7A7A7A] dark:text-[#B7EACB]">
              {t.onboarding.step5.helpText}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step5DietaryAllergies; 