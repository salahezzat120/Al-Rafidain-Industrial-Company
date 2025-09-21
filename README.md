# 🏭 Al-Rafidain Industrial Company - Warehouse Management System

A comprehensive, bilingual (Arabic/English) warehouse management system specifically designed for plastic products manufacturing and distribution.

## 🌟 Features

### ✅ Complete Bilingual Support
- **Arabic & English** interface throughout
- **RTL (Right-to-Left)** layout support for Arabic
- **Dual language** data storage and display
- **Cultural adaptation** for Middle Eastern business practices

### ✅ 10 Core Modules
1. **Dashboard** - Real-time overview and analytics
2. **Warehouses** - Multi-location warehouse management
3. **Products** - Complete product catalog with specifications
4. **Inventory** - Real-time stock levels and monitoring
5. **Stock Movements** - Transaction recording (IN/OUT/TRANSFER/RETURN)
6. **Barcodes** - Generate and manage product barcodes
7. **Reports** - 13 comprehensive report types
8. **Stocktaking** - Physical inventory counting system
9. **Bulk Upload** - CSV/Excel mass data import
10. **Workflow Integration** - Production, sales, delivery integration

### ✅ Advanced Features
- **Real-time inventory tracking**
- **Automated stock level calculations**
- **Barcode generation and printing**
- **Physical stocktaking with variance tracking**
- **Comprehensive reporting engine**
- **Bulk data import/export**
- **Workflow automation**
- **Multi-warehouse support**
- **User role management**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd al-rafidain-warehouse-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

4. **Set up the database**
```bash
# Run the complete SQL schema
psql -d your_database -f comprehensive-warehouse-schema.sql
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The system includes a comprehensive PostgreSQL schema with:
- **25+ tables** with full Arabic/English support
- **Performance optimized** with indexes and triggers
- **Sample data** included for immediate testing
- **Data integrity** with constraints and relationships
- **Automated functions** for inventory updates

## 📊 Reporting System

### 13 Report Types:
1. **Cost & Sales Price Report** - Product pricing analysis
2. **Consignment Stock Report** - Consignment inventory tracking
3. **Damaged Goods Report** - Damage tracking and analysis
4. **Expiry Report** - Expiry date monitoring
5. **Expiry Browsing** - Detailed expiry item analysis
6. **Serial Number Tracking** - Serial number management
7. **Product Card** - Complete product information
8. **Product Monitoring Card** - Product movement tracking
9. **Aging Report** - Stock aging analysis
10. **Stock Analysis** - Turnover and movement analysis
11. **Valuation Report** - Inventory valuation
12. **Issued Items Report** - Items issued to departments
13. **Custom Reports** - User-defined report builder

## 🛠️ Technical Stack

### Frontend:
- **React 18** with TypeScript
- **Next.js 14** for SSR and routing
- **Shadcn UI** components
- **Tailwind CSS** for styling
- **Lucide React** icons
- **Context API** for state management

### Backend:
- **Supabase** for database and authentication
- **PostgreSQL** database
- **Real-time subscriptions**
- **Row Level Security (RLS)**

### Additional Libraries:
- `jsbarcode` - Barcode generation
- `qrcode` - QR code generation
- `react-csv` - CSV import/export
- `date-fns` - Date manipulation

## 📁 Project Structure

```
├── app/                          # Next.js app directory
│   ├── page.tsx                  # Main dashboard
│   ├── warehouse/page.tsx        # Warehouse module
│   └── layout.tsx                # App layout
├── components/                   # React components
│   ├── admin/                    # Admin-specific components
│   ├── warehouse/                # Warehouse management components
│   └── ui/                       # Reusable UI components
├── lib/                          # Utility functions and API calls
├── types/                        # TypeScript type definitions
├── contexts/                     # React contexts
├── comprehensive-warehouse-schema.sql # Complete database schema
└── WAREHOUSE_SYSTEM_COMPLETE.md  # Detailed system documentation
```

## 🌐 Bilingual Features

### Arabic Support:
- **Complete Arabic translations** for all UI elements
- **RTL layout** support for Arabic text
- **Arabic data fields** in all database tables
- **Cultural adaptations** for Middle Eastern business

### Language Switching:
- **Dynamic language switching** without page reload
- **Persistent language preference** across sessions
- **Context-aware translations** based on user selection

## 📈 Business Benefits

### Operational Efficiency:
- **Real-time inventory** visibility
- **Automated stock** level calculations
- **Streamlined workflows** for common operations
- **Reduced manual errors** through validation

### Reporting & Analytics:
- **Comprehensive reporting** for decision making
- **Real-time dashboards** for monitoring
- **Export capabilities** for external analysis
- **Custom report** building

### Scalability:
- **Multi-warehouse** support
- **Unlimited products** and categories
- **Flexible user roles** and permissions
- **API-ready** for integrations

## 🔒 Security Features

- **Row Level Security (RLS)** for data protection
- **User authentication** and authorization
- **Role-based access** control
- **Data validation** and sanitization
- **Audit trails** for all operations

## 🎯 Usage Guide

### Getting Started:
1. **Access the system** via the main dashboard
2. **Navigate to Warehouse** module from admin panel
3. **Set up warehouses** and product catalog
4. **Configure inventory** levels and reorder points
5. **Start recording** stock movements
6. **Generate reports** for analysis

### Key Workflows:
- **Stock Receipt** - Record incoming inventory
- **Stock Issue** - Record outgoing inventory
- **Stock Transfer** - Move between warehouses
- **Physical Count** - Perform stocktaking
- **Report Generation** - Create and export reports

## 📞 Support

For support and questions:
- **Documentation**: See `WAREHOUSE_SYSTEM_COMPLETE.md`
- **Database Schema**: See `comprehensive-warehouse-schema.sql`
- **Issues**: Create an issue in the repository

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 System Status: COMPLETE

✅ **All 10 modules implemented**  
✅ **Complete bilingual support**  
✅ **Database schema ready**  
✅ **UI components built**  
✅ **API functions created**  
✅ **Sample data included**  
✅ **Documentation complete**  

**🎯 Ready for immediate deployment and use!**
