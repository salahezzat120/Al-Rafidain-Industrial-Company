"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle, Download } from "lucide-react"

interface ReportsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReportsModal({ isOpen, onClose }: ReportsModalProps) {
  const [timeRange, setTimeRange] = useState("today")

  const reportData = {
    today: {
      totalDeliveries: 89,
      completed: 76,
      pending: 8,
      failed: 5,
      avgDeliveryTime: "32 min",
      onTimeRate: "94.2%",
    },
    week: {
      totalDeliveries: 542,
      completed: 498,
      pending: 28,
      failed: 16,
      avgDeliveryTime: "28 min",
      onTimeRate: "91.8%",
    },
    month: {
      totalDeliveries: 2341,
      completed: 2187,
      pending: 89,
      failed: 65,
      avgDeliveryTime: "31 min",
      onTimeRate: "93.4%",
    },
  }

  const currentData = reportData[timeRange as keyof typeof reportData]

  const topDrivers = [
    { name: "Sarah Johnson", deliveries: 24, onTime: "98%", rating: 4.9 },
    { name: "Mike Wilson", deliveries: 21, onTime: "95%", rating: 4.8 },
    { name: "John Smith", deliveries: 19, onTime: "92%", rating: 4.7 },
    { name: "Lisa Brown", deliveries: 18, onTime: "96%", rating: 4.8 },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Delivery Reports & Analytics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.totalDeliveries}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{currentData.completed}</div>
                <p className="text-xs text-muted-foreground">
                  {((currentData.completed / currentData.totalDeliveries) * 100).toFixed(1)}% success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.avgDeliveryTime}</div>
                <p className="text-xs text-muted-foreground">-3 min from last period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.onTimeRate}</div>
                <p className="text-xs text-muted-foreground">+2.1% improvement</p>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-800">Completed</p>
                    <p className="text-2xl font-bold text-green-900">{currentData.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">{currentData.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-red-800">Failed</p>
                    <p className="text-2xl font-bold text-red-900">{currentData.failed}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Drivers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDrivers.map((driver, index) => (
                  <div key={driver.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-sm text-gray-600">{driver.deliveries} deliveries</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{driver.onTime} on-time</p>
                      <p className="text-sm text-gray-600">⭐ {driver.rating}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
