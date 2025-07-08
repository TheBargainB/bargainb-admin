"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Package, Filter, Barcode, Image, FileText, CheckCircle2 } from "lucide-react"
import { ProductDetailsModal } from "./components/ProductDetailsModal"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/ui/pagination"

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

interface Category {
  id: string
  level_1: string
}

interface Stats {
  totalProducts: number
  noGtin: number
  noImages: number
  noDescription: number
}

interface ProductsResponse {
  success: boolean
  error?: string
  data: {
    products: Product[]
    stats: Stats
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }
}

const PRODUCTS_PER_PAGE = 50

const statusColors = {
  variant: "bg-purple-100 text-purple-800",
  base: "bg-blue-100 text-blue-800",
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    noGtin: 0,
    noImages: 0,
    noDescription: 0
  })
  const { toast } = useToast()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const offset = (currentPage - 1) * PRODUCTS_PER_PAGE
      const params = new URLSearchParams({
        search: searchQuery,
        category: selectedCategory,
        limit: PRODUCTS_PER_PAGE.toString(),
        offset: offset.toString()
      })

      const response = await fetch(`/admin/products/api?${params}`)
      const result: ProductsResponse = await response.json()

      if (result.success) {
        setProducts(result.data.products)
        setStats(result.data.stats)
        setTotalProducts(result.data.stats.totalProducts)
      } else {
        throw new Error(result.error || 'Failed to fetch products')
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/admin/products/api', {
        method: 'POST'
      })
      const result = await response.json()

      if (result.success) {
        setCategories(result.data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, selectedCategory])

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, selectedCategory, currentPage])

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Total number of products
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Barcode className="h-4 w-4" />
              Missing GTIN
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noGtin}</div>
            <p className="text-xs text-muted-foreground">
              Products without GTIN ({Math.round((stats.noGtin / stats.totalProducts) * 100)}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Image className="h-4 w-4" />
              Missing Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noImages}</div>
            <p className="text-xs text-muted-foreground">
              Products without images ({Math.round((stats.noImages / stats.totalProducts) * 100)}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Missing Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noDescription}</div>
            <p className="text-xs text-muted-foreground">
              Products without description ({Math.round((stats.noDescription / stats.totalProducts) * 100)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Search and filter products by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by GTIN, title or description..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id}
                    className="truncate"
                  >
                    {category.level_1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products
          </CardTitle>
          <CardDescription>
            Showing {products.length} of {totalProducts} products
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>GTIN</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {product.image ? (
                              <div className="h-8 w-8 rounded bg-gray-100">
                                <img
                                  src={product.image}
                                  alt={product.title}
                                  className="h-full w-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                  }}
                                />
                                <div className="hidden h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                                  No img
                                </div>
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-muted-foreground text-xs">
                                No img
                              </div>
                            )}
                            <span className="font-medium">{product.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{product.gtin}</span>
                        </TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{product.category}</div>
                            {product.subCategory && (
                              <div className="text-sm text-muted-foreground">
                                {product.subCategory}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[product.status]}>
                            {product.status === 'variant' ? 'Variant' : 'Base'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(product.updatedAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleProductClick(product)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ProductDetailsModal
        product={selectedProduct}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
