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
  try {
    console.log('🔍 getWarehouses called with filters:', filters);
    
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

    console.log('📡 Executing warehouse query...');
    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching warehouses:', error);
      throw new Error('Failed to fetch warehouses');
    }

    console.log('✅ Warehouses query successful:', data?.length || 0, 'warehouses found');
    console.log('📋 Warehouse data:', data);
    
    return data || [];
  } catch (error) {
    console.error('❌ getWarehouses error:', error);
    throw error;
  }
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
  try {
    // Insert all warehouse fields including Arabic fields
    const warehouseInsertData = {
      warehouse_name: warehouseData.warehouse_name,
      warehouse_name_ar: warehouseData.warehouse_name_ar || warehouseData.warehouse_name,
      location: warehouseData.location,
      location_ar: warehouseData.location_ar || warehouseData.location,
      address: warehouseData.address,
      latitude: warehouseData.latitude,
      longitude: warehouseData.longitude,
      responsible_person: warehouseData.responsible_person,
      responsible_person_ar: warehouseData.responsible_person_ar || warehouseData.responsible_person,
      warehouse_type: warehouseData.warehouse_type,
      capacity: warehouseData.capacity,
      contact_phone: warehouseData.contact_phone,
      contact_email: warehouseData.contact_email
    };

    console.log('Creating warehouse with data:', warehouseInsertData);

    const { data, error } = await supabase
      .from('warehouses')
      .insert([warehouseInsertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating warehouse:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // If specific columns don't exist, provide helpful error message
      if (error.message.includes('column') || error.message.includes('does not exist')) {
        console.log('⚠️  Database table structure mismatch. Please check your warehouses table columns.');
        throw new Error('Database table structure mismatch. Please check your warehouses table columns.');
      }
      
      throw new Error('Failed to create warehouse');
    }

    console.log('Warehouse created successfully:', data);
    return data;
  } catch (err) {
    console.error('Error in createWarehouse:', err);
    throw err;
  }
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
  const tableCandidates = ['units_of_measurement', 'measurement_units', 'units'];
  let lastError: any = null;

  for (const table of tableCandidates) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('unit_name');

    if (!error) {
      const mapped: UnitOfMeasurement[] = (data || []).map((u: any) => ({
        id: u.id,
        unit_name: u.unit_name ?? u.name ?? u.title,
        unit_code: u.unit_code ?? u.unit_symbol ?? u.code ?? '',
        is_user_defined: u.is_user_defined ?? true,
        created_at: u.created_at
      }));
      return mapped;
    }
    lastError = error;
  }

  console.error('Error fetching units of measurement:', {
    code: lastError?.code,
    message: lastError?.message,
    details: lastError?.details
  });
  throw new Error('Failed to fetch units of measurement');
}

export async function createUnitOfMeasurement(unitData: CreateUnitOfMeasurementData): Promise<UnitOfMeasurement> {
  // Try multiple payload shapes to match whichever schema exists
  const candidates: any[] = [
    // Full bilingual schema (unit_symbol, unit_type, etc.)
    {
      unit_name: unitData.unit_name,
      unit_name_ar: (unitData as any).unit_name_ar || unitData.unit_name,
      unit_symbol: unitData.unit_code || (unitData as any).unit_symbol || unitData.unit_name?.slice(0, 3)?.toUpperCase(),
      unit_symbol_ar: (unitData as any).unit_symbol_ar || unitData.unit_code || unitData.unit_name,
      unit_type: (unitData as any).unit_type || 'COUNT',
      conversion_factor: (unitData as any).conversion_factor ?? 1,
      base_unit_id: (unitData as any).base_unit_id ?? null,
      is_user_defined: (unitData as any).is_user_defined ?? true
    },
    // Simple schema with unit_code
    {
      unit_name: unitData.unit_name,
      unit_code: unitData.unit_code || unitData.unit_name?.slice(0, 3)?.toUpperCase(),
      is_user_defined: (unitData as any).is_user_defined ?? true
    },
    // Minimal schema with only unit_name
    {
      unit_name: unitData.unit_name
    }
  ];

  let lastError: any = null;
  const tableCandidates = ['units_of_measurement', 'measurement_units', 'units'];
  for (const table of tableCandidates) {
    for (const payload of candidates) {
      const { data, error } = await supabase
        .from(table)
        .insert([payload])
        .select('*')
        .single();

      if (!error && data) {
        const mapped: UnitOfMeasurement = {
          id: data.id,
          unit_name: data.unit_name ?? data.name ?? data.title,
          unit_code: data.unit_code ?? data.unit_symbol ?? data.code ?? '',
          is_user_defined: data.is_user_defined ?? true,
          created_at: data.created_at
        };
        return mapped;
      }

      lastError = { ...(error || {}), tableTried: table, payloadKeys: Object.keys(payload) };
    }
  }

  console.error('Error creating unit of measurement:', {
    code: lastError?.code,
    message: lastError?.message,
    details: lastError?.details,
    table: lastError?.tableTried,
    payloadKeys: lastError?.payloadKeys
  });
  throw new Error('Failed to create unit of measurement');
}

export async function updateUnitOfMeasurement(id: number, unitData: Partial<CreateUnitOfMeasurementData>): Promise<UnitOfMeasurement> {
  // Prepare multiple candidate payloads to match possible schemas
  const candidates: any[] = [
    {
      unit_name: unitData.unit_name,
      unit_name_ar: (unitData as any)?.unit_name_ar,
      unit_symbol: (unitData as any)?.unit_symbol ?? unitData.unit_code,
      unit_symbol_ar: (unitData as any)?.unit_symbol_ar ?? unitData.unit_code,
      unit_type: (unitData as any)?.unit_type,
      conversion_factor: (unitData as any)?.conversion_factor,
      base_unit_id: (unitData as any)?.base_unit_id,
      is_user_defined: (unitData as any)?.is_user_defined
    },
    {
      unit_name: unitData.unit_name,
      unit_code: unitData.unit_code,
      is_user_defined: (unitData as any)?.is_user_defined
    },
    {
      unit_name: unitData.unit_name
    }
  ].map(p => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined)));

  let lastError: any = null;
  const tableCandidates = ['units_of_measurement', 'measurement_units', 'units'];
  for (const table of tableCandidates) {
    for (const payload of candidates) {
      if (Object.keys(payload).length === 0) continue;
      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();

      if (!error && data) {
        const mapped: UnitOfMeasurement = {
          id: data.id,
          unit_name: data.unit_name ?? data.name ?? data.title,
          unit_code: data.unit_code ?? data.unit_symbol ?? data.code ?? '',
          is_user_defined: data.is_user_defined ?? true,
          created_at: data.created_at
        };
        return mapped;
      }
      lastError = { ...(error || {}), tableTried: table, payloadKeys: Object.keys(payload) };
    }
  }

  console.error('Error updating unit of measurement:', {
    code: lastError?.code,
    message: lastError?.message,
    details: lastError?.details,
    table: lastError?.tableTried,
    payloadKeys: lastError?.payloadKeys
  });
  throw new Error('Failed to update unit of measurement');
}

