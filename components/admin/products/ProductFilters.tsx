'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
// import { useProductsFilters } from '@/hooks/admin/products';
import { 
  Filter,
  X,
  DollarSign,
  Store,
  Package,
  Tag,
  RefreshCw
} from 'lucide-react';

const ProductFilters = () => {
  // Mock filters state for now - will be connected to real hook later
  const filters = {
    category: '',
    brand: '',
    retailer: '',
    priceRange: [0, 100] as [number, number],
    inStock: false,
    sortBy: 'name',
    sortOrder: 'asc'
  };
  
  const activeFilters = {};
  
  const setCategory = (value: string) => console.log('setCategory:', value);
  const setBrand = (value: string) => console.log('setBrand:', value);
  const setRetailer = (value: string) => console.log('setRetailer:', value);
  const setPriceRange = (value: [number, number]) => console.log('setPriceRange:', value);
  const setInStock = (value: boolean) => console.log('setInStock:', value);
  const setSortBy = (value: string) => console.log('setSortBy:', value);
  const setSortOrder = (value: string) => console.log('setSortOrder:', value);
  const clearFilters = () => console.log('clearFilters');
  const clearFilter = (key: string) => console.log('clearFilter:', key);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(activeFilters).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </div>
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([key, value]) => (
                <Badge 
                  key={key} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => clearFilter(key)}
                >
                  {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Category</span>
          </Label>
          <Select value={filters.category || ''} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="fresh">Fresh Products</SelectItem>
              <SelectItem value="dairy">Dairy & Eggs</SelectItem>
              <SelectItem value="meat">Meat & Poultry</SelectItem>
              <SelectItem value="seafood">Seafood</SelectItem>
              <SelectItem value="bakery">Bakery</SelectItem>
              <SelectItem value="frozen">Frozen</SelectItem>
              <SelectItem value="pantry">Pantry</SelectItem>
              <SelectItem value="beverages">Beverages</SelectItem>
              <SelectItem value="snacks">Snacks & Sweets</SelectItem>
              <SelectItem value="household">Household</SelectItem>
              <SelectItem value="personal-care">Personal Care</SelectItem>
              <SelectItem value="baby">Baby Products</SelectItem>
              <SelectItem value="pets">Pet Supplies</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Brand Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <Tag className="w-4 h-4" />
            <span>Brand</span>
          </Label>
          <Select value={filters.brand || ''} onValueChange={setBrand}>
            <SelectTrigger>
              <SelectValue placeholder="All brands" />
            </SelectTrigger>
            <SelectContent>
                                <SelectItem value="all">All brands</SelectItem>
              <SelectItem value="ah">Albert Heijn</SelectItem>
              <SelectItem value="jumbo">Jumbo</SelectItem>
              <SelectItem value="plus">PLUS</SelectItem>
              <SelectItem value="coop">Coop</SelectItem>
              <SelectItem value="spar">SPAR</SelectItem>
              <SelectItem value="private-label">Private Label</SelectItem>
              <SelectItem value="branded">Branded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Retailer Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <Store className="w-4 h-4" />
            <span>Retailer</span>
          </Label>
          <Select value={filters.retailer || ''} onValueChange={setRetailer}>
            <SelectTrigger>
              <SelectValue placeholder="All retailers" />
            </SelectTrigger>
            <SelectContent>
                                <SelectItem value="all">All retailers</SelectItem>
              <SelectItem value="albert-heijn">Albert Heijn</SelectItem>
              <SelectItem value="jumbo">Jumbo</SelectItem>
              <SelectItem value="plus">PLUS</SelectItem>
              <SelectItem value="coop">Coop</SelectItem>
              <SelectItem value="spar">SPAR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Price Range</span>
          </Label>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formatCurrency(filters.priceRange[0])}</span>
              <span>{formatCurrency(filters.priceRange[1])}</span>
            </div>
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceRangeChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Stock Status Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Stock Status</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={filters.inStock}
              onCheckedChange={(checked) => setInStock(checked as boolean)}
            />
            <Label htmlFor="in-stock" className="text-sm">
              In stock only
            </Label>
          </div>
        </div>

        <Separator />

        {/* Sort Options */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Sort By</Label>
          <div className="space-y-2">
            <Select value={filters.sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="brand">Brand</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="updated">Last Updated</SelectItem>
                <SelectItem value="stores">Store Count</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Order..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductFilters; 