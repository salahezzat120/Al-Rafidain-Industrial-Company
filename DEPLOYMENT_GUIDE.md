# 🚀 Deployment Guide - Al-Rafidain Warehouse System

## 📋 Pre-Deployment Checklist

### ✅ System Requirements
- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **PostgreSQL** 13.0 or higher (or Supabase)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### ✅ Environment Setup
1. **Supabase Project** created and configured
2. **Environment variables** configured
3. **Database schema** deployed
4. **Dependencies** installed

---

## 🗄️ Database Deployment

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### Step 2: Deploy Database Schema
```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the complete schema
\i comprehensive-warehouse-schema.sql
```

### Step 3: Verify Database Setup
```sql
-- Check if all tables are created
\dt

-- Verify sample data
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM warehouses;
SELECT COUNT(*) FROM inventory;
```

---

## 🔧 Application Deployment

### Step 1: Environment Configuration
```bash
# Copy environment template
cp env.example .env.local

# Edit with your values
nano .env.local
```

**Required Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build Application
```bash
npm run build
```

### Step 4: Start Production Server
```bash
npm start
```

---

## 🌐 Web Server Configuration

### Nginx Configuration (Recommended)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Apache Configuration
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

---

## 🔒 Security Configuration

### Step 1: Enable Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables
```

### Step 2: Create Security Policies
```sql
-- Example policy for warehouses
CREATE POLICY "Users can view warehouses" ON warehouses
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage warehouses" ON warehouses
    FOR ALL USING (auth.role() = 'admin');
```

### Step 3: Configure CORS
```sql
-- In Supabase Dashboard > Settings > API
-- Add your domain to allowed origins
```

---

## 📊 Performance Optimization

### Step 1: Database Indexes
```sql
-- Verify indexes are created
\d+ products
\d+ inventory
\d+ stock_movements
```

### Step 2: Connection Pooling
```javascript
// In your Supabase client configuration
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);
```

### Step 3: Enable Caching
```javascript
// In next.config.js
module.exports = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  // Enable static optimization
  output: 'standalone',
};
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    
    - name: Deploy to server
      run: |
        # Your deployment commands here
        echo "Deploying to production..."
```

---

## 📱 Mobile Responsiveness

### PWA Configuration
```javascript
// In next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // Your existing config
});
```

### Mobile Testing
- **iOS Safari** - Test RTL layout
- **Android Chrome** - Test touch interactions
- **Tablet devices** - Test responsive breakpoints

---

## 🌍 Internationalization

### Language Configuration
```javascript
// Verify language context is working
// Test Arabic RTL layout
// Test English LTR layout
// Test language switching
```

### RTL Support Verification
```css
/* Ensure RTL styles are applied */
[dir="rtl"] {
  text-align: right;
}

[dir="rtl"] .sidebar {
  right: 0;
  left: auto;
}
```

---

## 📈 Monitoring & Analytics

### Step 1: Error Tracking
```javascript
// Add error tracking (e.g., Sentry)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

### Step 2: Performance Monitoring
```javascript
// Add performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## 🔧 Maintenance

### Daily Tasks
- **Monitor system performance**
- **Check error logs**
- **Verify backup status**

### Weekly Tasks
- **Update dependencies**
- **Review security logs**
- **Performance optimization**

### Monthly Tasks
- **Database maintenance**
- **Security updates**
- **Feature updates**

---

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     "https://your-project.supabase.co/rest/v1/"
```

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### RTL Layout Issues
```css
/* Check if RTL styles are loading */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}
```

---

## 📞 Support

### Documentation
- **System Documentation**: `WAREHOUSE_SYSTEM_COMPLETE.md`
- **API Documentation**: Check Supabase dashboard
- **Component Documentation**: Inline code comments

### Contact
- **Technical Issues**: Create GitHub issue
- **Business Questions**: Contact Al-Rafidain IT team
- **Emergency Support**: Available 24/7

---

## ✅ Post-Deployment Verification

### Functional Testing
- [ ] **User authentication** works
- [ ] **Warehouse management** functions
- [ ] **Product catalog** displays correctly
- [ ] **Inventory tracking** updates in real-time
- [ ] **Stock movements** record properly
- [ ] **Barcode generation** works
- [ ] **Reports** generate correctly
- [ ] **Bulk upload** processes files
- [ ] **Language switching** works
- [ ] **RTL layout** displays properly

### Performance Testing
- [ ] **Page load times** < 3 seconds
- [ ] **Database queries** < 1 second
- [ ] **Mobile responsiveness** works
- [ ] **Cross-browser compatibility** verified

### Security Testing
- [ ] **Authentication** required for all routes
- [ ] **Data validation** prevents SQL injection
- [ ] **CORS** configured correctly
- [ ] **HTTPS** enabled in production

---

**🎉 System is ready for production use!**
