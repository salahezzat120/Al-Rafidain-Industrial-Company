"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Package, Clock, MapPin, Star } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function RepresentativeStats() {
  const { t } = useLanguage()

  const stats = [
    {
      title: t("totalDeliveries"),
      value: "24",
      change: "+12%",
      trend: "up",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: t("avgDeliveryTime"),
      value: "28 min",
      change: "-5%",
      trend: "down",
      icon: Clock,
      color: "text-green-600"
    },
    {
      title: t("distanceCovered"),
      value: "156 km",
      change: "+8%",
      trend: "up",
      icon: MapPin,
      color: "text-purple-600"
    },
    {
      title: t("customerRating"),
      value: "4.8",
      change: "+0.2",
      trend: "up",
      icon: Star,
      color: "text-yellow-600"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="flex items-center space-x-1 text-xs">
              {stat.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                {stat.change}
              </span>
              <span className="text-gray-500">from last week</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
