import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

const ExpiredAccess = () => {
  return (
    <div className="info-page">
      <div style={{
        width: 96, height: 96,
        borderRadius: '50%',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        display: 'flex', alignItems:'center', justifyContent:'center',
        animation: 'iconFloat 3s ease-in-out infinite',
        boxShadow: '0 0 32px rgba(239,68,68,0.15)',
      }}>
        <Clock size={40} color="var(--danger)" />
      </div>

      <div style={{ textAlign:'center' }}>
        <h2 style={{ color:'var(--text)', fontSize:'2rem', marginBottom:'0.5rem' }}>Access Expired</h2>
        <p style={{ color:'var(--text-muted)', maxWidth:'440px', lineHeight:'1.7' }}>
          Your access to this content has expired. Please contact the admin to renew your subscription and regain access.
        </p>
      </div>

      <Link to="/" className="btn btn-ghost btn-sm" style={{ marginTop:'0.5rem' }}>
        <ArrowLeft size={14} /> Back to Home
      </Link>

      <style>{`@keyframes iconFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }`}</style>
    </div>
  );
};

export default ExpiredAccess;
