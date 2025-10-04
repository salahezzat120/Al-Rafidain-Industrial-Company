'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle, Package, ArrowUpDown } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { 
  bulkUploadProducts,
  bulkStockMovement
} from '@/lib/warehouse';

export function BulkUpload() {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'products' | 'movements'>('products');
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const data = await parseCSVFile(file);
      
      if (activeTab === 'products') {
        const results = await bulkUploadProducts(data);
        setUploadResults(results);
      } else {
        const results = await bulkStockMovement(data);
        setUploadResults(results);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadResults({ success: 0, errors: [{ error: 'Failed to process file' }] });
    } finally {
      setLoading(false);
    }
  };

  const parseCSVFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          
          if (lines.length < 2) {
            reject(new Error('CSV file must contain at least a header row and one data row'));
            return;
          }

          // Parse CSV with proper handling of quoted values
          const parseCSVLine = (line: string): string[] => {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            
            result.push(current.trim());
            return result;
          };

          const headers = parseCSVLine(lines[0]);
          const data = lines.slice(1).map((line, index) => {
            const values = parseCSVLine(line);
            const obj: any = {};
            headers.forEach((header, headerIndex) => {
              obj[header] = values[headerIndex] || '';
            });
            obj._rowNumber = index + 2; // Add row number for error reporting
            return obj;
          }).filter(row => Object.values(row).some(value => value !== '' && value !== '_rowNumber'));

          console.log('Parsed CSV data:', data);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const downloadTemplate = () => {
    let template = '';
    
    if (activeTab === 'products') {
      // Updated template to match the new products table structure
      template = 'product_name,product_name_ar,product_code,stock_number,stock_number_ar,stock,main_group,sub_group,color,material,unit,description,description_ar,cost_price,selling_price,weight,dimensions,expiry_date,serial_number,warehouses,is_active\n';
      template += 'White Plastic Cup,كوب بلاستيك أبيض,CUP-WH-200,ST-001,مخزون-001,100,Plastic Products,Cups,White,Plastic,piece,"200ml white plastic cup","كوب بلاستيك أبيض 200مل",0.50,1.00,10,200ml,2025-12-31,SN001,"Warehouse A",true\n';
      template += 'Blue Plastic Bottle,زجاجة بلاستيك زرقاء,BOTTLE-BL-500,ST-002,مخزون-002,50,Plastic Products,Bottles,Blue,Plastic,piece,"500ml blue plastic bottle","زجاجة بلاستيك زرقاء 500مل",1.20,2.50,25,500ml,2025-12-31,SN002,"Warehouse A",true\n';
      template += 'Red Plastic Plate,طبق بلاستيك أحمر,PLATE-RD-300,ST-003,مخزون-003,75,Plastic Products,Plates,Red,Plastic,piece,"300mm red plastic plate","طبق بلاستيك أحمر 300مم",0.80,1.80,15,300mm,2025-12-31,SN003,"Warehouse B",true\n';
    } else {
      template = 'product_id,warehouse_id,movement_type,quantity,unit_price,reference_number,notes\n';
      template += '1,1,RECEIPT,100,0.50,PO-001,Initial stock\n';
      template += '2,1,RECEIPT,50,1.20,PO-002,New product stock\n';
      template += '3,2,ISSUE,25,0.80,SO-001,Sale to customer\n';
    }

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSuccessRate = () => {
    if (!uploadResults) return 0;
    const total = uploadResults.success + uploadResults.errors.length;
    return total > 0 ? Math.round((uploadResults.success / total) * 100) : 0;
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isRTL ? 'الرفع الجماعي' : 'Bulk Upload'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? 'رفع المنتجات وحركات المخزون بكميات كبيرة' : 'Upload products and stock movements in bulk'}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            {isRTL ? 'المنتجات' : 'Products'}
          </TabsTrigger>
          <TabsTrigger value="movements">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {isRTL ? 'حركات المخزون' : 'Stock Movements'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {isRTL ? 'رفع المنتجات الجماعي' : 'Bulk Product Upload'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'رفع عدة منتجات دفعة واحدة باستخدام ملف CSV' : 'Upload multiple products at once using a CSV file'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="file-upload">{isRTL ? 'اختر ملف CSV' : 'Select CSV File'}</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="mt-2"
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    {isRTL ? 'تحميل القالب' : 'Download Template'}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">
                  {isRTL ? 'تنسيق الملف المطلوب' : 'Required File Format'}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {isRTL ? 'يجب أن يحتوي ملف CSV على الأعمدة التالية:' : 'CSV file must contain the following columns:'}
                </p>
                <div className="text-sm font-mono bg-white p-2 rounded border">
                  product_name, product_name_ar, product_code, stock_number, stock_number_ar, stock, main_group, sub_group, color, material, unit, description, description_ar, cost_price, selling_price, weight, dimensions, expiry_date, serial_number, warehouses, is_active
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p><strong>Required fields:</strong> product_name, main_group, unit, stock</p>
                  <p><strong>Optional fields:</strong> All others can be left empty</p>
                  <p><strong>Date format:</strong> YYYY-MM-DD (e.g., 2025-12-31)</p>
                  <p><strong>Boolean values:</strong> true/false for is_active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                {isRTL ? 'رفع حركات المخزون الجماعي' : 'Bulk Stock Movement Upload'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'رفع عدة حركات مخزون دفعة واحدة باستخدام ملف CSV' : 'Upload multiple stock movements at once using a CSV file'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="file-upload-movements">{isRTL ? 'اختر ملف CSV' : 'Select CSV File'}</Label>
                  <Input
                    id="file-upload-movements"
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="mt-2"
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    {isRTL ? 'تحميل القالب' : 'Download Template'}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">
                  {isRTL ? 'تنسيق الملف المطلوب' : 'Required File Format'}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {isRTL ? 'يجب أن يحتوي ملف CSV على الأعمدة التالية:' : 'CSV file must contain the following columns:'}
                </p>
                <div className="text-sm font-mono bg-white p-2 rounded border">
                  product_id, warehouse_id, movement_type, quantity, unit_price, reference_number, notes
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {isRTL ? 'أنواع الحركة المتاحة: RECEIPT, ISSUE, TRANSFER, RETURN' : 'Available movement types: RECEIPT, ISSUE, TRANSFER, RETURN'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Results */}
      {uploadResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  {isRTL ? 'جاري المعالجة...' : 'Processing...'}
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  {isRTL ? 'نتائج الرفع' : 'Upload Results'}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!loading && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        {isRTL ? 'نجح' : 'Successful'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {uploadResults.success}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">
                        {isRTL ? 'فشل' : 'Failed'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {uploadResults.errors.length}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        {isRTL ? 'معدل النجاح' : 'Success Rate'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {getSuccessRate()}%
                    </p>
                  </div>
                </div>

                {uploadResults.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">
                      {isRTL ? 'الأخطاء' : 'Errors'}
                    </h4>
                    <div className="max-h-40 overflow-y-auto">
                      {uploadResults.errors.map((error: any, index: number) => (
                        <div key={index} className="p-2 bg-red-50 border border-red-200 rounded mb-2">
                          <p className="text-sm text-red-800">
                            {isRTL ? 'الصف' : 'Row'} {error.row?._rowNumber || index + 1}: {error.error}
                          </p>
                          {error.row && (
                            <p className="text-xs text-gray-600 mt-1">
                              {isRTL ? 'البيانات:' : 'Data:'} {JSON.stringify(error.row).substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
