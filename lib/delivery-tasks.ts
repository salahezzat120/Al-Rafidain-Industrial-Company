// Delivery Tasks API Functions for Al-Rafidain Industrial Company

import { supabase } from './supabase';
import type {
  DeliveryTask,
  TaskItem,
  TaskStatusHistory,
  CreateDeliveryTaskData,
  CreateTaskItemData,
  UpdateDeliveryTaskData,
  DeliveryTaskFilters,
  DeliveryTaskResponse,
  DeliveryTaskStats
} from '@/types/delivery-tasks';

// ==================== DELIVERY TASKS ====================

// Get delivery tasks by customer ID
export async function getDeliveryTasksByCustomerId(customerId: string): Promise<{ data: DeliveryTask[] | null; error: string | null }> {
  try {
    console.log('🔍 Fetching delivery tasks for customer:', customerId);
    
    const { data, error } = await supabase
      .from('delivery_tasks')
      .select(`
        id,
        task_id,
        title,
        description,
        status,
        priority,
        total_value,
        currency,
        scheduled_for,
        created_at
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching delivery tasks by customer ID:', error);
      return { data: null, error: error.message || 'Failed to fetch delivery tasks' };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error fetching delivery tasks by customer ID:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

export async function getDeliveryTasks(filters?: DeliveryTaskFilters): Promise<DeliveryTask[]> {
  try {
    console.log('🔍 Fetching delivery tasks...');
    
    let query = supabase
      .from('delivery_tasks')
      .select(`
        *,
        items:task_items(*)
      `)
      .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }

  if (filters?.representative_id) {
    query = query.eq('representative_id', filters.representative_id);
  }

  if (filters?.customer_id) {
    query = query.eq('customer_id', filters.customer_id);
  }

  if (filters?.date_from) {
    query = query.gte('scheduled_for', filters.date_from);
  }

  if (filters?.date_to) {
    query = query.lte('scheduled_for', filters.date_to);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,task_id.ilike.%${filters.search}%`);
  }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching delivery tasks:', error);
      throw new Error('Failed to fetch delivery tasks');
    }

    console.log('✅ Delivery tasks fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Error in getDeliveryTasks:', error);
    return [];
  }
}

