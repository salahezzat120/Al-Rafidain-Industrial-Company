// Comprehensive Warehouse Management Types for Al-Rafidain Industrial Company

export interface Warehouse {
  id: number;
  warehouse_name: string;
  warehouse_name_ar: string;
  location: string;
  location_ar: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  responsible_person?: string;
  responsible_person_ar?: string;
  warehouse_type: 'FACTORY' | 'DISTRIBUTION' | 'SUB_STORE' | 'MAIN';
  capacity: number;
  current_utilization: number;
  contact_phone?: string;
  contact_email?: string;
  is_active: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
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
  product_name_ar: string;
  product_code: string;
  barcode?: string;
  stock_number?: string;
  stock_number_ar?: string;
  main_group: string; // Changed from ID to direct string
  sub_group?: string; // Changed from ID to direct string
  color: string; // Changed from ID to direct string
  material: string; // Changed from ID to direct string
  unit: string; // Changed from ID to direct string
  description?: string;
  description_ar?: string;
  specifications?: Record<string, any>;
  cost_price: number;
  selling_price: number;
  weight?: number;
  dimensions?: string;
  expiry_date?: string;
  serial_number?: string;
  warehouses?: string; // Comma-separated warehouse names
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  movement_type: 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'RETURN' | 'ADJUSTMENT' | 'STOCKTAKING' | 'IN' | 'OUT';
  movement_type_ar?: string;
  quantity: number;
  unit_price?: number;
  total_value?: number;
  reference_number?: string;
  reference_number_ar?: string;
  reference_type?: 'PURCHASE_ORDER' | 'SALES_ORDER' | 'PRODUCTION' | 'TRANSFER' | 'RETURN' | 'STOCKTAKING';
  notes?: string;
  notes_ar?: string;
  created_by?: string;
  created_by_ar?: string;
  approved_by?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
  
  // Related data
  product?: Product;
  warehouse?: Warehouse;
  from_warehouse?: Warehouse;
  to_warehouse?: Warehouse;
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
  warehouse_name_ar?: string;
  location: string;
  location_ar?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  responsible_person?: string;
  responsible_person_ar?: string;
  warehouse_type?: 'FACTORY' | 'DISTRIBUTION' | 'SUB_STORE' | 'MAIN';
  capacity?: number;
  contact_phone?: string;
  contact_email?: string;
}

export interface UpdateWarehouseData extends Partial<CreateWarehouseData> {
  id: number;
}

export interface CreateProductData {
  product_name: string;
  product_name_ar?: string;
  product_code?: string;
  stock_number?: string;
  stock_number_ar?: string;
  barcode?: string;
  main_group_id: number;
  sub_group_id?: number;
  color_id?: number;
  material_id?: number;
  unit_of_measurement_id: number;
  description?: string;
  description_ar?: string;
  cost_price?: number;
  selling_price?: number;
  weight?: number;
  dimensions?: string;
  expiry_date?: string;
  serial_number?: string;
  warehouses?: string;
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
  movement_type: 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'RETURN' | 'ADJUSTMENT' | 'IN' | 'OUT';
  quantity: number;
  unit_price?: number;
  reference_number?: string;
  reference_number_ar?: string;
  notes?: string;
  notes_ar?: string;
  created_by?: string;
  created_by_ar?: string;
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
  main_group?: string;
  sub_group?: string;
  color?: string;
  material?: string;
  unit?: string;
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

// New comprehensive types
export interface Stocktaking {
  id: number;
  warehouse_id: number;
  stocktaking_date: string;
  reference_number: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  total_items: number;
  counted_items: number;
  discrepancies: number;
  notes?: string;
  created_by: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  warehouse?: Warehouse;
  stocktaking_items?: StocktakingItem[];
}

export interface StocktakingItem {
  id: number;
  stocktaking_id: number;
  product_id: number;
  system_quantity: number;
  counted_quantity: number;
  difference: number;
  notes?: string;
  
  // Related data
  product?: Product;
}

export interface Barcode {
  id: number;
  product_id: number;
  barcode_value: string;
  barcode_type: 'CODE128' | 'QR_CODE' | 'EAN13';
  is_active: boolean;
  created_at: string;
  
  // Related data
  product?: Product;
}

export interface UnitConversion {
  id: number;
  from_unit_id: number;
  to_unit_id: number;
  conversion_factor: number;
  is_active: boolean;
  created_at: string;
  
  // Related data
  from_unit?: UnitOfMeasurement;
  to_unit?: UnitOfMeasurement;
}

// Dashboard types
export interface WarehouseStats {
  total_warehouses: number;
  total_products: number;
  total_inventory_value: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_transactions_today: number;
  pending_stocktakings: number;
  expiring_products: number;
}

export interface StockAlert {
  id: number;
  product_name: string;
  product_name_ar: string;
  warehouse_name: string;
  warehouse_name_ar: string;
  current_quantity: number;
  minimum_stock_level: number;
  alert_type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING' | 'OVERSTOCK';
  days_until_expiry?: number;
  created_at: string;
}

// Report types
export interface WarehouseReport {
  id: string;
  name: string;
  name_ar: string;
  type: 'COST_SALES' | 'CONSIGNMENT' | 'DAMAGED' | 'EXPIRY' | 'SERIAL_TRACKING' | 'PRODUCT_CARD' | 'MONITORING_CARD' | 'AGING' | 'STOCK_ANALYSIS' | 'VALUATION' | 'ISSUED_ITEMS' | 'CUSTOM';
  parameters: Record<string, any>;
  filters: Record<string, any>;
  created_by: string;
  created_at: string;
}

export interface ReportData {
  title: string;
  headers: string[];
  rows: any[][];
  summary?: Record<string, any>;
  generated_at?: string;
}
