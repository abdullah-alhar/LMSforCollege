import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus, CheckCircle2 } from 'lucide-react';
import client from '../../api/client';

const StudentForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', index: '', role: 'STUDENT' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await client.post('/admin/students', form);
      setSuccess('Student created successfully! Redirecting…');
      setTimeout(() => navigate('/admin/students'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create student');
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
        <p>Create a login account for a student</p>
      </div>

      <div className="card anim-in anim-in-1" style={{ maxWidth: 500 }}>
        {error && (
          <div className="error-msg" style={{ marginBottom:'1.25rem' }}>⚠️ {error}</div>
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
            <label>Full Name / Username</label>
            <input name="username" placeholder="e.g. Ahmed Hassan" value={form.username} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Index Number</label>
            <input name="index" placeholder="e.g. 2024/SCI/001" value={form.index} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Set a temporary password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="input-group" style={{ marginBottom:'1.5rem' }}>
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin</option>
            </select>
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
    </div>
  );
};

export default StudentForm;
