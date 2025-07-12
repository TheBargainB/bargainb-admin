import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Tables } from '@/types/database.types'

export const dynamic = 'force-dynamic'

// Types for Product Details
interface ProductStoreMatch {
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
  priceHistory: {
    date: string
    price: number
    promoPrice: number | null
    changeAmount: number | null
    changePercentage: number | null
    changeType: string | null
  }[]
}

interface ProductNutrition {
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

interface ProductDetailsResponse {
  success: boolean
  data?: {
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
    category: {
      id: string
      level1: string | null
      level2: string | null
      level3: string | null
      level4: string | null
      path: string
    } | null
    manufacturer: {
      id: string
      name: string
      address: string | null
      website: string | null
    } | null
    
    // Variant Information
    isVariant: boolean
    variantGroupId: string | null
    
    // Media
    images: {
      id: string
      url: string
      size: string | null
      source: string | null
    }[]
    
    // Store Matches & Pricing
    storeMatches: ProductStoreMatch[]
    pricingSummary: {
      totalStores: number
      minPrice: number | null
      maxPrice: number | null
      avgPrice: number | null
      cheapestStore: string | null
      mostExpensiveStore: string | null
      hasPromotions: boolean
      promotionCount: number
    }
    
    // Additional Data
    nutrition: ProductNutrition | null
    ingredients: string[]
    features: string[]
    additives: string | null
    preparationUsage: string | null
    storageInfo: string | null
    recyclingInfo: string | null
    
    // Debug Info
    debugInfo: {
      source: string | null
      embedding: boolean
      createdAt: string
      updatedAt: string | null
      matchingStats: {
        totalMatches: number
        highConfidenceMatches: number
        gtinMatches: number
        titleMatches: number
        fuzzyMatches: number
      }
    }
  }
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params

