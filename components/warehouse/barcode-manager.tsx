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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, QrCode, Download, Printer, Eye, Trash2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { 
  getProductsWithWarehouseInfo,
  getBarcodes,
  createBarcode,
  deleteBarcode
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
  const [activeTab, setActiveTab] = useState<'products' | 'barcodes'>('products');
  const [copiedBarcode, setCopiedBarcode] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, barcodesData] = await Promise.all([
        getProductsWithWarehouseInfo(),
        getBarcodes()
      ]);
      setProducts(productsData || []);
      setBarcodes(barcodesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setProducts([]);
      setBarcodes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBarcode = async () => {
    if (!selectedProduct) return;

    try {
      const barcodeData = {
        product_id: selectedProduct.id,
        barcode_value: `${selectedProduct.product_code}-${Date.now()}`,
        barcode_type: barcodeType,
        barcode_type_ar: barcodeType === 'CODE128' ? 'كود 128' : 
                         barcodeType === 'QR_CODE' ? 'كود QR' : 'EAN13',
        quantity: quantity,
        notes: isRTL ? `باركود ${selectedProduct.product_name_ar}` : `Barcode for ${selectedProduct.product_name}`,
        notes_ar: `باركود ${selectedProduct.product_name_ar}`
      };

      const newBarcode = await createBarcode(barcodeData);
      setBarcodes(prev => [newBarcode, ...prev]);
      setDialogOpen(false);
      setSelectedProduct(null);
      setQuantity(1);
    } catch (error) {
      console.error('Error generating barcode:', error);
    }
  };

  const handleDeleteBarcode = async (barcodeId: number) => {
    try {
      await deleteBarcode(barcodeId.toString());
      setBarcodes(prev => prev.filter(b => b.id !== barcodeId));
    } catch (error) {
      console.error('Error deleting barcode:', error);
    }
  };

  const handleCopyBarcode = (barcodeValue: string) => {
    navigator.clipboard.writeText(barcodeValue);
    setCopiedBarcode(barcodeValue);
    setTimeout(() => setCopiedBarcode(null), 2000);
  };

  const handlePrinterBarcode = (barcode: Barcode) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const productName = isRTL ? barcode.product?.product_name_ar : barcode.product?.product_name;
      const productCode = barcode.product?.product_code;
      const barcodeValue = barcode.barcode_value;
      const generatedDate = new Date().toLocaleDateString();
      
      printWindow.document.write(`
        <html dir="${isRTL ? 'rtl' : 'ltr'}">
          <head>
            <title>${isRTL ? 'باركود' : 'Barcode'} - ${productName}</title>
            <style>
              body { 
                font-family: ${isRTL ? 'Arial, Tahoma, sans-serif' : 'Arial, sans-serif'}; 
                text-align: center; 
                padding: 20px; 
                direction: ${isRTL ? 'rtl' : 'ltr'};
              }
              .barcode-container { 
                margin: 20px 0; 
                border: 1px solid #ddd; 
                padding: 20px; 
                border-radius: 8px;
              }
              .product-info { margin: 10px 0; }
              .barcode-value { 
                font-family: monospace; 
                font-size: 16px; 
                margin: 15px 0; 
                padding: 10px;
                background: #f5f5f5;
                border-radius: 4px;
              }
              .company-name {
                font-size: 12px;
                color: #666;
                margin-bottom: 10px;
              }
              @media print { 
                body { margin: 0; }
                .barcode-container { border: none; }
              }
            </style>
          </head>
          <body>
            <div class="company-name">${isRTL ? 'شركة الرافدين الصناعية' : 'Al-Rafidain Industrial Company'}</div>
            <div class="barcode-container">
              <div class="product-info">
                <h3>${productName}</h3>
                <p><strong>${isRTL ? 'كود المنتج' : 'Product Code'}:</strong> ${productCode}</p>
                <p><strong>${isRTL ? 'نوع الباركود' : 'Barcode Type'}:</strong> ${barcode.barcode_type}</p>
              </div>
              <div class="barcode-value">
                ${barcodeValue}
              </div>
              <div style="font-size: 12px; margin-top: 10px; color: #666;">
                ${isRTL ? 'تم إنشاؤه في' : 'Generated on'}: ${generatedDate}
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const filteredProducts = (products || []).filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBarcodes = (barcodes || []).filter(barcode =>
    barcode.barcode_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barcode.product?.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barcode.product?.product_name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barcode.product?.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBarcodeTypeName = (type: string) => {
    switch (type) {
      case 'CODE128': return isRTL ? 'كود 128' : 'CODE128';
      case 'QR_CODE': return isRTL ? 'كود QR' : 'QR Code';
      case 'EAN13': return 'EAN13';
      default: return type;
    }
  };

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
            {isRTL ? 'إدارة الباركود' : 'Barcode Management'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? 'إنشاء وطباعة الباركود للمنتجات' : 'Generate and print barcodes for products'}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
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
                    <SelectItem value="CODE128">{isRTL ? 'كود 128' : 'CODE128'}</SelectItem>
                    <SelectItem value="QR_CODE">{isRTL ? 'كود QR' : 'QR Code'}</SelectItem>
                    <SelectItem value="EAN13">EAN13</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">{t('warehouse.quantity')}</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  placeholder={t('warehouse.numberOfBarcodesToGenerate')}
                />
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
                <QrCode className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'إنشاء الباركود' : 'Generate Barcode'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={isRTL ? 'البحث في المنتجات والباركود...' : 'Search products and barcodes...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>
          <Button variant="outline">
            <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'تصفية' : 'Filter'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">
              {isRTL ? 'المنتجات' : 'Products'}
            </TabsTrigger>
            <TabsTrigger value="barcodes">
              {isRTL ? 'الباركود' : 'Barcodes'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
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
                      <TableHead>{t('warehouse.product')}</TableHead>
                      <TableHead>{t('warehouse.productCode')}</TableHead>
                      <TableHead>{t('warehouse.currentBarcode')}</TableHead>
                      <TableHead>{t('warehouse.price')}</TableHead>
                      <TableHead>{t('warehouse.status')}</TableHead>
                      <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t('warehouse.actions')}</TableHead>
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
                              <QrCode className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
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
                        <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                          <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setDialogOpen(true);
                              }}
                              title={isRTL ? 'إنشاء باركود' : 'Generate Barcode'}
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                            {product.barcode && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrinterBarcode({ 
                                  id: 0, 
                                  product_id: product.id, 
                                  barcode_value: product.barcode!, 
                                  barcode_type: 'CODE128', 
                                  is_active: true, 
                                  created_at: new Date().toISOString(),
                                  product: product
                                })}
                                title={isRTL ? 'طباعة الباركود' : 'Printer Barcode'}
                              >
                                <Printer className="h-4 w-4" />
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
          </TabsContent>

          <TabsContent value="barcodes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'الباركود المنشأة' : 'Generated Barcodes'}</CardTitle>
                <CardDescription>
                  {isRTL ? 'جميع الباركود المنشأة في النظام' : 'All barcodes generated in the system'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('warehouse.product')}</TableHead>
                      <TableHead>{t('warehouse.barcodeValue')}</TableHead>
                      <TableHead>{t('warehouse.barcodeType')}</TableHead>
                      <TableHead>{t('warehouse.quantity')}</TableHead>
                      <TableHead>{isRTL ? 'تاريخ الإنشاء' : 'Created Date'}</TableHead>
                      <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t('warehouse.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBarcodes.map((barcode) => (
                      <TableRow key={barcode.id}>
                        <TableCell className="font-medium">
                          {isRTL ? barcode.product?.product_name_ar : barcode.product?.product_name}
                        </TableCell>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {barcode.barcode_value}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getBarcodeTypeName(barcode.barcode_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>{barcode.quantity}</TableCell>
                        <TableCell>
                          {new Date(barcode.generated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                          <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyBarcode(barcode.barcode_value)}
                              title={isRTL ? 'نسخ الباركود' : 'Copy Barcode'}
                            >
                              {copiedBarcode === barcode.barcode_value ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrinterBarcode(barcode)}
                              title={isRTL ? 'طباعة الباركود' : 'Printer Barcode'}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBarcode(barcode.id)}
                              title={isRTL ? 'حذف الباركود' : 'Delete Barcode'}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
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
        </Tabs>
      </div>

    </div>
  );
}
