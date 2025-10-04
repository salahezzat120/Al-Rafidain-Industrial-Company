// Utility functions for safe localStorage access in Next.js
// Handles SSR compatibility by checking for browser environment

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') {
      return null
    }
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('Error accessing localStorage:', error)
      return null
    }
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },

  length: (): number => {
    if (typeof window === 'undefined') {
      return 0
    }
    try {
      return localStorage.length
    } catch (error) {
      console.error('Error getting localStorage length:', error)
      return 0
    }
  },

  key: (index: number): string | null => {
    if (typeof window === 'undefined') {
      return null
    }
    try {
      return localStorage.key(index)
    } catch (error) {
      console.error('Error getting localStorage key:', error)
      return null
    }
  }
}

// Helper function to check if we're in browser environment
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined'
}

// Helper function to safely parse JSON from localStorage
export const safeParseJSON = <T>(value: string | null, defaultValue: T): T => {
  if (!value) {
    return defaultValue
  }
  try {
    return JSON.parse(value)
  } catch (error) {
    console.error('Error parsing JSON from localStorage:', error)
    return defaultValue
  }
}
