import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const store = searchParams.get('store') || 'all'
    const status = searchParams.get('status') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build main query from repo_products
    let query = supabaseAdmin
      .from('repo_products')
      .select(`
        gtin,
        id,
        title_original,
        title,
        description,
        image,
        repo_brands:brand_id (
          brand_id,
          name
        ),
        repo_subcategories:subcategory_id (
          subcategory_id,
          name,
          repo_categories:category_id (
            category_id,
            name
          )
        )
      `)

    // Apply search filter
    if (search) {
      query = query.or(`gtin.ilike.%${search}%,title.ilike.%${search}%,title_original.ilike.%${search}%`)
    }

    // Add pagination and ordering
    query = query
      .order('gtin', { ascending: true })
      .range(offset, offset + limit - 1)

    const { data: repoProducts, error } = await query

    if (error) {
      console.error('❌ Product fetch error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Now get pricing data for these products from store-specific tables
    const gtins = repoProducts?.map(p => p.gtin).filter(Boolean) || []
    
    let pricingData: any[] = []
    
    if (gtins.length > 0) {
      // Fetch from different store pricing tables based on filter
      const storeQueries = []
      
      if (store === 'all' || store === 'albert') {
        const albertQuery = supabaseAdmin
          .from('albert_prices')
          .select('gtin, price_current, price_original, is_available, offer_description, last_updated')
          .in('gtin', gtins)
          .then(result => ({ store: 'Albert Heijn', storeCode: 'albert', ...result }))
        storeQueries.push(albertQuery)
      }
      
      if (store === 'all' || store === 'dirk') {
        const dirkQuery = supabaseAdmin
          .from('dirk_prices')
          .select('gtin, price_current, price_original, is_available, offer_description, last_updated')
          .in('gtin', gtins)
          .then(result => ({ store: 'Dirk', storeCode: 'dirk', ...result }))
        storeQueries.push(dirkQuery)
      }
      
      if (store === 'all' || store === 'jumbo') {
        const jumboQuery = supabaseAdmin
          .from('jumbo_prices')
          .select('gtin, price_current, price_promo, is_available, last_updated')
          .in('gtin', gtins)
          .then(result => ({ store: 'Jumbo', storeCode: 'jumbo', ...result }))
        storeQueries.push(jumboQuery)
      }

      const storeResults = await Promise.all(storeQueries)
      
      // Combine all pricing data
      storeResults.forEach(result => {
        if (result.data) {
          result.data.forEach((priceItem: any) => {
            pricingData.push({
              ...priceItem,
              store: result.store,
              storeCode: result.storeCode
            })
          })
        }
      })
    }

    // Transform and combine data
    const products: any[] = []
    
    repoProducts?.forEach((product: any) => {
      // Get pricing for this product from all stores
      const productPrices = pricingData.filter(p => p.gtin === product.gtin)
      
      if (productPrices.length === 0) {
        // No pricing data - show as unavailable
        products.push({
          id: product.gtin,
          title: product.title || product.title_original || 'Unknown Product',
          store: 'N/A',
          storeCode: '',
          gtin: product.gtin,
          category: product.repo_subcategories?.repo_categories?.name || '',
          subCategory: product.repo_subcategories?.name || '',
          price: 0,
          oldPrice: 0,
          discount: 0,
          discountRate: 0,
          brand: product.repo_brands?.name || '',
          status: 'unavailable',
          availability: 'out_of_stock',
          offer: null,
          link: '',
          imagePath: product.image || '',
          lastUpdated: '',
          createdAt: '',
          updatedAt: ''
        })
      } else {
        // Create entry for each store that has this product
        productPrices.forEach((priceData: any) => {
          const currentPrice = parseFloat(priceData.price_current || priceData.price_promo || 0)
          const originalPrice = parseFloat(priceData.price_original || 0)
          const discount = originalPrice > currentPrice ? originalPrice - currentPrice : 0
          const discountRate = originalPrice > 0 ? Math.round((discount / originalPrice) * 100) : 0

          products.push({
            id: `${product.gtin}-${priceData.storeCode}`,
            title: product.title || product.title_original || 'Unknown Product',
            store: priceData.store,
            storeCode: priceData.storeCode,
            gtin: product.gtin,
            category: product.repo_subcategories?.repo_categories?.name || '',
            subCategory: product.repo_subcategories?.name || '',
            price: currentPrice,
            oldPrice: originalPrice,
            discount: discount,
            discountRate: discountRate,
            brand: product.repo_brands?.name || '',
            status: priceData.is_available ? 'available' : 'unavailable',
            availability: priceData.is_available ? 'in_stock' : 'out_of_stock',
            offer: priceData.offer_description || null,
            link: '',
            imagePath: product.image || '',
            lastUpdated: priceData.last_updated?.split('T')[0] || '',
            createdAt: '',
            updatedAt: priceData.last_updated || ''
          })
        })
      }
    })

    // Apply status filter after transformation
    let filteredProducts = products
    if (status === 'available') {
      filteredProducts = products.filter(p => p.status === 'available')
    } else if (status === 'unavailable') {
      filteredProducts = products.filter(p => p.status === 'unavailable')
    }

    // Get total counts for stats
    const totalProductsQuery = await supabaseAdmin
      .from('repo_products')
      .select('gtin', { count: 'exact', head: true })

    const albertCountQuery = await supabaseAdmin
      .from('albert_prices')
      .select('gtin', { count: 'exact', head: true })
      .eq('is_available', true)

    const dirkCountQuery = await supabaseAdmin
      .from('dirk_prices')
      .select('gtin', { count: 'exact', head: true })
      .eq('is_available', true)

    const jumboCountQuery = await supabaseAdmin
      .from('jumbo_prices')
      .select('gtin', { count: 'exact', head: true })
      .eq('is_available', true)

    const stats = {
      totalProducts: totalProductsQuery.count || 0,
      availableProducts: (albertCountQuery.count || 0) + (dirkCountQuery.count || 0) + (jumboCountQuery.count || 0),
      averageDiscount: Math.round(
        filteredProducts.reduce((sum, p) => sum + p.discountRate, 0) / Math.max(filteredProducts.length, 1)
      ),
      pendingReview: filteredProducts.filter(p => p.status === 'unavailable').length
    }

    return NextResponse.json({
      success: true,
      data: {
        products: filteredProducts,
        stats,
        pagination: {
          total: filteredProducts.length,
          limit,
          offset,
          hasMore: (offset + limit) < filteredProducts.length
        }
      }
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET stores for filter dropdown
export async function POST(request: NextRequest) {
  try {
    const stores = [
      { id: 1, identifier: 'albert', name: 'Albert Heijn' },
      { id: 2, identifier: 'dirk', name: 'Dirk' },
      { id: 3, identifier: 'jumbo', name: 'Jumbo' }
    ]

    return NextResponse.json({
      success: true,
      data: { stores }
    })

  } catch (error) {
    console.error('❌ Stores API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 