import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import client from '../../api/client';

const StudentForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', index: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!form.username.trim()) { setError('Full name is required.'); return; }
    if (!form.password.trim()) { setError('Password is required.'); return; }

    setLoading(true);
    try {
      await client.post('/admin/students', {
        username: form.username.trim(),
        password: form.password,
        index: form.index.trim(),
        role: 'STUDENT',
      });
      setSuccess('Student created successfully! Redirecting…');
      setTimeout(() => navigate('/admin/students'), 1500);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create student';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <nav className="breadcrumb">
        <Link to="/admin">Admin</Link>
        <span className="sep">›</span>
        <Link to="/admin/students">Students</Link>
        <span className="sep">›</span>
        <span>New Student</span>
      </nav>

      <div className="page-header anim-in">
        <h2 style={{ fontSize:'1.5rem' }}>Add New Student</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Create a login account. The student will be prompted to fill in their full profile on first login.
        </p>
      </div>

      <div className="card anim-in anim-in-1" style={{ maxWidth: 500 }}>
        {error && (
          <div style={{
            display:'flex', alignItems:'center', gap:'0.5rem',
            background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)',
            color:'#fca5a5', padding:'0.75rem 1rem',
            borderRadius:'var(--r-sm)', marginBottom:'1.25rem',
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div style={{
            display:'flex', alignItems:'center', gap:'0.5rem',
            background:'rgba(16,185,129,.12)', border:'1px solid rgba(16,185,129,.3)',
            color:'#6ee7b7', padding:'0.7rem 1rem',
            borderRadius:'var(--r-sm)', marginBottom:'1.25rem',
          }}>
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name <span style={{ color: 'var(--orange)' }}>*</span></label>
            <input
              name="username"
              placeholder="e.g. Ahmed Hassan"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label>Index Number</label>
            <input
              name="index"
              placeholder="e.g. 2024/SCI/001"
              value={form.index}
              onChange={handleChange}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Used as username for login. Leave blank to auto-generate.
            </small>
          </div>
          <div className="input-group" style={{ marginBottom:'1.5rem' }}>
            <label>Password <span style={{ color: 'var(--orange)' }}>*</span></label>
            <input
              name="password"
              type="password"
              placeholder="Set a temporary password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ background: 'rgba(0,212,216,0.06)', border: '1px solid rgba(0,212,216,0.15)', borderRadius: 'var(--r-sm)', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            💡 After first login, the student will be prompted to complete their profile (school, year, stream, etc.)
          </div>

          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button type="submit" className="btn" disabled={loading} style={{ flex:1 }}>
              {loading
                ? <><Loader2 size={16} className="spin" /> Creating…</>
                : <><UserPlus size={16} /> Create Student</>
              }
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/students')}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>
    </div>
  );
};

export default StudentForm;
