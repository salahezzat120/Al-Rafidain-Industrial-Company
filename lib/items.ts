// Item Data & Balances API Functions for Al-Rafidain Industrial Company

import { supabase } from './supabase';
import type {
  Item,
  ItemUnitConversion,
  ItemBalance,
  ItemMovement,
  InventoryCount,
  InventoryCountItem,
  BulkImportBatch,
  BulkImportRecord,
  ItemSummary,
  WarehouseItemBalance,
  CreateItemData,
  UpdateItemData,
  CreateItemMovementData,
  CreateInventoryCountData,
  CreateInventoryCountItemData,
  CreateItemUnitConversionData,
  UpdateItemBalanceData,
  ItemFilters,
  MovementFilters,
  InventoryCountFilters,
  ItemResponse,
  ItemSummaryResponse,
  WarehouseItemBalanceResponse,
  MovementResponse,
  InventoryCountResponse,
  ItemStats,
  StockAlert,
  BarcodeData,
  BarcodePrintRequest,
  BulkImportRequest,
  BulkImportResult,
  LocalizedItem
} from '@/types/items';

// ==================== ITEMS ====================

export async function getItems(filters?: ItemFilters): Promise<Item[]> {
  let query = supabase
    .from('items')
    .select(`
      *,
      main_group:main_groups(*),
      sub_group:sub_groups(*),
      color:colors(*),
      material:materials(*),
      unit_of_measurement:units_of_measurement(*)
    `)
    .order('item_code');

  if (filters?.search) {
    query = query.or(`item_code.ilike.%${filters.search}%,item_name_ar.ilike.%${filters.search}%,item_name_en.ilike.%${filters.search}%`);
  }

  if (filters?.main_group_id) {
    query = query.eq('main_group_id', filters.main_group_id);
  }

  if (filters?.sub_group_id) {
    query = query.eq('sub_group_id', filters.sub_group_id);
  }

  if (filters?.color_id) {
    query = query.eq('color_id', filters.color_id);
  }

  if (filters?.material_id) {
    query = query.eq('material_id', filters.material_id);
  }

  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching items:', error);
    throw new Error('Failed to fetch items');
  }

  return data || [];
}

export async function getItemById(id: number): Promise<Item | null> {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      main_group:main_groups(*),
      sub_group:sub_groups(*),
      color:colors(*),
      material:materials(*),
      unit_of_measurement:units_of_measurement(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching item:', error);
    return null;
  }

  return data;
}

export async function getItemByCode(itemCode: string): Promise<Item | null> {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      main_group:main_groups(*),
      sub_group:sub_groups(*),
      color:colors(*),
      material:materials(*),
      unit_of_measurement:units_of_measurement(*)
    `)
    .eq('item_code', itemCode)
    .single();

  if (error) {
    console.error('Error fetching item by code:', error);
    return null;
  }

  return data;
}

export async function createItem(itemData: CreateItemData): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .insert([itemData])
    .select(`
      *,
      main_group:main_groups(*),
      sub_group:sub_groups(*),
      color:colors(*),
      material:materials(*),
      unit_of_measurement:units_of_measurement(*)
    `)
    .single();

  if (error) {
    console.error('Error creating item:', error);
    throw new Error('Failed to create item');
  }

  return data;
}

export async function updateItem(itemData: UpdateItemData): Promise<Item> {
  const { id, ...updateData } = itemData;
  
  const { data, error } = await supabase
    .from('items')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      main_group:main_groups(*),
      sub_group:sub_groups(*),
      color:colors(*),
      material:materials(*),
      unit_of_measurement:units_of_measurement(*)
    `)
    .single();

  if (error) {
    console.error('Error updating item:', error);
    throw new Error('Failed to update item');
  }

  return data;
}

export async function deleteItem(id: number): Promise<void> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting item:', error);
    throw new Error('Failed to delete item');
  }
}

// ==================== ITEM UNIT CONVERSIONS ====================

export async function getItemUnitConversions(itemId: number): Promise<ItemUnitConversion[]> {
  const { data, error } = await supabase
    .from('item_unit_conversions')
    .select(`
      *,
      from_unit:units_of_measurement!from_unit_id(*),
      to_unit:units_of_measurement!to_unit_id(*)
    `)
    .eq('item_id', itemId);

  if (error) {
    console.error('Error fetching item unit conversions:', error);
    throw new Error('Failed to fetch item unit conversions');
  }

  return data || [];
}

