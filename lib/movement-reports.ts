import * as XLSX from 'xlsx';
import { RepresentativeMovement, RepresentativeVisit, MovementReportData } from '@/types/movement-tracking';

export interface ReportFilters {
  representative_id?: string;
  start_date: string;
  end_date: string;
  include_movements?: boolean;
  include_visits?: boolean;
  include_summary?: boolean;
}

export class MovementReportGenerator {
  static async generateExcelReport(
    data: MovementReportData,
    filters: ReportFilters
  ): Promise<Blob> {
    const workbook = XLSX.utils.book_new();
    
    // Summary Sheet
    if (filters.include_summary !== false) {
      const summaryData = [
        ['Representative Name', data.representative_name],
        ['Representative ID', data.representative_id],
        ['Report Period', `${filters.start_date} to ${filters.end_date}`],
        ['Total Movements', data.stats.total_movements],
        ['Total Distance (km)', data.stats.total_distance_km],
        ['Total Duration (hours)', data.stats.total_duration_hours],
        ['Unique Locations', data.stats.unique_locations],
        ['Most Common Activity', data.stats.most_common_activity],
        ['Average Speed (km/h)', data.stats.average_speed_kmh],
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }
    
    // Movements Sheet
    if (filters.include_movements !== false && data.movements.length > 0) {
      const movementsData = data.movements.map(movement => ({
        'Date': new Date(movement.created_at).toLocaleDateString(),
        'Time': new Date(movement.created_at).toLocaleTimeString(),
        'Activity Type': movement.activity_type,
        'Description': movement.description || '',
        'Location': movement.location_name || '',
        'Latitude': movement.latitude,
        'Longitude': movement.longitude,
        'Distance (km)': movement.distance_km || 0,
        'Duration (min)': movement.duration_minutes || 0,
        'Speed (km/h)': movement.speed_kmh || 0,
        'Accuracy (m)': movement.accuracy_meters || 0,
        'Battery Level': movement.battery_level || '',
        'Network Type': movement.network_type || '',
      }));
      
      const movementsSheet = XLSX.utils.json_to_sheet(movementsData);
      XLSX.utils.book_append_sheet(workbook, movementsSheet, 'Movements');
    }
    
    // Visits Sheet
    if (filters.include_visits !== false && data.visits.length > 0) {
      const visitsData = data.visits.map(visit => ({
        'Date': new Date(visit.created_at).toLocaleDateString(),
        'Visit Type': visit.visit_type,
        'Customer Name': visit.customer_name || '',
        'Customer Address': visit.customer_address || '',
        'Customer Phone': visit.customer_phone || '',
        'Purpose': visit.visit_purpose || '',
        'Scheduled Start': visit.scheduled_start_time ? new Date(visit.scheduled_start_time).toLocaleString() : '',
        'Scheduled End': visit.scheduled_end_time ? new Date(visit.scheduled_end_time).toLocaleString() : '',
        'Actual Start': visit.actual_start_time ? new Date(visit.actual_start_time).toLocaleString() : '',
        'Actual End': visit.actual_end_time ? new Date(visit.actual_end_time).toLocaleString() : '',
        'Status': visit.status,
        'Notes': visit.notes || '',
      }));
      
      const visitsSheet = XLSX.utils.json_to_sheet(visitsData);
      XLSX.utils.book_append_sheet(workbook, visitsSheet, 'Visits');
    }
    
    // Daily Summaries Sheet
    if (data.daily_summaries.length > 0) {
      const summariesData = data.daily_summaries.map(summary => ({
        'Date': new Date(summary.date).toLocaleDateString(),
        'Total Distance (km)': summary.total_distance_km,
        'Total Duration (hours)': summary.total_duration_hours,
        'Total Visits': summary.total_visits,
        'Completed Visits': summary.completed_visits,
        'Total Deliveries': summary.total_deliveries,
        'Completed Deliveries': summary.completed_deliveries,
        'Check In': summary.check_in_time ? new Date(summary.check_in_time).toLocaleString() : '',
        'Check Out': summary.check_out_time ? new Date(summary.check_out_time).toLocaleString() : '',
        'Break Duration (min)': summary.break_duration_minutes,
        'Idle Duration (min)': summary.idle_duration_minutes,
        'Fuel Consumed (L)': summary.fuel_consumed_liters || 0,
        'Expenses': summary.expenses || 0,
        'Notes': summary.notes || '',
      }));
      
      const summariesSheet = XLSX.utils.json_to_sheet(summariesData);
      XLSX.utils.book_append_sheet(workbook, summariesSheet, 'Daily Summaries');
    }
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  
  static async generatePDFReport(
    data: MovementReportData,
    filters: ReportFilters
  ): Promise<Blob> {
    // This would require a PDF generation library like jsPDF or Puppeteer
    // For now, we'll return a simple text-based report
    const reportContent = this.generateTextReport(data, filters);
    return new Blob([reportContent], { type: 'text/plain' });
  }
  
  static generateTextReport(
    data: MovementReportData,
    filters: ReportFilters
  ): string {
    let report = '';
    
    report += 'MOVEMENT TRACKING REPORT\n';
    report += '========================\n\n';
    report += `Representative: ${data.representative_name}\n`;
    report += `ID: ${data.representative_id}\n`;
    report += `Report Period: ${filters.start_date} to ${filters.end_date}\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    report += 'SUMMARY STATISTICS\n';
    report += '==================\n';
    report += `Total Movements: ${data.stats.total_movements}\n`;
    report += `Total Distance: ${data.stats.total_distance_km} km\n`;
    report += `Total Duration: ${data.stats.total_duration_hours} hours\n`;
    report += `Unique Locations: ${data.stats.unique_locations}\n`;
    report += `Most Common Activity: ${data.stats.most_common_activity}\n`;
    report += `Average Speed: ${data.stats.average_speed_kmh} km/h\n\n`;
    
    if (data.movements.length > 0) {
      report += 'MOVEMENT HISTORY\n';
      report += '================\n';
      data.movements.forEach((movement, index) => {
        report += `${index + 1}. ${movement.activity_type.toUpperCase()}\n`;
        report += `   Date: ${new Date(movement.created_at).toLocaleString()}\n`;
        report += `   Location: ${movement.location_name || 'Unknown'}\n`;
        report += `   Description: ${movement.description || 'No description'}\n`;
        if (movement.distance_km) {
          report += `   Distance: ${movement.distance_km} km\n`;
        }
        if (movement.duration_minutes) {
          report += `   Duration: ${movement.duration_minutes} minutes\n`;
        }
        report += '\n';
      });
    }
    
    if (data.visits.length > 0) {
      report += 'VISIT HISTORY\n';
      report += '=============\n';
      data.visits.forEach((visit, index) => {
        report += `${index + 1}. ${visit.visit_type.toUpperCase()}\n`;
        report += `   Customer: ${visit.customer_name || 'Unknown'}\n`;
        report += `   Address: ${visit.customer_address || 'Not provided'}\n`;
        report += `   Purpose: ${visit.visit_purpose || 'Not specified'}\n`;
        report += `   Status: ${visit.status}\n`;
        if (visit.actual_start_time && visit.actual_end_time) {
          report += `   Duration: ${new Date(visit.actual_start_time).toLocaleString()} - ${new Date(visit.actual_end_time).toLocaleString()}\n`;
        }
        report += '\n';
      });
    }
    
    return report;
  }
  
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
