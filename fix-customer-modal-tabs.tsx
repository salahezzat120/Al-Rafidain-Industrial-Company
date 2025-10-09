// This is a helper file to show the correct structure after removing the history and communication tabs

// The TabsList should be:
<TabsList className="grid w-full grid-cols-3">
  <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
  <TabsTrigger value="preferences">التفضيلات</TabsTrigger>
  <TabsTrigger value="notes">الملاحظات</TabsTrigger>
</TabsList>

// And only these TabsContent sections should remain:
// 1. TabsContent value="overview" - Contact Information
// 2. TabsContent value="preferences" - Customer Preferences  
// 3. TabsContent value="notes" - Customer Notes

// The removed sections were:
// - TabsContent value="history" - Inquiries, Complaints, Maintenance, Warranties, Follow-up
// - TabsContent value="communication" - Send Message form
