import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gtin = searchParams.get('gtin')

    if (!gtin) {
      return NextResponse.json(
        { success: false, error: 'GTIN parameter is required' },
        { status: 400 }
      )
    }

    // Fetch product details from repo_products
    const { data: productData, error: productError } = await supabaseAdmin
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
      .eq('gtin', gtin)
      .single()

    if (productError) {
      console.error('❌ Product details fetch error:', productError)
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Fetch pricing from all store tables
    const pricingQueries = [
      supabaseAdmin
        .from('albert_prices')
        .select('gtin, price_current, price_original, is_available, offer_description, last_updated')
        .eq('gtin', gtin)
        .then(result => ({ store: 'Albert Heijn', storeCode: 'albert', ...result })),
      
      supabaseAdmin
        .from('dirk_prices')
        .select('gtin, price_current, price_original, is_available, offer_description, last_updated')
        .eq('gtin', gtin)
        .then(result => ({ store: 'Dirk', storeCode: 'dirk', ...result })),
      
      supabaseAdmin
        .from('jumbo_prices')
        .select('gtin, price_current, price_promo, is_available, last_updated')
        .eq('gtin', gtin)
        .then(result => ({ store: 'Jumbo', storeCode: 'jumbo', ...result }))
    ]

    const storeResults = await Promise.all(pricingQueries)
    
    // Process pricing data
    const pricingData: any[] = []
    
    storeResults.forEach(result => {
      if (result.data && result.data.length > 0) {
        result.data.forEach((priceItem: any) => {
          const currentPrice = parseFloat(priceItem.price_current || priceItem.price_promo || 0)
          const originalPrice = parseFloat(priceItem.price_original || 0)
          const discount = originalPrice > currentPrice ? originalPrice - currentPrice : 0
          const discountRate = originalPrice > 0 ? Math.round((discount / originalPrice) * 100) : 0

          pricingData.push({
            gtin: priceItem.gtin,
            store: result.store,
            storeCode: result.storeCode,
            price: currentPrice,
            oldPrice: originalPrice > 0 ? originalPrice : undefined,
            isAvailable: priceItem.is_available || false,
            offer: priceItem.offer_description || null,
            lastUpdated: priceItem.last_updated?.split('T')[0] || '',
            discountRate: discountRate
          })
        })
      }
    })

    // Transform product details
    const details = {
      gtin: productData.gtin,
      title: productData.title || productData.title_original,
      titleOriginal: productData.title_original,
      description: productData.description,
      brand: productData.repo_brands?.name,
      category: productData.repo_subcategories?.repo_categories?.name,
      subCategory: productData.repo_subcategories?.name,
      image: productData.image
    }

    return NextResponse.json({
      success: true,
      data: {
        details,
        pricing: pricingData
      }
    })

  } catch (error) {
    console.error('❌ Product details API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 