/**
 * Authentication Types
 * 
 * Type definitions for the authentication system
 * Uses database-based authentication (no Firebase)
 */

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  // Extend with custom fields as needed
  role?: string;
  permissions?: string[];
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
}

