import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, Calendar as CalendarIcon, X, Search, Package, Warehouse, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/language-context';
import type { StockMovement, Product, Warehouse as WarehouseType } from '@/types/warehouse';

export interface StockMovementFilters {
  searchTerm?: string;
  movementType?: string;
  warehouseId?: number;
  productId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  referenceNumber?: string;
}

interface StockMovementsFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: StockMovementFilters) => void;
  onClearFilters: () => void;
  movements: StockMovement[];
  products: Product[];
  warehouses: WarehouseType[];
  currentFilters: StockMovementFilters;
}

export function StockMovementsFilter({
  isOpen,
  onClose,
  onApplyFilters,
  onClearFilters,
  movements,
  products,
  warehouses,
  currentFilters
}: StockMovementsFilterProps) {
  const { t, isRTL } = useLanguage();
  const [filters, setFilters] = useState<StockMovementFilters>(currentFilters);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: currentFilters.dateFrom,
    to: currentFilters.dateTo,
  });

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: StockMovementFilters = {};
    setFilters(clearedFilters);
    setDateRange({ from: undefined, to: undefined });
    onClearFilters();
    onClose();
  };

  const getMovementTypeOptions = () => {
    const types = [...new Set(movements.map(m => m.movement_type))];
    return types.map(type => ({
      value: type,
      label: isRTL ? 
        (type === 'RECEIPT' ? 'إضافة' :
         type === 'ISSUE' ? 'صرف' :
         type === 'TRANSFER' ? 'تحويل' : 
         type === 'IN' ? 'دخول' :
         type === 'OUT' ? 'خروج' : 'إرجاع') :
        type
    }));
  };

  const getStatusOptions = () => {
    const statuses = [...new Set(movements.map(m => m.status || 'Active'))];
    return statuses.map(status => ({
      value: status,
      label: isRTL ? 
        (status === 'APPROVED' ? 'معتمد' :
         status === 'PENDING' ? 'معلق' :
         status === 'REJECTED' ? 'مرفوض' : 'نشط') :
        status
    }));
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.movementType) count++;
    if (filters.warehouseId) count++;
    if (filters.productId) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.status) count++;
    if (filters.referenceNumber) count++;
    return count;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {isRTL ? 'تصفية حركات المخزون' : 'Filter Stock Movements'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">{isRTL ? 'البحث' : 'Search'}</Label>
              <Input
                id="search"
                placeholder={isRTL ? 'البحث في المنتجات والمستودعات...' : 'Search in products and warehouses...'}
                value={filters.searchTerm || ''}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="reference">{isRTL ? 'رقم المرجع' : 'Reference Number'}</Label>
              <Input
                id="reference"
                placeholder={isRTL ? 'رقم المرجع...' : 'Reference number...'}
                value={filters.referenceNumber || ''}
                onChange={(e) => setFilters({ ...filters, referenceNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Movement Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{isRTL ? 'نوع الحركة' : 'Movement Type'}</Label>
              <Select
                value={filters.movementType || 'all'}
                onValueChange={(value) => setFilters({ ...filters, movementType: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر نوع الحركة' : 'Select movement type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'جميع الأنواع' : 'All Types'}</SelectItem>
                  {getMovementTypeOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{isRTL ? 'الحالة' : 'Status'}</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر الحالة' : 'Select status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'جميع الحالات' : 'All Statuses'}</SelectItem>
                  {getStatusOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Warehouse and Product */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{isRTL ? 'المستودع' : 'Warehouse'}</Label>
              <Select
                value={filters.warehouseId?.toString() || 'all'}
                onValueChange={(value) => setFilters({ ...filters, warehouseId: value === 'all' ? undefined : parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر المستودع' : 'Select warehouse'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'جميع المستودعات' : 'All Warehouses'}</SelectItem>
                  {warehouses.map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                      {isRTL ? (warehouse.warehouse_name_ar || warehouse.warehouse_name) : warehouse.warehouse_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{isRTL ? 'المنتج' : 'Product'}</Label>
              <Select
                value={filters.productId?.toString() || 'all'}
                onValueChange={(value) => setFilters({ ...filters, productId: value === 'all' ? undefined : parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر المنتج' : 'Select product'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'جميع المنتجات' : 'All Products'}</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {isRTL ? (product.product_name_ar || product.product_name) : product.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <Label>{isRTL ? 'نطاق التاريخ' : 'Date Range'}</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'من تاريخ' : 'From Date'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, 'PPP') : (isRTL ? 'اختر التاريخ' : 'Select date')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => {
                        setDateRange(prev => ({ ...prev, from: date }));
                        setFilters({ ...filters, dateFrom: date });
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>{isRTL ? 'إلى تاريخ' : 'To Date'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, 'PPP') : (isRTL ? 'اختر التاريخ' : 'Select date')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => {
                        setDateRange(prev => ({ ...prev, to: date }));
                        setFilters({ ...filters, dateTo: date });
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="space-y-2">
            <Label>{isRTL ? 'فترات سريعة' : 'Quick Date Presets'}</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setDateRange({ from: today, to: today });
                  setFilters({ ...filters, dateFrom: today, dateTo: today });
                }}
              >
                {isRTL ? 'اليوم' : 'Today'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  setDateRange({ from: yesterday, to: yesterday });
                  setFilters({ ...filters, dateFrom: yesterday, dateTo: yesterday });
                }}
              >
                {isRTL ? 'أمس' : 'Yesterday'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today);
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  setDateRange({ from: weekAgo, to: today });
                  setFilters({ ...filters, dateFrom: weekAgo, dateTo: today });
                }}
              >
                {isRTL ? 'آخر 7 أيام' : 'Last 7 Days'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const monthAgo = new Date(today);
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  setDateRange({ from: monthAgo, to: today });
                  setFilters({ ...filters, dateFrom: monthAgo, dateTo: today });
                }}
              >
                {isRTL ? 'آخر 30 يوم' : 'Last 30 Days'}
              </Button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {getFilterCount() > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{isRTL ? 'التصفيات النشطة' : 'Active Filters'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {filters.searchTerm && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Search className="h-3 w-3" />
                      {filters.searchTerm}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters({ ...filters, searchTerm: undefined })}
                      />
                    </Badge>
                  )}
                  {filters.movementType && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <ArrowUpDown className="h-3 w-3" />
                      {filters.movementType}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters({ ...filters, movementType: undefined })}
                      />
                    </Badge>
                  )}
                  {filters.warehouseId && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Warehouse className="h-3 w-3" />
                      {warehouses.find(w => w.id === filters.warehouseId)?.warehouse_name}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters({ ...filters, warehouseId: undefined })}
                      />
                    </Badge>
                  )}
                  {filters.productId && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {products.find(p => p.id === filters.productId)?.product_name}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters({ ...filters, productId: undefined })}
                      />
                    </Badge>
                  )}
                  {(filters.dateFrom || filters.dateTo) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {filters.dateFrom && filters.dateTo 
                        ? `${format(filters.dateFrom, 'MMM dd')} - ${format(filters.dateTo, 'MMM dd')}`
                        : filters.dateFrom 
                        ? `From ${format(filters.dateFrom, 'MMM dd')}`
                        : `Until ${format(filters.dateTo!, 'MMM dd')}`
                      }
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => {
                          setFilters({ ...filters, dateFrom: undefined, dateTo: undefined });
                          setDateRange({ from: undefined, to: undefined });
                        }}
                      />
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              {isRTL ? 'مسح التصفيات' : 'Clear Filters'}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleApplyFilters}>
                <Filter className="h-4 w-4 mr-2" />
                {isRTL ? 'تطبيق التصفيات' : 'Apply Filters'}
                {getFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getFilterCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
