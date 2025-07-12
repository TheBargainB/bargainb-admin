'use client'

import { useState, useCallback, useEffect } from 'react'
import type { 
  ProductFilters, 
  PriceRange,
  ProductSortField,
  ProductSortOrder
} from '@/types/products.types'

interface UseProductsFiltersResult {
  filters: ProductFilters
  setFilter: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void
  updateFilters: (newFilters: Partial<ProductFilters>) => void
  clearFilters: () => void
  resetToDefaults: () => void
  hasActiveFilters: boolean
  filterCount: number
  availableCategories: string[]
  availableBrands: string[]
  availableRetailers: string[]
  setAvailableOptions: (categories: string[], brands: string[], retailers: string[]) => void
}

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

export const useProductsFilters = (
  onFiltersChange?: (filters: ProductFilters) => void
): UseProductsFiltersResult => {
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [availableRetailers, setAvailableRetailers] = useState<string[]>([])

  // Load filters from URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlFilters: Partial<ProductFilters> = {}

    if (urlParams.get('search')) urlFilters.search = urlParams.get('search') || ''
    if (urlParams.get('category')) urlFilters.category = urlParams.get('category') || 'all'
    if (urlParams.get('brand')) urlFilters.brand = urlParams.get('brand') || 'all'
    if (urlParams.get('retailer')) urlFilters.retailer = urlParams.get('retailer') || 'all'
    if (urlParams.get('priceRange')) urlFilters.priceRange = urlParams.get('priceRange') as PriceRange || 'all'
    if (urlParams.get('hasPromos')) urlFilters.hasPromos = urlParams.get('hasPromos') === 'true'
    if (urlParams.get('page')) urlFilters.page = parseInt(urlParams.get('page') || '1')
    if (urlParams.get('limit')) urlFilters.limit = parseInt(urlParams.get('limit') || '25')

    if (Object.keys(urlFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...urlFilters }))
    }
  }, [])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filters.search) params.set('search', filters.search)
    if (filters.category && filters.category !== 'all') params.set('category', filters.category)
    if (filters.brand && filters.brand !== 'all') params.set('brand', filters.brand)
    if (filters.retailer && filters.retailer !== 'all') params.set('retailer', filters.retailer)
    if (filters.priceRange && filters.priceRange !== 'all') params.set('priceRange', filters.priceRange)
    if (filters.hasPromos) params.set('hasPromos', 'true')
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString())
    if (filters.limit && filters.limit !== 25) params.set('limit', filters.limit.toString())

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
    window.history.replaceState({}, '', newUrl)

    if (onFiltersChange) {
      onFiltersChange(filters)
    }
  }, [filters, onFiltersChange])

  const setFilter = useCallback(<K extends keyof ProductFilters>(
    key: K, 
    value: ProductFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset page when changing filters (except page itself)
      ...(key !== 'page' ? { page: 1 } : {})
    }))
  }, [])

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset page when changing filters
      page: newFilters.page || 1
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const resetToDefaults = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const setAvailableOptions = useCallback((
    categories: string[], 
    brands: string[], 
    retailers: string[]
  ) => {
    setAvailableCategories(categories)
    setAvailableBrands(brands)
    setAvailableRetailers(retailers)
  }, [])

  // Calculate if there are active filters
  const hasActiveFilters = !!(
    filters.search ||
    (filters.category && filters.category !== 'all') ||
    (filters.brand && filters.brand !== 'all') ||
    (filters.retailer && filters.retailer !== 'all') ||
    (filters.priceRange && filters.priceRange !== 'all') ||
    filters.hasPromos
  )

  // Count active filters
  const filterCount = [
    filters.search,
    filters.category !== 'all' ? filters.category : null,
    filters.brand !== 'all' ? filters.brand : null,
    filters.retailer !== 'all' ? filters.retailer : null,
    filters.priceRange !== 'all' ? filters.priceRange : null,
    filters.hasPromos ? 'hasPromos' : null
  ].filter(Boolean).length

  return {
    filters,
    setFilter,
    updateFilters,
    clearFilters,
    resetToDefaults,
    hasActiveFilters,
    filterCount,
    availableCategories,
    availableBrands,
    availableRetailers,
    setAvailableOptions
  }
} 