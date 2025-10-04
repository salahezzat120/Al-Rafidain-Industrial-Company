export type PermissionLevel = 'none' | 'edit'

export interface PagePermission {
  pageId: string
  pageName: string
  permission: PermissionLevel
}

export interface UserPermissions {
  userId: string
  permissions: PagePermission[]
  createdAt: string
  updatedAt: string
}

export interface CreateUserPermissionData {
  userId: string
  permissions: PagePermission[]
}

export interface UpdateUserPermissionData {
  permissions: PagePermission[]
}

// Available pages in the system
export const AVAILABLE_PAGES = [
  { id: 'overview', name: 'Overview', description: 'Dashboard overview' },
  { id: 'users', name: 'User Management', description: 'Manage admin and supervisor users' },
  { id: 'employees', name: 'Employee Management', description: 'Manage company employees' },
  { id: 'representatives', name: 'Representative Management', description: 'Manage delivery representatives' },
  { id: 'customers', name: 'Customer Management', description: 'Manage customer information' },
  { id: 'warehouse', name: 'Warehouse Management', description: 'Manage inventory and warehouses' },
  { id: 'payments', name: 'Payment Tracking', description: 'Track payments and transactions' },
  { id: 'attendance', name: 'Attendance', description: 'Employee attendance tracking' },
  { id: 'chat-support', name: 'Chat Support', description: 'Customer support chat' },
  { id: 'live-map', name: 'Live Map', description: 'Real-time delivery tracking' },
  { id: 'vehicles', name: 'Vehicle Fleet', description: 'Manage delivery vehicles' },
  { id: 'deliveries', name: 'Delivery Tasks', description: 'Manage delivery tasks' },
  { id: 'analytics', name: 'Analytics', description: 'System analytics and reports' },
  { id: 'alerts', name: 'Alerts & Notifications', description: 'System alerts and notifications' },
  { id: 'visits', name: 'Visit Management', description: 'Customer visit management' },
  { id: 'messaging', name: 'Internal Messaging', description: 'Internal communication' },
  { id: 'after-sales', name: 'After Sales Support', description: 'Post-sale customer support' },
  { id: 'settings', name: 'System Settings', description: 'System configuration' },
] as const

export type PageId = typeof AVAILABLE_PAGES[number]['id']
