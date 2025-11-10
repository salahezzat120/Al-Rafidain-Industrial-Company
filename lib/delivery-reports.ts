import { supabase } from '@/lib/supabase';

export interface DeliveryReport {
  id: string;
  task_id: string;
  title: string;
  representative_id: string;
  representative_name: string;
  representative_phone: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_time: string;
  delivery_success: boolean;
  status: string;
  total_value: number;
  currency: string;
  // Sum of completed payments associated with this delivery (payments.order_id = delivery_tasks.id)
  payment_amount?: number;
  notes?: string;
  created_at: string;
  completed_at?: string;
}

export interface DeliveryStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  successRate: number;
  totalValue: number;
  averageDeliveryTime: number;
}

/**
 * Fetch delivery reports for a specific representative
 */
export async function getRepresentativeDeliveries(
  representativeId: string,
  periodDays: number = 30
): Promise<{ data: DeliveryReport[]; error: string | null }> {
  try {
    console.log('🔍 Fetching delivery reports for representative:', representativeId);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - periodDays);

    // Get representative phone number
    const { data: representative, error: repError } = await supabase
      .from('representatives')
      .select('phone')
      .eq('id', representativeId)
      .single();

    if (repError) {
      console.error('❌ Error fetching representative phone:', repError);
    }

    // Get delivery data
    const { data: deliveries, error: deliveriesError } = await supabase
      .from('delivery_tasks')
      .select('*')
      .eq('representative_id', representativeId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (deliveriesError) {
      console.error('❌ Error fetching deliveries:', deliveriesError);
      return { data: [], error: deliveriesError.message };
    }

    // Fetch completed payments for the listed deliveries and sum by order_id
    const deliveryIds = (deliveries || []).map(d => d.id);
    let paymentsByOrderId = new Map<string, number>();
    if (deliveryIds.length > 0) {
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('order_id, amount, status')
        .in('order_id', deliveryIds)
        .eq('status', 'completed');

      if (paymentsError) {
        console.error('❌ Error fetching payments for deliveries:', paymentsError);
      } else if (payments) {
        for (const p of payments) {
          const current = paymentsByOrderId.get(p.order_id) || 0;
          paymentsByOrderId.set(p.order_id, current + (Number(p.amount) || 0));
        }
      }
    }

    // Get representative name from representatives table
    const { data: repData, error: repDataError } = await supabase
      .from('representatives')
      .select('id, name, phone')
      .eq('id', representativeId)
      .single();

    // Transform data to match our interface
    const deliveryReports: DeliveryReport[] = (deliveries || []).map(delivery => ({
      id: delivery.id,
      task_id: delivery.task_id,
      title: delivery.title,
      representative_id: delivery.representative_id,
      representative_name: repData?.name || delivery.representative_name || 'Unknown',
      representative_phone: repData?.phone || representative?.phone || 'N/A',
      customer_name: delivery.customer_name,
      customer_phone: delivery.customer_phone,
      customer_address: delivery.customer_address,
      delivery_time: delivery.completed_at || delivery.created_at,
      delivery_success: delivery.status === 'completed',
      status: delivery.status,
      total_value: delivery.total_value || 0,
      currency: delivery.currency || 'IQD',
      payment_amount: paymentsByOrderId.get(delivery.id) || 0,
      notes: delivery.notes,
      created_at: delivery.created_at,
      completed_at: delivery.completed_at
    }));

    console.log('✅ Successfully fetched delivery reports:', deliveryReports.length);
    return { data: deliveryReports, error: null };

  } catch (error) {
    console.error('❌ Exception in getRepresentativeDeliveries:', error);
    return { data: [], error: 'Failed to fetch delivery reports' };
  }
}

/**
 * Get all delivery reports across all representatives
 */
