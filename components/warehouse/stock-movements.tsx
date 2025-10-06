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
import { Plus, Edit, Trash2, Search, Filter, Package, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { 
  getStockMovements, 
  createStockMovement,
  getProducts,
  getWarehouses
} from '@/lib/warehouse';
import { supabase } from '@/lib/supabase';
import type { 
  StockMovement, 
  Product, 
  Warehouse,
  CreateStockMovementData
} from '@/types/warehouse';

export function StockMovements() {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'receipt' | 'issue' | 'transfer' | 'return'>('receipt');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateStockMovementData>({
    product_id: 0,
    warehouse_id: 0,
    movement_type: 'RECEIPT',
    quantity: 0,
    unit_price: 0,
    reference_number: '',
    reference_number_ar: '',
    notes: '',
    notes_ar: '',
    created_by: 'System',
    created_by_ar: 'النظام'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading stock movements data...');
      
      const [movementsData, productsData, warehousesData] = await Promise.all([
        getStockMovements().catch(err => {
          console.error('Error loading movements:', err);
          return [];
        }),
        getProducts().catch(err => {
          console.error('Error loading products:', err);
          return [];
        }),
        getWarehouses().catch(err => {
          console.error('Error loading warehouses:', err);
          return [];
        })
      ]);

      console.log('📦 Products loaded:', productsData.length);
      console.log('🏭 Warehouses loaded:', warehousesData.length);
      console.log('📋 Movements loaded:', movementsData.length);

      setMovements(movementsData);
      setProducts(productsData);
      setWarehouses(warehousesData);
      setFilteredProducts([]); // Initially no products until warehouse is selected
      
      console.log('✅ Stock movements data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on selected warehouse
  const filterProductsByWarehouse = async (warehouseId: number) => {
    if (!warehouseId || warehouseId === 0) {
      setFilteredProducts([]);
      return;
    }

    try {
      console.log(`🔍 Filtering products for warehouse ${warehouseId}...`);
      
      // First, try to get products from inventory table
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select(`
          product_id,
          products!inner(*)
        `)
        .eq('warehouse_id', warehouseId)
        .not('available_quantity', 'is', null)
        .gt('available_quantity', 0);

      if (inventoryError) {
        console.log('📦 No inventory data found, falling back to all products');
        // Fallback: if no inventory data, show all products
        setFilteredProducts(products);
        return;
      }

      if (inventory && inventory.length > 0) {
        // Extract unique products from inventory
        const uniqueProducts = inventory.map(item => item.products).filter(Boolean);
        setFilteredProducts(uniqueProducts);
        console.log(`📦 Found ${uniqueProducts.length} products in warehouse ${warehouseId}`);
      } else {
        console.log('📦 No products found in inventory, showing all products');
        // If no inventory data, show all products as fallback
        setFilteredProducts(products);
      }
    } catch (error) {
      console.error('Error filtering products by warehouse:', error);
      // Fallback: show all products if filtering fails
      setFilteredProducts(products);
    }
  };

  const handleSubmit = async () => {
    try {
      await createStockMovement(formData);
      setFormData({
        product_id: 0,
        warehouse_id: 0,
        movement_type: activeTab.toUpperCase() as any,
        quantity: 0,
        unit_price: 0,
        reference_number: '',
        reference_number_ar: '',
        notes: '',
        notes_ar: '',
        created_by: 'System',
        created_by_ar: 'النظام'
      });
      setFilteredProducts([]); // Clear filtered products
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating movement:', error);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setFormData({
      product_id: 0,
      warehouse_id: 0,
      movement_type: activeTab.toUpperCase() as any,
      quantity: 0,
      unit_price: 0,
      reference_number: '',
      reference_number_ar: '',
      notes: '',
      notes_ar: '',
      created_by: 'System',
      created_by_ar: 'النظام'
    });
    setFilteredProducts([]); // Clear filtered products
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'RECEIPT': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'ISSUE': return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'TRANSFER': return <ArrowUpDown className="h-4 w-4 text-blue-600" />;
      case 'RETURN': return <RotateCcw className="h-4 w-4 text-orange-600" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    // Handle missing status field
    if (!status) {
      return <Badge variant="secondary">Active</Badge>;
    }
    
    switch (status) {
      case 'APPROVED': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />{t('warehouse.approved')}</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-100 text-yellow-800">{t('warehouse.pending')}</Badge>;
      case 'REJECTED': return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />{t('warehouse.rejected')}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredMovements = movements.filter(movement => {
    // Get product and warehouse names from the separate arrays
    const product = products.find(p => p.id === movement.product_id);
    const warehouse = warehouses.find(w => w.id === movement.warehouse_id);
    
    return (
      product?.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse?.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
            {isRTL ? 'إدارة حركة المخزون' : 'Stock Movement Management'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? 'إدارة حركات المخزون (الإضافة، الصرف، التحويل، الارتجاع)' : 'Manage stock movements (Receipt, Issue, Transfer, Return)'}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          if (!open) handleDialogClose();
          else setDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {isRTL ? 'إضافة حركة' : 'Add Movement'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إضافة حركة مخزون جديدة' : 'Add New Stock Movement'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'إضافة حركة مخزون جديدة للنظام' : 'Add a new stock movement to the system'}
              </DialogDescription>
            </DialogHeader>
            
            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
                <p><strong>Debug Info:</strong></p>
                <p>Products loaded: {products.length}</p>
                <p>Warehouses loaded: {warehouses.length}</p>
                <p>Filtered products: {filteredProducts.length}</p>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                {products.length > 0 && (
                  <p>Sample product: {products[0].product_name}</p>
                )}
                {warehouses.length > 0 && (
                  <p>Sample warehouse: {warehouses[0].warehouse_name}</p>
                )}
              </div>
            )}

            {/* Warehouse Selection Notice */}
            {!loading && !formData.warehouse_id && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    {isRTL 
                      ? 'يجب اختيار المستودع أولاً لعرض المنتجات المتاحة'
                      : 'Please select a warehouse first to see available products'
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Products Count Info */}
            {!loading && formData.warehouse_id && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    {isRTL 
                      ? `تم العثور على ${filteredProducts.length} منتج في هذا المستودع`
                      : `Found ${filteredProducts.length} products in this warehouse`
                    }
                  </span>
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value as any);
              setFormData(prev => ({ ...prev, movement_type: value.toUpperCase() as any }));
            }}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="receipt">
                  <ArrowUp className="h-4 w-4 mr-2" />
                  {isRTL ? 'إضافة' : 'Receipt'}
                </TabsTrigger>
                <TabsTrigger value="issue">
                  <ArrowDown className="h-4 w-4 mr-2" />
                  {isRTL ? 'صرف' : 'Issue'}
                </TabsTrigger>
                <TabsTrigger value="transfer">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {isRTL ? 'تحويل' : 'Transfer'}
                </TabsTrigger>
                <TabsTrigger value="return">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {isRTL ? 'إرجاع' : 'Return'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="warehouse">{isRTL ? 'المستودع' : 'Warehouse'} <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.warehouse_id.toString()}
                      onValueChange={async (value) => {
                        const warehouseId = parseInt(value);
                        setFormData(prev => ({ 
                          ...prev, 
                          warehouse_id: warehouseId,
                          product_id: 0 // Reset product when warehouse changes
                        }));
                        await filterProductsByWarehouse(warehouseId);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isRTL ? 'اختر المستودع أولاً' : 'Select warehouse first'} />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.length > 0 ? (
                          warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                              {isRTL ? (warehouse.warehouse_name_ar || warehouse.warehouse_name) : warehouse.warehouse_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-data" disabled>
                            {loading ? 'Loading warehouses...' : 'No warehouses found - check database'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="product">{isRTL ? 'المنتج' : 'Product'} <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.product_id.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: parseInt(value) }))}
                      disabled={!formData.warehouse_id || filteredProducts.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !formData.warehouse_id 
                            ? (isRTL ? 'اختر المستودع أولاً' : 'Select warehouse first')
                            : (isRTL ? 'اختر المنتج' : 'Select product')
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {isRTL ? (product.product_name_ar || product.product_name) : product.product_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-data" disabled>
                            {!formData.warehouse_id 
                              ? (isRTL ? 'اختر المستودع أولاً' : 'Select warehouse first')
                              : (isRTL ? 'لا توجد منتجات في هذا المستودع' : 'No products in this warehouse')
                            }
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantity">{isRTL ? 'الكمية' : 'Quantity'}</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit_price">{isRTL ? 'سعر الوحدة' : 'Unit Price'}</Label>
                    <Input
                      id="unit_price"
                      type="number"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference">{isRTL ? 'رقم المرجع' : 'Reference Number'}</Label>
                    <Input
                      id="reference"
                      value={formData.reference_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                      placeholder={isRTL ? 'رقم المرجع' : 'Reference number'}
                    />
                  </div>
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
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={handleDialogClose}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSubmit}>
                {isRTL ? 'إضافة الحركة' : 'Add Movement'}
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
            placeholder={isRTL ? 'البحث في الحركات...' : 'Search movements...'}
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

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'حركات المخزون' : 'Stock Movements'}</CardTitle>
          <CardDescription>
            {isRTL ? 'جميع حركات المخزون المسجلة في النظام' : 'All stock movements recorded in the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isRTL ? 'النوع' : 'Type'}</TableHead>
                <TableHead>{isRTL ? 'المنتج' : 'Product'}</TableHead>
                <TableHead>{isRTL ? 'المستودع' : 'Warehouse'}</TableHead>
                <TableHead>{isRTL ? 'الكمية' : 'Quantity'}</TableHead>
                <TableHead>{isRTL ? 'السعر' : 'Price'}</TableHead>
                <TableHead>{isRTL ? 'المرجع' : 'Reference'}</TableHead>
                <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMovementTypeIcon(movement.movement_type)}
                      <span className="font-medium">
                        {isRTL ? 
                          (movement.movement_type_ar || 
                           (movement.movement_type === 'RECEIPT' ? 'إضافة' :
                            movement.movement_type === 'ISSUE' ? 'صرف' :
                            movement.movement_type === 'TRANSFER' ? 'تحويل' : 
                            movement.movement_type === 'IN' ? 'دخول' :
                            movement.movement_type === 'OUT' ? 'خروج' : 'إرجاع')) :
                          movement.movement_type
                        }
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {(() => {
                      const product = products.find(p => p.id === movement.product_id);
                      return isRTL ? (product?.product_name_ar || product?.product_name) : product?.product_name;
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const warehouse = warehouses.find(w => w.id === movement.warehouse_id);
                      return isRTL ? (warehouse?.warehouse_name_ar || warehouse?.warehouse_name) : warehouse?.warehouse_name;
                    })()}
                  </TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell>{movement.unit_price ? `$${movement.unit_price.toFixed(2)}` : '-'}</TableCell>
                  <TableCell>{isRTL ? (movement.reference_number_ar || movement.reference_number) : movement.reference_number || '-'}</TableCell>
                  <TableCell>{getStatusBadge(movement.status || 'Active')}</TableCell>
                  <TableCell>{new Date(movement.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
