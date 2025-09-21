'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Filter, Calendar, TrendingUp, AlertTriangle, Package, DollarSign, BarChart3, Eye, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { 
  generateReport,
  getWarehouses,
  getProducts
} from '@/lib/warehouse';
import type { 
  Warehouse, 
  Product,
  ReportData
} from '@/types/warehouse';

const REPORT_TYPES = [
  { id: 'COST_SALES', name: 'Cost & Sales Price Report', nameAr: 'تقرير التكلفة وسعر البيع', icon: DollarSign },
  { id: 'CONSIGNMENT', name: 'Consignment Stock Report', nameAr: 'تقرير مخزون الوكالة', icon: Package },
  { id: 'DAMAGED', name: 'Damaged Goods Report', nameAr: 'تقرير البضائع التالفة', icon: AlertTriangle },
  { id: 'EXPIRY', name: 'Expiry Report', nameAr: 'تقرير انتهاء الصلاحية', icon: Calendar },
  { id: 'SERIAL_TRACKING', name: 'Serial Number Tracking', nameAr: 'تتبع الأرقام التسلسلية', icon: BarChart3 },
  { id: 'PRODUCT_CARD', name: 'Product Card', nameAr: 'بطاقة المنتج', icon: FileText },
  { id: 'MONITORING_CARD', name: 'Product Monitoring Card', nameAr: 'بطاقة مراقبة المنتج', icon: Eye },
  { id: 'AGING', name: 'Aging Report', nameAr: 'تقرير التقادم', icon: TrendingUp },
  { id: 'STOCK_ANALYSIS', name: 'Stock Analysis', nameAr: 'تحليل المخزون', icon: BarChart3 },
  { id: 'VALUATION', name: 'Valuation Report', nameAr: 'تقرير التقييم', icon: DollarSign },
  { id: 'ISSUED_ITEMS', name: 'Issued Items Report', nameAr: 'تقرير العناصر المصروفة', icon: Package },
  { id: 'CUSTOM', name: 'Custom Report', nameAr: 'تقرير مخصص', icon: Settings }
];

export function ReportsEngine() {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('predefined');
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [warehousesData, productsData] = await Promise.all([
        getWarehouses(),
        getProducts()
      ]);
      setWarehouses(warehousesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) return;

    try {
      setLoading(true);
      const data = await generateReport(selectedReport, filters);
      setReportData(data);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = (format: 'pdf' | 'excel') => {
    if (!reportData) return;

    if (format === 'excel') {
      // Create Excel export logic here
      const csvContent = [
        reportData.headers.join(','),
        ...reportData.rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // PDF export logic would go here
      console.log('PDF export not implemented yet');
    }
  };

  const getReportIcon = (reportId: string) => {
    const report = REPORT_TYPES.find(r => r.id === reportId);
    return report ? report.icon : FileText;
  };

  const getReportName = (reportId: string) => {
    const report = REPORT_TYPES.find(r => r.id === reportId);
    return isRTL ? report?.nameAr : report?.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isRTL ? 'محرك التقارير' : 'Reports Engine'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? 'إنشاء وتصدير تقارير شاملة للمستودعات' : 'Generate and export comprehensive warehouse reports'}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              {isRTL ? 'إنشاء تقرير' : 'Generate Report'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إنشاء تقرير جديد' : 'Generate New Report'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'اختر نوع التقرير وحدد المعايير' : 'Select report type and specify criteria'}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="predefined">
                  {isRTL ? 'تقارير محددة مسبقاً' : 'Predefined Reports'}
                </TabsTrigger>
                <TabsTrigger value="custom">
                  {isRTL ? 'تقارير مخصصة' : 'Custom Reports'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="predefined" className="space-y-4">
                <div>
                  <Label htmlFor="report_type">{isRTL ? 'نوع التقرير' : 'Report Type'}</Label>
                  <Select
                    value={selectedReport}
                    onValueChange={setSelectedReport}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? 'اختر نوع التقرير' : 'Select report type'} />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map((report) => {
                        const IconComponent = report.icon;
                        return (
                          <SelectItem key={report.id} value={report.id}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              {isRTL ? report.nameAr : report.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedReport && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="warehouse">{isRTL ? 'المستودع' : 'Warehouse'}</Label>
                        <Select
                          value={filters.warehouse_id || ''}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, warehouse_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={isRTL ? 'جميع المستودعات' : 'All Warehouses'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">{isRTL ? 'جميع المستودعات' : 'All Warehouses'}</SelectItem>
                            {warehouses.map((warehouse) => (
                              <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                {isRTL ? warehouse.warehouse_name_ar : warehouse.warehouse_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="date_range">{isRTL ? 'نطاق التاريخ' : 'Date Range'}</Label>
                        <Select
                          value={filters.date_range || ''}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, date_range: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={isRTL ? 'اختر النطاق' : 'Select range'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">{isRTL ? 'اليوم' : 'Today'}</SelectItem>
                            <SelectItem value="week">{isRTL ? 'هذا الأسبوع' : 'This Week'}</SelectItem>
                            <SelectItem value="month">{isRTL ? 'هذا الشهر' : 'This Month'}</SelectItem>
                            <SelectItem value="quarter">{isRTL ? 'هذا الربع' : 'This Quarter'}</SelectItem>
                            <SelectItem value="year">{isRTL ? 'هذا العام' : 'This Year'}</SelectItem>
                            <SelectItem value="custom">{isRTL ? 'مخصص' : 'Custom'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {filters.date_range === 'custom' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start_date">{isRTL ? 'تاريخ البداية' : 'Start Date'}</Label>
                          <Input
                            id="start_date"
                            type="date"
                            value={filters.start_date || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end_date">{isRTL ? 'تاريخ النهاية' : 'End Date'}</Label>
                          <Input
                            id="end_date"
                            type="date"
                            value={filters.end_date || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isRTL ? 'محرر التقارير المخصصة قيد التطوير' : 'Custom report designer is under development'}</p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={handleGenerateReport}
                disabled={!selectedReport || loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isRTL ? 'جاري الإنشاء...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    {isRTL ? 'إنشاء التقرير' : 'Generate Report'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Report Types Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">
                      {isRTL ? report.nameAr : report.name}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedReport(report.id);
                    setDialogOpen(true);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isRTL ? 'إنشاء' : 'Generate'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Generated Report */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const IconComponent = getReportIcon(selectedReport);
                    return <IconComponent className="h-5 w-5" />;
                  })()}
                  {getReportName(selectedReport)}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تم إنشاء التقرير في' : 'Generated on'} {new Date(reportData.generated_at).toLocaleString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportReport('excel')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isRTL ? 'تصدير Excel' : 'Export Excel'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportReport('pdf')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isRTL ? 'تصدير PDF' : 'Export PDF'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {reportData.headers.map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
