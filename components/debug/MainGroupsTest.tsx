// =====================================================
// MAIN GROUPS TEST COMPONENT
// Use this component to test main groups loading
// =====================================================

import React, { useState, useEffect } from 'react';
import { getMainGroups } from '@/lib/warehouse';
import type { MainGroup } from '@/types/warehouse';

export function MainGroupsTest() {
  const [mainGroups, setMainGroups] = useState<MainGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testMainGroups = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo([]);
    
    try {
      addDebugInfo('🔄 Starting main groups test...');
      
      const data = await getMainGroups();
      
      addDebugInfo(`✅ Successfully loaded ${data.length} main groups`);
      
      if (data.length > 0) {
        addDebugInfo(`📋 Sample: ${data[0].group_name} (ID: ${data[0].id})`);
      }
      
      setMainGroups(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addDebugInfo(`❌ Error: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testMainGroups();
  }, []);

  return (
    <div className="p-6 border rounded-lg bg-gray-50 max-w-4xl">
      <h2 className="text-xl font-bold mb-4">🔍 Main Groups Test</h2>
      
      <div className="mb-4">
        <button 
          onClick={testMainGroups}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '⏳ Testing...' : '🔄 Test Main Groups'}
        </button>
      </div>

      {loading && (
        <div className="text-blue-600 mb-4">⏳ Loading main groups...</div>
      )}

      {error && (
        <div className="text-red-600 mb-4 p-3 bg-red-100 border border-red-300 rounded">
          ❌ Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mb-4">
          <div className="text-green-600 mb-2">
            ✅ Status: {mainGroups.length} main groups loaded
          </div>
          
          {mainGroups.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-2">📋 Main Groups:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {mainGroups.map((group) => (
                  <div key={group.id} className="p-2 bg-white border rounded text-sm">
                    <div><strong>ID:</strong> {group.id}</div>
                    <div><strong>Name:</strong> {group.group_name}</div>
                    <div><strong>Arabic:</strong> {group.group_name_ar || 'N/A'}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-yellow-600 p-3 bg-yellow-100 border border-yellow-300 rounded">
              ⚠️ No main groups found in database
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-semibold mb-2">🔧 Debug Info:</h3>
        <div className="bg-black text-green-400 p-3 rounded font-mono text-sm max-h-40 overflow-y-auto">
          {debugInfo.map((info, index) => (
            <div key={index}>{info}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
