import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Eye, EyeOff, AlertCircle, Loader2, ArrowRight,
  GraduationCap, Check, Dna, Atom, FlaskConical, Calculator
} from 'lucide-react';

/* ── Floating animated subject cards on the right panel ── */
const SUBJECTS = [
  {
    icon: <Atom size={28} />,
    label: 'Physics',
    desc: 'Forces & Energy',
    color: '#00d4d8',
    bg: 'rgba(0,212,216,0.12)',
    border: 'rgba(0,212,216,0.25)',
    delay: '0s',
    x: '8%', y: '12%',
  },
  {
    icon: <FlaskConical size={28} />,
    label: 'Chemistry',
    desc: 'Atoms & Reactions',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.22)',
    delay: '0.5s',
    x: '52%', y: '5%',
  },
  {
    icon: <Dna size={28} />,
    label: 'Biology',
    desc: 'Life Sciences',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)',
    border: 'rgba(167,139,250,0.22)',
    delay: '1s',
    x: '22%', y: '52%',
  },
  {
    icon: <Calculator size={28} />,
    label: 'Mathematics',
    desc: 'Numbers & Logic',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.1)',
    border: 'rgba(251,146,60,0.22)',
    delay: '0.75s',
    x: '58%', y: '48%',
  },
];

const FEATURES = [
  'Expert recorded lectures on demand',
  'Sri Lanka\'s premier A/L platform',
  'Track your progress by section',
  'Secure access to premium content',
];

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Please enter your index number.'); return; }
    if (!password)        { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      const ok = await login(username.trim(), password);
      if (ok) navigate('/');
      else setError('Incorrect index number or password.');
    } catch { setError('Connection error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#080c14',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden',
    }}>

      {/* ── LEFT: Form Panel ─────────────────────────────────── */}
      <div style={{
        width: '42%',
        minWidth: 360,
        background: '#0d1525',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '2.5rem',
        position: 'relative',
        zIndex: 2,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateX(-20px)',
        transition: 'opacity .5s ease, transform .5s ease',
      }}>
        {/* Top: Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #00d4d8, #00909a)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,212,216,.3)',
          }}>
            <GraduationCap size={20} color="#080c14" />
          </div>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: '0.95rem',
            color: '#f0f4ff', letterSpacing: '-0.01em',
          }}>
            <span style={{ color: '#00d4d8' }}>e</span>SCIENCE TOPPERS
          </span>
        </div>

        {/* Middle: Form */}
        <div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '2rem', fontWeight: 800,
            color: '#f0f4ff', marginBottom: '0.4rem',
            letterSpacing: '-0.03em', lineHeight: 1.15,
          }}>
            Sign in to<br />
            <span style={{
              background: 'linear-gradient(135deg, #00d4d8, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>your account</span>
          </h1>
          <p style={{ color: '#6b7a99', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Enter your student credentials to continue
          </p>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
              color: '#fca5a5', padding: '0.7rem 0.875rem',
              borderRadius: 8, fontSize: '0.84rem', marginBottom: '1.25rem',
              animation: 'slideDown .3s ease',
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Index Number */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block', fontSize: '0.75rem', fontWeight: 600,
                color: '#a8b3cf', marginBottom: '0.5rem', letterSpacing: '.04em',
              }}>
                Index Number
              </label>
              <input
                type="text"
                placeholder="e.g. 2024/SCI/0042"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                style={{
                  width: '100%', padding: '0.825rem 1rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 10, color: '#f0f4ff',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color .2s, box-shadow .2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(0,212,216,.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,212,216,.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.09)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{
                display: 'block', fontSize: '0.75rem', fontWeight: 600,
                color: '#a8b3cf', marginBottom: '0.5rem', letterSpacing: '.04em',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '0.825rem 3rem 0.825rem 1rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 10, color: '#f0f4ff',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color .2s, box-shadow .2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(0,212,216,.5)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,212,216,.08)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.09)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: '#4d5f82', cursor: 'pointer', padding: 0,
                    lineHeight: 1,
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.925rem',
                background: loading
                  ? 'rgba(0,212,216,.3)'
                  : 'linear-gradient(135deg, #00d4d8 0%, #009ba0 100%)',
                border: 'none', borderRadius: 10,
                color: '#080c14', fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800, fontSize: '0.975rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(0,212,216,.25)',
                transition: 'all .2s',
                letterSpacing: '.01em',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,212,216,.35)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 24px rgba(0,212,216,.25)'; }}
            >
              {loading
                ? <><Loader2 size={17} className="spin" /> Signing in…</>
                : <>Continue <ArrowRight size={16} /></>
              }
            </button>
          </form>
        </div>

        {/* Bottom: copyright */}
        <p style={{ fontSize: '0.7rem', color: '#2d3a52', textAlign: 'center' }}>
          © {new Date().getFullYear()} eSCIENCE TOPPERS. All rights reserved.
        </p>
      </div>

      {/* ── RIGHT: Visual Panel ─────────────────────────────── */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: '#080c14',
        overflow: 'hidden',
        opacity: mounted ? 1 : 0,
        transition: 'opacity .7s .2s ease',
      }}>
        {/* Background mesh gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 60% at 60% 50%, rgba(0,212,216,.07) 0%, transparent 65%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(16,185,129,.05) 0%, transparent 60%)',
        }} />

        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Glowing orb */}
        <div style={{
          position: 'absolute',
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,216,.08) 0%, transparent 70%)',
          top: '30%', left: '35%',
          transform: 'translate(-50%,-50%)',
          animation: 'orbPulse 6s ease-in-out infinite',
        }} />

        {/* Floating subject cards */}
        {SUBJECTS.map((s, i) => (
          <div
            key={s.label}
            style={{
              position: 'absolute',
              left: s.x, top: s.y,
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 16,
              padding: '1rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              backdropFilter: 'blur(12px)',
              animation: `cardFloat 4s ${s.delay} ease-in-out infinite alternate`,
              boxShadow: `0 8px 32px rgba(0,0,0,.4), 0 0 20px ${s.color}18`,
              minWidth: 170,
            }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: `${s.color}18`,
              border: `1px solid ${s.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color,
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#f0f4ff' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6b7a99', marginTop: 2 }}>
                {s.desc}
              </div>
            </div>
          </div>
        ))}

        {/* Centre brand + tagline */}
        <div style={{
          position: 'absolute',
          bottom: '10%', left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          width: '80%',
        }}>
          {/* Feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.875rem',
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.07)',
                borderRadius: 20,
                fontSize: '0.78rem', color: '#a8b3cf',
                animation: `featureIn .5s ${0.1 * i + 0.5}s ease both`,
              }}>
                <Check size={11} color="#00d4d8" strokeWidth={3} />
                {f}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.72rem', color: '#2d3a52' }}>
            Sri Lanka's premier A/L Science learning platform
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes cardFloat {
          0%   { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-14px) rotate(0.8deg); }
        }
        @keyframes orbPulse {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity:.6; }
          50%      { transform: translate(-50%,-50%) scale(1.2); opacity:1; }
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes featureIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        .spin { animation: spin .8s linear infinite; display:inline-block; }
        input::placeholder { color: #2d3a52; }
        @media (max-width: 680px) {
          .login-right { display: none !important; }
          .login-left  { width: 100% !important; min-width: unset !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;
