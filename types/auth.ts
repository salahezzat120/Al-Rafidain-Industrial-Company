export type UserRole = "admin" | "supervisor" | "representative"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
}

// Database user interface matching the users table schema
export interface DatabaseUser {
  id: string
  email: string
  password_hash: string | null
  role: UserRole
  name: string
  created_at: string
  updated_at: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}
