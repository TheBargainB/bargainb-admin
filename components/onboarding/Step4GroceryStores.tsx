import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ArrowRight, Check } from "lucide-react"
import Image from "next/image"

export type Step4GroceryStoresProps = {
  selectedStores: Array<{id: string; name: string; url: string}>;
  setSelectedStores: React.Dispatch<React.SetStateAction<Array<{id: string; name: string; url: string}>>>;
  loading: boolean;
  t: any;
  onNext: () => void;
  onBack: () => void;
  isOpen: boolean;
  onClose: () => void;
};

const groceryStores = [
  {
    id: "albert-heijn",
    name: "Albert Heijn",
    url: "ah.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Albert Heijn, color=On Light Mode.svg"
  },
  {
    id: "jumbo",
    name: "Jumbo",
    url: "jumbo.com",
    logo: "/supermarkets/Size=X Large, Supermarket=Jumbo, color=On Light Mode.svg"
  },
  {
    id: "lidl",
    name: "Lidl",
    url: "lidl.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Lidl, color=On Light Mode.svg"
  },
  {
    id: "aldi",
    name: "Aldi",
    url: "aldi.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Aldi, color=On Light Mode.svg"
  },
  {
    id: "coop",
    name: "Coop",
    url: "coop.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Coop, color=On Light Mode.svg"
  },
  {
    id: "dirk",
    name: "Dirk",
    url: "dirk.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Dirk, color=On Light Mode.svg"
  },
  {
    id: "edeka",
    name: "Edeka",
    url: "edeka.de",
    logo: "/supermarkets/Size=X Large, Supermarket=Edeka, color=On Light Mode.svg"
  },
  {
    id: "hoogvilet",
    name: "Hoogvliet",
    url: "hoogvliet.com",
    logo: "/supermarkets/Size=X Large, Supermarket=Hoogvilet, color=On Light Mode.svg"
  },
  {
    id: "spar",
    name: "Spar",
    url: "spar.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Spar, color=On Light Mode.svg"
  }
];

const Step4GroceryStores: React.FC<Step4GroceryStoresProps> = (props) => {
  const { selectedStores, setSelectedStores, loading, t, onNext, onBack, isOpen, onClose } = props;

  const handleStoreToggle = (storeId: string) => {
    const store = groceryStores.find(s => s.id === storeId);
    if (!store) return;

    setSelectedStores(prev => {
      const isSelected = prev.some(s => s.id === storeId);
      if (isSelected) {
        return prev.filter(s => s.id !== storeId);
      } else {
        return [...prev, { id: store.id, name: store.name, url: store.url }];
      }
    });
  };

  const handleNext = () => {
    onNext();
  };

  const handleBack = () => {
    onClose();
    onBack();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 bg-white/95 dark:bg-[#232B23]/95 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl shadow-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00B207] to-[#84D187] rounded-full flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5]">
                {t.onboarding.step4.title}
              </DialogTitle>
              <p className="text-sm text-[#7A7A7A] dark:text-[#B7EACB] mt-1">
                {t.onboarding.step4.description}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Store Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {groceryStores.map((store) => {
                const isSelected = selectedStores.some(s => s.id === store.id);
                return (
                  <button
                    key={store.id}
                    onClick={() => handleStoreToggle(store.id)}
                    className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#00B207] min-h-[100px] sm:min-h-[120px] touch-manipulation backdrop-blur-sm ${
                      isSelected
                        ? 'border-[#00B207] bg-green-50/80 dark:bg-green-950/40 shadow-lg'
                        : 'border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 hover:border-[#00B207]/50'
                    }`}
                    aria-label={`${isSelected ? 'Deselect' : 'Select'} ${store.name}`}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-[#00B207] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                    )}
                    
                    {/* Store Logo */}
                    <div className="flex flex-col items-center space-y-2 sm:space-y-3 h-full justify-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                        <Image
                          src={store.logo}
                          alt={`${store.name} logo`}
                          width={64}
                          height={64}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[#1F1F1F] dark:text-[#F5F5F5] text-center leading-tight">
                        {store.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selection Summary */}
            {selectedStores.length > 0 && (
              <div className="bg-green-50/80 dark:bg-green-950/40 rounded-xl p-4 border border-[#00B207]/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-5 h-5 text-[#00B207]" />
                  <span className="text-base font-medium text-[#1F1F1F] dark:text-[#F5F5F5]">
                    {t.onboarding.step4.selectedStores} ({selectedStores.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedStores.map((store) => {
                    return (
                      <span
                        key={store.id}
                        className="px-3 py-1.5 bg-[#00B207] text-white text-sm rounded-full shadow-sm"
                      >
                        {store.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Fixed Bottom Section */}
          <div className="border-t border-gray-200/30 dark:border-gray-700/30 p-6 space-y-4 bg-white/80 dark:bg-[#232B23]/80 backdrop-blur-sm">
            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12 text-base transition-all duration-300 hover:scale-[1.02] touch-manipulation bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/50 dark:border-gray-600/50"
                aria-label="Go back"
              >
                {t.onboarding.common.back}
              </Button>
              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 h-12 bg-gradient-to-r from-[#00B207] to-[#84D187] hover:from-[#00A006] hover:to-[#7BC682] text-white font-semibold text-base rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 touch-manipulation shadow-lg"
                aria-label="Continue"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t.onboarding.common.continue} {selectedStores.length > 0 && `(${selectedStores.length})`}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-[#7A7A7A] dark:text-[#B7EACB]">
                {t.onboarding.step4.helpText}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Step4GroceryStores; 