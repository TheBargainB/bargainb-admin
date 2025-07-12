import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Tables } from '@/types/database.types'

export const dynamic = 'force-dynamic'

// Types for the CEO Dashboard
interface ProductsOverviewStats {
  totalProducts: number
  totalStoreProducts: number
  totalRetailers: number
  activePrices: number
  priceCoverage: number
  gtinCoverage: number
  promotionalItems: number
  avgPrice: number
}

interface RetailerBreakdown {
  retailer: string
  productCount: number
  avgPrice: number
  promoCount: number
  priceCoverage: number
}

interface CategoryBreakdown {
  category: string
  productCount: number
  avgPrice: number
  level: number
}

interface MasterProduct {
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

interface APIResponse {
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

const PRODUCTS_PER_PAGE = 25

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const brand = searchParams.get('brand') || 'all'
    const retailer = searchParams.get('retailer') || 'all'
    const priceRange = searchParams.get('priceRange') || 'all'
    const hasPromos = searchParams.get('hasPromos') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || PRODUCTS_PER_PAGE.toString())
    const offset = (page - 1) * limit

    // Get overall stats
    const [
      totalProductsResult,
      totalStoreProductsResult,
      totalRetailersResult,
      activePricesResult,
      gtinCoverageResult,
      promotionalItemsResult,
      avgPriceResult
    ] = await Promise.all([
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('store_products').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('stores').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('store_prices').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('products').select('gtin', { count: 'exact', head: true }).not('gtin', 'is', null),
      supabaseAdmin.from('store_prices').select('id', { count: 'exact', head: true }).not('promo_price', 'is', null),
      supabaseAdmin.from('store_prices').select('price').range(0, 999)
    ])

    const totalProducts = totalProductsResult.count || 0
    const totalStoreProducts = totalStoreProductsResult.count || 0
    const totalRetailers = totalRetailersResult.count || 0
    const activePrices = activePricesResult.count || 0
    const gtinCoverage = totalProducts > 0 ? ((gtinCoverageResult.count || 0) / totalProducts) * 100 : 0
    const promotionalItems = promotionalItemsResult.count || 0
    const avgPrice = avgPriceResult.data?.length ? 
      avgPriceResult.data.reduce((sum, item) => sum + item.price, 0) / avgPriceResult.data.length : 0
    const priceCoverage = totalStoreProducts > 0 ? (activePrices / totalStoreProducts) * 100 : 0

    const stats: ProductsOverviewStats = {
      totalProducts,
      totalStoreProducts,
      totalRetailers,
      activePrices,
      priceCoverage,
      gtinCoverage,
      promotionalItems,
      avgPrice
    }

    // Get retailer breakdown using optimized function
    const retailerBreakdownQuery = await supabaseAdmin.rpc('get_retailer_breakdown' as any)
    
    const retailers: RetailerBreakdown[] = retailerBreakdownQuery.data?.map((item: any) => ({
      retailer: item.retailer,
      productCount: item.product_count,
      avgPrice: parseFloat(item.avg_price || '0'),
      promoCount: item.promo_count,
      priceCoverage: item.price_count > 0 ? (item.price_count / item.product_count) * 100 : 0
    })) || []

    // Get comprehensive category breakdown with all levels
    const categoryQuery = await supabaseAdmin
      .from('products')
      .select(`
        id,
        categories!inner(level_1, level_2, level_3, level_4),
        store_products!inner(
          store_prices!inner(price)
        )
      `)
      .not('categories.level_1', 'is', null)

    const categoryMap = new Map<string, {
      category: string
      subCategory: string | null
      productCount: number
      prices: number[]
      level: number
    }>()

    categoryQuery.data?.forEach(product => {
      const category = product.categories
      const prices = product.store_products?.flatMap(sp => sp.store_prices?.map(spr => spr.price) || []) || []
      
      // Level 1 categories
      if (category.level_1) {
        const key = `${category.level_1}|1`
        const existing = categoryMap.get(key)
        if (existing) {
          existing.productCount += 1
          existing.prices.push(...prices)
        } else {
          categoryMap.set(key, {
            category: category.level_1,
            subCategory: null,
            productCount: 1,
            prices: [...prices],
            level: 1
          })
        }
      }

      // Level 2 categories (subcategories)
      if (category.level_1 && category.level_2) {
        const key = `${category.level_1}|${category.level_2}|2`
        const existing = categoryMap.get(key)
        if (existing) {
          existing.productCount += 1
          existing.prices.push(...prices)
        } else {
          categoryMap.set(key, {
            category: category.level_1,
            subCategory: category.level_2,
            productCount: 1,
            prices: [...prices],
            level: 2
          })
        }
      }

      // Level 3 categories
      if (category.level_1 && category.level_2 && category.level_3) {
        const key = `${category.level_1}|${category.level_2}|${category.level_3}|3`
        const existing = categoryMap.get(key)
        if (existing) {
          existing.productCount += 1
          existing.prices.push(...prices)
        } else {
          categoryMap.set(key, {
            category: category.level_1,
            subCategory: `${category.level_2} → ${category.level_3}`,
            productCount: 1,
            prices: [...prices],
            level: 3
          })
        }
      }
    })

