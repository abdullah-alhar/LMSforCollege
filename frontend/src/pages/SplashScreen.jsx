import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/login'), 2800);
    return () => clearTimeout(timer);
  }, [navigate]);

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
