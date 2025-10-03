import { supabase } from './supabase';
import { createStockMovement } from './warehouse';

// ==================== WORKFLOW INTEGRATION FUNCTIONS ====================

export async function getWorkflowEvents(type?: 'PRODUCTION' | 'SALES' | 'DELIVERY' | 'RETURN'): Promise<any[]> {
  try {
    let query = supabase
      .from('workflow_events')
      .select(`
        *,
        warehouse:warehouses(*),
        product:products(*)
      `)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('event_type', type);
    }

    const { data, error } = await query;
    
    if (error) {
      // Check if table doesn't exist
      if (error.message?.includes('relation "workflow_events" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Workflow events table does not exist. Please create it first.');
        return [];
      }
      console.error('Error fetching workflow events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWorkflowEvents:', error);
    return [];
  }
}

export async function createWorkflowEvent(eventData: {
  event_type: 'PRODUCTION' | 'SALES' | 'DELIVERY' | 'RETURN';
  description: string;
  description_ar: string;
  warehouse_id: number;
  product_id: number;
  quantity: number;
  reference_number: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('workflow_events')
      .insert([{
        ...eventData,
        status: eventData.status || 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        *,
        warehouse:warehouses(*),
        product:products(*)
      `)
      .single();

    if (error) {
      console.error('Error creating workflow event:', error);
      throw new Error(`Failed to create workflow event: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in createWorkflowEvent:', error);
    throw error;
  }
}

export async function updateWorkflowEventStatus(eventId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('workflow_events')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select(`
        *,
        warehouse:warehouses(*),
        product:products(*)
      `)
      .single();

    if (error) {
      console.error('Error updating workflow event:', error);
      throw new Error(`Failed to update workflow event: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in updateWorkflowEventStatus:', error);
    throw error;
  }
}

export async function processWorkflowEvent(eventId: string): Promise<any> {
  try {
    // Get the event details
    const { data: event, error: fetchError } = await supabase
      .from('workflow_events')
      .select(`
        *,
        warehouse:warehouses(*),
        product:products(*)
      `)
      .eq('id', eventId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch workflow event: ${fetchError.message}`);
    }

    if (!event) {
      throw new Error('Workflow event not found');
    }

    // Process based on event type
    switch (event.event_type) {
      case 'PRODUCTION':
        // Create stock movement for production
        await createStockMovement({
          product_id: event.product_id,
          warehouse_id: event.warehouse_id,
          movement_type: 'RECEIPT',
          quantity: event.quantity,
          unit_price: 0, // Production cost would be calculated separately
          reference_number: event.reference_number,
          notes: `Production event: ${event.description}`
        });
        break;

      case 'SALES':
        // Create stock movement for sales
        await createStockMovement({
          product_id: event.product_id,
          warehouse_id: event.warehouse_id,
          movement_type: 'ISSUE',
          quantity: event.quantity,
          unit_price: 0, // Sales price would be calculated separately
          reference_number: event.reference_number,
          notes: `Sales event: ${event.description}`
        });
        break;

      case 'DELIVERY':
        // Update delivery status
        await createStockMovement({
          product_id: event.product_id,
          warehouse_id: event.warehouse_id,
          movement_type: 'ISSUE',
          quantity: event.quantity,
          unit_price: 0,
          reference_number: event.reference_number,
          notes: `Delivery event: ${event.description}`
        });
        break;

      case 'RETURN':
        // Create stock movement for returns
        await createStockMovement({
          product_id: event.product_id,
          warehouse_id: event.warehouse_id,
          movement_type: 'RETURN',
          quantity: event.quantity,
          unit_price: 0,
          reference_number: event.reference_number,
          notes: `Return event: ${event.description}`
        });
        break;
    }

    // Update event status to completed
    return await updateWorkflowEventStatus(eventId, 'COMPLETED');
  } catch (error) {
    console.error('Error processing workflow event:', error);
    // Update event status to failed
    await updateWorkflowEventStatus(eventId, 'FAILED');
    throw error;
  }
}

export async function getWorkflowStats(): Promise<{
  totalEvents: number;
  pendingEvents: number;
  completedEvents: number;
  failedEvents: number;
  productionEvents: number;
  salesEvents: number;
  deliveryEvents: number;
  returnEvents: number;
}> {
  try {
    const { data: events, error } = await supabase
      .from('workflow_events')
      .select('event_type, status');

    if (error) {
      // Check if table doesn't exist
      if (error.message?.includes('relation "workflow_events" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Workflow events table does not exist. Please create it first.');
        return {
          totalEvents: 0,
          pendingEvents: 0,
          completedEvents: 0,
          failedEvents: 0,
          productionEvents: 0,
          salesEvents: 0,
          deliveryEvents: 0,
          returnEvents: 0
        };
      }
      console.error('Error fetching workflow stats:', error);
      return {
        totalEvents: 0,
        pendingEvents: 0,
        completedEvents: 0,
        failedEvents: 0,
        productionEvents: 0,
        salesEvents: 0,
        deliveryEvents: 0,
        returnEvents: 0
      };
    }

    const stats = {
      totalEvents: events.length,
      pendingEvents: events.filter(e => e.status === 'PENDING').length,
      completedEvents: events.filter(e => e.status === 'COMPLETED').length,
      failedEvents: events.filter(e => e.status === 'FAILED').length,
      productionEvents: events.filter(e => e.event_type === 'PRODUCTION').length,
      salesEvents: events.filter(e => e.event_type === 'SALES').length,
      deliveryEvents: events.filter(e => e.event_type === 'DELIVERY').length,
      returnEvents: events.filter(e => e.event_type === 'RETURN').length
    };

    return stats;
  } catch (error) {
    console.error('Error in getWorkflowStats:', error);
    return {
      totalEvents: 0,
      pendingEvents: 0,
      completedEvents: 0,
      failedEvents: 0,
      productionEvents: 0,
      salesEvents: 0,
      deliveryEvents: 0,
      returnEvents: 0
    };
  }
}

export async function createWorkflowTable(): Promise<boolean> {
  try {
    // Create the workflow_events table using SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS workflow_events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('PRODUCTION', 'SALES', 'DELIVERY', 'RETURN')),
          description TEXT NOT NULL,
          description_ar TEXT,
          warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL DEFAULT 0,
          reference_number VARCHAR(100) NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_workflow_events_type ON workflow_events(event_type);
        CREATE INDEX IF NOT EXISTS idx_workflow_events_status ON workflow_events(status);
        CREATE INDEX IF NOT EXISTS idx_workflow_events_warehouse ON workflow_events(warehouse_id);
        CREATE INDEX IF NOT EXISTS idx_workflow_events_product ON workflow_events(product_id);
        CREATE INDEX IF NOT EXISTS idx_workflow_events_created_at ON workflow_events(created_at);
        
        ALTER TABLE workflow_events ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow all operations on workflow_events" ON workflow_events
          FOR ALL USING (true);
      `
    });

    if (error) {
      console.error('Error creating workflow table:', error);
      return false;
    }

    console.log('Workflow events table created successfully');
    return true;
  } catch (error) {
    console.error('Error in createWorkflowTable:', error);
    return false;
  }
}

export async function createSampleWarehousesAndProducts(): Promise<void> {
  try {
    // Create sample warehouses
    const { data: existingWarehouses } = await supabase.from('warehouses').select('*');
    
    if (!existingWarehouses || existingWarehouses.length === 0) {
      const sampleWarehouses = [
        {
          warehouse_name: 'Factory Warehouse',
          warehouse_name_ar: 'مستودع المصنع',
          location: 'Industrial Zone',
          location_ar: 'المنطقة الصناعية',
          address: '123 Industrial St',
          responsible_person: 'Ahmed Ali',
          responsible_person_ar: 'أحمد علي',
          warehouse_type: 'PRODUCTION',
          capacity: 10000,
          contact_phone: '+1234567890',
          contact_email: 'factory@company.com'
        },
        {
          warehouse_name: 'Distribution Warehouse',
          warehouse_name_ar: 'مستودع التوزيع',
          location: 'City Center',
          location_ar: 'وسط المدينة',
          address: '456 Main St',
          responsible_person: 'Sara Mohamed',
          responsible_person_ar: 'سارة محمد',
          warehouse_type: 'DISTRIBUTION',
          capacity: 5000,
          contact_phone: '+1234567891',
          contact_email: 'distribution@company.com'
        }
      ];

      const { error: warehouseError } = await supabase
        .from('warehouses')
        .insert(sampleWarehouses);

      if (warehouseError) {
        console.error('Error creating sample warehouses:', warehouseError);
        throw new Error(`Failed to create sample warehouses: ${warehouseError.message}`);
      }
    }

    // Create sample products
    const { data: existingProducts } = await supabase.from('products').select('*');
    
    if (!existingProducts || existingProducts.length === 0) {
      const sampleProducts = [
        {
          product_name: 'White Plastic Cup',
          product_name_ar: 'كوب بلاستيك أبيض',
          product_code: 'CUP-WH-200',
          description: '200ml white plastic cup',
          cost_price: 0.50,
          selling_price: 1.00,
          weight: 10,
          dimensions: '200ml',
          stock: 0,
          is_active: true
        },
        {
          product_name: 'Blue Plastic Bottle',
          product_name_ar: 'زجاجة بلاستيك زرقاء',
          product_code: 'BOTTLE-BL-500',
          description: '500ml blue plastic bottle',
          cost_price: 1.20,
          selling_price: 2.50,
          weight: 25,
          dimensions: '500ml',
          stock: 0,
          is_active: true
        },
        {
          product_name: 'Red Plastic Plate',
          product_name_ar: 'طبق بلاستيك أحمر',
          product_code: 'PLATE-RD-300',
          description: '300mm red plastic plate',
          cost_price: 0.80,
          selling_price: 1.80,
          weight: 15,
          dimensions: '300mm',
          stock: 0,
          is_active: true
        }
      ];

      const { error: productError } = await supabase
        .from('products')
        .insert(sampleProducts);

      if (productError) {
        console.error('Error creating sample products:', productError);
        throw new Error(`Failed to create sample products: ${productError.message}`);
      }
    }

    console.log('Sample warehouses and products created successfully');
  } catch (error) {
    console.error('Error in createSampleWarehousesAndProducts:', error);
    throw error;
  }
}

export async function createSampleWorkflowEvents(): Promise<void> {
  try {
    // First, ensure we have warehouses and products
    await createSampleWarehousesAndProducts();

    // Get some products and warehouses for sample data
    const { data: products } = await supabase.from('products').select('*').limit(3);
    const { data: warehouses } = await supabase.from('warehouses').select('*').limit(3);

    if (!products || products.length === 0) {
      console.log('No products found. Please create some products first.');
      throw new Error('No products found. Please create some products first.');
    }

    if (!warehouses || warehouses.length === 0) {
      console.log('No warehouses found. Please create some warehouses first.');
      throw new Error('No warehouses found. Please create some warehouses first.');
    }

    const sampleEvents = [
      {
        event_type: 'PRODUCTION' as const,
        description: 'New production batch completed',
        description_ar: 'تم إكمال دفعة إنتاج جديدة',
        warehouse_id: warehouses[0].id,
        product_id: products[0].id,
        quantity: 1000,
        reference_number: 'PROD-2024-001',
        status: 'PENDING' as const
      },
      {
        event_type: 'SALES' as const,
        description: 'Sales order processed',
        description_ar: 'تم معالجة طلب البيع',
        warehouse_id: warehouses[1]?.id || warehouses[0].id,
        product_id: products[1]?.id || products[0].id,
        quantity: 500,
        reference_number: 'SO-2024-001',
        status: 'PENDING' as const
      },
      {
        event_type: 'DELIVERY' as const,
        description: 'Delivery completed to customer',
        description_ar: 'تم إكمال التوصيل للعميل',
        warehouse_id: warehouses[2]?.id || warehouses[0].id,
        product_id: products[2]?.id || products[0].id,
        quantity: 200,
        reference_number: 'DEL-2024-001',
        status: 'PENDING' as const
      },
      {
        event_type: 'RETURN' as const,
        description: 'Customer return processed',
        description_ar: 'تم معالجة إرجاع العميل',
        warehouse_id: warehouses[0].id,
        product_id: products[0].id,
        quantity: 50,
        reference_number: 'RET-2024-001',
        status: 'PENDING' as const
      }
    ];

    const { error } = await supabase
      .from('workflow_events')
      .insert(sampleEvents);

    if (error) {
      console.error('Error creating sample workflow events:', error);
      throw new Error(`Failed to create sample workflow events: ${error.message}`);
    } else {
      console.log('Sample workflow events created successfully');
    }
  } catch (error) {
    console.error('Error in createSampleWorkflowEvents:', error);
    throw error;
  }
}
