import React, { useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Camera, Upload, Refrigerator, Package, FileText, Check, X, Plus, Loader2, List, Image, Sparkles } from "lucide-react"

export type Step6GroceryListsProps = {
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  loading: boolean;
  t: any;
  onNext: () => void;
  onBack: () => void;
};

type AnalysisResult = {
  id: string;
  category: string;
  imageUrl: string;
  items: string[];
};

const getPreMadeLists = (t: any) => [
  {
    id: "essentials",
    nameKey: "essentials",
    descriptionKey: "essentialsDesc",
    items: t.onboarding.step6.listItems.essentials
  },
  {
    id: "weekly",
    nameKey: "weekly",
    descriptionKey: "weeklyDesc", 
    items: t.onboarding.step6.listItems.weekly
  },
  {
    id: "healthy",
    nameKey: "healthy",
    descriptionKey: "healthyDesc",
    items: t.onboarding.step6.listItems.healthy
  },
  {
    id: "family",
    nameKey: "family", 
    descriptionKey: "familyDesc",
    items: t.onboarding.step6.listItems.family
  },
  {
    id: "quick",
    nameKey: "quick",
    descriptionKey: "quickDesc",
    items: t.onboarding.step6.listItems.quick
  },
  {
    id: "breakfast",
    nameKey: "breakfast", 
    descriptionKey: "breakfastDesc",
    items: t.onboarding.step6.listItems.breakfast
  }
];

const imageCategories = [
  { id: "fridge", nameKey: "fridge", icon: Refrigerator, descriptionKey: "fridgeDescription" },
  { id: "pantry", nameKey: "pantry", icon: Package, descriptionKey: "pantryDescription" },
  { id: "shopping_list", nameKey: "shoppingList", icon: FileText, descriptionKey: "shoppingListDescription" }
];

