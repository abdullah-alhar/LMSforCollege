import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, GraduationCap, Home, ChevronDown, X, Menu } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'ST';

  const isAdmin = user?.role === 'ADMIN';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, var(--teal), rgba(0,180,185,.7))',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 14px rgba(0,212,216,.25)',
            flexShrink: 0,
          }}>
            <GraduationCap size={18} color="#070b12" />
          </div>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:'1rem', letterSpacing:'-0.01em' }}>
            LMS for College
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links" style={{ display:'flex', alignItems:'center' }}>
          <Link
            to="/"
            className="nav-link"
            style={{ color: location.pathname === '/' ? 'var(--teal)' : undefined }}
          >
            <Home size={15} />
            Home
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="nav-link"
              style={{ color: location.pathname.startsWith('/admin') ? 'var(--teal)' : undefined }}
            >
              <Settings size={15} />
              Admin
            </Link>
          )}

          <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 0.25rem' }} />

          {/* User badge + logout */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <div className="user-avatar">{initials}</div>
            <div style={{ display:'flex', flexDirection:'column', lineHeight:1.2 }}>
              <span style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text)', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user.username || 'Student'}
              </span>
              <span style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:500 }}>
                {isAdmin ? 'Admin' : 'Student'}
              </span>
            </div>
            <button
              className="nav-btn-logout"
              onClick={handleLogout}
              title="Sign out"
              style={{ marginLeft:'0.25rem' }}
            >
              <LogOut size={14} />
              <span style={{ display:'none' }}>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen
            ? <X size={22} color="var(--text-secondary)" />
            : <Menu size={22} color="var(--text-secondary)" />
          }
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          display:'flex', flexDirection:'column', gap:'0.25rem',
          padding:'1rem 1.5rem', borderTop:'1px solid var(--border)',
          background:'rgba(7,11,18,.97)', backdropFilter:'blur(20px)',
        }}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            <Home size={15} /> Home
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>
              <Settings size={15} /> Admin
            </Link>
          )}
          <button
            className="nav-btn-logout"
            onClick={handleLogout}
            style={{ alignSelf:'flex-start', marginTop:'0.5rem' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
