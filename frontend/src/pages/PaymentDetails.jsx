import React, { useEffect, useState } from 'react';
import { CreditCard, Loader2, Phone, Save } from 'lucide-react';
import client from '../api/client';
import { loadAllPayments, loadSubjectPayment } from '../api/paymentData';
import { applyAdminPaymentFallback, formatPaymentDisplayValue, getEssentialPaymentFields, paymentSubjectLabel } from '../utils/paymentFormat';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = ['admin', 'bio', 'phy', 'chem', 'math'];

const PaymentCard = ({ id, value }) => {
  const groups = getEssentialPaymentFields(value || {});
  return (
    <article className="payment-page-card">
      <h2>{paymentSubjectLabel(id)}</h2>
      {groups.contact.length > 0 && (
        <section className="essential-payment-block">
          <h3><Phone size={17} /> Contact Details</h3>
          <div className="essential-payment-values">
            {groups.contact.map((row, index) => <div className="payment-detail-value" key={`${row.path}-${index}`}>{formatPaymentDisplayValue(row.value)}</div>)}
          </div>
        </section>
      )}
      {groups.payment.length > 0 && (
        <section className="essential-payment-block">
          <h3><CreditCard size={17} /> Payment Details</h3>
          <div className="essential-payment-values">
            {groups.payment.map((row, index) => <div className="payment-detail-value" key={`${row.path}-${index}`}>{formatPaymentDisplayValue(row.value)}</div>)}
          </div>
        </section>
      )}
      {!groups.contact.length && !groups.payment.length && <p className="empty-payment-note">No details added yet.</p>}
    </article>
  );
};

const PaymentEditor = ({ payments, onSaved }) => {
  const [subject, setSubject] = useState('admin');
  const [contact, setContact] = useState('');
  const [bank, setBank] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const groups = getEssentialPaymentFields(payments?.[subject] || {});
    setContact(groups.contact.map(row => row.value).join('\n'));
    setBank(groups.payment.map(row => formatPaymentDisplayValue(row.value)).join('\n\n'));
    setMessage('');
  }, [subject, payments]);

  const save = async event => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await client.put(`/payment-info/${subject}`, { contactDetails: contact.trim(), bankDetails: bank.trim() });
      setMessage('Payment details saved.');
      onSaved(subject, { contactDetails: contact.trim(), bankDetails: bank.trim() });
    } catch (error) {
      setMessage(error.response?.data?.error || 'Could not save payment details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="payment-editor card" onSubmit={save}>
      <div className="page-header"><h2>Edit Payment Details</h2><p>Add or update the contact and bank information students will see.</p></div>
      <div className="input-group">
        <label>Subject</label>
        <select value={subject} onChange={event => setSubject(event.target.value)}>
          {SUBJECTS.map(id => <option key={id} value={id}>{paymentSubjectLabel(id)}</option>)}
        </select>
      </div>
      <div className="input-group">
        <label>Contact details</label>
        <textarea rows="4" value={contact} onChange={event => setContact(event.target.value)} placeholder="Name, phone number or email" />
      </div>
      <div className="input-group">
        <label>Bank details</label>
        <textarea rows="12" value={bank} onChange={event => setBank(event.target.value)} placeholder={'Account number (Bank)\\nAccount holder\\nBranch'} />
      </div>
      {message && <div className="form-alert">{message}</div>}
      <button className="btn" disabled={saving}>{saving ? <><Loader2 className="spin" size={17} /> Saving…</> : <><Save size={17} /> Save details</>}</button>
    </form>
  );
};

const PaymentDetails = ({ adminMode = false }) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState(null);

  useEffect(() => {
    const load = async () => {
      const api = await client.get('/payment-info/all').catch(() => ({ data: {} }));
      let values = api.data && Object.keys(api.data).length ? api.data : await loadAllPayments().catch(() => ({}));
      for (const id of SUBJECTS) {
        if (!values[id]) {
          const subject = await loadSubjectPayment(id).catch(() => ({}));
          if (Object.keys(subject).length) values = { ...values, [id]: subject };
        }
      }
      setPayments(values);
    };
    load();
  }, []);

  if (!payments) return <div className="state-box"><Loader2 className="spin" /> Loading payment details…</div>;
  const canEdit = adminMode && user?.role === 'ADMIN';

  return (
    <div className="payment-details-page">
      <div className="page-header"><h1>Payment & Contact Details</h1><p>{canEdit ? 'Manage the information shown during registration and on locked content.' : 'Choose the relevant subject to view payment information.'}</p></div>
      {canEdit && <PaymentEditor payments={payments} onSaved={(id, value) => setPayments(current => ({ ...current, [id]: value }))} />}
      <div className="payment-page-grid">
        {SUBJECTS.map(id => <PaymentCard key={id} id={id} value={id === 'admin' ? payments[id] : applyAdminPaymentFallback(payments[id], payments.admin)} />)}
      </div>
    </div>
  );
};

export default PaymentDetails;
