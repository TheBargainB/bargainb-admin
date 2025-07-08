import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Database } from '@/types/database.types'

type Product = Database['public']['Tables']['products']['Row']
type Manufacturer = Database['public']['Tables']['manufacturers']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type Nutrition = Database['public']['Tables']['nutrition']['Row']
type Image = Database['public']['Tables']['images']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']

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

    // If we have multiple products, prefer the base product over variants
    const { data: products, error: productError } = await supabaseAdmin
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
        nutrition (*),
        images (*),
        ingredients (*)
      `)
      .eq('gtin', gtin)
      .order('is_variant', { ascending: true }) // Put base products first
      .limit(1) // Take only the first one

    if (productError) {
      console.error('❌ Product details fetch error:', productError)
      return NextResponse.json(
        { success: false, error: productError.message },
        { status: 404 }
      )
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    const productData = products[0] as Product & {
      manufacturers: Manufacturer | null
      categories: Category | null
      nutrition: Nutrition | null
      images: Image[]
      ingredients: Ingredient[]
    }

    // Transform the data into a more friendly format
    const details = {
      id: productData.id,
      gtin: productData.gtin,
      title: productData.title,
      description: productData.description,
      brand: productData.manufacturers?.name || '',
      category: productData.categories?.level_1 || '',
      subCategory: productData.categories?.level_2 || '',
      image: productData.images?.[0]?.url || '',
      nutrition: productData.nutrition || null,
      ingredients: productData.ingredients?.map(i => i.ingredient) || [],
      additives: productData.additives,
      preparation: productData.preparation_usage,
      storage: productData.storage_info,
      recycling: productData.recycling_info
    }

    return NextResponse.json({
      success: true,
      data: { details }
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 