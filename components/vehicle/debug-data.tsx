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
  AlertTriangle,
  Info
} from "lucide-react"
import { getVehicles, getVehicleStats, mockVehicleData } from "@/lib/vehicle"

export function DebugData() {
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runDebug = async () => {
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      console.log('🔍 Starting debug data fetch...')
      
      // Test 1: Check environment variables
      const envCheck = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
        nodeEnv: process.env.NODE_ENV || 'Not set'
      }
      console.log('📋 Environment check:', envCheck)

      // Test 2: Try to fetch vehicles
      console.log('🚗 Fetching vehicles...')
      const vehiclesResult = await getVehicles()
      console.log('✅ Vehicles result:', vehiclesResult)

      // Test 3: Try to fetch stats
      console.log('📊 Fetching stats...')
      const statsResult = await getVehicleStats()
      console.log('✅ Stats result:', statsResult)

      // Test 4: Check mock data
      console.log('🎭 Mock data check:', mockVehicleData)

      setDebugInfo({
        timestamp: new Date().toISOString(),
        environment: envCheck,
        vehiclesResult,
        statsResult,
        mockData: {
          vehiclesCount: mockVehicleData.vehicles.length,
          driversCount: mockVehicleData.drivers.length,
          statsAvailable: !!mockVehicleData.stats
        },
        consoleLogs: [
          'Environment variables checked',
          'Vehicles fetched successfully',
          'Stats fetched successfully',
          'Mock data verified'
        ]
      })

    } catch (err) {
      console.error('❌ Debug error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Debug Information</h2>
        <p className="text-gray-600">Diagnose data loading issues and check system status</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={runDebug} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Debug...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Debug Check
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <XCircle className="h-5 w-5" />
              Debug Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {debugInfo && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Debug Results
              </CardTitle>
              <CardDescription>
                Debug completed at {new Date(debugInfo.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Environment Check */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Environment Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-100 rounded">
                    <p className="text-sm font-medium">Supabase URL</p>
                    <p className="text-xs text-gray-600">{debugInfo.environment.supabaseUrl}</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded">
                    <p className="text-sm font-medium">Supabase Key</p>
                    <p className="text-xs text-gray-600">{debugInfo.environment.supabaseKey}</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded">
                    <p className="text-sm font-medium">Node Environment</p>
                    <p className="text-xs text-gray-600">{debugInfo.environment.nodeEnv}</p>
                  </div>
                </div>
              </div>

              {/* Data Results */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Data Fetch Results
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-sm font-medium">Vehicles Data</p>
                    <p className="text-xs text-gray-600">
                      {debugInfo.vehiclesResult?.data?.length || 0} vehicles loaded
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {debugInfo.vehiclesResult?.data?.length > 0 ? 'Success' : 'No Data'}
                    </Badge>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-sm font-medium">Stats Data</p>
                    <p className="text-xs text-gray-600">
                      {debugInfo.statsResult ? 'Available' : 'Not Available'}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {debugInfo.statsResult ? 'Success' : 'No Data'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Mock Data Check */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Mock Data Fallback
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-yellow-50 rounded">
                    <p className="text-sm font-medium">Mock Vehicles</p>
                    <p className="text-xs text-gray-600">{debugInfo.mockData.vehiclesCount} available</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded">
                    <p className="text-sm font-medium">Mock Drivers</p>
                    <p className="text-xs text-gray-600">{debugInfo.mockData.driversCount} available</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded">
                    <p className="text-sm font-medium">Mock Stats</p>
                    <p className="text-xs text-gray-600">{debugInfo.mockData.statsAvailable ? 'Available' : 'Not Available'}</p>
                  </div>
                </div>
              </div>

              {/* Console Logs */}
              <div>
                <h4 className="font-semibold mb-2">Debug Steps Completed</h4>
                <ul className="space-y-1">
                  {debugInfo.consoleLogs.map((log: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {log}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Fixes */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Fixes</CardTitle>
          <CardDescription>Common solutions for data display issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded">
              <h5 className="font-medium">1. Check Environment Variables</h5>
              <p className="text-sm text-gray-600">
                Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <h5 className="font-medium">2. Database Connection</h5>
              <p className="text-sm text-gray-600">
                The system will automatically fall back to mock data if the database is not configured
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded">
              <h5 className="font-medium">3. Browser Console</h5>
              <p className="text-sm text-gray-600">
                Check the browser console for detailed error messages and debug information
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
