// BargainB Products Admin Hooks
export { useProducts } from './useProducts'
export { useProductDetails } from './useProductDetails'
export { useProductsSearch } from './useProductsSearch'
export { useProductsFilters } from './useProductsFilters'

// Re-export types for convenience
export type {
  UseProductsResult,
  UseProductDetailsResult,
  ProductFilters,
  ProductSearchParams,
  MasterProduct,
  ProductDetails,
  ProductsOverviewStats,
  RetailerBreakdown,
  CategoryBreakdown
} from '@/types/products.types' 