    // Get core product data
    const { data: productData, error: productError } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        categories(id, level_1, level_2, level_3, level_4),
        manufacturers(id, name, address, website),
        images(id, url, size, source),
        nutrition(
          energy_kcal, energy_kj, fat, saturated_fat, carbohydrates, 
          sugars, fiber, proteins, salt, sodium, polyols
        ),
        ingredients(ingredient),
        features(feature)
      `)
      .eq('id', productId)
      .single()

    if (productError || !productData) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get store matches with pricing
    const { data: storeMatchesData } = await supabaseAdmin
      .from('store_products')
      .select(`
        id,
        store_product_id,
        title,
        canonical_url,
        image_url,
        match_method,
        match_confidence,
        is_available,
        stores!inner(id, name, slug, logo_url),
        store_prices!inner(
          price,
          promo_price,
          price_per_unit,
          price_unit,
          normalized_price_per_kg,
          normalized_price_per_l,
          normalized_price_per_piece,
          valid_from,
          valid_to
        )
      `)
      .eq('product_id', productId)
      .order('match_confidence', { ascending: false })

    // Get price history for each store match
    const storeMatches: ProductStoreMatch[] = []
    
    if (storeMatchesData) {
      for (const storeMatch of storeMatchesData) {
        const { data: priceHistoryData } = await supabaseAdmin
          .from('price_history')
          .select(`
            price,
            promo_price,
            price_change_amount,
            price_change_percentage,
            price_change_type,
            valid_from
          `)
          .eq('store_product_id', storeMatch.id)
          .order('valid_from', { ascending: false })
          .limit(10)

        const currentPrice = storeMatch.store_prices?.[0]
        
        storeMatches.push({
          storeId: storeMatch.stores.id,
          storeName: storeMatch.stores.name,
          storeSlug: storeMatch.stores.slug,
          storeLogoUrl: storeMatch.stores.logo_url,
          storeProductId: storeMatch.store_product_id,
          storeProductTitle: storeMatch.title,
          storeProductUrl: storeMatch.canonical_url,
          storeProductImage: storeMatch.image_url,
          matchMethod: storeMatch.match_method,
          matchConfidence: storeMatch.match_confidence,
          isAvailable: storeMatch.is_available ?? true,
          currentPrice: currentPrice?.price || null,
          promoPrice: currentPrice?.promo_price || null,
          pricePerUnit: currentPrice?.price_per_unit || null,
          priceUnit: currentPrice?.price_unit || null,
          normalizedPrices: {
            perKg: currentPrice?.normalized_price_per_kg || null,
            perL: currentPrice?.normalized_price_per_l || null,
            perPiece: currentPrice?.normalized_price_per_piece || null
          },
          priceHistory: (priceHistoryData || []).map(ph => ({
            date: ph.valid_from,
            price: ph.price,
            promoPrice: ph.promo_price,
            changeAmount: ph.price_change_amount,
            changePercentage: ph.price_change_percentage,
            changeType: ph.price_change_type
          }))
        })
      }
    }

    // Calculate pricing summary
    const prices = storeMatches.flatMap(sm => sm.currentPrice ? [sm.currentPrice] : [])
    const promotions = storeMatches.filter(sm => sm.promoPrice)
    const cheapestMatch = storeMatches.find(sm => sm.currentPrice === Math.min(...prices))
    const mostExpensiveMatch = storeMatches.find(sm => sm.currentPrice === Math.max(...prices))

    const pricingSummary = {
      totalStores: storeMatches.length,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      maxPrice: prices.length > 0 ? Math.max(...prices) : null,
      avgPrice: prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : null,
      cheapestStore: cheapestMatch?.storeName || null,
      mostExpensiveStore: mostExpensiveMatch?.storeName || null,
      hasPromotions: promotions.length > 0,
      promotionCount: promotions.length
    }

    // Calculate matching stats
    const matchingStats = {
      totalMatches: storeMatches.length,
      highConfidenceMatches: storeMatches.filter(sm => (sm.matchConfidence || 0) > 0.8).length,
      gtinMatches: storeMatches.filter(sm => sm.matchMethod === 'gtin').length,
      titleMatches: storeMatches.filter(sm => sm.matchMethod === 'title').length,
      fuzzyMatches: storeMatches.filter(sm => sm.matchMethod === 'fuzzy').length
    }

    // Build category path
    const categoryPath = productData.categories ? 
      [
        productData.categories.level_1,
        productData.categories.level_2,
        productData.categories.level_3,
        productData.categories.level_4
      ].filter(Boolean).join(' → ') : ''

    const response: ProductDetailsResponse = {
      success: true,
      data: {
        // Core Product Info
        id: productData.id,
        title: productData.title,
        gtin: productData.gtin,
        brand: productData.brand,
        regulatedProductName: productData.regulated_product_name,
        description: productData.description,
        quantity: productData.quantity,
        servingSize: productData.serving_size,
        servingUnit: productData.serving_unit,
        unitAmount: productData.unit_amount,
        unit: productData.unit,
        pkQty: productData.pk_qty,
        pkAmount: productData.pk_amount,
        
        // Classification
        category: productData.categories ? {
          id: productData.categories.id,
          level1: productData.categories.level_1,
          level2: productData.categories.level_2,
          level3: productData.categories.level_3,
          level4: productData.categories.level_4,
          path: categoryPath
        } : null,
        manufacturer: productData.manufacturers ? {
          id: productData.manufacturers.id,
          name: productData.manufacturers.name,
          address: productData.manufacturers.address,
          website: productData.manufacturers.website
        } : null,
        
        // Variant Information
        isVariant: productData.is_variant || false,
        variantGroupId: productData.variant_group_id,
        
        // Media
        images: (productData.images || []).map(img => ({
          id: img.id,
          url: img.url,
          size: img.size,
          source: img.source
        })),
        
        // Store Matches & Pricing
        storeMatches,
        pricingSummary,
        
        // Additional Data
        nutrition: productData.nutrition ? {
          energyKcal: productData.nutrition.energy_kcal,
          energyKj: productData.nutrition.energy_kj,
          fat: productData.nutrition.fat,
          saturatedFat: productData.nutrition.saturated_fat,
          carbohydrates: productData.nutrition.carbohydrates,
          sugars: productData.nutrition.sugars,
          fiber: productData.nutrition.fiber,
          proteins: productData.nutrition.proteins,
          salt: productData.nutrition.salt,
          sodium: productData.nutrition.sodium,
          polyols: productData.nutrition.polyols
        } : null,
        ingredients: (productData.ingredients || []).map(ing => ing.ingredient),
        features: (productData.features || []).map(feat => feat.feature),
        additives: productData.additives,
        preparationUsage: productData.preparation_usage,
        storageInfo: productData.storage_info,
        recyclingInfo: productData.recycling_info,
        
        // Debug Info
        debugInfo: {
          source: productData.source,
          embedding: !!productData.embedding,
          createdAt: productData.created_at || '',
          updatedAt: productData.updated_at,
          matchingStats
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Product Details API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 