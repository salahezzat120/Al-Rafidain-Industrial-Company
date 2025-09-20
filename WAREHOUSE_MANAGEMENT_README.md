# 🏭 Warehouse Management System

A comprehensive warehouse management system for Al-Rafidain Industrial Company's plastic products inventory.

## 📋 Features

### 🗂 Master Data Management
- **Warehouse Directory**: Manage multiple warehouse locations
- **Units of Measurement**: Piece, Dozen, Carton, Pallet, Kg (with user-defined options)
- **Product Categories**: Main groups and sub-groups with hierarchical organization
- **Colors & Materials**: HDPE, PET, PP materials with color variations
- **User-Defined Options**: Extensible system for custom categories

### 📊 Inventory Management
- **Real-time Stock Tracking**: Monitor inventory levels across all warehouses
- **Stock Alerts**: Automatic notifications for low stock and reorder points
- **Stock Movements**: Track all inventory changes (IN, OUT, TRANSFER, ADJUSTMENT)
- **Multi-warehouse Support**: Manage inventory across multiple locations

### 🎯 Product Management
- **Comprehensive Product Catalog**: Full product specifications and details
- **Hierarchical Organization**: Main groups → Sub-groups → Products
- **Flexible Attributes**: Color, material, size, and custom specifications
- **Product Codes**: Unique identification system for all products

## 🚀 Quick Start

### 1. Database Setup
Run the database setup script to create all necessary tables:

```bash
node setup-warehouse-database.js
```

Or manually execute the SQL schema:
```sql
-- Run the contents of warehouse-database-schema.sql in your Supabase SQL editor
```

### 2. Access the System
1. Log in as an admin user
2. Navigate to the admin panel
3. Click on "Warehouse Management" in the sidebar
4. Start managing your inventory!

## 📁 File Structure

```
├── warehouse-database-schema.sql          # Complete database schema
├── types/warehouse.ts                     # TypeScript type definitions
├── lib/warehouse.ts                       # API functions and business logic
├── components/warehouse/
│   ├── warehouse-dashboard.tsx            # Dashboard with stats and alerts
│   └── warehouse-management.tsx           # Full management interface
├── components/admin/
│   └── warehouse-tab.tsx                  # Admin panel integration
├── app/warehouse/page.tsx                 # Standalone warehouse page
└── setup-warehouse-database.js            # Database setup script
```

## 🗄️ Database Schema

### Core Tables
- **warehouses**: Warehouse locations and responsible persons
- **products**: Product catalog with specifications
- **inventory**: Stock levels per warehouse
- **stock_movements**: Audit trail of all inventory changes

### Master Data Tables
- **units_of_measurement**: Measurement units (Piece, Dozen, etc.)
- **main_groups**: Product categories (Plastic Plates, Boxes, etc.)
- **sub_groups**: Sub-categories (Small/Medium/Large Plates)
- **colors**: Available colors (White, Transparent, Colored)
- **materials**: Material types (HDPE, PET, PP)

### Views & Indexes
- **inventory_summary**: Optimized view for inventory reporting
- **Performance indexes**: Optimized queries for large datasets
- **Triggers**: Automatic timestamp updates

## 🎨 User Interface

### Dashboard Tab
- **Statistics Cards**: Total warehouses, products, inventory value, low stock items
- **Stock Alerts**: Real-time notifications for items needing attention
- **Quick Actions**: Fast access to common tasks

### Warehouses Tab
- **Warehouse List**: View all warehouse locations
- **Add/Edit Warehouses**: Manage warehouse information
- **Search & Filter**: Find warehouses quickly

### Products Tab
- **Product Catalog**: Complete product management
- **Hierarchical Selection**: Main group → Sub group selection
- **Specifications**: Color, material, unit of measurement
- **Bulk Operations**: Manage multiple products efficiently

### Inventory Tab
- **Stock Overview**: Current inventory levels across all warehouses
- **Status Indicators**: Visual stock status (In Stock, Low Stock, Reorder)
- **Real-time Updates**: Live inventory tracking

## 🔧 API Functions

### Warehouse Management
```typescript
getWarehouses(filters?)           // Get all warehouses
createWarehouse(data)             // Create new warehouse
updateWarehouse(data)             // Update warehouse
deleteWarehouse(id)               // Delete warehouse
```

### Product Management
```typescript
getProducts(filters?)             // Get all products
createProduct(data)               // Create new product
updateProduct(data)               // Update product
deleteProduct(id)                 // Delete product
```

### Inventory Management
```typescript
getInventorySummary(filters?)     // Get inventory overview
createStockMovement(data)         // Record stock movement
getStockAlerts()                  // Get low stock alerts
getWarehouseStats()               // Get dashboard statistics
```

### Master Data
```typescript
getMainGroups()                   // Get product categories
getSubGroups(mainGroupId?)        // Get sub-categories
getColors()                       // Get available colors
getMaterials()                    // Get material types
getUnitsOfMeasurement()           // Get measurement units
```

## 📊 Default Data

### Warehouses
1. **Factory Warehouse** - Main Factory Location
2. **Cairo Distribution Warehouse** - Cairo, Egypt
3. **Alexandria Warehouse** - Alexandria, Egypt
4. **Sales Representatives Sub-Store** - Various Locations

### Main Groups
- Plastic Plates
- Plastic Boxes
- Cups
- Household Items
- Industrial Products

### Sub-Groups
- **Plates**: Small, Medium, Large
- **Boxes**: Food, Medical
- **Cups**: Small, Medium, Large

### Units of Measurement
- Piece (PCS)
- Dozen (DZ)
- Carton (CTN)
- Pallet (PLT)
- Kilogram (KG)

### Colors
- White
- Transparent
- Colored

### Materials
- HDPE (High-Density Polyethylene)
- PET (Polyethylene Terephthalate)
- PP (Polypropylene)

## 🔒 Security & Permissions

- **Admin Access**: Full warehouse management capabilities
- **Role-based Access**: Integrated with existing user roles
- **Data Validation**: Comprehensive input validation
- **Audit Trail**: Complete stock movement tracking

## 🚀 Future Enhancements

- **Barcode Integration**: Product barcode scanning
- **Automated Reordering**: Smart reorder point calculations
- **Supplier Management**: Vendor and purchase order integration
- **Reporting**: Advanced analytics and reporting
- **Mobile App**: Mobile inventory management
- **API Integration**: Third-party system integration

## 🛠️ Technical Details

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **State Management**: React hooks and context
- **Real-time**: Supabase real-time subscriptions

### Performance Optimizations
- **Database Indexes**: Optimized queries for large datasets
- **Lazy Loading**: Efficient data loading strategies
- **Caching**: Smart caching for frequently accessed data
- **Pagination**: Large dataset handling

## 📞 Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Al-Rafidain Industrial Company** - Warehouse Management System v1.0
