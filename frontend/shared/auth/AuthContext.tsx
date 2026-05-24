"use client"

/**
 * AuthContext - Global Authentication Context
 *
 * Provides authentication state and methods throughout the application.
 * Authentication is handled directly via Axios apiClient connecting to the Laravel API.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthContextType, AuthUser } from './types';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api-client';
import {
  AUTH_USER_KEY,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '@/lib/auth-storage';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * 
 * Wraps the application and provides authentication state and methods
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const resolveRoleSlug = (rawUser: any): string | undefined => {
    const directRole =
      typeof rawUser?.role === 'string'
        ? rawUser.role
        : rawUser?.role?.slug || rawUser?.role?.name;
    const nestedRole = rawUser?.roles?.[0]?.role?.slug || rawUser?.roles?.[0]?.role?.name;
    const role = directRole || nestedRole;
    return typeof role === 'string' ? role.toLowerCase() : undefined;
  };

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  /**
   * Check authentication status on mount and when needed
   */
  const restoreUserFromCache = useCallback((): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    // Live api.lyzer.my.id currently allows only one authenticated request per
    // login token (server config). Restore cached user so /me does not consume
    // the token before finance pages load.
    const cachedUser = restoreUserFromCache();
    if (cachedUser) {
      setUser(cachedUser);
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      const response = await apiClient.get('/me');
      const data = response.data;
      
      // The API returns the user directly or inside user key
      const userData = data.user || data;
      if (userData) {
        const authUser: AuthUser = {
          uid: String(userData.id),
          email: userData.email,
          displayName: userData.name || userData.displayName,
          photoURL: userData.photoUrl ?? null,
          emailVerified: userData.emailVerified ?? true,
          role: resolveRoleSlug(userData),
          permissions: userData.roles?.flatMap((ur: any) =>
            ur.role?.permissions?.map((p: any) => p.permission?.slug) || []
          ) || [],
        };
        setUser(authUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      } else {
        setUser(null);
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : 'Error checking auth';
      console.error('Error checking auth:', msg);
      setUser(null);
      clearAuthToken();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Signup with email and password
   */
  const signup = useCallback(async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      setLoading(true);

      const response = await apiClient.post('/signup', {
        email,
        password,
        displayName,
      });

      const data = response.data;

      // Upon successful signup, log the user in automatically
      if (data.token) {
        setAuthToken(data.token);
        const userData = data.user;
        const authUser: AuthUser = {
          uid: String(userData.id),
          email: userData.email,
          displayName: userData.name || userData.displayName,
          photoURL: userData.photoUrl ?? null,
          emailVerified: userData.emailVerified ?? true,
          role: resolveRoleSlug(userData) || 'user',
          permissions: [],
        };
        setUser(authUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to sign up';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    try {
      setLoading(true);

      const response = await apiClient.post('/login', {
        email,
        password,
      });

      const data = response.data;
      if (data.token && data.user) {
        setAuthToken(data.token);

        const authUser: AuthUser = {
          uid: String(data.user.id),
          email: data.user.email,
          displayName: data.user.name || data.user.displayName,
          photoURL: data.user.photoUrl ?? null,
          emailVerified: data.user.emailVerified ?? true,
          role: resolveRoleSlug(data.user) || data.user.role,
          permissions: [],
        };
        setUser(authUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
        return authUser;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to sign in';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login with Google (not implemented)
   */
  const loginWithGoogle = useCallback(async (): Promise<AuthUser> => {
    throw new Error('Google login is not yet implemented. Please use email/password authentication.');
  }, []);

  /**
   * Login with Facebook (not implemented)
   */
  const loginWithFacebook = useCallback(async (): Promise<AuthUser> => {
    throw new Error('Facebook login is not yet implemented. Please use email/password authentication.');
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      toast.dismiss();

      await apiClient.post('/logout');
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      clearAuthToken();
      setLoading(false);

      toast.success('Logged out successfully', {
        position: 'top-right',
        autoClose: 1500,
      });
    }
  }, []);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    await checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user && initialized,
    signup,
    login,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