export async function getAllDeliveryReports(
  periodDays: number = 30
): Promise<{ data: DeliveryReport[]; error: string | null }> {
  try {
    console.log('🔍 Fetching all delivery reports');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - periodDays);

    // Get all representatives with phone numbers
    const { data: representatives, error: repsError } = await supabase
      .from('representatives')
      .select('id, phone')
      .in('status', ['active', 'on-route']);

    if (repsError) {
      console.error('❌ Error fetching representatives:', repsError);
      return { data: [], error: repsError.message };
    }

    // Create a map of representative IDs to phone numbers
    const repPhoneMap = new Map(
      representatives?.map(rep => [rep.id, rep.phone]) || []
    );

    // Get all delivery data
    const { data: deliveries, error: deliveriesError } = await supabase
      .from('delivery_tasks')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (deliveriesError) {
      console.error('❌ Error fetching deliveries:', deliveriesError);
      return { data: [], error: deliveriesError.message };
    }

    // Fetch completed payments for these deliveries and sum by order_id
    const deliveryIds = (deliveries || []).map(d => d.id);
    let paymentsByOrderId = new Map<string, number>();
    if (deliveryIds.length > 0) {
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('order_id, amount, status')
        .in('order_id', deliveryIds)
        .eq('status', 'completed');

      if (paymentsError) {
        console.error('❌ Error fetching payments for deliveries:', paymentsError);
      } else if (payments) {
        for (const p of payments) {
          const current = paymentsByOrderId.get(p.order_id) || 0;
          paymentsByOrderId.set(p.order_id, current + (Number(p.amount) || 0));
        }
      }
    }

    // Create a map of representative IDs to names
    const repNameMap = new Map(
      representatives?.map(rep => [rep.id, rep.name]) || []
    );

    // Transform data to match our interface
    const deliveryReports: DeliveryReport[] = (deliveries || []).map(delivery => ({
      id: delivery.id,
      task_id: delivery.task_id,
      title: delivery.title,
      representative_id: delivery.representative_id,
      representative_name: repNameMap.get(delivery.representative_id) || delivery.representative_name || 'Unknown',
      representative_phone: repPhoneMap.get(delivery.representative_id) || 'N/A',
      customer_name: delivery.customer_name,
      customer_phone: delivery.customer_phone,
      customer_address: delivery.customer_address,
      delivery_time: delivery.completed_at || delivery.created_at,
      delivery_success: delivery.status === 'completed',
      status: delivery.status,
      total_value: delivery.total_value || 0,
      currency: delivery.currency || 'IQD',
      payment_amount: paymentsByOrderId.get(delivery.id) || 0,
      notes: delivery.notes,
      created_at: delivery.created_at,
      completed_at: delivery.completed_at
    }));

    console.log('✅ Successfully fetched all delivery reports:', deliveryReports.length);
    return { data: deliveryReports, error: null };

  } catch (error) {
    console.error('❌ Exception in getAllDeliveryReports:', error);
    return { data: [], error: 'Failed to fetch delivery reports' };
  }
}

/**
 * Calculate delivery statistics
 */
export function calculateDeliveryStats(deliveries: DeliveryReport[]): DeliveryStats {
  const totalDeliveries = deliveries.length;
  const successfulDeliveries = deliveries.filter(d => d.delivery_success).length;
  const failedDeliveries = totalDeliveries - successfulDeliveries;
  const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;
  const totalValue = deliveries.reduce((sum, d) => sum + d.total_value, 0);

  // Calculate average delivery time (for completed deliveries)
  const completedDeliveries = deliveries.filter(d => d.delivery_success && d.completed_at);
  let averageDeliveryTime = 0;
  
  if (completedDeliveries.length > 0) {
    const totalTime = completedDeliveries.reduce((sum, delivery) => {
      const startTime = new Date(delivery.created_at).getTime();
      const endTime = new Date(delivery.completed_at!).getTime();
      return sum + (endTime - startTime);
    }, 0);
    averageDeliveryTime = totalTime / completedDeliveries.length / (1000 * 60); // Convert to minutes
  }

  return {
    totalDeliveries,
    successfulDeliveries,
    failedDeliveries,
    successRate: Math.round(successRate * 10) / 10,
    totalValue,
    averageDeliveryTime: Math.round(averageDeliveryTime * 10) / 10
  };
}

/**
 * Export delivery data to Excel format
 */
export function exportDeliveryToExcel(deliveries: DeliveryReport[], language: string = 'en'): any[] {
  return deliveries.map(delivery => ({
    [language === 'ar' ? 'اسم المندوب' : 'Representative Name']: delivery.representative_name,
    [language === 'ar' ? 'رقم هوية المندوب' : 'Representative ID Number']: delivery.representative_id,
    [language === 'ar' ? 'اسم العميل' : 'Client Name']: delivery.customer_name,
    [language === 'ar' ? 'رقم هاتف العميل' : 'Client Phone Number']: delivery.customer_phone,
    [language === 'ar' ? 'موقع العميل' : 'Client Location']: delivery.customer_address,
    [language === 'ar' ? 'وقت تسليم المنتج للعميل' : 'Product Delivery Time to Client']: new Date(delivery.delivery_time).toLocaleString(),
    [language === 'ar' ? 'هل تم تسليم المنتج بنجاح أم فشل؟' : 'Was the Product Delivered Successfully or Failed?']: delivery.delivery_success ? (language === 'ar' ? 'نجح' : 'Successfully') : (language === 'ar' ? 'فشل' : 'Failed'),
    [language === 'ar' ? 'حالة التسليم' : 'Delivery Status']: delivery.status,
    [language === 'ar' ? 'قيمة الطلب' : 'Order Value']: `${delivery.total_value} ${delivery.currency}`,
    [language === 'ar' ? 'المبلغ المدفوع' : 'Paid Amount']: `${(delivery.payment_amount || 0)} ${delivery.currency}`,
    [language === 'ar' ? 'ملاحظات' : 'Notes']: delivery.notes || (language === 'ar' ? 'لا توجد ملاحظات' : 'No notes'),
    [language === 'ar' ? 'تاريخ الإنشاء' : 'Created At']: new Date(delivery.created_at).toLocaleString()
  }));
}
