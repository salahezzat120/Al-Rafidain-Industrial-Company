"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { UserPlus, Shield, Users, Eye, EyeOff, AlertCircle, CheckCircle, Edit, Trash2, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { getUsers, createUser, updateUser, deleteUser, checkEmailExists, type User, type CreateUserData, type UpdateUserData } from "@/lib/users"
import { SupervisorPermissions } from "@/components/admin/supervisor-permissions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function UsersTabSimple() {
  const { t, isRTL } = useLanguage()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    confirmPassword: ''
  })

  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    confirmPassword: ''
  })

  // Load users on component mount
  React.useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const usersData = await getUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
      setMessage({ type: 'error', text: 'Failed to load users' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    if (newUser.password !== newUser.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (newUser.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      return
    }

    setCreateLoading(true)
    setMessage(null)

    try {
      const userData: CreateUserData = {
        name: newUser.name,
        email: newUser.email,
        password_hash: newUser.password, // In production, this should be hashed
        role: newUser.role as 'admin' | 'supervisor' | 'representative'
      }

      await createUser(userData)
      setMessage({ type: 'success', text: `${newUser.role} user created successfully!` })
      setNewUser({ name: '', email: '', password: '', role: '', confirmPassword: '' })
      setIsCreateModalOpen(false)
      loadUsers() // Reload users list
    } catch (error: any) {
      console.error('Error creating user:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to create user' })
    } finally {
      setCreateLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditUser({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      confirmPassword: ''
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    if (!editUser.name || !editUser.email || !editUser.role) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    if (editUser.password && editUser.password !== editUser.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (editUser.password && editUser.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      return
    }

    setEditLoading(true)
    setMessage(null)

    try {
      const updateData: UpdateUserData = {
        name: editUser.name,
        email: editUser.email,
        role: editUser.role as 'admin' | 'supervisor' | 'representative'
      }

      if (editUser.password) {
        updateData.password_hash = editUser.password
      }

      await updateUser(editingUser.id, updateData)
      setMessage({ type: 'success', text: 'User updated successfully!' })
      setEditUser({ name: '', email: '', password: '', role: '', confirmPassword: '' })
      setEditingUser(null)
      setIsEditModalOpen(false)
      loadUsers() // Reload users list
    } catch (error: any) {
      console.error('Error updating user:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update user' })
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setDeleteLoading(userId)
    try {
      await deleteUser(userId)
      setMessage({ type: 'success', text: 'User deleted successfully!' })
      loadUsers() // Reload users list
    } catch (error: any) {
      console.error('Error deleting user:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to delete user' })
    } finally {
      setDeleteLoading(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />
      case 'supervisor':
        return <Users className="h-4 w-4" />
      case 'representative':
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-3xl font-bold text-gray-900">{t("nav.userManagement")}</h2>
          <p className="text-gray-600 mt-1">{isRTL ? "إدارة المستخدمين والصلاحيات" : "Manage admin and supervisor users"}</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {isRTL ? "إضافة مستخدم جديد" : "Add New User"}
              <UserPlus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isRTL ? "إنشاء مستخدم جديد" : "Create New User"}</DialogTitle>
              <DialogDescription>
                {isRTL ? "إضافة مسؤول أو مشرف جديد إلى النظام" : "Add a new admin or supervisor to the system"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{isRTL ? "الاسم الكامل" : "Full Name"}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={isRTL ? "أدخل الاسم الكامل" : "Enter full name"}
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{isRTL ? "البريد الإلكتروني" : "Email Address"}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={isRTL ? "أدخل البريد الإلكتروني" : "Enter email address"}
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{isRTL ? "الدور" : "Role"}</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? "اختر دور المستخدم" : "Select user role"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                        <Shield className="h-4 w-4" />
                        <span>{isRTL ? "مسؤول" : "Admin"}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="supervisor">
                      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                        <Users className="h-4 w-4" />
                        <span>{isRTL ? "مشرف" : "Supervisor"}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{isRTL ? "كلمة المرور" : "Password"}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isRTL ? "أدخل كلمة المرور (6 أحرف على الأقل)" : "Enter password (min. 6 characters)"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600`}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={isRTL ? "تأكيد كلمة المرور" : "Confirm password"}
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                  required
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              {message && (
                <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                  {message.type === 'error' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setNewUser({ name: '', email: '', password: '', role: '', confirmPassword: '' })
                    setMessage(null)
                  }}
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={handleCreateUser}
                  disabled={createLoading}
                >
                  {createLoading ? (
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{isRTL ? "جاري الإنشاء..." : "Creating..."}</span>
                    </div>
                  ) : (
                    isRTL ? 'إنشاء مستخدم' : 'Create User'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for User Management and Supervisor Permissions */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">{isRTL ? "جميع المستخدمين" : "All Users"}</TabsTrigger>
          <TabsTrigger value="supervisor-permissions">{isRTL ? "صلاحيات المشرفين" : "Supervisor Permissions"}</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Users List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription className="text-sm">{user.email}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleteLoading === user.id ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Deleting...</span>
                                </div>
                              ) : (
                                'Delete'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <Badge 
                      variant="secondary" 
                      className={
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : user.role === 'supervisor'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(user.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="supervisor-permissions" className="space-y-4">
          <SupervisorPermissions />
        </TabsContent>
      </Tabs>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                type="text"
                placeholder="Enter full name"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email address"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editUser.role} onValueChange={(value) => setEditUser({ ...editUser, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="supervisor">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Supervisor</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="representative">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Representative</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showEditPassword ? "text" : "password"}
                  placeholder="Enter new password (leave blank to keep current)"
                  value={editUser.password}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {editUser.password && (
              <div className="space-y-2">
                <Label htmlFor="edit-confirmPassword">Confirm New Password</Label>
                <Input
                  id="edit-confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={editUser.confirmPassword}
                  onChange={(e) => setEditUser({ ...editUser, confirmPassword: e.target.value })}
                />
              </div>
            )}

            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                {message.type === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditUser({ name: '', email: '', password: '', role: '', confirmPassword: '' })
                  setEditingUser(null)
                  setMessage(null)
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={handleUpdateUser}
                disabled={editLoading}
              >
                {editLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update User'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
