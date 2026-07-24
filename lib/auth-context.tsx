"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authAPI, setAuthToken, removeAuthToken, getAuthToken, type AuthResponse } from "./api"

interface User {
  id: number
  name: string
  email: string
  role: "farmer" | "buyer"
  phone?: string
  location?: string
  farmSize?: string
  farmingExperience?: string
  businessName?: string
  businessType?: string
  isEmailVerified: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("wimakit_user")
    const token = getAuthToken()

    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response: AuthResponse = await authAPI.login({ email, password })

      setUser(response.user)
      setAuthToken(response.token)
      localStorage.setItem("wimakit_user", JSON.stringify(response.user))

      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    removeAuthToken()
    localStorage.removeItem("wimakit_user")
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
