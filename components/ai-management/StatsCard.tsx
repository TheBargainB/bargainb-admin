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
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
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
          <Icon className={cn("h-8 w-8", iconColor)} />
        </div>
      </CardContent>
    </Card>
  )
} 