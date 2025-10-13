# Visit Tables Setup Instructions

## Manual Database Setup

Since the automated setup didn't work, please follow these manual steps to set up the visit tables:

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

### Step 2: Execute the SQL Script
Copy and paste the entire contents of `setup-visit-tables.sql` into the SQL Editor and execute it.

### Step 3: Verify Tables Created
After execution, you should see:
- `representative_visits` table with sample data
- `visits` table with sample data (fallback)
- Indexes for better performance
- Updated_at triggers

## What the Script Creates

### Tables Created:
1. **representative_visits** - Primary table for storing representative visits
2. **visits** - Fallback table for visit data

### Sample Data Included:
- **صلاح عزت (REP-472788)**: 4 visits (3 completed, 1 no-show, 1 in-progress)
- **احمد جعفر (REP-279170)**: 3 visits (2 completed, 1 cancelled)
- **احمد الدمراوي (REP-319646)**: 4 visits (3 completed, 1 scheduled)

### Visit Types:
- customer_visit
- delivery
- pickup
- maintenance
- inspection
- meeting

### Visit Statuses:
- scheduled
- in_progress
- completed
- cancelled
- no_show
- late

## After Setup

Once the tables are created, the visit report modal will:
1. ✅ Display real visit data from the database
2. ✅ Show accurate statistics (total visits, completed, success rate, etc.)
3. ✅ Allow filtering and searching through actual visit records
4. ✅ Export real visit data to Excel
5. ✅ Show all requested information:
   - Representative Name
   - Representative ID
   - Client Name
   - Client Location
   - Client Phone Number
   - Visit Success Status

## Testing the Integration

After setting up the tables, you can test by:
1. Opening the Representatives tab
2. Clicking the three dots menu on any representative card
3. Selecting "Visit Report"
4. The modal should now show real visit data instead of empty state

## Troubleshooting

If you encounter issues:
1. Make sure the SQL script executed without errors
2. Check that the tables exist in your Supabase dashboard
3. Verify that sample data was inserted
4. Check the browser console for any error messages

The visit report system is designed to work with both tables as fallback, so it should work even if only one table is created successfully.
