'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Search, Filter, ClipboardList, CheckCircle, XCircle, AlertTriangle, Package, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { 
  getStocktakings,
  createStocktaking,
  getWarehouses,
  getProductsWithWarehouseInfo,
  getInventorySummary
} from '@/lib/warehouse';
import { supabase } from '@/lib/supabase';
import type { 
  Stocktaking,
  StocktakingItem,
  Warehouse, 
  Product,
  InventorySummary
} from '@/types/warehouse';

export function StocktakingModule() {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'planned' | 'in_progress' | 'completed'>('planned');
  const [stocktakings, setStocktakings] = useState<Stocktaking[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStocktaking, setSelectedStocktaking] = useState<Stocktaking | null>(null);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    warehouse_id: '',
    stocktaking_date: '',
    notes: ''
  });

  // Stocktaking items state
  const [stocktakingItems, setStocktakingItems] = useState<StocktakingItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stocktakingsData, warehousesData, productsData, inventoryData] = await Promise.all([
        getStocktakings(),
        getWarehouses(),
        getProductsWithWarehouseInfo(),
        getInventorySummary()
      ]);

      setStocktakings(stocktakingsData);
      setWarehouses(warehousesData);
      setProducts(productsData);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStocktaking = async () => {
    try {
      setCreating(true);
      
      // Validate form data
      if (!formData.warehouse_id) {
        alert(isRTL ? 'يرجى اختيار المستودع' : 'Please select a warehouse');
        return;
      }
      
      if (!formData.stocktaking_date) {
        alert(isRTL ? 'يرجى اختيار تاريخ الجرد' : 'Please select a stocktaking date');
        return;
      }

      const stocktakingData = {
        warehouse_id: parseInt(formData.warehouse_id),
        stocktaking_date: formData.stocktaking_date,
        notes: formData.notes,
        reference_number: `ST-${Date.now()}`,
        status: 'PLANNED',
        total_items: 0,
        counted_items: 0,
        discrepancies: 0,
        created_by: 'current_user' // This should come from auth context
      };

      console.log('Creating stocktaking with data:', stocktakingData);
      const result = await createStocktaking(stocktakingData);
      console.log('Stocktaking created successfully:', result);
      
      // Reset form
      setFormData({ warehouse_id: '', stocktaking_date: '', notes: '' });
      setDialogOpen(false);
      
      // Reload data
      await loadData();
      
      // Show success message
      alert(isRTL ? 'تم إنشاء الجرد بنجاح' : 'Stocktaking created successfully');
    } catch (error: any) {
      console.error('Error creating stocktaking:', error);
      const errorMessage = error?.message || (isRTL ? 'حدث خطأ أثناء إنشاء الجرد' : 'Error creating stocktaking');
      alert(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleStartStocktaking = async (stocktaking: Stocktaking) => {
    try {
      setSelectedStocktaking(stocktaking);
      
      console.log('Starting stocktaking for warehouse:', stocktaking.warehouse_id);
      
      // Get inventory items for the specific warehouse - separate queries to avoid relationship issues
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('warehouse_id', stocktaking.warehouse_id)
        .not('available_quantity', 'is', null);

      if (inventoryError) {
        console.error('Error loading inventory:', inventoryError);
        alert(isRTL ? 'حدث خطأ أثناء تحميل المخزون' : 'Error loading inventory');
        return;
      }

      console.log('Inventory data loaded:', inventoryData?.length || 0, 'items');

      if (!inventoryData || inventoryData.length === 0) {
        alert(isRTL ? 'لا توجد عناصر في هذا المستودع' : 'No items found in this warehouse');
        setStocktakingItems([]);
        return;
      }

      // Get products data separately
      const productIds = inventoryData.map(inv => inv.product_id);
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (productsError) {
        console.error('Error loading products:', productsError);
        alert(isRTL ? 'حدث خطأ أثناء تحميل المنتجات' : 'Error loading products');
        return;
      }

      console.log('Products data loaded:', productsData?.length || 0, 'products');

      // Create stocktaking items from inventory
      const items: StocktakingItem[] = inventoryData.map(inv => {
        const product = productsData?.find(p => p.id === inv.product_id);
        return {
          id: 0,
          stocktaking_id: stocktaking.id,
          product_id: inv.product_id,
          system_quantity: inv.available_quantity || 0,
          counted_quantity: 0,
          difference: 0,
          product: product || null
        };
      });

      setStocktakingItems(items);
      console.log('Stocktaking items created:', items.length);
      
      // Update the stocktaking record to show it has items
      await supabase
        .from('stocktaking')
        .update({ 
          total_items: items.length,
          status: 'IN_PROGRESS'
        })
        .eq('id', stocktaking.id);

    } catch (error) {
      console.error('Error starting stocktaking:', error);
      alert(isRTL ? 'حدث خطأ أثناء بدء الجرد' : 'Error starting stocktaking');
    }
  };

  const handleEditStocktaking = (stocktaking: Stocktaking) => {
    // Set form data for editing
    setFormData({
      warehouse_id: stocktaking.warehouse_id.toString(),
      stocktaking_date: stocktaking.stocktaking_date,
      notes: stocktaking.notes || ''
    });
    setSelectedStocktaking(stocktaking);
    setDialogOpen(true);
  };

  const handleUpdateStocktaking = async () => {
    if (!selectedStocktaking) return;

    try {
      setCreating(true);
      
      // Validate form data
      if (!formData.warehouse_id) {
        alert(isRTL ? 'يرجى اختيار المستودع' : 'Please select a warehouse');
        return;
      }
      
      if (!formData.stocktaking_date) {
        alert(isRTL ? 'يرجى اختيار تاريخ الجرد' : 'Please select a stocktaking date');
        return;
      }

      // Update stocktaking data
      const { error } = await supabase
        .from('stocktaking')
        .update({
          warehouse_id: parseInt(formData.warehouse_id),
          stocktaking_date: formData.stocktaking_date,
          notes: formData.notes
        })
        .eq('id', selectedStocktaking.id);

      if (error) {
        console.error('Error updating stocktaking:', error);
        alert(isRTL ? 'حدث خطأ أثناء تحديث الجرد' : 'Error updating stocktaking');
        return;
      }

      // Reset form and close dialog
      setFormData({ warehouse_id: '', stocktaking_date: '', notes: '' });
      setSelectedStocktaking(null);
      setDialogOpen(false);
      
      // Reload data
      await loadData();
      
      alert(isRTL ? 'تم تحديث الجرد بنجاح' : 'Stocktaking updated successfully');
    } catch (error: any) {
      console.error('Error updating stocktaking:', error);
      alert(isRTL ? 'حدث خطأ أثناء تحديث الجرد' : 'Error updating stocktaking');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateCountedQuantity = (productId: number, countedQuantity: number) => {
    setStocktakingItems(prev => prev.map(item => {
      if (item.product_id === productId) {
        const difference = countedQuantity - item.system_quantity;
        return { ...item, counted_quantity: countedQuantity, difference };
      }
      return item;
    }));
  };

  const handleSaveStocktaking = async () => {
    if (!selectedStocktaking) return;

    try {
      // Calculate totals
      const totalItems = stocktakingItems.length;
      const countedItems = stocktakingItems.filter(item => item.counted_quantity > 0).length;
      const discrepancies = stocktakingItems.filter(item => item.difference !== 0).length;

      // Update stocktaking record
      const { error: updateError } = await supabase
        .from('stocktaking')
        .update({
          total_items: totalItems,
          counted_items: countedItems,
          discrepancies: discrepancies,
          status: 'COMPLETED',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedStocktaking.id);

      if (updateError) {
        console.error('Error updating stocktaking:', updateError);
        alert(isRTL ? 'حدث خطأ أثناء حفظ الجرد' : 'Error saving stocktaking');
        return;
      }

      // Save stocktaking items
      const itemsToSave = stocktakingItems.map(item => ({
        stocktaking_id: selectedStocktaking.id,
        product_id: item.product_id,
        system_quantity: item.system_quantity,
        counted_quantity: item.counted_quantity,
        difference: item.difference
      }));

      const { error: itemsError } = await supabase
        .from('stocktaking_items')
        .upsert(itemsToSave);

      if (itemsError) {
        console.error('Error saving stocktaking items:', itemsError);
        alert(isRTL ? 'حدث خطأ أثناء حفظ عناصر الجرد' : 'Error saving stocktaking items');
        return;
      }

      alert(isRTL ? 'تم حفظ الجرد بنجاح' : 'Stocktaking saved successfully');
      setSelectedStocktaking(null);
      setStocktakingItems([]);
      loadStocktakings(); // Refresh the list
    } catch (error) {
      console.error('Error saving stocktaking:', error);
      alert(isRTL ? 'حدث خطأ أثناء حفظ الجرد' : 'Error saving stocktaking');
    }
  };

  const loadStocktakings = async () => {
    try {
      const data = await getStocktakings();
      setStocktakings(data);
    } catch (error) {
      console.error('Error loading stocktakings:', error);
    }
  };

  const createSampleInventory = async () => {
    try {
      // Get some products and warehouses
      const { data: products } = await supabase.from('products').select('*').limit(5);
      const { data: warehouses } = await supabase.from('warehouses').select('*').limit(2);

      if (!products || products.length === 0 || !warehouses || warehouses.length === 0) {
        alert(isRTL ? 'لا توجد منتجات أو مستودعات لإنشاء مخزون تجريبي' : 'No products or warehouses found to create sample inventory');
        return;
      }

      // Create sample inventory records
      const inventoryRecords = [];
      for (const warehouse of warehouses) {
        for (const product of products) {
          inventoryRecords.push({
            product_id: product.id,
            warehouse_id: warehouse.id,
            available_quantity: Math.floor(Math.random() * 100) + 10, // Random quantity between 10-110
            minimum_stock_level: 5,
            last_updated: new Date().toISOString()
          });
        }
      }

      const { error } = await supabase
        .from('inventory')
        .upsert(inventoryRecords);

      if (error) {
        console.error('Error creating sample inventory:', error);
        alert(isRTL ? 'حدث خطأ أثناء إنشاء المخزون التجريبي' : 'Error creating sample inventory');
      } else {
        alert(isRTL ? 'تم إنشاء المخزون التجريبي بنجاح' : 'Sample inventory created successfully');
        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating sample inventory:', error);
      alert(isRTL ? 'حدث خطأ أثناء إنشاء المخزون التجريبي' : 'Error creating sample inventory');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLANNED': return <Badge className="bg-blue-100 text-blue-800"><Calendar className="h-3 w-3 mr-1" />{isRTL ? 'مخطط' : 'Planned'}</Badge>;
      case 'IN_PROGRESS': return <Badge className="bg-yellow-100 text-yellow-800"><ClipboardList className="h-3 w-3 mr-1" />{isRTL ? 'قيد التنفيذ' : 'In Progress'}</Badge>;
      case 'COMPLETED': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />{isRTL ? 'مكتمل' : 'Completed'}</Badge>;
      case 'APPROVED': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />{isRTL ? 'موافق عليه' : 'Approved'}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredStocktakings = stocktakings.filter(stocktaking =>
    stocktaking.warehouse?.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stocktaking.reference_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {isRTL ? 'نظام الجرد' : 'Stocktaking System'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? 'إدارة عمليات الجرد الفعلي للمخزون' : 'Manage physical inventory counting operations'}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {isRTL ? 'إنشاء جرد' : 'Create Stocktaking'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedStocktaking ? 
                  (isRTL ? 'تعديل الجرد' : 'Edit Stocktaking') : 
                  (isRTL ? 'إنشاء جرد جديد' : 'Create New Stocktaking')
                }
              </DialogTitle>
              <DialogDescription>
                {selectedStocktaking ? 
                  (isRTL ? 'تعديل عملية الجرد المحددة' : 'Edit the selected stocktaking operation') : 
                  (isRTL ? 'إنشاء عملية جرد جديدة للمستودع' : 'Create a new stocktaking operation for the warehouse')
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="warehouse">{isRTL ? 'المستودع' : 'Warehouse'}</Label>
                <Select
                  value={formData.warehouse_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, warehouse_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'اختر المستودع' : 'Select warehouse'} />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.length > 0 ? (
                      warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                          {isRTL ? warehouse.warehouse_name_ar : warehouse.warehouse_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-warehouses" disabled>
                        {isRTL ? 'لا توجد مستودعات متاحة' : 'No warehouses available'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">{isRTL ? 'تاريخ الجرد' : 'Stocktaking Date'}</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.stocktaking_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, stocktaking_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="notes">{isRTL ? 'ملاحظات' : 'Notes'}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={isRTL ? 'ملاحظات إضافية...' : 'Additional notes...'}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setDialogOpen(false);
                  setSelectedStocktaking(null);
                  setFormData({ warehouse_id: '', stocktaking_date: '', notes: '' });
                }} 
                disabled={creating}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={selectedStocktaking ? handleUpdateStocktaking : handleCreateStocktaking} 
                disabled={creating}
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {selectedStocktaking ? 
                      (isRTL ? 'جاري التحديث...' : 'Updating...') : 
                      (isRTL ? 'جاري الإنشاء...' : 'Creating...')
                    }
                  </>
                ) : (
                  <>
                    {selectedStocktaking ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        {isRTL ? 'تحديث الجرد' : 'Update Stocktaking'}
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        {isRTL ? 'إنشاء الجرد' : 'Create Stocktaking'}
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isRTL ? 'البحث في عمليات الجرد...' : 'Search stocktakings...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {t('common.filter')}
        </Button>
      </div>

      {/* Stocktakings Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{isRTL ? 'عمليات الجرد' : 'Stocktaking Operations'}</CardTitle>
              <CardDescription>
                {isRTL ? 'جميع عمليات الجرد المسجلة في النظام' : 'All stocktaking operations recorded in the system'}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={createSampleInventory}
              title={isRTL ? 'إنشاء مخزون تجريبي للاختبار' : 'Create sample inventory for testing'}
            >
              <Package className="h-4 w-4 mr-2" />
              {isRTL ? 'مخزون تجريبي' : 'Sample Inventory'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isRTL ? 'رقم المرجع' : 'Reference'}</TableHead>
                <TableHead>{isRTL ? 'المستودع' : 'Warehouse'}</TableHead>
                <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                <TableHead>{isRTL ? 'إجمالي العناصر' : 'Total Items'}</TableHead>
                <TableHead>{isRTL ? 'المعدود' : 'Counted'}</TableHead>
                <TableHead>{isRTL ? 'الاختلافات' : 'Discrepancies'}</TableHead>
                <TableHead className="text-right">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocktakings.map((stocktaking) => (
                <TableRow key={stocktaking.id}>
                  <TableCell className="font-medium">{stocktaking.reference_number}</TableCell>
                  <TableCell>
                    {isRTL ? stocktaking.warehouse?.warehouse_name_ar : stocktaking.warehouse?.warehouse_name}
                  </TableCell>
                  <TableCell>{new Date(stocktaking.stocktaking_date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(stocktaking.status)}</TableCell>
                  <TableCell>{stocktaking.total_items}</TableCell>
                  <TableCell>{stocktaking.counted_items}</TableCell>
                  <TableCell>
                    <span className={stocktaking.discrepancies > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                      {stocktaking.discrepancies}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {stocktaking.status === 'PLANNED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartStocktaking(stocktaking)}
                        >
                          <ClipboardList className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStocktaking(stocktaking)}
                        title={isRTL ? 'تعديل الجرد' : 'Edit Stocktaking'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stocktaking Items Modal */}
      {selectedStocktaking && (
        <Dialog open={!!selectedStocktaking} onOpenChange={() => setSelectedStocktaking(null)}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'جرد المستودع' : 'Warehouse Stocktaking'} - {selectedStocktaking.reference_number}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'عد العناصر الفعلية ومقارنتها مع النظام' : 'Count actual items and compare with system'}
              </DialogDescription>
            </DialogHeader>
            
            {/* Summary Section */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">{isRTL ? 'إجمالي العناصر' : 'Total Items'}</div>
                  <div className="text-2xl font-bold text-blue-600">{stocktakingItems.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{isRTL ? 'المعدود' : 'Counted'}</div>
                  <div className="text-2xl font-bold text-green-600">
                    {stocktakingItems.filter(item => item.counted_quantity > 0).length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{isRTL ? 'الاختلافات' : 'Discrepancies'}</div>
                  <div className="text-2xl font-bold text-red-600">
                    {stocktakingItems.filter(item => item.difference !== 0).length}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? 'المنتج' : 'Product'}</TableHead>
                    <TableHead>{isRTL ? 'الكمية في النظام' : 'System Quantity'}</TableHead>
                    <TableHead>{isRTL ? 'الكمية المعدودة' : 'Counted Quantity'}</TableHead>
                    <TableHead>{isRTL ? 'الاختلاف' : 'Difference'}</TableHead>
                    <TableHead>{isRTL ? 'ملاحظات' : 'Notes'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocktakingItems.map((item) => (
                    <TableRow key={item.product_id}>
                      <TableCell className="font-medium">
                        {isRTL ? item.product?.product_name_ar : item.product?.product_name}
                      </TableCell>
                      <TableCell>{item.system_quantity}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.counted_quantity}
                          onChange={(e) => handleUpdateCountedQuantity(item.product_id, parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <span className={item.difference !== 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                          {item.difference > 0 ? '+' : ''}{item.difference}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder={isRTL ? 'ملاحظات...' : 'Notes...'}
                          className="w-32"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedStocktaking(null)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSaveStocktaking}>
                {isRTL ? 'حفظ الجرد' : 'Save Stocktaking'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