    const categories: CategoryBreakdown[] = Array.from(categoryMap.values())
      .map(cat => ({
        category: cat.subCategory ? `${cat.category} → ${cat.subCategory}` : cat.category,
        productCount: cat.productCount,
        avgPrice: cat.prices.length > 0 ? cat.prices.reduce((sum, price) => sum + price, 0) / cat.prices.length : 0,
        level: cat.level
      }))
      .sort((a, b) => b.productCount - a.productCount) // Sort by product count descending

    // Build main products query - simplified to ensure proper image loading
    let productsQuery = supabaseAdmin
      .from('products')
      .select(`
        id,
        title,
        gtin,
        brand,
        quantity,
        unit_amount,
        unit,
        is_variant,
        variant_group_id,
        description,
        created_at,
        updated_at,
        categories(level_1, level_2, level_3, level_4),
        manufacturers(name),
        images(id, url, size, source)
      `)

    // Apply filters
    if (search) {
      productsQuery = productsQuery.or(`title.ilike.%${search}%,gtin.ilike.%${search}%,brand.ilike.%${search}%`)
    }

    if (category !== 'all') {
      productsQuery = productsQuery.eq('categories.level_1', category)
    }

    if (brand !== 'all') {
      productsQuery = productsQuery.eq('brand', brand)
    }

    // Execute query with pagination
    const { data: productsData, error: productsError } = await productsQuery
      .range(offset, offset + limit - 1)

    if (productsError) {
      console.error('❌ Products query error:', productsError)
      return NextResponse.json({ success: false, error: productsError.message }, { status: 500 })
    }



    // Get store data for the products
    const productIds = (productsData || []).map((p: any) => p.id)
    const { data: storeData } = await supabaseAdmin
      .from('store_products')
      .select(`
        product_id,
        store_id,
        stores!inner(name),
        store_prices!inner(price, promo_price)
      `)
      .in('product_id', productIds)

    // Create a map of store data by product ID
    const storeDataMap = new Map()
    storeData?.forEach((sp: any) => {
      if (!storeDataMap.has(sp.product_id)) {
        storeDataMap.set(sp.product_id, [])
      }
      storeDataMap.get(sp.product_id).push(sp)
    })

    // Transform products data with safer deduplication
    const products: MasterProduct[] = (productsData || []).map((product: any) => {
      const storeProducts = storeDataMap.get(product.id) || []
      const prices = storeProducts.flatMap((sp: any) => sp.store_prices || []).map((sp: any) => sp.price)
      const promos = storeProducts.flatMap((sp: any) => sp.store_prices || []).filter((sp: any) => sp.promo_price)
      

      
      return {
        id: product.id,
        title: product.title,
        gtin: product.gtin,
        brand: product.brand,
        category: product.categories?.level_1 || null,
        categoryPath: product.categories ? 
          [product.categories.level_1, product.categories.level_2, product.categories.level_3, product.categories.level_4]
            .filter(Boolean).join(' → ') : null,
        description: product.description,
        quantity: product.quantity,
        unitAmount: product.unit_amount,
        unit: product.unit,
        isVariant: product.is_variant,
        variantGroupId: product.variant_group_id,
        manufacturer: product.manufacturers?.name || null,
        imageUrl: product.images?.[0]?.url || null,
        matchedRetailers: [...new Set(storeProducts.map((sp: any) => sp.store_id))].length,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        maxPrice: prices.length > 0 ? Math.max(...prices) : null,
        avgPrice: prices.length > 0 ? prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length : null,
        hasPromos: promos.length > 0,
        createdAt: product.created_at || '',
        updatedAt: product.updated_at
      }
    })

    const response: APIResponse = {
      success: true,
      data: {
        stats,
        products,
        retailers, // All retailers, sorted by product count
        categories, // All categories, sorted by product count
        pagination: {
          total: totalProducts,
          page,
          limit,
          hasMore: offset + limit < totalProducts
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Products API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 