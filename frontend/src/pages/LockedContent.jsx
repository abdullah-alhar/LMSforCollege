import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, CreditCard, User, Lock } from 'lucide-react';
import client from '../api/client';

const SUBJECT_LABELS = {
  bio:  'Biology',
  phy:  'Physics',
  chem: 'Chemistry',
  math: 'Mathematics',
};

/* Orbital loader (inline mini version) */
const MiniLoader = () => (
  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', color:'var(--text-muted)', margin:'1.5rem 0' }}>
    <div style={{ position:'relative', width:28, height:28 }}>
      <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid transparent', borderTopColor:'var(--teal)', animation:'spin 1s linear infinite' }} />
      <div style={{ position:'absolute', inset:6, borderRadius:'50%', border:'1.5px solid transparent', borderRightColor:'var(--orange)', animation:'spin 1.4s linear infinite reverse' }} />
    </div>
    <span style={{ fontSize:'0.875rem', fontWeight:500 }}>Loading payment details…</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const LockedContent = () => {
  const { subjectId } = useParams();
  const [info, setInfo]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await client.get(`/payment-info/${subjectId}`);
        setInfo(res.data);
        if (!res.data.adminName && !res.data.contactNumber && !res.data.bankDetails) {
          const adminRes = await client.get('/payment-info/admin');
          setInfo(adminRes.data);
        }
      } catch {
        try {
          const adminRes = await client.get('/payment-info/admin');
          setInfo(adminRes.data);
        } catch {
          setInfo({});
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [subjectId]);

  const subjectLabel = SUBJECT_LABELS[subjectId?.toLowerCase()] || subjectId?.toUpperCase();

  return (
    <div className="info-page">
      {/* Animated lock icon */}
      <div style={{
        width: 96, height: 96,
        borderRadius: '50%',
        background: 'rgba(255,107,53,0.1)',
        border: '1px solid rgba(255,107,53,0.3)',
        display: 'flex', alignItems:'center', justifyContent:'center',
        animation: 'iconFloat 3s ease-in-out infinite',
        boxShadow: '0 0 32px rgba(255,107,53,0.15)',
      }}>
        <Lock size={40} color="var(--orange)" />
      </div>

      <div style={{ textAlign:'center' }}>
        <h2 style={{ color:'var(--text)', fontSize:'2rem', marginBottom:'0.5rem' }}>Content Locked</h2>
        <p style={{ color:'var(--text-muted)', maxWidth:'460px', lineHeight:'1.7' }}>
          This is premium content for <strong style={{ color:'var(--teal)' }}>{subjectLabel}</strong>.
          Complete the payment and contact the admin to unlock instant access.
        </p>
      </div>

      {loading ? (
        <MiniLoader />
      ) : (
        <div className="payment-card anim-in">
          <h3 style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <CreditCard size={18} color="var(--teal)" />
            Payment & Contact Details
          </h3>

          {info?.adminName && (
            <div className="payment-row">
              <span className="label"><User size={12} style={{ verticalAlign:'middle', marginRight:4 }} />Admin Name</span>
              <span className="value">{info.adminName}</span>
            </div>
          )}
          {info?.contactNumber && (
            <div className="payment-row">
              <span className="label"><Phone size={12} style={{ verticalAlign:'middle', marginRight:4 }} />Contact</span>
              <span className="value">
                <a href={`tel:${info.contactNumber}`} style={{ color:'var(--teal)' }}>{info.contactNumber}</a>
              </span>
            </div>
          )}
          {info?.bankDetails && (
            <div className="payment-row">
              <span className="label"><CreditCard size={12} style={{ verticalAlign:'middle', marginRight:4 }} />Bank Details</span>
              <span className="value" style={{ whiteSpace:'pre-line' }}>{info.bankDetails}</span>
            </div>
          )}

          {!info?.adminName && !info?.contactNumber && !info?.bankDetails && (
            <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', padding:'0.5rem 0' }}>
              Payment details not configured. Please contact the admin directly.
            </p>
          )}

          <div style={{
            marginTop:'1.25rem',
            padding:'0.875rem',
            background:'rgba(0,212,216,0.06)',
            border:'1px solid rgba(0,212,216,0.15)',
            borderRadius:'var(--r-sm)',
            fontSize:'0.82rem',
            color:'var(--text-muted)',
            lineHeight:'1.6',
          }}>
            💡 After payment, send proof to the admin. Access will be granted within minutes.
          </div>
        </div>
      )}

      <Link to="/" className="btn btn-ghost btn-sm" style={{ marginTop:'0.5rem' }}>
        <ArrowLeft size={14} /> Back to Home
      </Link>

      <style>{`
        @keyframes iconFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
      `}</style>
    </div>
  );
};

export default LockedContent;
