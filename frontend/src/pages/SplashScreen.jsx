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
        }}
      >
        <img
          src="/logo.png"
          alt="Science Toppers"
          style={{ height: '140px', width: 'auto', display: 'block' }}
        />
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
