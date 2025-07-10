'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  iconColor?: string
}

export const StatsCard = ({
  icon: Icon,
  label,
  value,
  description,
  trend,
  className,
  iconColor = "text-blue-600"
}: StatsCardProps) => {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{description}</p>
            )}
            {trend && (
              <p className={cn(
                "text-xs mt-1",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </p>
            )}
          </div>
          <Icon className={cn("h-6 w-6 ml-2 flex-shrink-0", iconColor)} />
        </div>
      </CardContent>
    </Card>
  )
} 