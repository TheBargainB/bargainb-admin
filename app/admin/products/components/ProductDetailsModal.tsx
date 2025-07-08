"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Copy, Package, Info, Leaf, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  title: string
  gtin: string
  category: string
  subCategory: string
  brand: string
  description: string
  image: string
  additives: string | null
  preparation: string | null
  storage: string | null
  recycling: string | null
  status: 'variant' | 'base'
  createdAt: string
  updatedAt: string
}

interface ProductDetails {
  gtin: string
  id: string
  title: string
  description: string
  brand: string
  category: string
  subCategory: string
  image: string
  nutrition: {
    energy_kcal: number
    energy_kj: number
    fat: number
    saturated_fat: number
    carbohydrates: number
    sugars: number
    protein: number
    salt: number
  } | null
  ingredients: string[]
  features: string[]
  additives: string | null
  preparation: string | null
  storage: string | null
  recycling: string | null
}

interface ProductDetailsModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusColors = {
  variant: "bg-purple-100 text-purple-800",
  base: "bg-blue-100 text-blue-800",
}

export const ProductDetailsModal = ({ product, open, onOpenChange }: ProductDetailsModalProps) => {
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchProductDetails = async (gtin: string) => {
    try {
      setLoading(true)
      
      const response = await fetch(`/admin/products/api/details?gtin=${gtin}`)
      const result = await response.json()

      if (result.success) {
        setProductDetails(result.data.details)
      } else {
        throw new Error(result.error || 'Failed to fetch product details')
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error)
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (product && open) {
      fetchProductDetails(product.gtin)
    }
  }, [product, open])

  const handleCopyGtin = () => {
    if (product) {
      navigator.clipboard.writeText(product.gtin)
      toast({
        title: "Copied!",
        description: "GTIN copied to clipboard",
      })
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive information for {product.title}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading product details...</span>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition & Ingredients</TabsTrigger>
              <TabsTrigger value="details">Additional Info</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Image & Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {productDetails?.image && (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img 
                          src={productDetails.image} 
                          alt={productDetails.title}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                        <div className="hidden text-muted-foreground text-sm">No image available</div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold">{productDetails?.title || product.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {product.gtin}
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleCopyGtin}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <Badge className={statusColors[product.status]}>
                        {product.status === 'variant' ? 'Variant Product' : 'Base Product'}
                      </Badge>
                      {productDetails?.brand && (
                        <p className="text-sm"><strong>Brand:</strong> {productDetails.brand}</p>
                      )}
                      {productDetails?.category && (
                        <p className="text-sm"><strong>Category:</strong> {productDetails.category}</p>
                      )}
                      {productDetails?.subCategory && (
                        <p className="text-sm"><strong>Subcategory:</strong> {productDetails.subCategory}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Features & Storage */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Product Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {productDetails?.features && productDetails.features.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Key Features</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {productDetails.features.map((feature, index) => (
                            <li key={index} className="text-sm">{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {productDetails?.storage && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Storage Information</h4>
                        <p className="text-sm">{productDetails.storage}</p>
                      </div>
                    )}

                    {productDetails?.preparation && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Preparation</h4>
                        <p className="text-sm">{productDetails.preparation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              {productDetails?.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{productDetails.description}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    Nutrition Information
                  </CardTitle>
                  <CardDescription>
                    Nutritional values and ingredients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {productDetails?.nutrition && (
                    <div className="space-y-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nutrient</TableHead>
                            <TableHead>Per 100g/ml</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Energy</TableCell>
                            <TableCell>
                              {productDetails.nutrition.energy_kcal} kcal / {productDetails.nutrition.energy_kj} kJ
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Fat</TableCell>
                            <TableCell>{productDetails.nutrition.fat}g</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="pl-8">of which saturates</TableCell>
                            <TableCell>{productDetails.nutrition.saturated_fat}g</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Carbohydrates</TableCell>
                            <TableCell>{productDetails.nutrition.carbohydrates}g</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="pl-8">of which sugars</TableCell>
                            <TableCell>{productDetails.nutrition.sugars}g</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Protein</TableCell>
                            <TableCell>{productDetails.nutrition.protein}g</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Salt</TableCell>
                            <TableCell>{productDetails.nutrition.salt}g</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {(!productDetails?.nutrition && !productDetails?.ingredients?.length) && (
                    <p className="text-center text-muted-foreground py-4">
                      No nutrition information available for this product.
                    </p>
                  )}

                  {productDetails?.ingredients && productDetails.ingredients.length > 0 && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-2">
                        <h4 className="font-semibold">Ingredients</h4>
                        <p className="text-sm">{productDetails.ingredients.join(', ')}</p>
                      </div>
                    </>
                  )}

                  {productDetails?.additives && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-2">
                        <h4 className="font-semibold">Additives</h4>
                        <p className="text-sm">{productDetails.additives}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Details</CardTitle>
                  <CardDescription>
                    Additional product information and metadata
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Identifiers</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>GTIN:</strong> {product.gtin}</p>
                        <p><strong>Product ID:</strong> {product.id}</p>
                        <p><strong>Status:</strong> {product.status}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold">Classification</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Brand:</strong> {productDetails?.brand || 'N/A'}</p>
                        <p><strong>Category:</strong> {productDetails?.category || 'N/A'}</p>
                        <p><strong>Subcategory:</strong> {productDetails?.subCategory || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {productDetails?.recycling && (
                    <>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Recycling Information</h4>
                        <p className="text-sm">{productDetails.recycling}</p>
                      </div>
                      <Separator />
                    </>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-semibold">Timestamps</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Created:</strong> {new Date(product.createdAt).toLocaleString()}</p>
                      <p><strong>Last Updated:</strong> {new Date(product.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
} 