'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, Warehouse, TrendingUp, AlertCircle } from 'lucide-react';
import { getWarehouseStats, getStockAlerts } from '@/lib/warehouse';
import type { WarehouseStats, StockAlert } from '@/types/warehouse';

export function WarehouseDashboard() {
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, alertsData] = await Promise.all([
        getWarehouseStats(),
        getStockAlerts()
      ]);
      setStats(statsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_warehouses || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active warehouse locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active products in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_inventory_value || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total units in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.low_stock_items || 0}</div>
            <p className="text-xs text-muted-foreground">
              Items below minimum stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Stock Alerts
          </CardTitle>
          <CardDescription>
            Products that need attention due to low stock levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No stock alerts at this time</p>
              <p className="text-sm">All products are well stocked</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{alert.product_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {alert.warehouse_name}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">{alert.current_quantity}</span>
                      <span className="text-muted-foreground"> / {alert.minimum_stock_level}</span>
                    </div>
                    <Badge 
                      variant={alert.alert_type === 'LOW_STOCK' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {alert.alert_type === 'LOW_STOCK' ? 'Low Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                </div>
              ))}
              {alerts.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All Alerts ({alerts.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common warehouse management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Package className="h-6 w-6" />
              <span>Add Product</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Warehouse className="h-6 w-6" />
              <span>Manage Warehouses</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>Stock Movement</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <AlertTriangle className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
