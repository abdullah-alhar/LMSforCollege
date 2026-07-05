import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, CreditCard, User, Lock } from 'lucide-react';
import client from '../api/client';
import { loadSubjectPayment } from '../api/paymentData';
import { applyAdminPaymentFallback, formatPaymentDisplayValue, getEssentialPaymentFields, hasEssentialPaymentFields } from '../utils/paymentFormat';

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
        const directSubject = hasEssentialPaymentFields(res.data) ? res.data : await loadSubjectPayment(subjectId);
        const adminRes = await client.get('/payment-info/admin').catch(() => ({ data: {} }));
        const admin = hasEssentialPaymentFields(adminRes.data) ? adminRes.data : await loadSubjectPayment('admin');
        setInfo(applyAdminPaymentFallback(directSubject, admin));
      } catch {
        try {
          const directSubject = await loadSubjectPayment(subjectId);
          const admin = await loadSubjectPayment('admin');
          setInfo(applyAdminPaymentFallback(directSubject, admin));
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
  const paymentGroups = getEssentialPaymentFields(info || {});

  return (
    <div className="info-page">
      {/* Animated lock icon */}
      <div style={{
        width: 96, height: 96,
        borderRadius: '50%',
        background: 'rgba(96,165,250,0.12)',
        border: '1px solid rgba(59,130,246,0.25)',
        display: 'flex', alignItems:'center', justifyContent:'center',
        animation: 'iconFloat 3s ease-in-out infinite',
        boxShadow: '0 12px 32px rgba(59,130,246,0.14)',
      }}>
        <Lock size={40} color="var(--color-primary)" />
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
        <div className="locked-payment-sheet anim-in">
          <div className="payment-sheet-title">Payment & Contact</div>
          {paymentGroups.contact.length > 0 && (
            <section className="essential-payment-block">
              <h3><Phone size={17} /> Contact Details</h3>
              <div className="essential-payment-values">
                {paymentGroups.contact.map((row, index) => <div className="payment-detail-value" key={`${row.path}-${index}`}>{formatPaymentDisplayValue(row.value)}</div>)}
              </div>
            </section>
          )}
          {paymentGroups.payment.length > 0 && (
            <section className="essential-payment-block">
              <h3><CreditCard size={17} /> Payment Details</h3>
              <div className="essential-payment-values">
                {paymentGroups.payment.map((row, index) => <div className="payment-detail-value" key={`${row.path}-${index}`}>{formatPaymentDisplayValue(row.value)}</div>)}
              </div>
            </section>
          )}

          {!hasEssentialPaymentFields(info) && (
            <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', padding:'0.5rem 0' }}>
              Payment details not configured. Please contact the admin directly.
            </p>
          )}
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
