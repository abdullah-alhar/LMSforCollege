import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, FolderPlus, Video, FileText, Search, Key, X, User } from 'lucide-react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const SUBJECTS = ['bio', 'phy', 'chem', 'math'];
const SUBJECT_LABELS = { bio: 'Biology', phy: 'Physics', chem: 'Chemistry', math: 'Mathematics' };

const ContentManager = () => {
  const { user } = useAuth();

  // If admin has an owner subject, lock them to it
  const ownerSubject = user?.owner || null;

  const [tab, setTab]       = useState('video'); // 'video' | 'section' | 'browse'
  const [sections, setSections]   = useState([]);
  const [loadingSec, setLoadingSec] = useState(false);

  const [videoForm, setVideoForm] = useState({
    subjectId: ownerSubject || 'bio',
    sectionId: '',
    title:     '',
    content:   '',
    type:      'Video',
    price:     'f',
  });

  const [sectionForm, setSectionForm] = useState({
    subjectId:   ownerSubject || 'bio',
    sectionName: '',
  });

  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  // ── Browse Videos tab state ─────────────────────────────────────────
  const [browseSubject, setBrowseSubject] = useState(ownerSubject || 'bio');
  const [browseSections, setBrowseSections] = useState([]);
  const [browseSectionId, setBrowseSectionId] = useState('');
  const [browseFolders, setBrowseFolders] = useState([]);
  const [browseFolderId, setBrowseFolderId] = useState('');
  const [browseVideos, setBrowseVideos] = useState([]);
  const [loadingBrowseSec, setLoadingBrowseSec] = useState(false);
  const [loadingBrowseFolders, setLoadingBrowseFolders] = useState(false);
  const [loadingBrowseVideos, setLoadingBrowseVideos] = useState(false);

  // ── Grant Access modal state ────────────────────────────────────────
  const [grantModalVideo, setGrantModalVideo] = useState(null); // the video object, or null when closed
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [grantStudentId, setGrantStudentId] = useState('');
  const [grantDays, setGrantDays] = useState(30);
  const [granting, setGranting] = useState(false);
  const [grantError, setGrantError] = useState('');
  const [grantSuccess, setGrantSuccess] = useState('');

  // Fetch sections whenever subject changes (Add Video tab)
  useEffect(() => {
    const subj = videoForm.subjectId;
    if (!subj) return;
    setLoadingSec(true);
    client.get(`/subjects/${subj}/sections`)
      .then(r => {
        setSections(r.data);
        setVideoForm(f => ({ ...f, sectionId: r.data[0]?.title || '' }));
      })
      .catch(() => setSections([]))
      .finally(() => setLoadingSec(false));
  }, [videoForm.subjectId]);

  // Fetch sections whenever Browse Videos subject changes
  useEffect(() => {
    setBrowseSectionId(''); setBrowseFolderId('');
    setBrowseFolders([]); setBrowseVideos([]);
    if (!browseSubject) return;
    setLoadingBrowseSec(true);
    client.get(`/subjects/${browseSubject}/sections`)
      .then(r => setBrowseSections(r.data || []))
      .catch(() => setBrowseSections([]))
      .finally(() => setLoadingBrowseSec(false));
  }, [browseSubject]);

  // Fetch folders whenever Browse Videos section changes
  useEffect(() => {
    setBrowseFolderId('');
    setBrowseFolders([]); setBrowseVideos([]);
    if (!browseSubject || !browseSectionId) return;
    setLoadingBrowseFolders(true);
    client.get(`/subjects/${browseSubject}/sections/${browseSectionId}/folders`)
      .then(r => {
        const data = r.data || [];
        // No sub-folders → content sits directly under the section
        if (data.length === 0) setBrowseFolderId(browseSectionId);
        else setBrowseFolders(data);
      })
      .catch(() => setBrowseFolders([]))
      .finally(() => setLoadingBrowseFolders(false));
  }, [browseSubject, browseSectionId]);

  // Fetch videos whenever Browse Videos folder changes
  useEffect(() => {
    setBrowseVideos([]);
    if (!browseSubject || !browseSectionId || !browseFolderId) return;
    setLoadingBrowseVideos(true);
    client.get(`/subjects/${browseSubject}/sections/${browseSectionId}/folders/${browseFolderId}/content`)
      .then(r => setBrowseVideos(r.data || []))
      .catch(() => setBrowseVideos([]))
      .finally(() => setLoadingBrowseVideos(false));
  }, [browseSubject, browseSectionId, browseFolderId]);

  const handleVideoChange = e => setVideoForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSectionChange = e => setSectionForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await client.post('/admin/content/video', videoForm);
      setSuccess('✓ Video added successfully! It will appear for students with access to this subject.');
      setVideoForm(f => ({ ...f, title: '', content: '' }));
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to add video');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await client.post('/admin/content/section', sectionForm);
      setSuccess('✓ Section created: ' + sectionForm.sectionName);
      setSectionForm(f => ({ ...f, sectionName: '' }));
      // Refresh sections list
      const r = await client.get(`/subjects/${sectionForm.subjectId}/sections`);
      setSections(r.data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  // ── Grant Access modal handlers ─────────────────────────────────────
  const openGrantModal = (video) => {
    setGrantModalVideo(video);
    setGrantStudentId('');
    setGrantDays(video?.days && parseInt(video.days, 10) > 0 ? parseInt(video.days, 10) : 30);
    setGrantError(''); setGrantSuccess('');
    if (students.length === 0) {
      setLoadingStudents(true);
      client.get('/admin/students')
        .then(r => setStudents(r.data || []))
        .catch(() => setGrantError('Could not load students'))
        .finally(() => setLoadingStudents(false));
    }
  };

  const closeGrantModal = () => setGrantModalVideo(null);

  const handleGrantSubmit = async (e) => {
    e.preventDefault();
    if (!grantModalVideo || !grantStudentId) return;
    setGrantError(''); setGrantSuccess('');
    setGranting(true);
    try {
      await client.post('/admin/access/grant', {
        studentId: grantStudentId,
        subjectId: browseSubject,
        videoId:   grantModalVideo.id,
        days:      Number(grantDays) || 0,
      });
      const student = students.find(s => s.uid === grantStudentId);
      setGrantSuccess(
        `Access granted to ${student?.name || grantStudentId}` +
        (Number(grantDays) > 0 ? ` for ${grantDays} day${grantDays === 1 ? '' : 's'}.` : ' (no expiry).')
      );
      setGrantStudentId('');
    } catch (err) {
      setGrantError(err.response?.data?.error || err.response?.data || err.message || 'Failed to grant access');
    } finally {
      setGranting(false);
    }
  };

  const subjectOptions = ownerSubject
    ? [{ id: ownerSubject, name: SUBJECT_LABELS[ownerSubject] || ownerSubject }]
    : SUBJECTS.map(id => ({ id, name: SUBJECT_LABELS[id] }));

  return (
    <div>
      <nav className="breadcrumb">
        <Link to="/admin">Admin</Link>
        <span className="sep">›</span>
        <span>Content Manager</span>
      </nav>

      <div className="page-header">
        <h2>Content Manager</h2>
        <p>
          {ownerSubject
            ? `Managing: ${SUBJECT_LABELS[ownerSubject] || ownerSubject} (subject-admin)`
            : 'Add videos and manage sections across all subjects'}
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${tab === 'video' ? '' : 'btn-ghost'}`}
          onClick={() => { setTab('video'); setError(''); setSuccess(''); }}
        >
          <Video size={16} /> Add Video
        </button>
        <button
          className={`btn ${tab === 'section' ? '' : 'btn-ghost'}`}
          onClick={() => { setTab('section'); setError(''); setSuccess(''); }}
        >
          <FolderPlus size={16} /> Create Section
        </button>
        <button
          className={`btn ${tab === 'browse' ? '' : 'btn-ghost'}`}
          onClick={() => { setTab('browse'); setError(''); setSuccess(''); }}
        >
          <Search size={16} /> Browse Videos
        </button>
      </div>

      {tab !== 'browse' ? (
        <div className="card" style={{ maxWidth: '560px' }}>
          {error   && <div className="error-msg" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}
          {success && (
            <div style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', color: '#6EE7B7', padding: '0.7rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
              {success}
            </div>
          )}

          {tab === 'video' ? (
            <>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--teal-light)' }}>
                <Plus size={18} style={{ verticalAlign: 'middle' }} /> Add New Video
              </h3>
              <form onSubmit={handleVideoSubmit}>
                <div className="input-group">
                  <label>Subject</label>
                  <select
                    name="subjectId"
                    value={videoForm.subjectId}
                    onChange={handleVideoChange}
                    disabled={!!ownerSubject}
                  >
                    {subjectOptions.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {ownerSubject && (
                    <small style={{ color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      🔒 Locked to your subject
                    </small>
                  )}
                </div>

                <div className="input-group">
                  <label>Section {loadingSec && <Loader2 size={12} className="spin" style={{ display: 'inline', marginLeft: '4px' }} />}</label>
                  {sections.length > 0 ? (
                    <select name="sectionId" value={videoForm.sectionId} onChange={handleVideoChange}>
                      {sections.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                    </select>
                  ) : (
                    <input
                      name="sectionId"
                      placeholder="Type section name"
                      value={videoForm.sectionId}
                      onChange={handleVideoChange}
                      required
                    />
                  )}
                </div>

                <div className="input-group">
                  <label>Video Title</label>
                  <input
                    name="title"
                    placeholder="e.g. Electrochemistry - Lecture 1"
                    value={videoForm.title}
                    onChange={handleVideoChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Content URL (YouTube or Google Drive)</label>
                  <input
                    name="content"
                    placeholder="https://youtu.be/... or https://drive.google.com/..."
                    value={videoForm.content}
                    onChange={handleVideoChange}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    Paste a YouTube link or a Google Drive shareable link.
                  </small>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Type</label>
                    <select name="type" value={videoForm.type} onChange={handleVideoChange}>
                      <option value="Video">Video</option>
                      <option value="File">File</option>
                      <option value="Note">Note</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Access</label>
                    <select name="price" value={videoForm.price} onChange={handleVideoChange}>
                      <option value="f">Free</option>
                      <option value="p">Paid</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.5rem', width: '100%' }}>
                  {loading ? <><Loader2 size={16} className="spin" /> Adding…</> : <><Plus size={16} /> Add Video</>}
                </button>
              </form>
            </>
          ) : (
            <>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--teal-light)' }}>
                <FolderPlus size={18} style={{ verticalAlign: 'middle' }} /> Create New Section
              </h3>
              <form onSubmit={handleSectionSubmit}>
                <div className="input-group">
                  <label>Subject</label>
                  <select
                    name="subjectId"
                    value={sectionForm.subjectId}
                    onChange={handleSectionChange}
                    disabled={!!ownerSubject}
                  >
                    {subjectOptions.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {ownerSubject && (
                    <small style={{ color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      🔒 Locked to your subject
                    </small>
                  )}
                </div>

                <div className="input-group">
                  <label>Section / Folder Name</label>
                  <input
                    name="sectionName"
                    placeholder="e.g. Zoom Videos - Batch 2025"
                    value={sectionForm.sectionName}
                    onChange={handleSectionChange}
                    required
                  />
                </div>

                <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.5rem', width: '100%' }}>
                  {loading ? <><Loader2 size={16} className="spin" /> Creating…</> : <><FolderPlus size={16} /> Create Section</>}
                </button>
              </form>

              {sections.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Existing sections in {SUBJECT_LABELS[sectionForm.subjectId] || sectionForm.subjectId}:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {sections.map(s => (
                      <span key={s.id} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {s.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="card" style={{ maxWidth: '720px' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--teal-light)' }}>
            <Search size={18} style={{ verticalAlign: 'middle' }} /> Browse Videos
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Subject</label>
              <select value={browseSubject} onChange={e => setBrowseSubject(e.target.value)} disabled={!!ownerSubject}>
                {subjectOptions.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Section</label>
              <select value={browseSectionId} onChange={e => setBrowseSectionId(e.target.value)} disabled={loadingBrowseSec}>
                <option value="">{loadingBrowseSec ? 'Loading…' : 'Select a section'}</option>
                {browseSections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>

            {browseSectionId && browseFolders.length > 0 && (
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Folder</label>
                <select value={browseFolderId} onChange={e => setBrowseFolderId(e.target.value)} disabled={loadingBrowseFolders}>
                  <option value="">{loadingBrowseFolders ? 'Loading…' : 'Select a folder'}</option>
                  {browseFolders.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                </select>
              </div>
            )}
          </div>

          {loadingBrowseVideos && (
            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 size={16} className="spin" /> Loading videos…
            </p>
          )}

          {!loadingBrowseVideos && browseFolderId && browseVideos.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>No videos found in this folder.</p>
          )}

          {!loadingBrowseVideos && browseVideos.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {browseVideos.map(v => {
                const isPaid = v.price && v.price !== 'f' && v.price !== 'free';
                return (
                  <div
                    key={v.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                      {v.type === 'video' || !v.type ? <Video size={16} style={{ flexShrink: 0, color: 'var(--text-muted)' }} /> : <FileText size={16} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</span>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '20px',
                        flexShrink: 0,
                        background: isPaid ? 'rgba(232,89,12,.15)' : 'rgba(16,185,129,.15)',
                        color: isPaid ? 'var(--orange)' : '#6EE7B7',
                      }}>
                        {isPaid ? 'PAID' : 'FREE'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-orange"
                      style={{ flexShrink: 0, padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      onClick={() => openGrantModal(v)}
                    >
                      <Key size={14} /> Grant Access
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Grant Access Modal ──────────────────────────────────────── */}
      {grantModalVideo && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem',
          }}
          onClick={closeGrantModal}
        >
          <div
            className="card"
            style={{ maxWidth: '420px', width: '100%', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeGrantModal}
              style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ marginBottom: '0.25rem', color: 'var(--orange)' }}>
              <Key size={18} style={{ verticalAlign: 'middle' }} /> Grant Access
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {grantModalVideo.title}
            </p>

            {grantError   && <div className="error-msg" style={{ marginBottom: '1rem' }}>⚠️ {grantError}</div>}
            {grantSuccess && (
              <div style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', color: '#6EE7B7', padding: '0.7rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                ✓ {grantSuccess}
              </div>
            )}

            <form onSubmit={handleGrantSubmit}>
              <div className="input-group">
                <label><User size={14} style={{ verticalAlign: 'middle' }} /> Student</label>
                <select
                  value={grantStudentId}
                  onChange={e => setGrantStudentId(e.target.value)}
                  required
                  disabled={loadingStudents}
                >
                  <option value="">{loadingStudents ? 'Loading students…' : 'Select a student'}</option>
                  {students.map(s => (
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
                  value={grantDays}
                  onChange={e => setGrantDays(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-orange" disabled={granting || !grantStudentId} style={{ width: '100%' }}>
                {granting ? <><Loader2 size={16} className="spin" /> Granting…</> : <><Key size={16} /> Grant Access</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 0.8s linear infinite; }`}</style>
    </div>
  );
};

export default ContentManager;