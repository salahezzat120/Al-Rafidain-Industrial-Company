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
import { Plus, Edit, Trash2, Search, Filter, Warehouse, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { 
  getWarehouses, 
  createWarehouse, 
  updateWarehouse, 
  deleteWarehouse,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getMainGroups,
  getSubGroups,
  getColors,
  getMaterials,
  getUnitsOfMeasurement,
  getProductsWithWarehouseInfo,
  createInventory
} from '@/lib/warehouse';
import type { 
  Warehouse, 
  Product, 
  CreateWarehouseData, 
  CreateProductData,
  MainGroup,
  SubGroup,
  Color,
  Material,
  UnitOfMeasurement
} from '@/types/warehouse';

export function WarehouseManagement() {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'warehouses' | 'products'>('warehouses');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [mainGroups, setMainGroups] = useState<MainGroup[]>([]);
  const [subGroups, setSubGroups] = useState<SubGroup[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<UnitOfMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Warehouse form state
  const [warehouseForm, setWarehouseForm] = useState<CreateWarehouseData>({
    warehouse_name: '',
    location: '',
    responsible_person: ''
  });
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState<CreateProductData>({
    product_name: '',
    product_code: '',
    main_group_id: 0,
    sub_group_id: undefined,
    color_id: undefined,
    material_id: undefined,
    unit_of_measurement_id: 0,
    description: '',
    specifications: {}
  });
  
  // Warehouse selection for new products
  const [selectedWarehouses, setSelectedWarehouses] = useState<number[]>([]);
  const [warehouseQuantities, setWarehouseQuantities] = useState<Record<number, number>>({});
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Force refresh when switching to products tab
  useEffect(() => {
    if (activeTab === 'products') {
      loadData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (productForm.main_group_id) {
      loadSubGroups(productForm.main_group_id);
    }
  }, [productForm.main_group_id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        warehousesData,
        productsData,
        mainGroupsData,
        colorsData,
        materialsData,
        unitsData
      ] = await Promise.all([
        getWarehouses(),
        getProductsWithWarehouseInfo(),
        getMainGroups(),
        getColors(),
        getMaterials(),
        getUnitsOfMeasurement()
      ]);

      setWarehouses(warehousesData);
      setProducts(productsData);
      setMainGroups(mainGroupsData);
      setColors(colorsData);
      setMaterials(materialsData);
      setUnits(unitsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubGroups = async (mainGroupId: number) => {
    try {
      const subGroupsData = await getSubGroups(mainGroupId);
      setSubGroups(subGroupsData);
    } catch (error) {
      console.error('Error loading sub groups:', error);
    }
  };

  const handleCreateWarehouse = async () => {
    try {
      await createWarehouse(warehouseForm);
      setWarehouseForm({ warehouse_name: '', location: '', responsible_person: '' });
      setWarehouseDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating warehouse:', error);
    }
  };

  const handleUpdateWarehouse = async () => {
    if (!editingWarehouse) return;
    
    try {
      await updateWarehouse({ id: editingWarehouse.id, ...warehouseForm });
      setEditingWarehouse(null);
      setWarehouseForm({ warehouse_name: '', location: '', responsible_person: '' });
      setWarehouseDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error updating warehouse:', error);
    }
  };

  const handleDeleteWarehouse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;
    
    try {
      await deleteWarehouse(id);
      loadData();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
    }
  };

  const handleCreateProduct = async () => {
    try {
      // Create the product first
      const newProduct = await createProduct(productForm);
      
      // Create inventory records for selected warehouses
      if (selectedWarehouses.length > 0) {
        const inventoryPromises = selectedWarehouses.map(warehouseId => 
          createInventory({
            product_id: newProduct.id,
            warehouse_id: warehouseId,
            available_quantity: warehouseQuantities[warehouseId] || 0,
            minimum_stock_level: 0,
            maximum_stock_level: undefined,
            reorder_point: 0
          })
        );
        
        await Promise.all(inventoryPromises);
      }
      
      // Reset form
      setProductForm({
        product_name: '',
        product_code: '',
        main_group_id: 0,
        sub_group_id: undefined,
        color_id: undefined,
        material_id: undefined,
        unit_of_measurement_id: 0,
        description: '',
        specifications: {}
      });
      setSelectedWarehouses([]);
      setWarehouseQuantities({});
      setProductDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    try {
      await updateProduct({ id: editingProduct.id, ...productForm });
      setEditingProduct(null);
      setProductForm({
        product_name: '',
        product_code: '',
        main_group_id: 0,
        sub_group_id: undefined,
        color_id: undefined,
        material_id: undefined,
        unit_of_measurement_id: 0,
        description: '',
        specifications: {}
      });
      setSelectedWarehouses([]);
      setWarehouseQuantities({});
      setProductDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteProduct(id);
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const openWarehouseDialog = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setWarehouseForm({
        warehouse_name: warehouse.warehouse_name,
        location: warehouse.location,
        responsible_person: warehouse.responsible_person
      });
    } else {
      setEditingWarehouse(null);
      setWarehouseForm({ warehouse_name: '', location: '', responsible_person: '' });
    }
    setWarehouseDialogOpen(true);
  };

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        product_name: product.product_name,
        product_code: product.product_code || '',
        main_group_id: product.main_group_id,
        sub_group_id: product.sub_group_id,
        color_id: product.color_id,
        material_id: product.material_id,
        unit_of_measurement_id: product.unit_of_measurement_id,
        description: product.description || '',
        specifications: product.specifications || {}
      });
      // For editing, don't show warehouse selection
      setSelectedWarehouses([]);
      setWarehouseQuantities({});
    } else {
      setEditingProduct(null);
      setProductForm({
        product_name: '',
        product_code: '',
        main_group_id: 0,
        sub_group_id: undefined,
        color_id: undefined,
        material_id: undefined,
        unit_of_measurement_id: 0,
        description: '',
        specifications: {}
      });
      // For new products, reset warehouse selection
      setSelectedWarehouses([]);
      setWarehouseQuantities({});
    }
    setProductDialogOpen(true);
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.responsible_person.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.main_group?.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Warehouse Management</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('warehouse.warehouseManagement')}</h1>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'warehouses' ? 'default' : 'outline'}
            onClick={() => setActiveTab('warehouses')}
          >
            <Warehouse className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('warehouse.warehouses')}
          </Button>
          <Button
            variant={activeTab === 'products' ? 'default' : 'outline'}
            onClick={() => setActiveTab('products')}
          >
            <Package className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('warehouse.products')}
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
          <Input
            placeholder={isRTL ? `البحث في ${activeTab === 'warehouses' ? 'المستودعات' : 'المنتجات'}...` : `Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={isRTL ? 'pr-10' : 'pl-10'}
          />
        </div>
        <Button variant="outline">
          <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('common.filter')}
        </Button>
      </div>

      {/* Warehouses Tab */}
      {activeTab === 'warehouses' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('warehouse.warehouses')}</CardTitle>
                <CardDescription>
                  {isRTL ? 'إدارة مواقع المستودعات والأشخاص المسؤولين' : 'Manage warehouse locations and responsible persons'}
                </CardDescription>
              </div>
              <Dialog open={warehouseDialogOpen} onOpenChange={setWarehouseDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openWarehouseDialog()}>
                    <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'إضافة مستودع' : 'Add Warehouse'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingWarehouse ? (isRTL ? 'تعديل المستودع' : 'Edit Warehouse') : (isRTL ? 'إضافة مستودع جديد' : 'Add New Warehouse')}
                    </DialogTitle>
                    <DialogDescription>
                      {editingWarehouse 
                        ? (isRTL ? 'تحديث معلومات المستودع' : 'Update warehouse information')
                        : (isRTL ? 'إضافة مستودع جديد إلى النظام' : 'Add a new warehouse to the system')
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="warehouse_name">{isRTL ? 'اسم المستودع' : 'Warehouse Name'}</Label>
                      <Input
                        id="warehouse_name"
                        value={warehouseForm.warehouse_name}
                        onChange={(e) => setWarehouseForm(prev => ({ ...prev, warehouse_name: e.target.value }))}
                        placeholder={isRTL ? 'أدخل اسم المستودع' : 'Enter warehouse name'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">{isRTL ? 'الموقع' : 'Location'}</Label>
                      <Input
                        id="location"
                        value={warehouseForm.location}
                        onChange={(e) => setWarehouseForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder={isRTL ? 'أدخل موقع المستودع' : 'Enter warehouse location'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="responsible_person">{isRTL ? 'الشخص المسؤول' : 'Responsible Person'}</Label>
                      <Input
                        id="responsible_person"
                        value={warehouseForm.responsible_person}
                        onChange={(e) => setWarehouseForm(prev => ({ ...prev, responsible_person: e.target.value }))}
                        placeholder={isRTL ? 'أدخل اسم الشخص المسؤول' : 'Enter responsible person name'}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setWarehouseDialogOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={editingWarehouse ? handleUpdateWarehouse : handleCreateWarehouse}>
                      {editingWarehouse ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إنشاء' : 'Create')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Warehouse Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Responsible Person</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell className="font-medium">{warehouse.warehouse_name}</TableCell>
                    <TableCell>{warehouse.location}</TableCell>
                    <TableCell>{warehouse.responsible_person}</TableCell>
                    <TableCell>{new Date(warehouse.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openWarehouseDialog(warehouse)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWarehouse(warehouse.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  Manage plastic products and their specifications
                </CardDescription>
              </div>
              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openProductDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{minHeight: '600px'}}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProduct 
                        ? 'Update product information' 
                        : 'Add a new product to the system'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="product_name">Product Name</Label>
                        <Input
                          id="product_name"
                          value={productForm.product_name}
                          onChange={(e) => setProductForm(prev => ({ ...prev, product_name: e.target.value }))}
                          placeholder="Enter product name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product_code">Product Code</Label>
                        <Input
                          id="product_code"
                          value={productForm.product_code}
                          onChange={(e) => setProductForm(prev => ({ ...prev, product_code: e.target.value }))}
                          placeholder="Enter product code"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="main_group">Main Group</Label>
                        <Select
                          value={productForm.main_group_id.toString()}
                          onValueChange={(value) => setProductForm(prev => ({ 
                            ...prev, 
                            main_group_id: parseInt(value),
                            sub_group_id: undefined
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select main group" />
                          </SelectTrigger>
                          <SelectContent>
                            {mainGroups.map((group) => (
                              <SelectItem key={group.id} value={group.id.toString()}>
                                {group.group_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="sub_group">Sub Group</Label>
                        <Select
                          value={productForm.sub_group_id?.toString() || ''}
                          onValueChange={(value) => setProductForm(prev => ({ 
                            ...prev, 
                            sub_group_id: value ? parseInt(value) : undefined
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select sub group" />
                          </SelectTrigger>
                          <SelectContent>
                            {subGroups.map((subGroup) => (
                              <SelectItem key={subGroup.id} value={subGroup.id.toString()}>
                                {subGroup.sub_group_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="color">Color</Label>
                        <Select
                          value={productForm.color_id?.toString() || ''}
                          onValueChange={(value) => setProductForm(prev => ({ 
                            ...prev, 
                            color_id: value ? parseInt(value) : undefined
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            {colors.map((color) => (
                              <SelectItem key={color.id} value={color.id.toString()}>
                                {color.color_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="material">Material</Label>
                        <Select
                          value={productForm.material_id?.toString() || ''}
                          onValueChange={(value) => setProductForm(prev => ({ 
                            ...prev, 
                            material_id: value ? parseInt(value) : undefined
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.map((material) => (
                              <SelectItem key={material.id} value={material.id.toString()}>
                                {material.material_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="unit">Unit of Measurement</Label>
                        <Select
                          value={productForm.unit_of_measurement_id.toString()}
                          onValueChange={(value) => setProductForm(prev => ({ 
                            ...prev, 
                            unit_of_measurement_id: parseInt(value)
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id.toString()}>
                                {unit.unit_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter product description"
                        rows={3}
                      />
                    </div>

                    {/* Warehouse Selection - Only for new products */}
                    <div className="border-t pt-4 bg-gray-50 p-4 rounded-lg">
                      <div className="bg-red-500 text-white p-2 rounded mb-2">
                        🚨 TEST: Warehouse section is rendering!
                      </div>
                      <Label className="text-lg font-semibold">🏭 Warehouse Storage</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select which warehouses will store this product and set initial quantities.
                        {console.log('Debug - Warehouses loaded:', warehouses.length, warehouses)}
                      </p>
                      <div className="text-xs text-blue-600 mb-2 font-bold">
                        🔍 Debug: {warehouses.length} warehouses available
                      </div>
                      <div className="space-y-3 mt-2">
                        {warehouses.length > 0 ? (
                          warehouses.map((warehouse) => (
                            <div key={warehouse.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                              <input
                                type="checkbox"
                                id={`warehouse-${warehouse.id}`}
                                checked={selectedWarehouses.includes(warehouse.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedWarehouses(prev => [...prev, warehouse.id]);
                                  } else {
                                    setSelectedWarehouses(prev => prev.filter(id => id !== warehouse.id));
                                    setWarehouseQuantities(prev => {
                                      const newQuantities = { ...prev };
                                      delete newQuantities[warehouse.id];
                                      return newQuantities;
                                    });
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <label htmlFor={`warehouse-${warehouse.id}`} className="flex-1">
                                <div className="font-medium">{warehouse.warehouse_name}</div>
                                <div className="text-sm text-muted-foreground">{warehouse.location}</div>
                              </label>
                              {selectedWarehouses.includes(warehouse.id) && (
                                <div className="flex items-center space-x-2">
                                  <Label htmlFor={`quantity-${warehouse.id}`} className="text-sm">Quantity:</Label>
                                  <Input
                                    id={`quantity-${warehouse.id}`}
                                    type="number"
                                    min="0"
                                    value={warehouseQuantities[warehouse.id] || 0}
                                    onChange={(e) => setWarehouseQuantities(prev => ({
                                      ...prev,
                                      [warehouse.id]: parseInt(e.target.value) || 0
                                    }))}
                                    className="w-20"
                                    placeholder="0"
                                  />
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground mb-2">No warehouses available</p>
                            <p className="text-xs text-muted-foreground">Create a warehouse first to store products</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Final Test */}
                    <div className="bg-yellow-200 p-2 rounded text-center">
                      ✅ Form ends here - Warehouse section should be above this
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}>
                      {editingProduct ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Main Group</TableHead>
                  <TableHead>Sub Group</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Warehouses</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.product_name}</TableCell>
                    <TableCell>{product.product_code || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.main_group?.group_name}</Badge>
                    </TableCell>
                    <TableCell>{product.sub_group?.sub_group_name || '-'}</TableCell>
                    <TableCell>{product.color?.color_name || '-'}</TableCell>
                    <TableCell>{product.material?.material_name || '-'}</TableCell>
                    <TableCell>{product.unit_of_measurement?.unit_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.inventory && product.inventory.length > 0 ? (
                          product.inventory.map((inv: any) => (
                            <Badge key={inv.warehouse_id} variant="outline" className="text-xs">
                              {inv.warehouse?.warehouse_name} ({inv.available_quantity || 0})
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No inventory</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openProductDialog(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
