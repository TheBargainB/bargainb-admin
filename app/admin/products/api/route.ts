import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build main query from products table
    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        manufacturers (
          id,
          name
        ),
        categories (
          id,
          level_1,
          level_2,
          level_3,
          level_4
        ),
        images (
          url
        )
      `)

    // Apply search filter
    if (search) {
      query = query.or(`gtin.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply category filter
    if (category !== 'all') {
      query = query.eq('category_id', parseInt(category))
    }

    // Add pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: products, error } = await query

    if (error) {
      console.error('❌ Product fetch error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Transform the products data
    const transformedProducts = products?.map(product => ({
      id: product.id,
      title: product.title,
      gtin: product.gtin,
      brand: product.manufacturers?.name || '',
      category: product.categories?.level_1 || '',
      subCategory: product.categories?.level_2 || '',
      description: product.description,
      image: product.images?.[0]?.url,
      additives: product.additives,
      preparation: product.preparation_usage,
      storage: product.storage_info,
      recycling: product.recycling_info,
      status: product.is_variant ? 'variant' : 'base',
      createdAt: product.created_at,
      updatedAt: product.created_at // Use created_at since updated_at doesn't exist
    })) || []

    // Get total counts for stats
    const totalProductsQuery = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })

    const noGtinQuery = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .is('gtin', null)

    // Count products without images by checking for products that don't have matching images
    const noImagesQuery = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .not('gtin', 'is', null) // Only count products that have a GTIN
      .not('gtin', 'in', 
        supabaseAdmin
          .from('images')
          .select('distinct gtin')
          .not('gtin', 'is', null)
      )

    const noDescriptionQuery = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .is('description', null)

    const totalProducts = totalProductsQuery.count || 0

    const stats = {
      totalProducts,
      noGtin: noGtinQuery.count || 0,
      noImages: noImagesQuery.count || 0,
      noDescription: noDescriptionQuery.count || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        products: transformedProducts,
        stats,
        pagination: {
          total: totalProducts,
          limit,
          offset,
          hasMore: (offset + limit) < totalProducts
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

// GET categories for filter dropdown
export async function POST(request: NextRequest) {
  try {
    // Get all unique categories from products table
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        categories (
          id,
          level_1
        )
      `)
      .not('categories.level_1', 'is', null)

    if (error) throw error

    // Extract categories and deduplicate by name
    const categoriesMap = new Map()
    products?.forEach(product => {
      if (product.categories && product.categories.level_1) {
        const category = product.categories
        const normalizedName = category.level_1?.trim().toLowerCase()
        
        // Only keep one instance of each category name
        if (normalizedName && !categoriesMap.has(normalizedName)) {
          categoriesMap.set(normalizedName, {
            id: category.id.toString(),
            level_1: category.level_1?.trim() || ''
          })
        }
      }
    })

    const uniqueCategories = Array.from(categoriesMap.values())
      .sort((a, b) => a.level_1.toLowerCase().localeCompare(b.level_1.toLowerCase()))

    return NextResponse.json({
      success: true,
      data: { categories: uniqueCategories }
    })

  } catch (error) {
    console.error('❌ Categories API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 