'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
    <Button 
      className="w-full" 
      onClick={() => setDialogOpen(true)}
    >
      <Settings className="h-4 w-4 mr-2" />
      {isRTL ? 'إنشاء تقرير مخصص' : 'Create Custom Report'}
    </Button>
  );
}