const Step6GroceryLists: React.FC<Step6GroceryListsProps> = (props) => {
  const { selectedItems, setSelectedItems, loading, t, onNext, onBack } = props;
  const [isPreMadeModalOpen, setIsPreMadeModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedPreMadeLists, setSelectedPreMadeLists] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [itemSources, setItemSources] = useState<Record<string, 'premade' | 'ai'>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const preMadeLists = getPreMadeLists(t);

  const handlePreMadeListSelect = (listId: string) => {
    const list = preMadeLists.find((l: any) => l.id === listId);
    if (list) {
      if (selectedPreMadeLists.includes(listId)) {
        // Deselect
        setSelectedPreMadeLists(prev => prev.filter(id => id !== listId));
        setSelectedItems(prev => prev.filter(item => !list.items.includes(item)));
        // Remove sources for these items
        setItemSources(prev => {
          const newSources = { ...prev };
          list.items.forEach((item: string) => {
            delete newSources[item];
          });
          return newSources;
        });
      } else {
        // Select
        setSelectedPreMadeLists(prev => [...prev, listId]);
        setSelectedItems(prev => {
          const newItems = [...prev];
          list.items.forEach((item: string) => {
            if (!newItems.includes(item)) {
              newItems.push(item);
            }
          });
          return newItems;
        });
        // Add sources for these items
        setItemSources(prev => {
          const newSources = { ...prev };
          list.items.forEach((item: string) => {
            newSources[item] = 'premade';
          });
          return newSources;
        });
      }
    }
  };

  const handleItemToggle = (item: string) => {
    setSelectedItems(prev => {
      if (prev.includes(item)) {
        // Remove from sources too
        setItemSources(prevSources => {
          const newSources = { ...prevSources };
          delete newSources[item];
          return newSources;
        });
        return prev.filter(i => i !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleImageUpload = (file: File, category: string) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const base64Data = base64.split(',')[1];

      await analyzeImage(base64Data, category, base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Image: string, category: string, imageUrl: string) => {
    setIsAnalyzing(true);
    
    // Determine current language from translations
    const getCurrentLanguage = () => {
      if (t.onboarding.step6.title === "Je boodschappenlijst") return 'nl';
      if (t.onboarding.step6.title === "Ihre Einkaufsliste") return 'de';
      if (t.onboarding.step6.title === "Votre liste de courses") return 'fr';
      if (t.onboarding.step6.title === "La tua lista della spesa") return 'it';
      if (t.onboarding.step6.title === "Tu lista de compras") return 'es';
      return 'en'; // Default to English
    };

    const currentLanguage = getCurrentLanguage();
    
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          category: category,
          language: currentLanguage,
          prompt: `Analyze this ${category} image and suggest grocery items that need to be purchased.`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      const analysisId = Date.now().toString();
      
      // Add to analysis results with image
      const newAnalysis: AnalysisResult = {
        id: analysisId,
        category: category,
        imageUrl: imageUrl,
        items: data.items || []
      };
      
      setAnalysisResults(prev => [...prev, newAnalysis]);
      
      // Add analyzed items to selected items
      setSelectedItems(prev => {
        const newItems = [...prev];
        (data.items as string[]).forEach((item: string) => {
          if (!newItems.includes(item)) {
            newItems.push(item);
          }
        });
        return newItems;
      });

      // Add sources for AI items
      setItemSources(prev => {
        const newSources = { ...prev };
        (data.items as string[]).forEach((item: string) => {
          newSources[item] = 'ai';
        });
        return newSources;
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (category: string) => {
    setSelectedCategory(category);
    fileInputRef.current?.click();
  };

  const handleCameraSelect = (category: string) => {
    setSelectedCategory(category);
    cameraInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedCategory) {
      handleImageUpload(file, selectedCategory);
    }
  };

  const removeAnalysisResult = (analysisId: string) => {
    const analysis = analysisResults.find(a => a.id === analysisId);
    if (analysis) {
      // Remove analysis
      setAnalysisResults(prev => prev.filter(a => a.id !== analysisId));
      
      // Remove items from selected items
      setSelectedItems(prev => prev.filter(item => !analysis.items.includes(item)));
      
      // Remove sources
      setItemSources(prev => {
        const newSources = { ...prev };
        analysis.items.forEach((item: string) => {
          delete newSources[item];
        });
        return newSources;
      });
    }
  };

  const removeItemFromAnalysis = (analysisId: string, item: string) => {
    // Remove item from analysis results
    setAnalysisResults(prev => prev.map(analysis => 
      analysis.id === analysisId 
        ? { ...analysis, items: analysis.items.filter(i => i !== item) }
        : analysis
    ));
    
    // Remove from selected items
    setSelectedItems(prev => prev.filter(i => i !== item));
    
    // Remove source
    setItemSources(prev => {
      const newSources = { ...prev };
      delete newSources[item];
      return newSources;
    });
  };

  const handleNext = () => {
    onNext();
  };

  const getItemSource = (item: string) => {
    return itemSources[item] || 'manual';
  };

  const getSourceIcon = (source: 'premade' | 'ai' | 'manual') => {
    switch (source) {
      case 'premade': return <List className="w-3 h-3" />;
      case 'ai': return <Sparkles className="w-3 h-3" />;
      default: return <Plus className="w-3 h-3" />;
    }
  };

  const getSourceColor = (source: 'premade' | 'ai' | 'manual') => {
    switch (source) {
      case 'premade': return 'bg-blue-500';
      case 'ai': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <Card className="w-full max-w-sm sm:max-w-4xl mx-auto mt-2 sm:mt-4 shadow-2xl rounded-xl sm:rounded-2xl border-0 bg-white/80 dark:bg-[#232B23]/80 backdrop-blur-md border border-white/20 dark:border-gray-700/30">
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="text-center mb-1">
            <img src="/bb-icon.svg" alt="BargainB" className="w-6 h-6 mx-auto mb-2" />
          </div>
          <CardTitle className="text-lg sm:text-xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5] text-center mb-1" style={{ fontFamily: 'var(--font-paytone-one)' }}>
            {t.onboarding.step6.title}
          </CardTitle>
          <div className="text-xs sm:text-sm text-[#7A7A7A] dark:text-[#B7EACB] text-center leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
            {t.onboarding.step6.description}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-3 sm:px-4 pb-4">
          {/* Two Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Premade Lists Card */}
            <button
              onClick={() => setIsPreMadeModalOpen(true)}
              className="group relative p-4 sm:p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 hover:border-[#00B207]/50 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#00B207] text-left backdrop-blur-sm touch-manipulation min-h-[120px] sm:min-h-[140px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#00B207] to-[#84D187] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <List className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#1F1F1F] dark:text-[#F5F5F5] mb-1" style={{ fontFamily: 'var(--font-paytone-one)' }}>
                    {t.onboarding.step6.quickStartLists}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#7A7A7A] dark:text-[#B7EACB] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                    {t.onboarding.step6.quickStartDescription}
                  </p>
                  {selectedPreMadeLists.length > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium" style={{ fontFamily: 'var(--font-inter)' }}>
                      {selectedPreMadeLists.length} {t.onboarding.step6.listsSelected}
                    </p>
                  )}
                </div>
              </div>
            </button>

            {/* AI Analysis Card */}
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="group relative p-4 sm:p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 hover:border-[#00B207]/50 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#00B207] text-left backdrop-blur-sm touch-manipulation min-h-[120px] sm:min-h-[140px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#1F1F1F] dark:text-[#F5F5F5] mb-1" style={{ fontFamily: 'var(--font-paytone-one)' }}>
                    {t.onboarding.step6.smartAnalysis}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#7A7A7A] dark:text-[#B7EACB] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                    {t.onboarding.step6.smartAnalysisDescription}
                  </p>
                  {analysisResults.length > 0 && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium" style={{ fontFamily: 'var(--font-inter)' }}>
                      {analysisResults.reduce((total, result) => total + result.items.length, 0)} {t.onboarding.step6.itemsAnalyzed}
                    </p>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Selected Items Summary */}
          {selectedItems.length > 0 && (
            <div className="bg-blue-50/80 dark:bg-blue-950/40 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-[#1F1F1F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-inter)' }}>
                  {t.onboarding.step6.yourShoppingList} ({selectedItems.length} {t.onboarding.step6.items})
                </span>
              </div>
              <ScrollArea className="h-16 sm:h-20">
                <div className="flex flex-wrap gap-1">
                  {selectedItems.map((item, index) => {
                    const source = getItemSource(item);
                    return (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={`${getSourceColor(source)} text-white hover:opacity-80 text-xs px-2 py-0.5 cursor-pointer touch-manipulation flex items-center gap-1`}
                        onClick={() => handleItemToggle(item)}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        {getSourceIcon(source)}
                        {item}
                        <X className="w-2 h-2 ml-1" />
                      </Badge>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="flex items-center gap-4 mt-2 text-xs" style={{ fontFamily: 'var(--font-inter)' }}>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-[#7A7A7A] dark:text-[#B7EACB]">{t.onboarding.step6.fromLists}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-[#7A7A7A] dark:text-[#B7EACB]">{t.onboarding.step6.fromAI}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full sm:flex-1 bg-white/50 dark:bg-gray-800/50 border-white/50 dark:border-gray-600/50 text-[#1F1F1F] dark:text-[#F5F5F5] h-10 sm:h-12 text-sm sm:text-base rounded-lg transition-all duration-200 active:scale-95 hover:shadow-md touch-manipulation backdrop-blur-sm"
              style={{ fontFamily: 'var(--font-inter)', WebkitTapHighlightColor: 'transparent' }}
              aria-label="Go back"
            >
              {t.onboarding.common.back}
            </Button>

            <Button
              onClick={handleNext}
              disabled={loading || selectedItems.length === 0}
              className="w-full sm:flex-1 bg-gradient-to-r from-[#00B207] to-[#84D187] hover:from-[#00A006] hover:to-[#7BC682] text-white font-semibold h-10 sm:h-12 text-sm sm:text-base rounded-lg transition-all duration-200 active:scale-95 hover:shadow-md disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-1 touch-manipulation shadow-lg"
              style={{ fontFamily: 'var(--font-inter)', WebkitTapHighlightColor: 'transparent' }}
              aria-label="Continue"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t.onboarding.common.continue}
                  {selectedItems.length > 0 && ` (${selectedItems.length} ${t.onboarding.step6.items})`}
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-[#7A7A7A] dark:text-[#B7EACB] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
              {t.onboarding.step6.helpText}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Premade Lists Modal */}
      <Dialog open={isPreMadeModalOpen} onOpenChange={setIsPreMadeModalOpen}>
        <DialogContent className="max-w-5xl w-full mx-2 sm:mx-4 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] bg-white/90 dark:bg-[#232B23]/90 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-xl sm:rounded-2xl overflow-hidden">
          <DialogHeader className="p-3 sm:p-6 pb-2 sm:pb-4 flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-paytone-one)' }}>
              {t.onboarding.step6.quickStartLists}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {preMadeLists.map((list) => {
                const isSelected = selectedPreMadeLists.includes(list.id);
                return (
                  <button
                    key={list.id}
                    onClick={() => handlePreMadeListSelect(list.id)}
                    className={`relative p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-1 focus:ring-[#00B207] text-left touch-manipulation backdrop-blur-sm min-h-[120px] sm:min-h-[140px] ${
                      isSelected
                        ? 'border-[#00B207] bg-green-50/80 dark:bg-green-950/40 shadow-md'
                        : 'border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 hover:border-[#00B207]/50'
                    }`}
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#00B207] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="text-sm sm:text-base font-medium text-[#1F1F1F] dark:text-[#F5F5F5] leading-tight" style={{ fontFamily: 'var(--font-paytone-one)' }}>
                        {t.onboarding.step6.lists[list.nameKey]}
                      </div>
                      <div className="text-xs sm:text-sm text-[#7A7A7A] dark:text-[#B7EACB] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                        {t.onboarding.step6.lists[list.descriptionKey]}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium" style={{ fontFamily: 'var(--font-inter)' }}>
                        {list.items.length} {t.onboarding.step6.items}
                      </div>
                      <div className="text-xs text-[#7A7A7A] dark:text-[#B7EACB] space-y-1" style={{ fontFamily: 'var(--font-inter)' }}>
                        <div className="font-medium">{t.onboarding.step6.includes}:</div>
                        <div className="flex flex-wrap gap-1">
                          {list.items.slice(0, 3).map((item: string, idx: number) => (
                            <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-[#1F1F1F] dark:text-[#F5F5F5]">
                              {item}
                            </span>
                          ))}
                          {list.items.length > 3 && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              +{list.items.length - 3} {t.onboarding.step6.more}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Modal */}
      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogContent className="max-w-5xl w-full mx-2 sm:mx-4 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] bg-white/90 dark:bg-[#232B23]/90 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-xl sm:rounded-2xl overflow-hidden">
          <DialogHeader className="p-3 sm:p-6 pb-2 sm:pb-4 flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-paytone-one)' }}>
              {t.onboarding.step6.smartAnalysis}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 space-y-4 min-h-0">
            {/* Image Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {imageCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.id} className="space-y-3 p-3 sm:p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                    <div className="text-center">
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-[#00B207] mb-2" />
                      <div className="text-sm font-medium text-[#1F1F1F] dark:text-[#F5F5F5] mb-1" style={{ fontFamily: 'var(--font-paytone-one)' }}>
                        {t.onboarding.step6.categories[category.nameKey]}
                      </div>
                      <div className="text-xs text-[#7A7A7A] dark:text-[#B7EACB]" style={{ fontFamily: 'var(--font-inter)' }}>
                        {t.onboarding.step6[category.descriptionKey]}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFileSelect(category.id)}
                        disabled={isAnalyzing}
                        className="text-xs h-8 sm:h-9 touch-manipulation bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
                        style={{ fontFamily: 'var(--font-inter)', WebkitTapHighlightColor: 'transparent' }}
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        {t.onboarding.step6.upload}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCameraSelect(category.id)}
                        disabled={isAnalyzing}
                        className="text-xs h-8 sm:h-9 touch-manipulation bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
                        style={{ fontFamily: 'var(--font-inter)', WebkitTapHighlightColor: 'transparent' }}
                      >
                        <Camera className="w-3 h-3 mr-1" />
                        {t.onboarding.step6.camera}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Analysis Loading */}
            {isAnalyzing && (
              <div className="bg-blue-50/80 dark:bg-blue-950/40 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-sm text-[#1F1F1F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-inter)' }}>
                    {t.onboarding.step6.analyzing}
                  </span>
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {analysisResults.map((analysis) => (
              <div key={analysis.id} className="bg-green-50/80 dark:bg-green-950/40 rounded-lg p-3 sm:p-4 border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  {/* Image Preview */}
                  <div className="flex-shrink-0 w-full sm:w-auto flex sm:block justify-center">
                    <div>
                      <img 
                        src={analysis.imageUrl} 
                        alt={`${analysis.category} analysis`}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      />
                      <div className="text-xs text-center mt-1 text-[#7A7A7A] dark:text-[#B7EACB]" style={{ fontFamily: 'var(--font-inter)' }}>
                        {t.onboarding.step6.categories[analysis.category] || analysis.category}
                      </div>
                    </div>
                  </div>
                  
                  {/* Analysis Content */}
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        <span className="text-sm font-medium text-[#1F1F1F] dark:text-[#F5F5F5]" style={{ fontFamily: 'var(--font-paytone-one)' }}>
                          {t.onboarding.step6.aiSuggestions} ({analysis.items.length})
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeAnalysisResult(analysis.id)}
                        className="text-xs h-7 sm:h-8 px-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <X className="w-3 h-3 mr-1" />
                        {t.onboarding.step6.remove}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {analysis.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded px-2 sm:px-3 py-1 border border-white/30 dark:border-gray-600/30"
                        >
                          <span className="text-xs sm:text-sm" style={{ fontFamily: 'var(--font-inter)' }}>{item}</span>
                          <button
                            onClick={() => removeItemFromAnalysis(analysis.id, item)}
                            className="text-red-500 hover:text-red-700 p-1 touch-manipulation"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};

export default Step6GroceryLists; 