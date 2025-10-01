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

export async function getDeliveryTasks(filters?: DeliveryTaskFilters): Promise<DeliveryTask[]> {
  let query = supabase
    .from('delivery_tasks')
    .select(`
      *,
      items:task_items(*),
      status_history:task_status_history(*)
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
    console.error('Error fetching delivery tasks:', error);
    throw new Error('Failed to fetch delivery tasks');
  }

  return data || [];
}

export async function getDeliveryTaskById(id: number): Promise<DeliveryTask | null> {
  const { data, error } = await supabase
    .from('delivery_tasks')
    .select(`
      *,
      items:task_items(*),
      status_history:task_status_history(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching delivery task:', error);
    throw new Error('Failed to fetch delivery task');
  }

  return data;
}

export async function getDeliveryTaskByTaskId(taskId: string): Promise<DeliveryTask | null> {
  const { data, error } = await supabase
    .from('delivery_tasks')
    .select(`
      *,
      items:task_items(*),
      status_history:task_status_history(*)
    `)
    .eq('task_id', taskId)
    .single();

  if (error) {
    console.error('Error fetching delivery task:', error);
    throw new Error('Failed to fetch delivery task');
  }

  return data;
}

export async function createDeliveryTask(taskData: CreateDeliveryTaskData): Promise<DeliveryTask> {
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
      currency: taskData.currency || 'IQD',
      created_by: 'admin' // TODO: Get from auth context
    }])
    .select()
    .single();

  if (taskError) {
    console.error('Error creating delivery task:', taskError);
    throw new Error('Failed to create delivery task');
  }

  // Create task items if provided
  if (taskData.items && taskData.items.length > 0) {
    const itemsData = taskData.items.map(item => ({
      task_id: taskId,
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

    const { error: itemsError } = await supabase
      .from('task_items')
      .insert(itemsData);

    if (itemsError) {
      console.error('Error creating task items:', itemsError);
      // Rollback the task creation
      await supabase.from('delivery_tasks').delete().eq('id', task.id);
      throw new Error('Failed to create task items');
    }
  }

  // Create initial status history
  await supabase
    .from('task_status_history')
    .insert([{
      task_id: taskId,
      status: 'pending',
      changed_by: 'admin', // TODO: Get from auth context
      notes: 'Task created'
    }]);

  // Fetch the complete task with items and history
  const completeTask = await getDeliveryTaskById(task.id);
  return completeTask!;
}

export async function updateDeliveryTask(id: number, updateData: UpdateDeliveryTaskData): Promise<DeliveryTask> {
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

  // If status changed, add to history
  if (updateData.status) {
    const currentTask = await getDeliveryTaskById(id);
    if (currentTask && currentTask.status !== updateData.status) {
      await supabase
        .from('task_status_history')
        .insert([{
          task_id: currentTask.task_id,
          status: updateData.status,
          changed_by: 'admin', // TODO: Get from auth context
          notes: `Status changed to ${updateData.status}`
        }]);
    }
  }

  return await getDeliveryTaskById(id) as DeliveryTask;
}

export async function deleteDeliveryTask(id: number): Promise<void> {
  const { error } = await supabase
    .from('delivery_tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting delivery task:', error);
    throw new Error('Failed to delete delivery task');
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
  // Get the latest task ID
  const { data, error } = await supabase
    .from('delivery_tasks')
    .select('task_id')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error generating task ID:', error);
    throw new Error('Failed to generate task ID');
  }

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastTaskId = data[0].task_id;
    const match = lastTaskId.match(/T(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `T${String(nextNumber).padStart(3, '0')}`;
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
