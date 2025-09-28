# Arabic & English Stock Movements Support

## Overview
The stock movements system now supports both Arabic and English languages with full bilingual functionality.

## Database Structure

### Stock Movements Table (Bilingual)
The `stock_movements` table now includes Arabic columns for all text fields:

| English Column | Arabic Column | Description |
|----------------|---------------|-------------|
| `movement_type` | `movement_type_ar` | Movement type in Arabic |
| `reference_number` | `reference_number_ar` | Reference number in Arabic |
| `notes` | `notes_ar` | Notes in Arabic |
| `created_by` | `created_by_ar` | Creator name in Arabic |

### Movement Types (Arabic Translations)
| English | Arabic | Description |
|---------|--------|-------------|
| IN | دخول | Stock entry |
| OUT | خروج | Stock exit |
| TRANSFER | نقل | Stock transfer |
| ADJUSTMENT | تعديل | Stock adjustment |
| RECEIPT | استلام | Stock receipt |
| ISSUE | إصدار | Stock issue |
| RETURN | إرجاع | Stock return |

## Frontend Integration

### Form Fields (Bilingual)
When creating stock movements, the form should include:

**English Fields:**
- Movement Type (English)
- Reference Number (English)
- Notes (English)
- Created By (English)

**Arabic Fields:**
- Movement Type (Arabic)
- Reference Number (Arabic) 
- Notes (Arabic)
- Created By (Arabic)

### Display Logic
The interface should display the appropriate language based on user preference:

```typescript
// Example display logic
const displayMovementType = isRTL ? movement.movement_type_ar : movement.movement_type;
const displayNotes = isRTL ? movement.notes_ar : movement.notes;
const displayReference = isRTL ? movement.reference_number_ar : movement.reference_number;
```

## API Integration

### Creating Stock Movements
When creating stock movements, include both English and Arabic data:

```typescript
const movementData = {
  product_id: 1,
  warehouse_id: 1,
  movement_type: 'IN',
  movement_type_ar: 'دخول',
  quantity: 100,
  unit_price: 1.50,
  reference_number: 'REF-001',
  reference_number_ar: 'مرجع-001',
  notes: 'Initial stock entry',
  notes_ar: 'إدخال مخزون أولي',
  created_by: 'System',
  created_by_ar: 'النظام'
};
```

### Querying Stock Movements
When fetching stock movements, include both language versions:

```sql
SELECT 
  sm.*,
  sm.movement_type_ar,
  sm.reference_number_ar,
  sm.notes_ar,
  sm.created_by_ar,
  p.product_name,
  p.product_name_ar,
  w.warehouse_name,
  w.warehouse_name_ar
FROM stock_movements sm
LEFT JOIN products p ON sm.product_id = p.id
LEFT JOIN warehouses w ON sm.warehouse_id = w.id;
```

## Implementation Steps

### 1. Run the Database Script
```sql
-- Execute this file
\i fix-stock-movements-complete.sql
```

### 2. Update Frontend Components
Update the stock movements form to include Arabic fields:

```tsx
// Add Arabic input fields
<Input
  placeholder="Reference Number (Arabic)"
  value={formData.reference_number_ar}
  onChange={(e) => setFormData({...formData, reference_number_ar: e.target.value})}
/>

<Textarea
  placeholder="Notes (Arabic)"
  value={formData.notes_ar}
  onChange={(e) => setFormData({...formData, notes_ar: e.target.value})}
/>
```

### 3. Update Type Definitions
Add Arabic fields to the TypeScript interfaces:

```typescript
interface CreateStockMovementData {
  // ... existing fields
  movement_type_ar?: string;
  reference_number_ar?: string;
  notes_ar?: string;
  created_by_ar?: string;
}

interface StockMovement {
  // ... existing fields
  movement_type_ar: string;
  reference_number_ar: string;
  notes_ar: string;
  created_by_ar: string;
}
```

## Benefits

✅ **Full Bilingual Support** - All stock movement data in both languages
✅ **User Experience** - Users can work in their preferred language
✅ **Data Integrity** - Both language versions are stored together
✅ **Reporting** - Reports can be generated in either language
✅ **Audit Trail** - Complete bilingual audit trail

## Testing

### Verify Arabic Support
Run this query to check Arabic data:

```sql
SELECT 
  movement_type,
  movement_type_ar,
  reference_number,
  reference_number_ar,
  notes,
  notes_ar
FROM stock_movements
WHERE movement_type_ar IS NOT NULL;
```

### Test Form Submission
1. Create a stock movement with both English and Arabic data
2. Verify both versions are saved
3. Check that the display shows the correct language based on user preference

## Migration Notes

- Existing stock movements will have NULL Arabic fields
- New movements will include both English and Arabic data
- The system gracefully handles missing Arabic data by falling back to English
