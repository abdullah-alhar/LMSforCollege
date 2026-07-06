import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Loader2, ArrowRight, GraduationCap, CreditCard, MonitorCheck, ShieldCheck, X } from 'lucide-react';
import PaymentMethodsModal from '../components/PaymentMethodsModal';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showBrowserRegistration, setShowBrowserRegistration] = useState(false);
  const { login, user } = useAuth();
  const navigate  = useNavigate();

  // If already logged in, skip the login page entirely
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Please enter your index number.'); return; }
    if (!password)        { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (result.ok) {
        navigate('/');
      } else if (result.code === 'BROWSER_REGISTRATION_REQUIRED') {
        setShowBrowserRegistration(true);
      } else if (result.code === 'DIFFERENT_BROWSER') {
        setError(result.message);
      } else {
        setError('Incorrect index number or password.');
      }
    } catch { setError('Connection error. Please try again.'); }
    finally { setLoading(false); }
  };

  const registerCurrentBrowser = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await login(username.trim(), password, true);
      if (result.ok) {
        setShowBrowserRegistration(false);
        navigate('/');
      } else {
        setShowBrowserRegistration(false);
        setError(result.message || 'This browser could not be registered. Please contact an administrator.');
      }
    } catch {
      setShowBrowserRegistration(false);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-deep)',
      fontFamily: "'Inter', sans-serif",
      padding: '1.5rem',
    }}>
      {showRegister && <PaymentMethodsModal subjectId="all" onClose={() => setShowRegister(false)} />}
      {showBrowserRegistration && (
        <div className="browser-register-overlay" role="dialog" aria-modal="true" aria-labelledby="browser-register-title">
          <div className="browser-register-modal">
            <button
              type="button"
              className="browser-register-close"
              aria-label="Cancel browser registration"
              onClick={() => setShowBrowserRegistration(false)}
              disabled={loading}
            >
              <X size={20} />
            </button>
            <div className="browser-register-icon"><MonitorCheck size={32} /></div>
            <p className="browser-register-eyebrow"><ShieldCheck size={15} /> Secure web access</p>
            <h2 id="browser-register-title">Register this browser?</h2>
            <p>
              Your student account can use only one web browser. Registering this browser
              will allow access here until an administrator resets it.
            </p>
            <div className="browser-register-note">
              Your mobile app registration is separate and will not be changed.
            </div>
            <div className="browser-register-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowBrowserRegistration(false)} disabled={loading}>
                No, back to login
              </button>
              <button type="button" className="btn" onClick={registerCurrentBrowser} disabled={loading}>
                {loading
                  ? <><Loader2 size={16} className="spin" /> Registering…</>
                  : <>Yes, register browser <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="auth-card" style={{
        width: '100%',
        maxWidth: 535,
        background: 'rgba(255,255,255,.97)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        padding: '3.25rem 3.25rem',
        boxShadow: 'var(--shadow-lg)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateY(10px)',
        transition: 'opacity .5s ease, transform .5s ease',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-teal)',
          }}>
            <GraduationCap size={27} color="#ffffff" />
          </div>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: '1.1rem',
            color: 'var(--text)', letterSpacing: '-0.01em',
          }}>
            LMS for College
          </span>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.75rem', fontWeight: 800,
            color: 'var(--text)', marginBottom: '0.5rem',
            letterSpacing: '-0.02em', lineHeight: 1.2,
          }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enter your credentials to access your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
            color: 'var(--danger)', padding: '0.8rem 1rem',
            borderRadius: 'var(--r-sm)', fontSize: '0.85rem', marginBottom: '1.5rem',
            animation: 'slideDown .3s ease',
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Index Number */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block', fontSize: '0.8rem', fontWeight: 600,
              color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '.03em',
              textTransform: 'uppercase'
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
                width: '100%', padding: '0.875rem 1rem',
                background: 'var(--bg-2)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-sm)', color: 'var(--text)',
                fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color .2s, box-shadow .2s',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--teal)';
                e.target.style.boxShadow = '0 0 0 3px var(--teal-glow-sm)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block', fontSize: '0.8rem', fontWeight: 600,
              color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '.03em',
              textTransform: 'uppercase'
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
                  width: '100%', padding: '0.875rem 3rem 0.875rem 1rem',
                  background: 'var(--bg-2)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r-sm)', color: 'var(--text)',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color .2s, box-shadow .2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--teal)';
                  e.target.style.boxShadow = '0 0 0 3px var(--teal-glow-sm)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--border)';
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
                  color: 'var(--text-muted)', cursor: 'pointer', padding: 0,
                  lineHeight: 1, display: 'flex', alignItems: 'center'
                }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.925rem',
              background: 'var(--grad-teal)',
              border: 'none', borderRadius: 'var(--r-sm)',
              color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: '0.975rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: 'var(--shadow-teal)',
              transition: 'all .2s',
              letterSpacing: '.01em',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 30px var(--teal-glow)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-teal)'; }}
          >
            {loading
              ? <><Loader2 size={17} className="spin" /> Signing in…</>
              : <>Sign In <ArrowRight size={17} /></>
            }
          </button>
        </form>

        <div className="auth-divider"><span>New to Science Toppers?</span></div>
        <button type="button" className="register-payment-button" onClick={() => setShowRegister(true)}>
          <CreditCard size={17} />
          Register
        </button>

        {/* Footer */}
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '2.5rem' }}>
          © {new Date().getFullYear()} LMS for College. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        .spin { animation: spin .8s linear infinite; display:inline-block; }
        input::placeholder { color: var(--text-dim); }
        .browser-register-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 1.25rem;
          background: rgba(15, 23, 42, .42);
          backdrop-filter: blur(12px);
        }
        .browser-register-modal {
          position: relative;
          width: min(100%, 500px);
          padding: 2.25rem;
          border: 1px solid rgba(148, 163, 184, .3);
          border-radius: 24px;
          background: rgba(255, 255, 255, .98);
          box-shadow: 0 30px 90px rgba(15, 23, 42, .24);
          text-align: center;
          animation: browserModalIn .22s ease-out;
        }
        .browser-register-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 42px;
          height: 42px;
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          background: #f8fafc;
          color: #64748b;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .browser-register-icon {
          width: 72px;
          height: 72px;
          margin: 0 auto 1.15rem;
          border-radius: 20px;
          display: grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(135deg, #60a5fa, #2563eb);
          box-shadow: 0 14px 32px rgba(37, 99, 235, .25);
        }
        .browser-register-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .4rem;
          margin-bottom: .6rem;
          color: #2563eb !important;
          font-size: .76rem !important;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .browser-register-modal h2 {
          margin: 0 0 .75rem;
          color: #172554;
          font: 800 1.65rem/1.2 "Space Grotesk", sans-serif;
        }
        .browser-register-modal > p {
          color: #64748b;
          font-size: .94rem;
          line-height: 1.65;
        }
        .browser-register-note {
          margin: 1.25rem 0;
          padding: .85rem 1rem;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          background: #eff6ff;
          color: #1e40af;
          font-size: .84rem;
          line-height: 1.5;
        }
        .browser-register-actions {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: .75rem;
        }
        .browser-register-actions .btn {
          min-height: 48px;
          justify-content: center;
        }
        @keyframes browserModalIn {
          from { opacity: 0; transform: translateY(10px) scale(.98); }
          to { opacity: 1; transform: none; }
        }
        @media (max-width: 560px) {
          .browser-register-modal { padding: 2rem 1.15rem 1.25rem; border-radius: 20px; }
          .browser-register-actions { grid-template-columns: 1fr; }
          .browser-register-actions .btn:last-child { order: -1; }
        }
      `}</style>
    </div>
  );
};

export default Login;