export async function getDeliveryTaskById(id: string): Promise<DeliveryTask | null> {
  try {
    const { data, error } = await supabase
      .from('delivery_tasks')
      .select(`
        *,
        items:task_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching delivery task:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error in getDeliveryTaskById:', error);
    return null;
  }
}

export async function getDeliveryTaskByTaskId(taskId: string): Promise<DeliveryTask | null> {
  try {
    const { data, error } = await supabase
      .from('delivery_tasks')
      .select(`
        *,
        items:task_items(*)
      `)
      .eq('task_id', taskId)
      .single();

    if (error) {
      console.error('❌ Error fetching delivery task:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error in getDeliveryTaskByTaskId:', error);
    return null;
  }
}

export async function createDeliveryTask(taskData: CreateDeliveryTaskData): Promise<DeliveryTask> {
  // Validate stock availability before creating the task
  if (taskData.items && taskData.items.length > 0) {
    console.log('🔍 Validating stock availability...');
    
    for (const item of taskData.items) {
      if (item.product_id && item.quantity > 0) {
        try {
          const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock, product_name, product_code')
            .eq('id', item.product_id)
            .single();

          if (fetchError) {
            console.error(`❌ Error fetching product ${item.product_id}:`, fetchError);
            throw new Error(`Product ${item.product_id} not found`);
          }

          if (!product) {
            throw new Error(`Product ${item.product_id} not found`);
          }

          const currentStock = parseFloat(product.stock) || 0;
          
          if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.product_name} (${product.product_code}). Available: ${currentStock}, Required: ${item.quantity}`);
          }

          console.log(`✅ Stock validation passed for ${product.product_name}: ${currentStock} >= ${item.quantity}`);
        } catch (error) {
          console.error(`❌ Stock validation failed for product ${item.product_id}:`, error);
          throw error;
        }
      }
    }
    
    console.log('✅ All stock validations passed');
  }

  // Check for duplicate tasks with same title and customer within last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: recentTasks, error: duplicateCheckError } = await supabase
    .from('delivery_tasks')
    .select('id, title, customer_id, created_at')
    .eq('title', taskData.title)
    .eq('customer_id', taskData.customer_id)
    .gte('created_at', fiveMinutesAgo);

  if (duplicateCheckError) {
    console.error('❌ Error checking for duplicate tasks:', duplicateCheckError);
  } else if (recentTasks && recentTasks.length > 0) {
    console.log('⚠️ Potential duplicate task detected:', recentTasks);
    throw new Error('A similar task was created recently. Please wait a moment before creating another task.');
  }

  // Generate unique task ID
  const taskId = await generateTaskId();

  // Create the main task record
  const { data: task, error: taskError } = await supabase
    .from('delivery_tasks')
    .insert([{
      task_id: taskId,
      title: taskData.title,
      description: taskData.description,
      customer_id: taskData.customer_id,
      customer_name: taskData.customer_name,
      customer_address: taskData.customer_address,
      customer_phone: taskData.customer_phone,
      representative_id: taskData.representative_id,
      representative_name: taskData.representative_name,
      priority: taskData.priority,
      estimated_duration: taskData.estimated_duration,
      scheduled_for: taskData.scheduled_for,
      notes: taskData.notes,
      total_value: taskData.total_value,
      currency: taskData.currency || 'IQD'
    }])
    .select()
    .single();

  if (taskError) {
    console.error('❌ Error creating delivery task:', taskError);
    console.error('❌ Full error details:', JSON.stringify(taskError, null, 2));
    
    // Handle specific error cases
    if (taskError.code === '23505') {
      throw new Error('Task ID already exists. Please try again.');
    } else if (taskError.code === '23503') {
      throw new Error('Invalid customer or representative ID.');
    } else {
      throw new Error('Failed to create delivery task');
    }
  }

  console.log('✅ Delivery task created successfully:', task.id);

  // Create task items if provided
  if (taskData.items && taskData.items.length > 0) {
    console.log('🔍 Creating task items:', taskData.items.length);
    
    const itemsData = taskData.items.map(item => ({
      task_id: task.id, // Use the UUID from the created task (this is correct)
      product_id: item.product_id,
      product_name: item.product_name,
      product_code: item.product_code,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      unit_of_measurement: item.unit_of_measurement,
      warehouse_id: item.warehouse_id,
      warehouse_name: item.warehouse_name
    }));

    console.log('📦 Task items data to insert:', itemsData);

    const { error: itemsError } = await supabase
      .from('task_items')
      .insert(itemsData);

    if (itemsError) {
      console.error('❌ Error creating task items:', itemsError);
      console.error('❌ Full error details:', JSON.stringify(itemsError, null, 2));
      // Rollback the task creation
      await supabase.from('delivery_tasks').delete().eq('id', task.id);
      throw new Error('Failed to create task items');
    }
    
    console.log('✅ Task items created successfully');
    
    // Reduce stock for products that have product_id
    console.log('📉 Reducing stock for products...');
    for (const item of taskData.items) {
      if (item.product_id && item.quantity > 0) {
        try {
          console.log(`🔍 Reducing stock for product ${item.product_id} by ${item.quantity}`);
          
          // Get current stock
          const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock, product_name')
            .eq('id', item.product_id)
            .single();

          if (fetchError) {
            console.error(`❌ Error fetching product ${item.product_id}:`, fetchError);
            continue;
          }

          if (!product) {
            console.error(`❌ Product ${item.product_id} not found`);
            continue;
          }

          const currentStock = parseFloat(product.stock) || 0;
          const newStock = Math.max(0, currentStock - item.quantity);

          console.log(`📊 Product ${item.product_name}: ${currentStock} -> ${newStock}`);

          // Update stock
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              stock: newStock,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.product_id);

          if (updateError) {
            console.error(`❌ Error updating stock for product ${item.product_id}:`, updateError);
          } else {
            console.log(`✅ Stock updated for product ${item.product_name}: ${newStock}`);
          }
        } catch (error) {
          console.error(`❌ Error processing stock reduction for product ${item.product_id}:`, error);
        }
      }
    }
  }

  // Fetch the complete task with items
  const completeTask = await getDeliveryTaskById(task.id);
  return completeTask!;
}

