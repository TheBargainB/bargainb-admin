'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import type {
  UseProductsResult,
  MasterProduct,
  ProductsOverviewStats,
  RetailerBreakdown,
  CategoryBreakdown,
  ProductFilters,
  ProductsAPIResponse
} from '@/types/products.types'

const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  category: 'all',
  brand: 'all',
  retailer: 'all',
  priceRange: 'all',
  hasPromos: false,
  page: 1,
  limit: 25
}

export const useProducts = (): UseProductsResult => {
  const [products, setProducts] = useState<MasterProduct[]>([])
  const [stats, setStats] = useState<ProductsOverviewStats>({
    totalProducts: 0,
    totalStoreProducts: 0,
    totalRetailers: 0,
    activePrices: 0,
    priceCoverage: 0,
    gtinCoverage: 0,
    promotionalItems: 0,
    avgPrice: 0
  })
  const [retailers, setRetailers] = useState<RetailerBreakdown[]>([])
  const [categories, setCategories] = useState<CategoryBreakdown[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<ProductFilters>(DEFAULT_FILTERS)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 25,
    hasMore: false
  })

  const { toast } = useToast()

  const fetchProducts = useCallback(async (newFilters?: ProductFilters) => {
    try {
      setLoading(true)
      setError(null)

      const currentFilters = { ...filters, ...newFilters }
      
      // Build URL with search params
      const params = new URLSearchParams()
      if (currentFilters.search) params.append('search', currentFilters.search)
      if (currentFilters.category && currentFilters.category !== 'all') {
        params.append('category', currentFilters.category)
      }
      if (currentFilters.brand && currentFilters.brand !== 'all') {
        params.append('brand', currentFilters.brand)
      }
      if (currentFilters.retailer && currentFilters.retailer !== 'all') {
        params.append('retailer', currentFilters.retailer)
      }
      if (currentFilters.priceRange && currentFilters.priceRange !== 'all') {
        params.append('priceRange', currentFilters.priceRange)
      }
      if (currentFilters.hasPromos) {
        params.append('hasPromos', 'true')
      }
      if (currentFilters.page) {
        params.append('page', currentFilters.page.toString())
      }
      if (currentFilters.limit) {
        params.append('limit', currentFilters.limit.toString())
      }

      const response = await fetch(`/api/admin/products?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ProductsAPIResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch products')
      }

      if (data.data) {
        setProducts(data.data.products)
        setStats(data.data.stats)
        setRetailers(data.data.retailers)
        setCategories(data.data.categories)
        setPagination(data.data.pagination)
      }

      // Update filters state
      setFiltersState(currentFilters)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filters, toast])

  const setFilters = useCallback((newFilters: ProductFilters) => {
    // Reset to page 1 when filters change
    const filtersWithPageReset = { ...newFilters, page: 1 }
    fetchProducts(filtersWithPageReset)
  }, [fetchProducts])

  const clearFilters = useCallback(() => {
    fetchProducts(DEFAULT_FILTERS)
  }, [fetchProducts])

  const nextPage = useCallback(() => {
    if (pagination.hasMore) {
      fetchProducts({ ...filters, page: pagination.page + 1 })
    }
  }, [fetchProducts, filters, pagination])

  const previousPage = useCallback(() => {
    if (pagination.page > 1) {
      fetchProducts({ ...filters, page: pagination.page - 1 })
    }
  }, [fetchProducts, filters, pagination])

  const goToPage = useCallback((page: number) => {
    if (page > 0 && page <= Math.ceil(pagination.total / pagination.limit)) {
      fetchProducts({ ...filters, page })
    }
  }, [fetchProducts, filters, pagination])

  const refreshData = useCallback(async () => {
    await fetchProducts(filters)
  }, [fetchProducts, filters])

  // Initial load
  useEffect(() => {
    fetchProducts(DEFAULT_FILTERS)
  }, []) // Empty dependency array for initial load only

  return {
    // Data
    products,
    stats,
    retailers,
    categories,
    pagination,
    
    // State
    loading,
    error,
    
    // Actions
    fetchProducts,
    setFilters,
    clearFilters,
    nextPage,
    previousPage,
    goToPage,
    refreshData
  }
} 