export async function deleteUnitOfMeasurement(id: number): Promise<void> {
  const tableCandidates = ['units_of_measurement', 'measurement_units', 'units'];
  let lastError: any = null;
  for (const table of tableCandidates) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (!error) return;
    lastError = { ...(error || {}), tableTried: table };
  }

  console.error('Error deleting unit of measurement:', {
    code: lastError?.code,
    message: lastError?.message,
    details: lastError?.details,
    table: lastError?.tableTried
  });
  throw new Error('Failed to delete unit of measurement');
}

// ==================== MAIN GROUPS ====================

export async function getMainGroups(): Promise<MainGroup[]> {
  try {
    console.log('🔄 Fetching main groups from database...');
    
    const { data, error } = await supabase
      .from('main_groups')
      .select('*')
      .order('group_name');

    if (error) {
      console.error('❌ Error fetching main groups:', error);
      console.log('⚠️  Main groups table may not exist, returning empty array');
      return [];
    }

    console.log('✅ Main groups fetched successfully:', data?.length || 0, 'records');
    if (data && data.length > 0) {
      console.log('📋 Sample main group:', data[0]);
    }

    return data || [];
  } catch (err) {
    console.error('❌ getMainGroups error:', err);
    throw err;
  }
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
  try {
    console.log(`🔄 Fetching sub groups for main group ID: ${mainGroupId || 'all'}...`);
    
    let query = supabase
      .from('sub_groups')
      .select('*')
      .order('sub_group_name');

    if (mainGroupId) {
      query = query.eq('main_group_id', mainGroupId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching sub groups:', error);
      console.log('⚠️  Sub groups table may not exist, returning empty array');
      return [];
    }

    console.log(`✅ Sub groups fetched successfully: ${data?.length || 0} records`);
    if (data && data.length > 0) {
      console.log('📋 Sample sub group:', data[0]);
    }

    return data || [];
  } catch (err) {
    console.error('❌ getSubGroups error:', err);
    throw err;
  }
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
    console.log('⚠️  Colors table may not exist, returning empty array');
    return [];
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
    console.log('⚠️  Materials table may not exist, returning empty array');
    return [];
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

// Test function to verify joins are working
export async function testProductJoins(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        product_name,
        main_group_id,
        sub_group_id,
        color_id,
        material_id,
        unit_of_measurement_id,
        main_group:main_groups(group_name),
        sub_group:sub_groups(sub_group_name),
        color:colors(color_name),
        material:materials(material_name),
        unit_of_measurement:units_of_measurement(unit_name)
      `)
      .limit(5);

    if (error) {
      console.error('Error testing joins:', error);
      return [];
    }

    console.log('Test join results:', data);
    return data || [];
  } catch (err) {
    console.error('Error in testProductJoins:', err);
    return [];
  }
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .order('product_name');

  if (filters?.search) {
    query = query.or(`product_name.ilike.%${filters.search}%,product_code.ilike.%${filters.search}%`);
  }

  if (filters?.main_group) {
    query = query.eq('main_group', filters.main_group);
  }

  if (filters?.sub_group) {
    query = query.eq('sub_group', filters.sub_group);
  }

  if (filters?.color) {
    query = query.eq('color', filters.color);
  }

  if (filters?.material) {
    query = query.eq('material', filters.material);
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

// ==================== CUSTOMERS ====================

export interface Customer {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'vip' | 'inactive';
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
  rating: number;
  preferred_delivery_time: string;
  avatar_url: string | null;
  join_date: string;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  visit_status: 'visited' | 'not_visited';
  last_visit_date: string | null;
  visit_notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    console.log('🔍 Fetching customers...');
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('status', 'active') // Only active customers
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching customers:', error);
      throw error;
    }

    console.log('✅ Customers fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Error in getCustomers:', error);
    return [];
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching customer:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error in getCustomerById:', error);
    return null;
  }
}

// ==================== REPRESENTATIVES ====================

export interface Representative {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  license_number?: string;
  emergency_contact?: string;
  vehicle?: string;
  status: 'active' | 'inactive' | 'on-route' | 'offline';
  coverage_areas?: string[];
  transportation_type: 'foot' | 'vehicle';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export async function getRepresentatives(): Promise<Representative[]> {
  try {
    console.log('🔍 Fetching representatives...');
    
    // Simple query first to check if table exists
    const { data: simpleData, error: simpleError } = await supabase
      .from('representatives')
      .select('id, name, status')
      .limit(5);
    
    if (simpleError) {
      console.error('❌ Error fetching representatives (simple query):', simpleError);
      console.log('⚠️  Representatives table may not exist or have issues');
      return [];
    }
    
    console.log('📊 Simple query result:', simpleData);
    console.log('📊 Data type:', typeof simpleData);
    console.log('📊 Is array:', Array.isArray(simpleData));
    
    // Ensure data is an array
    if (!Array.isArray(simpleData)) {
      console.error('❌ Simple query returned non-array:', simpleData);
      return [];
    }
    
    console.log('📊 Total representatives available:', simpleData.length);
    
    if (simpleData.length === 0) {
      console.log('📋 No representatives found in database');
      return [];
    }
    
    // If we have data, try to get more details
    const { data: fullData, error: fullError } = await supabase
      .from('representatives')
      .select('*')
      .in('status', ['active', 'on-route'])
      .order('name', { ascending: true });

    if (fullError) {
      console.error('❌ Error fetching filtered representatives:', fullError);
      console.log('✅ Using simple query results as fallback');
      return simpleData;
    }

    // Ensure full data is an array
    if (!Array.isArray(fullData)) {
      console.error('❌ Full query returned non-array:', fullData);
      return simpleData;
    }

    console.log('✅ Representatives fetched successfully:', fullData.length);
    return fullData;
  } catch (error) {
    console.error('❌ Error in getRepresentatives:', error);
    return [];
  }
}

export async function getRepresentativeById(id: string): Promise<Representative | null> {
  try {
    const { data, error } = await supabase
      .from('representatives')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching representative:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error in getRepresentativeById:', error);
    return null;
  }
}

// Get products for delivery task selection
export async function getProductsForDelivery(): Promise<Product[]> {
  try {
    console.log('🔍 getProductsForDelivery called');
    
    // Simple query first - just get basic product info
    const { data: simpleData, error: simpleError } = await supabase
      .from('products')
      .select('id, product_name, product_code, stock, is_active')
      .eq('is_active', true)
      .gt('stock', 0);
    
    if (simpleError) {
      console.error('❌ Simple query error:', simpleError);
      // Try even simpler query
      const { data: basicData, error: basicError } = await supabase
        .from('products')
        .select('*')
        .limit(10);
      
      if (basicError) {
        console.error('❌ Basic query also failed:', basicError);
        return [];
      }
      
      console.log('✅ Basic query successful, products:', basicData?.length || 0);
      return basicData || [];
    }
    
    console.log('✅ Simple query successful, products:', simpleData?.length || 0);
    
    // If simple query works, try the full query
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        product_name,
        product_name_ar,
        product_code,
        stock,
        main_group,
        sub_group,
        color,
        material,
        unit,
        description,
        cost_price,
        selling_price,
        weight,
        dimensions,
        warehouses,
        is_active
      `)
      .eq('is_active', true)
      .gt('stock', 0)
      .order('product_name', { ascending: true });

    if (error) {
      console.error('❌ Full query error:', error);
      // Return the simple data if full query fails
      return simpleData || [];
    }

    console.log('✅ Full query successful, products:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Error in getProductsForDelivery:', error);
    return [];
  }
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
  try {
    // Validate required fields
    if (!productData.product_name || productData.product_name.trim() === '') {
      throw new Error('Product name is required');
    }

    // Get the actual names for the IDs from reference tables
    let mainGroupName = 'General';
    let subGroupName = '';
    let colorName = '';
    let materialName = '';
    let unitName = 'pcs';

    // Fetch main group name if ID is provided
    if (productData.main_group_id && productData.main_group_id > 0) {
      try {
        const { data: mainGroup } = await supabase
          .from('main_groups')
          .select('group_name')
          .eq('id', productData.main_group_id)
          .single();
        if (mainGroup) {
          mainGroupName = mainGroup.group_name;
        }
      } catch (error) {
        console.log('Main group not found, using default');
      }
    }

    // Fetch sub group name if ID is provided
    if (productData.sub_group_id && productData.sub_group_id > 0) {
      try {
        const { data: subGroup } = await supabase
          .from('sub_groups')
          .select('sub_group_name')
          .eq('id', productData.sub_group_id)
          .single();
        if (subGroup) {
          subGroupName = subGroup.sub_group_name;
        }
      } catch (error) {
        console.log('Sub group not found, using empty');
      }
    }

    // Fetch color name if ID is provided
    if (productData.color_id && productData.color_id > 0) {
      try {
        const { data: color } = await supabase
          .from('colors')
          .select('color_name')
          .eq('id', productData.color_id)
          .single();
        if (color) {
          colorName = color.color_name;
        }
      } catch (error) {
        console.log('Color not found, using empty');
      }
    }

    // Fetch material name if ID is provided
    if (productData.material_id && productData.material_id > 0) {
      try {
        const { data: material } = await supabase
          .from('materials')
          .select('material_name')
          .eq('id', productData.material_id)
          .single();
        if (material) {
          materialName = material.material_name;
        }
      } catch (error) {
        console.log('Material not found, using empty');
      }
    }

    // Fetch unit name if ID is provided
    if (productData.unit_of_measurement_id && productData.unit_of_measurement_id > 0) {
      try {
        const { data: unit } = await supabase
          .from('units_of_measurement')
          .select('unit_name')
          .eq('id', productData.unit_of_measurement_id)
          .single();
        if (unit) {
          unitName = unit.unit_name;
        }
      } catch (error) {
        console.log('Unit not found, using default');
      }
    }

    // Prepare complete product data with all fields
    const fullProductData = {
      product_name: productData.product_name.trim(),
      product_name_ar: productData.product_name_ar || productData.product_name.trim(),
      product_code: productData.product_code || '',
      stock_number: productData.stock_number || '',
      stock_number_ar: productData.stock_number_ar || productData.stock_number || '',
      stock: productData.stock || parseFloat(productData.stock_number) || 0, // Use provided stock or parse stock_number
      main_group: mainGroupName,
      sub_group: subGroupName,
      color: colorName,
      material: materialName,
      unit: unitName,
      description: productData.description || '',
      description_ar: productData.description_ar || productData.description || '',
      cost_price: productData.cost_price || 0,
      selling_price: productData.selling_price || 0,
      weight: productData.weight || null,
      dimensions: productData.dimensions || '',
      expiry_date: productData.expiry_date || null,
      serial_number: productData.serial_number || '',
      warehouses: productData.warehouses || '',
      specifications: productData.specifications || {},
      is_active: true
    };

    console.log('Creating product with data:', fullProductData);

    // Try to insert with the current data structure
    let { data, error } = await supabase
      .from('products')
      .insert([fullProductData])
      .select('*')
      .single();

    // If unit column doesn't exist, try with unit_of_measurement
    if (error && error.message.includes('unit')) {
      console.log('Trying with unit_of_measurement column name...');
      const alternativeData = {
        ...fullProductData,
        unit_of_measurement: fullProductData.unit,
        unit: undefined
      };
      delete alternativeData.unit;
      
      const result = await supabase
        .from('products')
        .insert([alternativeData])
        .select('*')
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error creating product:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Handle duplicate product code error
      if (error.code === '23505' && error.message.includes('product_code')) {
        throw new Error(`Product code "${fullProductData.product_code}" already exists. Please use a different product code.`);
      }
      
      // Handle duplicate barcode error
      if (error.code === '23505' && error.message.includes('barcode')) {
        throw new Error(`Barcode "${fullProductData.barcode}" already exists. Please use a different barcode.`);
      }
      
      // If specific columns don't exist, provide helpful error message
      if (error.message.includes('column') || error.message.includes('does not exist')) {
        console.log('⚠️  Database table structure mismatch. Please check your products table columns.');
        console.log('Available columns might be different. Please run the check-products-table-structure.sql script.');
        throw new Error('Database table structure mismatch. Please check your products table columns.');
      }
      
      throw new Error(`Failed to create product: ${error.message}`);
    }

    console.log('Product created successfully:', data);
    return data;
  } catch (err) {
    console.error('Error in createProduct:', err);
    throw err;
  }
}

