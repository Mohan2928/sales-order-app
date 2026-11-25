import { getToken, logout } from './auth.js';

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, {
    headers,
    ...options,
  });
  if (res.status === 401) {
    logout();
    const err = new Error('Session expired. Please sign in again.');
    throw err;
  }
  if (!res.ok) {
    let body = {};
    try { body = await res.json(); } catch { /* no body */ }
    const err = new Error(body.message || `Request failed (${res.status})`);
    err.fields = body.fields || {};
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

const qs = (params) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== '' && v != null) p.set(k, v); });
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const api = {
  login: async (username, password) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      });
      if (!res.ok) {
        let body = {};
        try { body = await res.json(); } catch { /* no body */ }
        throw new Error(body.message || `Login failed (${res.status})`);
      }
      return res.json();
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Login timed out. The server did not respond. Please try again.');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  },
  logout: () => request('/auth/logout', { method: 'POST' }),
  forgotPassword: (username) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ username }) }),
  resetPassword: (token, newPassword) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),
  lookups: () => request('/masters/lookups'),
  buyers: () => request('/masters/buyers'),
  qualities: () => request('/masters/qualities'),
  vendors: () => request('/masters/vendors'),
  companyName: () => request('/masters/company'),
  listOrders: (filters = {}) => request(`/sales-orders${qs(filters)}`),
  listOrdersPaged: (filters = {}) => request(`/sales-orders${qs(filters)}`),
  listOrdersAll: (filters = {}) => request(`/sales-orders/all${qs(filters)}`),
  getOrder: (id) => request(`/sales-orders/${id}`),
  createOrder: (body) => request('/sales-orders', { method: 'POST', body: JSON.stringify(body) }),
  updateOrder: (id, body) => request(`/sales-orders/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  changeStatus: (id, value) => request(`/sales-orders/${id}/status?value=${value}`, { method: 'PUT' }),
  createDispatch: (orderId, body) => request(`/sales-orders/${orderId}/dispatches`, { method: 'POST', body: JSON.stringify(body) }),
  listDispatches: (orderId) => request(`/sales-orders/${orderId}/dispatches`),
  listPurchaseOrders: (params = {}) => request(`/purchase-orders${qs(params)}`),
  listPurchaseOrdersReport: (params = {}) => request(`/purchase-orders/report${qs(params)}`),
  listPurchaseOrdersReportAll: (params = {}) => request(`/purchase-orders/report/all${qs(params)}`),
  purchaseOrderFilters: () => request('/purchase-orders/filters'),
  getPurchaseOrder: (id) => request(`/purchase-orders/${id}`),
  createPurchaseOrder: (body) => request('/purchase-orders', { method: 'POST', body: JSON.stringify(body) }),
  updatePurchaseOrder: (id, body) => request(`/purchase-orders/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  changePurchaseOrderStatus: (id, value) => request(`/purchase-orders/${id}/status?value=${value}`, { method: 'PUT' }),
};

export const STATUS_LABEL = {
  PENDING: 'Pending',
  MOVED_TO_PRODUCTION: 'In Progress',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled',
};

export const PO_STATUS_LABEL = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  HOLD: 'On Hold',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled',
};

export const fmt = (n, digits = 2) =>
  n == null ? '' : Number(n).toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtDate = (iso) => (iso ? iso.split('-').reverse().join('/') : '');

export const fmtQtyByUom = (lines, type = 'quantity', showSingleUnit = true) => {
  const map = new Map();
  for (const l of (lines || [])) {
    const uom = l.uom || '';
    const qty = Number(l.quantity) || 0;
    const disp = Number(l.dispatchQty) || 0;
    const val = type === 'dispatch' ? disp : type === 'balance' ? (qty - disp) : qty;
    map.set(uom, (map.get(uom) || 0) + val);
  }
  let entries = [...map.entries()];
  if (type === 'dispatch') {
    entries = entries.filter(([, v]) => v > 0);
    if (entries.length === 0) return fmt(0, 3);
    return entries.map(([uom, v]) => `${fmt(v, 3)}${uom ? ' ' + uom : ''}`).join(' + ');
  }
  return entries.map(([uom, v]) => {
    const showUnit = entries.length > 1 || (showSingleUnit && uom);
    return `${fmt(v, 3)}${showUnit && uom ? ' ' + uom : ''}`;
  }).join(' + ');
};

export const fmtQtyList = (lines, type = 'quantity') => {
  const map = new Map();
  for (const l of (lines || [])) {
    const uom = l.uom || '';
    const qty = Number(l.quantity) || 0;
    const disp = Number(l.dispatchQty) || 0;
    const val = type === 'dispatch' ? disp : type === 'balance' ? (qty - disp) : qty;
    map.set(uom, (map.get(uom) || 0) + val);
  }
  let entries = [...map.entries()];
  if (type === 'dispatch') {
    entries = entries.filter(([, v]) => v > 0);
    if (entries.length === 0) return fmt(0, 2);
    return entries.map(([uom, v]) => `${fmt(v, 2)}${uom ? '-' + uom : ''}`).join(' + ');
  }
  return entries.map(([uom, v]) => `${fmt(v, 2)}${uom ? '-' + uom : ''}`).join(' + ');
};
