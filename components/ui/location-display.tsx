"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  Globe
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"

interface LocationDisplayProps {
  latitude?: number | null
  longitude?: number | null
  address?: string
  showMap?: boolean
  className?: string
}

export function LocationDisplay({ 
  latitude, 
  longitude, 
  address, 
  showMap = false,
  className = ""
}: LocationDisplayProps) {
  const { t, isRTL } = useLanguage()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const hasLocation = latitude && longitude

  const copyCoordinates = async () => {
    if (!hasLocation) return
    
    try {
      await navigator.clipboard.writeText(`${latitude}, ${longitude}`)
      setCopied(true)
      toast({
        title: "Success",
        description: isRTL ? "تم نسخ الإحداثيات" : "Coordinates copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: isRTL ? "فشل في نسخ الإحداثيات" : "Failed to copy coordinates",
        variant: "destructive",
      })
    }
  }

  const openInMaps = () => {
    if (!hasLocation) return
    
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
    window.open(mapsUrl, '_blank')
  }

  const openInOSM = () => {
    if (!hasLocation) return
    
    const osmUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`
    window.open(osmUrl, '_blank')
  }

  if (!hasLocation) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <MapPin className="h-4 w-4" />
        <span className="text-sm">{isRTL ? "لا يوجد موقع" : "No location"}</span>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Location Info */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
          <MapPin className="h-4 w-4 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900">
            {isRTL ? "الموقع" : "Location"}
          </div>
          <div className="text-xs text-gray-600 truncate">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </div>
          {address && (
            <div className="text-xs text-gray-500 truncate mt-1">
              {address}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={copyCoordinates}
          className="h-8 px-2 text-xs"
        >
          {copied ? (
            <CheckCircle className="h-3 w-3 mr-1" />
          ) : (
            <Copy className="h-3 w-3 mr-1" />
          )}
          {isRTL ? "نسخ" : "Copy"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={openInMaps}
          className="h-8 px-2 text-xs"
        >
          <Navigation className="h-3 w-3 mr-1" />
          {isRTL ? "خرائط جوجل" : "Google Maps"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={openInOSM}
          className="h-8 px-2 text-xs"
        >
          <Globe className="h-3 w-3 mr-1" />
          {isRTL ? "OSM" : "OSM"}
        </Button>
      </div>

      {/* Location Status Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          <MapPin className="h-3 w-3 mr-1" />
          {isRTL ? "موقع محدد" : "Location Set"}
        </Badge>
      </div>
    </div>
  )
}

export function LocationCard({ 
  latitude, 
  longitude, 
  address, 
  title,
  className = ""
}: LocationDisplayProps & { title?: string }) {
  const { t, isRTL } = useLanguage()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const hasLocation = latitude && longitude

  const copyCoordinates = async () => {
    if (!hasLocation) return
    
    try {
      await navigator.clipboard.writeText(`${latitude}, ${longitude}`)
      setCopied(true)
      toast({
        title: "Success",
        description: isRTL ? "تم نسخ الإحداثيات" : "Coordinates copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: isRTL ? "فشل في نسخ الإحداثيات" : "Failed to copy coordinates",
        variant: "destructive",
      })
    }
  }

  const openInMaps = () => {
    if (!hasLocation) return
    
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
    window.open(mapsUrl, '_blank')
  }

  if (!hasLocation) {
    return (
      <Card className={`border-dashed ${className}`}>
        <CardContent className="p-4 text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {isRTL ? "لا يوجد موقع محدد" : "No location specified"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-green-200 bg-green-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-green-800">
                {title || (isRTL ? "الموقع" : "Location")}
              </h4>
              <p className="text-xs text-green-600">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={copyCoordinates}
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-600" />
            )}
          </Button>
        </div>

        {address && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {address}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openInMaps}
            className="flex-1 h-8 text-xs"
          >
            <Navigation className="h-3 w-3 mr-1" />
            {isRTL ? "خرائط جوجل" : "Google Maps"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const osmUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`
              window.open(osmUrl, '_blank')
            }}
            className="flex-1 h-8 text-xs"
          >
            <Globe className="h-3 w-3 mr-1" />
            {isRTL ? "OSM" : "OSM"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

