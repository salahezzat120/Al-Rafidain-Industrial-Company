const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ullghcrmleaaualynomj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbGdoY3JtbGVhYXVhbHlub21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzA3OTEsImV4cCI6MjA3Mjc0Njc5MX0.gw-uw0WuqsK1JydwyoNGgufWgmj7SGuc62l9zU-RJ9g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProductStock() {
  console.log('🔍 Checking product stock levels...\n');
  
  try {
    // Get all products with their stock levels
    const { data: products, error } = await supabase
      .from('products')
      .select('id, product_name, product_code, stock, main_group, is_active')
      .eq('is_active', true)
      .order('product_name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log('📊 Total active products:', products?.length || 0);
    console.log('');

    if (!products || products.length === 0) {
      console.log('📋 No products found');
      return;
    }

    // Categorize products by stock level
    const lowStock = products.filter(p => parseFloat(p.stock) > 0 && parseFloat(p.stock) <= 10);
    const outOfStock = products.filter(p => parseFloat(p.stock) <= 0);
    const goodStock = products.filter(p => parseFloat(p.stock) > 10);

    console.log('📈 Stock Summary:');
    console.log(`  Good Stock (>10): ${goodStock.length} products`);
    console.log(`  Low Stock (1-10): ${lowStock.length} products`);
    console.log(`  Out of Stock (0): ${outOfStock.length} products`);
    console.log('');

    // Show products mentioned in the error (test with code 222)
    console.log('🔍 Checking specific products from error:');
    const testProduct = products.find(p => p.product_code === '222' || p.product_name.toLowerCase().includes('test'));
    
    if (testProduct) {
      console.log('📦 Found "test" product:');
      console.log(`  ID: ${testProduct.id}`);
      console.log(`  Name: ${testProduct.product_name}`);
      console.log(`  Code: ${testProduct.product_code}`);
      console.log(`  Stock: ${testProduct.stock}`);
      console.log(`  Group: ${testProduct.main_group}`);
    } else {
      console.log('❌ No product with code "222" or name containing "test" found');
    }
    console.log('');

    // Show all products with their stock levels
    console.log('📋 All Products Stock Levels:');
    products.forEach((product, index) => {
      const stockLevel = parseFloat(product.stock);
      let stockStatus = '';
      
      if (stockLevel <= 0) {
        stockStatus = '❌ OUT OF STOCK';
      } else if (stockLevel <= 10) {
        stockStatus = '⚠️  LOW STOCK';
      } else {
        stockStatus = '✅ GOOD STOCK';
      }

      console.log(`  ${index + 1}. ${product.product_name} (${product.product_code})`);
      console.log(`     Stock: ${product.stock} ${stockStatus}`);
      console.log(`     Group: ${product.main_group}`);
      console.log('');
    });

    // Show products that need stock updates
    const needsUpdate = products.filter(p => parseFloat(p.stock) < 20);
    if (needsUpdate.length > 0) {
      console.log('🔧 Products that might need stock updates:');
      needsUpdate.forEach(product => {
        const currentStock = parseFloat(product.stock);
        const suggestedStock = Math.max(50, currentStock + 50);
        console.log(`  - ${product.product_name}: Current ${currentStock} → Suggested ${suggestedStock}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkProductStock();
