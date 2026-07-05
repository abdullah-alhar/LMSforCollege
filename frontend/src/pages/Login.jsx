import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Loader2, ArrowRight, GraduationCap, CreditCard } from 'lucide-react';
import PaymentMethodsModal from '../components/PaymentMethodsModal';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [showRegister, setShowRegister] = useState(false);
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
      const ok = await login(username.trim(), password);
      if (ok) navigate('/');
      else setError('Incorrect index number or password.');
    } catch { setError('Connection error. Please try again.'); }
    finally { setLoading(false); }
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
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        .spin { animation: spin .8s linear infinite; display:inline-block; }
        input::placeholder { color: var(--text-dim); }
      `}</style>
    </div>
  );
};

export default Login;
