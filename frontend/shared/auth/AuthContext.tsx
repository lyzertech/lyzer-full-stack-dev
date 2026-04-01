"use client"

/**
 * AuthContext - Global Authentication Context
 *
 * Provides authentication state and methods throughout the application.
 * Authentication is handled by Laravel (Sanctum) via Next.js proxy API routes.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthContextType, AuthUser } from './types';
import { toast } from 'react-toastify';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * 
 * Wraps the application and provides authentication state and methods
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  /**
   * Check authentication status on mount and when needed
   */
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from /api/auth/me:', text);
        setUser(null);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // Map Laravel user to AuthUser format
          const authUser: AuthUser = {
            uid: String(data.user.id),
            email: data.user.email,
            displayName: data.user.displayName,
            photoURL: data.user.photoUrl ?? null,
            emailVerified: data.user.emailVerified ?? true,
            role: data.user.role,
            permissions: data.user.roles?.flatMap((ur: any) =>
              ur.role?.permissions?.map((p: any) => p.permission?.slug) || []
            ) || [],
          };
          setUser(authUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
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

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          displayName,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from signup API:', text);
        throw new Error('Server error: Invalid response format. Please check server logs.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Account created successfully
      // User is NOT automatically logged in - they must sign in manually
      // This is intentional to ensure users verify their credentials work
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign up';
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

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from signin API:', text);
        throw new Error('Server error: Invalid response format. Please check server logs.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      if (data.success && data.user) {
        // Map Laravel user to AuthUser format
        const authUser: AuthUser = {
          uid: String(data.user.id),
          email: data.user.email,
          displayName: data.user.displayName,
          photoURL: data.user.photoUrl ?? null,
          emailVerified: data.user.emailVerified ?? true,
          role: data.user.role,
          permissions: [],
        };
        setUser(authUser);
        return authUser;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login with Google (not implemented - can be added later)
   */
  const loginWithGoogle = useCallback(async (): Promise<AuthUser> => {
    throw new Error('Google login is not yet implemented. Please use email/password authentication.');
  }, []);

  /**
   * Login with Facebook (not implemented - can be added later)
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

      // Clear any leftover toasts from previous mounts (like "Login successful")
      toast.dismiss();

      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);

      toast.success('Logged out successfully', {
        position: 'top-right',
        autoClose: 1500,
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to log out', {
        position: 'top-right',
        autoClose: 1500,
      });
      // Still clear user state even if API call fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh user data
   * Useful for updating user info after profile changes
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
 * 
 * Custom hook to access auth context
 * Throws error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
