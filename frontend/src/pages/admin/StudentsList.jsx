import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, ArrowLeft, Users } from 'lucide-react';
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

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await client.get('/admin/students');
        setStudents(res.data);
        setFiltered(res.data);
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };
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
                return (
                  <tr key={s.uid || i}>
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
                      <span className={`badge ${s.role === 'ADMIN' ? 'badge-teal' : 'badge-free'}`}>
                        {s.role || 'STUDENT'}
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
    </div>
  );
};

export default StudentsList;
