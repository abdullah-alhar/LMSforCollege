import React, { useEffect, useRef, useState } from 'react';
import {
  Bell, Bold, Heading1, Heading2, Heading3, Image, Italic,
  Link as LinkIcon, List, Send, Trash2
} from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const displayText = value => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(displayText).filter(Boolean).join('\n');
  if (typeof value === 'object') return Object.values(value).map(displayText).filter(Boolean).join('\n');
  return '';
};

const InlineMarkdown = ({ children }) => {
  const parts = String(children || '').split(/(\*\*.+?\*\*|\*.+?\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    if (/^\*\*.+\*\*$/.test(part)) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (/^\*.+\*$/.test(part)) return <em key={index}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

const MarkdownNotice = ({ value }) => (
  <div className="notice-markdown">
    {String(value || '').split('\n').map((line, index) => {
      const heading = line.match(/^(#{1,3})\s+(.*)$/);
      if (heading) {
        const Tag = `h${heading[1].length}`;
        return <Tag key={index}><InlineMarkdown>{heading[2]}</InlineMarkdown></Tag>;
      }
      const list = line.match(/^[-*]\s+(.*)$/);
      if (list) return <div className="notice-list-line" key={index}><span>•</span><InlineMarkdown>{list[1]}</InlineMarkdown></div>;
      return line ? <p key={index}><InlineMarkdown>{line}</InlineMarkdown></p> : <br key={index} />;
    })}
  </div>
);

const NoticesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const inputRef = useRef(null);
  const [notices, setNotices] = useState([]);
  const [content, setContent] = useState('');
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

  const replaceSelection = (before, after = '', linePrefix = false) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = content.slice(start, end);
    let insert;
    let replaceStart = start;
    if (linePrefix) {
      replaceStart = content.lastIndexOf('\n', start - 1) + 1;
      insert = `${before}${content.slice(replaceStart, end)}`;
    } else {
      insert = `${before}${selected || 'text'}${after}`;
    }
    const next = content.slice(0, replaceStart) + insert + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      input.focus();
      const cursor = replaceStart + insert.length;
      input.setSelectionRange(cursor, cursor);
    });
  };

  const submit = async event => {
    event.preventDefault();
    const title = content.trim();
    if (!title) return;
    setStatus('');
    try {
      await client.post('/notices', { title, type: 't' });
      setContent('');
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
      <div className="page-header"><h1>Notices</h1><p>{isAdmin ? 'Create mobile-compatible announcements with Markdown formatting.' : 'Latest announcements from your learning platform.'}</p></div>
      {isAdmin && (
        <form className="notice-page-composer card" onSubmit={submit}>
          <div className="notice-input-label">Input</div>
          <div className="notice-markdown-editor">
            <textarea ref={inputRef} rows="8" value={content} onChange={event => setContent(event.target.value)} placeholder="Write your notice…" required />
            <div className="notice-toolbar" aria-label="Text formatting">
              <button type="button" title="Bold" onClick={() => replaceSelection('**', '**')}><Bold size={16} /></button>
              <button type="button" title="Italic" onClick={() => replaceSelection('*', '*')}><Italic size={16} /></button>
              <button type="button" title="Heading 1" onClick={() => replaceSelection('# ', '', true)}><Heading1 size={18} /></button>
              <button type="button" title="Heading 2" onClick={() => replaceSelection('## ', '', true)}><Heading2 size={18} /></button>
              <button type="button" title="Heading 3" onClick={() => replaceSelection('### ', '', true)}><Heading3 size={18} /></button>
              <button type="button" title="Link" onClick={() => replaceSelection('[', '](https://)')}><LinkIcon size={16} /></button>
              <button type="button" title="List" onClick={() => replaceSelection('- ', '', true)}><List size={17} /></button>
            </div>
          </div>
          <div className="notice-input-label output">Output</div>
          <div className="notice-output-preview">
            {content ? <MarkdownNotice value={content} /> : <span>Your formatted notice will appear here.</span>}
          </div>
          {status && <div className="form-alert">{status}</div>}
          <button className="btn" disabled={!content.trim()}><Send size={16} /> Publish notice</button>
        </form>
      )}

      <div className="notice-page-list">
        {loading && <div className="state-box">Loading notices…</div>}
        {notices.map((rawNotice, index) => {
          const notice = rawNotice && typeof rawNotice === 'object' ? rawNotice : { title: rawNotice };
          const title = displayText(notice.title);
          const noticeType = String(notice.type || 't').toLowerCase();
          const isImage = noticeType === 'i' || noticeType === 'image';
          return (
            <article className="card notice-page-item" key={displayText(notice.id) || `${title}-${index}`}>
              <span className="notification-icon">{isImage ? <Image size={18} /> : <Bell size={18} />}</span>
              <div>{isImage ? <img src={title} alt="Notice" /> : <MarkdownNotice value={title || displayText(notice.desc || notice.content)} />}</div>
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
