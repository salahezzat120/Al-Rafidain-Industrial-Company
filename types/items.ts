// Item Data & Balances Types for Al-Rafidain Industrial Company

export interface Item {
  id: number;
  item_code: string;
  item_name_ar: string;
  item_name_en: string;
  main_group_id: number;
  sub_group_id?: number;
  color_id?: number;
  material_id?: number;
  unit_of_measurement_id: number;
  barcode?: string;
  description_ar?: string;
  description_en?: string;
  specifications?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Related data
  main_group?: {
    id: number;
    group_name: string;
  };
  sub_group?: {
    id: number;
    sub_group_name: string;
  };
  color?: {
    id: number;
    color_name: string;
  };
  material?: {
    id: number;
    material_name: string;
  };
  unit_of_measurement?: {
    id: number;
    unit_name: string;
  };
}

export interface ItemUnitConversion {
  id: number;
  item_id: number;
  from_unit_id: number;
  to_unit_id: number;
  conversion_factor: number;
  created_at: string;
  
  // Related data
  from_unit?: {
    id: number;
    unit_name: string;
  };
  to_unit?: {
    id: number;
    unit_name: string;
  };
}

export interface ItemBalance {
  id: number;
  item_id: number;
  warehouse_id: number;
  opening_balance: number;
  current_balance: number;
  reserved_quantity: number;
  available_quantity: number;
  minimum_stock_level: number;
  maximum_stock_level?: number;
  reorder_point?: number;
  last_updated: string;
  created_at: string;
  
  // Related data
  item?: Item;
  warehouse?: {
    id: number;
    warehouse_name: string;
    location: string;
  };
}

export interface ItemMovement {
  id: number;
  movement_type: 'GOODS_RECEIPT' | 'GOODS_ISSUE' | 'STOCK_TRANSFER' | 'RETURN_NOTE' | 'ADJUSTMENT';
  item_id: number;
  quantity: number;
  unit_id: number;
  from_warehouse_id?: number;
  to_warehouse_id?: number;
  reference_number?: string;
  reference_type?: string;
  notes_ar?: string;
  notes_en?: string;
  created_by?: string;
  created_at: string;
  
  // Related data
  item?: Item;
  unit?: {
    id: number;
    unit_name: string;
  };
  from_warehouse?: {
    id: number;
    warehouse_name: string;
  };
  to_warehouse?: {
    id: number;
    warehouse_name: string;
  };
}

export interface InventoryCount {
  id: number;
  count_reference: string;
  count_date: string;
  warehouse_id: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ADJUSTED';
  created_by?: string;
  created_at: string;
  completed_at?: string;
  
  // Related data
  warehouse?: {
    id: number;
    warehouse_name: string;
  };
  count_items?: InventoryCountItem[];
}

export interface InventoryCountItem {
  id: number;
  count_id: number;
  item_id: number;
  system_quantity: number;
  counted_quantity?: number;
  difference?: number;
  adjustment_note_ar?: string;
  adjustment_note_en?: string;
  is_adjusted: boolean;
  adjusted_at?: string;
  adjusted_by?: string;
  created_at: string;
  
  // Related data
  item?: Item;
}

export interface BulkImportBatch {
  id: number;
  batch_reference: string;
  import_type: 'PRODUCTION' | 'PURCHASE' | 'ADJUSTMENT';
  file_name?: string;
  total_records: number;
  processed_records: number;
  failed_records: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error_log?: string;
  created_by?: string;
  created_at: string;
  completed_at?: string;
  
  // Related data
  import_records?: BulkImportRecord[];
}

export interface BulkImportRecord {
  id: number;
  batch_id: number;
  item_code?: string;
  item_name_ar?: string;
  item_name_en?: string;
  quantity?: number;
  unit_name?: string;
  warehouse_name?: string;
  reference_number?: string;
  notes?: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  error_message?: string;
  processed_at?: string;
  created_at: string;
}

