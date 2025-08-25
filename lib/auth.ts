import type { User, UserRole } from "@/types/auth"

// Mock users for demonstration - replace with real API calls
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    email: "admin@delivery.com",
    password: "admin123",
    name: "John Admin",
    role: "admin",
    avatar: "/admin-avatar.png",
  },
  {
    id: "2",
    email: "supervisor@delivery.com",
    password: "super123",
    name: "Sarah Supervisor",
    role: "supervisor",
    avatar: "/supervisor-avatar.png",
  },
  {
    id: "3",
    email: "driver@delivery.com",
    password: "driver123",
    name: "Mike Driver",
    role: "driver",
    avatar: "/driver-avatar.png",
  },
]

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const user = mockUsers.find((u) => u.email === email && u.password === password)
  if (user) {
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  return null
}

export const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole)
}
