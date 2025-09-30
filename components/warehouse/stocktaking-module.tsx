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

  // Form state
  const [formData, setFormData] = useState({
    warehouse_id: 0,
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
      const stocktakingData = {
        ...formData,
        reference_number: `ST-${Date.now()}`,
        status: 'PLANNED',
        total_items: 0,
        counted_items: 0,
        discrepancies: 0,
        created_by: 'current_user' // This should come from auth context
      };

      await createStocktaking(stocktakingData);
      setFormData({ warehouse_id: 0, stocktaking_date: '', notes: '' });
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating stocktaking:', error);
    }
  };

  const handleStartStocktaking = (stocktaking: Stocktaking) => {
    setSelectedStocktaking(stocktaking);
    // Load inventory items for the warehouse
    const warehouseInventory = inventory.filter(item => item.warehouse_name === stocktaking.warehouse?.warehouse_name);
    const items: StocktakingItem[] = warehouseInventory.map(item => ({
      id: 0,
      stocktaking_id: stocktaking.id,
      product_id: item.product_id,
      system_quantity: item.available_quantity,
      counted_quantity: 0,
      difference: 0,
      product: products.find(p => p.id === item.product_id)
    }));
    setStocktakingItems(items);
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
                {isRTL ? 'إنشاء جرد جديد' : 'Create New Stocktaking'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'إنشاء عملية جرد جديدة للمستودع' : 'Create a new stocktaking operation for the warehouse'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="warehouse">{isRTL ? 'المستودع' : 'Warehouse'}</Label>
                <Select
                  value={formData.warehouse_id.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, warehouse_id: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'اختر المستودع' : 'Select warehouse'} />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                        {isRTL ? warehouse.warehouse_name_ar : warehouse.warehouse_name}
                      </SelectItem>
                    ))}
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
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleCreateStocktaking}>
                {isRTL ? 'إنشاء الجرد' : 'Create Stocktaking'}
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
          <CardTitle>{isRTL ? 'عمليات الجرد' : 'Stocktaking Operations'}</CardTitle>
          <CardDescription>
            {isRTL ? 'جميع عمليات الجرد المسجلة في النظام' : 'All stocktaking operations recorded in the system'}
          </CardDescription>
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
              <Button>
                {isRTL ? 'حفظ الجرد' : 'Save Stocktaking'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
