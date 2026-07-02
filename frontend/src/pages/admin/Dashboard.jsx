import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, ArrowRight, BookOpen, Video, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [studentCount, setStudentCount] = useState('—');

  useEffect(() => {
    client.get('/admin/students')
      .then(r => setStudentCount(Array.isArray(r.data) ? r.data.length : '—'))
      .catch(() => setStudentCount('—'));
  }, []);

  const STATS = [
    {
      icon: <Users size={20} color="var(--teal)" />,
      iconBg: 'rgba(0,212,216,0.12)',
      value: studentCount,
      label: 'Total Students',
    },
    {
      icon: <BookOpen size={20} color="var(--orange)" />,
      iconBg: 'rgba(255,107,53,0.12)',
      value: 4,
      label: 'Subjects',
    },
    {
      icon: <ShieldCheck size={20} color="var(--green-accent)" />,
      iconBg: 'rgba(16,185,129,0.12)',
      value: '∞',
      label: 'Access Grants',
    },
  ];

  const ACTIONS = [
    {
      icon: <Users size={22} color="var(--teal)" />,
      bg: 'rgba(0,212,216,0.1)',
      border: 'var(--border-teal)',
      title: 'Manage Students',
      desc: 'Add accounts, reset passwords, and manage all student records in one place.',
      path: '/admin/students',
      label: 'Open Students',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header anim-in" style={{ marginBottom:'2rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.25rem' }}>
          <div style={{
            width:40, height:40, borderRadius:10,
            background:'linear-gradient(135deg, var(--teal), rgba(0,180,185,.6))',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 16px rgba(0,212,216,.2)',
          }}>
            <Zap size={20} color="#070b12" />
          </div>
          <div>
            <h1 style={{ fontSize:'1.5rem', marginBottom:0 }}>Admin Dashboard</h1>
            <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginTop:2 }}>
              Welcome back, {user?.username || 'Admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid anim-in anim-in-1">
        {STATS.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.iconBg }}>
              {s.icon}
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Action tiles */}
      <div style={{ marginBottom:'1rem' }}>
        <div className="section-title" style={{ marginBottom:'1rem' }}>Quick Actions</div>
        <div className="admin-grid">
          {ACTIONS.map(tile => (
            <div
              key={tile.path}
              className="admin-tile"
              style={{ borderColor: tile.border }}
              onClick={() => navigate(tile.path)}
            >
              <div className="tile-icon" style={{ background: tile.bg }}>
                {tile.icon}
              </div>
              <h3>{tile.title}</h3>
              <p>{tile.desc}</p>
              <Link to={tile.path} className="btn btn-ghost btn-sm" style={{ alignSelf:'flex-start', marginTop:'auto' }}>
                {tile.label} <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Guide box */}
      <div className="card anim-in anim-in-2" style={{ borderColor:'var(--border-teal)', marginTop:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'1rem' }}>
          <div style={{
            width:38, height:38, borderRadius:8, flexShrink:0,
            background:'rgba(255,107,53,0.12)', border:'1px solid rgba(255,107,53,0.2)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <TrendingUp size={18} color="var(--orange)" />
          </div>
          <div>
            <div className="section-title" style={{ marginBottom:'0.4rem', fontSize:'0.95rem' }}>
              Grant Video Access
            </div>
            <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', lineHeight:'1.65' }}>
              Browse to any subject → section → folder to upload content, create folders, and grant students access to paid videos directly from the video card.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;