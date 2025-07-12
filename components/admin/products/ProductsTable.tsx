'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MasterProduct } from '@/types/products.types';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Filter,
  ExternalLink,
  Store,
  Euro,
  Package,
  Clock
} from 'lucide-react';

const ProductImage = ({ product }: { product: MasterProduct }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    console.log('Image failed to load for product:', product.title, 'URL:', product.imageUrl);
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
      {product.imageUrl && !imageError ? (
        <>
          {isLoading && <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />}
          <img 
            src={product.imageUrl} 
            alt={product.title}
            className={`w-8 h-8 object-cover rounded ${isLoading ? 'hidden' : ''}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </>
      ) : (
        <Package className="w-4 h-4 text-gray-400" />
      )}
    </div>
  );
};

interface ProductsTableProps {
  products: MasterProduct[];
  loading: boolean;
  onProductClick: (productId: string) => void;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  compact?: boolean;
}

const ProductsTable = ({ 
  products, 
  loading, 
  onProductClick,
  pagination,
  onPageChange,
  onPageSizeChange,
  compact = false
}: ProductsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStockStatusColor = (inStock: boolean) => {
    return inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStockStatusText = (inStock: boolean) => {
    return inStock ? 'In Stock' : 'Out of Stock';
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );



  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Products</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(compact ? 5 : 10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Products</span>
            <Badge variant="outline">
              {filteredProducts.length.toLocaleString()}
            </Badge>
          </div>
          {!compact && (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead>Stores</TableHead>
                <TableHead>Promotions</TableHead>
                {!compact && <TableHead>Last Updated</TableHead>}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow 
                  key={product.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onProductClick(product.id)}
                >
                  <TableCell>
                    <ProductImage product={product} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 line-clamp-1">
                        {product.title}
                      </div>
                      {product.description && (
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.brand && (
                      <Badge variant="outline" className="text-xs">
                        {product.brand}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.category && (
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <Euro className="w-3 h-3 text-gray-400" />
                        <span className="font-medium">
                          {product.minPrice ? formatCurrency(product.minPrice) : 'N/A'} - {product.maxPrice ? formatCurrency(product.maxPrice) : 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Avg: {product.avgPrice ? formatCurrency(product.avgPrice) : 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Store className="w-3 h-3 text-gray-400" />
                      <span className="text-sm font-medium">
                        {product.matchedRetailers}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={product.hasPromos ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {product.hasPromos ? 'Has Promos' : 'No Promos'}
                    </Badge>
                  </TableCell>
                  {!compact && (
                                         <TableCell>
                       <div className="flex items-center space-x-1 text-sm text-gray-500">
                         <Clock className="w-3 h-3" />
                         <span>{formatDate(product.updatedAt || product.createdAt)}</span>
                       </div>
                     </TableCell>
                  )}
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onProductClick(product.id);
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!compact && pagination && onPageChange && onPageSizeChange && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} products
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Rows per page:</span>
                <Select 
                  value={pagination.limit.toString()} 
                  onValueChange={(value) => onPageSizeChange && onPageSizeChange(parseInt(value))}
                >
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-500 px-4">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.ceil(pagination.total / pagination.limit))}
                  disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsTable; 