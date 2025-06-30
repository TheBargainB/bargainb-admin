"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Users, Package, MessageSquare, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

// Mock data for dashboard
const userGrowthData = [
  { month: "Jan", users: 1200, active: 980 },
  { month: "Feb", users: 1350, active: 1100 },
  { month: "Mar", users: 1500, active: 1250 },
  { month: "Apr", users: 1680, active: 1400 },
  { month: "May", users: 1850, active: 1580 },
  { month: "Jun", users: 2100, active: 1800 },
]

const productData = [
  { store: "Amazon", products: 15420, enriched: 14200 },
  { store: "eBay", products: 8930, enriched: 7800 },
  { store: "Walmart", products: 6750, enriched: 6200 },
  { store: "Target", products: 4320, enriched: 3900 },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your BargainB admin panel. Here's what's happening with your platform.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,100</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Active Subscribers</span>
                <span>1,800</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Early Access</span>
                <span>300</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Listed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35,420</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last week
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Enriched</span>
                <span>32,100 (91%)</span>
              </div>
              <Progress value={91} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23%</span> from yesterday
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Avg. Response Time</span>
                <span>1.2s</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Success Rate</span>
                <span>94%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.8%</div>
            <p className="text-xs text-muted-foreground">Uptime this month</p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>ETL Pipeline</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                <span>2 Node Warnings</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total users and active subscribers over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                users: {
                  label: "Total Users",
                  color: "hsl(var(--chart-1))",
                },
                active: {
                  label: "Active Users",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="var(--color-users)"
                    strokeWidth={2}
                    name="Total Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="var(--color-active)"
                    strokeWidth={2}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Enrichment by Store</CardTitle>
            <CardDescription>Products listed vs enriched across different stores</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                products: {
                  label: "Total Products",
                  color: "hsl(var(--chart-3))",
                },
                enriched: {
                  label: "Enriched Products",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="store" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="products" fill="var(--color-products)" name="Total Products" />
                  <Bar dataKey="enriched" fill="var(--color-enriched)" name="Enriched Products" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform events and system updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Product enrichment completed</p>
                <p className="text-xs text-muted-foreground">1,247 products enriched from Amazon store</p>
              </div>
              <Badge variant="secondary">2 min ago</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New user registration spike</p>
                <p className="text-xs text-muted-foreground">47 new users registered in the last hour</p>
              </div>
              <Badge variant="secondary">15 min ago</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">ETL pipeline warning</p>
                <p className="text-xs text-muted-foreground">Node 3 experiencing high memory usage</p>
              </div>
              <Badge variant="outline">1 hour ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
