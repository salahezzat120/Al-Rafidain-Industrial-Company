# 🚨 QUICK FIX: Invalid URL Error

## ❌ **Current Error:**
```
Error: Failed to construct 'URL': Invalid URL
```

## ✅ **Immediate Solution:**

### **Step 1: Create .env file manually**
Create a file named `.env` in your project root with this content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ullghcrmleaaualynomj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbGdoY3JtbGVhYXVhbHlub21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzA3OTEsImV4cCI6MjA3Mjc0Njc5MX0.gw-uw0WuqsK1JydwyoNGgufWgmj7SGuc62l9zU-RJ9g
```

### **Step 2: Restart your development server**
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
# or
yarn dev
# or
pnpm dev
```

### **Step 3: Test the connection**
```bash
node check-database-status.js
```

You should see:
```
✅ Supabase URL: Set
✅ Supabase Key: Set
✅ Table exists!
```

## 🔧 **Alternative: Use Your Own Supabase Project**

If you want to use your own Supabase project:

1. **Go to:** https://supabase.com/dashboard
2. **Create a new project** (or use existing)
3. **Go to Settings > API**
4. **Copy your credentials:**
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Update your `.env` file** with your credentials

## 🗄️ **Database Setup**

After fixing the environment variables:

1. **Go to your Supabase Dashboard**
2. **Open the SQL Editor**
3. **Copy and paste the contents of `create-single-visit-management-table.sql`**
4. **Click "Run"**

## 🎯 **Expected Result:**

After completing these steps:
- ✅ No more "Invalid URL" error
- ✅ App loads without crashes
- ✅ Visit Management tab shows real data
- ✅ Console shows "✅ Supabase client created successfully"

## 🆘 **Still Having Issues?**

If you're still getting errors:

1. **Check the browser console** for error messages
2. **Make sure the `.env` file is in the project root** (same level as package.json)
3. **Restart your development server** completely
4. **Check that the Supabase URL is valid** (should start with https://)

The app should now work properly! 🎉
