import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import client from '../api/client';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import { useAuth } from '../context/AuthContext';

/* ── Orbital Loading Spinner ── */
const OrbitalLoader = ({ message = 'Authenticating secure stream…' }) => (
  <div className="orbital-loader" style={{ minHeight:400, justifyContent:'center' }}>
    <div className="orbital-ring-wrap">
      <div className="orbital-ring" />
      <div className="orbital-ring" />
      <div className="orbital-ring" />
      <div className="orbital-dot" />
    </div>
    <p>{message}</p>
  </div>
);

const VideoPlayer = () => {
  const { videoId }  = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();
  const { user }     = useAuth();

  const [video]       = useState(location.state?.video || null);
  const [embedUrl, setEmbedUrl] = useState(null);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(true);

  // Block inspect / download shortcuts
  useEffect(() => {
    const blockCtx  = (e) => e.preventDefault();
    const blockKeys = (e) => {
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && ['s','u','p'].includes(e.key.toLowerCase())) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', blockCtx);
    document.addEventListener('keydown', blockKeys);
    return () => {
      document.removeEventListener('contextmenu', blockCtx);
      document.removeEventListener('keydown', blockKeys);
    };
  }, []);

  useEffect(() => {
    const fetchPlayUrl = async () => {
      if (!video) {
        setError('Video information not found. Please go back and select a video.');
        setLoading(false);
        return;
      }
      try {
        const { subjectId, sectionId, folder, price } = video;
        const res = await client.get(`/videos/${videoId}/play`, {
          params: { subjectId, sectionId, folder: folder || sectionId, price }
        });
        const data = res.data;
        if (data.status === 'locked') {
          navigate(`/locked/${subjectId}`);
        } else if (data.status === 'expired') {
          navigate('/expired');
        } else if (data.status === 'allowed') {
          setEmbedUrl(data.embedUrl);
        } else {
          setError('Unexpected access status returned from server.');
        }
      } catch (e) {
        if (e.response?.status === 401) {
          navigate(`/locked/${video.subjectId}`);
        } else {
          setError(e.response?.data?.message || e.message || 'Failed to load video');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPlayUrl();
  }, [videoId, video, navigate]);

  return (
    <div style={{ padding:'1.5rem', maxWidth:'1100px', margin:'0 auto' }}>
      <button
        className="btn btn-ghost btn-sm"
        style={{ marginBottom:'1.5rem', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {loading ? (
        <OrbitalLoader />
      ) : error ? (
        <div className="state-box">
          <span className="state-icon">⚠️</span>
          <h3>Couldn't load video</h3>
          <p>{error}</p>
          <button className="btn btn-ghost btn-sm" style={{ marginTop:'1rem' }} onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      ) : embedUrl ? (
        <div className="anim-in">
          {video?.title && (
            <h2 style={{ marginBottom:'1.25rem', color:'var(--text)', fontSize:'1.4rem' }}>
              {video.title}
            </h2>
          )}
          <CustomVideoPlayer url={embedUrl} title={video?.title} watermark={user?.username || user?.uid || 'Student'} />
        </div>
      ) : (
        <div className="state-box">
          <span className="state-icon">🎬</span>
          <p>Video URL not available</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