export async function createItemUnitConversion(conversionData: CreateItemUnitConversionData): Promise<ItemUnitConversion> {
  const { data, error } = await supabase
    .from('item_unit_conversions')
    .insert([conversionData])
    .select(`
      *,
      from_unit:units_of_measurement!from_unit_id(*),
      to_unit:units_of_measurement!to_unit_id(*)
    `)
    .single();

  if (error) {
    console.error('Error creating item unit conversion:', error);
    throw new Error('Failed to create item unit conversion');
  }

  return data;
}

// ==================== ITEM BALANCES ====================

export async function getItemBalances(itemId?: number, warehouseId?: number): Promise<ItemBalance[]> {
  let query = supabase
    .from('item_balances')
    .select(`
      *,
      item:items(*),
      warehouse:warehouses(*)
    `)
    .order('last_updated', { ascending: false });

  if (itemId) {
    query = query.eq('item_id', itemId);
  }

  if (warehouseId) {
    query = query.eq('warehouse_id', warehouseId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching item balances:', error);
    throw new Error('Failed to fetch item balances');
  }

  return data || [];
}

export async function getWarehouseItemBalances(filters?: ItemFilters): Promise<WarehouseItemBalance[]> {
  let query = supabase
    .from('warehouse_item_balances')
    .select('*')
    .order('item_code');

  if (filters?.search) {
    query = query.or(`item_code.ilike.%${filters.search}%,item_name_ar.ilike.%${filters.search}%,item_name_en.ilike.%${filters.search}%`);
  }

  if (filters?.warehouse_id) {
    query = query.eq('warehouse_id', filters.warehouse_id);
  }

  if (filters?.stock_status) {
    query = query.eq('stock_status', filters.stock_status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching warehouse item balances:', error);
    throw new Error('Failed to fetch warehouse item balances');
  }

  return data || [];
}

export async function updateItemBalance(balanceData: UpdateItemBalanceData): Promise<ItemBalance> {
  const { id, ...updateData } = balanceData;
  
  const { data, error } = await supabase
    .from('item_balances')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      item:items(*),
      warehouse:warehouses(*)
    `)
    .single();

  if (error) {
    console.error('Error updating item balance:', error);
    throw new Error('Failed to update item balance');
  }

  return data;
}

// ==================== ITEM MOVEMENTS ====================

export async function getItemMovements(filters?: MovementFilters): Promise<ItemMovement[]> {
  let query = supabase
    .from('item_movements')
    .select(`
      *,
      item:items(*),
      unit:units_of_measurement(*),
      from_warehouse:warehouses!from_warehouse_id(*),
      to_warehouse:warehouses!to_warehouse_id(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.item_id) {
    query = query.eq('item_id', filters.item_id);
  }

  if (filters?.warehouse_id) {
    query = query.or(`from_warehouse_id.eq.${filters.warehouse_id},to_warehouse_id.eq.${filters.warehouse_id}`);
  }

  if (filters?.movement_type) {
    query = query.eq('movement_type', filters.movement_type);
  }

  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from);
  }

  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  if (filters?.reference_number) {
    query = query.ilike('reference_number', `%${filters.reference_number}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching item movements:', error);
    throw new Error('Failed to fetch item movements');
  }

  return data || [];
}

export async function createItemMovement(movementData: CreateItemMovementData): Promise<ItemMovement> {
  const { data, error } = await supabase
    .from('item_movements')
    .insert([movementData])
    .select(`
      *,
      item:items(*),
      unit:units_of_measurement(*),
      from_warehouse:warehouses!from_warehouse_id(*),
      to_warehouse:warehouses!to_warehouse_id(*)
    `)
    .single();

  if (error) {
    console.error('Error creating item movement:', error);
    throw new Error('Failed to create item movement');
  }

  return data;
}

// ==================== INVENTORY COUNTS ====================

export async function getInventoryCounts(filters?: InventoryCountFilters): Promise<InventoryCount[]> {
  let query = supabase
    .from('inventory_counts')
    .select(`
      *,
      warehouse:warehouses(*),
      count_items:inventory_count_items(*)
    `)
    .order('count_date', { ascending: false });

  if (filters?.warehouse_id) {
    query = query.eq('warehouse_id', filters.warehouse_id);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.date_from) {
    query = query.gte('count_date', filters.date_from);
  }

  if (filters?.date_to) {
    query = query.lte('count_date', filters.date_to);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching inventory counts:', error);
    throw new Error('Failed to fetch inventory counts');
  }

  return data || [];
}

export async function getInventoryCountById(id: number): Promise<InventoryCount | null> {
  const { data, error } = await supabase
    .from('inventory_counts')
    .select(`
      *,
      warehouse:warehouses(*),
      count_items:inventory_count_items(
        *,
        item:items(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching inventory count:', error);
    return null;
  }

  return data;
}

export async function createInventoryCount(countData: CreateInventoryCountData): Promise<InventoryCount> {
  const { data, error } = await supabase
    .from('inventory_counts')
    .insert([countData])
    .select(`
      *,
      warehouse:warehouses(*)
    `)
    .single();

  if (error) {
    console.error('Error creating inventory count:', error);
    throw new Error('Failed to create inventory count');
  }

  return data;
}

export async function updateInventoryCountStatus(id: number, status: string): Promise<InventoryCount> {
  const { data, error } = await supabase
    .from('inventory_counts')
    .update({ 
      status,
      completed_at: status === 'COMPLETED' ? new Date().toISOString() : null
    })
    .eq('id', id)
    .select(`
      *,
      warehouse:warehouses(*)
    `)
    .single();

  if (error) {
    console.error('Error updating inventory count status:', error);
    throw new Error('Failed to update inventory count status');
  }

  return data;
}

export async function createInventoryCountItem(itemData: CreateInventoryCountItemData): Promise<InventoryCountItem> {
  const { data, error } = await supabase
    .from('inventory_count_items')
    .insert([itemData])
    .select(`
      *,
      item:items(*)
    `)
    .single();

  if (error) {
    console.error('Error creating inventory count item:', error);
    throw new Error('Failed to create inventory count item');
  }

  return data;
}

export async function adjustInventoryCountItem(
  id: number, 
  countedQuantity: number, 
  adjustmentNoteAr?: string, 
  adjustmentNoteEn?: string,
  adjustedBy?: string
): Promise<InventoryCountItem> {
  const { data, error } = await supabase
    .from('inventory_count_items')
    .update({
      counted_quantity: countedQuantity,
      adjustment_note_ar: adjustmentNoteAr,
      adjustment_note_en: adjustmentNoteEn,
      is_adjusted: true,
      adjusted_at: new Date().toISOString(),
      adjusted_by: adjustedBy
    })
    .eq('id', id)
    .select(`
      *,
      item:items(*)
    `)
    .single();

  if (error) {
    console.error('Error adjusting inventory count item:', error);
    throw new Error('Failed to adjust inventory count item');
  }

  return data;
}

// ==================== BULK IMPORT ====================

export async function getBulkImportBatches(): Promise<BulkImportBatch[]> {
  const { data, error } = await supabase
    .from('bulk_import_batches')
    .select(`
      *,
      import_records:bulk_import_records(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bulk import batches:', error);
    throw new Error('Failed to fetch bulk import batches');
  }

  return data || [];
}

export async function getBulkImportBatchById(id: number): Promise<BulkImportBatch | null> {
  const { data, error } = await supabase
    .from('bulk_import_batches')
    .select(`
      *,
      import_records:bulk_import_records(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching bulk import batch:', error);
    return null;
  }

  return data;
}

export async function createBulkImportBatch(
  batchData: Omit<BulkImportBatch, 'id' | 'created_at' | 'completed_at'>
): Promise<BulkImportBatch> {
  const { data, error } = await supabase
    .from('bulk_import_batches')
    .insert([batchData])
    .select()
    .single();

  if (error) {
    console.error('Error creating bulk import batch:', error);
    throw new Error('Failed to create bulk import batch');
  }

  return data;
}

export async function processBulkImport(batchId: number): Promise<BulkImportResult> {
  // This would typically be handled by a background job or server-side function
  // For now, we'll simulate the processing
  const { data: batch, error: batchError } = await supabase
    .from('bulk_import_batches')
    .select('*')
    .eq('id', batchId)
    .single();

  if (batchError) {
    throw new Error('Failed to fetch batch for processing');
  }

  // Update batch status to processing
  await supabase
    .from('bulk_import_batches')
    .update({ status: 'PROCESSING' })
    .eq('id', batchId);

  // Process records (simplified - in real implementation, this would be more complex)
  const { data: records, error: recordsError } = await supabase
    .from('bulk_import_records')
    .select('*')
    .eq('batch_id', batchId)
    .eq('status', 'PENDING');

  if (recordsError) {
    throw new Error('Failed to fetch records for processing');
  }

  let processedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const record of records || []) {
    try {
      // Process each record (simplified logic)
      // In real implementation, this would create items, movements, etc.
      
      await supabase
        .from('bulk_import_records')
        .update({ 
          status: 'PROCESSED',
          processed_at: new Date().toISOString()
        })
        .eq('id', record.id);
      
      processedCount++;
    } catch (error) {
      await supabase
        .from('bulk_import_records')
        .update({ 
          status: 'FAILED',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', record.id);
      
      failedCount++;
      errors.push(`Record ${record.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update batch status
  await supabase
    .from('bulk_import_batches')
    .update({
      status: 'COMPLETED',
      processed_records: processedCount,
      failed_records: failedCount,
      completed_at: new Date().toISOString()
    })
    .eq('id', batchId);

  return {
    batch_id: batchId,
    total_records: batch.total_records,
    processed_records: processedCount,
    failed_records: failedCount,
    errors
  };
}

// ==================== DASHBOARD & STATS ====================

export async function getItemStats(): Promise<ItemStats> {
  const [
    itemsResult,
    activeItemsResult,
    warehousesResult,
    movementsResult,
    lowStockResult,
    outOfStockResult,
    pendingCountsResult
  ] = await Promise.all([
    supabase.from('items').select('id', { count: 'exact' }),
    supabase.from('items').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('warehouses').select('id', { count: 'exact' }),
    supabase.from('item_movements').select('id', { count: 'exact' }).gte('created_at', new Date().toISOString().split('T')[0]),
    supabase.from('warehouse_item_balances').select('id', { count: 'exact' }).eq('stock_status', 'LOW_STOCK'),
    supabase.from('warehouse_item_balances').select('id', { count: 'exact' }).eq('stock_status', 'OUT_OF_STOCK'),
    supabase.from('inventory_counts').select('id', { count: 'exact' }).eq('status', 'PENDING')
  ]);

  return {
    total_items: itemsResult.count || 0,
    active_items: activeItemsResult.count || 0,
    total_warehouses: warehousesResult.count || 0,
    total_movements_today: movementsResult.count || 0,
    low_stock_items: lowStockResult.count || 0,
    out_of_stock_items: outOfStockResult.count || 0,
    pending_counts: pendingCountsResult.count || 0
  };
}

export async function getStockAlerts(): Promise<StockAlert[]> {
  const { data, error } = await supabase
    .from('warehouse_item_balances')
    .select('*')
    .in('stock_status', ['LOW_STOCK', 'OUT_OF_STOCK', 'REORDER'])
    .order('available_quantity');

  if (error) {
    console.error('Error fetching stock alerts:', error);
    throw new Error('Failed to fetch stock alerts');
  }

  return data?.map(item => ({
    id: item.balance_id,
    item_code: item.item_code,
    item_name_ar: item.item_name_ar,
    item_name_en: item.item_name_en,
    warehouse_name: item.warehouse_name,
    current_balance: item.current_balance,
    minimum_stock_level: item.minimum_stock_level,
    available_quantity: item.available_quantity,
    alert_type: item.stock_status === 'LOW_STOCK' ? 'LOW_STOCK' : 
                item.stock_status === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : 'REORDER'
  })) || [];
}

// ==================== BARCODE FUNCTIONS ====================

export async function generateBarcode(itemCode: string): Promise<string> {
  // Simple barcode generation - in real implementation, use a proper barcode library
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `${itemCode}-${timestamp}-${random}`.toUpperCase();
}

export async function getBarcodeData(itemCode: string): Promise<BarcodeData | null> {
  const item = await getItemByCode(itemCode);
  if (!item) return null;

  return {
    item_code: item.item_code,
    item_name_ar: item.item_name_ar,
    item_name_en: item.item_name_en,
    barcode: item.barcode || await generateBarcode(item.item_code)
  };
}

// ==================== SUMMARY VIEWS ====================

export async function getItemSummary(filters?: ItemFilters): Promise<ItemSummary[]> {
  let query = supabase
    .from('item_summary')
    .select('*')
    .order('item_code');

  if (filters?.search) {
    query = query.or(`item_code.ilike.%${filters.search}%,item_name_ar.ilike.%${filters.search}%,item_name_en.ilike.%${filters.search}%`);
  }

  if (filters?.main_group_id) {
    query = query.eq('main_group_id', filters.main_group_id);
  }

  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching item summary:', error);
    throw new Error('Failed to fetch item summary');
  }

  return data || [];
}
