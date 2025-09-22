// Warehouse Management API Functions for Al-Rafidain Industrial Company

import { supabase } from './supabase';
import type {
  Warehouse,
  Product,
  Inventory,
  InventorySummary,
  StockMovement,
  UnitOfMeasurement,
  MainGroup,
  SubGroup,
  Color,
  Material,
  CreateWarehouseData,
  UpdateWarehouseData,
  CreateProductData,
  UpdateProductData,
  CreateInventoryData,
  UpdateInventoryData,
  CreateStockMovementData,
  CreateUnitOfMeasurementData,
  CreateMainGroupData,
  CreateSubGroupData,
  CreateColorData,
  CreateMaterialData,
  WarehouseFilters,
  ProductFilters,
  InventoryFilters,
  WarehouseResponse,
  ProductResponse,
  InventoryResponse,
  WarehouseStats,
  StockAlert,
  Stocktaking,
  StocktakingItem,
  Barcode,
  UnitConversion,
  WarehouseReport,
  ReportData
} from '@/types/warehouse';

// ==================== WAREHOUSES ====================

export async function getWarehouses(filters?: WarehouseFilters): Promise<Warehouse[]> {
  let query = supabase
    .from('warehouses')
    .select('*')
    .order('warehouse_name');

  if (filters?.search) {
    query = query.or(`warehouse_name.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
  }

  if (filters?.location) {
    query = query.eq('location', filters.location);
  }

  if (filters?.responsible_person) {
    query = query.eq('responsible_person', filters.responsible_person);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching warehouses:', error);
    throw new Error('Failed to fetch warehouses');
  }

  return data || [];
}

export async function getWarehouseById(id: number): Promise<Warehouse | null> {
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching warehouse:', error);
    return null;
  }

  return data;
}

export async function createWarehouse(warehouseData: CreateWarehouseData): Promise<Warehouse> {
  const { data, error } = await supabase
    .from('warehouses')
    .insert([warehouseData])
    .select()
    .single();

  if (error) {
    console.error('Error creating warehouse:', error);
    throw new Error('Failed to create warehouse');
  }

  return data;
}

export async function updateWarehouse(warehouseData: UpdateWarehouseData): Promise<Warehouse> {
  const { id, ...updateData } = warehouseData;
  
  const { data, error } = await supabase
    .from('warehouses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating warehouse:', error);
    throw new Error('Failed to update warehouse');
  }

  return data;
}

export async function deleteWarehouse(id: number): Promise<void> {
  const { error } = await supabase
    .from('warehouses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting warehouse:', error);
    throw new Error('Failed to delete warehouse');
  }
}

// ==================== UNITS OF MEASUREMENT ====================

export async function getUnitsOfMeasurement(): Promise<UnitOfMeasurement[]> {
  const { data, error } = await supabase
    .from('units_of_measurement')
    .select('*')
    .order('unit_name');

  if (error) {
    console.error('Error fetching units of measurement:', error);
    throw new Error('Failed to fetch units of measurement');
  }

  return data || [];
}

export async function createUnitOfMeasurement(unitData: CreateUnitOfMeasurementData): Promise<UnitOfMeasurement> {
  const { data, error } = await supabase
    .from('units_of_measurement')
    .insert([unitData])
    .select()
    .single();

  if (error) {
    console.error('Error creating unit of measurement:', error);
    throw new Error('Failed to create unit of measurement');
  }

  return data;
}

// ==================== MAIN GROUPS ====================

export async function getMainGroups(): Promise<MainGroup[]> {
  const { data, error } = await supabase
    .from('main_groups')
    .select('*')
    .order('group_name');

  if (error) {
    console.error('Error fetching main groups:', error);
    throw new Error('Failed to fetch main groups');
  }

  return data || [];
}

export async function createMainGroup(groupData: CreateMainGroupData): Promise<MainGroup> {
  const { data, error } = await supabase
    .from('main_groups')
    .insert([groupData])
    .select()
    .single();

  if (error) {
    console.error('Error creating main group:', error);
    throw new Error('Failed to create main group');
  }

  return data;
}

// ==================== SUB GROUPS ====================

export async function getSubGroups(mainGroupId?: number): Promise<SubGroup[]> {
  let query = supabase
    .from('sub_groups')
    .select(`
      *,
      main_group:main_groups(*)
    `)
    .order('sub_group_name');

  if (mainGroupId) {
    query = query.eq('main_group_id', mainGroupId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching sub groups:', error);
    throw new Error('Failed to fetch sub groups');
  }

  return data || [];
}

export async function createSubGroup(subGroupData: CreateSubGroupData): Promise<SubGroup> {
  const { data, error } = await supabase
    .from('sub_groups')
    .insert([subGroupData])
    .select(`
      *,
      main_group:main_groups(*)
    `)
    .single();

  if (error) {
    console.error('Error creating sub group:', error);
    throw new Error('Failed to create sub group');
  }

  return data;
}

// ==================== COLORS ====================

export async function getColors(): Promise<Color[]> {
  const { data, error } = await supabase
    .from('colors')
    .select('*')
    .order('color_name');

  if (error) {
    console.error('Error fetching colors:', error);
    throw new Error('Failed to fetch colors');
  }

  return data || [];
}

export async function createColor(colorData: CreateColorData): Promise<Color> {
  const { data, error } = await supabase
    .from('colors')
    .insert([colorData])
    .select()
    .single();

  if (error) {
    console.error('Error creating color:', error);
    throw new Error('Failed to create color');
  }

  return data;
}

// ==================== MATERIALS ====================

export async function getMaterials(): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('material_name');

  if (error) {
    console.error('Error fetching materials:', error);
    throw new Error('Failed to fetch materials');
  }

  return data || [];
}

export async function createMaterial(materialData: CreateMaterialData): Promise<Material> {
  const { data, error } = await supabase
    .from('materials')
    .insert([materialData])
    .select()
    .single();

  if (error) {
    console.error('Error creating material:', error);
    throw new Error('Failed to create material');
  }

  return data;
}

// ==================== PRODUCTS ====================

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select(`
      *,
      main_group:main_groups(*),
      sub_group:sub_groups(*),
      color:colors(*),
      material:materials(*),
      unit_of_measurement:units_of_measurement(*)
    `)
    .order('product_name');

  if (filters?.search) {
    query = query.or(`product_name.ilike.%${filters.search}%,product_code.ilike.%${filters.search}%`);
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
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }

  return data || [];
}

export async function getProductById(id: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
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
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

export async function createProduct(productData: CreateProductData): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
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
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }

  return data;
}

export async function updateProduct(productData: UpdateProductData): Promise<Product> {
  const { id, ...updateData } = productData;
  
  const { data, error } = await supabase
    .from('products')
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
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }

  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
}

// ==================== INVENTORY ====================

export async function getInventorySummary(filters?: InventoryFilters): Promise<InventorySummary[]> {
  let query = supabase
    .from('inventory_summary')
    .select('*')
    .order('product_name');

  if (filters?.product_id) {
    query = query.eq('product_id', filters.product_id);
  }

  if (filters?.warehouse_id) {
    query = query.eq('warehouse_id', filters.warehouse_id);
  }

  if (filters?.stock_status) {
    query = query.eq('stock_status', filters.stock_status);
  }

  if (filters?.min_quantity) {
    query = query.gte('available_quantity', filters.min_quantity);
  }

  if (filters?.max_quantity) {
    query = query.lte('available_quantity', filters.max_quantity);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching inventory summary:', error);
    throw new Error('Failed to fetch inventory summary');
  }

  return data || [];
}

export async function getInventoryByProduct(productId: number): Promise<Inventory[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      product:products(*),
      warehouse:warehouses(*)
    `)
    .eq('product_id', productId);

  if (error) {
    console.error('Error fetching inventory:', error);
    throw new Error('Failed to fetch inventory');
  }

  return data || [];
}

export async function getInventoryByWarehouse(warehouseId: number): Promise<Inventory[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      product:products(*),
      warehouse:warehouses(*)
    `)
    .eq('warehouse_id', warehouseId);

  if (error) {
    console.error('Error fetching inventory:', error);
    throw new Error('Failed to fetch inventory');
  }

  return data || [];
}

export async function createInventory(inventoryData: CreateInventoryData): Promise<Inventory> {
  const { data, error } = await supabase
    .from('inventory')
    .insert([inventoryData])
    .select(`
      *,
      product:products(*),
      warehouse:warehouses(*)
    `)
    .single();

  if (error) {
    console.error('Error creating inventory:', error);
    throw new Error('Failed to create inventory');
  }

  return data;
}

export async function updateInventory(inventoryData: UpdateInventoryData): Promise<Inventory> {
  const { id, ...updateData } = inventoryData;
  
  const { data, error } = await supabase
    .from('inventory')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      product:products(*),
      warehouse:warehouses(*)
    `)
    .single();

  if (error) {
    console.error('Error updating inventory:', error);
    throw new Error('Failed to update inventory');
  }

  return data;
}

