// BargainB Products Admin Types
// These types support the comprehensive CEO dashboard and product management system

// ==================== CEO Dashboard Types ====================

export interface ProductsOverviewStats {
  totalProducts: number
  totalStoreProducts: number
  totalRetailers: number
  activePrices: number
  priceCoverage: number
  gtinCoverage: number
  promotionalItems: number
  avgPrice: number
}

export interface RetailerBreakdown {
  retailer: string
  productCount: number
  avgPrice: number
  promoCount: number
  priceCoverage: number
}

export interface CategoryBreakdown {
  category: string
  productCount: number
  avgPrice: number
  level: number
}

export interface MasterProduct {
  id: string
  title: string
  gtin: string | null
  brand: string | null
  category: string | null
  categoryPath: string | null
  description: string | null
  quantity: string | null
  unitAmount: number | null
  unit: string | null
  isVariant: boolean | null
  variantGroupId: string | null
  manufacturer: string | null
  imageUrl: string | null
  matchedRetailers: number
  minPrice: number | null
  maxPrice: number | null
  avgPrice: number | null
  hasPromos: boolean
  createdAt: string
  updatedAt: string | null
}

export interface ProductsAPIResponse {
  success: boolean
  data?: {
    stats: ProductsOverviewStats
    products: MasterProduct[]
    retailers: RetailerBreakdown[]
    categories: CategoryBreakdown[]
    pagination: {
      total: number
      page: number
      limit: number
      hasMore: boolean
    }
  }
  error?: string
}

// ==================== Product Details Types ====================

export interface ProductStoreMatch {
  storeId: string
  storeName: string
  storeSlug: string
  storeLogoUrl: string | null
  storeProductId: string
  storeProductTitle: string
  storeProductUrl: string | null
  storeProductImage: string | null
  matchMethod: string | null
  matchConfidence: number | null
  isAvailable: boolean
  currentPrice: number | null
  promoPrice: number | null
  pricePerUnit: number | null
  priceUnit: string | null
  normalizedPrices: {
    perKg: number | null
    perL: number | null
    perPiece: number | null
  }
  priceHistory: ProductPriceHistory[]
}

export interface ProductPriceHistory {
  date: string
  price: number
  promoPrice: number | null
  changeAmount: number | null
  changePercentage: number | null
  changeType: string | null
}

export interface ProductNutrition {
  energyKcal: number | null
  energyKj: number | null
  fat: number | null
  saturatedFat: number | null
  carbohydrates: number | null
  sugars: number | null
  fiber: number | null
  proteins: number | null
  salt: number | null
  sodium: number | null
  polyols: number | null
}

export interface ProductCategory {
  id: string
  level1: string | null
  level2: string | null
  level3: string | null
  level4: string | null
  path: string
}

export interface ProductManufacturer {
  id: string
  name: string
  address: string | null
  website: string | null
}

export interface ProductImage {
  id: string
  url: string
  size: string | null
  source: string | null
}

export interface ProductPricingSummary {
  totalStores: number
  minPrice: number | null
  maxPrice: number | null
  avgPrice: number | null
  cheapestStore: string | null
  mostExpensiveStore: string | null
  hasPromotions: boolean
  promotionCount: number
}

export interface ProductMatchingStats {
  totalMatches: number
  highConfidenceMatches: number
  gtinMatches: number
  titleMatches: number
  fuzzyMatches: number
}

export interface ProductDebugInfo {
  source: string | null
  embedding: boolean
  createdAt: string
  updatedAt: string | null
  matchingStats: ProductMatchingStats
}

export interface ProductDetails {
  // Core Product Info
  id: string
  title: string
  gtin: string | null
  brand: string | null
  regulatedProductName: string | null
  description: string | null
  quantity: string | null
  servingSize: number | null
  servingUnit: string | null
  unitAmount: number | null
  unit: string | null
  pkQty: number | null
  pkAmount: string | null
  
  // Classification
  category: ProductCategory | null
  manufacturer: ProductManufacturer | null
  
  // Variant Information
  isVariant: boolean
  variantGroupId: string | null
  
  // Media
  images: ProductImage[]
  
  // Store Matches & Pricing
  storeMatches: ProductStoreMatch[]
  pricingSummary: ProductPricingSummary
  
  // Additional Data
  nutrition: ProductNutrition | null
  ingredients: string[]
  features: string[]
  additives: string | null
  preparationUsage: string | null
  storageInfo: string | null
  recyclingInfo: string | null
  
  // Debug Info
  debugInfo: ProductDebugInfo
}

export interface ProductDetailsResponse {
  success: boolean
  data?: ProductDetails
  error?: string
}

// ==================== Filter & Search Types ====================

export interface ProductFilters {
  search?: string
  category?: string
  brand?: string
  retailer?: string
  priceRange?: string
  hasPromos?: boolean
  page?: number
  limit?: number
}

export interface ProductSearchParams {
  search: string
  category: string
  brand: string
  retailer: string
  priceRange: string
  hasPromos: boolean
  page: number
  limit: number
}

// ==================== UI State Types ====================

