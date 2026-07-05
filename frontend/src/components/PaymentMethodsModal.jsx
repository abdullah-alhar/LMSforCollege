import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, CreditCard, Loader2, Phone, X } from 'lucide-react';
import client from '../api/client';
import { loadAllPayments, loadSubjectPayment } from '../api/paymentData';
import { applyAdminPaymentFallback, formatPaymentDisplayValue, getEssentialPaymentFields, hasEssentialPaymentFields, paymentSubjectLabel } from '../utils/paymentFormat';

const ORDER = ['admin', 'bio', 'phy', 'chem', 'math'];

const DetailsBlock = ({ title, rows, icon }) => {
  if (!rows.length) return null;
  return (
    <section className="essential-payment-block">
      <h3>{icon}{title}</h3>
      <div className="essential-payment-values">
        {rows.map((row, index) => (
          <div className="payment-detail-value" key={`${row.path}-${index}`}>
            {formatPaymentDisplayValue(row.value)}
          </div>
        ))}
      </div>
    </section>
  );
};

const PaymentMethodsModal = ({ onClose, subjectId = 'admin' }) => {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(subjectId === 'all' ? null : subjectId);
  const [error, setError] = useState('');
  const [loadingSubject, setLoadingSubject] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (subjectId === 'all') {
          const api = await client.get('/payment-info/all').catch(() => ({ data: {} }));
          const payments = api.data && Object.keys(api.data).length ? api.data : await loadAllPayments();
          setData(payments || {});
        } else {
          const api = await client.get(`/payment-info/${subjectId}`).catch(() => ({ data: {} }));
          const payment = hasEssentialPaymentFields(api.data) ? api.data : await loadSubjectPayment(subjectId);
          const admin = subjectId === 'admin' ? payment : await loadSubjectPayment('admin').catch(() => ({}));
          setData({ [subjectId]: applyAdminPaymentFallback(payment, admin) });
        }
      } catch {
        try {
          setData(subjectId === 'all'
            ? await loadAllPayments()
            : { [subjectId]: await loadSubjectPayment(subjectId) });
        } catch {
          setError('Payment information is temporarily unavailable.');
        }
      }
    };
    load();
  }, [subjectId]);

  const subjects = useMemo(() => {
    if (!data) return [];
    const available = Object.keys(data)
      .filter(key => data[key] && typeof data[key] === 'object')
      .sort((a, b) => (ORDER.indexOf(a) < 0 ? 99 : ORDER.indexOf(a)) - (ORDER.indexOf(b) < 0 ? 99 : ORDER.indexOf(b)));
    return available.length ? available : ORDER;
  }, [data]);

  const details = selected ? getEssentialPaymentFields(data?.[selected] || {}) : { contact: [], payment: [] };

  const selectSubject = async id => {
    setSelected(id);
    const existing = getEssentialPaymentFields(data?.[id] || {});
    if (existing.contact.length && existing.payment.length) return;
    setLoadingSubject(true);
    try {
      const payment = data?.[id] || await loadSubjectPayment(id);
      const admin = id === 'admin' ? payment : (data?.admin || await loadSubjectPayment('admin').catch(() => ({})));
      setData(current => ({ ...(current || {}), [id]: applyAdminPaymentFallback(payment, admin) }));
    } finally {
      setLoadingSubject(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="payment-sheet" onClick={event => event.stopPropagation()}>
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>

        {!data && !error ? (
          <div className="modal-loading"><Loader2 className="spin" size={20} /> Loading payment details…</div>
        ) : error ? (
          <div className="form-alert error">{error}</div>
        ) : !selected ? (
          <>
            <div className="payment-sheet-title">Select Your Subject</div>
            <div className="payment-subject-list">
              {subjects.map(id => (
                <button key={id} onClick={() => selectSubject(id)}>
                  <span><CreditCard size={17} />{paymentSubjectLabel(id)}</span>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {subjectId === 'all' && (
              <button className="payment-back-button" onClick={() => setSelected(null)}>
                <ArrowLeft size={17} /> Subjects
              </button>
            )}
            <div className="payment-sheet-title">Payment & Contact</div>
            <p className="payment-subject-name">{paymentSubjectLabel(selected)}</p>
            {loadingSubject ? (
              <div className="modal-loading"><Loader2 className="spin" size={20} /> Loading payment details…</div>
            ) : <>
              <DetailsBlock title="Contact Details" rows={details.contact} icon={<Phone size={17} />} />
              <DetailsBlock title="Payment Details" rows={details.payment} icon={<CreditCard size={17} />} />
            </>}
            {!loadingSubject && !details.contact.length && !details.payment.length && (
              <div className="form-alert error">Payment details are not configured for this subject.</div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default PaymentMethodsModal;
