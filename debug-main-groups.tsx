// =====================================================
// DEBUG MAIN GROUPS COMPONENT
// Use this component to debug main groups loading
// =====================================================

import React, { useState, useEffect } from 'react';
import { getMainGroups } from '@/lib/warehouse';
import type { MainGroup } from '@/types/warehouse';

export function DebugMainGroups() {
  const [mainGroups, setMainGroups] = useState<MainGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMainGroups();
  }, []);

  const loadMainGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading main groups...');
      
      const data = await getMainGroups();
      console.log('✅ Main groups loaded:', data);
      
      setMainGroups(data);
    } catch (err) {
      console.error('❌ Error loading main groups:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">🔍 Debug Main Groups</h3>
      
      {loading && (
        <div className="text-blue-600">⏳ Loading main groups...</div>
      )}
      
      {error && (
        <div className="text-red-600 mb-4">
          ❌ Error: {error}
        </div>
      )}
      
      {!loading && !error && (
        <div>
          <div className="mb-4">
            <strong>📊 Status:</strong> {mainGroups.length} main groups loaded
          </div>
          
          {mainGroups.length > 0 ? (
            <div>
              <h4 className="font-semibold mb-2">📋 Main Groups:</h4>
              <div className="space-y-2">
                {mainGroups.map((group) => (
                  <div key={group.id} className="p-2 bg-white border rounded">
                    <div><strong>ID:</strong> {group.id}</div>
                    <div><strong>Name:</strong> {group.group_name}</div>
                    <div><strong>Arabic:</strong> {group.group_name_ar || 'N/A'}</div>
                    <div><strong>Description:</strong> {group.description || 'N/A'}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
                <strong>✅ SUCCESS:</strong> Main groups are loaded and ready for dropdown!
              </div>
            </div>
          ) : (
            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded">
              <strong>⚠️ WARNING:</strong> No main groups found in database.
              <br />
              <strong>Solution:</strong> Run the main groups SQL script to insert sample data.
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4">
        <button 
          onClick={loadMainGroups}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔄 Reload Main Groups
        </button>
      </div>
    </div>
  );
}
