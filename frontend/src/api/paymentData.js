import axios from 'axios';

const PAYMENT_ROOT = 'https://altoppers-default-rtdb.firebaseio.com/new/main/payments';

export const loadAllPayments = async () => {
  const response = await axios.get(`${PAYMENT_ROOT}.json`);
  return response.data || {};
};

export const loadSubjectPayment = async subjectId => {
  const response = await axios.get(`${PAYMENT_ROOT}/${encodeURIComponent(subjectId)}.json`);
  return response.data || {};
};
