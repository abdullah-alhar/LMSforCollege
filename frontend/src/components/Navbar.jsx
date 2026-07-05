import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell, ChevronLeft, ChevronRight, CreditCard, FlaskConical, Gauge,
  GraduationCap, History, Home, LogOut, Menu, Settings, Users, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const studentItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/payments', label: 'Payment Details', icon: CreditCard },
  { to: '/notices', label: 'Notices', icon: Bell },
  { to: '/profile', label: 'Settings', icon: Settings },
];

const adminItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/admin', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/notices', label: 'Notices', icon: Bell },
  { to: '/admin/payments', label: 'Payment Details', icon: CreditCard },
  { to: '/profile', label: 'Settings', icon: Settings },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(sessionStorage.getItem('sidebarCollapsed') === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isSuperAdmin = user.isSuperAdmin === true;
  const items = isAdmin
    ? [...adminItems, ...(isSuperAdmin ? [{ to: '/super-admin/recent-logins', label: 'Login History', icon: History }] : [])]
    : studentItems;
  const initials = (user.username || (isAdmin ? 'Admin User' : 'Student')).slice(0, 2).toUpperCase();

  const toggleCollapsed = () => {
    setCollapsed(value => {
      sessionStorage.setItem('sidebarCollapsed', String(!value));
      return !value;
    });
  };

  const signOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="mobile-app-bar">
        <button onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={23} /></button>
        <span><GraduationCap size={20} /> Science Toppers</span>
      </header>
      {mobileOpen && <button className="sidebar-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <aside className={`sidebar-nav ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon"><FlaskConical size={27} /></span>
          <div className="sidebar-brand-copy">
            <strong>Science Toppers</strong>
            <span>Learning Platform</span>
          </div>
          <button className="sidebar-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={21} /></button>
        </div>

        <button className="sidebar-collapse" onClick={toggleCollapsed} aria-label={collapsed ? 'Expand navigation' : 'Minimize navigation'}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <nav className="sidebar-menu" aria-label="Main navigation">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="sidebar-menu-icon" size={24} strokeWidth={2.4} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-account">
          <div className="sidebar-user">
            <span className="sidebar-avatar">{initials}</span>
            <div>
              <strong>{user.username || (isAdmin ? 'Admin User' : 'Student')}</strong>
              <span>{isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : 'Student'}</span>
            </div>
          </div>
          <button className="sidebar-signout" onClick={signOut} title="Sign Out">
            <LogOut size={20} /><span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
