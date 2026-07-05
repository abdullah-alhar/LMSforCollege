import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, BookOpen, FolderPlus, Loader2, X, Trash2 } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const SUBJECT_LABELS = {
  bio:  'Biology',
  phy:  'Physics',
  chem: 'Chemistry',
  math: 'Mathematics',
};

const SkeletonRows = () => (
  <div className="folder-list">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="skeleton skeleton-row anim-in" style={{ animationDelay:`${i*0.07}s` }} />
    ))}
  </div>
);

const SubjectFolders = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchSections = async () => {
    const res = await client.get(`/subjects/${id}/sections`);
    setSections(res.data || []);
  };

  useEffect(() => {
    const loadSections = async () => {
      try {
        await fetchSections();
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Failed to load sections');
      } finally {
        setLoading(false);
      }
    };
    loadSections();
  }, [id]);

  const createSection = async e => {
    e.preventDefault();
    if (!sectionName.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      await client.post('/admin/content/section', { subjectId: id, sectionName: sectionName.trim() });
      await fetchSections();
      setSectionName('');
      setShowCreate(false);
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Unable to create this folder.');
    } finally {
      setCreating(false);
    }
  };

  const deleteSection = async section => {
    if (!window.confirm(`Delete "${section.title}" and everything inside it? This cannot be undone.`)) return;
    try {
      await client.delete('/admin/content/folder', {
        data: { subjectId: id, sectionId: section.title, folderId: section.title }
      });
      setSections(current => current.filter(item => item.id !== section.id));
    } catch (err) {
      window.alert(err.response?.data?.error || 'Unable to delete this folder.');
    }
  };

  const subjectLabel = SUBJECT_LABELS[id?.toLowerCase()] || id?.toUpperCase();

  return (
    <div>
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">›</span>
        <span>{subjectLabel}</span>
      </nav>

      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <form className="premium-modal compact-modal" onSubmit={createSection} onClick={e => e.stopPropagation()}>
            <button type="button" className="icon-button modal-close" onClick={() => setShowCreate(false)}><X size={18} /></button>
            <div className="modal-kicker"><FolderPlus size={16} /> New subject folder</div>
            <h2>Create folder</h2>
            <p className="modal-lead">Add a new section inside {subjectLabel}.</p>
            {createError && <div className="form-alert error">{createError}</div>}
            <div className="input-group">
              <label>Folder name</label>
              <input value={sectionName} onChange={e => setSectionName(e.target.value)} placeholder="e.g. Unit 01 — Mechanics" autoFocus />
            </div>
            <button className="btn" disabled={creating || !sectionName.trim()}>
              {creating ? <><Loader2 className="spin" size={16} /> Creating…</> : <><FolderPlus size={16} /> Create folder</>}
            </button>
          </form>
        </div>
      )}

      <div className="page-header anim-in page-header-row">
        <div><h2>{subjectLabel}</h2><p>Select a section to view its content</p></div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-sm" onClick={() => setShowCreate(true)}><FolderPlus size={15} /> Create folder</button>
        )}
      </div>

      {loading ? (
        <SkeletonRows />
      ) : error ? (
        <div className="state-box"><span className="state-icon">⚠️</span><h3>Couldn't load sections</h3><p>{error}</p></div>
      ) : sections.length === 0 ? (
        <div className="state-box anim-in">
          <span className="state-icon">📂</span>
          <h3>No sections yet</h3>
          <p>This subject has no sections yet. Check back soon.</p>
        </div>
      ) : (
        <div className="clear-folder-list">
          {sections.map((sec, i) => (
            <article className="clear-folder-row anim-in" style={{ animationDelay:`${i*0.06}s` }} key={sec.id}>
              <Link className="clear-folder-link" to={`/subject/${id}/section/${encodeURIComponent(sec.title)}`}>
                <span className="clear-folder-icon"><BookOpen size={25} /></span>
                <div className="clear-folder-content">
                  <h3>{sec.title}</h3>
                  <p>Tap to view videos</p>
                </div>
                <ChevronRight className="clear-folder-arrow" size={22} />
              </Link>
              {user?.role === 'ADMIN' && (
                <button className="folder-delete-button" onClick={() => deleteSection(sec)} title="Delete folder">
                  <Trash2 size={17} />
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectFolders;
