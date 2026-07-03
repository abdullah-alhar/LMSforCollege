import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, GraduationCap, Home, X, Menu, Bell, Moon, Sun, User } from 'lucide-react';
import client from '../api/client';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  // Dropdown states
  const [profileOpen, setProfileOpen] = useState(false);
  const [notisOpen, setNotisOpen] = useState(false);
  const [notices, setNotices] = useState([]);
  
  const profileRef = useRef(null);
  const notisRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Fetch notices
    if (user) {
      client.get('/notices')
        .then(res => setNotices(res.data || []))
        .catch(err => console.error("Failed to load notices:", err));
    }
  }, [user]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notisRef.current && !notisRef.current.contains(event.target)) {
        setNotisOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
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
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:'1rem', letterSpacing:'-0.01em', marginLeft: '0.625rem' }}>
            LMS for College
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links" style={{ display:'flex', alignItems:'center', gap: '1.25rem' }}>
          <Link
            to="/"
            className="nav-link"
            style={{ color: location.pathname === '/' ? 'var(--teal)' : undefined }}
          >
            <Home size={15} />
            Home
          </Link>

          <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 0.25rem' }} />

          {/* Notifications Bell */}
          <div ref={notisRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setNotisOpen(!notisOpen)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', position: 'relative', display: 'flex' }}
            >
              <Bell size={18} />
              {notices.length > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: 'var(--orange)', color: '#fff',
                  fontSize: '0.6rem', fontWeight: 'bold',
                  width: 14, height: 14, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {notices.length}
                </span>
              )}
            </button>
            
            {notisOpen && (
              <div className="notifications-panel">
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                  Notifications
                </div>
                {notices.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No new notifications
                  </div>
                ) : (
                  notices.map((noti) => (
                    <div key={noti.id || noti.title} className="notification-item">
                      <div className="notification-icon">
                        <Bell size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)' }}>
                          {noti.title || 'New Notice'}
                        </div>
                        {noti.desc && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {noti.desc}
                          </div>
                        )}
                      </div>
                      {isAdmin && noti.id && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this notice?')) {
                              try {
                                await client.delete(`/notices/${noti.id}`);
                                setNotices(notices.filter(n => n.id !== noti.id));
                              } catch (err) {
                                alert('Failed to delete notice');
                              }
                            }
                          }}
                          style={{
                            background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '0.25rem'
                          }}
                          title="Delete Notice"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <div 
              style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: 'var(--r-sm)' }}
              onClick={() => setProfileOpen(!profileOpen)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-glass)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="user-avatar">{initials}</div>
              <div style={{ display:'flex', flexDirection:'column', lineHeight:1.2 }}>
                <span style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text)', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {user.username || 'Student'}
                </span>
                <span style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:500 }}>
                  {isAdmin ? 'Admin' : 'Student'}
                </span>
              </div>
            </div>

            {profileOpen && (
              <div className="dropdown-menu">
                {!isAdmin && (
                  <Link to="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                    <User size={15} /> Profile Settings
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                    <Settings size={15} /> Admin Panel
                  </Link>
                )}
                
                <div className="dropdown-divider" />
                
                <button className="dropdown-item" onClick={() => { toggleTheme(); setProfileOpen(false); }}>
                  {theme === 'dark' ? <><Sun size={15} /> Light Mode</> : <><Moon size={15} /> Dark Mode</>}
                </button>
                
                <div className="dropdown-divider" />
                
                <button className="dropdown-item" onClick={handleLogout} style={{ color: 'var(--orange)' }}>
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            )}
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
          background:'var(--bg-card)', backdropFilter:'blur(20px)',
        }}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            <Home size={15} /> Home
          </Link>
          <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
            <User size={15} /> Profile Settings
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>
              <Settings size={15} /> Admin Panel
            </Link>
          )}
          <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', padding: '0.5rem 0' }} onClick={toggleTheme}>
            {theme === 'dark' ? <><Sun size={15} /> Light Mode</> : <><Moon size={15} /> Dark Mode</>}
          </button>
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
