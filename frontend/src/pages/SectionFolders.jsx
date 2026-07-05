import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Folder, FolderPlus, X, Loader2, Plus, Trash2 } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const SUBJECT_LABELS = {
  bio: 'Biology',
  phy: 'Physics',
  chem: 'Chemistry',
  math: 'Mathematics',
};

const SkeletonRows = () => (
  <div className="folder-list">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="skeleton skeleton-row" />
    ))}
  </div>
);

// Modal for admin to create a new sub-folder inside this section
const CreateFolderModal = ({ subjectId, sectionId, onClose, onCreated }) => {
  const [folderName, setFolderName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const decodedSectionId = decodeURIComponent(sectionId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      await client.post('/admin/content/section', {
        subjectId,
        sectionName: folderName.trim(),
        parentPath: [decodedSectionId],
      });
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create folder');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '420px', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={18} />
        </button>

        <h3 style={{ marginBottom: '1.25rem', color: 'var(--teal-light)' }}>
          <FolderPlus size={18} style={{ verticalAlign: 'middle' }} /> Create New Folder
        </h3>

        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Folder Name</label>
            <input
              placeholder="e.g. Week 1 Lectures"
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button type="submit" className="btn" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? <><Loader2 size={16} className="spin" /> Creating…</> : <><FolderPlus size={16} /> Create Folder</>}
          </button>
        </form>
      </div>
    </div>
  );
};

const SectionFolders = () => {
  const { id, sectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchFolders = async () => {
    try {
      const res = await client.get(`/subjects/${id}/sections/${encodeURIComponent(sectionId)}/folders`);
      const fetchedFolders = res.data;

      if (fetchedFolders.length === 0 && !isAdmin) {
        // No sub-folders, skip directly to content items (treating the section as the folder)
        // Admins stay on this page so they can still see the "Create Folder" action.
        navigate(`/subject/${id}/section/${encodeURIComponent(sectionId)}/folder/${encodeURIComponent(sectionId)}`, { replace: true });
        return;
      }

      setFolders(fetchedFolders);
      setLoading(false);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load folders');
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, sectionId]);

  const subjectLabel = SUBJECT_LABELS[id?.toLowerCase()] || id?.toUpperCase();

  const deleteFolder = async folder => {
    if (!window.confirm(`Delete "${folder.title}" and all its content? This cannot be undone.`)) return;
    try {
      await client.delete('/admin/content/folder', {
        data: { subjectId: id, sectionId: decodeURIComponent(sectionId), folderId: folder.id }
      });
      setFolders(current => current.filter(item => item.id !== folder.id));
    } catch (err) {
      window.alert(err.response?.data?.error || 'Unable to delete this folder.');
    }
  };

  // If loading or redirecting, just show skeleton
  if (loading) return (
    <div>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">›</span>
        <Link to={`/subject/${id}`}>{subjectLabel}</Link>
        <span className="sep">›</span>
        <span>{decodeURIComponent(sectionId)}</span>
      </nav>
      <div className="page-header">
        <h2>{decodeURIComponent(sectionId)}</h2>
        <p>Loading folders...</p>
      </div>
      <SkeletonRows />
    </div>
  );

  return (
    <div>
      {showCreateModal && (
        <CreateFolderModal
          subjectId={id}
          sectionId={sectionId}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setLoading(true); fetchFolders(); }}
        />
      )}

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">›</span>
        <Link to={`/subject/${id}`}>{subjectLabel}</Link>
        <span className="sep">›</span>
        <span>{decodeURIComponent(sectionId)}</span>
      </nav>

      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>{decodeURIComponent(sectionId)}</h2>
          <p>Select a folder to view its content</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-orange btn-sm" onClick={() => setShowCreateModal(true)}>
              <Plus size={14} /> Create Folder
            </button>
            {folders.length === 0 && (
              <Link
                to={`/subject/${id}/section/${encodeURIComponent(sectionId)}/folder/${encodeURIComponent(sectionId)}`}
                className="btn btn-ghost btn-sm"
              >
                View / Upload Content Here
              </Link>
            )}
          </div>
        )}
      </div>

      {error ? (
        <div className="state-box">
          <div className="state-icon">⚠️</div>
          <h3>Couldn't load folders</h3>
          <p>{error}</p>
        </div>
      ) : folders.length === 0 ? (
        <div className="state-box">
          <div className="state-icon">📂</div>
          <h3>No folders yet</h3>
          <p>{isAdmin ? 'Create a folder above, or upload content directly to this section.' : 'No content has been added to this section yet.'}</p>
        </div>
      ) : (
        <div className="clear-folder-list">
          {folders.map(folder => (
            <article className="clear-folder-row" key={folder.id}>
              <Link className="clear-folder-link" to={`/subject/${id}/section/${encodeURIComponent(sectionId)}/folder/${encodeURIComponent(folder.id)}`}>
                <span className="clear-folder-icon"><Folder size={25} /></span>
                <div className="clear-folder-content">
                  <h3>{folder.title}</h3>
                  <p>Tap to view content</p>
                </div>
                <ChevronRight className="clear-folder-arrow" size={22} />
              </Link>
              {isAdmin && (
                <button className="folder-delete-button" onClick={() => deleteFolder(folder)} title="Delete folder">
                  <Trash2 size={17} />
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 0.8s linear infinite; }`}</style>
    </div>
  );
};

export default SectionFolders;
