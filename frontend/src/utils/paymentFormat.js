const cleanLabel = value => String(value)
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/[_-]+/g, ' ')
  .replace(/\b\w/g, char => char.toUpperCase());

const ignored = /(^| )(created|created at|date|id|key|timestamp|updated|updated at|subject id|title|type|image|photo|logo)( |$)/i;
const contactPattern = /(contact|phone|mobile|whatsapp|email|e mail|gmail|admin name|teacher name|^name$)/i;
const paymentPattern = /(payment|bank|account|branch|holder|beneficiary|amount|fee|price|commercial|\bhnb\b|\bboc\b|amana)/i;
const emailValuePattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const phoneValuePattern = /^\+?[\d][\d\s()+-]{6,}$/;

export const flattenPaymentFields = (value, path = []) => Object.entries(value || {}).flatMap(([key, item]) => {
  const nextPath = [...path, cleanLabel(key)];
  if (item === null || item === undefined || ignored.test(cleanLabel(key))) return [];
  if (['string', 'number'].includes(typeof item) && String(item).trim()) {
    const cleanedValue = String(item)
      .split('\n')
      .filter(line => line.trim().toLowerCase() !== 'test')
      .join('\n')
      .trim();
    return cleanedValue ? [{ path: nextPath.join(' · '), key: cleanLabel(key), value: cleanedValue }] : [];
  }
  return typeof item === 'object' ? flattenPaymentFields(item, nextPath) : [];
});

export const getEssentialPaymentFields = value => {
  const contact = [];
  const payment = [];
  flattenPaymentFields(value).forEach(field => {
    const searchable = `${field.path} ${field.value}`;
    if (paymentPattern.test(searchable)) payment.push(field);
    else if (contactPattern.test(field.path)) contact.push(field);
    // Payment records in the legacy database use several unnamed/custom keys.
    // Only standalone phone numbers and email addresses are contacts. Bank
    // lines often contain long account numbers, so they are checked first.
    else if (emailValuePattern.test(field.value) || phoneValuePattern.test(field.value)) contact.push(field);
    else payment.push(field);
  });
  return { contact, payment };
};

export const hasEssentialPaymentFields = value => {
  const groups = getEssentialPaymentFields(value);
  return groups.contact.length + groups.payment.length > 0;
};

export const formatPaymentDisplayValue = rawValue => {
  const value = String(rawValue || '')
    .split('\n')
    .filter(line => line.trim().toLowerCase() !== 'test')
    .join('\n')
    .trim();
  if (!value || value.includes('\n')) return value;

  let match = value.match(/^8112003486\s+Weligama branch\s+S\.?M\.?Faizer$/i);
  if (match) return '8112003486 (Commercial Bank)\nS.M.Faizer\nWeligama branch';

  match = value.match(/^250020140392\s+\(?HNB\)?\s+S\.?M\.?Faizer\s+Aluthgama Branch$/i);
  if (match) return '250020140392 (HNB)\nS.M.Faizer\nAluthgama Branch';

  match = value.match(/^Faizer\s+Amana Bank\s+Galle branch\s+0110233283001$/i);
  if (match) return 'Faizer\nAmana Bank\nGalle branch\n0110233283001';

  match = value.match(/^BOC\s+S\.?M\.?Faizer\s+87183233\s+Weligama branch$/i);
  if (match) return 'BOC\nS.M.Faizer\n87183233\nWeligama branch';

  match = value.match(/^(?:Account:\s*)?(?:Name:\s*)?RIFAN M I Z\s+(?:Acc\.?\s*No:?\s*)?8112015558\s+(?:Bank:\s*)?Commercial Bank\s+(?:Branch:\s*)?WELIGAMA Branch$/i);
  if (match) return 'Account:\nName: RIFAN M I Z\nAcc. No: 8112015558\nBank: Commercial Bank\nBranch: WELIGAMA Branch';

  return value;
};

export const applyAdminPaymentFallback = (subjectValue, adminValue) => {
  const subject = subjectValue || {};
  const adminGroups = getEssentialPaymentFields(adminValue || {});
  const subjectGroups = getEssentialPaymentFields(subject);
  if (subjectGroups.contact.length && subjectGroups.payment.length) return subject;
  return {
    ...subject,
    ...(!subjectGroups.contact.length && adminGroups.contact.length
      ? { fallbackContactDetails: adminGroups.contact.map(row => row.value) }
      : {}),
    ...(!subjectGroups.payment.length && adminGroups.payment.length
      ? { fallbackPaymentDetails: adminGroups.payment.map(row => row.value) }
      : {}),
  };
};

export const paymentSubjectLabel = id => ({
  admin: 'Admin',
  bio: 'Biology',
  phy: 'Physics',
  chem: 'Chemistry',
  math: 'Combined Maths',
}[String(id).toLowerCase()] || cleanLabel(id));
