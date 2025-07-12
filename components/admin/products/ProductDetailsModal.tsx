'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductDetails } from '@/hooks/admin/products';
import type { ProductStoreMatch } from '@/types/products.types';
import { 
  X,
  Store,
  Euro,
  Package,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  BarChart3,
  Image as ImageIcon,
  Zap,
  ShoppingCart
} from 'lucide-react';

interface ProductDetailsModalProps {
  productId: string;
  open: boolean;
  onClose: () => void;
}

const ProductDetailsModal = ({ productId, open, onClose }: ProductDetailsModalProps) => {
  const { product, loading, error, fetchProductDetails } = useProductDetails();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (open && productId) {
      fetchProductDetails(productId);
    }
  }, [open, productId, fetchProductDetails]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStockStatusIcon = (inStock: boolean) => {
    return inStock ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <TrendingUp className="w-4 h-4 text-gray-400" />;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-red-500';
    if (change < 0) return 'text-green-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              <Skeleton className="h-6 w-64" />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !product) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Error Loading Product</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              {error || 'Product not found'}
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => fetchProductDetails(productId)}>
                Try Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span className="truncate">{product.title}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Euro className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Avg Price</div>
                      <div className="font-semibold">{formatCurrency(product.pricingSummary?.avgPrice || 0)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Store className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Available In</div>
                      <div className="font-semibold">{product.storeMatches.length} stores</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    {getStockStatusIcon(product.storeMatches.some((store: ProductStoreMatch) => store.isAvailable))}
                    <div>
                      <div className="text-sm text-gray-500">Stock Status</div>
                      <div className="font-semibold">
                        {product.storeMatches.some((store: ProductStoreMatch) => store.isAvailable) ? 'In Stock' : 'Out of Stock'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Last Updated</div>
                      <div className="font-semibold text-xs">
                        {formatDate(product.debugInfo?.updatedAt || product.debugInfo?.createdAt || '')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stores">Store Prices</TabsTrigger>
                <TabsTrigger value="pricing">Price History</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                <TabsTrigger value="debug">Debug Info</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Package className="w-5 h-5" />
                        <span>Product Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          {product.images?.[0]?.url ? (
                            <img 
                              src={product.images[0].url} 
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.title}</h3>
                          {product.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Brand</div>
                          <Badge variant="outline">{product.brand || 'Unknown'}</Badge>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Category</div>
                          <Badge variant="outline">{product.category?.level1 || 'Unknown'}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5" />
                        <span>Price Analysis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(product.pricingSummary?.minPrice || 0)}
                          </div>
                          <div className="text-sm text-gray-500">Lowest Price</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(product.pricingSummary?.maxPrice || 0)}
                          </div>
                          <div className="text-sm text-gray-500">Highest Price</div>
                        </div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-xl font-bold text-blue-700">
                          {formatCurrency(product.pricingSummary?.avgPrice || 0)}
                        </div>
                        <div className="text-sm text-blue-600">Average Price</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Store Prices Tab */}
              <TabsContent value="stores" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Store className="w-5 h-5" />
                      <span>Store Prices & Availability</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Store</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Price Change</TableHead>
                          <TableHead>Last Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.storeMatches.map((store: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                  <Store className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                  <div className="font-medium">{store.storeName}</div>
                                  <div className="text-sm text-gray-500">{store.storeSlug}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold">
                                {formatCurrency(store.currentPrice || 0)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getStockStatusIcon(store.isAvailable)}
                                <span className={store.isAvailable ? 'text-green-600' : 'text-red-600'}>
                                  {store.isAvailable ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={`flex items-center space-x-1 ${getPriceChangeColor(store.priceChange || 0)}`}>
                                {getPriceChangeIcon(store.priceChange || 0)}
                                <span className="text-sm">
                                  {(store.priceChange || 0) > 0 ? '+' : ''}{(store.priceChange || 0).toFixed(2)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-500">
                                {formatDate(store.lastUpdated)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Price History Tab */}
              <TabsContent value="pricing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Price History</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Price chart would be rendered here</p>
                          <p className="text-sm text-gray-400">Using Chart.js or similar library</p>
                        </div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Change</TableHead>
                            <TableHead>Store</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {product.storeMatches.flatMap((store: any) => store.priceHistory || []).map((entry: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(entry.date)}</TableCell>
                              <TableCell>{formatCurrency(entry.price)}</TableCell>
                              <TableCell>
                                <div className={`flex items-center space-x-1 ${getPriceChangeColor(entry.change || 0)}`}>
                                  {getPriceChangeIcon(entry.change || 0)}
                                  <span>{(entry.change || 0) > 0 ? '+' : ''}{(entry.change || 0).toFixed(2)}%</span>
                                </div>
                              </TableCell>
                              <TableCell>{entry.store}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Nutrition Tab */}
              <TabsContent value="nutrition" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Nutrition Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {product.nutrition ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold">Basic Nutrition</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Calories</span>
                              <span className="font-medium">{product.nutrition.energyKcal || 0} kcal</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Protein</span>
                              <span className="font-medium">{product.nutrition.proteins || 0}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Carbs</span>
                              <span className="font-medium">{product.nutrition.carbohydrates || 0}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fat</span>
                              <span className="font-medium">{product.nutrition.fat || 0}g</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold">Additional Info</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Fiber</span>
                              <span className="font-medium">{product.nutrition.fiber || 0}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sugar</span>
                              <span className="font-medium">{product.nutrition.sugars || 0}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sodium</span>
                              <span className="font-medium">{product.nutrition.sodium || 0}mg</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Salt</span>
                              <span className="font-medium">{product.nutrition.salt || 0}g</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Info className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No nutrition information available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Debug Info Tab */}
              <TabsContent value="debug" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Info className="w-5 h-5" />
                      <span>Debug Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Product ID</h4>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {product.id}
                        </code>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Raw Data</h4>
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                          {JSON.stringify(product, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal; 