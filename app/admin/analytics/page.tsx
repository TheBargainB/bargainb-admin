"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Users, Package, MessageSquare, DollarSign } from "lucide-react"

// Mock analytics data
const userEngagementData = [
  { date: "Jan 1", sessions: 1200, pageViews: 3400, avgDuration: 4.2 },
  { date: "Jan 2", sessions: 1350, pageViews: 3800, avgDuration: 4.5 },
  { date: "Jan 3", sessions: 1100, pageViews: 3100, avgDuration: 3.8 },
  { date: "Jan 4", sessions: 1450, pageViews: 4200, avgDuration: 5.1 },
  { date: "Jan 5", sessions: 1600, pageViews: 4600, avgDuration: 5.3 },
  { date: "Jan 6", sessions: 1750, pageViews: 5000, avgDuration: 5.8 },
  { date: "Jan 7", sessions: 1900, pageViews: 5400, avgDuration: 6.2 },
]

const productCategoryData = [
  { category: "Electronics", value: 35, color: "#8884d8" },
  { category: "Fashion", value: 25, color: "#82ca9d" },
  { category: "Home & Garden", value: 20, color: "#ffc658" },
  { category: "Sports", value: 12, color: "#ff7300" },
  { category: "Books", value: 8, color: "#00ff00" },
]

const chatMetricsData = [
  { hour: "00:00", messages: 45, responses: 42, avgTime: 1.2 },
  { hour: "04:00", messages: 23, responses: 22, avgTime: 1.1 },
  { hour: "08:00", messages: 156, responses: 148, avgTime: 1.3 },
  { hour: "12:00", messages: 234, responses: 220, avgTime: 1.4 },
  { hour: "16:00", messages: 189, responses: 178, avgTime: 1.5 },
  { hour: "20:00", messages: 167, responses: 158, avgTime: 1.3 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">Comprehensive insights into platform performance and user behavior</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +20.1%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,800</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Views</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89,432</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                -3%
              </span>
              from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +23%
              </span>
              from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Engagement Trends</CardTitle>
            <CardDescription>Daily sessions, page views, and average session duration</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sessions: {
                  label: "Sessions",
                  color: "hsl(var(--chart-1))",
                },
                pageViews: {
                  label: "Page Views",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userEngagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="var(--color-sessions)"
                    strokeWidth={2}
                    name="Sessions"
                  />
                  <Line
                    type="monotone"
                    dataKey="pageViews"
                    stroke="var(--color-pageViews)"
                    strokeWidth={2}
                    name="Page Views"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Category Distribution</CardTitle>
            <CardDescription>Breakdown of products by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Percentage",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, value }) => `${category}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chat Performance by Hour</CardTitle>
            <CardDescription>Message volume and response times throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                messages: {
                  label: "Messages",
                  color: "hsl(var(--chart-3))",
                },
                responses: {
                  label: "Responses",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chatMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="messages" fill="var(--color-messages)" name="Messages" />
                  <Bar dataKey="responses" fill="var(--color-responses)" name="Responses" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Performance Metrics</CardTitle>
            <CardDescription>Real-time system health and performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>API Response Time</span>
                <span className="font-medium">245ms</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Database Query Time</span>
                <span className="font-medium">89ms</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "92%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI Model Latency</span>
                <span className="font-medium">1.2s</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "78%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>System Uptime</span>
                <span className="font-medium">99.8%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "99%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
          <CardDescription>Most viewed and discounted products this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground">
              <span>Product</span>
              <span>Category</span>
              <span>Views</span>
              <span>Discount</span>
              <span>Revenue</span>
            </div>
            {[
              {
                name: "Wireless Bluetooth Headphones",
                category: "Electronics",
                views: 2340,
                discount: "25%",
                revenue: "$1,890",
              },
              { name: "Smart Fitness Watch", category: "Wearables", views: 1890, discount: "15%", revenue: "$2,340" },
              {
                name: "Gaming Mechanical Keyboard",
                category: "Electronics",
                views: 1560,
                discount: "20%",
                revenue: "$1,560",
              },
              { name: "Organic Coffee Beans", category: "Food", views: 1230, discount: "30%", revenue: "$890" },
              { name: "Yoga Mat Premium", category: "Sports", views: 980, discount: "18%", revenue: "$670" },
            ].map((product, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 text-sm py-2 border-b">
                <span className="font-medium">{product.name}</span>
                <span className="text-muted-foreground">{product.category}</span>
                <span>{product.views.toLocaleString()}</span>
                <span className="text-green-600">{product.discount}</span>
                <span className="font-medium">{product.revenue}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
