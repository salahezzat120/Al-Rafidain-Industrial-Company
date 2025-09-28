'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, Play, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { generateReport } from '@/lib/warehouse';
import type { ReportData } from '@/types/warehouse';

interface CustomReportBuilderProps {
  onReportGenerated: (report: ReportData) => void;
}

export function CustomReportBuilder({ onReportGenerated }: CustomReportBuilderProps) {
  const { t, isRTL } = useLanguage();
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<Record<string, string[]>>({});
  const [filters, setFilters] = useState<any[]>([]);
  const [sorting, setSorting] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableTables = [
    { id: 'products', name: 'Products', nameAr: 'المنتجات' },
    { id: 'warehouses', name: 'Warehouses', nameAr: 'المستودعات' },
    { id: 'inventory', name: 'Inventory', nameAr: 'المخزون' },
    { id: 'stock_movements', name: 'Stock Movements', nameAr: 'حركات المخزون' },
    { id: 'barcodes', name: 'Barcodes', nameAr: 'الباركود' },
    { id: 'stocktaking', name: 'Stocktaking', nameAr: 'الجرد' }
  ];

  const tableFields: Record<string, string[]> = {
    products: ['id', 'product_name', 'product_code', 'description', 'cost_price', 'sales_price', 'created_at'],
    warehouses: ['id', 'warehouse_name', 'location', 'capacity', 'created_at'],
    inventory: ['id', 'product_id', 'warehouse_id', 'available_quantity', 'minimum_stock_level', 'last_updated'],
    stock_movements: ['id', 'product_id', 'warehouse_id', 'movement_type', 'quantity', 'unit_price', 'created_at'],
    barcodes: ['id', 'product_id', 'barcode_value', 'barcode_type', 'created_at'],
    stocktaking: ['id', 'warehouse_id', 'stocktaking_date', 'status', 'total_items', 'created_at']
  };

  const handleAddTable = (tableId: string) => {
    if (!selectedTables.includes(tableId)) {
      setSelectedTables([...selectedTables, tableId]);
      setSelectedFields({ ...selectedFields, [tableId]: [] });
    }
  };

  const handleRemoveTable = (tableId: string) => {
    setSelectedTables(selectedTables.filter(t => t !== tableId));
    const newSelectedFields = { ...selectedFields };
    delete newSelectedFields[tableId];
    setSelectedFields(newSelectedFields);
  };

  const handleToggleField = (tableId: string, field: string) => {
    const currentFields = selectedFields[tableId] || [];
    const newFields = currentFields.includes(field)
      ? currentFields.filter(f => f !== field)
      : [...currentFields, field];
    
    setSelectedFields({
      ...selectedFields,
      [tableId]: newFields
    });
  };

  const handleAddFilter = () => {
    setFilters([...filters, { field: '', operator: '=', value: '' }]);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleAddSort = () => {
    setSorting([...sorting, { field: '', direction: 'ASC' }]);
  };

  const handleRemoveSort = (index: number) => {
    setSorting(sorting.filter((_, i) => i !== index));
  };

  const handleGenerateCustomReport = async () => {
    if (!reportName || selectedTables.length === 0) return;

    try {
      setLoading(true);
      
      // Create custom report configuration
      const reportConfig = {
        name: reportName,
        description: reportDescription,
        tables: selectedTables,
        fields: selectedFields,
        filters: filters.filter(f => f.field && f.value),
        sorting: sorting.filter(s => s.field)
      };

      // Generate the report using a custom report type
      const reportData = await generateReport('CUSTOM', reportConfig);
      onReportGenerated(reportData);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error generating custom report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Settings className="h-4 w-4 mr-2" />
          {isRTL ? 'إنشاء تقرير مخصص' : 'Create Custom Report'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? 'إنشاء تقرير مخصص' : 'Create Custom Report'}
          </DialogTitle>
          <DialogDescription>
            {isRTL ? 'قم بإنشاء تقرير مخصص باستخدام الجداول والحقول المطلوبة' : 'Create a custom report using the required tables and fields'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportName">
                {isRTL ? 'اسم التقرير' : 'Report Name'}
              </Label>
              <Input
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder={isRTL ? 'أدخل اسم التقرير' : 'Enter report name'}
              />
            </div>
            <div>
              <Label htmlFor="reportDescription">
                {isRTL ? 'وصف التقرير' : 'Report Description'}
              </Label>
              <Textarea
                id="reportDescription"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder={isRTL ? 'أدخل وصف التقرير' : 'Enter report description'}
              />
            </div>
          </div>

          {/* Tables Selection */}
          <div className="space-y-4">
            <Label>{isRTL ? 'الجداول المطلوبة' : 'Required Tables'}</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableTables.map(table => (
                <div key={table.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={table.id}
                    checked={selectedTables.includes(table.id)}
                    onChange={() => selectedTables.includes(table.id) ? handleRemoveTable(table.id) : handleAddTable(table.id)}
                  />
                  <Label htmlFor={table.id}>
                    {isRTL ? table.nameAr : table.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Fields Selection */}
          {selectedTables.map(tableId => {
            const table = availableTables.find(t => t.id === tableId);
            const fields = tableFields[tableId] || [];
            const selectedFieldsForTable = selectedFields[tableId] || [];

            return (
              <div key={tableId} className="space-y-2">
                <Label>
                  {isRTL ? `حقول ${table?.nameAr}` : `${table?.name} Fields`}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {fields.map(field => (
                    <div key={field} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`${tableId}-${field}`}
                        checked={selectedFieldsForTable.includes(field)}
                        onChange={() => handleToggleField(tableId, field)}
                      />
                      <Label htmlFor={`${tableId}-${field}`} className="text-sm">
                        {field}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{isRTL ? 'المرشحات' : 'Filters'}</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddFilter}>
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? 'إضافة مرشح' : 'Add Filter'}
              </Button>
            </div>
            {filters.map((filter, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Select value={filter.field} onValueChange={(value) => {
                  const newFilters = [...filters];
                  newFilters[index].field = value;
                  setFilters(newFilters);
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTables.flatMap(tableId => 
                      (selectedFields[tableId] || []).map(field => (
                        <SelectItem key={`${tableId}-${field}`} value={`${tableId}.${field}`}>
                          {field}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Select value={filter.operator} onValueChange={(value) => {
                  const newFilters = [...filters];
                  newFilters[index].operator = value;
                  setFilters(newFilters);
                }}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="=">=</SelectItem>
                    <SelectItem value="!=">!=</SelectItem>
                    <SelectItem value=">">></SelectItem>
                    <SelectItem value="<"><</SelectItem>
                    <SelectItem value="LIKE">LIKE</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={filter.value}
                  onChange={(e) => {
                    const newFilters = [...filters];
                    newFilters[index].value = e.target.value;
                    setFilters(newFilters);
                  }}
                  placeholder="Value"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFilter(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Sorting */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{isRTL ? 'الترتيب' : 'Sorting'}</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSort}>
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? 'إضافة ترتيب' : 'Add Sort'}
              </Button>
            </div>
            {sorting.map((sort, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Select value={sort.field} onValueChange={(value) => {
                  const newSorting = [...sorting];
                  newSorting[index].field = value;
                  setSorting(newSorting);
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTables.flatMap(tableId => 
                      (selectedFields[tableId] || []).map(field => (
                        <SelectItem key={`${tableId}-${field}`} value={`${tableId}.${field}`}>
                          {field}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Select value={sort.direction} onValueChange={(value) => {
                  const newSorting = [...sorting];
                  newSorting[index].direction = value;
                  setSorting(newSorting);
                }}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASC">Ascending</SelectItem>
                    <SelectItem value="DESC">Descending</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveSort(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleGenerateCustomReport} disabled={loading || !reportName || selectedTables.length === 0}>
            <Play className="h-4 w-4 mr-2" />
            {loading ? (isRTL ? 'جاري الإنشاء...' : 'Generating...') : (isRTL ? 'إنشاء التقرير' : 'Generate Report')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
