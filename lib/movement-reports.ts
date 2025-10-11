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
    // Generate HTML content for PDF
    const htmlContent = this.generateHTMLReport(data, filters);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please allow popups.');
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
    
    // Return a dummy blob since we're using print functionality
    return new Blob(['PDF generated via print dialog'], { type: 'text/plain' });
  }
  
  static generateHTMLReport(
    data: MovementReportData,
    filters: ReportFilters
  ): string {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatActivityType = (type: string) => {
      const activityTranslations: { [key: string]: string } = {
        'check_in': 'تسجيل دخول',
        'check_out': 'تسجيل خروج',
        'delivery_start': 'بداية التوصيل',
        'delivery_complete': 'اكتمال التوصيل',
        'visit_start': 'بداية الزيارة',
        'visit_end': 'نهاية الزيارة'
      };
      return activityTranslations[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getStatusTranslation = (status: string) => {
      const statusTranslations: { [key: string]: string } = {
        'completed': 'مكتمل',
        'in_progress': 'قيد التنفيذ',
        'scheduled': 'مجدول',
        'cancelled': 'ملغي'
      };
      return statusTranslations[status] || status;
    };

    let html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>تقرير تتبع الحركة - ${data.representative_name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Noto Sans Arabic', Arial, sans-serif;
          margin: 20px;
          color: #333;
          line-height: 1.6;
          direction: rtl;
          text-align: right;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 5px 0;
          color: #666;
          font-size: 16px;
        }
        .summary {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #2563eb;
        }
        .summary h2 {
          color: #2563eb;
          margin-top: 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .stat-item {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }
        .stat-label {
          font-weight: bold;
          color: #4a5568;
          font-size: 14px;
        }
        .stat-value {
          font-size: 24px;
          color: #2563eb;
          margin-top: 5px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #2563eb;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        th, td {
          padding: 12px;
          text-align: right;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          background: #f8fafc;
          font-weight: bold;
          color: #4a5568;
          font-size: 14px;
        }
        td {
          font-size: 13px;
        }
        .activity-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .activity-check-in { background: #dcfce7; color: #166534; }
        .activity-check-out { background: #fee2e2; color: #991b1b; }
        .activity-delivery-start { background: #dbeafe; color: #1e40af; }
        .activity-delivery-complete { background: #dcfce7; color: #166534; }
        .activity-visit-start { background: #e9d5ff; color: #7c3aed; }
        .activity-visit-end { background: #e9d5ff; color: #7c3aed; }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>تقرير تتبع الحركة</h1>
        <p><strong>المندوب:</strong> ${data.representative_name}</p>
        <p><strong>فترة التقرير:</strong> ${filters.start_date} إلى ${filters.end_date}</p>
        <p><strong>تاريخ الإنشاء:</strong> ${new Date().toLocaleString('ar-SA')}</p>
      </div>

      <div class="summary">
        <h2>الإحصائيات الملخصة</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">إجمالي الحركات</div>
            <div class="stat-value">${data.stats.total_movements}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">إجمالي المسافة</div>
            <div class="stat-value">${data.stats.total_distance_km} كم</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">إجمالي المدة</div>
            <div class="stat-value">${data.stats.total_duration_hours} ساعة</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">المواقع الفريدة</div>
            <div class="stat-value">${data.stats.unique_locations}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">النشاط الأكثر شيوعاً</div>
            <div class="stat-value">${formatActivityType(data.stats.most_common_activity)}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">متوسط السرعة</div>
            <div class="stat-value">${data.stats.average_speed_kmh} كم/ساعة</div>
          </div>
        </div>
      </div>
    `;

    // Add movements section
    if (data.movements && data.movements.length > 0) {
      html += `
        <div class="section">
          <h2>تاريخ الحركات</h2>
          <table>
            <thead>
              <tr>
                <th>التاريخ والوقت</th>
                <th>النشاط</th>
                <th>الموقع</th>
                <th>المسافة</th>
                <th>المدة</th>
                <th>الوصف</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      data.movements.forEach(movement => {
        const activityClass = `activity-${movement.activity_type}`;
        html += `
          <tr>
            <td>${formatDate(movement.created_at)}</td>
            <td><span class="activity-badge ${activityClass}">${formatActivityType(movement.activity_type)}</span></td>
            <td>${movement.location_name}</td>
            <td>${movement.distance_km || 0} كم</td>
            <td>${movement.duration_minutes || 0} دقيقة</td>
            <td>${movement.description}</td>
          </tr>
        `;
      });
      
      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    // Add visits section
    if (data.visits && data.visits.length > 0) {
      html += `
        <div class="section">
          <h2>تاريخ الزيارات</h2>
          <table>
            <thead>
              <tr>
                <th>التاريخ والوقت</th>
                <th>العميل</th>
                <th>الغرض</th>
                <th>الحالة</th>
                <th>العنوان</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      data.visits.forEach(visit => {
        html += `
          <tr>
            <td>${formatDate(visit.created_at)}</td>
            <td>${visit.customer_name}</td>
            <td>${visit.visit_purpose}</td>
            <td><span class="activity-badge activity-${visit.status}">${getStatusTranslation(visit.status)}</span></td>
            <td>${visit.customer_address}</td>
          </tr>
        `;
      });
      
      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    html += `
      <div class="footer">
        <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام تتبع الحركة لشركة الرافدين الصناعية.</p>
        <p>للاستفسارات أو الدعم الفني، يرجى التواصل مع مدير النظام.</p>
      </div>
    </body>
    </html>
    `;

    return html;
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
