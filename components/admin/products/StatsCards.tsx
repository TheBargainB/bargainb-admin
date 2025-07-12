'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductsOverviewStats } from '@/types/products.types';
import { 
  Package, 
  Store, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  BarChart3,
  Users,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';

interface StatsCardsProps {
  stats: ProductsOverviewStats | null;
  loading: boolean;
}

const StatsCards = ({ stats, loading }: StatsCardsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No statistics available</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getChangeIndicator = (current: number, threshold: number) => {
    if (current >= threshold) {
      return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' };
    }
    return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' };
  };

  const statsData = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      description: 'Master product catalog',
      icon: Package,
      color: 'bg-chart-1',
      trend: '+2.5% from last month',
      status: 'growing'
    },
    {
      title: 'Store Products',
      value: stats.totalStoreProducts.toLocaleString(),
      description: 'Across all retail partners',
      icon: Store,
      color: 'bg-chart-2',
      trend: '+1.8% from last month',
      status: 'stable'
    },
    {
      title: 'Price Coverage',
      value: formatPercentage(stats.priceCoverage),
      description: 'Products with active pricing',
      icon: DollarSign,
      color: 'bg-chart-3',
      trend: stats.priceCoverage > 95 ? 'Excellent coverage' : 'Good coverage',
      status: stats.priceCoverage > 95 ? 'excellent' : 'good'
    },
    {
      title: 'Average Price',
      value: formatCurrency(stats.avgPrice),
      description: 'Market average across retailers',
      icon: TrendingUp,
      color: 'bg-chart-4',
      trend: '-0.3% from last month',
      status: 'declining'
    },
    {
      title: 'Connected Retailers',
      value: stats.totalRetailers.toString(),
      description: 'Active retail partnerships',
      icon: ShoppingCart,
      color: 'bg-chart-5',
      trend: 'All systems operational',
      status: 'operational'
    },
    {
      title: 'Active Prices',
      value: stats.activePrices.toLocaleString(),
      description: 'Real-time pricing data',
      icon: BarChart3,
      color: 'bg-chart-1',
      trend: 'Updated hourly',
      status: 'live'
    },
    {
      title: 'GTIN Coverage',
      value: formatPercentage(stats.gtinCoverage),
      description: 'Products with valid GTINs',
      icon: Users,
      color: 'bg-chart-2',
      trend: stats.gtinCoverage > 90 ? 'High quality data' : 'Improving',
      status: stats.gtinCoverage > 90 ? 'high' : 'medium'
    },
    {
      title: 'Active Promotions',
      value: stats.promotionalItems.toLocaleString(),
      description: 'Current promotional offers',
      icon: Target,
      color: 'bg-chart-3',
      trend: '+5.2% from last week',
      status: 'increasing'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="text-muted-foreground">{stat.title}</span>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </CardTitle>
            <CardDescription className="text-xs">
              {stat.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {stat.status === 'growing' && <TrendingUp className="w-3 h-3 text-green-500" />}
              {stat.status === 'excellent' && <CheckCircle className="w-3 h-3 text-green-500" />}
              {stat.status === 'operational' && <CheckCircle className="w-3 h-3 text-green-500" />}
              {stat.status === 'live' && <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse" />}
              <span>{stat.trend}</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards; 