// ==================== STOCK MOVEMENTS ====================

export async function getStockMovements(productId?: number, warehouseId?: number): Promise<StockMovement[]> {
  let query = supabase
    .from('stock_movements')
    .select(`
      *,
      product:products(*),
      warehouse:warehouses(*)
    `)
    .order('created_at', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  if (warehouseId) {
    query = query.eq('warehouse_id', warehouseId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching stock movements:', error);
    throw new Error('Failed to fetch stock movements');
  }

  return data || [];
}

export async function createStockMovement(movementData: CreateStockMovementData): Promise<StockMovement> {
  const { data, error } = await supabase
    .from('stock_movements')
    .insert([movementData])
    .select(`
      *,
      product:products(*),
      warehouse:warehouses(*)
    `)
    .single();

  if (error) {
    console.error('Error creating stock movement:', error);
    throw new Error('Failed to create stock movement');
  }

  // Update inventory after stock movement
  await updateInventoryAfterMovement(movementData);

  return data;
}

// ==================== STOCKTAKING ====================

export async function createStocktaking(stocktakingData: any): Promise<Stocktaking> {
  const { data, error } = await supabase
    .from('stocktakings')
    .insert([stocktakingData])
    .select(`
      *,
      warehouse:warehouses(*)
    `)
    .single();

  if (error) {
    console.error('Error creating stocktaking:', error);
    throw new Error('Failed to create stocktaking');
  }

  return data;
}

export async function getStocktakings(): Promise<Stocktaking[]> {
  const { data, error } = await supabase
    .from('stocktakings')
    .select(`
      *,
      warehouse:warehouses(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stocktakings:', error);
    throw new Error('Failed to fetch stocktakings');
  }

  return data || [];
}

// ==================== BARCODE MANAGEMENT ====================

export async function getBarcodes(): Promise<Barcode[]> {
  const { data, error } = await supabase
    .from('barcodes')
    .select(`
      *,
      product:products(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching barcodes:', error);
    throw new Error('Failed to fetch barcodes');
  }

  return data || [];
}

export async function createBarcode(barcodeData: any): Promise<Barcode> {
  const { data, error } = await supabase
    .from('barcodes')
    .insert([barcodeData])
    .select(`
      *,
      product:products(*)
    `)
    .single();

  if (error) {
    console.error('Error creating barcode:', error);
    throw new Error('Failed to create barcode');
  }

  return data;
}

export async function deleteBarcode(id: number): Promise<void> {
  const { error } = await supabase
    .from('barcodes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting barcode:', error);
    throw new Error('Failed to delete barcode');
  }
}

export async function generateBarcode(productId: number, barcodeType: string = 'CODE128'): Promise<Barcode> {
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const barcodeValue = `${product.product_code}-${Date.now()}`;
  
  const { data, error } = await supabase
    .from('barcodes')
    .insert([{
      product_id: productId,
      barcode_value: barcodeValue,
      barcode_type: barcodeType,
      is_active: true
    }])
    .select(`
      *,
      product:products(*)
    `)
    .single();

  if (error) {
    console.error('Error generating barcode:', error);
    throw new Error('Failed to generate barcode');
  }

  return data;
}

// ==================== REPORTS ====================

export async function generateReport(reportType: string, filters: any = {}): Promise<ReportData> {
  let query = '';
  let params: any = {};

  switch (reportType) {
    case 'COST_SALES':
      query = `
        SELECT 
          p.product_name,
          p.product_name_ar,
          p.cost_price,
          p.selling_price,
          w.warehouse_name,
          i.available_quantity,
          (p.selling_price - p.cost_price) as profit_margin
        FROM products p
        JOIN inventory i ON p.id = i.product_id
        JOIN warehouses w ON i.warehouse_id = w.id
        WHERE p.is_active = true
      `;
      break;
    
    case 'STOCK_ANALYSIS':
      query = `
        SELECT 
          p.product_name,
          p.product_name_ar,
          mg.group_name,
          w.warehouse_name,
          i.available_quantity,
          i.minimum_stock_level,
          CASE 
            WHEN i.available_quantity <= i.minimum_stock_level THEN 'LOW_STOCK'
            WHEN i.available_quantity > i.maximum_stock_level THEN 'OVERSTOCK'
            ELSE 'NORMAL'
          END as stock_status
        FROM products p
        JOIN main_groups mg ON p.main_group_id = mg.id
        JOIN inventory i ON p.id = i.product_id
        JOIN warehouses w ON i.warehouse_id = w.id
        WHERE p.is_active = true
      `;
      break;
    
    default:
      throw new Error('Unsupported report type');
  }

  const { data, error } = await supabase.rpc('execute_report_query', {
    query_text: query,
    params: params
  });

  if (error) {
    console.error('Error generating report:', error);
    throw new Error('Failed to generate report');
  }

  return {
    headers: Object.keys(data[0] || {}),
    rows: data.map(row => Object.values(row)),
    generated_at: new Date().toISOString()
  };
}

// ==================== BULK OPERATIONS ====================

export async function bulkUploadProducts(products: any[]): Promise<{ success: number; errors: any[] }> {
  const results = { success: 0, errors: [] as any[] };

  for (const product of products) {
    try {
      await createProduct(product);
      results.success++;
    } catch (error) {
      results.errors.push({ product, error: error.message });
    }
  }

  return results;
}

export async function bulkStockMovement(movements: any[]): Promise<{ success: number; errors: any[] }> {
  const results = { success: 0, errors: [] as any[] };

  for (const movement of movements) {
    try {
      await createStockMovement(movement);
      results.success++;
    } catch (error) {
      results.errors.push({ movement, error: error.message });
    }
  }

  return results;
}

async function updateInventoryAfterMovement(movementData: CreateStockMovementData): Promise<void> {
  const { product_id, warehouse_id, movement_type, quantity } = movementData;

  // Get current inventory
  const { data: currentInventory, error: fetchError } = await supabase
    .from('inventory')
    .select('*')
    .eq('product_id', product_id)
    .eq('warehouse_id', warehouse_id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching current inventory:', fetchError);
    throw new Error('Failed to fetch current inventory');
  }

  let newQuantity = quantity;
  if (currentInventory) {
    if (movement_type === 'IN') {
      newQuantity = currentInventory.available_quantity + quantity;
    } else if (movement_type === 'OUT') {
      newQuantity = currentInventory.available_quantity - quantity;
    } else if (movement_type === 'ADJUSTMENT') {
      newQuantity = quantity; // Direct adjustment
    }
  }

  if (currentInventory) {
    // Update existing inventory
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ 
        available_quantity: newQuantity,
        last_updated: new Date().toISOString()
      })
      .eq('id', currentInventory.id);

    if (updateError) {
      console.error('Error updating inventory:', updateError);
      throw new Error('Failed to update inventory');
    }
  } else {
    // Create new inventory record
    const { error: insertError } = await supabase
      .from('inventory')
      .insert([{
        product_id,
        warehouse_id,
        available_quantity: newQuantity,
        minimum_stock_level: 0,
        last_updated: new Date().toISOString()
      }]);

    if (insertError) {
      console.error('Error creating inventory:', insertError);
      throw new Error('Failed to create inventory');
    }
  }
}

