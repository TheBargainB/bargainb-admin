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
import { Copy, ExternalLink, Package, TrendingUp, Store, Clock, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  title: string
  store: string
  storeCode: string
  gtin: string
  category: string
  subCategory: string
  price: number
  oldPrice: number
  discount: number
  discountRate: number
  brand: string
  status: 'available' | 'unavailable'
  availability: 'in_stock' | 'out_of_stock'
  offer: string | null
  link: string
  imagePath: string
  lastUpdated: string
}

interface ProductDetails {
  gtin: string
  title: string
  titleOriginal?: string
  description?: string
  brand?: string
  category?: string
  subCategory?: string
  image?: string
}

interface StorePricing {
  store: string
  storeCode: string
  price: number
  oldPrice?: number
  isAvailable: boolean
  offer?: string | null
  lastUpdated: string
  discountRate: number
}

interface ProductDetailsModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusColors = {
  available: "bg-green-100 text-green-800",
  unavailable: "bg-red-100 text-red-800",
}

const storeColors: Record<string, string> = {
  albert: "bg-blue-100 text-blue-800",
  dirk: "bg-orange-100 text-orange-800", 
  jumbo: "bg-yellow-100 text-yellow-800",
}

export const ProductDetailsModal = ({ product, open, onOpenChange }: ProductDetailsModalProps) => {
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null)
  const [storePricing, setStorePricing] = useState<StorePricing[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchProductDetails = async (gtin: string) => {
    try {
      setLoading(true)
      
      // Fetch detailed product info and pricing from all stores
      const response = await fetch(`/admin/products/api/details?gtin=${gtin}`)
      const result = await response.json()

      if (result.success) {
        setProductDetails(result.data.details)
        setStorePricing(result.data.pricing)
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

  const getBestPrice = () => {
    if (storePricing.length === 0) return null
    return storePricing
      .filter(p => p.isAvailable)
      .sort((a, b) => a.price - b.price)[0]
  }

  const getWorstPrice = () => {
    if (storePricing.length === 0) return null
    return storePricing
      .filter(p => p.isAvailable)
      .sort((a, b) => b.price - a.price)[0]
  }

  if (!product) return null

  const bestPrice = getBestPrice()
  const worstPrice = getWorstPrice()
  const priceDifference = bestPrice && worstPrice ? worstPrice.price - bestPrice.price : 0

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
              <TabsTrigger value="pricing">Store Pricing</TabsTrigger>
              <TabsTrigger value="details">Product Details</TabsTrigger>
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
                      {productDetails?.titleOriginal && productDetails.titleOriginal !== productDetails.title && (
                        <p className="text-sm text-muted-foreground">
                          Original: {productDetails.titleOriginal}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {product.gtin}
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleCopyGtin}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
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

                {/* Price Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Price Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Best Price</p>
                        {bestPrice ? (
                          <div>
                            <p className="text-lg font-semibold text-green-600">
                              €{bestPrice.price.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">{bestPrice.store}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">N/A</p>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Highest Price</p>
                        {worstPrice ? (
                          <div>
                            <p className="text-lg font-semibold text-red-600">
                              €{worstPrice.price.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">{worstPrice.store}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">N/A</p>
                        )}
                      </div>
                    </div>

                    {priceDifference > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">Price Difference</p>
                        <p className="text-lg font-semibold text-orange-600">
                          €{priceDifference.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Save {((priceDifference / worstPrice!.price) * 100).toFixed(1)}% by choosing the best price
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Available Stores</p>
                      <p className="text-lg font-semibold">
                        {storePricing.filter(p => p.isAvailable).length} / {storePricing.length}
                      </p>
                    </div>
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

            <TabsContent value="pricing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Store Pricing Comparison
                  </CardTitle>
                  <CardDescription>
                    Compare prices across all stores where this product is available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {storePricing.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Store</TableHead>
                          <TableHead>Current Price</TableHead>
                          <TableHead>Original Price</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Special Offer</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {storePricing.map((pricing) => (
                          <TableRow key={pricing.storeCode}>
                            <TableCell>
                              <Badge className={storeColors[pricing.storeCode] || "bg-gray-100 text-gray-800"}>
                                {pricing.store}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={`font-semibold ${
                                pricing === bestPrice ? 'text-green-600' :
                                pricing === worstPrice ? 'text-red-600' : ''
                              }`}>
                                €{pricing.price.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {pricing.oldPrice && pricing.oldPrice !== pricing.price ? (
                                <span className="text-muted-foreground line-through">
                                  €{pricing.oldPrice.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {pricing.discountRate > 0 ? (
                                <Badge variant="outline" className="text-green-600">
                                  {pricing.discountRate}% off
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={pricing.isAvailable ? statusColors.available : statusColors.unavailable}>
                                {pricing.isAvailable ? 'Available' : 'Unavailable'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {pricing.offer ? (
                                <span className="text-sm">{pricing.offer}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {pricing.lastUpdated || 'Unknown'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {pricing.isAvailable && (
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No pricing data available for this product.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Details</CardTitle>
                  <CardDescription>
                    Raw product information and metadata
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Identifiers</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>GTIN:</strong> {product.gtin}</p>
                        <p><strong>Product ID:</strong> {product.id}</p>
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

                  <div className="space-y-2">
                    <h4 className="font-semibold">Titles</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Display Title:</strong> {productDetails?.title || product.title}</p>
                      {productDetails?.titleOriginal && (
                        <p><strong>Original Title:</strong> {productDetails.titleOriginal}</p>
                      )}
                    </div>
                  </div>

                  {productDetails?.description && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold">Description</h4>
                        <p className="text-sm">{productDetails.description}</p>
                      </div>
                    </>
                  )}

                  {productDetails?.image && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold">Image URL</h4>
                        <p className="text-sm font-mono break-all">{productDetails.image}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
} 