'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Factory, Truck, ShoppingCart, Package, ArrowRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { 
  getWorkflowEvents, 
  processWorkflowEvent, 
  createSampleWorkflowEvents,
  getWorkflowStats,
  createWorkflowTable,
  createSampleWarehousesAndProducts
} from '@/lib/workflow';

interface WorkflowEvent {
  id: string;
  type: 'PRODUCTION' | 'SALES' | 'DELIVERY' | 'RETURN';
  description: string;
  descriptionAr: string;
  timestamp: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  warehouse_id: number;
  warehouse_name: string;
  warehouse_name_ar: string;
  product_id: number;
  product_name: string;
  product_name_ar: string;
  quantity: number;
  reference_number: string;
}

export function WorkflowIntegration() {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'production' | 'sales' | 'delivery' | 'returns'>('production');
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [tableExists, setTableExists] = useState(true);

  useEffect(() => {
    loadWorkflowEvents();
    loadWorkflowStats();
  }, [activeTab]);

  const loadWorkflowEvents = async () => {
    try {
      setLoading(true);
      
      // Map activeTab to event type
      const eventTypeMap = {
        'production': 'PRODUCTION' as const,
        'sales': 'SALES' as const,
        'delivery': 'DELIVERY' as const,
        'returns': 'RETURN' as const
      };

      const eventType = eventTypeMap[activeTab];
      console.log('Loading workflow events for type:', eventType);
      const data = await getWorkflowEvents(eventType);
      console.log('Received workflow events:', data);

      // Table exists if we got data (even if empty) or no error was thrown
      setTableExists(true);

      // Transform the data to match our interface
      const transformedEvents: WorkflowEvent[] = data.map((event: any) => ({
        id: event.id,
        type: event.event_type,
        description: event.description,
        descriptionAr: event.description_ar,
        timestamp: event.created_at,
        status: event.status,
        warehouse_id: event.warehouse_id,
        warehouse_name: event.warehouse?.warehouse_name || 'Unknown Warehouse',
        warehouse_name_ar: event.warehouse?.warehouse_name_ar || 'مستودع غير معروف',
        product_id: event.product_id,
        product_name: event.product?.product_name || 'Unknown Product',
        product_name_ar: event.product?.product_name_ar || 'منتج غير معروف',
        quantity: event.quantity,
        reference_number: event.reference_number
      }));

      setEvents(transformedEvents);
    } catch (error: any) {
      console.error('Error loading workflow events:', error);
      // Only set tableExists to false if the error indicates table doesn't exist
      if (error?.message?.includes('relation "workflow_events" does not exist')) {
        setTableExists(false);
      } else {
        setTableExists(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflowStats = async () => {
    try {
      const data = await getWorkflowStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading workflow stats:', error);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PRODUCTION': return <Factory className="h-4 w-4" />;
      case 'SALES': return <ShoppingCart className="h-4 w-4" />;
      case 'DELIVERY': return <Truck className="h-4 w-4" />;
      case 'RETURN': return <Package className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />{isRTL ? 'مكتمل' : 'Completed'}</Badge>;
      case 'IN_PROGRESS': return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />{isRTL ? 'قيد التنفيذ' : 'In Progress'}</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />{isRTL ? 'معلق' : 'Pending'}</Badge>;
      case 'FAILED': return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />{isRTL ? 'فشل' : 'Failed'}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getEventTypeName = (type: string) => {
    switch (type) {
      case 'PRODUCTION': return isRTL ? 'إنتاج' : 'Production';
      case 'SALES': return isRTL ? 'مبيعات' : 'Sales';
      case 'DELIVERY': return isRTL ? 'توصيل' : 'Delivery';
      case 'RETURN': return isRTL ? 'إرجاع' : 'Return';
      default: return type;
    }
  };

  const handleProcessEvent = async (eventId: string) => {
    try {
    console.log('Processing event:', eventId);
      await processWorkflowEvent(eventId);
      
      // Refresh the events list
      await loadWorkflowEvents();
      await loadWorkflowStats();
      
      alert(isRTL ? 'تم معالجة الحدث بنجاح' : 'Event processed successfully');
    } catch (error) {
      console.error('Error processing event:', error);
      alert(isRTL ? 'حدث خطأ أثناء معالجة الحدث' : 'Error processing event');
    }
  };

  const handleCreateSampleData = async () => {
    try {
      await createSampleWorkflowEvents();
      await loadWorkflowEvents();
      await loadWorkflowStats();
      alert(isRTL ? 'تم إنشاء بيانات تجريبية بنجاح' : 'Sample data created successfully');
    } catch (error: any) {
      console.error('Error creating sample data:', error);
      const errorMessage = error?.message || 'Unknown error';
      
      if (errorMessage.includes('No products found')) {
        alert(isRTL ? 'لا توجد منتجات. يرجى إنشاء بعض المنتجات أولاً.' : 'No products found. Please create some products first.');
      } else if (errorMessage.includes('No warehouses found')) {
        alert(isRTL ? 'لا توجد مستودعات. يرجى إنشاء بعض المستودعات أولاً.' : 'No warehouses found. Please create some warehouses first.');
      } else {
        alert(isRTL ? `حدث خطأ أثناء إنشاء البيانات التجريبية: ${errorMessage}` : `Error creating sample data: ${errorMessage}`);
      }
    }
  };

  const handleSetupWorkflow = async () => {
    try {
      const success = await createWorkflowTable();
      if (success) {
        setTableExists(true);
        await loadWorkflowEvents();
        await loadWorkflowStats();
        alert(isRTL ? 'تم إنشاء جدول سير العمل بنجاح' : 'Workflow table created successfully');
      } else {
        alert(isRTL ? 'فشل في إنشاء جدول سير العمل' : 'Failed to create workflow table');
      }
    } catch (error) {
      console.error('Error setting up workflow:', error);
      alert(isRTL ? 'حدث خطأ أثناء إعداد سير العمل' : 'Error setting up workflow');
    }
  };

  const handleCreateWarehousesAndProducts = async () => {
    try {
      await createSampleWarehousesAndProducts();
      alert(isRTL ? 'تم إنشاء المستودعات والمنتجات بنجاح' : 'Warehouses and products created successfully');
    } catch (error: any) {
      console.error('Error creating warehouses and products:', error);
      const errorMessage = error?.message || 'Unknown error';
      alert(isRTL ? `حدث خطأ أثناء إنشاء المستودعات والمنتجات: ${errorMessage}` : `Error creating warehouses and products: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!tableExists) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isRTL ? 'تكامل سير العمل' : 'Workflow Integration'}
            </h2>
            <p className="text-muted-foreground">
              {isRTL ? 'ربط المستودعات مع خط الإنتاج والمبيعات والتوصيل' : 'Integrate warehouses with production, sales, and delivery workflows'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              {isRTL ? 'إعداد مطلوب' : 'Setup Required'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'يجب إنشاء جدول سير العمل أولاً' : 'Workflow table needs to be created first'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isRTL 
                ? 'لم يتم العثور على جدول سير العمل في قاعدة البيانات. يرجى إنشاء الجدول أولاً للبدء في استخدام هذه الميزة.'
                : 'Workflow events table not found in database. Please create the table first to start using this feature.'
              }
            </p>
            <Button onClick={handleSetupWorkflow} className="w-full">
              <Package className="h-4 w-4 mr-2" />
              {isRTL ? 'إنشاء جدول سير العمل' : 'Create Workflow Table'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isRTL ? 'تكامل سير العمل' : 'Workflow Integration'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? 'ربط المستودعات مع خط الإنتاج والمبيعات والتوصيل' : 'Integrate warehouses with production, sales, and delivery workflows'}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="production">
            <Factory className="h-4 w-4 mr-2" />
            {isRTL ? 'الإنتاج' : 'Production'}
          </TabsTrigger>
          <TabsTrigger value="sales">
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isRTL ? 'المبيعات' : 'Sales'}
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Truck className="h-4 w-4 mr-2" />
            {isRTL ? 'التوصيل' : 'Delivery'}
          </TabsTrigger>
          <TabsTrigger value="returns">
            <Package className="h-4 w-4 mr-2" />
            {isRTL ? 'الإرجاع' : 'Returns'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getEventIcon(activeTab.toUpperCase())}
                {getEventTypeName(activeTab.toUpperCase())} {isRTL ? 'الأحداث' : 'Events'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'الأحداث المتعلقة بسير العمل والمستودعات' : 'Workflow events related to warehouse operations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isRTL ? 'لا توجد أحداث' : 'No Events Found'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {isRTL 
                      ? 'لا توجد أحداث سير عمل من نوع ' + getEventTypeName(activeTab.toUpperCase()) + ' في الوقت الحالي.'
                      : 'No ' + getEventTypeName(activeTab.toUpperCase()).toLowerCase() + ' workflow events found at this time.'
                    }
                  </p>
                  <p className="text-sm text-gray-400">
                    {isRTL 
                      ? 'سيتم عرض الأحداث هنا عند إنشائها.'
                      : 'Events will appear here when they are created.'
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? 'النوع' : 'Type'}</TableHead>
                      <TableHead>{isRTL ? 'الوصف' : 'Description'}</TableHead>
                      <TableHead>{isRTL ? 'المستودع' : 'Warehouse'}</TableHead>
                      <TableHead>{isRTL ? 'المنتج' : 'Product'}</TableHead>
                      <TableHead>{isRTL ? 'الكمية' : 'Quantity'}</TableHead>
                      <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead>{isRTL ? 'المرجع' : 'Reference'}</TableHead>
                      <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                      <TableHead className="text-right">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventIcon(event.type)}
                            <span className="font-medium">
                              {getEventTypeName(event.type)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isRTL ? event.descriptionAr : event.description}
                        </TableCell>
                        <TableCell>
                          {isRTL ? event.warehouse_name_ar : event.warehouse_name}
                        </TableCell>
                        <TableCell className="font-medium">
                          {isRTL ? event.product_name_ar : event.product_name}
                        </TableCell>
                        <TableCell>{event.quantity}</TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {event.reference_number}
                          </code>
                        </TableCell>
                        <TableCell>
                          {new Date(event.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {event.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleProcessEvent(event.id)}
                            >
                              <ArrowRight className="h-4 w-4 mr-1" />
                              {isRTL ? 'معالجة' : 'Process'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Workflow Integration Status */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isRTL ? 'الإنتاج → المستودع' : 'Production → Warehouse'}
                </CardTitle>
                <Factory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats?.productionEvents || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'أحداث الإنتاج' : 'Production Events'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isRTL ? 'المبيعات → المستودع' : 'Sales → Warehouse'}
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.salesEvents || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'أحداث المبيعات' : 'Sales Events'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isRTL ? 'التوصيل → المستودع' : 'Delivery → Warehouse'}
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.deliveryEvents || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'أحداث التوصيل' : 'Delivery Events'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isRTL ? 'الإرجاع → المستودع' : 'Returns → Warehouse'}
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.returnEvents || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'أحداث الإرجاع' : 'Return Events'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Statistics */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isRTL ? 'إجمالي الأحداث' : 'Total Events'}
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalEvents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isRTL ? 'معلق' : 'Pending'}
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingEvents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isRTL ? 'مكتمل' : 'Completed'}
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.completedEvents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isRTL ? 'فشل' : 'Failed'}
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.failedEvents}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
