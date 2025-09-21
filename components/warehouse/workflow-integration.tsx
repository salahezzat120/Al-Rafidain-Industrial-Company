'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Factory, Truck, ShoppingCart, Package, ArrowRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

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

  useEffect(() => {
    loadWorkflowEvents();
  }, [activeTab]);

  const loadWorkflowEvents = async () => {
    try {
      setLoading(true);
      // Simulate API call - in real implementation, this would fetch from your backend
      const mockEvents: WorkflowEvent[] = [
        {
          id: '1',
          type: 'PRODUCTION',
          description: 'New production batch completed',
          descriptionAr: 'تم إكمال دفعة إنتاج جديدة',
          timestamp: new Date().toISOString(),
          status: 'COMPLETED',
          warehouse_id: 1,
          warehouse_name: 'Factory Warehouse',
          warehouse_name_ar: 'مستودع المصنع',
          product_id: 1,
          product_name: 'White Plastic Cups',
          product_name_ar: 'أكواب بلاستيك بيضاء',
          quantity: 1000,
          reference_number: 'PROD-2024-001'
        },
        {
          id: '2',
          type: 'SALES',
          description: 'Sales order processed',
          descriptionAr: 'تم معالجة طلب البيع',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'IN_PROGRESS',
          warehouse_id: 2,
          warehouse_name: 'Cairo Distribution Warehouse',
          warehouse_name_ar: 'مستودع التوزيع بالقاهرة',
          product_id: 2,
          product_name: 'Plastic Plates',
          product_name_ar: 'أطباق بلاستيك',
          quantity: 500,
          reference_number: 'SO-2024-001'
        },
        {
          id: '3',
          type: 'DELIVERY',
          description: 'Delivery completed to customer',
          descriptionAr: 'تم إكمال التوصيل للعميل',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'COMPLETED',
          warehouse_id: 3,
          warehouse_name: 'Alexandria Warehouse',
          warehouse_name_ar: 'مستودع الإسكندرية',
          product_id: 3,
          product_name: 'Plastic Boxes',
          product_name_ar: 'صناديق بلاستيك',
          quantity: 200,
          reference_number: 'DEL-2024-001'
        },
        {
          id: '4',
          type: 'RETURN',
          description: 'Customer return processed',
          descriptionAr: 'تم معالجة إرجاع العميل',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          status: 'PENDING',
          warehouse_id: 1,
          warehouse_name: 'Factory Warehouse',
          warehouse_name_ar: 'مستودع المصنع',
          product_id: 1,
          product_name: 'White Plastic Cups',
          product_name_ar: 'أكواب بلاستيك بيضاء',
          quantity: 50,
          reference_number: 'RET-2024-001'
        }
      ];

      const filteredEvents = mockEvents.filter(event => {
        switch (activeTab) {
          case 'production': return event.type === 'PRODUCTION';
          case 'sales': return event.type === 'SALES';
          case 'delivery': return event.type === 'DELIVERY';
          case 'returns': return event.type === 'RETURN';
          default: return true;
        }
      });

      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error loading workflow events:', error);
    } finally {
      setLoading(false);
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

  const handleProcessEvent = (eventId: string) => {
    // In real implementation, this would trigger the actual workflow processing
    console.log('Processing event:', eventId);
    // Update the event status
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, status: 'COMPLETED' as const }
        : event
    ));
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
                <div className="text-2xl font-bold text-green-600">✓</div>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'متصل' : 'Connected'}
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
                <div className="text-2xl font-bold text-green-600">✓</div>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'متصل' : 'Connected'}
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
                <div className="text-2xl font-bold text-green-600">✓</div>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'متصل' : 'Connected'}
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
                <div className="text-2xl font-bold text-green-600">✓</div>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'متصل' : 'Connected'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
