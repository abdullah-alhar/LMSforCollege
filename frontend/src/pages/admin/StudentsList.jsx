import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Users, X, Edit, Trash2, Key, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import client from '../../api/client';

const SkeletonRows = () => (
  <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
    {[1,2,3,4,5].map(i => (
      <div key={i} className="skeleton" style={{ height:60, borderRadius:10, animationDelay:`${i*0.06}s` }} />
    ))}
  </div>
);

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', index: '', role: '', password: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchStudents = async () => {
    try {
      const res = await client.get('/admin/students');
      // Normalize 'name' from API to 'username' for consistency in UI
      const normalizedData = (res.data || []).map(s => ({
        ...s,
        username: s.name || s.username || s.index || s.uid,
        role: (s.type || s.role || 'STUDENT').toUpperCase(),
        type: (s.type || s.role || 'student').toLowerCase()
      }));
      setStudents(normalizedData);
      setFiltered(normalizedData);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setFiltered(students); return; }
    const q = query.toLowerCase();
    setFiltered(students.filter(s =>
      (s.username || '').toLowerCase().includes(q) ||
      (s.index    || '').toLowerCase().includes(q) ||
      (s.uid      || '').toLowerCase().includes(q)
    ));
  }, [query, students]);

  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setEditForm({
      username: student.username || '',
      index: student.index || '',
      role: (student.type || student.role || 'STUDENT').toUpperCase(),
      password: ''
    });
    setActionError('');
    setActionSuccess('');
    setShowDeleteConfirm(false);
  };

  const handleClosePanel = () => {
    setSelectedStudent(null);
  };

  const handleEditChange = (e) => {
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setEditLoading(true);
    
    try {
      await client.put(`/admin/students/${selectedStudent.uid}`, editForm);
      setActionSuccess('Student updated successfully!');
      
      // Update local state to reflect changes
      const updatedStudents = students.map(s => {
        if (s.uid === selectedStudent.uid) {
          return {
            ...s,
            username: editForm.username,
            index: editForm.index,
            role: editForm.role,
            type: editForm.role.toLowerCase()
          };
        }
        return s;
      });
      setStudents(updatedStudents);
      
      // Keep panel open so admin can see success message
      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
      
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to update student');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    setActionError('');
    setDeleteLoading(true);
    
    try {
      await client.delete(`/admin/students/${selectedStudent.uid}`);
      setStudents(students.filter(s => s.uid !== selectedStudent.uid));
      setSelectedStudent(null);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to delete student');
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <nav className="breadcrumb">
        <Link to="/admin">Admin</Link>
        <span className="sep">›</span>
        <span>Students</span>
      </nav>

      <div className="section-header anim-in">
        <div>
          <h2 style={{ fontSize:'1.5rem' }}>Students</h2>
          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginTop:2 }}>
            {loading ? 'Loading…' : `${students.length} registered student${students.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link to="/admin/students/new" className="btn btn-sm">
          <UserPlus size={15} /> Add Student
        </Link>
      </div>

      {/* Search */}
      <div className="filter-bar anim-in anim-in-1">
        <div className="search-wrap">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by name or index…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        {!loading && (
          <span className="badge badge-teal">
            <Users size={11} /> {filtered.length}
          </span>
        )}
      </div>

      {loading ? (
        <SkeletonRows />
      ) : error ? (
        <div className="state-box">
          <span className="state-icon">⚠️</span>
          <h3>Couldn't load students</h3>
          <p>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="state-box anim-in">
          <span className="state-icon">👥</span>
          <h3>{query ? 'No results found' : 'No students yet'}</h3>
          <p>{query ? 'Try a different search term.' : 'Add the first student using the button above.'}</p>
        </div>
      ) : (
        <div className="card" style={{ padding:0, overflow:'hidden' }} >
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width:40 }}>#</th>
                <th>Student</th>
                <th>Index / UID</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const initials = (s.username || s.uid || 'ST').slice(0, 2).toUpperCase();
                const role = (s.type || s.role || 'STUDENT').toUpperCase();
                return (
                  <tr 
                    key={s.uid || i} 
                    onClick={() => handleRowClick(s)}
                    style={{ cursor: 'pointer' }}
                    className="hoverable-row"
                  >
                    <td style={{ color:'var(--text-dim)', fontSize:'0.8rem' }}>{i + 1}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                        <div className="user-avatar" style={{ width:30, height:30, fontSize:'0.7rem' }}>
                          {initials}
                        </div>
                        <strong style={{ fontSize:'0.9rem' }}>{s.username || s.index || '—'}</strong>
                      </div>
                    </td>
                    <td style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'var(--text-muted)' }}>
                      {s.index || s.uid || '—'}
                    </td>
                    <td>
                      <span className={`badge ${role === 'ADMIN' ? 'badge-teal' : 'badge-free'}`}>
                        {role}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-free">Active</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-in Edit Panel */}
      {selectedStudent && (
        <>
          <div className="slide-panel-backdrop" onClick={handleClosePanel} />
          <div className="slide-panel">
            <div className="slide-panel-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit size={18} color="var(--teal)" /> Edit Student
              </h3>
              <button 
                onClick={handleClosePanel}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="slide-panel-content">
              {actionError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--r-sm)', marginBottom: '1.25rem' }}>
                  <AlertCircle size={16} /> {actionError}
                </div>
              )}
              
              {actionSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--r-sm)', marginBottom: '1.25rem' }}>
                  <CheckCircle2 size={16} /> {actionSuccess}
                </div>
              )}

              <form onSubmit={handleUpdateStudent}>
                <div className="input-group">
                  <label>Full Name / Username</label>
                  <input 
                    name="username" 
                    value={editForm.username} 
                    onChange={handleEditChange} 
                    required 
                  />
                </div>
                
                <div className="input-group">
                  <label>Index Number</label>
                  <input 
                    name="index" 
                    value={editForm.index} 
                    onChange={handleEditChange} 
                  />
                </div>
                
                <div className="input-group">
                  <label>Role</label>
                  <select name="role" value={editForm.role} onChange={handleEditChange}>
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                
                <div className="input-group">
                  <label>Reset Password <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(Leave blank to keep current)</span></label>
                  <input 
                    name="password" 
                    type="password"
                    placeholder="Enter new password"
                    value={editForm.password} 
                    onChange={handleEditChange} 
                  />
                </div>
                
                <button type="submit" className="btn" disabled={editLoading} style={{ width: '100%', marginBottom: '2rem' }}>
                  {editLoading ? <><Loader2 size={16} className="spin" /> Updating...</> : 'Save Changes'}
                </button>
              </form>
              
              <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0 2rem' }} />
              
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: 'var(--r-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h4 style={{ color: '#ef4444', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trash2 size={16} /> Danger Zone
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Deleting this student will permanently remove their access and all associated data. This action cannot be undone.
                </p>
                
                {!showDeleteConfirm ? (
                  <button 
                    type="button"
                    className="btn btn-ghost" 
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', width: '100%' }}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete Student
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <p style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>Are you absolutely sure?</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        type="button"
                        className="btn" 
                        style={{ background: '#ef4444', color: 'white', flex: 1 }}
                        onClick={handleDeleteStudent}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? <Loader2 size={16} className="spin" /> : 'Yes, Delete'}
                      </button>
                      <button 
                        type="button"
                        className="btn btn-ghost"
                        style={{ flex: 1 }}
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .hoverable-row:hover {
          background-color: var(--bg-glass) !important;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>
    </div>
  );
};

export default StudentsList;
