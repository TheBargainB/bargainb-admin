"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Package, Calendar, Euro, Plus, Trash2 } from "lucide-react"

type GroceryItem = {
  name: string
  quantity: number
  store: string
  estimated_price: number
}

type GroceryList = {
  id: string
  list_name: string
  products: GroceryItem[]
  estimated_total: number
  actual_total?: number
  preferred_store: string
  shopping_date?: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  created_at: string
}

type CRMUser = {
  contact_id: string
  phone_number: string
  full_name: string | null
  preferred_name: string | null
  preferred_stores: string[]
}

interface ShoppingListsModalProps {
  user: CRMUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShoppingListsModal({ user, open, onOpenChange }: ShoppingListsModalProps) {
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch real grocery lists from database
  useEffect(() => {
    if (open && user) {
      setLoading(true)
      // TODO: Implement API call to fetch real grocery lists
      // For now, show empty state until real grocery list data exists
      setTimeout(() => {
        setGroceryLists([]) // No mock data - show real empty state
        setLoading(false)
      }, 200)
    }
  }, [open, user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓'
      case 'active':
        return '🛒'
      case 'draft':
        return '📝'
      case 'cancelled':
        return '❌'
      default:
        return '📋'
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Lists - {user.full_name || user.preferred_name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading shopping lists...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold">{groceryLists.length}</div>
                      <div className="text-xs text-muted-foreground">Total Lists</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">{groceryLists.filter(l => l.status === 'completed').length}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        €{groceryLists.reduce((sum, list) => sum + (list.actual_total || list.estimated_total), 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Spent</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold">{groceryLists.filter(l => l.status === 'active').length}</div>
                      <div className="text-xs text-muted-foreground">Active Lists</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shopping Lists */}
            <div className="space-y-4">
              {groceryLists.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Shopping Lists</h3>
                    <p className="text-muted-foreground">This customer hasn't created any shopping lists yet.</p>
                  </CardContent>
                </Card>
              ) : (
                groceryLists.map((list) => (
                  <Card key={list.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getStatusIcon(list.status)}</div>
                          <div>
                            <CardTitle className="text-lg">{list.list_name}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {list.products.length} items
                              </span>
                              <span className="flex items-center gap-1">
                                <Euro className="h-3 w-3" />
                                €{(list.actual_total || list.estimated_total).toFixed(2)}
                              </span>
                              {list.shopping_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(list.shopping_date)}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(list.status)}>
                            {list.status}
                          </Badge>
                          <Badge variant="outline">
                            {list.preferred_store}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Products Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {list.products.map((product, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{product.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Qty: {product.quantity} • {product.store}
                                </div>
                              </div>
                              <div className="text-sm font-medium">
                                €{(product.estimated_price * product.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Summary */}
                        <Separator />
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            Created {formatDate(list.created_at)}
                          </div>
                          <div className="flex items-center gap-4">
                            {list.actual_total && list.actual_total !== list.estimated_total && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Estimated: </span>
                                <span className="line-through">€{list.estimated_total.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="text-lg font-bold">
                              Total: €{(list.actual_total || list.estimated_total).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Customer Store Preferences */}
            {user.preferred_stores?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Store Preferences</CardTitle>
                  <CardDescription>Customer's preferred shopping locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.preferred_stores.map((store, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3" />
                        {store}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 