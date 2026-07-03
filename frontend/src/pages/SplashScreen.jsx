import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SplashScreen = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // wait until auth resolves
    // Mark that the splash has been shown this session
    sessionStorage.setItem('splashShown', 'true');
    const timer = setTimeout(() => {
      if (user) {
        navigate('/', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [user, loading, navigate]);

  return (
    <div className="splash">
      {/* Logo */}
      <div
        className="splash-logo"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(0,212,216,0.2)',
          borderRadius: 28,
          padding: '1.25rem 1.75rem',
          boxShadow: '0 0 60px rgba(0,212,216,0.15), 0 20px 60px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        {/* Icon */}
        <div style={{
          width: 88,
          height: 88,
          borderRadius: 22,
          background: 'linear-gradient(135deg, #00d4d8 0%, #0099a8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 40px rgba(0,212,216,0.5), 0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#070b12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>

        {/* Brand Name */}
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <div style={{
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            fontWeight: 800,
            fontSize: '1.75rem',
            letterSpacing: '-0.02em',
            color: '#ffffff',
            lineHeight: 1.15,
          }}>
            LMS for College
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: '0.72rem',
            color: 'rgba(0,212,216,0.8)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginTop: '0.3rem',
          }}>
            Learning Management System
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p className="splash-tagline">Your gateway to academic excellence</p>

      {/* Dots */}
      <div className="dot-loader">
        <span /><span /><span />
      </div>
    </div>
  );
};

export default SplashScreen;
