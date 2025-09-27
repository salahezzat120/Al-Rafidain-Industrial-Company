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

    // Prepare the data for insertion
    const fullMovementData = {
      product_id: movementData.product_id,
      warehouse_id: movementData.warehouse_id,
      movement_type: dbMovementType,
      quantity: Math.abs(movementData.quantity), // Ensure positive quantity
      unit_price: movementData.unit_price || 0,
      reference_number: movementData.reference_number || `REF-${Date.now()}`,
      notes: movementData.notes || '',
      created_by: movementData.created_by || 'System'
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
