'use client';

import React, { useState, useEffect } from 'react';
import { ScrollableDialog } from '@/components/ui/scrollable-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  FileText,
  TrendingUp,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useCurrency } from '@/contexts/currency-context';
import { getRepresentativeVisits, calculateVisitStats, type Visit, type VisitStats } from '@/lib/visits';
import * as XLSX from 'xlsx';

interface RepresentativeVisitReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  representative: any;
}


export function RepresentativeVisitReportModal({ 
  isOpen, 
  onClose, 
  representative 
}: RepresentativeVisitReportModalProps) {
  const { t, isRTL, language } = useLanguage();
  const { formatCurrency } = useCurrency();
  
  // Translation functions
  const translate = (key: string) => {
    const translations = {
      en: {
        'visit_report': 'Visit Report',
        'comprehensive_visit_tracking': 'Comprehensive visit tracking and performance report for',
        'representative_info': 'Representative Information',
        'total_visits': 'Total Visits',
        'completed': 'Completed',
        'success_rate': 'Success Rate',
        'avg_duration': 'Avg Duration',
        'visit_details': 'Visit Details',
        'client_name': 'Client Name',
        'client_location': 'Client Location',
        'client_phone': 'Client Phone',
        'visit_type': 'Visit Type',
        'scheduled_time': 'Scheduled Time',
        'actual_time': 'Actual Time',
        'status': 'Status',
        'success': 'Success',
        'export_to_excel': 'Export to Excel',
        'search_visits': 'Search visits...',
        'all_status': 'All Status',
        'all_time': 'All Time',
        'today': 'Today',
        'this_week': 'This Week',
        'this_month': 'This Month',
        'loading_visit_data': 'Loading visit data...',
        'no_visits_found': 'No visits found',
        'no_visits_recorded': 'No visits have been recorded for this representative',
        'try_adjusting_filters': 'Try adjusting your search or filter criteria',
        'completed_status': 'Completed',
        'cancelled_status': 'Cancelled',
        'no_show_status': 'No Show',
        'in_progress_status': 'In Progress',
        'scheduled_status': 'Scheduled',
        'yes': 'Yes',
        'no': 'No',
        'n_a': 'N/A'
      },
      ar: {
        'visit_report': 'تقرير الزيارات',
        'comprehensive_visit_tracking': 'تقرير شامل لتتبع الزيارات والأداء لـ',
        'representative_info': 'معلومات المندوب',
        'total_visits': 'إجمالي الزيارات',
        'completed': 'مكتملة',
        'success_rate': 'معدل النجاح',
        'avg_duration': 'متوسط المدة',
        'visit_details': 'تفاصيل الزيارات',
        'client_name': 'اسم العميل',
        'client_location': 'موقع العميل',
        'client_phone': 'هاتف العميل',
        'visit_type': 'نوع الزيارة',
        'scheduled_time': 'الوقت المجدول',
        'actual_time': 'الوقت الفعلي',
        'status': 'الحالة',
        'success': 'النجاح',
        'export_to_excel': 'تصدير إلى Excel',
        'search_visits': 'البحث في الزيارات...',
        'all_status': 'جميع الحالات',
        'all_time': 'كل الوقت',
        'today': 'اليوم',
        'this_week': 'هذا الأسبوع',
        'this_month': 'هذا الشهر',
        'loading_visit_data': 'جاري تحميل بيانات الزيارات...',
        'no_visits_found': 'لم يتم العثور على زيارات',
        'no_visits_recorded': 'لم يتم تسجيل أي زيارات لهذا المندوب',
        'try_adjusting_filters': 'حاول تعديل معايير البحث أو التصفية',
        'completed_status': 'مكتملة',
        'cancelled_status': 'ملغية',
        'no_show_status': 'لم يحضر',
        'in_progress_status': 'قيد التنفيذ',
        'scheduled_status': 'مجدولة',
        'yes': 'نعم',
        'no': 'لا',
        'n_a': 'غير متوفر'
      }
    };
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };
  
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<VisitStats>({
    totalVisits: 0,
    completedVisits: 0,
    cancelledVisits: 0,
    noShowVisits: 0,
    successRate: 0,
    averageDuration: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (isOpen && representative) {
      fetchVisitData();
    }
  }, [isOpen, representative]);

  const fetchVisitData = async () => {
    if (!representative) return;
    
    setLoading(true);
    try {
      const { data: visitData, error } = await getRepresentativeVisits(representative.id);
      
      if (error) {
        console.error('Error fetching visit data:', error);
        setVisits([]);
        setStats({
          totalVisits: 0,
          completedVisits: 0,
          cancelledVisits: 0,
          noShowVisits: 0,
          successRate: 0,
          averageDuration: 0
        });
      } else {
        setVisits(visitData);
        const calculatedStats = calculateVisitStats(visitData);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Error fetching visit data:', error);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };


  const filteredVisits = visits.filter(visit => {
    const matchesSearch = 
      visit.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.customer_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visit.customer_phone && visit.customer_phone.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || visit.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const visitDate = new Date(visit.created_at);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          return visitDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return visitDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return visitDate >= monthAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      no_show: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      scheduled: { color: 'bg-gray-100 text-gray-800', icon: Calendar }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

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
    const exportData = filteredVisits.map(visit => ({
      [language === 'ar' ? 'اسم المندوب' : 'Representative Name']: representative.name,
      [language === 'ar' ? 'رقم المندوب' : 'Representative ID']: representative.id,
      [language === 'ar' ? 'اسم العميل' : 'Client Name']: visit.customer_name,
      [language === 'ar' ? 'موقع العميل' : 'Client Location']: visit.customer_address,
      [language === 'ar' ? 'رقم هاتف العميل' : 'Client Phone Number']: visit.customer_phone || translate('n_a'),
      [language === 'ar' ? 'نوع الزيارة' : 'Visit Type']: visit.visit_type,
      [language === 'ar' ? 'البداية المجدولة' : 'Scheduled Start']: formatDate(visit.scheduled_start_time),
      [language === 'ar' ? 'النهاية المجدولة' : 'Scheduled End']: formatDate(visit.scheduled_end_time),
      [language === 'ar' ? 'البداية الفعلية' : 'Actual Start']: visit.actual_start_time ? formatDate(visit.actual_start_time) : translate('n_a'),
      [language === 'ar' ? 'النهاية الفعلية' : 'Actual End']: visit.actual_end_time ? formatDate(visit.actual_end_time) : translate('n_a'),
      [language === 'ar' ? 'الحالة' : 'Status']: visit.status,
      [language === 'ar' ? 'النجاح' : 'Success']: visit.status === 'completed' ? translate('yes') : translate('no'),
      [language === 'ar' ? 'ملاحظات' : 'Notes']: visit.notes || translate('n_a'),
      [language === 'ar' ? 'تاريخ الإنشاء' : 'Created At']: formatDate(visit.created_at)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Visit Report');
    
    const fileName = `${representative.name}_Visit_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
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
      title={`${translate('visit_report')} - ${representative.name}`}
      description={`${translate('comprehensive_visit_tracking')} ${representative.name}`}
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
                  <p className="text-sm text-gray-600">{translate('representative_info')} - ID: {representative.id}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{representative.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{representative.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{representative.address || 'N/A'}</span>
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
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-sm text-gray-600">{translate('total_visits')}</p>
                    <p className="text-2xl font-bold">{stats.totalVisits}</p>
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
                    <p className="text-sm text-gray-600">{translate('completed')}</p>
                    <p className="text-2xl font-bold">{stats.completedVisits}</p>
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
                    <p className="text-sm text-gray-600">{translate('avg_duration')}</p>
                    <p className="text-2xl font-bold">{stats.averageDuration.toFixed(0)}m</p>
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
                placeholder={translate('search_visits')}
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
              <option value="no_show">{translate('no_show_status')}</option>
              <option value="in_progress">{translate('in_progress_status')}</option>
              <option value="scheduled">{translate('scheduled_status')}</option>
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

          {/* Visits Table */}
          <Card>
            <CardHeader>
              <CardTitle className={isRTL ? 'text-right' : 'text-left'}>{translate('visit_details')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">{translate('loading_visit_data')}</p>
                </div>
              ) : filteredVisits.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{translate('no_visits_found')}</h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                      ? translate('try_adjusting_filters')
                      : translate('no_visits_recorded')
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
                        <TableHead className={isRTL ? 'text-right' : 'text-left'}>{translate('visit_type')}</TableHead>
                        <TableHead className={isRTL ? 'text-right' : 'text-left'}>{translate('scheduled_time')}</TableHead>
                        <TableHead className={isRTL ? 'text-right' : 'text-left'}>{translate('actual_time')}</TableHead>
                        <TableHead className={isRTL ? 'text-right' : 'text-left'}>{translate('status')}</TableHead>
                        <TableHead className={isRTL ? 'text-right' : 'text-left'}>{translate('success')}</TableHead>
                        <TableHead className={isRTL ? 'text-right' : 'text-left'}>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{visit.customer_name}</TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{visit.customer_address}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{visit.customer_phone || translate('n_a')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{visit.visit_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                              <div>{formatDate(visit.scheduled_start_time)}</div>
                              <div className="text-gray-500">{isRTL ? 'إلى' : 'to'} {formatDate(visit.scheduled_end_time)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {visit.actual_start_time && visit.actual_end_time ? (
                              <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                <div>{formatDate(visit.actual_start_time)}</div>
                                <div className="text-gray-500">{isRTL ? 'إلى' : 'to'} {formatDate(visit.actual_end_time)}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">{translate('n_a')}</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(visit.status)}</TableCell>
                          <TableCell>
                            {visit.status === 'completed' ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                {translate('yes')}
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <XCircle className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                {translate('no')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                              {visit.notes || (language === 'ar' ? 'لا توجد ملاحظات' : 'No notes')}
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
