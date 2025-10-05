"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Clock, ExternalLink } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

interface LocationData {
  latitude: number
  longitude: number
  address?: string
  timestamp?: string
  label?: string
}

interface OpenStreetMapDisplayProps {
  startLocation?: LocationData
  endLocation?: LocationData
  className?: string
}

export function OpenStreetMapDisplay({ 
  startLocation, 
  endLocation, 
  className = "" 
}: OpenStreetMapDisplayProps) {
  const { t, isRTL } = useLanguage()
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  // Generate OpenStreetMap URL
  const generateMapUrl = (lat: number, lon: number, zoom: number = 15) => {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lon}`
  }

  // Generate external map link
  const generateExternalMapUrl = (lat: number, lon: number) => {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=15`
  }

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Format distance
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  // Format timestamp
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return null
    return new Date(timestamp).toLocaleString()
  }

  // Get distance between start and end locations
  const getDistance = () => {
    if (!startLocation || !endLocation) return null
    return calculateDistance(
      startLocation.latitude,
      startLocation.longitude,
      endLocation.latitude,
      endLocation.longitude
    )
  }

  const distance = getDistance()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Start Location */}
      {startLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              {isRTL ? "موقع البداية" : "Start Location"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? "الإحداثيات" : "Coordinates"}
                </div>
                <div className="text-sm text-gray-600">
                  {startLocation.latitude.toFixed(6)}, {startLocation.longitude.toFixed(6)}
                </div>
              </div>
              
              {startLocation.timestamp && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? "الوقت" : "Time"}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(startLocation.timestamp)}
                  </div>
                </div>
              )}
            </div>

            {startLocation.address && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? "العنوان" : "Address"}
                </div>
                <div className="text-sm text-gray-600">{startLocation.address}</div>
              </div>
            )}

            {/* OpenStreetMap Embed */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">
                {isRTL ? "الخريطة" : "Map"}
              </div>
              <div className="relative">
                <iframe
                  src={generateMapUrl(startLocation.latitude, startLocation.longitude)}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 hover:bg-white"
                    onClick={() => window.open(generateExternalMapUrl(startLocation.latitude, startLocation.longitude), '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {isRTL ? "فتح في خريطة جديدة" : "Open in new map"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* End Location */}
      {endLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-4 w-4 text-red-600" />
              {isRTL ? "موقع النهاية" : "End Location"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? "الإحداثيات" : "Coordinates"}
                </div>
                <div className="text-sm text-gray-600">
                  {endLocation.latitude.toFixed(6)}, {endLocation.longitude.toFixed(6)}
                </div>
              </div>
              
              {endLocation.timestamp && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? "الوقت" : "Time"}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(endLocation.timestamp)}
                  </div>
                </div>
              )}
            </div>

            {endLocation.address && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? "العنوان" : "Address"}
                </div>
                <div className="text-sm text-gray-600">{endLocation.address}</div>
              </div>
            )}

            {/* OpenStreetMap Embed */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">
                {isRTL ? "الخريطة" : "Map"}
              </div>
              <div className="relative">
                <iframe
                  src={generateMapUrl(endLocation.latitude, endLocation.longitude)}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 hover:bg-white"
                    onClick={() => window.open(generateExternalMapUrl(endLocation.latitude, endLocation.longitude), '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {isRTL ? "فتح في خريطة جديدة" : "Open in new map"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distance Information */}
      {distance !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-4 w-4 text-blue-600" />
              {isRTL ? "معلومات المسافة" : "Distance Information"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {formatDistance(distance)}
              </Badge>
              <div className="text-sm text-gray-600">
                {isRTL ? "المسافة بين موقع البداية والنهاية" : "Distance between start and end locations"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Location Data */}
      {!startLocation && !endLocation && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">
                {isRTL ? "لا توجد بيانات موقع" : "No Location Data"}
              </p>
              <p className="text-sm">
                {isRTL ? "لم يتم تسجيل مواقع البداية أو النهاية لهذه المهمة" : "No start or end locations have been recorded for this task"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
