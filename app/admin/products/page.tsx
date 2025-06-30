"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Search, MoreHorizontal, Package, RefreshCw, Download, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { ProductDetailsModal } from "./components/ProductDetailsModal"

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

interface ProductStats {
  totalProducts: number
  availableProducts: number
  averageDiscount: number
  pendingReview: number
}

interface Store {
  id: number
  identifier: string
  name: string
}

const statusColors = {
  available: "bg-green-100 text-green-800",
  unavailable: "bg-red-100 text-red-800",
}

const availabilityColors = {
  in_stock: "bg-green-100 text-green-800",
  out_of_stock: "bg-red-100 text-red-800",
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    availableProducts: 0,
    averageDiscount: 0,
    pendingReview: 0
  })
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Product Details Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [storeFilter, setStoreFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const fetchStores = async () => {
    try {
      const response = await fetch('/admin/products/api', {
        method: 'POST',
      })
      const result = await response.json()
      
      if (result.success) {
        setStores(result.data.stores)
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        search: searchTerm,
        store: storeFilter,
        status: statusFilter,
        limit: '100',
        offset: '0'
      })

      const response = await fetch(`/admin/products/api?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch products')
      }

      if (result.success) {
        setProducts(result.data.products)
        setStats(result.data.stats)
      } else {
        throw new Error(result.error || 'Failed to fetch products')
      }
    } catch (error) {
      console.error('❌ Failed to fetch products:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchStores()
    fetchProducts()
  }, [])

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts()
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, storeFilter, statusFilter])

  const handleRefresh = () => {
    fetchProducts()
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedProduct(null)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Products</h2>
            <p className="text-muted-foreground">Manage product catalog, enrichment, and validation</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Error loading products: {error}</span>
            </div>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
        
        {/* Product Details Modal */}
        <ProductDetailsModal
          product={selectedProduct}
          open={modalOpen}
          onOpenChange={handleCloseModal}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage product catalog, enrichment, and validation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync Products
          </Button>
          <Button disabled={loading}>
            <Package className="mr-2 h-4 w-4" />
            Bulk Enrich
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalProducts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Repository products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.availableProducts.toLocaleString()}
            </div>
            <div className="mt-2">
              <Progress 
                value={stats.totalProducts > 0 ? (stats.availableProducts / stats.totalProducts) * 100 : 0} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalProducts > 0 ? Math.round((stats.availableProducts / stats.totalProducts) * 100) : 0}% with pricing data
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats.averageDiscount}%`}
            </div>
            <p className="text-xs text-muted-foreground">Across available products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pendingReview.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">No pricing data</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrichment Pipeline Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Store Integration Status</CardTitle>
            <CardDescription>Current data availability by store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Albert Heijn</span>
              </div>
              <Badge variant="secondary">~30k products</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Dirk</span>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Jumbo</span>
              </div>
              <Badge variant="secondary">~400 products</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Price Sync</span>
              </div>
              <Badge>Live</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Distribution</CardTitle>
            <CardDescription>Products by store availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Albert Heijn</span>
                <span>~30,000 products</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Dirk</span>
                <span>Limited catalog</span>
              </div>
              <Progress value={10} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Jumbo</span>
                <span>~400 products</span>
              </div>
              <Progress value={5} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>View and manage all products in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products or GTIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                disabled={loading}
              />
            </div>
            <Select value={storeFilter} onValueChange={setStoreFilter} disabled={loading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.identifier} value={store.identifier}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading products...</span>
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products found matching your criteria.</p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>GTIN</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow 
                    key={product.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleProductClick(product)}
                  >
                    <TableCell>
                      <div className="max-w-[200px]">
                        <div className="font-medium truncate" title={product.title}>
                          {product.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {product.brand && `${product.brand} • `}
                          {product.category}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.store}</TableCell>
                    <TableCell className="font-mono text-sm">{product.gtin}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">€{product.price.toFixed(2)}</span>
                        {product.oldPrice > 0 && product.oldPrice !== product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            €{product.oldPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.discountRate > 0 ? (
                        <Badge variant="outline">{product.discountRate}% off</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[product.status]}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={availabilityColors[product.availability]}>
                        {product.availability.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleProductClick(product)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleProductClick(product)}>
                            View Price History
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleProductClick(product)}>
                            Check Other Stores
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              navigator.clipboard.writeText(product.gtin)
                            }}
                          >
                            Copy GTIN
                          </DropdownMenuItem>
                          {product.link && (
                            <DropdownMenuItem>
                              <a href={product.link} target="_blank" rel="noopener noreferrer">
                                View on Store
                              </a>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        open={modalOpen}
        onOpenChange={handleCloseModal}
      />
    </div>
  )
}
