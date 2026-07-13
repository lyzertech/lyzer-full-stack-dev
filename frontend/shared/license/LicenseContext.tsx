"use client"

/**
 * LicenseContext - Global License State Management
 * 
 * Manages license validation state throughout the application.
 * Checks license status on mount and provides methods to re-check.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface LicenseStatus {
  valid: boolean;
  expires_at?: string;
  days_remaining?: number;
  license_type?: string;
  issued_to?: string;
  is_expiring_soon?: boolean;
}

interface LicenseContextType {
  licenseStatus: LicenseStatus | null;
  licenseLoading: boolean;
  licenseError: string | null;
  checkLicense: () => Promise<void>;
}

const LICENSE_CACHE_KEY = 'system_license_status';
const LICENSE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Create the context
const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

/**
 * LicenseProvider Component
 */
export const LicenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [licenseLoading, setLicenseLoading] = useState<boolean>(true);
  const [licenseError, setLicenseError] = useState<string | null>(null);

  /**
   * Get cached license status from localStorage
   */
  const getCachedLicense = useCallback((): LicenseStatus | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(LICENSE_CACHE_KEY);
      if (!cached) return null;

      const { status, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid (within 5 minutes)
      if (now - timestamp < LICENSE_CACHE_DURATION) {
        return status;
      }

      // Cache expired
      localStorage.removeItem(LICENSE_CACHE_KEY);
      return null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Cache license status to localStorage
   */
  const cacheLicenseStatus = useCallback((status: LicenseStatus) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({
        status,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to cache license status:', error);
    }
  }, []);

  /**
   * Check license status from API
   */
  const checkLicense = useCallback(async () => {
    try {
      setLicenseLoading(true);
      setLicenseError(null);

      const response = await apiClient.get('/system/license/status');
      const status = response.data as LicenseStatus;

      setLicenseStatus(status);
      
      // Cache the valid status
      if (status.valid) {
        cacheLicenseStatus(status);
      } else {
        // Clear cache if license is invalid
        if (typeof window !== 'undefined') {
          localStorage.removeItem(LICENSE_CACHE_KEY);
        }
      }
    } catch (error: any) {
      // Only network errors or unexpected API errors reach here
      // The license status endpoint now returns 200 with valid: false
      console.error('License check failed:', error);
      setLicenseError(error.message || 'Failed to check license');
      
      // Assume invalid license on error
      setLicenseStatus({ valid: false });
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LICENSE_CACHE_KEY);
      }
    } finally {
      setLicenseLoading(false);
    }
  }, [cacheLicenseStatus]);

  /**
   * Initialize license check on mount
   */
  useEffect(() => {
    // Try to load from cache first for instant feedback
    const cached = getCachedLicense();
    if (cached?.valid) {
      setLicenseStatus(cached);
      setLicenseLoading(false);
      
      // Still check in background to refresh
      checkLicense();
    } else {
      // No valid cache, check immediately
      checkLicense();
    }
  }, [checkLicense, getCachedLicense]);

  const value: LicenseContextType = {
    licenseStatus,
    licenseLoading,
    licenseError,
    checkLicense,
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
};

/**
 * useLicense Hook
 */
export const useLicense = (): LicenseContextType => {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};
