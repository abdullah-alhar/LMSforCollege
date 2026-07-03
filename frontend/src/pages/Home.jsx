import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Sparkles, BookOpen } from 'lucide-react';

const BioIcon = () => <img src="/bio.gif" alt="Biology" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />;
const PhyIcon = () => <img src="/phy.gif" alt="Physics" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />;
const ChemIcon = () => <img src="/chem.gif" alt="Chemistry" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />;
const MathIcon = () => <img src="/math.gif" alt="Mathematics" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />;

const SUBJECT_META = {
  bio:  { label:'Biology',     Icon:BioIcon,  accent:'#00d4d8', bg:'rgba(0,212,216,0.12)',  border:'rgba(0,212,216,0.28)',  desc:'Life science & living organisms' },
  phy:  { label:'Physics',     Icon:PhyIcon,  accent:'#ff6b35', bg:'rgba(255,107,53,0.12)', border:'rgba(255,107,53,0.25)', desc:'Forces, energy & the universe' },
  chem: { label:'Chemistry',   Icon:ChemIcon, accent:'#00d4d8', bg:'rgba(0,212,216,0.10)',  border:'rgba(0,212,216,0.22)',  desc:'Atoms, molecules & reactions' },
  math: { label:'Mathematics', Icon:MathIcon, accent:'#ff6b35', bg:'rgba(255,107,53,0.12)', border:'rgba(255,107,53,0.22)', desc:'Numbers, logic & proofs' },
};

const Skeleton = () => (
  <div className="subject-grid">
    {[1,2,3,4].map(i => (
      <div key={i} className="skeleton" style={{ height:200, borderRadius:18, animationDelay:`${i*0.07}s` }} />
    ))}
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [quote, setQuote]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [subR, quoteR] = await Promise.allSettled([
          client.get('/subjects'),
          client.get('/content/quotes'),
        ]);
        if (subR.status === 'fulfilled') setSubjects(subR.value.data);
        else throw subR.reason;
        if (quoteR.status === 'fulfilled') {
          const arr = quoteR.value.data;
          if (Array.isArray(arr) && arr.length > 0) setQuote(arr[Math.floor(Math.random() * arr.length)]);
          else if (typeof arr === 'object') {
            const vals = Object.values(arr);
            if (vals.length) setQuote(vals[Math.floor(Math.random() * vals.length)]);
          }
        }
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const firstName = user?.username ? user.username.split(' ')[0] : 'Student';

  return (
    <div>
      {/* Welcome + quote row */}
      <div style={{ marginBottom:'2rem' }} className="anim-in">
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'1.65rem', fontWeight:800, color:'var(--text)', marginBottom:'0.3rem', letterSpacing:'-0.02em' }}>
          Hello, {firstName} 👋
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>
          Pick a subject to continue learning
        </p>
      </div>

      {/* Quote */}
      {quote && (
        <div className="quote-banner anim-in anim-in-1">
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.625rem' }}>
            <Sparkles size={13} color="var(--teal)" />
            <span style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--teal)', textTransform:'uppercase', letterSpacing:'.1em' }}>
              Quote of the Day
            </span>
          </div>
          <p style={{ fontSize:'1.05rem', lineHeight:'1.55' }}>"{quote}"</p>
        </div>
      )}

      {/* Section header */}
      <div className="section-title anim-in anim-in-2" style={{ marginBottom:'1rem', marginTop: quote ? '1.75rem' : 0 }}>
        <BookOpen size={16} /> Subjects
      </div>

      {loading ? (
        <Skeleton />
      ) : error ? (
        <div className="state-box anim-in">
          <span className="state-icon">⚠️</span>
          <h3>Could not load subjects</h3>
          <p>{error}</p>
          <button className="btn btn-ghost btn-sm" style={{ marginTop:'1rem' }} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="state-box anim-in">
          <span className="state-icon">📚</span>
          <h3>No subjects available yet</h3>
          <p>Your admin hasn't added any subjects. Check back soon.</p>
        </div>
      ) : (
        <div className="subject-grid">
          {subjects.map((sub, i) => {
            const meta = SUBJECT_META[sub.id?.toLowerCase()] || {
              label: sub.name || sub.id,
              Icon: () => <BookOpen size={28} color="var(--teal)" />,
              accent: '#00d4d8',
              bg: 'rgba(0,212,216,0.1)',
              border: 'rgba(0,212,216,0.2)',
              desc: 'Study materials',
            };
            return (
              <Link key={sub.id} to={`/subject/${sub.id}`} style={{ textDecoration:'none', display:'block' }}>
                <div className="subject-card anim-in" style={{ animationDelay:`${i*0.08}s` }}>
                  {/* Icon */}
                  <div className="subject-icon-wrap" style={{ background: meta.bg, borderColor: meta.border }}>
                    <meta.Icon />
                  </div>
                  {/* Text */}
                  <h3 style={{ marginTop:'0.25rem' }}>{meta.label}</h3>
                  <p className="subject-meta">{meta.desc}</p>
                  {/* Arrow */}
                  <div className="subject-arrow">
                    <ChevronRight size={15} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
