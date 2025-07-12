'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
// import { useProductsSearch } from '@/hooks/admin/products';
import { 
  Search,
  X,
  Clock,
  Filter,
  ScanLine,
  Target,
  History
} from 'lucide-react';

const ProductSearch = () => {
  // Mock search state for now - will be connected to real hook later
  const searchTerm = '';
  const searchType = 'name';
  const searchHistory: string[] = [];
  const suggestions: string[] = [];
  const loading = false;
  const results: any[] = [];
  
  const setSearchTerm = (value: string) => console.log('setSearchTerm:', value);
  const setSearchType = (value: string) => console.log('setSearchType:', value);
  const handleSearch = () => console.log('handleSearch');
  const clearSearch = () => console.log('clearSearch');
  const clearHistory = () => console.log('clearHistory');

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
    setShowSuggestions(false);
    setShowHistory(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    handleSearch();
  };

  const handleHistoryClick = (historyItem: string) => {
    setSearchTerm(historyItem);
    setShowHistory(false);
    handleSearch();
  };

  const handleInputFocus = () => {
    if (searchTerm.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowHistory(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding to allow for click events
    setTimeout(() => {
      setShowSuggestions(false);
      setShowHistory(false);
    }, 200);
  };

  useEffect(() => {
    if (searchTerm.length > 0) {
      setShowSuggestions(true);
      setShowHistory(false);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Product Search</span>
          </div>
          <div className="flex items-center space-x-2">
            {results && results.length > 0 && (
              <Badge variant="outline">
                {results.length} results
              </Badge>
            )}
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearSearch}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search Type Selection */}
          <div className="flex items-center space-x-2">
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Search type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Product Name</span>
                  </div>
                </SelectItem>
                <SelectItem value="brand">
                  <div className="flex items-center space-x-2">
                    <ScanLine className="w-4 h-4" />
                    <span>Brand</span>
                  </div>
                </SelectItem>
                <SelectItem value="category">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Category</span>
                  </div>
                </SelectItem>
                <SelectItem value="all">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4" />
                    <span>All Fields</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="pr-10"
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                disabled={loading}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute z-50 w-full mt-1">
              <CardContent className="p-2">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 px-2 py-1">
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer rounded text-sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center space-x-2">
                        <Search className="w-3 h-3 text-gray-400" />
                        <span>{suggestion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search History */}
          {showHistory && searchHistory.length > 0 && (
            <Card className="absolute z-50 w-full mt-1">
              <CardContent className="p-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 py-1">
                    <div className="text-xs text-gray-500">
                      Recent searches
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="text-xs h-auto p-1"
                    >
                      Clear all
                    </Button>
                  </div>
                  {searchHistory.slice(0, 5).map((historyItem, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer rounded text-sm"
                      onClick={() => handleHistoryClick(historyItem)}
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{historyItem}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        {/* Search Results Summary */}
        {results && (
          <div className="space-y-2">
            <Separator />
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {results.length > 0 ? (
                  `Found ${results.length} product${results.length === 1 ? '' : 's'}`
                ) : (
                  'No products found'
                )}
              </div>
              {results.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Search time:</span>
                  <Badge variant="outline" className="text-xs">
                    {loading ? 'Searching...' : '< 1s'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}


      </CardContent>
    </Card>
  );
};

export default ProductSearch; 