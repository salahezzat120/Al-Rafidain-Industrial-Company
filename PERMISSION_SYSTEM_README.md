# User Permission System

## Overview

The User Permission System allows administrators to control what pages each user can view, edit, or have admin access to. This provides granular control over user access within the Al-Rafidain Industrial Company delivery management system.

## Features

### Permission Levels
- **None**: User cannot see or access the page
- **View**: User can view the page but cannot make changes
- **Edit**: User can view and modify content on the page
- **Admin**: User has complete control including user management capabilities

### Available Pages
The system controls access to all major sections:
- Overview Dashboard
- User Management
- Employee Management
- Representative Management
- Customer Management
- Warehouse Management
- Payment Tracking
- Attendance
- Chat Support
- Live Map
- Vehicle Fleet
- Delivery Tasks
- Analytics
- Alerts & Notifications
- Visit Management
- Internal Messaging
- After Sales Support
- System Settings

## Implementation

### 1. Database Schema

The system uses a `user_permissions` table to store permissions:

```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  permissions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### 2. Permission Types

```typescript
type PermissionLevel = 'none' | 'view' | 'edit' | 'admin'

interface PagePermission {
  pageId: string
  pageName: string
  permission: PermissionLevel
}
```

### 3. Components

#### PermissionSelector
A comprehensive UI component for selecting page permissions during user creation or editing.

#### PermissionGuard
A wrapper component that protects individual pages based on user permissions.

#### PermissionContext
React context that manages user permissions throughout the application.

### 4. Navigation Control

The admin sidebar automatically hides pages that users don't have access to, providing a clean and secure interface.

## Usage

### Creating Users with Permissions

1. Navigate to User Management
2. Click "Add New User"
3. Fill in user details (name, email, password, role)
4. Use the Permission Selector to set page access levels
5. Click "Create User"

### Permission Selector Interface

The permission selector provides:
- Visual indicators for each permission level
- Clear descriptions of what each level allows
- Easy-to-use dropdowns for each page
- Color-coded badges showing current permissions

### Permission Levels Explained

- **🔒 No Access**: Page is completely hidden from user
- **👁️ View Only**: User can see page content but cannot modify
- **✏️ View & Edit**: User can view and make changes to content
- **🛡️ Full Admin**: Complete control including user management

## Security Features

### Row Level Security (RLS)
- Users can only access their own permissions
- Admins can manage all permissions
- Secure database-level access control

### Permission Validation
- Real-time permission checking
- Automatic navigation filtering
- Page-level access control

### Audit Trail
- Permission changes are tracked
- Created and updated timestamps
- User activity logging

## Database Setup

Run the setup script to initialize the permission system:

```sql
-- Execute setup-permission-system.sql
```

This will:
1. Create the user_permissions table
2. Set up indexes for performance
3. Configure Row Level Security
4. Create helper functions
5. Grant necessary permissions
6. Set up default permissions for existing users

## API Functions

### Core Functions
- `getUserPermissions(userId)`: Get user's permissions
- `createUserPermissions(data)`: Create new permissions
- `updateUserPermissions(userId, data)`: Update permissions
- `deleteUserPermissions(userId)`: Remove permissions
- `hasPagePermission(userId, pageId, level)`: Check specific permission

### Helper Functions
- `canAccessPage(permissions, pageId)`: Check if user can access page
- `getPagePermissionLevel(permissions, pageId)`: Get permission level for page

## Integration

### In Components
```typescript
import { usePermissions } from '@/contexts/permission-context'

function MyComponent() {
  const { canAccess, hasPermission } = usePermissions()
  
  if (!canAccess('users')) {
    return <div>Access denied</div>
  }
  
  return <div>User management content</div>
}
```

### With Permission Guard
```typescript
import { PermissionGuard } from '@/components/permission-guard'

function UserManagement() {
  return (
    <PermissionGuard pageId="users" requiredLevel="edit">
      <UserManagementContent />
    </PermissionGuard>
  )
}
```

## Best Practices

### 1. Default Permissions
- New users should have minimal default permissions
- Only grant necessary access
- Regularly review and audit permissions

### 2. Role-Based Defaults
- Admins: Full access to all pages
- Supervisors: Limited access to management pages
- Representatives: Access to delivery-related pages only

### 3. Security Considerations
- Always validate permissions on the server side
- Use permission guards for sensitive operations
- Regular permission audits
- Principle of least privilege

## Troubleshooting

### Common Issues

1. **User can't see navigation items**
   - Check if user has permissions for those pages
   - Verify permission levels are set correctly

2. **Permission changes not taking effect**
   - Refresh the page or restart the application
   - Check if permissions were saved to database

3. **Database connection errors**
   - Verify Supabase connection
   - Check RLS policies are correctly configured

### Debugging

Enable debug logging to troubleshoot permission issues:

```typescript
// In permission context
console.log('User permissions:', userPermissions)
console.log('Can access users:', canAccess('users'))
```

## Future Enhancements

### Planned Features
- Permission templates for common roles
- Bulk permission management
- Permission inheritance
- Time-based permissions
- Permission approval workflows

### Advanced Features
- Custom permission levels
- Page-specific permission overrides
- Permission analytics and reporting
- Integration with external identity providers

## Support

For issues or questions about the permission system:
1. Check the troubleshooting section
2. Review the database setup
3. Verify permission configurations
4. Contact system administrator

---

*This permission system provides comprehensive access control for the Al-Rafidain Industrial Company delivery management system, ensuring security and proper user management.*
