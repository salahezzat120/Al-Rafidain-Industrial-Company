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
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          }).filter(row => Object.values(row).some(value => value !== ''));
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
      template = 'product_name,product_name_ar,product_code,main_group_id,sub_group_id,color_id,material_id,unit_of_measurement_id,description,cost_price,selling_price,weight,dimensions\n';
      template += 'White Plastic Cup,كوب بلاستيك أبيض,CUP-WH-200,1,1,1,1,1,200ml white plastic cup,0.50,1.00,10,200ml\n';
    } else {
      template = 'product_id,warehouse_id,movement_type,quantity,unit_price,reference_number,notes\n';
      template += '1,1,RECEIPT,100,0.50,PO-001,Initial stock\n';
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
                  product_name, product_name_ar, product_code, main_group_id, sub_group_id, color_id, material_id, unit_of_measurement_id, description, cost_price, selling_price, weight, dimensions
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
                            {isRTL ? 'الصف' : 'Row'} {index + 1}: {error.error}
                          </p>
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
