import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Sparkles, BookOpen } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   Animated subject icons — each is a self-contained SVG/div with
   CSS keyframe animations baked in via a <style> tag.
   All icons: 44 × 44 px viewport, fits inside 72 × 72 icon-wrap.
───────────────────────────────────────────────────────────────── */
const BioIcon = () => (
  <svg viewBox="0 0 44 44" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      .b1{animation:bStrand 2.8s ease-in-out infinite;}
      .b2{animation:bStrand 2.8s ease-in-out infinite reverse;}
      .br{animation:bRung 2.8s ease-in-out infinite;}
      @keyframes bStrand{0%,100%{d:path("M13 5 Q22 13 13 22 Q4 31 13 39")}50%{d:path("M13 5 Q4 13 13 22 Q22 31 13 39")}}
      @keyframes bRung{0%,100%{opacity:.9}50%{opacity:.3}}
    `}</style>
    <path className="b1" d="M13 5 Q22 13 13 22 Q4 31 13 39" stroke="#00d4d8" strokeWidth="2.5" strokeLinecap="round"/>
    <path className="b2" d="M31 5 Q22 13 31 22 Q40 31 31 39" stroke="#ff6b35" strokeWidth="2.5" strokeLinecap="round"/>
    {[10,17,22,27,34].map((y,i) => (
      <line key={y} className="br" x1="13" y1={y} x2="31" y2={y}
        stroke="rgba(0,212,216,.55)" strokeWidth="1.5" strokeLinecap="round"
        style={{animationDelay:`${i*0.3}s`}}/>
    ))}
    <circle cx="13" cy="5"  r="3" fill="#00d4d8" opacity=".9"/>
    <circle cx="31" cy="5"  r="3" fill="#ff6b35" opacity=".9"/>
    <circle cx="13" cy="39" r="3" fill="#00d4d8" opacity=".9"/>
    <circle cx="31" cy="39" r="3" fill="#ff6b35" opacity=".9"/>
  </svg>
);

const PhyIcon = () => (
  <div style={{position:'relative',width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center'}}>
    <style>{`
      .pe1{animation:pe1 2s linear infinite;}
      .pe2{animation:pe2 2.8s linear infinite;}
      @keyframes pe1{from{transform:translate(-50%,-50%) rotate(0deg) translateX(17px)}to{transform:translate(-50%,-50%) rotate(360deg) translateX(17px)}}
      @keyframes pe2{from{transform:translate(-50%,-50%) rotate(60deg) translateX(17px)}to{transform:translate(-50%,-50%) rotate(420deg) translateX(17px)}}
    `}</style>
    <div style={{position:'absolute',width:9,height:9,background:'var(--teal)',borderRadius:'50%',boxShadow:'0 0 10px var(--teal)',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}/>
    <div style={{position:'absolute',width:38,height:16,border:'1.5px solid rgba(0,212,216,.4)',borderRadius:'50%',top:'50%',left:'50%',transform:'translate(-50%,-50%) rotate(0deg)'}}/>
    <div style={{position:'absolute',width:38,height:16,border:'1.5px solid rgba(0,212,216,.28)',borderRadius:'50%',top:'50%',left:'50%',transform:'translate(-50%,-50%) rotate(60deg)'}}/>
    <div style={{position:'absolute',width:38,height:16,border:'1.5px solid rgba(255,107,53,.25)',borderRadius:'50%',top:'50%',left:'50%',transform:'translate(-50%,-50%) rotate(120deg)'}}/>
    <div className="pe1" style={{position:'absolute',width:6,height:6,background:'var(--teal)',borderRadius:'50%',boxShadow:'0 0 6px var(--teal)',top:'50%',left:'50%'}}/>
    <div className="pe2" style={{position:'absolute',width:5,height:5,background:'var(--orange)',borderRadius:'50%',boxShadow:'0 0 6px var(--orange)',top:'50%',left:'50%'}}/>
  </div>
);

const ChemIcon = () => (
  <svg viewBox="0 0 44 44" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      .cs{animation:cSpin 4s linear infinite;transform-origin:22px 22px;}
      .cp{animation:cPulse 2s ease-in-out infinite;}
      @keyframes cSpin{to{transform:rotate(360deg)}}
      @keyframes cPulse{0%,100%{r:5}50%{r:6.5}}
    `}</style>
    <g className="cs">
      <line x1="22" y1="22" x2="9" y2="11"  stroke="rgba(0,212,216,.6)" strokeWidth="1.5"/>
      <line x1="22" y1="22" x2="35" y2="11" stroke="rgba(0,212,216,.6)" strokeWidth="1.5"/>
      <line x1="22" y1="22" x2="9" y2="33"  stroke="rgba(255,107,53,.5)" strokeWidth="1.5"/>
      <line x1="22" y1="22" x2="35" y2="33" stroke="rgba(255,107,53,.5)" strokeWidth="1.5"/>
      <circle className="cp" cx="9"  cy="11" r="5" fill="#00d4d8" fillOpacity=".9" style={{animationDelay:'0s'}}/>
      <circle className="cp" cx="35" cy="11" r="5" fill="#ff6b35" fillOpacity=".9" style={{animationDelay:'.5s'}}/>
      <circle className="cp" cx="9"  cy="33" r="5" fill="#ff6b35" fillOpacity=".9" style={{animationDelay:'1s'}}/>
      <circle className="cp" cx="35" cy="33" r="5" fill="#00d4d8" fillOpacity=".9" style={{animationDelay:'.25s'}}/>
    </g>
    <circle cx="22" cy="22" r="6" fill="#111827" stroke="#00d4d8" strokeWidth="1.5"/>
    <circle cx="22" cy="22" r="2.5" fill="#00d4d8" style={{animation:'cPulse 1.5s ease-in-out infinite'}}/>
  </svg>
);

const MathIcon = () => (
  <svg viewBox="0 0 44 44" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      .md{stroke-dasharray:80;stroke-dashoffset:80;animation:mDraw 2s ease forwards,mPulse 3.5s 2s ease-in-out infinite;}
      @keyframes mDraw{to{stroke-dashoffset:0}}
      @keyframes mPulse{0%,100%{opacity:1}50%{opacity:.5}}
    `}</style>
    {/* π */}
    <line className="md" x1="8"  y1="13" x2="24" y2="13" stroke="#00d4d8" strokeWidth="2.5" strokeLinecap="round" style={{animationDelay:'0s'}}/>
    <line className="md" x1="12" y1="13" x2="12" y2="30" stroke="#00d4d8" strokeWidth="2"   strokeLinecap="round" style={{animationDelay:'.4s'}}/>
    <line className="md" x1="20" y1="13" x2="20" y2="32" stroke="#00d4d8" strokeWidth="2"   strokeLinecap="round" style={{animationDelay:'.4s'}}/>
    {/* ∑ */}
    <path className="md" d="M28 12 L40 12 L32 22 L40 32 L28 32" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animationDelay:'.9s'}}/>
  </svg>
);

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
