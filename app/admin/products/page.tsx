"use client"

import { useState } from "react"
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
import { Search, MoreHorizontal, Package, RefreshCw, Download, AlertTriangle, CheckCircle } from "lucide-react"

// Mock product data
const products = [
  {
    id: "1",
    title: "Wireless Bluetooth Headphones",
    store: "Amazon",
    gtin: "123456789012",
    category: "Electronics",
    price: 79.99,
    discountRate: 25,
    status: "enriched",
    availability: "in_stock",
    lastUpdated: "2024-01-20",
  },
  {
    id: "2",
    title: "Smart Fitness Watch",
    store: "eBay",
    gtin: "234567890123",
    category: "Wearables",
    price: 199.99,
    discountRate: 15,
    status: "pending",
    availability: "low_stock",
    lastUpdated: "2024-01-19",
  },
  {
    id: "3",
    title: "Organic Coffee Beans 1kg",
    store: "Walmart",
    gtin: "345678901234",
    category: "Food & Beverage",
    price: 24.99,
    discountRate: 30,
    status: "enriched",
    availability: "in_stock",
    lastUpdated: "2024-01-20",
  },
  {
    id: "4",
    title: "Gaming Mechanical Keyboard",
    store: "Target",
    gtin: "456789012345",
    category: "Electronics",
    price: 129.99,
    discountRate: 20,
    status: "incomplete",
    availability: "out_of_stock",
    lastUpdated: "2024-01-18",
  },
]

const statusColors = {
  enriched: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  incomplete: "bg-red-100 text-red-800",
}

const availabilityColors = {
  in_stock: "bg-green-100 text-green-800",
  low_stock: "bg-yellow-100 text-yellow-800",
  out_of_stock: "bg-red-100 text-red-800",
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [storeFilter, setStoreFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) || product.gtin.includes(searchTerm)
    const matchesStore = storeFilter === "all" || product.store === storeFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter

    return matchesSearch && matchesStore && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage product catalog, enrichment, and validation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Products
          </Button>
          <Button>
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
            <div className="text-2xl font-bold">35,420</div>
            <p className="text-xs text-muted-foreground">+8% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enriched Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32,100</div>
            <div className="mt-2">
              <Progress value={91} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">91% completion rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">Require manual validation</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrichment Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enrichment Pipeline Status</CardTitle>
            <CardDescription>Current processing status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Data Ingestion</span>
              </div>
              <Badge variant="secondary">Running</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Category Mapping</span>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                <span className="text-sm">AI Enrichment</span>
              </div>
              <Badge>Processing</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Quality Check</span>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Distribution</CardTitle>
            <CardDescription>Products by source store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Amazon</span>
                <span>15,420 products</span>
              </div>
              <Progress value={43} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>eBay</span>
                <span>8,930 products</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Walmart</span>
                <span>6,750 products</span>
              </div>
              <Progress value={19} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Target</span>
                <span>4,320 products</span>
              </div>
              <Progress value={13} className="h-2" />
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
              />
            </div>
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                <SelectItem value="Amazon">Amazon</SelectItem>
                <SelectItem value="eBay">eBay</SelectItem>
                <SelectItem value="Walmart">Walmart</SelectItem>
                <SelectItem value="Target">Target</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="enriched">Enriched</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.title}</div>
                      <div className="text-sm text-muted-foreground">{product.category}</div>
                    </div>
                  </TableCell>
                  <TableCell>{product.store}</TableCell>
                  <TableCell className="font-mono text-sm">{product.gtin}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.discountRate}% off</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[product.status as keyof typeof statusColors]}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={availabilityColors[product.availability as keyof typeof availabilityColors]}>
                      {product.availability.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Product</DropdownMenuItem>
                        <DropdownMenuItem>Force Enrichment</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View History</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Remove Product</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