// ==================== PRODUCTS WITH INVENTORY & PRICING ====================

export async function getProductsWithInventoryAndPricing(warehouseId?: number): Promise<any[]> {
  let query = supabase
    .from('products')
    .select(`
      *,
      main_group:main_groups(*),
      sub_group:sub_groups(*),
      color:colors(*),
      material:materials(*),
      unit_of_measurement:units_of_measurement(*),
      inventory:inventory(
        *,
        warehouse:warehouses(*)
      ),
      product_prices:product_prices(*)
    `)
    .eq('is_active', true)
    .order('product_name');

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      main_group:main_groups(*),
      sub_group:sub_groups(*),
      color:colors(*),
      material:materials(*),
      unit_of_measurement:units_of_measurement(*),
      inventory:inventory(
        *,
        warehouse:warehouses(*)
      ),
      product_prices:product_prices(*)
    `)
    .eq('is_active', true)
    .order('product_name');

  if (error) {
    console.error('Error fetching products with inventory:', error);
    throw new Error('Failed to fetch products with inventory');
  }

  // Transform the data to include current stock and pricing
  const productsWithData = products?.map(product => {
    // Get current stock for the specified warehouse or all warehouses
    const inventory = product.inventory?.filter(inv => 
      warehouseId ? inv.warehouse_id === warehouseId : true
    ) || [];
    
    const totalStock = inventory.reduce((sum, inv) => sum + (inv.available_quantity || 0), 0);
    
    // Get the latest price
    const latestPrice = product.product_prices?.sort((a, b) => 
      new Date(b.price_date).getTime() - new Date(a.price_date).getTime()
    )[0];

    return {
      ...product,
      currentStock: totalStock,
      currentPrice: latestPrice?.selling_price || 0,
      currency: latestPrice?.currency || 'IQD',
      warehouses: inventory.map(inv => ({
        id: inv.warehouse_id,
        name: inv.warehouse?.warehouse_name,
        stock: inv.available_quantity,
        location: inv.warehouse?.location
      }))
    };
  }) || [];

  return productsWithData;
}

// ==================== DASHBOARD & STATS ====================

export async function getWarehouseStats(): Promise<WarehouseStats> {
  const [warehousesResult, productsResult, inventoryResult, lowStockResult] = await Promise.all([
    supabase.from('warehouses').select('id', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('inventory_summary').select('available_quantity'),
    supabase.from('inventory_summary').select('id', { count: 'exact' }).eq('stock_status', 'LOW_STOCK')
  ]);

  const totalWarehouses = warehousesResult.count || 0;
  const totalProducts = productsResult.count || 0;
  const totalInventoryValue = inventoryResult.data?.reduce((sum, item) => sum + (item.available_quantity || 0), 0) || 0;
  const lowStockItems = lowStockResult.count || 0;

  return {
    total_warehouses: totalWarehouses,
    total_products: totalProducts,
    total_inventory_value: totalInventoryValue,
    low_stock_items: lowStockItems,
    out_of_stock_items: 0 // You can implement this based on your business logic
  };
}

export async function getStockAlerts(): Promise<StockAlert[]> {
  const { data, error } = await supabase
    .from('inventory_summary')
    .select('*')
    .in('stock_status', ['LOW_STOCK', 'OUT_OF_STOCK'])
    .order('available_quantity');

  if (error) {
    console.error('Error fetching stock alerts:', error);
    throw new Error('Failed to fetch stock alerts');
  }

  return data?.map(item => ({
    id: item.product_id,
    product_name: item.product_name,
    warehouse_name: item.warehouse_name,
    current_quantity: item.available_quantity,
    minimum_stock_level: item.minimum_stock_level,
    alert_type: item.stock_status === 'LOW_STOCK' ? 'LOW_STOCK' : 'OUT_OF_STOCK'
  })) || [];
}
