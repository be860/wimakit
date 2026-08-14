import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  apiClient,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
  ONBOARDING_COMPLETED_KEY,
} from '../services/api-client';
import {
  getStorageItem,
  setStorageItem,
  deleteStorageItem,
} from '../services/storage';

export interface UserSession {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
  isEmailVerified: boolean;
  status?: string;
  verificationStatus?: string;
  profilePhotoUrl?: string;
}

export interface BuyerRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  // The backend rejects a buyer registration that omits any of these three
  // (AuthController.Register), so they are collected on the sign-up form
  // rather than defaulted here.
  location: string;
  businessName: string;
  businessType: string;
}

export interface RegisterResponse {
  success: boolean;
  requiresVerification: boolean;
  email: string;
  message: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  login: (email: string, password: string) => Promise<UserSession>;
  registerBuyer: (payload: BuyerRegisterPayload) => Promise<RegisterResponse>;
  verifyOtp: (email: string, otp: string) => Promise<UserSession>;
  resendOtp: (email: string) => Promise<string>;
  googleSignIn: (idToken: string) => Promise<UserSession>;
  logout: () => Promise<void>;
  setOnboardingCompleted: () => Promise<void>;
  refreshUser: () => Promise<UserSession | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(false);

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await getStorageItem(TOKEN_KEY);
        const storedUser = await getStorageItem(USER_KEY);
        const onboardingCompleted = await getStorageItem(ONBOARDING_COMPLETED_KEY);

        if (onboardingCompleted === 'true') {
          setHasCompletedOnboardingState(true);
        }

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        await deleteStorageItem(USER_KEY);
        await deleteStorageItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  // Re-sync cached profile with backend when token is set
  useEffect(() => {
    if (token) {
      apiClient
        .get<UserSession>('/api/user/profile')
        .then(async (profile) => {
          setUser(profile);
          await setStorageItem(USER_KEY, JSON.stringify(profile));
        })
        .catch(() => {});
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<UserSession> => {
    const data = await apiClient.post<any>('/api/auth/login', {
      email: email.trim(),
      password,
    });
    const userSession: UserSession = data.user;

    setToken(data.accessToken);
    setUser(userSession);

    await setStorageItem(TOKEN_KEY, data.accessToken);
    if (data.refreshToken) {
      await setStorageItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    await setStorageItem(USER_KEY, JSON.stringify(userSession));

    return userSession;
  };

  const registerBuyer = async (payload: BuyerRegisterPayload): Promise<RegisterResponse> => {
    // `/api/auth/register` is [FromForm] on the backend — a JSON body binds to an
    // empty object and fails every [Required] check.
    const formData = new FormData();

    formData.append('firstName', payload.firstName.trim());
    formData.append('lastName', payload.lastName.trim());
    formData.append('email', payload.email.trim());
    formData.append('password', payload.password);
    formData.append('role', 'buyer');
    formData.append('location', payload.location.trim());
    formData.append('businessName', payload.businessName.trim());
    formData.append('businessType', payload.businessType.trim());
    if (payload.phone?.trim()) formData.append('phone', payload.phone.trim());

    const res = await apiClient.post<RegisterResponse>('/api/auth/register', formData);
    return res;
  };

  const verifyOtp = async (email: string, otp: string): Promise<UserSession> => {
    const data = await apiClient.post<any>('/api/auth/verify-otp', {
      email: email.trim(),
      otp: otp.trim(),
    });

    const userSession: UserSession = data.user;

    if (data.accessToken) {
      setToken(data.accessToken);
      setUser(userSession);
      await setStorageItem(TOKEN_KEY, data.accessToken);
      if (data.refreshToken) {
        await setStorageItem(REFRESH_TOKEN_KEY, data.refreshToken);
      }
      await setStorageItem(USER_KEY, JSON.stringify(userSession));
    }

    return userSession;
  };

  const resendOtp = async (email: string): Promise<string> => {
    const res = await apiClient.post<{ message: string }>('/api/auth/request-otp', {
      email: email.trim(),
    });
    return res.message || 'A new verification code has been sent to your email.';
  };

  const googleSignIn = async (idToken: string): Promise<UserSession> => {
    const data = await apiClient.post<any>('/api/auth/google', {
      idToken,
      role: 'buyer',
    });

    const userSession: UserSession = data.user;

    setToken(data.accessToken);
    setUser(userSession);

    await setStorageItem(TOKEN_KEY, data.accessToken);
    if (data.refreshToken) {
      await setStorageItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    await setStorageItem(USER_KEY, JSON.stringify(userSession));

    return userSession;
  };

  const logout = async () => {
    const refreshToken = await getStorageItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      apiClient.post('/api/auth/logout', { refreshToken }).catch(() => {});
    }

    setUser(null);
    setToken(null);
    await deleteStorageItem(TOKEN_KEY);
    await deleteStorageItem(REFRESH_TOKEN_KEY);
    await deleteStorageItem(USER_KEY);
  };

  const setOnboardingCompleted = async () => {
    setHasCompletedOnboardingState(true);
    await setStorageItem(ONBOARDING_COMPLETED_KEY, 'true');
  };

  const refreshUser = async (): Promise<UserSession | null> => {
    try {
      const profile = await apiClient.get<UserSession>('/api/user/profile');
      setUser(profile);
      await setStorageItem(USER_KEY, JSON.stringify(profile));
      return profile;
    } catch {
      return user;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        hasCompletedOnboarding,
        login,
        registerBuyer,
        verifyOtp,
        resendOtp,
        googleSignIn,
        logout,
        setOnboardingCompleted,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
