import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { User, Key, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const ProfileSettings = () => {
  const { user } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    setLoading(true);
    
    try {
      await client.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header anim-in" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <User size={24} color="var(--teal)" /> Profile Settings
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your account settings and change your password.
        </p>
      </div>

      <div className="card anim-in anim-in-1" style={{ maxWidth: '500px' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Key size={18} color="var(--orange)" /> Change Password
        </h3>
        
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--r-sm)', marginBottom: '1.25rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        
        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--r-sm)', marginBottom: '1.25rem' }}>
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="input-group">
            <label>Current Password</label>
            <input 
              type="password" 
              placeholder="Enter current password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label>New Password</label>
            <input 
              type="password" 
              placeholder="Enter new password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label>Confirm New Password</label>
            <input 
              type="password" 
              placeholder="Confirm new password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
            {loading ? <><Loader2 size={16} className="spin" /> Updating...</> : 'Update Password'}
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
