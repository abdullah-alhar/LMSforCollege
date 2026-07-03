import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  User, Key, CheckCircle2, Loader2, AlertCircle,
  Building2, BookOpen, Phone, GraduationCap, Edit3,
} from 'lucide-react';

const ProfileSettings = () => {
  const { user } = useAuth();
  const isStudent = user?.role !== 'ADMIN';

  // ── Profile details state ────────────────────────────────────────────
  const [profile, setProfile] = useState({
    name:   '',
    school: '',
    year:   '',
    stream: '',
    phone:  '',
  });
  const [profileLoading, setProfileLoading] = useState(isStudent);
  const [profileSaving,  setProfileSaving]  = useState(false);
  const [profileError,   setProfileError]   = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // ── Password change state ────────────────────────────────────────────
  const [currentPassword,  setCurrentPassword]  = useState('');
  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [passLoading,      setPassLoading]      = useState(false);
  const [passError,        setPassError]        = useState('');
  const [passSuccess,      setPassSuccess]      = useState('');

  // Load profile on mount (students only)
  useEffect(() => {
    if (!isStudent) return;
    client.get('/auth/profile')
      .then(res => {
        const d = res.data || {};
        setProfile({
          name:   d.name   || user?.username || '',
          school: d.school || '',
          year:   d.year   || '',
          stream: d.stream || '',
          phone:  d.phone  || '',
        });
      })
      .catch(() => {
        setProfile(prev => ({ ...prev, name: user?.username || '' }));
      })
      .finally(() => setProfileLoading(false));
  }, [isStudent, user?.username]);

  const handleProfileChange = e => setProfile(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError(''); setProfileSuccess('');
    if (!profile.name.trim())   { setProfileError('Full name is required.'); return; }
    if (!profile.school.trim()) { setProfileError('School/Institution is required.'); return; }
    if (!profile.year.trim())   { setProfileError('Year/Grade is required.'); return; }
    setProfileSaving(true);
    try {
      await client.put('/auth/profile', profile);
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError(''); setPassSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError('All fields are required.'); return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.'); return;
    }
    setPassLoading(true);
    try {
      await client.put('/auth/change-password', { currentPassword, newPassword });
      setPassSuccess('Password changed successfully.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setPassError(err.response?.data?.error || 'Failed to change password. Please check your current password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header anim-in" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <User size={24} color="var(--teal)" /> Profile Settings
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your account information and security settings.
        </p>
      </div>

      {/* ── Profile Details Card (students only) ── */}
      {isStudent && (
        <div className="card anim-in anim-in-1" style={{ maxWidth: '560px', marginBottom: '1.5rem' }}>
          <h3 style={{
            marginBottom: '1.5rem', color: 'var(--text)',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <Edit3 size={18} color="var(--teal)" /> Personal Information
          </h3>

          {profileLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Loader2 size={24} className="spin" color="var(--teal)" />
            </div>
          ) : (
            <>
              {profileError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--r-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <AlertCircle size={15} /> {profileError}
                </div>
              )}
              {profileSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={15} /> {profileSuccess}
                </div>
              )}

              <form onSubmit={handleProfileSave}>
                {/* Full Name */}
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={13} /> Full Name <span style={{ color: 'var(--orange)' }}>*</span>
                  </label>
                  <input
                    name="name"
                    placeholder="Your full name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                {/* School */}
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building2 size={13} /> School / Institution <span style={{ color: 'var(--orange)' }}>*</span>
                  </label>
                  <input
                    name="school"
                    placeholder="e.g. Colombo National School"
                    value={profile.school}
                    onChange={handleProfileChange}
                  />
                </div>

                {/* Year + Stream side-by-side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <GraduationCap size={13} /> Year / Grade <span style={{ color: 'var(--orange)' }}>*</span>
                    </label>
                    <select name="year" value={profile.year} onChange={handleProfileChange}>
                      <option value="">Select…</option>
                      <option value="Grade 12">Grade 12</option>
                      <option value="Grade 13">Grade 13</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <BookOpen size={13} /> Stream <span style={{ color: 'var(--orange)' }}>*</span>
                    </label>
                    <select name="stream" value={profile.stream} onChange={handleProfileChange}>
                      <option value="">Select…</option>
                      <option value="Bio Science">Bio Science</option>
                      <option value="Physical Science">Physical Science</option>
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={13} /> Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="e.g. 077 123 4567"
                    value={profile.phone}
                    onChange={handleProfileChange}
                  />
                </div>

                <button type="submit" className="btn" disabled={profileSaving} style={{ width: '100%' }}>
                  {profileSaving
                    ? <><Loader2 size={16} className="spin" /> Saving…</>
                    : <><CheckCircle2 size={16} /> Save Profile</>
                  }
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* ── Change Password Card ── */}
      <div className="card anim-in anim-in-2" style={{ maxWidth: '560px' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Key size={18} color="var(--orange)" /> Change Password
        </h3>

        {passError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--r-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            <AlertCircle size={15} /> {passError}
          </div>
        )}
        {passSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            <CheckCircle2 size={15} /> {passSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="input-group">
            <label>Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn" disabled={passLoading} style={{ width: '100%' }}>
            {passLoading ? <><Loader2 size={16} className="spin" /> Updating...</> : 'Update Password'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>
    </div>
  );
};

export default ProfileSettings;
