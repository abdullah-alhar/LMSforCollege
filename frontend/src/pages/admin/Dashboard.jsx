import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, ArrowRight, BookOpen, ShieldCheck, Zap, Image, Type, Bold, Italic, Link as LinkIcon, List } from 'lucide-react';
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
  const [type, setType] = useState('text');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setSuccess('');
    try {
      await client.post('/notices', { title, desc, type, imageUrl });
      setSuccess('Notice posted!');
      setTitle('');
      setDesc('');
      setImageUrl('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('Failed to post notice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notice-composer card anim-in anim-in-2">
      <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Zap size={16} color="var(--teal)" /> Post Global Notice
      </h3>
      {success && <div style={{ fontSize: '0.8rem', color: '#10b981', marginBottom: '1rem' }}>✓ {success}</div>}
      <form onSubmit={handlePost}>
        <div className="notice-type-switch">
          <button type="button" className={type === 'text' ? 'active' : ''} onClick={() => setType('text')}><Type size={15} /> Text</button>
          <button type="button" className={type === 'image' ? 'active' : ''} onClick={() => setType('image')}><Image size={15} /> Image</button>
        </div>
        <div className="input-group" style={{ marginBottom: '0.75rem' }}>
          <input 
            placeholder="Notice Title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
            style={{ fontSize: '0.85rem' }}
          />
        </div>
        {type === 'text' ? (
          <>
            <div className="notice-toolbar"><Bold size={15}/><Italic size={15}/><span>H1</span><span>H2</span><LinkIcon size={15}/><List size={15}/></div>
            <div className="input-group notice-editor">
              <textarea placeholder="Write your notice…" value={desc} onChange={e => setDesc(e.target.value)} rows={5} />
            </div>
            <div className="notice-preview"><small>Live preview</small><h4>{title || 'Notice title'}</h4><p>{desc || 'Your notice will appear here.'}</p></div>
          </>
        ) : (
          <div className="input-group" style={{ marginBottom:'1rem' }}>
            <label>Image URL</label>
            <input type="url" placeholder="https://…" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
            {imageUrl && <img className="notice-image-preview" src={imageUrl} alt="Notice preview" />}
          </div>
        )}
        <button type="submit" className="btn btn-sm" disabled={loading || !title.trim()}>
          {loading ? 'Posting...' : 'Post Notice'}
        </button>
      </form>
    </div>
  );
};

export default Dashboard;
