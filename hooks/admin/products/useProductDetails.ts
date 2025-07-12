'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import type {
  UseProductDetailsResult,
  ProductDetails,
  ProductDetailsResponse
} from '@/types/products.types'

export const useProductDetails = (): UseProductDetailsResult => {
  const [product, setProduct] = useState<ProductDetails | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()

  const fetchProductDetails = useCallback(async (productId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/products/${productId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ProductDetailsResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch product details')
      }

      if (data.data) {
        setProduct(data.data)
      }

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
  }, [toast])

  const clearProduct = useCallback(() => {
    setProduct(null)
    setError(null)
  }, [])

  const refreshProduct = useCallback(async () => {
    if (product?.id) {
      await fetchProductDetails(product.id)
    }
  }, [product?.id, fetchProductDetails])

  return {
    // Data
    product,
    
    // State
    loading,
    error,
    
    // Actions
    fetchProductDetails,
    clearProduct,
    refreshProduct
  }
} 