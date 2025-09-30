'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { testProductJoins, getProductsWithWarehouseInfo } from '@/lib/warehouse';

export function TestJoins() {
  const [testData, setTestData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const data = await testProductJoins();
      setTestData(data);
      console.log('Test data:', data);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const runFullTest = async () => {
    setLoading(true);
    try {
      const data = await getProductsWithWarehouseInfo();
      setTestData(data);
      console.log('Full test data:', data);
    } catch (error) {
      console.error('Full test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Database Joins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runTest} disabled={loading}>
              Test Simple Joins
            </Button>
            <Button onClick={runFullTest} disabled={loading}>
              Test Full Joins
            </Button>
          </div>
          
          {testData.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Results:</h3>
              {testData.slice(0, 3).map((item, index) => (
                <div key={index} className="p-3 border rounded">
                  <div><strong>Product:</strong> {item.product_name}</div>
                  <div><strong>Main Group ID:</strong> {item.main_group_id}</div>
                  <div><strong>Main Group Name:</strong> {item.main_group?.group_name || 'NULL'}</div>
                  <div><strong>Color ID:</strong> {item.color_id}</div>
                  <div><strong>Color Name:</strong> {item.color?.color_name || 'NULL'}</div>
                  <div><strong>Material ID:</strong> {item.material_id}</div>
                  <div><strong>Material Name:</strong> {item.material?.material_name || 'NULL'}</div>
                  <div><strong>Unit ID:</strong> {item.unit_of_measurement_id}</div>
                  <div><strong>Unit Name:</strong> {item.unit_of_measurement?.unit_name || 'NULL'}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
