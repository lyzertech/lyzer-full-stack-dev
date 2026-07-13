"use client"

/**
 * NoLicensePage Component
 * 
 * Displayed when the application doesn't have a valid license.
 * Shows a professional message asking users to contact their administrator.
 */

import React from 'react';
import Image from 'next/image';
import { basePath } from '@/next.config';

const NoLicensePage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '48px 32px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px', position: 'relative', height: '48px' }}>
          <Image 
            src={`${process.env.NODE_ENV === 'production' ? basePath : ''}/assets/images/brand-logos/toggle-logo.png`}
            alt="LyZer Logo" 
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Lock Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          backgroundColor: '#fff5f5',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <i 
            className="ri-lock-line" 
            style={{ 
              fontSize: '40px', 
              color: '#dc3545',
            }}
          />
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#212529',
          marginBottom: '12px',
        }}>
          License Required
        </h1>

        {/* Message */}
        <p style={{
          fontSize: '15px',
          color: '#6c757d',
          lineHeight: '1.6',
          marginBottom: '32px',
        }}>
          This application requires a valid license to operate. 
          Please contact your system administrator to activate or renew your license.
        </p>

        {/* Info Box */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}>
            <i className="ri-information-line" style={{ color: '#845adf', fontSize: '18px' }} />
            <span style={{ fontWeight: '600', color: '#495057', fontSize: '14px' }}>
              Contact Information
            </span>
          </div>
          <p style={{ 
            fontSize: '14px', 
            color: '#6c757d', 
            margin: 0,
            lineHeight: '1.5',
          }}>
            Please reach out to your administrator or<br />
            technical support team for assistance.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid #e9ecef',
        }}>
          <p style={{
            fontSize: '13px',
            color: '#adb5bd',
            margin: 0,
          }}>
            © {new Date().getFullYear()} LyZer. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoLicensePage;
