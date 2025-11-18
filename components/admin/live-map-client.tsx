"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, RefreshCw, Users, Wifi, WifiOff, Battery, Clock, Search, X, MessageSquare } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getRepresentativeLiveLocations, getRepresentativesWithLastLocation, RepresentativeWithLocation } from "@/lib/representative-live-locations"
import { getCustomers, Customer } from "@/lib/customers"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Add bounce animation styles
const bounceAnimation = `
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
`

// Custom marker icons using Font Awesome icons as base64 data URLs
const createCustomIcon = (icon: string, color: string, size: number = 32) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = size
  canvas.height = size

  // Draw circle background
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, 2 * Math.PI)
  ctx.fill()

  // Draw white border
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 3
  ctx.stroke()

  // Draw icon (simplified text-based icons)
  ctx.fillStyle = 'white'
  ctx.font = `${size * 0.6}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(icon, size / 2, size / 2)

  return canvas.toDataURL()
}

// Customer icon (blue with user icon)
const CustomerIcon = L.icon({
  iconUrl: createCustomIcon('👤', '#3B82F6', 32),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  tooltipAnchor: [16, -8],
})

// Online representative icon (green with person icon)
const OnlineRepresentativeIcon = L.icon({
  iconUrl: createCustomIcon('👨‍💼', '#10B981', 32),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  tooltipAnchor: [16, -8],
})

// Offline representative icon (red with person icon)
const OfflineRepresentativeIcon = L.icon({
  iconUrl: createCustomIcon('👨‍💼', '#EF4444', 32),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  tooltipAnchor: [16, -8],
})

// Default icon for fallback
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface LiveMapClientProps {
  onNavigateToChatSupport?: (representativeId: string) => void
}

export default function LiveMapClient({ onNavigateToChatSupport }: LiveMapClientProps = {}) {
  const { isRTL } = useLanguage()
  const [representatives, setRepresentatives] = useState<RepresentativeWithLocation[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const [mapKey] = useState(() => `map-${Date.now()}`)
  const mapRef = useRef<L.Map | null>(null)
  const mapDivRef = useRef<HTMLDivElement | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  
  // Search functionality
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<{
    representatives: RepresentativeWithLocation[]
    customers: Customer[]
  }>({ representatives: [], customers: [] })
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const autoFocusRef = useRef(false) // Track if we should auto-focus from URL
  
  // Selected online representative for dropdown
  const [selectedOnlineRep, setSelectedOnlineRep] = useState<string>("")
  // Selected offline representative for dropdown
  const [selectedOfflineRep, setSelectedOfflineRep] = useState<string>("")

  // Click outside handler to close search results
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowSearchResults(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  // Search functionality
  const performSearch = (term: string) => {
    if (!term.trim()) {
      setSearchResults({ representatives: [], customers: [] })
      setShowSearchResults(false)
      return
    }

    const lowerTerm = term.toLowerCase()
    
    const filteredReps = representatives.filter(rep => 
      rep.representative_name?.toLowerCase().includes(lowerTerm) ||
      rep.representative_id?.toLowerCase().includes(lowerTerm) ||
      rep.representative_phone?.toLowerCase().includes(lowerTerm)
    )
    
    const filteredCustomers = customers.filter(customer => 
      customer.name?.toLowerCase().includes(lowerTerm) ||
      customer.customer_id?.toLowerCase().includes(lowerTerm) ||
      customer.phone?.toLowerCase().includes(lowerTerm)
    )
    
    setSearchResults({ representatives: filteredReps, customers: filteredCustomers })
    setShowSearchResults(true)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    performSearch(value)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults({ representatives: [], customers: [] })
    setShowSearchResults(false)
  }

  const focusOnResult = (type: 'representative' | 'customer', item: any) => {
    // Check if coordinates exist and are valid numbers
    const hasValidCoordinates = item.latitude && item.longitude && 
      !isNaN(Number(item.latitude)) && !isNaN(Number(item.longitude)) &&
      Number(item.latitude) !== 0 && Number(item.longitude) !== 0
    
    if (mapRef.current && hasValidCoordinates) {
      const lat = Number(item.latitude)
      const lng = Number(item.longitude)
      
      // Center the map on the selected location with smooth animation
      mapRef.current.setView([lat, lng], 16, {
        animate: true,
        duration: 1.5
      })
      
      // Add a temporary highlight effect
      setTimeout(() => {
        // Find and open the marker popup
        if (markersLayerRef.current) {
          let markerFound = false
          markersLayerRef.current.eachLayer((layer: any) => {
            if (layer instanceof L.Marker) {
              const markerLat = layer.getLatLng().lat
              const markerLng = layer.getLatLng().lng
              if (Math.abs(markerLat - lat) < 0.0001 && Math.abs(markerLng - lng) < 0.0001) {
                layer.openPopup()
                markerFound = true
                
                // Add a temporary bounce effect
                const markerElement = layer.getElement()
                if (markerElement) {
                  markerElement.style.animation = 'bounce 0.6s ease-in-out'
                  setTimeout(() => {
                    markerElement.style.animation = ''
                  }, 600)
                }
              }
            }
          })
          
          // If marker not found, show a toast message
          if (!markerFound) {
            toast.info(`${type === 'representative' ? 'Representative' : 'Customer'} location not found on map`)
          }
        }
      }, 1000) // Wait for map animation to complete
      
      // Show success message
      const itemName = type === 'representative' ? item.representative_name : item.name
      toast.success(`Focused on ${itemName}'s location`)
    } else {
      // Show error if coordinates are missing
      const itemName = type === 'representative' ? item.representative_name : item.name
      const errorMessage = type === 'representative' 
        ? `${itemName} has not shared their location yet. They need to enable location sharing in their mobile app.`
        : `${itemName} location coordinates not available`
      
      toast.error(errorMessage)
    }
    
    setShowSearchResults(false)
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch both representatives and customers simultaneously
      // Use the optimized function that gets last known locations for all representatives
      const [repResult, customerResult] = await Promise.all([
        getRepresentativesWithLastLocation(),
        getCustomers()
      ])
      
      console.log('Representative data:', repResult.data, 'Error:', repResult.error)
      console.log('Customer data:', customerResult.data, 'Error:', customerResult.error)
      
      // Debug: Log representatives with location data
      if (repResult.data) {
        const withLocation = repResult.data.filter(rep => rep.latitude && rep.longitude)
        const withoutLocation = repResult.data.filter(rep => !rep.latitude || !rep.longitude)
        console.log(`Representatives with location: ${withLocation.length}`)
        console.log(`Representatives without location: ${withoutLocation.length}`)
        console.log('Representatives with locations:', withLocation.map(rep => ({
          name: rep.representative_name,
          id: rep.representative_id,
          lat: rep.latitude,
          lng: rep.longitude,
          timestamp: rep.timestamp,
          is_online: rep.is_online
        })))
      }
      
      // Set both datasets regardless of individual errors
      setRepresentatives(repResult.data || [])
      setCustomers(customerResult.data || [])
      
      // Only show error if both fail completely
      if (repResult.error && customerResult.error) {
        throw new Error('Failed to load both representatives and customers')
      }
      
      // Show warnings for partial failures
      if (repResult.error) {
        console.warn('Representative data failed to load:', repResult.error)
        toast.warning('Representative locations could not be loaded')
      }
      if (customerResult.error) {
        console.warn('Customer data failed to load:', customerResult.error)
        toast.warning('Customer locations could not be loaded')
      }
      
      setLastUpdated(new Date())
    } catch (e: any) {
      console.error('Error in fetchData:', e)
      setError(e?.message || "Failed to load data")
      toast.error(e?.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  // Calculate online reps and counts using useMemo
  const onlineReps = useMemo(() => {
    return representatives.filter(r => r.is_online)
  }, [representatives])

  const offlineReps = useMemo(() => {
    return representatives.filter(r => !r.is_online)
  }, [representatives])

  const onlineRepCount = useMemo(() => onlineReps.length, [onlineReps])
  const offlineRepCount = useMemo(() => offlineReps.length, [offlineReps])
  const customerCount = useMemo(() => customers.length, [customers])
  const totalCount = useMemo(() => {
    return representatives.length + customers.length
  }, [representatives, customers])

  // Handle online rep selection from dropdown
  const handleOnlineRepSelect = (repId: string) => {
    setSelectedOnlineRep(repId)
    if (repId) {
      const selectedRep = onlineReps.find(r => r.id === repId || r.representative_id === repId)
      if (selectedRep) {
        focusOnResult('representative', selectedRep)
      }
    }
  }

  // Handle offline rep selection from dropdown
  const handleOfflineRepSelect = (repId: string) => {
    setSelectedOfflineRep(repId)
    if (repId) {
      const selectedRep = offlineReps.find(r => r.id === repId || r.representative_id === repId)
      if (selectedRep) {
        // Focus on the representative's location on the map
        focusOnResult('representative', selectedRep)
      }
    }
  }

  // Handle navigation to chat support (for both online and offline reps)
  const handleNavigateToChat = (repId: string) => {
    if (onNavigateToChatSupport) {
      onNavigateToChatSupport(repId)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchData()
    // Update every minute (60 seconds)
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  // Clear selected online rep if they're no longer online or no longer in the list
  useEffect(() => {
    if (selectedOnlineRep) {
      const repStillOnline = onlineReps.some(r => 
        (r.id === selectedOnlineRep || r.representative_id === selectedOnlineRep)
      )
      if (!repStillOnline) {
        setSelectedOnlineRep("")
      }
    }
  }, [onlineReps, selectedOnlineRep])

  // Clear selected offline rep if they're no longer offline or no longer in the list
  useEffect(() => {
    if (selectedOfflineRep) {
      const repStillOffline = offlineReps.some(r => 
        (r.id === selectedOfflineRep || r.representative_id === selectedOfflineRep)
      )
      if (!repStillOffline) {
        setSelectedOfflineRep("")
      }
    }
  }, [offlineReps, selectedOfflineRep])

  // Read URL parameter for auto-search
  useEffect(() => {
    console.log('LiveMapClient: Checking for URL parameters...')
    const urlParams = new URLSearchParams(window.location.search)
    const searchParam = urlParams.get('search')
    console.log('LiveMapClient: URL search parameter:', searchParam)
    if (searchParam) {
      console.log('LiveMapClient: Setting search term to:', searchParam)
      setSearchTerm(searchParam)
      autoFocusRef.current = true // Mark that we should auto-focus
      // Clear the URL parameter after reading it
      const url = new URL(window.location.href)
      url.searchParams.delete('search')
      window.history.replaceState({}, '', url.toString())
      console.log('LiveMapClient: URL parameter cleared')
    }
  }, [])

  // Perform search when searchTerm changes or when data is loaded
  useEffect(() => {
    if (searchTerm && (representatives.length > 0 || customers.length > 0)) {
      performSearch(searchTerm)
    }
  }, [searchTerm, representatives, customers])

  // Auto-focus on first result when search results are populated from URL
  useEffect(() => {
    if (autoFocusRef.current && (searchResults.representatives.length > 0 || searchResults.customers.length > 0)) {
      // Wait a bit for map to be ready, then auto-focus on first representative
      setTimeout(() => {
        if (searchResults.representatives.length > 0) {
          const firstRep = searchResults.representatives[0]
          if (firstRep.latitude && firstRep.longitude && 
              !isNaN(Number(firstRep.latitude)) && !isNaN(Number(firstRep.longitude)) &&
              Number(firstRep.latitude) !== 0 && Number(firstRep.longitude) !== 0) {
            focusOnResult('representative', firstRep)
            autoFocusRef.current = false // Reset flag after focusing
          }
        } else if (searchResults.customers.length > 0) {
          const firstCustomer = searchResults.customers[0]
          if (firstCustomer.latitude && firstCustomer.longitude &&
              !isNaN(Number(firstCustomer.latitude)) && !isNaN(Number(firstCustomer.longitude)) &&
              Number(firstCustomer.latitude) !== 0 && Number(firstCustomer.longitude) !== 0) {
            focusOnResult('customer', firstCustomer)
            autoFocusRef.current = false // Reset flag after focusing
          }
        }
      }, 1000) // Wait 1s for map and search results to be ready
    }
  }, [searchResults])

  // Inject bounce animation CSS
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = bounceAnimation
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const center = useMemo(() => {
    if (representatives.length > 0) {
      const first = representatives.find(r => r.latitude && r.longitude)
      if (first) return [Number(first.latitude), Number(first.longitude)] as [number, number]
    }
    if (customers.length > 0) {
      const first = customers.find(c => c.latitude && c.longitude)
      if (first) return [Number(first.latitude), Number(first.longitude)] as [number, number]
    }
    return [33.3152, 44.3661] as [number, number] // Baghdad fallback
  }, [representatives, customers])

  // Initialize Leaflet map once after mount
  useEffect(() => {
    if (!mounted) return
    if (mapRef.current || !mapDivRef.current) return
    const map = L.map(mapDivRef.current).setView(center, 11)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map)
    markersLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersLayerRef.current = null
    }
  }, [mounted])

  // Update center when it changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center)
    }
  }, [center])

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return
    const layer = markersLayerRef.current
    layer.clearLayers()
    
    console.log('Updating markers - Representatives:', representatives.length, 'Customers:', customers.length)
    
    // Add representative markers
    representatives.forEach((rep, index) => {
      console.log(`Representative ${index}:`, rep)
      // Show marker for all reps, even if coordinates are 0/null/undefined
      let lat = typeof rep.latitude === 'number' ? rep.latitude : 0;
      let lng = typeof rep.longitude === 'number' ? rep.longitude : 0;
      const marker = L.marker([lat, lng], {
        icon: rep.is_online ? OnlineRepresentativeIcon : OfflineRepresentativeIcon
      })
      
      const lastSeen = new Date(rep.last_seen || rep.timestamp)
      const minutesAgo = Math.floor((Date.now() - lastSeen.getTime()) / (1000 * 60))
      // Use id field which is the primary key in representatives table (matches chat support)
      const repId = rep.id || rep.representative_id
      
      // Create a unique ID for the chat button (sanitize repId to ensure valid HTML ID)
      const sanitizedRepId = repId.replace(/[^a-zA-Z0-9-]/g, '-')
      const chatButtonId = `chat-btn-${sanitizedRepId}`
      
      const html = `<div style="line-height:1.3; min-width: 200px;">
        <div style="font-weight:600; font-size:14px; margin-bottom:4px;">
          ${rep.representative_name || 'Unknown Representative'}
        </div>
        <div style="font-size:12px; color:#4b5563; margin-bottom:2px;">
          📞 ${rep.representative_phone || 'N/A'}
        </div>
        <div style="font-size:12px; color:#4b5563; margin-bottom:2px;">
          🆔 ${rep.representative_id}
        </div>
        <div style="display:flex; align-items:center; gap:4px; margin-bottom:2px;">
          ${rep.is_online ? 
            '<span style="color:#10b981; font-size:12px;">🟢 Online</span>' : 
            '<span style="color:#ef4444; font-size:12px;">🔴 Offline</span>'
          }
        </div>
        <div style="font-size:11px; color:#6b7280; margin-bottom:8px;">
          ${isRTL ? 'آخر ظهور:' : 'Last seen:'} ${minutesAgo} ${isRTL ? 'دقيقة' : 'min'} ago
        </div>
        ${rep.battery_level !== null ? `
          <div style="font-size:11px; color:#6b7280; display:flex; align-items:center; gap:2px; margin-bottom:4px;">
            🔋 ${rep.battery_level}% ${rep.is_charging ? '(Charging)' : ''}
          </div>
        ` : ''}
        ${rep.speed !== null ? `
          <div style="font-size:11px; color:#6b7280; margin-bottom:8px;">
            🚗 ${rep.speed} km/h
          </div>
        ` : ''}
        <button id="${chatButtonId}" style="width:100%; padding:8px 12px; background-color:#3b82f6; color:white; border:none; border-radius:6px; cursor:pointer; font-size:12px; font-weight:500; display:flex; align-items:center; justify-content:center; gap:6px; margin-top:8px; transition:background-color 0.2s;" onmouseover="this.style.backgroundColor='#2563eb'" onmouseout="this.style.backgroundColor='#3b82f6'">
          💬 ${isRTL ? 'محادثة' : 'Chat'}
        </button>
      </div>`
      
      marker.bindPopup(html)
      marker.addTo(layer)
      
      // Add click event listener to the chat button after popup is opened
      marker.on('popupopen', () => {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          const chatButton = document.getElementById(chatButtonId)
          if (chatButton && onNavigateToChatSupport) {
            chatButton.onclick = (e) => {
              e.preventDefault()
              e.stopPropagation()
              if (onNavigateToChatSupport) {
                onNavigateToChatSupport(repId)
                marker.closePopup()
              }
            }
          }
        }, 100)
      })
      console.log(`Added representative marker at: ${lat}, ${lng}`)
    })
    
    // Add customer markers (fallback)
    customers.forEach((customer, index) => {
      console.log(`Customer ${index}:`, customer)
      if (customer.latitude && customer.longitude) {
        const marker = L.marker([Number(customer.latitude), Number(customer.longitude)], {
          icon: CustomerIcon
        })
        
        const html = `<div style="line-height:1.3; min-width: 200px;">
          <div style="font-weight:600; font-size:14px; margin-bottom:4px;">
            ${customer.name}
          </div>
          <div style="font-size:12px; color:#4b5563; margin-bottom:2px;">
            📞 ${customer.phone || 'N/A'}
          </div>
          <div style="font-size:12px; color:#4b5563; margin-bottom:2px;">
            🆔 ${customer.customer_id}
          </div>
          <div style="font-size:11px; color:#6b7280;">
            ${isRTL ? 'الحالة:' : 'Status:'} ${customer.status}
          </div>
          <div style="font-size:11px; color:#6b7280;">
            ${isRTL ? 'العنوان:' : 'Address:'} ${customer.address || 'N/A'}
          </div>
        </div>`
        
        marker.bindPopup(html)
        marker.addTo(layer)
        console.log(`Added customer marker at: ${customer.latitude}, ${customer.longitude}`)
      } else {
        console.log(`Customer ${index} missing coordinates:`, customer.latitude, customer.longitude)
      }
    })
    
    console.log(`Total markers added: ${layer.getLayers().length}`)
  }, [representatives, customers, isRTL, onNavigateToChatSupport])

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          {isRTL ? "الخريطة المباشرة" : "Live Map"}
        </h2>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          {lastUpdated && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {isRTL ? "آخر تحديث:" : "Last updated:"} {lastUpdated.toLocaleTimeString(isRTL ? 'ar-IQ' : undefined)}
            </span>
          )}
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {isRTL ? "تحديث" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{totalCount}</div>
                <div className="text-sm text-gray-600">{isRTL ? "إجمالي النقاط" : "Total Locations"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{onlineRepCount}</div>
                    <div className="text-sm text-gray-600">{isRTL ? "مندوبين متصلين" : "Online Reps"}</div>
                  </div>
                </div>
              </div>
              {onlineRepCount > 0 && (
                <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                  <Select value={selectedOnlineRep} onValueChange={handleOnlineRepSelect}>
                    <SelectTrigger className="flex-1 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
                      <SelectValue placeholder={isRTL ? "اختر مندوب متصل..." : "Select online rep..."} />
                    </SelectTrigger>
                    <SelectContent dir={isRTL ? 'rtl' : 'ltr'}>
                      {onlineReps.map((rep) => {
                        const repId = rep.id || rep.representative_id
                        return (
                          <SelectItem 
                            key={repId} 
                            value={repId}
                          >
                            <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                              <span className="flex-1">{rep.representative_name || (isRTL ? 'غير معروف' : 'Unknown')}</span>
                              {rep.latitude && rep.longitude && 
                               !isNaN(Number(rep.latitude)) && !isNaN(Number(rep.longitude)) &&
                               Number(rep.latitude) !== 0 && Number(rep.longitude) !== 0 && (
                                <MapPin className="h-3 w-3 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {selectedOnlineRep && onNavigateToChatSupport && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigateToChat(selectedOnlineRep)}
                      className={cn("flex-shrink-0", isRTL ? "flex-row-reverse" : "flex-row")}
                      title={isRTL ? "فتح المحادثة" : "Open chat"}
                    >
                      <MessageSquare className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {isRTL ? "محادثة" : "Chat"}
                    </Button>
                  )}
                </div>
              )}
              {onlineRepCount === 0 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  {isRTL ? "لا يوجد مندوبين متصلين" : "No online representatives"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WifiOff className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">{offlineRepCount}</div>
                    <div className="text-sm text-gray-600">{isRTL ? "مندوبين غير متصلين" : "Offline Reps"}</div>
                  </div>
                </div>
              </div>
              {offlineRepCount > 0 && (
                <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                  <Select value={selectedOfflineRep} onValueChange={handleOfflineRepSelect}>
                    <SelectTrigger className="flex-1 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
                      <SelectValue placeholder={isRTL ? "اختر مندوب غير متصل..." : "Select offline rep..."} />
                    </SelectTrigger>
                    <SelectContent dir={isRTL ? 'rtl' : 'ltr'}>
                      {offlineReps.map((rep) => {
                        const repId = rep.id || rep.representative_id
                        return (
                          <SelectItem 
                            key={repId} 
                            value={repId}
                          >
                            <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                              <span className="flex-1">{rep.representative_name || (isRTL ? 'غير معروف' : 'Unknown')}</span>
                              {rep.latitude && rep.longitude && 
                               !isNaN(Number(rep.latitude)) && !isNaN(Number(rep.longitude)) &&
                               Number(rep.latitude) !== 0 && Number(rep.longitude) !== 0 && (
                                <MapPin className="h-3 w-3 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {selectedOfflineRep && onNavigateToChatSupport && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigateToChat(selectedOfflineRep)}
                      className={cn("flex-shrink-0", isRTL ? "flex-row-reverse" : "flex-row")}
                      title={isRTL ? "فتح المحادثة" : "Open chat"}
                    >
                      <MessageSquare className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {isRTL ? "محادثة" : "Chat"}
                    </Button>
                  )}
                </div>
              )}
              {offlineRepCount === 0 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  {isRTL ? "لا يوجد مندوبين غير متصلين" : "No offline representatives"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{customerCount}</div>
                <div className="text-sm text-gray-600">{isRTL ? "عملاء" : "Customers"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {isRTL ? "البحث في الخريطة" : "Search on Map"}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {isRTL ? "ابحث عن المندوبين والعملاء بالاسم أو الهاتف أو الرقم التعريفي" : "Search for representatives and customers by name, phone, or ID"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={isRTL ? "ابحث عن المندوبين أو العملاء..." : "Search representatives or customers..."}
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && (searchResults.representatives.length > 0 || searchResults.customers.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {searchResults.representatives.length > 0 && (
                  <div className="p-3 border-b border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {isRTL ? "المندوبين" : "Representatives"} ({searchResults.representatives.length})
                    </h4>
                    <div className="space-y-2">
                      {searchResults.representatives.map((rep, index) => (
                        <div
                          key={`rep-${index}`}
                          onClick={() => focusOnResult('representative', rep)}
                          className={`p-2 hover:bg-gray-50 cursor-pointer rounded-md border border-gray-100 ${
                            rep.latitude && rep.longitude && !isNaN(Number(rep.latitude)) && !isNaN(Number(rep.longitude)) && 
                            Number(rep.latitude) !== 0 && Number(rep.longitude) !== 0 ? 'hover:border-blue-300' : 'opacity-60 cursor-not-allowed'
                          }`}
                          title={rep.latitude && rep.longitude && !isNaN(Number(rep.latitude)) && !isNaN(Number(rep.longitude)) && 
                            Number(rep.latitude) !== 0 && Number(rep.longitude) !== 0 ? 
                            (isRTL ? "انقر للانتقال إلى الموقع" : "Click to go to location") : 
                            (isRTL ? "الموقع غير متوفر - يحتاج المندوب لتفعيل مشاركة الموقع" : "Location not available - Representative needs to enable location sharing")
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm flex items-center gap-2">
                                {rep.representative_name || 'Unknown'}
                                {rep.latitude && rep.longitude && !isNaN(Number(rep.latitude)) && !isNaN(Number(rep.longitude)) && 
                                  Number(rep.latitude) !== 0 && Number(rep.longitude) !== 0 && (
                                  <MapPin className="h-3 w-3 text-blue-500" />
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {isRTL ? "الهاتف:" : "Phone:"} {rep.representative_phone || 'N/A'} | 
                                {isRTL ? " الرقم:" : " ID:"} {rep.representative_id}
                              </div>
                              {rep.latitude && rep.longitude && !isNaN(Number(rep.latitude)) && !isNaN(Number(rep.longitude)) && 
                                Number(rep.latitude) !== 0 && Number(rep.longitude) !== 0 ? (
                                <div className="text-xs text-green-600 mt-1">
                                  {isRTL ? "📍 الموقع متوفر" : "📍 Location available"}
                                </div>
                              ) : (
                                <div className="text-xs text-red-600 mt-1">
                                  {isRTL ? "❌ الموقع غير متوفر - يحتاج لتفعيل مشاركة الموقع" : "❌ Location not available - needs to enable location sharing"}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${rep.is_online ? 'bg-green-500' : 'bg-red-500'}`} />
                              {rep.latitude && rep.longitude && !isNaN(Number(rep.latitude)) && !isNaN(Number(rep.longitude)) && 
                                Number(rep.latitude) !== 0 && Number(rep.longitude) !== 0 && (
                                <div className="text-xs text-blue-500">
                                  {isRTL ? "انقر للانتقال" : "Click to go"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchResults.customers.length > 0 && (
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {isRTL ? "العملاء" : "Customers"} ({searchResults.customers.length})
                    </h4>
                    <div className="space-y-2">
                      {searchResults.customers.map((customer, index) => (
                        <div
                          key={`customer-${index}`}
                          onClick={() => focusOnResult('customer', customer)}
                          className={`p-2 hover:bg-gray-50 cursor-pointer rounded-md border border-gray-100 ${
                            customer.latitude && customer.longitude ? 'hover:border-blue-300' : 'opacity-60 cursor-not-allowed'
                          }`}
                          title={customer.latitude && customer.longitude ? 
                            (isRTL ? "انقر للانتقال إلى الموقع" : "Click to go to location") : 
                            (isRTL ? "الموقع غير متوفر" : "Location not available")
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm flex items-center gap-2">
                                {customer.name}
                                {customer.latitude && customer.longitude && (
                                  <MapPin className="h-3 w-3 text-blue-500" />
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {isRTL ? "الهاتف:" : "Phone:"} {customer.phone || 'N/A'} | 
                                {isRTL ? " الرقم:" : " ID:"} {customer.customer_id}
                              </div>
                              {customer.latitude && customer.longitude && (
                                <div className="text-xs text-green-600 mt-1">
                                  {isRTL ? "📍 الموقع متوفر" : "📍 Location available"}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              {customer.latitude && customer.longitude && (
                                <div className="text-xs text-blue-500">
                                  {isRTL ? "انقر للانتقال" : "Click to go"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* No Results Message */}
            {showSearchResults && searchTerm && searchResults.representatives.length === 0 && searchResults.customers.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                <div className="text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    {isRTL ? "لم يتم العثور على نتائج" : "No results found"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isRTL ? "جرب البحث بالاسم أو الهاتف أو الرقم التعريفي" : "Try searching by name, phone, or ID"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isRTL ? "الخريطة المباشرة" : "Live Map"}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {isRTL ? "تحديث تلقائي كل دقيقة" : "Auto-refresh every minute"}
          </p>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                👨‍💼
              </div>
              <span className="text-sm text-gray-700">
                {isRTL ? "مندوبين متصلين" : "Online Representatives"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                👨‍💼
              </div>
              <span className="text-sm text-gray-700">
                {isRTL ? "مندوبين غير متصلين" : "Offline Representatives"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                👤
              </div>
              <span className="text-sm text-gray-700">
                {isRTL ? "عملاء" : "Customers"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-3 text-red-600 text-sm">{error}</div>
          )}
          <div key={mapKey} className="h-[70vh] w-full rounded-md overflow-hidden border">
            {mounted && (
              <div ref={mapDivRef} style={{ height: "100%", width: "100%" }} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
