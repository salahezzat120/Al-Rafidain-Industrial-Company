"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, AlertCircle, CheckCircle, Clock, Package } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function RepresentativeNotifications() {
  const { t } = useLanguage()

  const notifications = [
    {
      id: 1,
      type: "delivery",
      title: "New delivery assigned",
      message: "Delivery to ABC Company scheduled for 2:30 PM",
      time: "10 minutes ago",
      unread: true,
      icon: Package,
      color: "text-blue-600"
    },
    {
      id: 2,
      type: "reminder",
      title: "Route optimization available",
      message: "Your route has been optimized to save 15 minutes",
      time: "1 hour ago",
      unread: true,
      icon: Clock,
      color: "text-green-600"
    },
    {
      id: 3,
      type: "alert",
      title: "Traffic alert",
      message: "Heavy traffic on Main Street - consider alternative route",
      time: "2 hours ago",
      unread: false,
      icon: AlertCircle,
      color: "text-orange-600"
    },
    {
      id: 4,
      type: "completed",
      title: "Delivery completed",
      message: "Successfully delivered to XYZ Industries",
      time: "3 hours ago",
      unread: false,
      icon: CheckCircle,
      color: "text-green-600"
    }
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t("notifications")}
        </CardTitle>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {unreadCount}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.slice(0, 4).map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start space-x-3 p-3 rounded-lg border ${
              notification.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <notification.icon className={`h-4 w-4 mt-0.5 ${notification.color}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </p>
              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
            </div>
            {notification.unread && (
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full">
          {t("viewAllNotifications")}
        </Button>
      </CardContent>
    </Card>
  )
}
