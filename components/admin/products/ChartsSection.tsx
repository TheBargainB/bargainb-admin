'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { ProductsOverviewStats, RetailerBreakdown, CategoryBreakdown } from '@/types/products.types';
import { Store, Package, TrendingUp } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  PieChart, 
  Pie, 
  Cell, 
  LabelList,
  Label
} from 'recharts';

interface ChartsSectionProps {
  stats: ProductsOverviewStats | null;
  retailers: RetailerBreakdown[];
  categories: CategoryBreakdown[];
  loading: boolean;
  detailed?: boolean;
}

const ChartsSection = ({ stats, retailers, categories, loading, detailed = false }: ChartsSectionProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare retailer data for stacked horizontal bar chart
  const retailerChartData = retailers.map((retailer: RetailerBreakdown) => ({
    retailer: retailer.retailer,
    products: retailer.productCount,
    avgPrice: retailer.avgPrice,
    promoCount: retailer.promoCount,
    // Add stacked data for active products vs promotional products
    activeProducts: retailer.productCount - retailer.promoCount,
    promotionalProducts: retailer.promoCount,
  }));

  // Prepare category data for stacked pie chart - show all categories and subcategories
  const allCategories = categories.slice(0, detailed ? 20 : 12);
  const categoryChartData = allCategories.map((category: CategoryBreakdown, index: number) => ({
    category: category.category,
    products: category.productCount,
    avgPrice: category.avgPrice,
    level: category.level,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  // Calculate total products for center label
  const totalProducts = categoryChartData.reduce((sum, item) => sum + item.products, 0);

  // Chart configurations with theme colors
  const retailerChartConfig: ChartConfig = {
    activeProducts: {
      label: "Active Products",
      color: "hsl(var(--chart-1))",
    },
    promotionalProducts: {
      label: "Promotional Products", 
      color: "hsl(var(--chart-2))",
    },
    products: {
      label: "Total Products",
      color: "hsl(var(--chart-3))",
    },
  };

  const categoryChartConfig: ChartConfig = {
    products: {
      label: "Products",
      color: "hsl(var(--chart-1))",
    },
    // Dynamic color mapping for categories
    ...Object.fromEntries(
      categoryChartData.map((item, index) => [
        `category-${index}`,
        {
          label: item.category,
          color: `hsl(var(--chart-${(index % 5) + 1}))`,
        }
      ])
    ),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Retailer Distribution - Stacked Horizontal Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Retailer Distribution
          </CardTitle>
          <CardDescription>
            Product count with promotional breakdown across all retailers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={retailerChartConfig}>
            <BarChart
              accessibilityLayer
              data={retailerChartData}
              layout="vertical"
              margin={{
                left: 0,
                right: 16,
              }}
            >
              <YAxis
                dataKey="retailer"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + '...' : value}
                hide
              />
              <XAxis dataKey="products" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                  indicator="line"
                  formatter={(value, name, props) => {
                    if (name === 'activeProducts') {
                      return [`${Number(value).toLocaleString()} active`, "Active Products"]
                    }
                    if (name === 'promotionalProducts') {
                      return [`${Number(value).toLocaleString()} promotional`, "Promotional Products"]
                    }
                    return [`${Number(value).toLocaleString()} products`, "Products"]
                  }}
                />}
              />
              <Bar
                dataKey="activeProducts"
                stackId="a"
                fill="hsl(var(--chart-1))"
                radius={[0, 4, 4, 0]}
              >
                <LabelList
                  dataKey="retailer"
                  position="insideLeft"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
              <Bar
                dataKey="promotionalProducts"
                stackId="a"
                fill="hsl(var(--chart-2))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            All {retailers.length} retailers connected <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing active and promotional product distribution
          </div>
        </CardFooter>
      </Card>

      {/* Category Distribution - Stacked Donut Chart */}
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Category & Subcategory Distribution
          </CardTitle>
          <CardDescription>Comprehensive product categorization</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={categoryChartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                  hideLabel
                  formatter={(value, name, props) => {
                    const category = props.payload?.category || name;
                    const avgPrice = props.payload?.avgPrice || 0;
                    const level = props.payload?.level || 1;
                    const levelText = level === 1 ? 'Category' : level === 2 ? 'Subcategory' : 'Sub-subcategory';
                    
                    return [
                      <div key="tooltip" className="space-y-1">
                        <div className="font-medium">{category}</div>
                        <div className="text-sm text-muted-foreground">{levelText}</div>
                        <div className="text-sm">{Number(value).toLocaleString()} products</div>
                        <div className="text-sm">Avg: €{avgPrice.toFixed(2)}</div>
                      </div>
                    ];
                  }}
                />}
              />
              <Pie
                data={categoryChartData}
                dataKey="products"
                nameKey="category"
                innerRadius={60}
                outerRadius={90}
                strokeWidth={2}
                paddingAngle={1}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalProducts.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-sm"
                          >
                            Products
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              
              {/* Inner pie for level 1 categories */}
              <Pie
                data={categoryChartData.filter(cat => cat.level === 1)}
                dataKey="products"
                nameKey="category"
                innerRadius={0}
                outerRadius={50}
                strokeWidth={2}
                paddingAngle={2}
              >
                {categoryChartData.filter(cat => cat.level === 1).map((entry, index) => (
                  <Cell key={`inner-cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} opacity={0.7} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            Top {categoryChartData.length} categories & subcategories <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing comprehensive product categorization with hierarchy
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChartsSection; 