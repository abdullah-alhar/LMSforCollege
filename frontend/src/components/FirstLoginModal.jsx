import React, { useState } from 'react';
import {
  GraduationCap, User, Building2, BookOpen, Phone,
  CheckCircle2, Loader2, AlertCircle, ChevronRight,
} from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const FirstLoginModal = () => {
  const { user, markProfileComplete } = useAuth();
  const [form, setForm] = useState({
    name:   user?.username || '',
    school: '',
    year:   '',
    stream: '',
    phone:  '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [step, setStep]       = useState(1); // 1 = intro, 2 = form

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim())   { setError('Please enter your full name.'); return; }
    if (!form.school.trim()) { setError('Please enter your school/institution name.'); return; }
    if (!form.year.trim())   { setError('Please select your year / grade.'); return; }

    setLoading(true);
    try {
      await client.put('/auth/profile', form);
      markProfileComplete();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(7,11,18,0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}>
        <div style={{
          background: 'var(--bg-card, #0f1623)',
          border: '1px solid rgba(0,212,216,0.2)',
          borderRadius: 20,
          padding: '2.5rem 2rem',
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 0 80px rgba(0,212,216,0.1), 0 24px 80px rgba(0,0,0,0.6)',
          animation: 'modalIn 0.35s cubic-bezier(0.22,1,0.36,1)',
        }}>

          {step === 1 ? (
            /* ── Intro Step ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: 18,
                background: 'linear-gradient(135deg, #00d4d8, #0099a8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 0 30px rgba(0,212,216,0.35)',
              }}>
                <GraduationCap size={36} color="#070b12" />
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text, #fff)' }}>
                Welcome to LMS for College!
              </h2>
              <p style={{ color: 'var(--text-muted, rgba(255,255,255,0.5))', lineHeight: 1.6, marginBottom: '2rem', fontSize: '0.9rem' }}>
                Before you get started, we need a few details to personalise your experience. This will only take a minute.
              </p>

              <button
                className="btn"
                style={{ width: '100%', gap: '0.5rem', fontSize: '1rem', padding: '0.85rem' }}
                onClick={() => setStep(2)}
              >
                Complete My Profile <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            /* ── Form Step ── */
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: 'linear-gradient(135deg, #00d4d8, #0099a8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 20px rgba(0,212,216,0.3)',
                }}>
                  <GraduationCap size={22} color="#070b12" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text, #fff)' }}>
                    Complete Your Profile
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted, rgba(255,255,255,0.45))' }}>
                    Required for first login
                  </p>
                </div>
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                  color: '#fca5a5', padding: '0.75rem 1rem',
                  borderRadius: 10, marginBottom: '1.25rem', fontSize: '0.85rem',
                }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={13} /> Full Name <span style={{ color: 'var(--orange, #f97316)' }}>*</span>
                  </label>
                  <input
                    name="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* School */}
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building2 size={13} /> School / Institution <span style={{ color: 'var(--orange, #f97316)' }}>*</span>
                  </label>
                  <input
                    name="school"
                    placeholder="e.g. Colombo National School"
                    value={form.school}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Year & Stream in a row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <BookOpen size={13} /> Year / Grade <span style={{ color: 'var(--orange, #f97316)' }}>*</span>
                    </label>
                    <select name="year" value={form.year} onChange={handleChange} required>
                      <option value="">Select…</option>
                      <option value="Grade 12">Grade 12</option>
                      <option value="Grade 13">Grade 13</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <BookOpen size={13} /> Stream <span style={{ color: 'var(--orange, #f97316)' }}>*</span>
                    </label>
                    <select name="stream" value={form.stream} onChange={handleChange} required>
                      <option value="">Select…</option>
                      <option value="Bio Science">Bio Science</option>
                      <option value="Physical Science">Physical Science</option>
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div className="input-group" style={{ marginBottom: '1.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={13} /> Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="e.g. 077 123 4567"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className="btn"
                  disabled={loading}
                  style={{ width: '100%', fontSize: '0.95rem', padding: '0.85rem' }}
                >
                  {loading
                    ? <><Loader2 size={16} className="first-login-spin" /> Saving…</>
                    : <><CheckCircle2 size={16} /> Save &amp; Continue</>
                  }
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes firstLoginSpin { to { transform: rotate(360deg); } }
        .first-login-spin { animation: firstLoginSpin 0.8s linear infinite; display: inline-block; }
      `}</style>
    </>
  );
};

export default FirstLoginModal;
