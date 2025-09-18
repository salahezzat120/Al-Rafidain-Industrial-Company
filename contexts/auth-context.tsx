"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, AuthContextType } from "@/types/auth"
import { authenticateUser } from "@/lib/auth"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Check for stored user session only on client side
    const storedUser = localStorage.getItem("delivery-user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("delivery-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      console.log('Auth context: Starting login for', email)
      const authenticatedUser = await authenticateUser(email, password)
      console.log('Auth context: Authentication result', authenticatedUser)
      
      if (authenticatedUser) {
        console.log('Auth context: Setting user', authenticatedUser)
        setUser(authenticatedUser)
        if (isClient) {
          localStorage.setItem("delivery-user", JSON.stringify(authenticatedUser))
          console.log('Auth context: User stored in localStorage')
        }
        return true
      }
      console.log('Auth context: Authentication failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    if (isClient) {
      localStorage.removeItem("delivery-user")
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
