# 🚀 Visit Management System Setup Instructions

## ❌ **Current Issue: Environment Variables Missing**

The app is not reading from the database because the Supabase environment variables are not configured.

## ✅ **Solution Steps:**

### **Step 1: Create Environment File**

1. **Copy the example file:**
   ```bash
   copy env.example .env
   ```

2. **Edit the `.env` file** and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### **Step 2: Get Your Supabase Credentials**

1. **Go to your Supabase Dashboard:** https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings > API**
4. **Copy the following:**
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Step 3: Create the Database Table**

1. **Go to your Supabase Dashboard**
2. **Open the SQL Editor**
3. **Copy and paste the contents of `create-single-visit-management-table.sql`**
4. **Click "Run" to execute the script**

### **Step 4: Test the Connection**

Run this command to test if everything is working:
```bash
node check-database-status.js
```

You should see:
```
✅ Supabase URL: Set
✅ Supabase Key: Set
✅ Table exists!
📋 Found X records
```

### **Step 5: Restart Your Application**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## 🔍 **Troubleshooting:**

### **If you see "Missing Supabase configuration":**
- Make sure you created the `.env` file
- Check that the environment variables are correct
- Restart your development server

### **If you see "relation does not exist":**
- Run the `create-single-visit-management-table.sql` script in Supabase
- Make sure the script executed successfully

### **If the app still shows mock data:**
- Check the browser console for error messages
- Make sure you're using the new `VisitManagementSingleTab` component
- Verify the database has data by running the check script

## 📋 **Quick Checklist:**

- [ ] Created `.env` file with Supabase credentials
- [ ] Ran the database setup script in Supabase
- [ ] Updated the main page to use `VisitManagementSingleTab`
- [ ] Restarted the development server
- [ ] Tested with `node check-database-status.js`

## 🎯 **Expected Result:**

After completing these steps, your Visit Management tab should:
- ✅ Show real data from the database
- ✅ Display "Database records: X" in the header
- ✅ Allow you to create, edit, and manage visits
- ✅ Show loading states and error handling

## 🆘 **Need Help?**

If you're still having issues:
1. Check the browser console for error messages
2. Run `node check-database-status.js` to verify database connection
3. Make sure all files are saved and the server is restarted
