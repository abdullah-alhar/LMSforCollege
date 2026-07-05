import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Lock, FileText, HelpCircle, X, Key, User, Loader2, Plus, Upload, Video } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const SUBJECT_LABELS = {
  bio: 'Biology',
  phy: 'Physics',
  chem: 'Chemistry',
  math: 'Mathematics',
};

const SkeletonVideos = () => (
  <div className="video-grid">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="skeleton-video card">
        <div className="skeleton skeleton-thumb" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text-sm" />
      </div>
    ))}
  </div>
);

// Modal shown when a student tries to access paid content they don't have access to
const LockedModal = ({ onClose, subjectId }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-box" onClick={e => e.stopPropagation()}>
      <div className="modal-icon">🔒</div>
      <h3>Access Required</h3>
      <p>
        This is premium content. Please contact your admin to unlock access
        to this video. Once granted, you can watch it immediately.
      </p>
      <div className="modal-actions">
        <button className="btn btn-ghost btn-sm" onClick={onClose}>
          <X size={14} /> Close
        </button>
        <Link className="btn btn-sm" to={`/locked/${subjectId}`}>
          Contact Us
        </Link>
      </div>
    </div>
  </div>
);

// Modal for admin to grant a student access to a specific video
const GrantAccessModal = ({ video, subjectId, onClose }) => {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [search, setSearch] = useState('');
  const [studentId, setStudentId] = useState('');
  const [days, setDays] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    client.get('/admin/students')
      .then(r => setStudents(r.data || []))
      .catch(() => setError('Could not load students'))
      .finally(() => setLoadingStudents(false));
  }, []);

  const filteredStudents = students.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (s.name || '').toLowerCase().includes(q) || (s.index || '').toLowerCase().includes(q) || (s.uid || '').toLowerCase().includes(q);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) return;
    setError(''); setSuccess('');
    setSubmitting(true);
    try {
      await client.post('/admin/access/grant', {
        studentId,
        subjectId,
        videoId: video.id,
        days: Number(days) || 0,
      });
      const student = students.find(s => s.uid === studentId);
      setSuccess(
        `Access granted to ${student?.name || studentId}` +
        (Number(days) > 0 ? ` for ${days} day${days === 1 ? '' : 's'}.` : ' (no expiry).')
      );
      setStudentId('');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || err.message || 'Failed to grant access');
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

        <h3 style={{ marginBottom: '0.25rem', color: 'var(--orange)' }}>
          <Key size={18} style={{ verticalAlign: 'middle' }} /> Give Access
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {video.title}
        </p>

        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}
        {success && (
          <div style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', color: '#6EE7B7', padding: '0.7rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label><User size={14} style={{ verticalAlign: 'middle' }} /> Find Student</label>
            <input
              type="text"
              placeholder="Search by name or index..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ marginBottom: '0.5rem' }}
              disabled={loadingStudents}
            />
            <select
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              required
              disabled={loadingStudents}
            >
              <option value="">{loadingStudents ? 'Loading students…' : 'Select a student'}</option>
              {filteredStudents.map(s => (
                <option key={s.uid} value={s.uid}>
                  {(s.name || s.uid)}{s.index ? ` (${s.index})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>
              Access Duration (days){' '}
              <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: '0.8rem' }}>
                (0 = never expires)
              </span>
            </label>
            <input
              type="number"
              min="0"
              value={days}
              onChange={e => setDays(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-orange" disabled={submitting || !studentId} style={{ width: '100%' }}>
            {submitting ? <><Loader2 size={16} className="spin" /> Granting…</> : <><Key size={16} /> Give Access</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// Modal for admin to upload a video directly into the currently-viewed folder
const UploadVideoModal = ({ subjectId, sectionId, folderId, onClose, onUploaded }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('Video');
  const [price, setPrice] = useState('f');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const decodedSectionId = decodeURIComponent(sectionId);
  const decodedFolderId = decodeURIComponent(folderId);
  // If the folder IS the section, there's no nested parentPath needed beyond the section itself.
  const parentPath = decodedFolderId === decodedSectionId
    ? [decodedSectionId]
    : [decodedSectionId, decodedFolderId];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSubmitting(true);
    try {
      await client.post('/admin/content/video', {
        subjectId,
        sectionId: decodedSectionId,
        title,
        content,
        type,
        price,
        parentPath,
      });
      setSuccess('✓ Video added successfully!');
      setTitle(''); setContent('');
      if (onUploaded) onUploaded();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to add video');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '460px', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={18} />
        </button>

        <h3 style={{ marginBottom: '1.25rem', color: 'var(--teal-light)' }}>
          <Upload size={18} style={{ verticalAlign: 'middle' }} /> Upload Video
        </h3>

        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}
        {success && (
          <div style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', color: '#6EE7B7', padding: '0.7rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Heading (title)</label>
            <input
              placeholder="e.g. Electrochemistry - Lecture 1"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Content URL (YouTube or Google Drive)</label>
            <input
              placeholder="https://youtu.be/... or https://drive.google.com/..."
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              Paste a YouTube link or a Google Drive shareable link.
            </small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Type</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="Video">Video</option>
                <option value="File">File</option>
                <option value="Note">Note</option>
              </select>
            </div>
            <div className="input-group">
              <label>Access</label>
              <select value={price} onChange={e => setPrice(e.target.value)}>
                <option value="f">Free</option>
                <option value="p">Paid</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn" disabled={submitting} style={{ width: '100%', marginTop: '0.5rem' }}>
            {submitting ? <><Loader2 size={16} className="spin" /> Uploading…</> : <><Upload size={16} /> Upload Video</>}
          </button>
        </form>
      </div>
    </div>
  );
};

const VideoList = () => {
  const { id, sectionId, folderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lockedModal, setLockedModal] = useState(false);
  const [grantModalVideo, setGrantModalVideo] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [togglingPrice, setTogglingPrice] = useState({}); // videoId → true while saving

  // Toggle a video's price between free ('f') and paid ('p')
  const handleTogglePrice = async (e, v) => {
    e.stopPropagation();
    const newPrice = (v.price === 'p' || v.price === 'paid') ? 'f' : 'p';
    setTogglingPrice(prev => ({ ...prev, [v.id]: true }));
    try {
      await client.patch('/admin/content/video/price', {
        subjectId: id,
        sectionId: decodeURIComponent(sectionId),
        folderId: decodeURIComponent(folderId),
        videoKey: v.id,
        price: newPrice,
      });
      // Update local state so UI refreshes instantly
      setVideos(prev => prev.map(item =>
        item.id === v.id ? { ...item, price: newPrice } : item
      ));
    } catch (err) {
      alert('Failed to update price: ' + (err.response?.data?.error || err.message));
    } finally {
      setTogglingPrice(prev => ({ ...prev, [v.id]: false }));
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await client.get(
        `/subjects/${id}/sections/${encodeURIComponent(sectionId)}/folders/${encodeURIComponent(folderId)}/content`
      );
      setVideos(res.data);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, sectionId, folderId]);

  const handleItemClick = async (item) => {
    const isPaidItem = item.price === 'p' || item.price === 'paid';

    if (!item.type || item.type.toLowerCase() === 'video') {
      // Navigate to VideoPlayer — it will handle the /play endpoint check
      navigate(`/video/${item.id}`, { state: { video: { ...item, folder: folderId } } });
    } else {
      // For file / quiz / text items
      // Open the window synchronously before await to prevent popup blocker
      const newWindow = window.open('about:blank', '_blank');

      try {
        const res = await client.get(`/videos/${item.id}/play`, {
          params: {
            subjectId: id,
            sectionId: decodeURIComponent(sectionId),
            folder: decodeURIComponent(folderId),
            price: item.price
          }
        });
        if (res.data.status === 'allowed') {
          newWindow.location.href = res.data.embedUrl;
        } else if (res.data.status === 'expired') {
          newWindow.close();
          navigate('/expired');
        } else {
          newWindow.close();
          setLockedModal(true);
        }
      } catch (err) {
        newWindow.close();
        if (err.response?.status === 401 || err.response?.data?.status === 'locked') {
          setLockedModal(true);
        } else {
          alert('Error accessing content');
        }
      }
    }
  };

  const isPaid = (v) => {
    const value = String(v.price ?? '').toLowerCase();
    return value === 'p' || value === 'paid' || (!!value && !['f', 'free', '0'].includes(value));
  };
  const displayAmount = v => {
    const amount = v.details?.amount ?? v.details?.paymentAmount ?? v.details?.fee;
    if (amount !== undefined && amount !== null && String(amount).trim()) return String(amount);
    const price = String(v.price ?? '');
    return !['p', 'paid', 'f', 'free', '0', ''].includes(price.toLowerCase()) ? price : null;
  };
  const subjectLabel = SUBJECT_LABELS[id?.toLowerCase()] || id?.toUpperCase();

  const getIconForType = (type) => {
    if (!type) return <Play size={20} fill="white" color="white" />;
    switch (type.toLowerCase()) {
      case 'file': return <FileText size={20} color="white" />;
      case 'quiz': return <HelpCircle size={20} color="white" />;
      case 'text': return <FileText size={20} color="white" />;
      default: return <Play size={20} fill="white" color="white" />;
    }
  };

  return (
    <div>
      {lockedModal && <LockedModal subjectId={id} onClose={() => setLockedModal(false)} />}
      {grantModalVideo && (
        <GrantAccessModal
          video={grantModalVideo}
          subjectId={id}
          onClose={() => setGrantModalVideo(null)}
        />
      )}
      {showUploadModal && (
        <UploadVideoModal
          subjectId={id}
          sectionId={sectionId}
          folderId={folderId}
          onClose={() => setShowUploadModal(false)}
          onUploaded={() => { setShowUploadModal(false); setLoading(true); fetchVideos(); }}
        />
      )}

      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">›</span>
        <Link to={`/subject/${id}`}>{subjectLabel}</Link>
        <span className="sep">›</span>
        <Link to={`/subject/${id}/section/${encodeURIComponent(sectionId)}`}>
          {decodeURIComponent(sectionId)}
        </Link>
        {decodeURIComponent(folderId) !== decodeURIComponent(sectionId) && (
          <>
            <span className="sep">›</span>
            <span>{decodeURIComponent(folderId)}</span>
          </>
        )}
      </nav>

      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>{decodeURIComponent(folderId) === decodeURIComponent(sectionId)
            ? decodeURIComponent(sectionId)
            : decodeURIComponent(folderId)
          }</h2>
          <p>{loading ? '' : `${videos.length} item${videos.length !== 1 ? 's' : ''}`}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {!loading && videos.length > 0 && (
            <>
              <span className="badge badge-free">✓ FREE</span>
              <span className="badge badge-paid">🔒 PAID</span>
            </>
          )}
          {isAdmin && (
            <button type="button" className="btn btn-orange btn-sm" onClick={() => setShowUploadModal(true)}>
              <Plus size={14} /> Upload Video
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <SkeletonVideos />
      ) : error ? (
        <div className="state-box">
          <div className="state-icon">⚠️</div>
          <h3>Couldn't load content</h3>
          <p>{error}</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="state-box">
          <div className="state-icon">🎬</div>
          <h3>No content yet</h3>
          <p>No content has been added to this folder yet.</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map(v => (
            <div
              key={v.id}
              className={`video-card ${(!v.type || v.type.toLowerCase() === 'video') ? '' : 'file-card'}`}
              onClick={() => handleItemClick(v)}
            >
              {(!v.type || v.type.toLowerCase() === 'video') ? (
                <div className="video-thumb">
                  {/* Thumbnail */}
                  {v.thumbnailUrl ? (
                    <img src={v.thumbnailUrl} alt={v.title} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(255, 255, 255, 0.05)' }}>
                      <Video size={48} color="var(--text-muted)" />
                    </div>
                  )}
                  {/* FREE / PAID badge */}
                  <span className={`badge-overlay ${isPaid(v) ? 'badge-overlay-paid' : 'badge-overlay-free'}`}>
                    {isPaid(v) ? 'PAID' : 'FREE'}
                  </span>
                  {/* Lock overlay for paid */}
                  {isPaid(v) ? (
                    <div className="lock-overlay">
                      <div className="lock-icon">
                        <Lock size={20} color="white" />
                      </div>
                    </div>
                  ) : (
                    <div className="play-icon">
                      <Play size={20} fill="white" color="white" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="file-icon-wrapper">
                  {getIconForType(v.type)}
                </div>
              )}

              <div className="video-info">
                <h4>{v.title}</h4>
                {displayAmount(v) && (
                  <div className="video-price-display">
                    <small>Course price</small>
                    <strong><span>LKR</span> {displayAmount(v)}</strong>
                  </div>
                )}
                <div className="card-actions">
                  <span className={`badge ${isPaid(v) ? 'badge-paid' : 'badge-free'}`}>
                    {isPaid(v) ? '🔒 PAID' : '✓ FREE'}
                  </span>
                  {v.type && v.type.toLowerCase() !== 'video' && (
                    <button className="action-btn">
                      {v.type.toLowerCase() === 'file' ? 'View' : 'Open'}
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        className="action-btn"
                        style={{
                          background: isPaid(v) ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          color: isPaid(v) ? '#6ee7b7' : '#fca5a5',
                          border: isPaid(v) ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                        }}
                        onClick={(e) => handleTogglePrice(e, v)}
                        disabled={!!togglingPrice[v.id]}
                      >
                        {togglingPrice[v.id]
                          ? <Loader2 size={11} className="spin" style={{ verticalAlign: 'middle' }} />
                          : isPaid(v) ? '✓ Make Free' : '🔒 Make Paid'
                        }
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        style={{ marginLeft: 'auto' }}
                        onClick={(e) => { e.stopPropagation(); setGrantModalVideo(v); }}
                      >
                        <Key size={13} style={{ verticalAlign: 'middle', marginRight: '2px' }} /> Give Access
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        style={{ color: '#fca5a5', borderColor: 'transparent' }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete ${v.title}?`)) {
                            try {
                              await client.delete('/admin/content/video', {
                                data: { subjectId: id, sectionId: decodeURIComponent(sectionId), folderId: decodeURIComponent(folderId), videoKey: v.id }
                              });
                              fetchVideos();
                            } catch (err) {
                              alert('Failed to delete content');
                            }
                          }
                        }}
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 0.8s linear infinite; }`}</style>
    </div>
  );
};

export default VideoList;
