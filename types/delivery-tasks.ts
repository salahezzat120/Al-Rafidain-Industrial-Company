// Delivery Tasks Types for Al-Rafidain Industrial Company

export interface DeliveryTask {
  id: string; // UUID
  task_id: string;
  title: string;
  description?: string;
  customer_id: string; // UUID
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  representative_id?: string;
  representative_name?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_duration?: string;
  scheduled_for?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  total_value: number;
  currency: string;
  
  // Related data
  items?: TaskItem[];
  status_history?: TaskStatusHistory[];
}

export interface TaskItem {
  id: string; // UUID
  task_id: string; // UUID
  product_id?: number;
  product_name: string;
  product_code?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_of_measurement?: string;
  warehouse_id?: number;
  warehouse_name?: string;
  created_at: string;
}

export interface TaskStatusHistory {
  id: number;
  task_id: string;
  status: string;
  changed_by?: string;
  changed_at: string;
  notes?: string;
}

export interface CreateDeliveryTaskData {
  title: string;
  description?: string;
  customer_id: string;
  customer_name: string;
  customer_address: string;
  customer_phone?: string;
  representative_id?: string;
  representative_name?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_duration?: string;
  scheduled_for?: string;
  notes?: string;
  items: CreateTaskItemData[];
  total_value: number;
  currency?: string;
}

export interface CreateTaskItemData {
  product_id?: number | null;
  product_name: string;
  product_code?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_of_measurement?: string;
  warehouse_id?: number | null;
  warehouse_name?: string;
}

export interface UpdateDeliveryTaskData {
  title?: string;
  description?: string;
  customer_id?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  representative_id?: string;
  representative_name?: string;
  status?: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_duration?: string;
  scheduled_for?: string;
  notes?: string;
  total_value?: number;
  currency?: string;
}

export interface DeliveryTaskFilters {
  status?: string;
  priority?: string;
  representative_id?: string;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface DeliveryTaskResponse {
  data: DeliveryTask[];
  count: number;
  error?: string;
}

export interface DeliveryTaskStats {
  total: number;
  pending: number;
  assigned: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  total_value: number;
}
