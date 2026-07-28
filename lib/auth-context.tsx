"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authAPI, setAuthToken, removeAuthToken, getAuthToken, type AuthUser, type AuthResponse } from "./api"

interface AuthResult {
  success: boolean
  message?: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<AuthResult>
  loginWithGoogle: (idToken: string, role?: "farmer" | "buyer") => Promise<AuthResult>
  setSession: (response: AuthResponse) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("wimakit_user")
    const token = getAuthToken()

    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
      } catch (e) {
        console.error("Failed to parse stored user:", e)
      }
    }
    setIsLoading(false)
  }, [])

  const handleAuthSuccess = (response: AuthResponse) => {
    setUser(response.user)
    setAuthToken(response.token)
    localStorage.setItem("wimakit_user", JSON.stringify(response.user))
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response: AuthResponse = await authAPI.login({ email, password })
      handleAuthSuccess(response)
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const loginWithGoogle = async (idToken: string, role?: "farmer" | "buyer"): Promise<boolean> => {
    try {
      const response: AuthResponse = await authAPI.googleAuth({ idToken, role })
      handleAuthSuccess(response)
      return true
    } catch (error) {
      console.error("Google login failed:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    removeAuthToken()
    localStorage.removeItem("wimakit_user")
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