export async function updateProduct(productData: UpdateProductData): Promise<Product> {
  const { id, ...updateData } = productData;
  
  console.log('Updating product with data:', { id, updateData });
  
  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating product:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to update product: ${error.message}`);
  }

  console.log('Product updated successfully:', data);
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
  // Inventory table removed - return empty array
  console.log('Inventory summary disabled - inventory table removed');
  return [];
}

export async function getInventoryByProduct(productId: number): Promise<Inventory[]> {
  // Inventory table removed - return empty array
  console.log('Inventory by product disabled - inventory table removed');
  return [];
}

export async function getInventoryByWarehouse(warehouseId: number): Promise<Inventory[]> {
  // Inventory table removed - return empty array
  console.log('Inventory by warehouse disabled - inventory table removed');
  return [];
}

export async function createInventory(inventoryData: CreateInventoryData): Promise<Inventory> {
  // Inventory table removed - throw error
  console.log('Create inventory disabled - inventory table removed');
  throw new Error('Inventory functionality disabled - inventory table removed');
}

export async function updateInventory(inventoryData: UpdateInventoryData): Promise<Inventory> {
  // Inventory table removed - throw error
  console.log('Update inventory disabled - inventory table removed');
  throw new Error('Inventory functionality disabled - inventory table removed');
}

// ==================== STOCK MOVEMENTS ====================

export async function getStockMovements(productId?: number, warehouseId?: number): Promise<StockMovement[]> {
  try {
    console.log('🔄 Fetching stock movements...');
    
    let query = supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching stock movements:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Check if it's a table doesn't exist error
      if (error.message.includes('relation "stock_movements" does not exist')) {
        throw new Error('Stock movements table does not exist. Please run the database setup script first.');
      }
      
      // Check if it's an RLS error
      if (error.message.includes('row-level security')) {
        throw new Error('RLS policy is blocking access. Please run the RLS fix script.');
      }
      
      throw new Error(`Failed to fetch stock movements: ${error.message}`);
    }

    console.log('✅ Stock movements fetched successfully:', data?.length || 0, 'records');
    return data || [];
  } catch (err) {
    console.error('❌ getStockMovements error:', err);
    throw err;
  }
}

export async function createStockMovement(movementData: CreateStockMovementData): Promise<StockMovement> {
  try {
    console.log('🔄 Creating stock movement with data:', movementData);
    
    // Validate required fields
    if (!movementData.product_id || !movementData.warehouse_id || !movementData.quantity) {
      throw new Error('Missing required fields: product_id, warehouse_id, or quantity');
    }

    // Validate that product and warehouse exist
    const [productCheck, warehouseCheck] = await Promise.all([
      supabase.from('products').select('id').eq('id', movementData.product_id).single(),
      supabase.from('warehouses').select('id').eq('id', movementData.warehouse_id).single()
    ]);

    if (productCheck.error) {
      throw new Error(`Product with ID ${movementData.product_id} not found`);
    }
    if (warehouseCheck.error) {
      throw new Error(`Warehouse with ID ${movementData.warehouse_id} not found`);
    }

    // Map movement types to database values
    const dbMovementType = movementData.movement_type === 'RECEIPT' ? 'IN' : 
                          movementData.movement_type === 'ISSUE' ? 'OUT' : 
                          movementData.movement_type === 'TRANSFER' ? 'TRANSFER' :
                          movementData.movement_type === 'RETURN' ? 'IN' :
                          movementData.movement_type;

    // Map movement types to Arabic
    const movementTypeArabic = {
      'IN': 'دخول',
      'OUT': 'خروج', 
      'TRANSFER': 'نقل',
      'ADJUSTMENT': 'تعديل',
      'RECEIPT': 'استلام',
      'ISSUE': 'إصدار',
      'RETURN': 'إرجاع'
    };

    // Prepare the data for insertion (Arabic & English) - minimal fields only
    const fullMovementData = {
      product_id: movementData.product_id,
      warehouse_id: movementData.warehouse_id,
      movement_type: dbMovementType,
      movement_type_ar: movementTypeArabic[dbMovementType] || dbMovementType,
      quantity: Math.abs(movementData.quantity), // Ensure positive quantity
      unit_price: movementData.unit_price || 0,
      reference_number: movementData.reference_number || `REF-${Date.now()}`,
      reference_number_ar: movementData.reference_number_ar || `مرجع-${Date.now()}`,
      notes: movementData.notes || '',
      notes_ar: movementData.notes_ar || '',
      created_by: movementData.created_by || 'System',
      created_by_ar: movementData.created_by_ar || 'النظام'
    };

    console.log('📝 Prepared movement data:', fullMovementData);

    // Try the insert with full data
    const { data, error } = await supabase
      .from('stock_movements')
      .insert([fullMovementData])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error creating stock movement:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Provide specific error messages
      if (error.message.includes('row-level security')) {
        throw new Error('RLS policy is blocking the insert. Please run the RLS fix script in Supabase SQL Editor.');
      }
      
      if (error.message.includes('foreign key')) {
        throw new Error('Invalid product or warehouse ID. Please check that the selected product and warehouse exist.');
      }
      
      if (error.message.includes('check constraint')) {
        throw new Error('Invalid movement type or status. Please check the movement type.');
      }
      
      if (error.message.includes('relation "stock_movements" does not exist')) {
        throw new Error('Stock movements table does not exist. Please run the database setup script first.');
      }
      
      throw new Error(`Failed to create stock movement: ${error.message}`);
    }

    console.log('✅ Stock movement created successfully:', data);

    // Update inventory after stock movement (optional)
    try {
      await updateInventoryAfterMovement(fullMovementData);
      console.log('📦 Inventory updated after movement');
    } catch (inventoryError) {
      console.warn('⚠️ Inventory update failed, but movement was created:', inventoryError);
    }

    return data;
  } catch (error) {
    console.error('❌ Error in createStockMovement:', error);
    throw error;
  }
}

// ==================== STOCKTAKING ====================

export async function createStocktaking(stocktakingData: any): Promise<Stocktaking> {
  try {
    // First, check if the stocktaking table exists
    const { data: tableCheck, error: tableCheckError } = await supabase
      .from('stocktaking')
      .select('id')
      .limit(1);

    if (tableCheckError && tableCheckError.message.includes('Could not find the table')) {
      console.error('Stocktaking table does not exist. Please create it first.');
      throw new Error('Stocktaking table does not exist. Please run the SQL script to create the table first.');
    }

    // Prepare the data for insertion, ensuring all required fields are present
    const insertData = {
      warehouse_id: stocktakingData.warehouse_id,
      stocktaking_date: stocktakingData.stocktaking_date,
      reference_number: stocktakingData.reference_number,
      status: stocktakingData.status || 'PLANNED',
      total_items: stocktakingData.total_items || 0,
      counted_items: stocktakingData.counted_items || 0,
      discrepancies: stocktakingData.discrepancies || 0,
      notes: stocktakingData.notes || null,
      created_by: stocktakingData.created_by || 'system'
    };

    console.log('Inserting stocktaking data:', insertData);

    // Insert stocktaking data
    const { data: stocktaking, error: stocktakingError } = await supabase
      .from('stocktaking')
      .insert([insertData])
      .select('*')
    .single();

    if (stocktakingError) {
      console.error('Error creating stocktaking:', stocktakingError);
      console.error('Error details:', stocktakingError.message, stocktakingError.details, stocktakingError.hint);
      throw new Error(`Failed to create stocktaking: ${stocktakingError.message}`);
    }

    // Get warehouse data separately
    const { data: warehouse, error: warehouseError } = await supabase
      .from('warehouses')
      .select('*')
      .eq('id', stocktaking.warehouse_id)
      .single();

    if (warehouseError) {
      console.warn('Error fetching warehouse for stocktaking:', warehouseError);
    }

    // Return enriched stocktaking data
    return {
      ...stocktaking,
      warehouse: warehouse || null
    };
  } catch (error) {
    console.error('Error in createStocktaking:', error);
    throw error;
  }
}

export async function getStocktakings(): Promise<Stocktaking[]> {
  try {
    // First try to get stocktaking data
    const { data: stocktakings, error: stocktakingsError } = await supabase
      .from('stocktaking')
      .select('*')
    .order('created_at', { ascending: false });

    if (stocktakingsError) {
      console.error('Error fetching stocktaking data:', stocktakingsError);
      // If stocktaking table doesn't exist, return empty array
      return [];
    }

    if (!stocktakings || stocktakings.length === 0) {
      return [];
    }

    // Get warehouses separately
    const { data: warehouses, error: warehousesError } = await supabase
      .from('warehouses')
      .select('*');

    if (warehousesError) {
      console.warn('Error fetching warehouses for stocktaking:', warehousesError);
    }

    // Manually join the data
    const enrichedStocktakings = stocktakings.map(stocktaking => ({
      ...stocktaking,
      warehouse: warehouses?.find(w => w.id === stocktaking.warehouse_id) || null
    }));

    return enrichedStocktakings;
  } catch (error) {
    console.error('Error in getStocktakings:', error);
    return [];
  }
}

// ==================== BARCODE MANAGEMENT ====================

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


// ==================== BULK OPERATIONS ====================

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

export async function getProductsWithWarehouseInfo(): Promise<any[]> {
  try {
    // Start with a basic products query
    const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('product_name');
        
    if (productsError) {
      console.error('Error fetching products:', productsError);
          return [];
        }
        
    if (!products || products.length === 0) {
      console.log('No products found');
      return [];
    }

    // Get inventory data separately
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select(`
        *,
        warehouse:warehouses(*)
      `);

    if (inventoryError) {
      console.warn('Error fetching inventory data:', inventoryError);
    }

    // Get dropdown data separately
    const [mainGroups, subGroups, colors, materials, units] = await Promise.all([
      supabase.from('main_groups').select('*').then(({ data, error }) => error ? [] : data),
      supabase.from('sub_groups').select('*').then(({ data, error }) => error ? [] : data),
      supabase.from('colors').select('*').then(({ data, error }) => error ? [] : data),
      supabase.from('materials').select('*').then(({ data, error }) => error ? [] : data),
      supabase.from('units_of_measurement').select('*').then(({ data, error }) => error ? [] : data)
    ]);

    // Manually join the data
    const enrichedProducts = products.map(product => {
      const productInventory = inventory?.filter(inv => inv.product_id === product.id) || [];
      
      return {
        ...product,
        main_group: mainGroups?.find(mg => mg.id === product.main_group_id) || null,
        sub_group: subGroups?.find(sg => sg.id === product.sub_group_id) || null,
        color: colors?.find(c => c.id === product.color_id) || null,
        material: materials?.find(m => m.id === product.material_id) || null,
        unit_of_measurement: units?.find(u => u.id === product.unit_of_measurement_id) || null,
        inventory: productInventory
      };
    });

    console.log('Products with warehouse info loaded:', enrichedProducts?.length, 'items');
    return enrichedProducts || [];
  } catch (err) {
    console.error('Error in getProductsWithWarehouseInfo:', err);
    return [];
  }
}

export async function getProductsWithInventoryAndPricing(warehouseId?: number): Promise<any[]> {
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
  try {
    // Get warehouses count
    const { count: totalWarehouses } = await supabase
      .from('warehouses')
      .select('*', { count: 'exact', head: true });

    // Get products count
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get products with stock data (using products table stock field)
    const { data: productsData } = await supabase
      .from('products')
      .select('stock, cost_price, selling_price')
      .not('stock', 'is', null);

    // Calculate total inventory value using products table
    const totalInventoryValue = productsData?.reduce((sum, product) => {
      const stock = product.stock || 0;
      const costPrice = product.cost_price || 0;
      return sum + (stock * costPrice);
    }, 0) || 0;

    // Get low stock items (items with stock <= 10)
    const lowStockItems = productsData?.filter(product => (product.stock || 0) <= 10).length || 0;

    console.log('Warehouse Stats:', {
      totalWarehouses: totalWarehouses || 0,
      totalProducts: totalProducts || 0,
      totalInventoryValue,
      lowStockItems
    });

    return {
      total_warehouses: totalWarehouses || 0,
      total_products: totalProducts || 0,
      total_inventory_value: totalInventoryValue,
      low_stock_items: lowStockItems,
      out_of_stock_items: 0
    };
  } catch (error) {
    console.error('Error getting warehouse stats:', error);
    return {
      total_warehouses: 0,
      total_products: 0,
      total_inventory_value: 0,
      low_stock_items: 0,
      out_of_stock_items: 0
    };
  }
}

export async function getStockAlerts(): Promise<StockAlert[]> {
  try {
    // Since inventory table is removed, return empty array
    // You can implement stock alerts based on products table stock field if needed
    console.log('Stock alerts disabled - inventory table removed');
    return [];
  } catch (error) {
    console.error('Error in getStockAlerts:', error);
    return [];
  }
}

// ==================== BARCODE FUNCTIONS ====================

export async function getBarcodes(): Promise<Barcode[]> {
  try {
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
  } catch (error: any) {
    console.error('Error in getBarcodes:', error);
    throw new Error('Failed to fetch barcodes');
  }
}

export async function createBarcode(barcodeData: { product_id: string; barcode: string; product_name?: string }): Promise<Barcode> {
  try {
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
  } catch (error: any) {
    console.error('Error in createBarcode:', error);
    throw new Error('Failed to create barcode');
  }
}

export async function deleteBarcode(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('barcodes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting barcode:', error);
      throw new Error('Failed to delete barcode');
    }
  } catch (error: any) {
    console.error('Error in deleteBarcode:', error);
    throw new Error('Failed to delete barcode');
  }
}

// ==================== REPORTS ====================

export async function generateReport(reportType: string, filters: any = {}): Promise<ReportData> {
  try {
    console.log('Generating report:', reportType, 'with filters:', filters);
    
    switch (reportType) {
      case 'COST_SALES':
        return await generateCostSalesReport(filters);
      case 'CONSIGNMENT':
        return await generateConsignmentReport(filters);
      case 'DAMAGED':
        return await generateDamagedGoodsReport(filters);
      case 'EXPIRY':
        return await generateExpiryReport(filters);
      case 'SERIAL_TRACKING':
        return await generateSerialTrackingReport(filters);
      case 'PRODUCT_CARD':
        return await generateProductCardReport(filters);
      case 'MONITORING_CARD':
        return await generateMonitoringCardReport(filters);
      case 'AGING':
        return await generateAgingReport(filters);
      case 'STOCK_ANALYSIS':
        return await generateStockAnalysisReport(filters);
      case 'VALUATION':
        return await generateValuationReport(filters);
      case 'ISSUED_ITEMS':
        return await generateIssuedItemsReport(filters);
      case 'CUSTOM':
        return await generateCustomReport(filters);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  } catch (error: any) {
    console.error('Error generating report:', error);
    throw new Error(`Failed to generate ${reportType} report: ${error.message}`);
  }
}

// Cost & Sales Price Report
async function generateCostSalesReport(filters: any): Promise<ReportData> {
  try {
    // Get products data
    const { data: products, error: productsError } = await supabase
    .from('products')
      .select('*')
    .order('product_name');

    if (productsError) throw productsError;

    if (!products || products.length === 0) {
      return {
        title: 'Cost & Sales Price Report',
        headers: ['Product Code', 'Product Name', 'Cost Price', 'Sales Price', 'Margin %', 'Stock Level'],
        rows: [],
        summary: { totalProducts: 0, averageMargin: '0.00%' }
      };
    }

    // Get inventory data separately
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*');

    if (inventoryError) {
      console.warn('Error fetching inventory data:', inventoryError);
    }

    // Manually join the data
  const headers = ['Product Code', 'Product Name', 'Cost Price', 'Sales Price', 'Margin %', 'Stock Level'];
    const rows = products.map(product => {
      const productInventory = inventory?.find(inv => inv.product_id === product.id);
      const stockLevel = productInventory?.available_quantity || '0';
      
      const costPrice = parseFloat(product.cost_price || '0');
      const salesPrice = parseFloat(product.sales_price || '0');
      const margin = costPrice > 0 ? (((salesPrice - costPrice) / costPrice) * 100).toFixed(2) + '%' : '0.00%';
      
      return [
    product.product_code || '',
    product.product_name || '',
        costPrice.toFixed(2),
        salesPrice.toFixed(2),
        margin,
        stockLevel
      ];
    });

    // Calculate average margin
    const validMargins = products.filter(p => p.cost_price && p.sales_price && parseFloat(p.cost_price) > 0);
    const averageMargin = validMargins.length > 0 
      ? (validMargins.reduce((sum, p) => {
          const cost = parseFloat(p.cost_price);
          const sales = parseFloat(p.sales_price);
          return sum + ((sales - cost) / cost) * 100;
        }, 0) / validMargins.length).toFixed(2) + '%'
      : '0.00%';

  return {
    title: 'Cost & Sales Price Report',
    headers,
    rows,
    summary: {
        totalProducts: products.length,
        averageMargin
    }
  };
  } catch (error) {
    console.error('Error generating cost & sales report:', error);
    throw error;
  }
}

// Stock Availability Report
async function generateConsignmentReport(filters: any): Promise<ReportData> {
  try {
    // Get inventory data
    const { data: inventory, error: inventoryError } = await supabase
    .from('inventory')
      .select('*')
      .not('available_quantity', 'is', null);

    if (inventoryError) throw inventoryError;

    if (!inventory || inventory.length === 0) {
      return {
        title: 'تقرير توفر المخزون',
        headers: ['المنتج', 'المستودع', 'الكمية المتاحة', 'الحد الأدنى للمخزون', 'الحالة'],
        rows: [],
        summary: { 'إجمالي الأصناف': 0, 'الأصناف المتوفرة في المخزون': 0 }
      };
    }

    // Get products and warehouses separately
    const [productsResult, warehousesResult] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('warehouses').select('*')
    ]);

    const products = productsResult.data || [];
    const warehouses = warehousesResult.data || [];

    // Manually join the data
    const headers = ['المنتج', 'المستودع', 'الكمية المتاحة', 'الحد الأدنى للمخزون', 'الحالة'];
    const rows = inventory.map(item => {
      const product = products.find(p => p.id === item.product_id);
      const warehouse = warehouses.find(w => w.id === item.warehouse_id);
      
      return [
        product?.product_name || 'منتج غير معروف',
        warehouse?.warehouse_name || 'مستودع غير معروف',
        item.available_quantity || '0',
        item.minimum_stock_level || '0',
        item.available_quantity > 0 ? 'متوفر في المخزون' : 'نفد من المخزون'
      ];
    });

  return {
      title: 'تقرير توفر المخزون',
    headers,
    rows,
    summary: {
        'إجمالي الأصناف': inventory.length,
        'الأصناف المتوفرة في المخزون': inventory.filter(item => item.available_quantity > 0).length
    }
  };
  } catch (error) {
    console.error('Error generating stock availability report:', error);
    throw error;
  }
}

// Damaged Goods Report
async function generateDamagedGoodsReport(filters: any): Promise<ReportData> {
  try {
    // Get stock movements data
    const { data: movements, error: movementsError } = await supabase
    .from('stock_movements')
      .select('*')
    .eq('movement_type', 'DAMAGE')
    .order('created_at', { ascending: false });

    if (movementsError) throw movementsError;

    if (!movements || movements.length === 0) {
      return {
        title: 'Damaged Goods Report',
        headers: ['Date', 'Product', 'Warehouse', 'Damaged Quantity', 'Reason', 'Value'],
        rows: [],
        summary: { totalDamaged: 0, totalValue: '0.00' }
      };
    }

    // Get products and warehouses separately
    const [productsResult, warehousesResult] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('warehouses').select('*')
    ]);

    const products = productsResult.data || [];
    const warehouses = warehousesResult.data || [];

    // Manually join the data
  const headers = ['Date', 'Product', 'Warehouse', 'Damaged Quantity', 'Reason', 'Value'];
    const rows = movements.map(movement => {
      const product = products.find(p => p.id === movement.product_id);
      const warehouse = warehouses.find(w => w.id === movement.warehouse_id);
      
      return [
    new Date(movement.created_at).toLocaleDateString(),
        product?.product_name || 'Unknown Product',
        warehouse?.warehouse_name || 'Unknown Warehouse',
    movement.quantity || '0',
    movement.notes || '',
        ((movement.quantity || 0) * (movement.unit_price || 0)).toFixed(2)
      ];
    });

  return {
    title: 'Damaged Goods Report',
    headers,
    rows,
    summary: {
        totalDamaged: movements.length,
        totalValue: movements.reduce((sum, movement) => 
          sum + ((movement.quantity || 0) * (movement.unit_price || 0)), 0
        ).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error generating damaged goods report:', error);
    throw error;
  }
}

// Expiry Report
async function generateExpiryReport(filters: any): Promise<ReportData> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      inventory:inventory(*)
    `)
    .not('expiry_date', 'is', null)
    .order('expiry_date');

  if (error) throw error;

  const headers = ['Product', 'Expiry Date', 'Days Until Expiry', 'Quantity', 'Status'];
  const rows = data?.map(product => {
    const expiryDate = new Date(product.expiry_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let status = 'Good';
    if (daysUntilExpiry < 0) status = 'Expired';
    else if (daysUntilExpiry <= 30) status = 'Expiring Soon';
    else if (daysUntilExpiry <= 60) status = 'Warning';

    return [
      product.product_name || '',
      expiryDate.toLocaleDateString(),
      daysUntilExpiry.toString(),
      product.inventory?.[0]?.available_quantity || '0',
      status
    ];
  }) || [];

  return {
    title: 'Expiry Report',
    headers,
    rows,
    summary: {
      totalProducts: data?.length || 0,
      expiringSoon: rows.filter(row => row[4] === 'Expiring Soon').length,
      expired: rows.filter(row => row[4] === 'Expired').length
    }
  };
}

