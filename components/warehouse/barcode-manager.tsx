'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, QrCode, Download, Print } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { 
  getProducts,
  generateBarcode
} from '@/lib/warehouse';
import type { 
  Product, 
  Barcode
} from '@/types/warehouse';

export function BarcodeManager() {
  const { t, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [barcodes, setBarcodes] = useState<Barcode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [barcodeType, setBarcodeType] = useState<'CODE128' | 'QR_CODE' | 'EAN13'>('CODE128');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBarcode = async () => {
    if (!selectedProduct) return;

    try {
      const barcode = await generateBarcode(selectedProduct.id, barcodeType);
      setBarcodes(prev => [barcode, ...prev]);
      setDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error generating barcode:', error);
    }
  };

  const handlePrintBarcode = (barcode: Barcode) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Barcode - ${barcode.product?.product_name}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .barcode-container { margin: 20px 0; }
              .product-info { margin: 10px 0; }
              .barcode-value { font-family: monospace; font-size: 14px; margin: 10px 0; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              <div class="product-info">
                <h3>${isRTL ? barcode.product?.product_name_ar : barcode.product?.product_name}</h3>
                <p>${isRTL ? 'كود المنتج' : 'Product Code'}: ${barcode.product?.product_code}</p>
              </div>
              <div class="barcode-value">
                ${barcode.barcode_value}
              </div>
              <div style="font-size: 12px; margin-top: 10px;">
                ${isRTL ? 'تم إنشاؤه في' : 'Generated on'}: ${new Date().toLocaleDateString()}
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isRTL ? 'إدارة الباركود' : 'Barcode Management'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? 'إنشاء وطباعة الباركود للمنتجات' : 'Generate and print barcodes for products'}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {isRTL ? 'إنشاء باركود' : 'Generate Barcode'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إنشاء باركود جديد' : 'Generate New Barcode'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'اختر المنتج ونوع الباركود المراد إنشاؤه' : 'Select product and barcode type to generate'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="product">{isRTL ? 'المنتج' : 'Product'}</Label>
                <Select
                  value={selectedProduct?.id.toString() || ''}
                  onValueChange={(value) => {
                    const product = products.find(p => p.id.toString() === value);
                    setSelectedProduct(product || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'اختر المنتج' : 'Select product'} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {isRTL ? product.product_name_ar : product.product_name} ({product.product_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="barcode_type">{isRTL ? 'نوع الباركود' : 'Barcode Type'}</Label>
                <Select
                  value={barcodeType}
                  onValueChange={(value: any) => setBarcodeType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CODE128">CODE128</SelectItem>
                    <SelectItem value="QR_CODE">QR Code</SelectItem>
                    <SelectItem value="EAN13">EAN13</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">
                    {isRTL ? 'تفاصيل المنتج' : 'Product Details'}
                  </h4>
                  <p><strong>{isRTL ? 'الاسم' : 'Name'}:</strong> {isRTL ? selectedProduct.product_name_ar : selectedProduct.product_name}</p>
                  <p><strong>{isRTL ? 'الكود' : 'Code'}:</strong> {selectedProduct.product_code}</p>
                  <p><strong>{isRTL ? 'السعر' : 'Price'}:</strong> ${selectedProduct.selling_price}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={handleGenerateBarcode}
                disabled={!selectedProduct}
              >
                <QrCode className="h-4 w-4 mr-2" />
                {isRTL ? 'إنشاء الباركود' : 'Generate Barcode'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isRTL ? 'البحث في المنتجات...' : 'Search products...'}
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

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'المنتجات' : 'Products'}</CardTitle>
          <CardDescription>
            {isRTL ? 'جميع المنتجات المتاحة لإنشاء الباركود' : 'All products available for barcode generation'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isRTL ? 'المنتج' : 'Product'}</TableHead>
                <TableHead>{isRTL ? 'الكود' : 'Code'}</TableHead>
                <TableHead>{isRTL ? 'الباركود الحالي' : 'Current Barcode'}</TableHead>
                <TableHead>{isRTL ? 'السعر' : 'Price'}</TableHead>
                <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                <TableHead className="text-right">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    {isRTL ? product.product_name_ar : product.product_name}
                  </TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {product.product_code}
                    </code>
                  </TableCell>
                  <TableCell>
                    {product.barcode ? (
                      <Badge variant="secondary">
                        <QrCode className="h-3 w-3 mr-1" />
                        {product.barcode}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {isRTL ? 'لا يوجد' : 'None'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>${product.selling_price}</TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                      {product.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setDialogOpen(true);
                        }}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      {product.barcode && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintBarcode({ 
                            id: 0, 
                            product_id: product.id, 
                            barcode_value: product.barcode!, 
                            barcode_type: 'CODE128', 
                            is_active: true, 
                            created_at: new Date().toISOString(),
                            product: product
                          })}
                        >
                          <Print className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Generated Barcodes */}
      {barcodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'الباركود المنشأة حديثاً' : 'Recently Generated Barcodes'}</CardTitle>
            <CardDescription>
              {isRTL ? 'الباركود التي تم إنشاؤها في هذه الجلسة' : 'Barcodes generated in this session'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {barcodes.map((barcode) => (
                <div key={barcode.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {isRTL ? barcode.product?.product_name_ar : barcode.product?.product_name}
                    </h4>
                    <Badge variant="secondary">{barcode.barcode_type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {barcode.barcode_value}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintBarcode(barcode)}
                    >
                      <Print className="h-4 w-4 mr-1" />
                      {isRTL ? 'طباعة' : 'Print'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {isRTL ? 'تحميل' : 'Download'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
