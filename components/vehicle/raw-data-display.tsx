"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  RefreshCw, 
  Loader2, 
  CheckCircle, 
  XCircle,
  FileText,
  Download
} from "lucide-react"

interface VehicleDataResponse {
  success: boolean
  data: {
    vehicles: any[]
    drivers: any[]
    maintenance: any[]
    fuelRecords: any[]
    assignments: any[]
    tracking: any[]
    stats: any
  }
  counts: {
    vehicles: number
    drivers: number
    maintenance: number
    fuelRecords: number
    assignments: number
    tracking: number
  }
  error?: string
  message?: string
}

export function RawDataDisplay() {
  const [data, setData] = useState<VehicleDataResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRawData, setShowRawData] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/vehicle-data')
      const result = await response.json()
      
      if (result.success) {
        setData(result)
      } else {
        setError(result.message || 'Failed to fetch data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const downloadData = () => {
    if (!data) return
    
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'vehicle-data.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading vehicle data from API...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Raw Vehicle Data</h2>
          <p className="text-gray-600">Complete JSON data from all vehicle tables</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={downloadData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
        </div>
      </div>

      {/* Data Summary */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Vehicles</p>
                  <p className="text-2xl font-bold text-gray-900">{data.counts.vehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{data.counts.drivers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Maintenance</p>
                  <p className="text-2xl font-bold text-gray-900">{data.counts.maintenance}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.counts.vehicles + data.counts.drivers + data.counts.maintenance + 
                     data.counts.fuelRecords + data.counts.assignments + data.counts.tracking}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Toggle Raw Data Display */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Raw JSON Data</h3>
          <p className="text-gray-600">View the complete JSON response from the API</p>
        </div>
        <Button 
          onClick={() => setShowRawData(!showRawData)}
          variant="outline"
        >
          {showRawData ? 'Hide' : 'Show'} Raw Data
        </Button>
      </div>

      {/* Raw Data Display */}
      {showRawData && data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Complete API Response
            </CardTitle>
            <CardDescription>
              Raw JSON data from /api/vehicle-data endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Data Structure Info */}
      <Card>
        <CardHeader>
          <CardTitle>Data Structure</CardTitle>
          <CardDescription>Information about the data tables and their relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Core Tables</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• <strong>vehicles</strong> - Vehicle fleet information</li>
                <li>• <strong>drivers</strong> - Driver personnel records</li>
                <li>• <strong>vehicle_maintenance</strong> - Maintenance history</li>
                <li>• <strong>fuel_records</strong> - Fuel transactions</li>
                <li>• <strong>vehicle_assignments</strong> - Vehicle-driver assignments</li>
                <li>• <strong>vehicle_tracking</strong> - GPS tracking data</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Relationships</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Vehicles → Maintenance (1:many)</li>
                <li>• Vehicles → Fuel Records (1:many)</li>
                <li>• Vehicles → Assignments (1:many)</li>
                <li>• Vehicles → Tracking (1:many)</li>
                <li>• Drivers → Assignments (1:many)</li>
                <li>• All tables use UUID primary keys</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