export async function updateDeliveryTask(id: string, updateData: UpdateDeliveryTaskData): Promise<DeliveryTask> {
  const { data, error } = await supabase
    .from('delivery_tasks')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating delivery task:', error);
    throw new Error('Failed to update delivery task');
  }

  // If status changed to cancelled, restore stock
  if (updateData.status === 'cancelled') {
    console.log('🔄 Task cancelled, restoring stock...');
    await restoreStockForTask(id);
  }

  return await getDeliveryTaskById(id) as DeliveryTask;
}

export async function deleteDeliveryTask(id: string): Promise<void> {
  // Restore stock before deleting the task
  console.log('🔄 Deleting task, restoring stock...');
  await restoreStockForTask(id);
  
  const { error } = await supabase
    .from('delivery_tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting delivery task:', error);
    throw new Error('Failed to delete delivery task');
  }
}

// Helper function to restore stock when a task is cancelled or deleted
async function restoreStockForTask(taskId: string): Promise<void> {
  try {
    console.log(`🔍 Restoring stock for task ${taskId}...`);
    
    // Get task items
    const { data: items, error: itemsError } = await supabase
      .from('task_items')
      .select('product_id, quantity, product_name')
      .eq('task_id', taskId);

    if (itemsError) {
      console.error('❌ Error fetching task items:', itemsError);
      return;
    }

    if (!items || items.length === 0) {
      console.log('📋 No items to restore stock for');
      return;
    }

    // Restore stock for each item
    for (const item of items) {
      if (item.product_id && item.quantity > 0) {
        try {
          console.log(`🔄 Restoring ${item.quantity} units for product ${item.product_id}`);
          
          // Get current stock
          const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock, product_name')
            .eq('id', item.product_id)
            .single();

          if (fetchError) {
            console.error(`❌ Error fetching product ${item.product_id}:`, fetchError);
            continue;
          }

          if (!product) {
            console.error(`❌ Product ${item.product_id} not found`);
            continue;
          }

          const currentStock = parseFloat(product.stock) || 0;
          const newStock = currentStock + item.quantity;

          console.log(`📊 Product ${product.product_name}: ${currentStock} -> ${newStock}`);

          // Update stock
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              stock: newStock,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.product_id);

          if (updateError) {
            console.error(`❌ Error updating stock for product ${item.product_id}:`, updateError);
          } else {
            console.log(`✅ Stock restored for product ${product.product_name}: ${newStock}`);
          }
        } catch (error) {
          console.error(`❌ Error processing stock restoration for product ${item.product_id}:`, error);
        }
      }
    }
    
    console.log('✅ Stock restoration completed');
  } catch (error) {
    console.error('❌ Error in restoreStockForTask:', error);
  }
}

// ==================== TASK ITEMS ====================

export async function getTaskItems(taskId: string): Promise<TaskItem[]> {
  const { data, error } = await supabase
    .from('task_items')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at');

  if (error) {
    console.error('Error fetching task items:', error);
    throw new Error('Failed to fetch task items');
  }

  return data || [];
}