// Serial Number Tracking Report
async function generateSerialTrackingReport(filters: any): Promise<ReportData> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      inventory:inventory(*)
    `)
    .not('serial_number', 'is', null)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const headers = ['Product Code', 'Product Name', 'Serial Number', 'Status', 'Created Date', 'Description'];
  const rows = data?.map(product => [
    product.product_code || '',
    product.product_name || '',
    product.serial_number || '',
    product.inventory?.[0]?.available_quantity > 0 ? 'In Stock' : 'Out of Stock',
    new Date(product.created_at).toLocaleDateString(),
    product.description || ''
  ]) || [];

  return {
    title: 'Serial Number Tracking Report',
    headers,
    rows,
    summary: {
      totalProducts: data?.length || 0,
      inStockProducts: data?.filter(product => product.inventory?.[0]?.available_quantity > 0).length || 0
    }
  };
}

// Product Card Report
async function generateProductCardReport(filters: any): Promise<ReportData> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      inventory:inventory(*),
      stock_movements:stock_movements(*)
    `)
    .order('product_name');

  if (error) throw error;

  const headers = ['Product Code', 'Product Name', 'Description', 'Category', 'Current Stock', 'Last Movement'];
  const rows = data?.map(product => [
    product.product_code || '',
    product.product_name || '',
    product.description || '',
    product.category || '',
    product.inventory?.[0]?.available_quantity || '0',
    product.stock_movements?.[0] ? new Date(product.stock_movements[0].created_at).toLocaleDateString() : 'Never'
  ]) || [];

  return {
    title: 'Product Card Report',
    headers,
    rows,
    summary: {
      totalProducts: data?.length || 0
    }
  };
}

