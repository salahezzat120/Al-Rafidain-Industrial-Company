# 🎯 Product Creation Dropdown Functionality

## Overview

The "Add New Product" form in the warehouse management system uses dropdown lists populated from database tables for the following fields:

- **Main Group** - Product categories (e.g., Plastic Products, Kitchenware)
- **Sub Group** - Sub-categories within main groups (e.g., Cups, Plates)
- **Color** - Available colors (e.g., White, Red, Blue)
- **Material** - Material types (e.g., Polypropylene, Polyethylene)
- **Unit of Measurement** - Measurement units (e.g., Piece, Kilogram, Liter)
- **Warehouse** - Available warehouses for storage

## 🗄️ Database Tables

### 1. Main Groups Table (`main_groups`)
```sql
CREATE TABLE main_groups (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(255) NOT NULL,
  group_name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Sub Groups Table (`sub_groups`)
```sql
CREATE TABLE sub_groups (
  id SERIAL PRIMARY KEY,
  main_group_id INTEGER NOT NULL REFERENCES main_groups(id) ON DELETE CASCADE,
  sub_group_name VARCHAR(255) NOT NULL,
  sub_group_name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Colors Table (`colors`)
```sql
CREATE TABLE colors (
  id SERIAL PRIMARY KEY,
  color_name VARCHAR(100) NOT NULL,
  color_name_ar VARCHAR(100),
  color_code VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Materials Table (`materials`)
```sql
CREATE TABLE materials (
  id SERIAL PRIMARY KEY,
  material_name VARCHAR(255) NOT NULL,
  material_name_ar VARCHAR(255),
  material_type VARCHAR(100),
  material_type_ar VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Units of Measurement Table (`units_of_measurement`)
```sql
CREATE TABLE units_of_measurement (
  id SERIAL PRIMARY KEY,
  unit_name VARCHAR(100) NOT NULL,
  unit_name_ar VARCHAR(100),
  unit_symbol VARCHAR(10),
  unit_symbol_ar VARCHAR(10),
  unit_type VARCHAR(50) DEFAULT 'COUNT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Warehouses Table (`warehouses`)
```sql
CREATE TABLE warehouses (
  id SERIAL PRIMARY KEY,
  warehouse_name VARCHAR(255) NOT NULL,
  warehouse_name_ar VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  location_ar VARCHAR(255),
  responsible_person VARCHAR(255),
  responsible_person_ar VARCHAR(255),
  warehouse_type VARCHAR(50) DEFAULT 'DISTRIBUTION',
  capacity DECIMAL(10,2) DEFAULT 0,
  current_utilization DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Implementation Details

### Frontend Components

The dropdown functionality is implemented in `components/warehouse/warehouse-management.tsx`:

```typescript
// State management for dropdown data
const [mainGroups, setMainGroups] = useState<MainGroup[]>([]);
const [subGroups, setSubGroups] = useState<SubGroup[]>([]);
const [colors, setColors] = useState<Color[]>([]);
const [materials, setMaterials] = useState<Material[]>([]);
const [units, setUnits] = useState<UnitOfMeasurement[]>([]);
const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
```

### Data Loading

All dropdown data is loaded when the component mounts:

```typescript
const loadData = async () => {
  try {
    setLoading(true);
    const [
      warehousesData,
      productsData,
      mainGroupsData,
      colorsData,
      materialsData,
      unitsData
    ] = await Promise.all([
      getWarehouses(),
      getProductsWithWarehouseInfo(),
      getMainGroups(),
      getColors(),
      getMaterials(),
      getUnitsOfMeasurement()
    ]);

    setWarehouses(warehousesData);
    setProducts(productsData);
    setMainGroups(mainGroupsData);
    setColors(colorsData);
    setMaterials(materialsData);
    setUnits(unitsData);
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    setLoading(false);
  }
};
```

### Dynamic Sub Groups Loading

When a main group is selected, the sub groups are dynamically loaded:

```typescript
useEffect(() => {
  if (productForm.main_group_id) {
    loadSubGroups(productForm.main_group_id);
  }
}, [productForm.main_group_id]);

const loadSubGroups = async (mainGroupId: number) => {
  try {
    const subGroupsData = await getSubGroups(mainGroupId);
    setSubGroups(subGroupsData);
  } catch (error) {
    console.error('Error loading sub groups:', error);
  }
};
```

### Dropdown Components

Each dropdown uses the Shadcn Select component:

```typescript
// Main Group Dropdown
<Select
  value={productForm.main_group_id.toString()}
  onValueChange={(value) => setProductForm(prev => ({ 
    ...prev, 
    main_group_id: parseInt(value),
    sub_group_id: undefined // Reset sub group when main group changes
  }))}
>
  <SelectTrigger>
    <SelectValue placeholder="Select main group" />
  </SelectTrigger>
  <SelectContent>
    {mainGroups.map((group) => (
      <SelectItem key={group.id} value={group.id.toString()}>
        {group.group_name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## 🚀 Setup Instructions

### 1. Run Database Setup

Execute the `complete-dropdown-setup.sql` script in your Supabase SQL Editor:

```sql
-- This script will:
-- 1. Create all required tables
-- 2. Insert comprehensive sample data
-- 3. Create necessary indexes
-- 4. Verify data insertion
```

### 2. Test Functionality

Run the test script to verify everything is working:

```bash
node test-dropdown-functionality.js
```

### 3. Verify in Application

1. Navigate to the Warehouse Management section
2. Click on the "Products" tab
3. Click "Add Product" button
4. Verify that all dropdowns are populated with data

## 📊 Sample Data

The setup script includes comprehensive sample data:

### Main Groups (5 categories)
- Plastic Products
- Kitchenware
- Storage Solutions
- Industrial Products
- Household Items

### Sub Groups (20+ sub-categories)
- Cups, Plates, Bowls, Containers
- Utensils, Cutlery, Serving Items
- Boxes, Bins, Baskets
- Pipes, Sheets, Components
- Cleaning, Organization, Decorative

### Colors (12 colors)
- White, Black, Red, Blue, Green, Yellow
- Orange, Purple, Pink, Brown, Gray, Transparent

### Materials (8 types)
- Polypropylene (PP)
- Polyethylene (PE)
- Polystyrene (PS)
- Polyvinyl Chloride (PVC)
- Acrylonitrile Butadiene Styrene (ABS)
- Polyethylene Terephthalate (PET)
- High-Density Polyethylene (HDPE)
- Low-Density Polyethylene (LDPE)

### Units of Measurement (20 units)
- Count: Piece, Dozen, Hundred, Thousand
- Weight: Kilogram, Gram, Pound
- Volume: Liter, Milliliter, Gallon
- Length: Meter, Centimeter, Inch
- Area: Square Meter
- Custom: Carton, Box, Pack, Set, Pair

### Warehouses (6 locations)
- Main Factory Warehouse
- Cairo Distribution Center
- Alexandria Warehouse
- Basra Storage Facility
- Sales Representatives Sub-Store
- Export Warehouse

## 🔍 Troubleshooting

### Common Issues

1. **Empty Dropdowns**
   - Check if database tables have data
   - Verify API functions are working
   - Check browser console for errors

2. **Sub Groups Not Loading**
   - Ensure main group is selected first
   - Check if sub_groups table has data for the selected main group
   - Verify foreign key relationship

3. **API Errors**
   - Check Supabase connection
   - Verify table names match exactly
   - Check RLS policies

### Debug Steps

1. **Check Database Data**
   ```sql
   SELECT COUNT(*) FROM main_groups;
   SELECT COUNT(*) FROM sub_groups;
   SELECT COUNT(*) FROM colors;
   SELECT COUNT(*) FROM materials;
   SELECT COUNT(*) FROM units_of_measurement;
   SELECT COUNT(*) FROM warehouses;
   ```

2. **Test API Functions**
   ```javascript
   // Test in browser console
   getMainGroups().then(console.log);
   getColors().then(console.log);
   getMaterials().then(console.log);
   getUnitsOfMeasurement().then(console.log);
   getWarehouses().then(console.log);
   ```

3. **Check Network Tab**
   - Open browser DevTools
   - Go to Network tab
   - Try loading the form
   - Check for failed API requests

## 🎯 Features

### ✅ Implemented Features

- **Dynamic Dropdowns**: All fields use database-driven dropdowns
- **Cascading Selection**: Sub groups update when main group changes
- **Bilingual Support**: Arabic and English names supported
- **Comprehensive Data**: Extensive sample data for all categories
- **Error Handling**: Proper error handling and loading states
- **Performance**: Optimized queries with proper indexing

### 🔄 User Experience

1. **Main Group Selection**: Choose from predefined categories
2. **Sub Group Filtering**: Only relevant sub groups are shown
3. **Color Selection**: Visual color picker with color codes
4. **Material Selection**: Comprehensive material types
5. **Unit Selection**: Various measurement units with types
6. **Warehouse Selection**: Multiple warehouse selection with quantities

## 📝 Notes

- All dropdowns are populated from database tables
- Data is loaded once when the component mounts
- Sub groups are dynamically loaded based on main group selection
- The system supports both Arabic and English names
- Comprehensive sample data is provided for immediate use
- All tables have proper indexing for performance

## 🚀 Next Steps

1. **Customize Data**: Add your own categories, colors, materials, etc.
2. **Add Validation**: Implement form validation for required fields
3. **Bulk Import**: Add functionality to import data from CSV/Excel
4. **Search/Filter**: Add search functionality to dropdowns
5. **User Permissions**: Implement role-based access to different categories
