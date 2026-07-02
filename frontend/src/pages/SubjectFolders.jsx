import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, BookOpen } from 'lucide-react';
import client from '../api/client';

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
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await client.get(`/subjects/${id}/sections`);
        setSections(res.data);
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Failed to load sections');
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, [id]);

  const subjectLabel = SUBJECT_LABELS[id?.toLowerCase()] || id?.toUpperCase();

  return (
    <div>
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">›</span>
        <span>{subjectLabel}</span>
      </nav>

      <div className="page-header anim-in">
        <h2>{subjectLabel}</h2>
        <p>Select a section to view its content</p>
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
        <div className="folder-list">
          {sections.map((sec, i) => (
            <Link key={sec.id} to={`/subject/${id}/section/${encodeURIComponent(sec.title)}`}>
              <div className="folder-item anim-in" style={{ animationDelay:`${i*0.06}s` }}>
                <span className="folder-icon">
                  <BookOpen size={22} color="var(--teal)" />
                </span>
                <div>
                  <h3>{sec.title}</h3>
                  <p className="folder-meta">Tap to view videos</p>
                </div>
                <ChevronRight size={18} className="folder-arrow" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectFolders;
