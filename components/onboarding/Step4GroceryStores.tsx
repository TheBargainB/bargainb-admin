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
  country: string; // Add country prop
};

const groceryStores = [
  // Netherlands Stores
  {
    id: "albert-heijn",
    name: "Albert Heijn",
    url: "ah.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Albert Heijn, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "jumbo",
    name: "Jumbo",
    url: "jumbo.com",
    logo: "/supermarkets/Size=X Large, Supermarket=Jumbo, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "lidl",
    name: "Lidl",
    url: "lidl.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Lidl, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "aldi",
    name: "Aldi",
    url: "aldi.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Aldi, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "coop",
    name: "Coop",
    url: "coop.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Coop, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "dirk",
    name: "Dirk",
    url: "dirk.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Dirk, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "edeka",
    name: "Edeka",
    url: "edeka.de",
    logo: "/supermarkets/Size=X Large, Supermarket=Edeka, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "hoogvilet",
    name: "Hoogvliet",
    url: "hoogvliet.com",
    logo: "/supermarkets/Size=X Large, Supermarket=Hoogvilet, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "spar",
    name: "Spar",
    url: "spar.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Spar, color=On Light Mode.svg",
    country: "NL"
  },

  // United States Stores
  {
    id: "walmart",
    name: "Walmart",
    url: "walmart.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg",
    country: "US"
  },
  {
    id: "target",
    name: "Target",
    url: "target.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg",
    country: "US"
  },
  {
    id: "kroger",
    name: "Kroger",
    url: "kroger.com",
    logo: "https://1000logos.net/wp-content/uploads/2017/08/Logo-Kroger.png",
    country: "US"
  },
  {
    id: "safeway",
    name: "Safeway",
    url: "safeway.com",
    logo: "https://logos-world.net/wp-content/uploads/2022/01/Safeway-Logo.png",
    country: "US"
  },
  {
    id: "whole-foods",
    name: "Whole Foods Market",
    url: "wholefoodsmarket.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Whole_Foods_Market_201x_logo.svg",
    country: "US"
  },
  {
    id: "costco",
    name: "Costco",
    url: "costco.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/Costco_Wholesale_logo_2010-10-26.svg",
    country: "US"
  },
  {
    id: "sams-club",
    name: "Sam's Club",
    url: "samsclub.com",
    logo: "https://1000logos.net/wp-content/uploads/2021/09/Sams-Club-Logo.png",
    country: "US"
  },
  {
    id: "publix",
    name: "Publix",
    url: "publix.com",
    logo: "https://1000logos.net/wp-content/uploads/2019/08/publix_logo.png",
    country: "US"
  },
  {
    id: "heb",
    name: "H-E-B",
    url: "heb.com",
    logo: "https://upload.wikimedia.org/wikipedia/en/a/a1/H-E-B_logo.svg",
    country: "US"
  },
  {
    id: "wegmans",
    name: "Wegmans",
    url: "wegmans.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/WegmansLogo.svg",
    country: "US"
  },
  {
    id: "giant",
    name: "Giant Food",
    url: "giantfood.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Giant_Food_logo.svg",
    country: "US"
  },
  {
    id: "stop-shop",
    name: "Stop & Shop",
    url: "stopandshop.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/06/Stop_%26_Shop_Logo.svg",
    country: "US"
  }
];

const Step4GroceryStores: React.FC<Step4GroceryStoresProps> = (props) => {
  const { selectedStores, setSelectedStores, loading, t, onNext, onBack, isOpen, onClose, country } = props;

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
      <DialogContent className="max-w-6xl w-full mx-1 sm:mx-4 max-h-[85vh] sm:max-h-[calc(100vh-4rem)] p-0 bg-white/95 dark:bg-[#232B23]/95 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden">
        <DialogHeader className="p-3 sm:p-6 pb-2 sm:pb-4 border-b border-gray-200/30 dark:border-gray-700/30 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-[#00B207] to-[#84D187] rounded-full flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-sm sm:text-2xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5] leading-tight">
                {t.onboarding.step4.title}
              </DialogTitle>
              <p className="text-xs sm:text-sm text-[#7A7A7A] dark:text-[#B7EACB] mt-0.5 sm:mt-1 leading-relaxed">
                {t.onboarding.step4.description}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area - Fixed height for mobile */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 space-y-3 sm:space-y-6 overscroll-contain min-h-0 max-h-[45vh] sm:max-h-none">
            {/* Store Gallery Grid - Mobile optimized to show 4 items (2x2) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
              {groceryStores.filter(store => store.country === country).map((store) => {
                const isSelected = selectedStores.some(s => s.id === store.id);
                return (
                  <button
                    key={store.id}
                    onClick={() => handleStoreToggle(store.id)}
                    className={`relative p-2 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#00B207] h-[80px] sm:min-h-[120px] touch-manipulation backdrop-blur-sm ${
                      isSelected
                        ? 'border-[#00B207] bg-green-50/80 dark:bg-green-950/40 shadow-lg'
                        : 'border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 hover:border-[#00B207]/50'
                    }`}
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                    aria-label={`${isSelected ? 'Deselect' : 'Select'} ${store.name}`}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-4 h-4 sm:w-6 sm:h-6 bg-[#00B207] rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                    )}
                    
                    {/* Store Logo */}
                    <div className="flex flex-col items-center space-y-1 h-full justify-center">
                      <div className="w-8 h-8 sm:w-16 sm:h-16 flex items-center justify-center">
                        <Image
                          src={store.logo}
                          alt={`${store.name} logo`}
                          width={64}
                          height={64}
                          className="max-w-full max-h-full object-contain"
                          style={{ pointerEvents: 'none' }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[#1F1F1F] dark:text-[#F5F5F5] text-center leading-tight px-1">
                        {store.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selection Summary - Compact for mobile */}
            {selectedStores.length > 0 && (
              <div className="bg-green-50/80 dark:bg-green-950/40 rounded-lg p-2 sm:p-4 border border-[#00B207]/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1 sm:mb-3">
                  <Check className="w-3 h-3 sm:w-5 sm:h-5 text-[#00B207]" />
                  <span className="text-xs sm:text-base font-medium text-[#1F1F1F] dark:text-[#F5F5F5]">
                    {t.onboarding.step4.selectedStores} ({selectedStores.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {selectedStores.map((store) => {
                    return (
                      <span
                        key={store.id}
                        className="px-2 py-1 sm:px-3 sm:py-2 bg-[#00B207] text-white text-xs sm:text-sm rounded-full shadow-sm"
                      >
                        {store.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Fixed Bottom Section - Always visible */}
          <div className="border-t border-gray-200/30 dark:border-gray-700/30 p-3 sm:p-6 space-y-2 sm:space-y-4 bg-white/95 dark:bg-[#232B23]/95 backdrop-blur-sm flex-shrink-0">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base transition-all duration-200 active:scale-95 touch-manipulation bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/50 dark:border-gray-600/50"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label="Go back"
              >
                {t.onboarding.common.back}
              </Button>
              <Button
                onClick={handleNext}
                disabled={loading}
                className="w-full sm:flex-1 h-11 sm:h-12 bg-gradient-to-r from-[#00B207] to-[#84D187] hover:from-[#00A006] hover:to-[#7BC682] text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 touch-manipulation shadow-lg"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label="Continue"
              >
                {loading ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t.onboarding.common.continue} {selectedStores.length > 0 && `(${selectedStores.length})`}
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Help Text - Compact on mobile */}
            <div className="text-center">
              <p className="text-xs text-[#7A7A7A] dark:text-[#B7EACB] leading-relaxed">
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