import { WarehouseDashboard } from '@/components/warehouse/warehouse-dashboard';
import { WarehouseManagement } from '@/components/warehouse/warehouse-management';

export default function WarehousePage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">🏭 Warehouse Management</h1>
        <p className="text-muted-foreground">
          Manage plastic products inventory, warehouses, and stock levels for Al-Rafidain Industrial Company
        </p>
      </div>
      
      <WarehouseDashboard />
      <WarehouseManagement />
    </div>
  );
}