export async function addTaskItem(taskId: string, itemData: CreateTaskItemData): Promise<TaskItem> {
  const { data, error } = await supabase
    .from('task_items')
    .insert([{
      task_id: taskId,
      ...itemData
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding task item:', error);
    throw new Error('Failed to add task item');
  }

  return data;
}

export async function updateTaskItem(id: number, updateData: Partial<CreateTaskItemData>): Promise<TaskItem> {
  const { data, error } = await supabase
    .from('task_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task item:', error);
    throw new Error('Failed to update task item');
  }

  return data;
}

export async function deleteTaskItem(id: number): Promise<void> {
  const { error } = await supabase
    .from('task_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task item:', error);
    throw new Error('Failed to delete task item');
  }
}

// ==================== UTILITY FUNCTIONS ====================

async function generateTaskId(): Promise<string> {
  const maxRetries = 5;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Get all existing task IDs to find the highest number
      const { data, error } = await supabase
        .from('delivery_tasks')
        .select('task_id')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error generating task ID:', error);
        throw new Error('Failed to generate task ID');
      }

      let nextNumber = 1;
      if (data && data.length > 0) {
        // Find the highest task number
        let maxNumber = 0;
        for (const task of data) {
          const match = task.task_id.match(/T(\d+)/);
          if (match) {
            const number = parseInt(match[1]);
            if (number > maxNumber) {
              maxNumber = number;
            }
          }
        }
        nextNumber = maxNumber + 1;
      }

      // Generate a unique task ID with timestamp and random component
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const taskId = `T${String(nextNumber).padStart(3, '0')}-${timestamp}-${random}`;
      
      console.log(`🔍 Generated task ID (attempt ${attempt}): ${taskId}`);
      
      // Check if this task ID already exists
      const { data: existingTask, error: checkError } = await supabase
        .from('delivery_tasks')
        .select('id')
        .eq('task_id', taskId)
        .limit(1);

      if (checkError) {
        console.error('Error checking task ID uniqueness:', checkError);
        throw new Error('Failed to check task ID uniqueness');
      }

      if (!existingTask || existingTask.length === 0) {
        console.log(`✅ Unique task ID generated: ${taskId}`);
        return taskId;
      } else {
        console.log(`⚠️  Task ID ${taskId} already exists, retrying...`);
        if (attempt === maxRetries) {
          throw new Error('Failed to generate unique task ID after maximum retries');
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      if (attempt === maxRetries) {
        console.error('❌ Failed to generate task ID after all retries:', error);
        throw error;
      }
      console.log(`⚠️  Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  throw new Error('Failed to generate unique task ID');
}

export async function getDeliveryTaskStats(): Promise<DeliveryTaskStats> {
  try {
    const { data, error } = await supabase
      .from('delivery_tasks')
      .select('status, total_value');

    if (error) {
      console.error('Error fetching delivery task stats:', error);
      // Return default stats if table doesn't exist or has issues
      return {
        total: 0,
        pending: 0,
        assigned: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        total_value: 0
      };
    }

    const stats: DeliveryTaskStats = {
      total: 0,
      pending: 0,
      assigned: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      total_value: 0
    };

    data?.forEach(task => {
      stats.total++;
      stats[task.status as keyof DeliveryTaskStats]++;
      stats.total_value += task.total_value || 0;
    });

    return stats;
  } catch (error) {
    console.error('Error in getDeliveryTaskStats:', error);
    // Return default stats on any error
    return {
      total: 0,
      pending: 0,
      assigned: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      total_value: 0
    };
  }
}

export async function updateTaskStatus(taskId: string, status: string, notes?: string): Promise<void> {
  // Update the task status
  const { error: updateError } = await supabase
    .from('delivery_tasks')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('task_id', taskId);

  if (updateError) {
    console.error('Error updating task status:', updateError);
    throw new Error('Failed to update task status');
  }

  // Add to status history
  const { error: historyError } = await supabase
    .from('task_status_history')
    .insert([{
      task_id: taskId,
      status,
      changed_by: 'admin', // TODO: Get from auth context
      notes: notes || `Status changed to ${status}`
    }]);

  if (historyError) {
    console.error('Error adding status history:', historyError);
    throw new Error('Failed to add status history');
  }
}
