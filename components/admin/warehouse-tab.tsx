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
import { Plus, Edit, Trash2, Search, Filter, Warehouse, Package, AlertTriangle, TrendingUp, AlertCircle } from 'lucide-react';
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
  getWarehouseStats,
  getStockAlerts,
  getInventorySummary
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
  UnitOfMeasurement,
  WarehouseStats,
  StockAlert,
  InventorySummary
} from '@/types/warehouse';

export function WarehouseTab() {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'warehouses' | 'products' | 'inventory'>('dashboard');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventorySummary[]>([]);
  const [mainGroups, setMainGroups] = useState<MainGroup[]>([]);
  const [subGroups, setSubGroups] = useState<SubGroup[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<UnitOfMeasurement[]>([]);
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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
        inventoryData,
        mainGroupsData,
        colorsData,
        materialsData,
        unitsData,
        statsData,
        alertsData
      ] = await Promise.all([
        getWarehouses(),
        getProducts(),
        getInventorySummary(),
        getMainGroups(),
        getColors(),
        getMaterials(),
        getUnitsOfMeasurement(),
        getWarehouseStats(),
        getStockAlerts()
      ]);

      setWarehouses(warehousesData);
      setProducts(productsData);
      setInventory(inventoryData);
      setMainGroups(mainGroupsData);
      setColors(colorsData);
      setMaterials(materialsData);
      setUnits(unitsData);
      setStats(statsData);
      setAlerts(alertsData);
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
      await createProduct(productForm);
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

  const filteredInventory = inventory.filter(item =>
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading warehouse data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">🏭 Warehouse Management</h2>
          <p className="text-muted-foreground">
            Manage plastic products inventory, warehouses, and stock levels
          </p>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={(value) => setActiveSubTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_warehouses || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active warehouse locations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active products in inventory
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_inventory_value || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total units in stock
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats?.low_stock_items || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Items below minimum stock
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Stock Alerts
              </CardTitle>
              <CardDescription>
                Products that need attention due to low stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No stock alerts at this time</p>
                  <p className="text-sm">All products are well stocked</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{alert.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {alert.warehouse_name}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">{alert.current_quantity}</span>
                          <span className="text-muted-foreground"> / {alert.minimum_stock_level}</span>
                        </div>
                        <Badge 
                          variant={alert.alert_type === 'LOW_STOCK' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {alert.alert_type === 'LOW_STOCK' ? 'Low Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {alerts.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm">
                        View All Alerts ({alerts.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warehouses Tab */}
        <TabsContent value="warehouses" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Warehouses</CardTitle>
                  <CardDescription>
                    Manage warehouse locations and responsible persons
                  </CardDescription>
                </div>
                <Dialog open={warehouseDialogOpen} onOpenChange={setWarehouseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openWarehouseDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Warehouse
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingWarehouse 
                          ? 'Update warehouse information' 
                          : 'Add a new warehouse to the system'
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="warehouse_name">Warehouse Name</Label>
                        <Input
                          id="warehouse_name"
                          value={warehouseForm.warehouse_name}
                          onChange={(e) => setWarehouseForm(prev => ({ ...prev, warehouse_name: e.target.value }))}
                          placeholder="Enter warehouse name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={warehouseForm.location}
                          onChange={(e) => setWarehouseForm(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Enter warehouse location"
                        />
                      </div>
                      <div>
                        <Label htmlFor="responsible_person">Responsible Person</Label>
                        <Input
                          id="responsible_person"
                          value={warehouseForm.responsible_person}
                          onChange={(e) => setWarehouseForm(prev => ({ ...prev, responsible_person: e.target.value }))}
                          placeholder="Enter responsible person name"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setWarehouseDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingWarehouse ? handleUpdateWarehouse : handleCreateWarehouse}>
                        {editingWarehouse ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search warehouses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
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
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
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
                  <DialogContent className="max-w-2xl">
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
                    <div className="space-y-4 max-h-96 overflow-y-auto">
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
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
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
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Overview</CardTitle>
                  <CardDescription>
                    View current stock levels across all warehouses
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={`${item.product_id}-${item.warehouse_name}`}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>{item.warehouse_name}</TableCell>
                      <TableCell>{item.available_quantity}</TableCell>
                      <TableCell>{item.minimum_stock_level}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.stock_status === 'LOW_STOCK' ? 'destructive' : 
                            item.stock_status === 'REORDER' ? 'secondary' : 
                            'default'
                          }
                        >
                          {item.stock_status === 'LOW_STOCK' ? 'Low Stock' : 
                           item.stock_status === 'REORDER' ? 'Reorder' : 
                           'In Stock'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
