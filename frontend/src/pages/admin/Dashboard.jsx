import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, ArrowRight, BookOpen, Video, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ProfileSettings from '../ProfileSettings';

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

      {/* Notices */}
      <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
        <PostNoticeForm />
      </div>

      <hr style={{ borderColor: 'var(--border)', margin: '2rem 0' }} />

      <div className="section-title" style={{ marginBottom:'1rem' }}>Admin Account Settings</div>
      <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)' }}>
        <ProfileSettings />
      </div>
    </div>
  );
};

const PostNoticeForm = () => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setSuccess('');
    try {
      await client.post('/notices', { title, desc });
      setSuccess('Notice posted!');
      setTitle('');
      setDesc('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('Failed to post notice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card anim-in anim-in-2" style={{ borderTop: '2px solid var(--teal)' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Zap size={16} color="var(--teal)" /> Post Global Notice
      </h3>
      {success && <div style={{ fontSize: '0.8rem', color: '#10b981', marginBottom: '1rem' }}>✓ {success}</div>}
      <form onSubmit={handlePost}>
        <div className="input-group" style={{ marginBottom: '0.75rem' }}>
          <input 
            placeholder="Notice Title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
            style={{ fontSize: '0.85rem' }}
          />
        </div>
        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <textarea 
            placeholder="Details (Optional)" 
            value={desc} 
            onChange={e => setDesc(e.target.value)} 
            rows={2}
            style={{ resize: 'vertical', fontSize: '0.85rem' }}
          />
        </div>
        <button type="submit" className="btn btn-sm" disabled={loading || !title.trim()}>
          {loading ? 'Posting...' : 'Post Notice'}
        </button>
      </form>
    </div>
  );
};

export default Dashboard;