'use client';

import React, { useState, useEffect } from 'react';
import { ScrollableDialog } from '@/components/ui/scrollable-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Phone, 
  TrendingUp,
  Star,
  BarChart3,
  Download,
  Calendar,
  Target,
  Award,
  Activity,
  Package,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useCurrency } from '@/contexts/currency-context';
import { getRepresentativePerformance, type RepresentativePerformance } from '@/lib/performance';
import * as XLSX from 'xlsx';

interface RepresentativePerformanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  representative: any;
}

export function RepresentativePerformanceReportModal({ 
  isOpen, 
  onClose, 
  representative 
}: RepresentativePerformanceReportModalProps) {
  const { t, isRTL, language } = useLanguage();
  const { formatCurrency } = useCurrency();
  
  // Translation functions
  const translate = (key: string) => {
    const translations = {
      en: {
        'performance_report': 'Performance Report',
        'comprehensive_performance_analysis': 'Comprehensive performance analysis and metrics for',
        'representative_info': 'Representative Information',
        'average_visits': 'Average Visits',
        'average_deliveries': 'Average Deliveries',
        'visit_rating': 'Visit Rating',
        'delivery_rating': 'Delivery Rating',
        'per_day': 'per day',
        'excellent': 'Excellent',
        'very_good': 'Very Good',
        'good': 'Good',
        'average': 'Average',
        'below_average': 'Below Average',
        'poor': 'Poor',
        'visit_performance': 'Visit Performance',
        'delivery_performance': 'Delivery Performance',
        'total_visits': 'Total Visits',
        'completed_visits': 'Completed Visits',
        'success_rate': 'Success Rate',
        'avg_per_day': 'Average per Day',
        'rating': 'Rating',
        'performance_summary': 'Performance Summary',
        'key_metrics': 'Key Metrics',
        'overall_performance': 'Overall Performance',
        'representative_name': 'Representative Name',
        'representative_id': 'Representative ID',
        'phone_number': 'Phone Number',
        'performance_period': 'Performance Period',
        'combined_rating': 'Combined Rating',
        'total_activities': 'Total Activities',
        'completed_activities': 'Completed Activities',
        'overall_success_rate': 'Overall Success Rate',
        'export_to_excel': 'Export to Excel',
        'last_7_days': 'Last 7 days',
        'last_30_days': 'Last 30 days',
        'last_90_days': 'Last 90 days',
        'last_year': 'Last year',
        'loading_performance_data': 'Loading performance data...',
        'no_performance_data': 'No Performance Data',
        'no_performance_data_available': 'No performance data available for this representative in the selected period.',
        'total_deliveries': 'Total Deliveries',
        'completed_deliveries': 'Completed Deliveries'
      },
      ar: {
        'performance_report': 'تقرير الأداء',
        'comprehensive_performance_analysis': 'تحليل شامل للأداء والمقاييس لـ',
        'representative_info': 'معلومات المندوب',
        'average_visits': 'متوسط الزيارات',
        'average_deliveries': 'متوسط التسليمات',
        'visit_rating': 'تقييم الزيارات',
        'delivery_rating': 'تقييم التسليمات',
        'per_day': 'في اليوم',
        'excellent': 'ممتاز',
        'very_good': 'جيد جداً',
        'good': 'جيد',
        'average': 'متوسط',
        'below_average': 'أقل من المتوسط',
        'poor': 'ضعيف',
        'visit_performance': 'أداء الزيارات',
        'delivery_performance': 'أداء التسليمات',
        'total_visits': 'إجمالي الزيارات',
        'completed_visits': 'الزيارات المكتملة',
        'success_rate': 'معدل النجاح',
        'avg_per_day': 'متوسط في اليوم',
        'rating': 'التقييم',
        'performance_summary': 'ملخص الأداء',
        'key_metrics': 'المقاييس الرئيسية',
        'overall_performance': 'الأداء العام',
        'representative_name': 'اسم المندوب',
        'representative_id': 'رقم المندوب',
        'phone_number': 'رقم الهاتف',
        'performance_period': 'فترة الأداء',
        'combined_rating': 'التقييم المجمع',
        'total_activities': 'إجمالي الأنشطة',
        'completed_activities': 'الأنشطة المكتملة',
        'overall_success_rate': 'معدل النجاح العام',
        'export_to_excel': 'تصدير إلى Excel',
        'last_7_days': 'آخر 7 أيام',
        'last_30_days': 'آخر 30 يوم',
        'last_90_days': 'آخر 90 يوم',
        'last_year': 'العام الماضي',
        'loading_performance_data': 'جاري تحميل بيانات الأداء...',
        'no_performance_data': 'لا توجد بيانات أداء',
        'no_performance_data_available': 'لا توجد بيانات أداء متاحة لهذا المندوب في الفترة المحددة.',
        'total_deliveries': 'إجمالي التسليمات',
        'completed_deliveries': 'التسليمات المكتملة'
      }
    };
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };
  
  const [performance, setPerformance] = useState<RepresentativePerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const [periodDays, setPeriodDays] = useState(30);

  useEffect(() => {
    if (isOpen && representative) {
      fetchPerformanceData();
    }
  }, [isOpen, representative, periodDays]);

  const fetchPerformanceData = async () => {
    if (!representative) return;
    
    setLoading(true);
    try {
      const { data: performanceData, error } = await getRepresentativePerformance(representative.id, periodDays);
      
      if (error) {
        console.error('Error fetching performance data:', error);
        setPerformance(null);
      } else {
        setPerformance(performanceData);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setPerformance(null);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-100';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-100';
    if (rating >= 2) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return translate('excellent');
    if (rating >= 4) return translate('very_good');
    if (rating >= 3.5) return translate('good');
    if (rating >= 3) return translate('average');
    if (rating >= 2.5) return translate('below_average');
    return translate('poor');
  };

  const exportToExcel = () => {
    if (!performance) return;

    const exportData = [{
      [language === 'ar' ? 'اسم المندوب' : 'Representative Name']: performance.representative_name,
      [language === 'ar' ? 'رقم المندوب' : 'Representative ID']: performance.representative_id,
      [language === 'ar' ? 'رقم هاتف المندوب' : 'Representative Phone Number']: performance.representative_phone,
      [language === 'ar' ? 'متوسط الزيارات في اليوم' : 'Average Visits per Day']: performance.average_visits,
      [language === 'ar' ? 'متوسط تسليمات الطلبات في اليوم' : 'Average Order Deliveries per Day']: performance.average_order_deliveries,
      [language === 'ar' ? 'تقييم المندوب بناءً على الزيارات' : 'Representative Rating Based on Visits']: performance.visit_rating,
      [language === 'ar' ? 'تقييم المندوب بناءً على تسليمات الطلبات' : 'Representative Rating Based on Order Deliveries']: performance.delivery_rating,
      [language === 'ar' ? 'إجمالي الزيارات' : 'Total Visits']: performance.total_visits,
      [language === 'ar' ? 'الزيارات المكتملة' : 'Completed Visits']: performance.completed_visits,
      [language === 'ar' ? 'معدل نجاح الزيارات (%)' : 'Visit Success Rate (%)']: performance.visit_success_rate,
      [language === 'ar' ? 'إجمالي التسليمات' : 'Total Deliveries']: performance.total_deliveries,
      [language === 'ar' ? 'التسليمات المكتملة' : 'Completed Deliveries']: performance.completed_deliveries,
      [language === 'ar' ? 'معدل نجاح التسليمات (%)' : 'Delivery Success Rate (%)']: performance.delivery_success_rate,
      [language === 'ar' ? 'فترة الأداء' : 'Performance Period']: performance.performance_period
    }];

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Performance Report');
    
    const fileName = `${representative.name}_Performance_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!representative) return null;

  const footer = (
    <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className="flex gap-2">
        <select
          value={periodDays}
          onChange={(e) => setPeriodDays(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>{translate('last_7_days')}</option>
          <option value={30}>{translate('last_30_days')}</option>
          <option value={90}>{translate('last_90_days')}</option>
          <option value={365}>{translate('last_year')}</option>
        </select>
      </div>
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
      title={`${translate('performance_report')} - ${representative.name}`}
      description={`${translate('comprehensive_performance_analysis')} ${representative.name}`}
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
              <AvatarImage src={representative.avatar_url} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {representative.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h2 className="text-xl font-semibold">{representative.name}</h2>
              <p className="text-sm text-gray-600">{translate('performance_report')}</p>
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
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{translate('performance_period')}: {periodDays} {language === 'ar' ? 'أيام' : 'days'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{translate('loading_performance_data')}</p>
        </div>
      ) : !performance ? (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{translate('no_performance_data')}</h3>
          <p className="text-gray-500">
            {translate('no_performance_data_available')}
          </p>
        </div>
      ) : (
        <>
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-sm font-medium text-gray-600">{translate('average_visits')}</p>
                    <p className="text-2xl font-bold text-blue-600">{performance.average_visits}</p>
                    <p className="text-xs text-gray-500">{translate('per_day')}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-sm font-medium text-gray-600">{translate('average_deliveries')}</p>
                    <p className="text-2xl font-bold text-green-600">{performance.average_order_deliveries}</p>
                    <p className="text-xs text-gray-500">{translate('per_day')}</p>
                  </div>
                  <Package className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-sm font-medium text-gray-600">{translate('visit_rating')}</p>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <p className="text-2xl font-bold text-purple-600">{performance.visit_rating}</p>
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                    <p className="text-xs text-gray-500">{getRatingLabel(performance.visit_rating)}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-sm font-medium text-gray-600">{translate('delivery_rating')}</p>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <p className="text-2xl font-bold text-orange-600">{performance.delivery_rating}</p>
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                    <p className="text-xs text-gray-500">{getRatingLabel(performance.delivery_rating)}</p>
                  </div>
                  <Award className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visit Performance */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Activity className="h-5 w-5 text-blue-500" />
                  {translate('visit_performance')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('total_visits')}</span>
                  <Badge variant="outline">{performance.total_visits}</Badge>
                </div>
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('completed_visits')}</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {performance.completed_visits}
                  </Badge>
                </div>
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('success_rate')}</span>
                  <Badge variant="outline" className={getRatingColor(performance.visit_rating)}>
                    {performance.visit_success_rate}%
                  </Badge>
                </div>
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('avg_per_day')}</span>
                  <Badge variant="outline">{performance.average_visits}</Badge>
                </div>
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('rating')}</span>
                  <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= performance.visit_rating
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className={`text-sm font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>{performance.visit_rating}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Performance */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Package className="h-5 w-5 text-green-500" />
                  {translate('delivery_performance')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('total_deliveries')}</span>
                  <Badge variant="outline">{performance.total_deliveries}</Badge>
                </div>
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('completed_deliveries')}</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {performance.completed_deliveries}
                  </Badge>
                </div>
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('success_rate')}</span>
                  <Badge variant="outline" className={getRatingColor(performance.delivery_rating)}>
                    {performance.delivery_success_rate}%
                  </Badge>
                </div>
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('avg_per_day')}</span>
                  <Badge variant="outline">{performance.average_order_deliveries}</Badge>
                </div>
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('rating')}</span>
                  <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= performance.delivery_rating
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className={`text-sm font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>{performance.delivery_rating}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <TrendingUp className="h-5 w-5 text-blue-500" />
                {translate('performance_summary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-medium text-gray-900 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('key_metrics')}</h4>
                  <div className="space-y-2">
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('representative_name')}:</span>
                      <span className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{performance.representative_name}</span>
                    </div>
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('representative_id')}:</span>
                      <span className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{performance.representative_id}</span>
                    </div>
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('phone_number')}:</span>
                      <span className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{performance.representative_phone}</span>
                    </div>
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('performance_period')}:</span>
                      <span className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{performance.performance_period}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium text-gray-900 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('overall_performance')}</h4>
                  <div className="space-y-2">
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('combined_rating')}:</span>
                      <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm font-medium">
                          {((performance.visit_rating + performance.delivery_rating) / 2).toFixed(1)}/5
                        </span>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                    </div>
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('total_activities')}:</span>
                      <span className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                        {performance.total_visits + performance.total_deliveries}
                      </span>
                    </div>
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('completed_activities')}:</span>
                      <span className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                        {performance.completed_visits + performance.completed_deliveries}
                      </span>
                    </div>
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{translate('overall_success_rate')}:</span>
                      <span className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                        {(((performance.completed_visits + performance.completed_deliveries) / 
                          (performance.total_visits + performance.total_deliveries)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </ScrollableDialog>
  );
}
