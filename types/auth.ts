export type UserRole = "admin" | "supervisor" | "representative"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}
