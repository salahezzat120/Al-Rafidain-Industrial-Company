"use client";

import React, { useState, useEffect } from 'react';
import { ScrollableDialog } from '@/components/ui/scrollable-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download,
  Search,
  FileText,
  TrendingUp,
  BarChart3,
  Activity,
  Target,
  Award,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useCurrency } from '@/contexts/currency-context';
import { getRepresentativeDeliveries, calculateDeliveryStats, exportDeliveryToExcel, DeliveryReport, DeliveryStats } from '@/lib/delivery-reports';
import * as XLSX from 'xlsx';

interface RepresentativeDeliveryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  representative: any;
}

export function RepresentativeDeliveryReportModal({ 
  isOpen, 
  onClose, 
  representative 
}: RepresentativeDeliveryReportModalProps) {
  const { t, isRTL, language } = useLanguage();
  const { formatCurrency } = useCurrency();
  
  // Translation functions
  const translate = (key: string) => {
    const translations = {
      en: {
        'delivery_report': 'Order Delivery Report',
        'comprehensive_delivery_tracking': 'Comprehensive order delivery tracking and performance report for',
        'representative_info': 'Representative Information',
        'total_deliveries': 'Total Deliveries',
        'successful': 'Successful',
        'success_rate': 'Success Rate',
        'avg_delivery_time': 'Avg Delivery Time',
        'delivery_details': 'Delivery Details',
        'client_name': 'Client Name',
        'client_location': 'Client Location',
        'client_phone': 'Client Phone',
        'delivery_time': 'Delivery Time',
        'status': 'Status',
        'success': 'Success',
        'export_to_excel': 'Export to Excel',
        'search_deliveries': 'Search deliveries...',
        'all_status': 'All Status',
        'all_time': 'All Time',
        'today': 'Today',
        'this_week': 'This Week',
        'this_month': 'This Month',
        'loading_delivery_data': 'Loading delivery data...',
        'no_deliveries_found': 'No deliveries found',
        'no_deliveries_recorded': 'No deliveries have been recorded for this representative',
        'try_adjusting_filters': 'Try adjusting your search or filter criteria',
        'completed_status': 'Completed',
        'cancelled_status': 'Cancelled',
        'in_progress_status': 'In Progress',
        'pending_status': 'Pending',
        'yes': 'Yes',
        'no': 'No',
        'n_a': 'N/A',
        'successfully': 'Successfully',
        'failed': 'Failed',
        'order_value': 'Order Value',
        'notes': 'Notes',
        'no_notes': 'No notes',
        'representative_id': 'Representative ID',
        'phone_number': 'Phone Number',
        'delivery_period': 'Delivery Period',
        'days': 'days',
        'minutes': 'minutes'
      },
      ar: {
        'delivery_report': 'تقرير تسليم الطلبات',
        'comprehensive_delivery_tracking': 'تقرير شامل لتتبع تسليم الطلبات والأداء لـ',
        'representative_info': 'معلومات المندوب',
        'total_deliveries': 'إجمالي التسليمات',
        'successful': 'ناجحة',
        'success_rate': 'معدل النجاح',
        'avg_delivery_time': 'متوسط وقت التسليم',
        'delivery_details': 'تفاصيل التسليمات',
        'client_name': 'اسم العميل',
        'client_location': 'موقع العميل',
        'client_phone': 'هاتف العميل',
        'delivery_time': 'وقت التسليم',
        'status': 'الحالة',
        'success': 'النجاح',
        'export_to_excel': 'تصدير إلى Excel',
        'search_deliveries': 'البحث في التسليمات...',
        'all_status': 'جميع الحالات',
        'all_time': 'كل الوقت',
        'today': 'اليوم',
        'this_week': 'هذا الأسبوع',
        'this_month': 'هذا الشهر',
        'loading_delivery_data': 'جاري تحميل بيانات التسليمات...',
        'no_deliveries_found': 'لم يتم العثور على تسليمات',
        'no_deliveries_recorded': 'لم يتم تسجيل أي تسليمات لهذا المندوب',
        'try_adjusting_filters': 'حاول تعديل معايير البحث أو التصفية',
        'completed_status': 'مكتملة',
        'cancelled_status': 'ملغية',
        'in_progress_status': 'قيد التنفيذ',
        'pending_status': 'معلقة',
        'yes': 'نعم',
        'no': 'لا',
        'n_a': 'غير متوفر',
        'successfully': 'نجح',
        'failed': 'فشل',
        'order_value': 'قيمة الطلب',
        'notes': 'ملاحظات',
        'no_notes': 'لا توجد ملاحظات',
        'representative_id': 'رقم المندوب',
        'phone_number': 'رقم الهاتف',
        'delivery_period': 'فترة التسليم',
        'days': 'أيام',
        'minutes': 'دقائق'
      }
    };
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };
  
  const [deliveries, setDeliveries] = useState<DeliveryReport[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({
    totalDeliveries: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
    successRate: 0,
    totalValue: 0,
    averageDeliveryTime: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [periodDays, setPeriodDays] = useState(30);

  useEffect(() => {
    if (isOpen && representative) {
      fetchDeliveryData();
    }
  }, [isOpen, representative, periodDays]);

  const fetchDeliveryData = async () => {
    if (!representative) return;
    
    setLoading(true);
    try {
      const { data, error } = await getRepresentativeDeliveries(representative.id, periodDays);
      
      if (error) {
        console.error('Error fetching delivery data:', error);
        setDeliveries([]);
        setStats({
          totalDeliveries: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          successRate: 0,
          totalValue: 0,
          averageDeliveryTime: 0
        });
      } else {
        setDeliveries(data);
        setStats(calculateDeliveryStats(data));
      }
    } catch (error) {
      console.error('Exception fetching delivery data:', error);
      setDeliveries([]);
      setStats({
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        successRate: 0,
        totalValue: 0,
        averageDeliveryTime: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customer_phone.includes(searchTerm) ||
      delivery.customer_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    
    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      
      const deliveryDate = new Date(delivery.delivery_time);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          return deliveryDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return deliveryDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return deliveryDate >= monthAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToExcel = () => {
    const exportData = exportDeliveryToExcel(filteredDeliveries, language);

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Delivery Report');
    
    const fileName = `delivery_report_${representative.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  if (!representative) return null;

  const footer = (
    <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-3`}>
      <Button onClick={exportToExcel} className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        {translate('export_to_excel')}
      </Button>
    </div>
  );

  return (
    <ScrollableDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`${translate('delivery_report')} - ${representative.name}`}
      description={`${translate('comprehensive_delivery_tracking')} ${representative.name}`}
      maxWidth="max-w-6xl"
      showScrollButtons={true}
      scrollAmount={300}
      footer={footer}
    >
      {/* Representative Info */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={representative.avatar_url || "/representative-avatar.png"} />
              <AvatarFallback>
                {representative.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h3 className="text-xl font-semibold">{representative.name}</h3>
              <p className="text-sm text-gray-600">{translate('representative_info')} - {translate('representative_id')}: {representative.id}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{translate('representative_id')}: {representative.id}</span>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{representative.phone || 'N/A'}</span>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{translate('delivery_period')}: {periodDays} {translate('days')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm text-gray-600">{translate('total_deliveries')}</p>
                <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm text-gray-600">{translate('successful')}</p>
                <p className="text-2xl font-bold">{stats.successfulDeliveries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm text-gray-600">{translate('success_rate')}</p>
                <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm text-gray-600">{translate('avg_delivery_time')}</p>
                <p className="text-2xl font-bold">{stats.averageDeliveryTime.toFixed(0)}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className={`flex gap-4 items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4`} />
          <input
            type="text"
            placeholder={translate('search_deliveries')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">{translate('all_status')}</option>
          <option value="completed">{translate('completed_status')}</option>
          <option value="cancelled">{translate('cancelled_status')}</option>
          <option value="in_progress">{translate('in_progress_status')}</option>
          <option value="pending">{translate('pending_status')}</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">{translate('all_time')}</option>
          <option value="today">{translate('today')}</option>
          <option value="week">{translate('this_week')}</option>
          <option value="month">{translate('this_month')}</option>
        </select>
      </div>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle className={isRTL ? 'text-right' : 'text-left'}>{translate('delivery_details')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{translate('loading_delivery_data')}</p>
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{translate('no_deliveries_found')}</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? translate('try_adjusting_filters')
                  : translate('no_deliveries_recorded')
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{translate('client_name')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{translate('client_location')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{translate('client_phone')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{translate('delivery_time')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{translate('status')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{translate('success')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{translate('order_value')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{translate('notes')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{delivery.customer_name}</TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{delivery.customer_address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{delivery.customer_phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                          {formatDate(delivery.delivery_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={delivery.status === 'completed' ? 'default' : 'secondary'}
                          className={delivery.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {delivery.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {delivery.delivery_success ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {translate('successfully')}
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {translate('failed')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        {formatCurrency(delivery.total_value, delivery.currency)}
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {delivery.notes || translate('no_notes')}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </ScrollableDialog>
  );
}
