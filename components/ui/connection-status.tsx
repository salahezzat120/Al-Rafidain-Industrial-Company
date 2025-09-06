"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { testSupabaseConnection } from "@/lib/supabase-utils"

interface ConnectionStatusProps {
  className?: string
}

export function ConnectionStatus({ className = "" }: ConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkConnection = async () => {
    setIsLoading(true)
    try {
      const result = await testSupabaseConnection()
      setIsConnected(result.success)
      setLastChecked(new Date())
    } catch (error) {
      setIsConnected(false)
      setLastChecked(new Date())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const getStatusColor = () => {
    if (isConnected === null) return "bg-gray-100 text-gray-800"
    return isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getStatusText = () => {
    if (isConnected === null) return "Checking..."
    return isConnected ? "Connected" : "Disconnected"
  }

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-3 w-3 animate-spin" />
    if (isConnected === null) return <Wifi className="h-3 w-3" />
    return isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Database Connection
          <Button
            variant="ghost"
            size="sm"
            onClick={checkConnection}
            disabled={isLoading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
        {lastChecked && (
          <p className="text-xs text-gray-500 mt-1">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
