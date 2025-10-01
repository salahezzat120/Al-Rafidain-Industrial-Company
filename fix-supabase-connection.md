# Fix Supabase Connection Issue

## The Problem
Even though tables exist, you're getting "Database tables not found" error. This is usually a connection issue.

## Quick Fixes

### 1. Check Environment Variables
Make sure you have a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Restart Development Server
```bash
# Stop the dev server (Ctrl+C)
# Then restart
npm run dev
```

### 3. Check Supabase Dashboard
- Go to your Supabase project dashboard
- Check if your project is active
- Verify the URL and keys are correct

### 4. Test Connection
Run this in your Supabase SQL Editor to test:

```sql
-- Test basic connection
SELECT 'Connection working!' as status;

-- Test table access
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as main_groups_count FROM main_groups;
```

### 5. Check Browser Console
- Open browser developer tools (F12)
- Look for any Supabase connection errors
- Check Network tab for failed requests

### 6. Verify Supabase Client
The issue might be in how the Supabase client is configured. Check your `lib/supabase.ts` file.

## Common Issues:
1. **Wrong environment variables** - Double-check your Supabase URL and keys
2. **Project paused** - Check if your Supabase project is active
3. **Wrong database** - Make sure you're connected to the right project
4. **Cached connection** - Restart the dev server

## If Still Not Working:
1. Create a new `.env.local` file with fresh credentials
2. Restart your development server
3. Clear browser cache
4. Check Supabase project status
