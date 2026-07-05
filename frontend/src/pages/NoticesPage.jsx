import React, { useEffect, useState } from 'react';
import { Bell, Image, Send, Trash2 } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const NoticesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ title: '', desc: '', type: 'text', imageUrl: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    return client.get('/notices')
      .then(response => setNotices(Array.isArray(response.data) ? response.data : []))
      .catch(() => setStatus('Notices could not be loaded.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const displayText = value => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (Array.isArray(value)) return value.map(displayText).filter(Boolean).join('\n');
    if (typeof value === 'object') {
      return Object.values(value).map(displayText).filter(Boolean).join('\n');
    }
    return '';
  };

  const submit = async event => {
    event.preventDefault();
    setStatus('');
    try {
      await client.post('/notices', form);
      setForm({ title: '', desc: '', type: 'text', imageUrl: '' });
      setStatus('Notice published successfully.');
      await load();
    } catch (error) {
      setStatus(displayText(error.response?.data?.error || error.response?.data) || 'Notice could not be published.');
    }
  };

  const remove = async id => {
    if (!window.confirm('Delete this notice?')) return;
    await client.delete(`/notices/${id}`);
    setNotices(current => current.filter(notice => notice.id !== id));
  };

  return (
    <div>
      <div className="page-header"><h1>Notices</h1><p>{isAdmin ? 'Create and manage student announcements.' : 'Latest announcements from your learning platform.'}</p></div>
      {isAdmin && (
        <form className="notice-page-composer card" onSubmit={submit}>
          <div className="notice-type-switch">
            <button type="button" className={form.type === 'text' ? 'active' : ''} onClick={() => setForm(current => ({ ...current, type: 'text' }))}>Text</button>
            <button type="button" className={form.type === 'image' ? 'active' : ''} onClick={() => setForm(current => ({ ...current, type: 'image' }))}><Image size={15} /> Image</button>
          </div>
          <div className="input-group"><label>Title</label><input value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} required /></div>
          <div className="input-group"><label>Description</label><textarea rows="5" value={form.desc} onChange={event => setForm(current => ({ ...current, desc: event.target.value }))} /></div>
          {form.type === 'image' && <div className="input-group"><label>Image URL</label><input type="url" value={form.imageUrl} onChange={event => setForm(current => ({ ...current, imageUrl: event.target.value }))} /></div>}
          {status && <div className="form-alert">{status}</div>}
          <button className="btn"><Send size={16} /> Publish notice</button>
        </form>
      )}
      <div className="notice-page-list">
        {loading && <div className="state-box">Loading notices…</div>}
        {notices.map((rawNotice, index) => {
          const notice = rawNotice && typeof rawNotice === 'object' ? rawNotice : { title: rawNotice };
          const title = displayText(notice.title) || 'Notice';
          const description = displayText(notice.desc || notice.content);
          const imageUrl = typeof notice.imageUrl === 'string' ? notice.imageUrl : '';
          return (
          <article className="card notice-page-item" key={displayText(notice.id) || `${title}-${index}`}>
            <span className="notification-icon"><Bell size={18} /></span>
            <div><h3>{title}</h3>{description && <p>{description}</p>}{imageUrl && <img src={imageUrl} alt="" />}</div>
            {isAdmin && notice.id && <button onClick={() => remove(notice.id)} aria-label="Delete notice"><Trash2 size={17} /></button>}
          </article>
          );
        })}
        {!loading && !notices.length && <div className="state-box">No notices available.</div>}
      </div>
    </div>
  );
};

export default NoticesPage;
