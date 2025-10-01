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
import { Plus, Edit, Trash2, Search, Filter, Warehouse, Package, AlertTriangle, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { 
  getWarehouses, 
  createWarehouse, 
  updateWarehouse, 
  deleteWarehouse,
  getProducts,
  getProductsWithWarehouseInfo,
  createProduct,
  updateProduct,
  deleteProduct,
  getMainGroups,
  getSubGroups,
  getColors,
  getMaterials,
  getUnitsOfMeasurement,
  createUnitOfMeasurement,
  updateUnitOfMeasurement,
  deleteUnitOfMeasurement,
  getWarehouseStats,
  getStockAlerts,
  getInventorySummary
} from '@/lib/warehouse';
import { supabase } from '@/lib/supabase';
import { StockMovements } from '@/components/warehouse/stock-movements';
import { ReportsEngine } from '@/components/warehouse/reports-engine';
import { StocktakingModule } from '@/components/warehouse/stocktaking-module';
import { BulkUpload } from '@/components/warehouse/bulk-upload';
import { WorkflowIntegration } from '@/components/warehouse/workflow-integration';
import { WarehouseFormWithMap } from '@/components/warehouse/warehouse-form-with-map';
import { useLanguage } from '@/contexts/language-context';
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
  const { t, isRTL } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'warehouses' | 'products' | 'movements' | 'reports' | 'stocktaking' | 'bulk-upload' | 'workflow'>('dashboard');
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
    warehouse_name_ar: '',
    location: '',
    location_ar: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    responsible_person: '',
    responsible_person_ar: '',
    warehouse_type: 'DISTRIBUTION',
    capacity: 0,
    contact_phone: '',
    contact_email: ''
  });
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState<CreateProductData>({
    product_name: '',
    product_code: '',
    stock_number: '',
    barcode: '',
    main_group_id: 0,
    sub_group_id: undefined,
    color_id: undefined,
    material_id: undefined,
    unit_of_measurement_id: 0,
    description: '',
    cost_price: undefined,
    selling_price: undefined,
    weight: undefined,
    dimensions: '',
    expiry_date: '',
    serial_number: '',
    warehouses: '',
    specifications: {}
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  
  // Warehouse selection for new products
  const [selectedWarehouses, setSelectedWarehouses] = useState<number[]>([]);

  // Measurement unit form state (bilingual)
  const [unitForm, setUnitForm] = useState<CreateUnitOfMeasurementData>({
    unit_name: '',
    unit_name_ar: '',
    unit_code: '',
    unit_symbol: '',
    unit_symbol_ar: '',
    unit_type: 'COUNT',
    is_user_defined: true
  });
  const [editingUnit, setEditingUnit] = useState<UnitOfMeasurement | null>(null);
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
    
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(() => {
      refreshStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (productForm.main_group_id) {
      loadSubGroups(productForm.main_group_id);
    }
  }, [productForm.main_group_id]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading warehouse data...');
      
      // Load warehouses first to debug
      console.log('📦 Loading warehouses...');
      const warehousesData = await getWarehouses();
      console.log('✅ Warehouses loaded:', warehousesData.length);
      console.log('📋 Warehouse data:', warehousesData);
      
      if (warehousesData.length === 0) {
        console.warn('⚠️ No warehouses found in database');
      }
      
      const [
        productsData,
        inventoryData,
        mainGroupsData,
        colorsData,
        materialsData,
        unitsData,
        statsData,
        alertsData
      ] = await Promise.all([
        getProducts().catch(err => {
          console.error('Error loading products:', err);
          return [];
        }),
        getInventorySummary().catch(err => {
          console.error('Error loading inventory:', err);
          return [];
        }),
        getMainGroups().catch(err => {
          console.error('Error loading main groups:', err);
          return [];
        }),
        getColors().catch(err => {
          console.error('Error loading colors:', err);
          return [];
        }),
        getMaterials().catch(err => {
          console.error('Error loading materials:', err);
          return [];
        }),
        getUnitsOfMeasurement().catch(err => {
          console.error('Error loading units:', err);
          return [];
        }),
        getWarehouseStats().catch(err => {
          console.error('Error loading stats:', err);
          return null;
        }),
        getStockAlerts().catch(err => {
          console.error('Error loading alerts:', err);
          return [];
        })
      ]);

      console.log('Products loaded:', productsData.length);
      console.log('Sample product:', productsData[0]);
      console.log('Main groups loaded:', mainGroupsData.length);
      console.log('Sample main group:', mainGroupsData[0]);
      console.log('Units loaded:', unitsData.length);

      console.log('Warehouses loaded:', warehousesData.length);
      console.log('Sample warehouse:', warehousesData[0]);
      console.log('All warehouses data:', warehousesData);
      
      setWarehouses(warehousesData);
      setProducts(productsData);
      setInventory(inventoryData);
      setMainGroups(mainGroupsData);
      setColors(colorsData);
      setMaterials(materialsData);
      setUnits(unitsData);
      setStats(statsData);
      setAlerts(alertsData);
      
      console.log('✅ All data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      // Get stats data
      const statsData = await getWarehouseStats();
      setStats(statsData);
      
      // Try to get alerts, but don't fail if it doesn't work
      try {
        const alertsData = await getStockAlerts();
        setAlerts(alertsData);
      } catch (alertsError) {
        console.log('Stock alerts disabled - inventory table removed');
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
      // Set default values on error
      setStats({
        total_warehouses: 0,
        total_products: 0,
        total_inventory_value: 0,
        low_stock_items: 0,
        out_of_stock_items: 0
      });
      setAlerts([]);
    }
  };

  const loadSubGroups = async (mainGroupId: number) => {
    try {
      console.log(`🔄 Loading sub groups for main group ID: ${mainGroupId}...`);
      const subGroupsData = await getSubGroups(mainGroupId);
      console.log(`✅ Sub groups loaded: ${subGroupsData.length} records`);
      if (subGroupsData.length > 0) {
        console.log('📋 Sample sub group:', subGroupsData[0]);
      }
      setSubGroups(subGroupsData);
    } catch (error) {
      console.error('❌ Error loading sub groups:', error);
      setSubGroups([]); // Clear sub groups on error
    }
  };

  const handleCreateWarehouse = async (formData: CreateWarehouseData) => {
    try {
      await createWarehouse(formData);
      setWarehouseDialogOpen(false);
      await loadData(); // Reload all data including stats
      await refreshStats(); // Also refresh stats specifically
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleUpdateWarehouse = async (formData: CreateWarehouseData) => {
    if (!editingWarehouse) return;
    
    try {
      await updateWarehouse({ id: editingWarehouse.id, ...formData });
      setEditingWarehouse(null);
      setWarehouseDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error updating warehouse:', error);
      throw error; // Re-throw to let the form handle the error
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
      // Validate required fields
      if (!productForm.product_name || productForm.product_name.trim() === '') {
        alert('Product name is required');
        return;
      }
      
      // Generate unique product code if not provided
      let finalProductCode = productForm.product_code;
      if (!finalProductCode || finalProductCode.trim() === '') {
        const existingProducts = await getProducts();
        const existingCodes = existingProducts.map(p => p.product_code).filter(Boolean);
        let counter = 1;
        do {
          finalProductCode = `PROD-${String(counter).padStart(4, '0')}`;
          counter++;
        } while (existingCodes.includes(finalProductCode));
        
        console.log(`Generated unique product code: ${finalProductCode}`);
      } else {
        // Check for duplicate product code if provided
        const existingProducts = await getProducts();
        const duplicateProduct = existingProducts.find(p => 
          p.product_code && p.product_code.toLowerCase() === finalProductCode.toLowerCase()
        );
        
        if (duplicateProduct) {
          alert(`Product code "${finalProductCode}" already exists. Please use a different product code.`);
          return;
        }
      }
      
      // Update the form with the final product code
      const finalProductForm = {
        ...productForm,
        product_code: finalProductCode
      };
      
      const newProduct = await createProduct(finalProductForm);
      
      // Update product with warehouse information if warehouses were selected
      if (selectedWarehouses.length > 0) {
        console.log('Selected warehouses:', selectedWarehouses);
        console.log('Available warehouses:', warehouses);
        
        const warehouseNames = warehouses
          .filter(w => selectedWarehouses.includes(w.id))
          .map(w => w.warehouse_name)
          .join(', ');
        
        console.log('Warehouse names to update:', warehouseNames);
        
        // Update the product with warehouse information
        await updateProduct({
          id: newProduct.id,
          warehouses: warehouseNames
        });
      }
      
      setProductForm({
        product_name: '',
        product_code: '',
        stock_number: '',
        barcode: '',
        main_group_id: 0,
        sub_group_id: undefined,
        color_id: undefined,
        material_id: undefined,
        unit_of_measurement_id: 0,
        description: '',
        cost_price: undefined,
        selling_price: undefined,
        weight: undefined,
        dimensions: '',
        expiry_date: '',
        serial_number: '',
        warehouses: '',
        specifications: {}
      });
      setSelectedWarehouses([]);
      setProductDialogOpen(false);
      await loadData(); // Reload all data including stats
      await refreshStats(); // Also refresh stats specifically
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
        stock_number: '',
        barcode: '',
        main_group_id: 0,
        sub_group_id: undefined,
        color_id: undefined,
        material_id: undefined,
        unit_of_measurement_id: 0,
        description: '',
        cost_price: undefined,
        selling_price: undefined,
        weight: undefined,
        dimensions: '',
        expiry_date: '',
        serial_number: '',
        warehouses: '',
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

  // Measurement Unit Handlers
  const createUnitViaFallback = async (payload: CreateUnitOfMeasurementData) => {
    const tableCandidates = ['units_of_measurement', 'measurement_units', 'units'];
    const payloadCandidates: any[] = [
      { unit_name: payload.unit_name, unit_code: payload.unit_code, is_user_defined: payload.is_user_defined ?? true },
      { unit_name: payload.unit_name, unit_symbol: payload.unit_code, is_user_defined: payload.is_user_defined ?? true },
      { unit_name: payload.unit_name }
    ];

    for (const table of tableCandidates) {
      for (const body of payloadCandidates) {
        const { data, error } = await supabase.from(table).insert([body]).select('*');
        if (!error && data && data.length > 0) {
          return true;
        }
      }
    }
    return false;
  };

  const deleteUnitViaFallback = async (unit: UnitOfMeasurement) => {
    const tableCandidates = ['units_of_measurement', 'measurement_units', 'units'];
    const possiblePkKeys = ['id', 'unit_id', 'UID'];

    for (const table of tableCandidates) {
      // 1) Try to find the row to learn the actual PK column
      const findFilters = [
        { column: 'id', value: unit.id },
        { column: 'unit_name', value: unit.unit_name },
        { column: 'unit_code', value: unit.unit_code },
        { column: 'unit_symbol', value: unit.unit_code },
      ];

      let foundRow: any = null;
      for (const f of findFilters) {
        if (f.value === undefined || f.value === null || f.value === '') continue;
        const { data, error } = await supabase.from(table).select('*').eq(f.column, f.value).limit(1);
        if (!error && data && data.length > 0) {
          foundRow = data[0];
          break;
        }
      }

      // 2) If found, try deleting by discovered PK key
      if (foundRow) {
        const pkKey = possiblePkKeys.find((k) => Object.prototype.hasOwnProperty.call(foundRow, k));
        if (pkKey) {
          const { error } = await supabase.from(table).delete().eq(pkKey, foundRow[pkKey]);
          if (!error) return true;
        }
      }

      // 3) Otherwise try direct deletes by known columns
      let { error } = await supabase.from(table).delete().eq('id', unit.id);
      if (!error) return true;
      ({ error } = await supabase.from(table).delete().eq('unit_name', unit.unit_name));
      if (!error) return true;
      if (unit.unit_code) {
        ({ error } = await supabase.from(table).delete().eq('unit_code', unit.unit_code));
        if (!error) return true;
        ({ error } = await supabase.from(table).delete().eq('unit_symbol', unit.unit_code));
        if (!error) return true;
      }
    }
    return false;
  };

  const handleCreateUnit = async () => {
    try {
      // Try fallback FIRST to avoid library schema mismatches
      const ok = await createUnitViaFallback(unitForm);
      if (ok) {
        setUnitForm({ 
          unit_name: '', 
          unit_name_ar: '',
          unit_code: '', 
          unit_symbol: '',
          unit_symbol_ar: '',
          unit_type: 'COUNT',
          is_user_defined: true 
        });
        setUnitDialogOpen(false);
        loadData();
      } else {
        // If fallback fails, try the library function as a secondary attempt
        try {
          await createUnitOfMeasurement(unitForm);
          setUnitForm({ 
          unit_name: '', 
          unit_name_ar: '',
          unit_code: '', 
          unit_symbol: '',
          unit_symbol_ar: '',
          unit_type: 'COUNT',
          is_user_defined: true 
        });
          setUnitDialogOpen(false);
          loadData();
        } catch (error2) {
          console.error('Error creating unit (library after fallback):', error2);
          alert('Failed to create unit. Please ensure the measurement units table exists.');
        }
      }
    } catch (error) {
      console.error('Unexpected error creating unit:', error);
      alert('Failed to create unit.');
    }
  };

  const handleUpdateUnit = async () => {
    if (!editingUnit) return;
    
    try {
      await updateUnitOfMeasurement(editingUnit.id, unitForm);
      setEditingUnit(null);
      setUnitForm({ unit_name: '', unit_code: '', is_user_defined: true });
      setUnitDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error updating unit:', error);
    }
  };

  const handleDeleteUnit = async (unit: UnitOfMeasurement) => {
    if (!confirm('Are you sure you want to delete this measurement unit?')) return;
    
    try {
      // Try fallback FIRST to avoid library schema mismatches
      const ok = await deleteUnitViaFallback(unit);
      if (ok) {
        loadData();
      } else {
        try {
          await deleteUnitOfMeasurement(unit.id);
          loadData();
        } catch (error2) {
          console.error('Error deleting unit (library after fallback):', error2);
          alert('Failed to delete unit.');
        }
      }
    } catch (error) {
      console.error('Unexpected error deleting unit:', error);
      alert('Failed to delete unit.');
    }
  };

  const openUnitDialog = (unit?: UnitOfMeasurement) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitForm({
        unit_name: unit.unit_name,
        unit_name_ar: unit.unit_name_ar || '',
        unit_code: unit.unit_code,
        unit_symbol: unit.unit_symbol || '',
        unit_symbol_ar: unit.unit_symbol_ar || '',
        unit_type: unit.unit_type || 'COUNT',
        is_user_defined: unit.is_user_defined
      });
    } else {
      setEditingUnit(null);
      setUnitForm({ 
        unit_name: '', 
        unit_name_ar: '',
        unit_code: '', 
        unit_symbol: '',
        unit_symbol_ar: '',
        unit_type: 'COUNT',
        is_user_defined: true 
      });
    }
    setUnitDialogOpen(true);
  };

  const openWarehouseDialog = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setWarehouseForm({
        warehouse_name: warehouse.warehouse_name,
        location: warehouse.location,
      });
    } else {
      setEditingWarehouse(null);
      setWarehouseForm({ warehouse_name: '', location: '' });
    }
    setWarehouseDialogOpen(true);
  };

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        product_name: product.product_name,
        product_code: product.product_code || '',
        stock_number: product.stock_number || '',
        barcode: product.barcode || '',
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
        stock_number: '',
        barcode: '',
        main_group_id: 0,
        sub_group_id: undefined,
        color_id: undefined,
        material_id: undefined,
        unit_of_measurement_id: 0,
        description: '',
        cost_price: undefined,
        selling_price: undefined,
        weight: undefined,
        dimensions: '',
        expiry_date: '',
        serial_number: '',
        warehouses: '',
        specifications: {}
      });
    }
    setSelectedWarehouses([]);
    setProductDialogOpen(true);
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.main_group?.group_name.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            🏭 {t('warehouse.warehouseManagement')}
          </h2>
          <p className="text-muted-foreground">
            {t('warehouse.warehouseManagementDescription')}
          </p>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={(value) => setActiveSubTab(value as any)}>
         <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-1 p-1">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm px-2 py-2">
            {t('warehouse.dashboard')}
          </TabsTrigger>
          <TabsTrigger value="warehouses" className="text-xs sm:text-sm px-2 py-2">
            {t('warehouse.warehouses')}
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs sm:text-sm px-2 py-2">
            {t('warehouse.products')}
          </TabsTrigger>
          <TabsTrigger value="measurement-units" className="text-xs sm:text-sm px-2 py-2">
            {isRTL ? 'وحدات القياس' : 'Measurement Units'}
          </TabsTrigger>
           <TabsTrigger value="movements" className="text-xs sm:text-sm px-2 py-2">
             {t('warehouse.stockMovements')}
           </TabsTrigger>
           <TabsTrigger value="reports" className="text-xs sm:text-sm px-2 py-2">
            {t('warehouse.reports')}
          </TabsTrigger>
          <TabsTrigger value="stocktaking" className="text-xs sm:text-sm px-2 py-2">
            {t('warehouse.stocktaking')}
          </TabsTrigger>
          <TabsTrigger value="bulk-upload" className="text-xs sm:text-sm px-2 py-2">
            {t('warehouse.bulkUpload')}
          </TabsTrigger>
          <TabsTrigger value="workflow" className="text-xs sm:text-sm px-2 py-2">
            {t('warehouse.workflow')}
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Dashboard Header with Refresh Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t('warehouse.dashboard')}</h2>
            <Button 
              onClick={refreshStats} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('common.refresh')}
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('warehouse.totalWarehouses')}</CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_warehouses || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t('warehouse.activeWarehouseLocations')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('warehouse.totalProducts')}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t('warehouse.activeProductsInInventory')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('warehouse.totalInventory')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_inventory_value || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t('warehouse.totalUnitsInStock')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('warehouse.lowStockItems')}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats?.low_stock_items || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t('warehouse.itemsBelowMinimumStock')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                {t('warehouse.stockAlerts')}
              </CardTitle>
              <CardDescription>
                {t('warehouse.productsNeedAttention')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('warehouse.noStockAlerts')}</p>
                  <p className="text-sm">{t('warehouse.allProductsWellStocked')}</p>
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
                          {alert.alert_type === 'LOW_STOCK' ? t('warehouse.lowStock') : t('warehouse.outOfStock')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {alerts.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm">
                        {t('warehouse.viewAllAlerts')} ({alerts.length})
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
                <Button onClick={() => openWarehouseDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Warehouse
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Debug Information */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
                  <p><strong>Debug Info:</strong></p>
                  <p>Total warehouses: {warehouses.length}</p>
                  <p>Filtered warehouses: {filteredWarehouses.length}</p>
                  <p>Loading: {loading ? 'Yes' : 'No'}</p>
                  <p>Search term: "{searchTerm}"</p>
                </div>
              )}
              
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
                <Button variant="outline" onClick={() => {
                  console.log('🔄 Manual refresh clicked');
                  loadData();
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
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
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Warehouse className="h-12 w-12 text-muted-foreground" />
                          <p className="text-muted-foreground">No warehouses found</p>
                          <p className="text-sm text-muted-foreground">
                            {loading ? 'Loading warehouses...' : 'Create your first warehouse to get started'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredWarehouses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-12 w-12 text-muted-foreground" />
                          <p className="text-muted-foreground">No warehouses match your search</p>
                          <p className="text-sm text-muted-foreground">
                            Try adjusting your search terms
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWarehouses.map((warehouse) => (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">{warehouse.warehouse_name}</TableCell>
                        <TableCell>{warehouse.location}</TableCell>
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
                    ))
                  )}
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
                          <Label htmlFor="stock_number">Stock Number</Label>
                          <Input
                            id="stock_number"
                            value={productForm.stock_number || ''}
                            onChange={(e) => setProductForm(prev => ({ ...prev, stock_number: e.target.value }))}
                            placeholder="Enter stock number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="barcode">Barcode</Label>
                          <Input
                            id="barcode"
                            value={productForm.barcode || ''}
                            onChange={(e) => setProductForm(prev => ({ ...prev, barcode: e.target.value }))}
                            placeholder="Enter barcode"
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
                              {mainGroups.length > 0 ? (
                                mainGroups.map((group) => (
                                  <SelectItem key={group.id} value={group.id.toString()}>
                                    {group.group_name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-data" disabled>
                                  No main groups found - check database
                                </SelectItem>
                              )}
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
                              {subGroups.length > 0 ? (
                                subGroups.map((subGroup) => (
                                  <SelectItem key={subGroup.id} value={subGroup.id.toString()}>
                                    {subGroup.sub_group_name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-data" disabled>
                                  {productForm.main_group_id > 0 
                                    ? "No sub groups found for selected main group" 
                                    : "Select a main group first"
                                  }
                                </SelectItem>
                              )}
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

                      {/* Price Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cost_price">Cost Price</Label>
                          <Input
                            id="cost_price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={productForm.cost_price || ''}
                            onChange={(e) => setProductForm(prev => ({ 
                              ...prev, 
                              cost_price: e.target.value ? parseFloat(e.target.value) : undefined 
                            }))}
                            placeholder="Enter cost price"
                          />
                        </div>
                        <div>
                          <Label htmlFor="selling_price">Selling Price</Label>
                          <Input
                            id="selling_price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={productForm.selling_price || ''}
                            onChange={(e) => setProductForm(prev => ({ 
                              ...prev, 
                              selling_price: e.target.value ? parseFloat(e.target.value) : undefined 
                            }))}
                            placeholder="Enter selling price"
                          />
                        </div>
                      </div>

                      {/* Additional Product Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            step="0.01"
                            min="0"
                            value={productForm.weight || ''}
                            onChange={(e) => setProductForm(prev => ({ 
                              ...prev, 
                              weight: e.target.value ? parseFloat(e.target.value) : undefined 
                            }))}
                            placeholder="Enter weight"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dimensions">Dimensions</Label>
                          <Input
                            id="dimensions"
                            value={productForm.dimensions}
                            onChange={(e) => setProductForm(prev => ({ ...prev, dimensions: e.target.value }))}
                            placeholder="e.g., 10x20x30 cm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry_date">Expiry Date</Label>
                          <Input
                            id="expiry_date"
                            type="date"
                            value={productForm.expiry_date}
                            onChange={(e) => setProductForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="serial_number">Serial Number</Label>
                          <Input
                            id="serial_number"
                            value={productForm.serial_number}
                            onChange={(e) => setProductForm(prev => ({ ...prev, serial_number: e.target.value }))}
                            placeholder="Enter serial number"
                          />
                        </div>
                      </div>


                      {/* Warehouse Selection - Only for new products */}
                      {!editingProduct && (
                        <div className="border-t pt-4 bg-gray-50 p-4 rounded-lg">
                          <div className="bg-blue-500 text-white p-2 rounded mb-2">
                            🏭 Warehouse Storage Selection
                          </div>
                          <Label className="text-lg font-semibold">🏭 Warehouse Storage</Label>
                          <p className="text-sm text-muted-foreground mb-3">
                            Select which warehouses will store this product and set initial quantities.
                          </p>
                          <div className="text-xs text-blue-600 mb-2 font-bold">
                            🔍 Available: {warehouses.length} warehouses
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
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <label htmlFor={`warehouse-${warehouse.id}`} className="flex-1 cursor-pointer">
                                    <div className="font-medium">{warehouse.warehouse_name}</div>
                                    <div className="text-sm text-muted-foreground">{warehouse.location}</div>
                                  </label>
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
                      )}
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
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Selling Price</TableHead>
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
                        <Badge variant="secondary">{product.main_group}</Badge>
                      </TableCell>
                      <TableCell>{product.sub_group || '-'}</TableCell>
                      <TableCell>{product.color || '-'}</TableCell>
                      <TableCell>{product.material || '-'}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>
                        {product.cost_price ? `$${product.cost_price.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        {product.selling_price ? `$${product.selling_price.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.warehouses ? (
                            product.warehouses.split(',').map((warehouse, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {warehouse.trim()}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">No warehouses</span>
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
        </TabsContent>

        {/* Measurement Units Tab */}
        <TabsContent value="measurement-units" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isRTL ? 'وحدات القياس' : 'Measurement Units'}</CardTitle>
                  <CardDescription>
                    {isRTL ? 'إدارة وحدات القياس للمنتجات' : 'Manage measurement units for products'}
                  </CardDescription>
                </div>
                <Button onClick={() => openUnitDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isRTL ? 'إضافة وحدة' : 'Add Unit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={isRTL ? 'البحث في الوحدات...' : 'Search units...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? 'اسم الوحدة' : 'Unit Name'}</TableHead>
                      <TableHead>{isRTL ? 'الاسم العربي' : 'Arabic Name'}</TableHead>
                      <TableHead>{isRTL ? 'رمز الوحدة' : 'Unit Code'}</TableHead>
                      <TableHead>{isRTL ? 'النوع' : 'Type'}</TableHead>
                      <TableHead className="text-right">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {units
                      .filter(unit => 
                        unit.unit_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (unit.unit_name_ar && unit.unit_name_ar.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        unit.unit_code.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-medium">{unit.unit_name}</TableCell>
                          <TableCell>{unit.unit_name_ar || '-'}</TableCell>
                          <TableCell>{unit.unit_code}</TableCell>
                          <TableCell>
                            <Badge variant={unit.is_user_defined ? "default" : "secondary"}>
                              {unit.is_user_defined ? (isRTL ? "محدد من المستخدم" : "User Defined") : (isRTL ? "النظام" : "System")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openUnitDialog(unit)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {unit.is_user_defined && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteUnit(unit)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Unit Dialog */}
          <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUnit ? (isRTL ? 'تعديل وحدة القياس' : 'Edit Measurement Unit') : (isRTL ? 'إضافة وحدة قياس جديدة' : 'Add New Measurement Unit')}
                </DialogTitle>
                <DialogDescription>
                  {editingUnit ? (isRTL ? 'تحديث تفاصيل وحدة القياس.' : 'Update the measurement unit details.') : (isRTL ? 'إضافة وحدة قياس جديدة إلى النظام.' : 'Add a new measurement unit to the system.')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="unit_name">{isRTL ? 'اسم الوحدة (إنجليزي)' : 'Unit Name (English)'}</Label>
                  <Input
                    id="unit_name"
                    value={unitForm.unit_name}
                    onChange={(e) => setUnitForm(prev => ({ ...prev, unit_name: e.target.value }))}
                    placeholder={isRTL ? 'أدخل اسم الوحدة (مثل: كيلوغرام، لتر)' : 'Enter unit name (e.g., Kilogram, Liter)'}
                  />
                </div>
                <div>
                  <Label htmlFor="unit_name_ar">{isRTL ? 'اسم الوحدة (عربي)' : 'Unit Name (Arabic)'}</Label>
                  <Input
                    id="unit_name_ar"
                    value={unitForm.unit_name_ar || ''}
                    onChange={(e) => setUnitForm(prev => ({ ...prev, unit_name_ar: e.target.value }))}
                    placeholder={isRTL ? 'أدخل الاسم العربي للوحدة (مثل: كيلوغرام، لتر)' : 'Enter Arabic unit name (e.g., كيلوغرام، لتر)'}
                  />
                </div>
                <div>
                  <Label htmlFor="unit_code">{isRTL ? 'رمز الوحدة' : 'Unit Code'}</Label>
                  <Input
                    id="unit_code"
                    value={unitForm.unit_code}
                    onChange={(e) => setUnitForm(prev => ({ ...prev, unit_code: e.target.value }))}
                    placeholder={isRTL ? 'أدخل رمز الوحدة (مثل: كغ، ل)' : 'Enter unit code (e.g., KG, L)'}
                  />
                </div>
                <div>
                  <Label htmlFor="unit_symbol">{isRTL ? 'رمز الوحدة (عربي)' : 'Unit Symbol (Arabic)'}</Label>
                  <Input
                    id="unit_symbol"
                    value={unitForm.unit_symbol || ''}
                    onChange={(e) => setUnitForm(prev => ({ ...prev, unit_symbol: e.target.value }))}
                    placeholder={isRTL ? 'أدخل الرمز العربي (مثل: كغ، ل)' : 'Enter Arabic symbol (e.g., كغ، ل)'}
                  />
                </div>
                <div>
                  <Label htmlFor="unit_type">{isRTL ? 'نوع الوحدة' : 'Unit Type'}</Label>
                  <Select
                    value={unitForm.unit_type || 'COUNT'}
                    onValueChange={(value) => setUnitForm(prev => ({ ...prev, unit_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COUNT">{isRTL ? 'عدد' : 'Count'}</SelectItem>
                      <SelectItem value="WEIGHT">{isRTL ? 'وزن' : 'Weight'}</SelectItem>
                      <SelectItem value="VOLUME">{isRTL ? 'حجم' : 'Volume'}</SelectItem>
                      <SelectItem value="LENGTH">{isRTL ? 'طول' : 'Length'}</SelectItem>
                      <SelectItem value="AREA">{isRTL ? 'مساحة' : 'Area'}</SelectItem>
                      <SelectItem value="TIME">{isRTL ? 'وقت' : 'Time'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUnitDialogOpen(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={editingUnit ? handleUpdateUnit : handleCreateUnit}>
                  {editingUnit ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إنشاء' : 'Create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>


        {/* Stock Movements Tab */}
        <TabsContent value="movements" className="space-y-6">
          <StockMovements />
        </TabsContent>


        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <ReportsEngine />
        </TabsContent>

        {/* Stocktaking Tab */}
        <TabsContent value="stocktaking" className="space-y-6">
          <StocktakingModule />
        </TabsContent>

        {/* Bulk Upload Tab */}
        <TabsContent value="bulk-upload" className="space-y-6">
          <BulkUpload />
        </TabsContent>

        {/* Workflow Integration Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <WorkflowIntegration />
        </TabsContent>

      </Tabs>

      {/* Warehouse Form with Map */}
      <WarehouseFormWithMap
        isOpen={warehouseDialogOpen}
        onClose={() => {
          setWarehouseDialogOpen(false);
          setEditingWarehouse(null);
        }}
        onSave={editingWarehouse ? handleUpdateWarehouse : handleCreateWarehouse}
        editingWarehouse={editingWarehouse}
      />
    </div>
  );
}
