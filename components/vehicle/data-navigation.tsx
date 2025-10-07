"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Database, 
  Table, 
  FileText, 
  BarChart3,
  ExternalLink,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export function DataNavigation() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Data Access</h2>
        <p className="text-gray-600">Choose how you want to view and interact with your vehicle fleet data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Structured Data View */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5 text-blue-600" />
              Structured Data View
            </CardTitle>
            <CardDescription>
              View data in organized tables with search and filtering capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Browse vehicles, drivers, maintenance records, fuel data, assignments, and tracking information in a user-friendly interface.
            </p>
            <Link href="/vehicle-data">
              <Button className="w-full">
                View Structured Data
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Raw Data View */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Raw Data View
            </CardTitle>
            <CardDescription>
              Access complete JSON data from all database tables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View raw JSON data from the API, download data files, and explore the complete database structure.
            </p>
            <Link href="/raw-data">
              <Button className="w-full" variant="outline">
                View Raw Data
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* API Endpoint */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              API Endpoint
            </CardTitle>
            <CardDescription>
              Direct access to the vehicle data API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Access the REST API endpoint to fetch all vehicle data programmatically.
            </p>
            <div className="space-y-2">
              <code className="block p-2 bg-gray-100 rounded text-sm">
                GET /api/vehicle-data
              </code>
              <Button 
                onClick={() => window.open('/api/vehicle-data', '_blank')}
                className="w-full" 
                variant="secondary"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open API
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Schema Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Database Schema Overview
          </CardTitle>
          <CardDescription>
            Understanding the vehicle fleet management database structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Core Tables</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <strong>vehicles</strong> - Fleet vehicle information
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <strong>drivers</strong> - Driver personnel records
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <strong>vehicle_maintenance</strong> - Service history
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <strong>fuel_records</strong> - Fuel transactions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <strong>vehicle_assignments</strong> - Vehicle-driver assignments
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <strong>vehicle_tracking</strong> - GPS tracking data
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Key Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• UUID primary keys for all records</li>
                <li>• Foreign key relationships between tables</li>
                <li>• Automatic timestamp tracking (created_at, updated_at)</li>
                <li>• Comprehensive indexing for performance</li>
                <li>• Sample data included for testing</li>
                <li>• RESTful API endpoints available</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
