// Setup Stocktaking Tables - JavaScript version
// This can be run in the browser console or as a setup script

import { supabase } from './lib/supabase';

export async function setupStocktakingTables() {
  try {
    console.log('Setting up stocktaking tables...');
    
    // Create stocktaking table
    const { error: stocktakingError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS stocktaking (
          id SERIAL PRIMARY KEY,
          warehouse_id INTEGER NOT NULL,
          stocktaking_date DATE NOT NULL,
          reference_number VARCHAR(100) UNIQUE NOT NULL,
          status VARCHAR(20) DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED')),
          status_ar VARCHAR(50) DEFAULT 'مخطط',
          total_items INTEGER DEFAULT 0,
          counted_items INTEGER DEFAULT 0,
          discrepancies INTEGER DEFAULT 0,
          notes TEXT,
          notes_ar TEXT,
          created_by VARCHAR(255),
          created_by_ar VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (stocktakingError) {
      console.error('Error creating stocktaking table:', stocktakingError);
      return false;
    }

    // Create stocktaking_items table
    const { error: itemsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS stocktaking_items (
          id SERIAL PRIMARY KEY,
          stocktaking_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          system_quantity DECIMAL(10,2) NOT NULL,
          counted_quantity DECIMAL(10,2) NOT NULL,
          difference DECIMAL(10,2) NOT NULL,
          notes TEXT,
          notes_ar TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (itemsError) {
      console.error('Error creating stocktaking_items table:', itemsError);
      return false;
    }

    console.log('Stocktaking tables created successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up stocktaking tables:', error);
    return false;
  }
}

// Alternative: Simple table creation using direct SQL
export async function createStocktakingTableSimple() {
  try {
    // This is a simplified approach - you'll need to run the SQL in Supabase dashboard
    console.log('Please run the following SQL in your Supabase SQL Editor:');
    console.log(`
-- Copy and paste this into Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS stocktaking (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL,
    stocktaking_date DATE NOT NULL,
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'PLANNED',
    total_items INTEGER DEFAULT 0,
    counted_items INTEGER DEFAULT 0,
    discrepancies INTEGER DEFAULT 0,
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `);
    
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}
