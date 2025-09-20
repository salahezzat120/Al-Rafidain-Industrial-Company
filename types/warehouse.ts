// Warehouse Management Types for Al-Rafidain Industrial Company

export interface Warehouse {
  id: number;
  warehouse_name: string;
  location: string;
  responsible_person: string;
  created_at: string;
  updated_at: string;
}

export interface UnitOfMeasurement {
  id: number;
  unit_name: string;
  unit_code: string;
  is_user_defined: boolean;
  created_at: string;
}

export interface MainGroup {
  id: number;
  group_name: string;
  description?: string;
  is_user_defined: boolean;
  created_at: string;
}

export interface SubGroup {
  id: number;
  sub_group_name: string;
  main_group_id: number;
  description?: string;
  is_user_defined: boolean;
  created_at: string;
  main_group?: MainGroup;
}

export interface Color {
  id: number;
  color_name: string;
  color_code?: string;
  is_user_defined: boolean;
  created_at: string;
}

export interface Material {
  id: number;
  material_name: string;
  material_code: string;
  description?: string;
  is_user_defined: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  product_name: string;
  product_code?: string;
  main_group_id: number;
  sub_group_id?: number;
  color_id?: number;
  material_id?: number;
  unit_of_measurement_id: number;
  description?: string;
  specifications?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Related data
  main_group?: MainGroup;
  sub_group?: SubGroup;
  color?: Color;
  material?: Material;
  unit_of_measurement?: UnitOfMeasurement;
}

export interface Inventory {
  id: number;
  product_id: number;
  warehouse_id: number;
  available_quantity: number;
  minimum_stock_level: number;
  maximum_stock_level?: number;
  reorder_point?: number;
  last_updated: string;
  created_at: string;
  
  // Related data
  product?: Product;
  warehouse?: Warehouse;
}

export interface StockMovement {
  id: number;
  product_id: number;
  warehouse_id: number;
  movement_type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  reference_number?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  
  // Related data
  product?: Product;
  warehouse?: Warehouse;
}

export interface InventorySummary {
  product_id: number;
  product_name: string;
  product_code?: string;
  main_group: string;
  sub_group?: string;
  color_name?: string;
  material_name?: string;
  unit_of_measurement: string;
  warehouse_name: string;
  available_quantity: number;
  minimum_stock_level: number;
  maximum_stock_level?: number;
  reorder_point?: number;
  stock_status: 'LOW_STOCK' | 'REORDER' | 'IN_STOCK';
}

// Form types for creating/updating records
export interface CreateWarehouseData {
  warehouse_name: string;
  location: string;
  responsible_person: string;
}

export interface UpdateWarehouseData extends Partial<CreateWarehouseData> {
  id: number;
}

export interface CreateProductData {
  product_name: string;
  product_code?: string;
  main_group_id: number;
  sub_group_id?: number;
  color_id?: number;
  material_id?: number;
  unit_of_measurement_id: number;
  description?: string;
  specifications?: Record<string, any>;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: number;
  is_active?: boolean;
}

export interface CreateInventoryData {
  product_id: number;
  warehouse_id: number;
  available_quantity: number;
  minimum_stock_level: number;
  maximum_stock_level?: number;
  reorder_point?: number;
}

export interface UpdateInventoryData extends Partial<CreateInventoryData> {
  id: number;
}

export interface CreateStockMovementData {
  product_id: number;
  warehouse_id: number;
  movement_type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  reference_number?: string;
  notes?: string;
  created_by?: string;
}

// Master data creation types
export interface CreateUnitOfMeasurementData {
  unit_name: string;
  unit_code: string;
  is_user_defined?: boolean;
}

export interface CreateMainGroupData {
  group_name: string;
  description?: string;
  is_user_defined?: boolean;
}

export interface CreateSubGroupData {
  sub_group_name: string;
  main_group_id: number;
  description?: string;
  is_user_defined?: boolean;
}

export interface CreateColorData {
  color_name: string;
  color_code?: string;
  is_user_defined?: boolean;
}

export interface CreateMaterialData {
  material_name: string;
  material_code: string;
  description?: string;
  is_user_defined?: boolean;
}

// Filter and search types
export interface WarehouseFilters {
  search?: string;
  location?: string;
  responsible_person?: string;
}

export interface ProductFilters {
  search?: string;
  main_group_id?: number;
  sub_group_id?: number;
  color_id?: number;
  material_id?: number;
  is_active?: boolean;
}

export interface InventoryFilters {
  product_id?: number;
  warehouse_id?: number;
  stock_status?: 'LOW_STOCK' | 'REORDER' | 'IN_STOCK';
  min_quantity?: number;
  max_quantity?: number;
}

// API response types
export interface WarehouseResponse {
  data: Warehouse[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface InventoryResponse {
  data: InventorySummary[];
  total: number;
  page: number;
  limit: number;
}

// Dashboard types
export interface WarehouseStats {
  total_warehouses: number;
  total_products: number;
  total_inventory_value: number;
  low_stock_items: number;
  out_of_stock_items: number;
}

export interface StockAlert {
  id: number;
  product_name: string;
  warehouse_name: string;
  current_quantity: number;
  minimum_stock_level: number;
  alert_type: 'LOW_STOCK' | 'OUT_OF_STOCK';
}
