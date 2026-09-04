'use client';

import { useEffect } from 'react';

export default function AdminRedirectPage() {
  useEffect(() => {
    window.location.replace('/admin/index.html');
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      backgroundColor: '#f8fafc',
      color: '#334155'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid #e2e8f0',
        borderTopColor: '#4338ca',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: '16px'
      }}></div>
      <p style={{ fontSize: '14px', fontWeight: 600 }}>Redirecting to Prayatna Admin Portal...</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