// Summary and view types
export interface ItemSummary {
  item_id: number;
  item_code: string;
  item_name_ar: string;
  item_name_en: string;
  barcode?: string;
  main_group: string;
  sub_group?: string;
  color_name?: string;
  material_name?: string;
  unit_of_measurement: string;
  total_balance: number;
  total_available: number;
  total_reserved: number;
  warehouse_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WarehouseItemBalance {
  balance_id: number;
  item_code: string;
  item_name_ar: string;
  item_name_en: string;
  barcode?: string;
  warehouse_name: string;
  warehouse_location: string;
  opening_balance: number;
  current_balance: number;
  reserved_quantity: number;
  available_quantity: number;
  minimum_stock_level: number;
  maximum_stock_level?: number;
  reorder_point?: number;
  stock_status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'REORDER' | 'IN_STOCK';
  last_updated: string;
}

// Form types for creating/updating records
export interface CreateItemData {
  item_code: string;
  item_name_ar: string;
  item_name_en: string;
  main_group_id: number;
  sub_group_id?: number;
  color_id?: number;
  material_id?: number;
  unit_of_measurement_id: number;
  barcode?: string;
  description_ar?: string;
  description_en?: string;
  specifications?: Record<string, any>;
}

export interface UpdateItemData extends Partial<CreateItemData> {
  id: number;
  is_active?: boolean;
}

export interface CreateItemMovementData {
  movement_type: 'GOODS_RECEIPT' | 'GOODS_ISSUE' | 'STOCK_TRANSFER' | 'RETURN_NOTE' | 'ADJUSTMENT';
  item_id: number;
  quantity: number;
  unit_id: number;
  from_warehouse_id?: number;
  to_warehouse_id?: number;
  reference_number?: string;
  reference_type?: string;
  notes_ar?: string;
  notes_en?: string;
  created_by?: string;
}

export interface CreateInventoryCountData {
  count_reference: string;
  count_date: string;
  warehouse_id: number;
  created_by?: string;
}

export interface CreateInventoryCountItemData {
  count_id: number;
  item_id: number;
  system_quantity: number;
  counted_quantity?: number;
  adjustment_note_ar?: string;
  adjustment_note_en?: string;
}

export interface CreateItemUnitConversionData {
  item_id: number;
  from_unit_id: number;
  to_unit_id: number;
  conversion_factor: number;
}

export interface UpdateItemBalanceData {
  id: number;
  opening_balance?: number;
  current_balance?: number;
  reserved_quantity?: number;
  minimum_stock_level?: number;
  maximum_stock_level?: number;
  reorder_point?: number;
}

// Filter and search types
export interface ItemFilters {
  search?: string;
  main_group_id?: number;
  sub_group_id?: number;
  color_id?: number;
  material_id?: number;
  warehouse_id?: number;
  is_active?: boolean;
  stock_status?: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'REORDER' | 'IN_STOCK';
}

export interface MovementFilters {
  item_id?: number;
  warehouse_id?: number;
  movement_type?: 'GOODS_RECEIPT' | 'GOODS_ISSUE' | 'STOCK_TRANSFER' | 'RETURN_NOTE' | 'ADJUSTMENT';
  date_from?: string;
  date_to?: string;
  reference_number?: string;
}

export interface InventoryCountFilters {
  warehouse_id?: number;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ADJUSTED';
  date_from?: string;
  date_to?: string;
}

// API response types
export interface ItemResponse {
  data: Item[];
  total: number;
  page: number;
  limit: number;
}

export interface ItemSummaryResponse {
  data: ItemSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface WarehouseItemBalanceResponse {
  data: WarehouseItemBalance[];
  total: number;
  page: number;
  limit: number;
}

export interface MovementResponse {
  data: ItemMovement[];
  total: number;
  page: number;
  limit: number;
}

export interface InventoryCountResponse {
  data: InventoryCount[];
  total: number;
  page: number;
  limit: number;
}

// Dashboard and statistics types
export interface ItemStats {
  total_items: number;
  active_items: number;
  total_warehouses: number;
  total_movements_today: number;
  low_stock_items: number;
  out_of_stock_items: number;
  pending_counts: number;
}

export interface StockAlert {
  id: number;
  item_code: string;
  item_name_ar: string;
  item_name_en: string;
  warehouse_name: string;
  current_balance: number;
  minimum_stock_level: number;
  available_quantity: number;
  alert_type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'REORDER';
}

// Barcode and printing types
export interface BarcodeData {
  item_code: string;
  item_name_ar: string;
  item_name_en: string;
  barcode: string;
  quantity?: number;
  unit_name?: string;
  warehouse_name?: string;
}

export interface BarcodePrintRequest {
  items: BarcodeData[];
  print_format: 'SINGLE' | 'BATCH';
  include_quantity?: boolean;
  include_warehouse?: boolean;
}

// Bulk import types
export interface BulkImportRequest {
  import_type: 'PRODUCTION' | 'PURCHASE' | 'ADJUSTMENT';
  file: File;
  warehouse_id?: number;
  reference_number?: string;
}

export interface BulkImportResult {
  batch_id: number;
  total_records: number;
  processed_records: number;
  failed_records: number;
  errors: string[];
}

// Language support types
export interface LocalizedItem {
  item_code: string;
  item_name_ar: string;
  item_name_en: string;
  description_ar?: string;
  description_en?: string;
  notes_ar?: string;
  notes_en?: string;
}

// Movement type labels (Arabic/English)
export const MOVEMENT_TYPE_LABELS = {
  GOODS_RECEIPT: {
    ar: 'إذن إضافة',
    en: 'Goods Receipt'
  },
  GOODS_ISSUE: {
    ar: 'إذن صرف',
    en: 'Goods Issue'
  },
  STOCK_TRANSFER: {
    ar: 'إذن تحويل',
    en: 'Stock Transfer'
  },
  RETURN_NOTE: {
    ar: 'إذن ارتجاع',
    en: 'Return Note'
  },
  ADJUSTMENT: {
    ar: 'تعديل',
    en: 'Adjustment'
  }
} as const;

// Status labels (Arabic/English)
export const STATUS_LABELS = {
  PENDING: {
    ar: 'معلق',
    en: 'Pending'
  },
  IN_PROGRESS: {
    ar: 'قيد التنفيذ',
    en: 'In Progress'
  },
  COMPLETED: {
    ar: 'مكتمل',
    en: 'Completed'
  },
  ADJUSTED: {
    ar: 'معدل',
    en: 'Adjusted'
  },
  PROCESSING: {
    ar: 'قيد المعالجة',
    en: 'Processing'
  },
  FAILED: {
    ar: 'فشل',
    en: 'Failed'
  }
} as const;
