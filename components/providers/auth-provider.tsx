'use client';

import * as React from 'react';
import { apiClient } from '@/lib/api-client';

export interface UserSession {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
  district?: string;
  chiefdom?: string;
  community?: string;
  nin?: string;
  idDocumentType?: string;
  idDocumentFrontUrl?: string;
  idDocumentBackUrl?: string;
  profilePhotoUrl?: string;
  farmPhotoUrl?: string;
  farmName?: string;
  farmAddress?: string;
  farmSize?: string;
  farmingExperience?: string;
  primaryCrops?: string;
  farmDescription?: string;
  businessName?: string;
  status?: string;
  verificationStatus?: string;
  isEmailVerified: boolean;
  notifyNewOrders?: boolean;
  notifyListingApprovals?: boolean;
  notifyMessages?: boolean;
  notifyBroadcasts?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserSession>;
  logout: () => void;
  refreshUser: () => Promise<UserSession | null>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserSession | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    }
  }, []);

  // Re-sync the cached session with the server once we have a token, so fields
  // that can change server-side after login (e.g. verification status, photos,
  // farm details) don't stay stuck on a stale localStorage snapshot.
  React.useEffect(() => {
    if (token) {
      apiClient
        .get<UserSession>('/api/user/profile')
        .then((profile) => {
          setUser(profile);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(profile));
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email: string, password: string): Promise<UserSession> => {
    const data = await apiClient.post<any>('/api/auth/login', { email, password });
    const userSession: UserSession = data.user;

    setToken(data.accessToken);
    setUser(userSession);

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(userSession));
    }

    return userSession;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        apiClient.post('/api/auth/logout', { refreshToken }).catch(() => {});
      }
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  const refreshUser = async (): Promise<UserSession | null> => {
    try {
      const profile = await apiClient.get<UserSession>('/api/user/profile');
      setUser(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(profile));
      }
      return profile;
    } catch {
      return user;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