// Product Monitoring Card Report
async function generateMonitoringCardReport(filters: any): Promise<ReportData> {
  const { data, error } = await supabase
    .from('stock_movements')
    .select(`
      *,
      product:products(*),
      warehouse:warehouses(*)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  const headers = ['Date', 'Product', 'Warehouse', 'Movement Type', 'Quantity', 'Reference'];
  const rows = data?.map(movement => [
    new Date(movement.created_at).toLocaleDateString(),
    movement.product?.product_name || '',
    movement.warehouse?.warehouse_name || '',
    movement.movement_type || '',
    movement.quantity || '0',
    movement.reference_number || ''
  ]) || [];

  return {
    title: 'Product Monitoring Card Report',
    headers,
    rows,
    summary: {
      totalMovements: data?.length || 0
    }
  };
}

// Aging Report
async function generateAgingReport(filters: any): Promise<ReportData> {
  const { data, error } = await supabase
    .from('aging_items')
    .select(`
      *,
      product:products(*),
      warehouse:warehouses(*)
    `)
    .order('days_in_stock', { ascending: false });

  if (error) throw error;

  const headers = ['Product', 'Warehouse', 'Quantity', 'Days in Stock', 'Age Category', 'Last Movement'];
  const rows = data?.map(item => [
    item.product?.product_name || '',
    item.warehouse?.warehouse_name || '',
    item.quantity || '0',
    item.days_in_stock || '0',
    item.age_category || '',
    item.last_movement_date ? new Date(item.last_movement_date).toLocaleDateString() : 'Never'
  ]) || [];

  return {
    title: 'Aging Report',
    headers,
    rows,
    summary: {
      totalItems: data?.length || 0,
      oldItems: rows.filter(row => row[4] === 'OLD').length
    }
  };
}

// Stock Analysis Report
async function generateStockAnalysisReport(filters: any): Promise<ReportData> {
  const { data, error } = await supabase
    .from('stock_analysis')
    .select(`
      *,
      product:products(*)
    `)
    .order('analysis_date', { ascending: false });

  if (error) throw error;

  const headers = ['Product', 'Analysis Date', 'Total In', 'Total Out', 'Net Movement', 'Current Stock', 'Turnover Rate'];
  const rows = data?.map(analysis => [
    analysis.product?.product_name || '',
    new Date(analysis.analysis_date).toLocaleDateString(),
    analysis.total_in || '0',
    analysis.total_out || '0',
    analysis.net_movement || '0',
    analysis.current_stock || '0',
    analysis.turnover_rate ? analysis.turnover_rate.toFixed(2) + '%' : '0.00%'
  ]) || [];

  return {
    title: 'Stock Analysis Report',
    headers,
    rows,
    summary: {
      totalAnalyses: data?.length || 0
    }
  };
}

// Valuation Report
async function generateValuationReport(filters: any): Promise<ReportData> {
  const { data, error } = await supabase
    .from('valuation_items')
    .select(`
      *,
      product:products(*),
      warehouse:warehouses(*)
    `)
    .order('valuation_date', { ascending: false });

  if (error) throw error;

  const headers = ['Product', 'Warehouse', 'Quantity', 'Unit Cost', 'Total Value', 'Valuation Date'];
  const rows = data?.map(item => [
    item.product?.product_name || '',
    item.warehouse?.warehouse_name || '',
    item.quantity || '0',
    item.unit_cost || '0.00',
    item.total_value || '0.00',
    new Date(item.valuation_date).toLocaleDateString()
  ]) || [];

  return {
    title: 'Valuation Report',
    headers,
    rows,
    summary: {
      totalValue: data?.reduce((sum, item) => sum + (parseFloat(item.total_value) || 0), 0).toFixed(2),
      totalItems: data?.length || 0
    }
  };
}

// Issued Items Report
async function generateIssuedItemsReport(filters: any): Promise<ReportData> {
  const { data, error } = await supabase
    .from('stock_movements')
    .select(`
      *,
      product:products(*),
      warehouse:warehouses(*)
    `)
    .eq('movement_type', 'ISSUE')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const headers = ['Date', 'Product', 'Warehouse', 'Quantity', 'Issued To', 'Reference', 'Notes'];
  const rows = data?.map(movement => [
    new Date(movement.created_at).toLocaleDateString(),
    movement.product?.product_name || '',
    movement.warehouse?.warehouse_name || '',
    movement.quantity || '0',
    movement.issued_to || '',
    movement.reference_number || '',
    movement.notes || ''
  ]) || [];

  return {
    title: 'Issued Items Report',
    headers,
    rows,
    summary: {
      totalIssued: data?.length || 0,
      totalQuantity: data?.reduce((sum, movement) => sum + (parseInt(movement.quantity) || 0), 0)
    }
  };
}

// Custom Report Generator
async function generateCustomReport(config: any): Promise<ReportData> {
  try {
    const { tables, fields, filters, sorting } = config;
    
    // Build the select query based on selected tables and fields
    let selectQuery = '';
    const tableJoins: string[] = [];
    
    // Add main table
    const mainTable = tables[0];
    const mainFields = fields[mainTable] || [];
    selectQuery = mainFields.map(field => `${mainTable}.${field}`).join(', ');
    
    // Add joins for other tables
    for (let i = 1; i < tables.length; i++) {
      const table = tables[i];
      const tableFields = fields[table] || [];
      if (tableFields.length > 0) {
        const joinFields = tableFields.map(field => `${table}.${field}`).join(', ');
        selectQuery += `, ${joinFields}`;
        
        // Add join condition (assuming foreign key relationships)
        if (table === 'products' && mainTable === 'inventory') {
          tableJoins.push(`LEFT JOIN products ON inventory.product_id = products.id`);
        } else if (table === 'warehouses' && mainTable === 'inventory') {
          tableJoins.push(`LEFT JOIN warehouses ON inventory.warehouse_id = warehouses.id`);
        }
        // Add more join conditions as needed
      }
    }
    
    // Build the complete query
    let query = supabase.from(mainTable).select(selectQuery);
    
    // Apply filters
    if (filters && filters.length > 0) {
      filters.forEach((filter: any) => {
        if (filter.field && filter.value) {
          const [table, field] = filter.field.split('.');
          switch (filter.operator) {
            case '=':
              query = query.eq(`${table}.${field}`, filter.value);
              break;
            case '!=':
              query = query.neq(`${table}.${field}`, filter.value);
              break;
            case '>':
              query = query.gt(`${table}.${field}`, filter.value);
              break;
            case '<':
              query = query.lt(`${table}.${field}`, filter.value);
              break;
            case 'LIKE':
              query = query.ilike(`${table}.${field}`, `%${filter.value}%`);
              break;
          }
        }
      });
    }
    
    // Apply sorting
    if (sorting && sorting.length > 0) {
      sorting.forEach((sort: any) => {
        if (sort.field) {
          const [table, field] = sort.field.split('.');
          query = query.order(`${table}.${field}`, { ascending: sort.direction === 'ASC' });
        }
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Generate headers and rows
    const headers: string[] = [];
    const allFields: string[] = [];
    
    tables.forEach((table: string) => {
      const tableFields = fields[table] || [];
      tableFields.forEach(field => {
        headers.push(`${table}.${field}`);
        allFields.push(`${table}.${field}`);
      });
    });
    
    const rows = data?.map((item: any) => 
      allFields.map(field => {
        const [table, fieldName] = field.split('.');
        return item[fieldName] || '';
      })
    ) || [];
    
    return {
      title: config.name || 'Custom Report',
      headers,
      rows,
      summary: {
        totalRecords: data?.length || 0,
        generatedAt: new Date().toISOString()
      }
    };
  } catch (error: any) {
    console.error('Error generating custom report:', error);
    throw new Error(`Failed to generate custom report: ${error.message}`);
  }
}

// ==================== BULK UPLOAD FUNCTIONS ====================

export async function bulkUploadProducts(products: any[]): Promise<{ success: number; errors: any[] }> {
  const results = { success: 0, errors: [] as any[] };

  for (const product of products) {
    try {
      // Validate required fields
      if (!product.product_name || !product.product_code) {
        results.errors.push({ 
          error: `Missing required fields: product_name and product_code are required`,
          row: product
        });
        continue;
      }

      // Check if product already exists
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('product_code', product.product_code)
        .single();

      if (existingProduct) {
        // Update existing product
        const updateData = {
          product_name: product.product_name,
          product_name_ar: product.product_name_ar || product.product_name,
          main_group_id: parseInt(product.main_group_id) || null,
          sub_group_id: parseInt(product.sub_group_id) || null,
          color_id: parseInt(product.color_id) || null,
          material_id: parseInt(product.material_id) || null,
          unit_of_measurement_id: parseInt(product.unit_of_measurement_id) || null,
          description: product.description || '',
          cost_price: parseFloat(product.cost_price) || 0,
          selling_price: parseFloat(product.selling_price) || 0,
          weight: parseFloat(product.weight) || 0,
          dimensions: product.dimensions || '',
          updated_at: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', existingProduct.id);

        if (updateError) {
          results.errors.push({ 
            error: `Failed to update product: ${updateError.message}`,
            row: product
          });
        } else {
          results.success++;
        }
      } else {
        // Create new product
        const insertData = {
          product_name: product.product_name,
          product_name_ar: product.product_name_ar || product.product_name,
          product_code: product.product_code,
          main_group_id: parseInt(product.main_group_id) || null,
          sub_group_id: parseInt(product.sub_group_id) || null,
          color_id: parseInt(product.color_id) || null,
          material_id: parseInt(product.material_id) || null,
          unit_of_measurement_id: parseInt(product.unit_of_measurement_id) || null,
          description: product.description || '',
          cost_price: parseFloat(product.cost_price) || 0,
          selling_price: parseFloat(product.selling_price) || 0,
          weight: parseFloat(product.weight) || 0,
          dimensions: product.dimensions || '',
          stock: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('products')
          .insert([insertData]);

        if (insertError) {
          results.errors.push({ 
            error: `Failed to create product: ${insertError.message}`,
            row: product
          });
        } else {
          results.success++;
        }
      }
    } catch (error: any) {
      results.errors.push({ 
        error: `Unexpected error: ${error?.message || 'Unknown error'}`,
        row: product
      });
    }
  }

  return results;
}
