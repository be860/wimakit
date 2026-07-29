"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authAPI, setTokens, removeTokens, getAccessToken, getRefreshToken, type AuthUser, type AuthResponse } from "./api"

interface AuthResult {
  success: boolean
  message?: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: (idToken: string, role?: "farmer" | "buyer") => Promise<boolean>
  setSession: (response: AuthResponse) => void
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("wimakit_user")
    const token = getAccessToken()

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

  const setSession = (response: AuthResponse) => {
    setUser(response.user)
    setTokens(response.accessToken, response.refreshToken)
    localStorage.setItem("wimakit_user", JSON.stringify(response.user))
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response: AuthResponse = await authAPI.login({ email, password })
      setSession(response)
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const loginWithGoogle = async (idToken: string, role?: "farmer" | "buyer"): Promise<boolean> => {
    try {
      const response: AuthResponse = await authAPI.googleAuth({ idToken, role })
      setSession(response)
      return true
    } catch (error) {
      console.error("Google login failed:", error)
      return false
    }
  }

  const logout = async () => {
  try {
    const refreshToken = getRefreshToken()

    if (refreshToken) {
      await authAPI.logout(refreshToken)
    }
  } catch (err) {
    console.error(err)
  }

  setUser(null)

  removeTokens()

  localStorage.removeItem("wimakit_user")
}

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, setSession, logout, isLoading }}>
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
