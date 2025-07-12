'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { ProductFilters } from '@/types/products.types'

interface UseProductsSearchResult {
  searchQuery: string
  setSearchQuery: (query: string) => void
  debouncedSearchQuery: string
  isSearching: boolean
  clearSearch: () => void
  searchHistory: string[]
  addToHistory: (query: string) => void
  clearHistory: () => void
}

const SEARCH_DEBOUNCE_MS = 300
const MAX_SEARCH_HISTORY = 10

export const useProductsSearch = (
  onSearchChange?: (query: string) => void
): UseProductsSearchResult => {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('bargainb-search-history')
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        if (Array.isArray(parsed)) {
          setSearchHistory(parsed)
        }
      } catch (error) {
        console.error('Failed to parse search history:', error)
      }
    }
  }, [])

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bargainb-search-history', JSON.stringify(searchHistory))
  }, [searchHistory])

  // Debounce search query
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (searchQuery.trim() === '') {
      setDebouncedSearchQuery('')
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    
    debounceRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim())
      setIsSearching(false)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchQuery])

  // Call onSearchChange when debounced query changes
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, onSearchChange])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setDebouncedSearchQuery('')
    setIsSearching(false)
  }, [])

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== query.trim())
      const newHistory = [query.trim(), ...filtered]
      return newHistory.slice(0, MAX_SEARCH_HISTORY)
    })
  }, [])

  const clearHistory = useCallback(() => {
    setSearchHistory([])
    localStorage.removeItem('bargainb-search-history')
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isSearching,
    clearSearch,
    searchHistory,
    addToHistory,
    clearHistory
  }
} 