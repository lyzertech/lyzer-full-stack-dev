"use client"

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication
 * Redirects to login (/) if user is not authenticated
 * 
 * Login page: /
 * Signup page: /authentication/sign-up
 */

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean; // If false, redirects authenticated users away (for login pages)
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/',   // Default: login page
  requireAuth = true
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth to initialize
    if (loading) return;

    if (requireAuth) {
      // Protected route - redirect to login if not authenticated
      if (!isAuthenticated) {
        router.push(redirectTo);
      }
    } else {
      // Public route (like login) - redirect to dashboard if already authenticated
      if (isAuthenticated) {
        if (user && user.role === 'finance') {
          router.push('/finance/dashboard');
        } else if (user && user.role === 'school') {
          router.push('/school/dashboard');
        } else {
          router.push('/dashboards/sales');
        }
      }
    }
  }, [isAuthenticated, loading, router, redirectTo, requireAuth, pathname, user]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // For protected routes, show redirect message if not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Redirecting...</span>
          </div>
          <p className="mt-2 text-muted">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // For public routes (login), show redirect message if authenticated
  if (!requireAuth && isAuthenticated) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Redirecting...</span>
          </div>
          <p className="mt-2 text-muted">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