export interface ProductsTableState {
  products: MasterProduct[]
  stats: ProductsOverviewStats
  retailers: RetailerBreakdown[]
  categories: CategoryBreakdown[]
  loading: boolean
  error: string | null
  filters: ProductFilters
  pagination: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
}

export interface ProductDetailsState {
  product: ProductDetails | null
  loading: boolean
  error: string | null
}

// ==================== Hook Types ====================

export interface UseProductsResult {
  // Data
  products: MasterProduct[]
  stats: ProductsOverviewStats
  retailers: RetailerBreakdown[]
  categories: CategoryBreakdown[]
  pagination: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
  
  // State
  loading: boolean
  error: string | null
  
  // Actions
  fetchProducts: (filters?: ProductFilters) => Promise<void>
  setFilters: (filters: ProductFilters) => void
  clearFilters: () => void
  nextPage: () => void
  previousPage: () => void
  goToPage: (page: number) => void
  refreshData: () => Promise<void>
}

export interface UseProductDetailsResult {
  // Data
  product: ProductDetails | null
  
  // State
  loading: boolean
  error: string | null
  
  // Actions
  fetchProductDetails: (productId: string) => Promise<void>
  clearProduct: () => void
  refreshProduct: () => Promise<void>
}

// ==================== Component Props Types ====================

export interface ProductsStatsCardsProps {
  stats: ProductsOverviewStats
  loading?: boolean
}

export interface ProductsTableProps {
  products: MasterProduct[]
  loading?: boolean
  onProductClick?: (product: MasterProduct) => void
  onFilterChange?: (filters: ProductFilters) => void
  pagination?: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
  onPageChange?: (page: number) => void
}

export interface ProductDetailsModalProps {
  product: ProductDetails | null
  isOpen: boolean
  onClose: () => void
  loading?: boolean
  error?: string | null
}

export interface RetailerBreakdownChartProps {
  retailers: RetailerBreakdown[]
  loading?: boolean
}

export interface CategoryBreakdownChartProps {
  categories: CategoryBreakdown[]
  loading?: boolean
}

export interface ProductStoreMatchesProps {
  storeMatches: ProductStoreMatch[]
  pricingSummary: ProductPricingSummary
}

export interface ProductNutritionProps {
  nutrition: ProductNutrition | null
}

export interface ProductImagesProps {
  images: ProductImage[]
}

export interface ProductPriceHistoryProps {
  priceHistory: ProductPriceHistory[]
  storeName: string
}

// ==================== Utility Types ====================

export type ProductSortField = 
  | 'title'
  | 'brand'
  | 'category'
  | 'matchedRetailers'
  | 'minPrice'
  | 'maxPrice'
  | 'avgPrice'
  | 'createdAt'
  | 'updatedAt'

export type ProductSortOrder = 'asc' | 'desc'

export interface ProductSort {
  field: ProductSortField
  order: ProductSortOrder
}

export type PriceRange = 'all' | 'under-5' | '5-20' | '20-50' | 'over-50'

export type MatchMethod = 'gtin' | 'title' | 'fuzzy' | 'enrichment_exact' | 'tf_idf_ml'

export type MatchConfidenceLevel = 'high' | 'medium' | 'low'

// ==================== API Error Types ====================

export interface APIError {
  message: string
  code?: string
  details?: Record<string, any>
}

export interface ValidationError {
  field: string
  message: string
}

// ==================== Form Types ====================

export interface ProductFiltersForm {
  search: string
  category: string
  brand: string
  retailer: string
  priceRange: PriceRange
  hasPromos: boolean
  sortBy: ProductSortField
  sortOrder: ProductSortOrder
}

// ==================== Constants ====================

export const PRODUCTS_PER_PAGE = 25
export const MAX_SEARCH_LENGTH = 255

export const PRICE_RANGES: Record<PriceRange, { label: string; min?: number; max?: number }> = {
  'all': { label: 'All Prices' },
  'under-5': { label: 'Under €5', max: 5 },
  '5-20': { label: '€5 - €20', min: 5, max: 20 },
  '20-50': { label: '€20 - €50', min: 20, max: 50 },
  'over-50': { label: 'Over €50', min: 50 }
}

export const MATCH_METHODS: Record<MatchMethod, { label: string; description: string }> = {
  'gtin': { label: 'GTIN Match', description: 'Matched by Global Trade Item Number' },
  'title': { label: 'Title Match', description: 'Matched by product title similarity' },
  'fuzzy': { label: 'Fuzzy Match', description: 'Matched by fuzzy string matching' },
  'enrichment_exact': { label: 'Enrichment Match', description: 'Matched by data enrichment' },
  'tf_idf_ml': { label: 'ML Match', description: 'Matched by machine learning algorithm' }
}

export const CONFIDENCE_LEVELS: Record<MatchConfidenceLevel, { label: string; min: number; max: number }> = {
  'high': { label: 'High Confidence', min: 0.8, max: 1.0 },
  'medium': { label: 'Medium Confidence', min: 0.5, max: 0.8 },
  'low': { label: 'Low Confidence', min: 0.0, max: 0.5 }
} 