// Improved Stock Movement Function
// Replace the createStockMovement function in lib/warehouse.ts with this improved version

export async function createStockMovement(movementData: CreateStockMovementData): Promise<StockMovement> {
  try {
    // Validate required fields
    if (!movementData.product_id || !movementData.warehouse_id || !movementData.quantity) {
      throw new Error('Missing required fields: product_id, warehouse_id, or quantity');
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

    // Prepare the data for insertion (Arabic & English)
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

    console.log('Creating stock movement with data:', fullMovementData);

    const { data, error } = await supabase
      .from('stock_movements')
      .insert([fullMovementData])
      .select(`
        *,
        product:products(*),
        warehouse:warehouses(*)
      `)
      .single();

    if (error) {
      console.error('Supabase error creating stock movement:', error);
      throw new Error(`Failed to create stock movement: ${error.message}`);
    }

    console.log('Stock movement created successfully:', data);

    // Update inventory after stock movement
    try {
      await updateInventoryAfterMovement(fullMovementData);
    } catch (inventoryError) {
      console.warn('Warning: Could not update inventory:', inventoryError);
      // Don't fail the entire operation if inventory update fails
    }

    return data;
  } catch (error) {
    console.error('Error in createStockMovement:', error);
    throw error;
  }
}
