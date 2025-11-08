import { supabase } from '@/lib/supabase';

export interface RepresentativePerformance {
  representative_id: string;
  representative_name: string;
  representative_phone: string;
  average_visits: number;
  average_order_deliveries: number;
  visit_rating: number;
  delivery_rating: number;
  total_visits: number;
  completed_visits: number;
  total_deliveries: number;
  completed_deliveries: number;
  visit_success_rate: number;
  delivery_success_rate: number;
  performance_period: string;
}

export interface PerformanceStats {
  total_representatives: number;
  average_visit_rating: number;
  average_delivery_rating: number;
  top_performer: string;
  total_visits: number;
  total_deliveries: number;
}

/**
 * Calculate performance rating based on success rate
 */
function calculateRating(successRate: number): number {
  if (successRate >= 90) return 5;
  if (successRate >= 80) return 4;
  if (successRate >= 70) return 3;
  if (successRate >= 60) return 2;
  return 1;
}

/**
 * Calculate average per day based on total count and date range
 */
function calculateAveragePerDay(total: number, startDate: Date, endDate: Date): number {
  const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  return total / daysDiff;
}

/**
 * Get performance data for a specific representative
 */
export async function getRepresentativePerformance(
  representativeId: string,
  periodDays: number = 30
): Promise<{ data: RepresentativePerformance | null; error: string | null }> {
  try {
    console.log('🔍 Fetching performance data for representative:', representativeId);

    // Get representative basic info
    const { data: representative, error: repError } = await supabase
      .from('representatives')
      .select('id, name, phone')
      .eq('id', representativeId)
      .single();

    if (repError || !representative) {
      console.error('❌ Error fetching representative:', repError);
      return { data: null, error: 'Representative not found' };
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - periodDays);

    // Get visits data
    const { data: visits, error: visitsError } = await supabase
      .from('visit_management')
      .select('*')
      .eq('delegate_id', representativeId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (visitsError) {
      console.error('❌ Error fetching visits:', visitsError);
      return { data: null, error: 'Failed to fetch visit data' };
    }

    // Get delivery data
    const { data: deliveries, error: deliveriesError } = await supabase
      .from('delivery_tasks')
      .select('*')
      .eq('representative_id', representativeId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (deliveriesError) {
      console.error('❌ Error fetching deliveries:', deliveriesError);
      return { data: null, error: 'Failed to fetch delivery data' };
    }

    // Calculate visit metrics
    const totalVisits = visits?.length || 0;
    const completedVisits = visits?.filter(v => v.status === 'completed').length || 0;
    const visitSuccessRate = totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;
    const averageVisits = calculateAveragePerDay(totalVisits, startDate, endDate);

    // Calculate delivery metrics
    const totalDeliveries = deliveries?.length || 0;
    const completedDeliveries = deliveries?.filter(d => d.status === 'completed').length || 0;
    const deliverySuccessRate = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0;
    const averageDeliveries = calculateAveragePerDay(totalDeliveries, startDate, endDate);

    // Calculate ratings
    const visitRating = calculateRating(visitSuccessRate);
    const deliveryRating = calculateRating(deliverySuccessRate);

    const performance: RepresentativePerformance = {
      representative_id: representative.id,
      representative_name: representative.name,
      representative_phone: representative.phone || 'N/A',
      average_visits: Math.round(averageVisits * 10) / 10, // Round to 1 decimal
      average_order_deliveries: Math.round(averageDeliveries * 10) / 10,
      visit_rating: visitRating,
      delivery_rating: deliveryRating,
      total_visits: totalVisits,
      completed_visits: completedVisits,
      total_deliveries: totalDeliveries,
      completed_deliveries: completedDeliveries,
      visit_success_rate: Math.round(visitSuccessRate * 10) / 10,
      delivery_success_rate: Math.round(deliverySuccessRate * 10) / 10,
      performance_period: `${periodDays} days`
    };

    console.log('✅ Successfully calculated performance for:', representative.name);
    return { data: performance, error: null };

  } catch (error) {
    console.error('❌ Exception in getRepresentativePerformance:', error);
    return { data: null, error: 'Failed to calculate performance' };
  }
}

/**
 * Get performance data for all representatives
 */
export async function getAllRepresentativesPerformance(
  periodDays: number = 30
): Promise<{ data: RepresentativePerformance[]; error: string | null }> {
  try {
    console.log('🔍 Fetching performance data for all representatives');

    // Get all representatives
    const { data: representatives, error: repsError } = await supabase
      .from('representatives')
      .select('id, name, phone')
      .in('status', ['active', 'on-route']);

    if (repsError) {
      console.error('❌ Error fetching representatives:', repsError);
      return { data: [], error: 'Failed to fetch representatives' };
    }

    if (!representatives || representatives.length === 0) {
      console.log('⚠️ No representatives found');
      return { data: [], error: null };
    }

    // Calculate performance for each representative
    const performances: RepresentativePerformance[] = [];
    
    for (const rep of representatives) {
      const { data: performance, error } = await getRepresentativePerformance(rep.id, periodDays);
      if (performance && !error) {
        performances.push(performance);
      }
    }

    console.log(`✅ Successfully calculated performance for ${performances.length} representatives`);
    return { data: performances, error: null };

  } catch (error) {
    console.error('❌ Exception in getAllRepresentativesPerformance:', error);
    return { data: [], error: 'Failed to calculate performance data' };
  }
}

/**
 * Get performance statistics summary
 */
export async function getPerformanceStats(
  periodDays: number = 30
): Promise<{ data: PerformanceStats | null; error: string | null }> {
  try {
    console.log('🔍 Calculating performance statistics');

    const { data: performances, error } = await getAllRepresentativesPerformance(periodDays);
    
    if (error || !performances || performances.length === 0) {
      return { data: null, error: error || 'No performance data available' };
    }

    const totalRepresentatives = performances.length;
    const averageVisitRating = performances.reduce((sum, p) => sum + p.visit_rating, 0) / totalRepresentatives;
    const averageDeliveryRating = performances.reduce((sum, p) => sum + p.delivery_rating, 0) / totalRepresentatives;
    
    // Find top performer (highest combined rating)
    const topPerformer = performances.reduce((top, current) => {
      const currentCombined = (current.visit_rating + current.delivery_rating) / 2;
      const topCombined = (top.visit_rating + top.delivery_rating) / 2;
      return currentCombined > topCombined ? current : top;
    });

    const totalVisits = performances.reduce((sum, p) => sum + p.total_visits, 0);
    const totalDeliveries = performances.reduce((sum, p) => sum + p.total_deliveries, 0);

    const stats: PerformanceStats = {
      total_representatives: totalRepresentatives,
      average_visit_rating: Math.round(averageVisitRating * 10) / 10,
      average_delivery_rating: Math.round(averageDeliveryRating * 10) / 10,
      top_performer: topPerformer.representative_name,
      total_visits: totalVisits,
      total_deliveries: totalDeliveries
    };

    console.log('✅ Successfully calculated performance statistics');
    return { data: stats, error: null };

  } catch (error) {
    console.error('❌ Exception in getPerformanceStats:', error);
    return { data: null, error: 'Failed to calculate performance statistics' };
  }
}

/**
 * Export performance data to Excel format
 */
export function exportPerformanceToExcel(performances: RepresentativePerformance[]): void {
  const exportData = performances.map(perf => ({
    'Representative Name': perf.representative_name,
    'Representative ID': perf.representative_id,
    'Representative Phone': perf.representative_phone,
    'Average Visits per Day': perf.average_visits,
    'Average Order Deliveries per Day': perf.average_order_deliveries,
    'Visit Rating (1-5)': perf.visit_rating,
    'Delivery Rating (1-5)': perf.delivery_rating,
    'Total Visits': perf.total_visits,
    'Completed Visits': perf.completed_visits,
    'Visit Success Rate (%)': perf.visit_success_rate,
    'Total Deliveries': perf.total_deliveries,
    'Completed Deliveries': perf.completed_deliveries,
    'Delivery Success Rate (%)': perf.delivery_success_rate,
    'Performance Period': perf.performance_period
  }));

  // This would typically use a library like xlsx to create and download the file
  console.log('📊 Performance data ready for export:', exportData);
  return exportData;
}
