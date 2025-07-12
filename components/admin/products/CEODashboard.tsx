'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/admin/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import StatsCards from './StatsCards';
import ChartsSection from './ChartsSection';
import ProductsTable from './ProductsTable';
import ProductDetailsModal from './ProductDetailsModal';
import ProductFilters from './ProductFilters';
import ProductSearch from './ProductSearch';

const CEODashboard = () => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const {
    products,
    stats,
    retailers,
    categories,
    loading,
    error,
    pagination,
    fetchProducts,
    setFilters,
    nextPage,
    previousPage,
    goToPage,
    refreshData
  } = useProducts();

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleModalClose = () => {
    setSelectedProductId(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading products data</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products Management</h1>
          <p className="text-muted-foreground">
            Comprehensive grocery retail intelligence platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
            Live Data
          </Badge>
          <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
            API Operational
          </Badge>
          <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
            DB Excellent
          </Badge>
          <Badge variant="outline">
            {stats?.totalProducts.toLocaleString()} Products
          </Badge>
          <Badge variant="outline">
            {stats?.activePrices.toLocaleString()} Active Prices
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={loading} />

      {/* Charts Section */}
      <ChartsSection stats={stats} retailers={retailers} categories={categories} loading={loading} detailed />

      {/* Products Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ProductFilters />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <ProductSearch />
          <Card>
            <CardHeader>
              <CardTitle>Products Database</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductsTable
                products={products || []}
                loading={loading}
                onProductClick={handleProductClick}
                pagination={pagination}
                onPageChange={goToPage}
                onPageSizeChange={(size: number) => setFilters({ limit: size })}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProductId && (
        <ProductDetailsModal
          productId={selectedProductId}
          open={!!selectedProductId}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default CEODashboard; 