"use client"

/**
 * LicenseGuard Component
 * 
 * Wraps the entire application and enforces license validation.
 * Shows loading state while checking, and NoLicensePage if invalid.
 */

import React from 'react';
import { LicenseProvider, useLicense } from './LicenseContext';
import NoLicensePage from '@/app/(components)/no-license/page';

/**
 * Inner guard component that uses the license context
 */
const LicenseGuardInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { licenseStatus, licenseLoading } = useLicense();

  // Show loading state while checking license
  if (licenseLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e9ecef',
            borderTopColor: '#845adf',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>
            Checking license...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If license is invalid or doesn't exist, show the no license page
  if (!licenseStatus || !licenseStatus.valid) {
    return <NoLicensePage />;
  }

  // License is valid, render the app
  return <>{children}</>;
};

/**
 * Main LicenseGuard component that provides context and guards
 */
export const LicenseGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LicenseProvider>
      <LicenseGuardInner>
        {children}
      </LicenseGuardInner>
    </LicenseProvider>
  );
};
