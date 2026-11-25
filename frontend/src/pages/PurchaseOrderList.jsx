import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmt, fmtDate, PO_STATUS_LABEL } from '../api.js';

const PAGE_SIZE = 10;

// Small orange edit icon
const EditIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
  </svg>
);

const ApproveIcon = () => (<svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>);
const CompleteIcon = () => (<svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>);
const RejectIcon = () => (<svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>);
const HoldIcon = () => (<svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><rect x="14" y="4" width="4" height="16" rx="1" /><rect x="6" y="4" width="4" height="16" rx="1" /></svg>);
const CancelIcon = () => (<svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>);

// Status transition rules for Purchase Orders (mirrors backend)
const PO_ACTIONS = {
  PENDING: [['APPROVED', 'Approve'], ['HOLD', 'Hold'], ['REJECTED', 'Reject'], ['CANCELLED', 'Cancel']],
  APPROVED: [['COMPLETED', 'Mark Completed'], ['HOLD', 'Hold'], ['CANCELLED', 'Cancel']],
  HOLD: [['APPROVED', 'Approve'], ['REJECTED', 'Reject'], ['CANCELLED', 'Cancel']],
  REJECTED: [['CANCELLED', 'Cancel']],
  COMPLETED: [],
  CANCELLED: [],
};

// Map action keys to icon components
const ACTION_ICONS = {
  APPROVED: ApproveIcon,
  COMPLETED: CompleteIcon,
  REJECTED: RejectIcon,
  HOLD: HoldIcon,
  CANCELLED: CancelIcon,
};

// Map action keys to button colors
const ACTION_COLORS = {
  APPROVED: 'icon-approved',
  COMPLETED: 'icon-completed',
  REJECTED: 'icon-rejected',
  HOLD: 'icon-hold',
  CANCELLED: 'icon-cancelled',
};

// Status filter tabs for Purchase Orders (mirrors PO_ACTIONS statuses)
const PO_STATUS_TABS = [
  ['', 'All', 'tab-all'],
  ['PENDING', 'Pending', 'tab-pending'],
  ['APPROVED', 'Approved', 'tab-approved'],
  ['HOLD', 'On Hold', 'tab-hold'],
  ['REJECTED', 'Rejected', 'tab-rej'],
  ['COMPLETED', 'Completed', 'tab-done'],
  ['CANCELLED', 'Cancelled', 'tab-cancel'],
];

// Starting (empty) values for all filter fields
const EMPTY_FILTERS = { fromDate: '', toDate: '', quality: '', poNo: '', vendor: '', agent: '', soNo: '' };

export default function PurchaseOrderList({ showActions = true }) {
  // Table data and paging info returned by the backend
  const [data, setData] = useState({ content: [], page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0 });
  // Dropdown options loaded once from /api/purchase-orders/filters
  const [filterOptions, setFilterOptions] = useState({ vendors: [], agents: [], qualities: [], poNumbers: [], soNumbers: [] });
  // Current values typed/selected in the filter inputs (not applied until SEARCH)
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  // Filters that were last applied by SEARCH / status click / clear
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  // Active status filter (empty means no status filter)
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Debug: log render
  console.log('PurchaseOrderList render', { loading, error, data: data?.content?.length });

  // Load purchase orders from backend with given filters, status and page
  const load = useCallback(async (f, s, p) => {
    setLoading(true);
    setError('');
    try {
      console.log('Loading purchase orders...', { f, s, p });
      const res = await api.listPurchaseOrders({ ...f, status: s, page: p, size: PAGE_SIZE });
      console.log('Loaded:', res);
      setData(res);
    } catch (e) {
      console.error('Load failed:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // On first render: load filter dropdown values and the initial list
  useEffect(() => {
    console.log('Mount: loading filters and initial data');
    api.purchaseOrderFilters()
      .then((opts) => {
        console.log('Filters loaded:', opts);
        setFilterOptions(opts);
      })
      .catch((e) => console.error('Filters failed:', e));
    load(EMPTY_FILTERS, '', 0);
  }, [load]);

  // Helper to update one filter field when user changes an input/select
  const setF = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  // SEARCH: apply current filter inputs, go to page 1 (index 0)
  const applySearch = () => {
    setApplied(filters);
    setPage(0);
    load(filters, status, 0);
  };

  // CLEAR SEARCH: reset inputs, status and page, then reload all
  const clear = () => {
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setStatus('');
    setPage(0);
    load(EMPTY_FILTERS, '', 0);
  };

  // Click a status button: toggle it off if same, else filter by that status
  const pickStatus = (s) => {
    const next = status === s ? '' : s;
    setStatus(next);
    setPage(0);
    load(applied, next, 0);
  };

  // Move to another page (first/prev/next/last use this)
const goPage = (p) => {
    setPage(p);
    load(applied, status, p);
  };

  // Perform status transition
  const act = async (order, target) => {
    try {
      console.log('Changing status:', { orderId: order.id, currentStatus: order.status, target });
      await api.changePurchaseOrderStatus(order.id, target);
      load(applied, status, page);
    } catch (e) {
      console.error('Status change failed:', e);
      setError(e.message || 'Failed to change status. Check console for details.');
    }
  };

  const rows = data.content || [];
  const totalPages = data.totalPages || 0;
  const totalElements = data.totalElements || 0;

  return (
    <div>
      {/* Small label and centered title like the reference screen */}
      <div className="po-title-block">
        <div className="po-sub-label">TRADING</div>
        <h2 className="po-list-title">FABRIC PURCHASE ORDER LIST</h2>
        <div className="po-title-line" />
      </div>

      {/* Filter inputs: 2 rows of 4 label+field pairs */}
      <div className="filters po-filters">
        <label>From Date
          <input type="date" value={filters.fromDate} onChange={setF('fromDate')} />
        </label>
        <label>To Date
          <input type="date" value={filters.toDate} onChange={setF('toDate')} />
        </label>
        <label>Quality
          <select value={filters.quality} onChange={setF('quality')}>
            <option value="">Select</option>
            {(filterOptions.qualities || []).map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label>PO No.
          <select value={filters.poNo} onChange={setF('poNo')}>
            <option value="">Select</option>
            {(filterOptions.poNumbers || []).map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label>Vendor Name
          <select value={filters.vendor} onChange={setF('vendor')}>
            <option value="">Select</option>
            {(filterOptions.vendors || []).map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label>Agent
          <select value={filters.agent} onChange={setF('agent')}>
            <option value="">Select</option>
            {(filterOptions.agents || []).map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label>SO No.
          <select value={filters.soNo} onChange={setF('soNo')}>
            <option value="">Select</option>
            {(filterOptions.soNumbers || []).map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
      </div>

      {/* Action buttons for searching and clearing filters */}
      <div className="po-action-row">
        <button className="btn blue" onClick={applySearch}>SEARCH</button>
        <button className="btn blue" onClick={clear}>CLEAR SEARCH</button>
      </div>

      {/* Status filter tabs and ADD button in the same row, like the Domestic list */}
      <div className="tabs-row">
        <div className="tabs">
          {PO_STATUS_TABS.map(([value, label, cls]) => (
            <button key={label} className={`tab ${cls}${status === value ? ' active' : ''}`} onClick={() => pickStatus(value)}>
              {label}
            </button>
          ))}
        </div>
<Link to="/purchase/new" className="btn blue add">ADD PURCHASE ORDER</Link>
      </div>

      {error && <div className="alert">{error}</div>}

      {/* Purchase order table with dark header (reuses existing table styles) */}
      <div className="table-wrap dark-head">
        <table className="order-table po-table">
          <thead>
            <tr>
              <th className="col-center">SL NO.</th>
              <th className="col-nowrap">PURCHASE ORDER DATE</th>
              <th className="col-nowrap">PURCHASE ORDER NO</th>
              <th>SO NO.</th>
              <th>VENDOR NAME</th>
              <th>AGENT</th>
              <th>QUALITY</th>
              <th className="col-num">TOTAL QUANTITY</th>
              <th className="col-center">STATUS</th>
              {showActions && <th className="col-center">ACTION</th>}
              <th>APPROVER STATUS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o, i) => (
              <tr key={o.id}>
                <td className="col-center">{page * PAGE_SIZE + i + 1}</td>
                <td className="col-nowrap">{fmtDate(o.poDate)}</td>
                <td className="col-nowrap"><Link to={`/purchase/${o.id}`} className="link-blue">{o.poNumber}</Link></td>
                <td>{o.soNumber}</td>
                <td>{o.vendorName}</td>
                <td>{o.agent}</td>
                <td>{o.quality}</td>
                <td className="num col-num"><span className="qty-num">{fmt(o.totalQuantity, 2)}</span></td>
                {/* STATUS shown as plain colored text, using Domestic status color classes */}
                <td className="col-center"><span className={`status-text s-${o.status}`}>{PO_STATUS_LABEL[o.status] || o.status}</span></td>
                {showActions && (
                  <td className="col-center">
                      <div className="actions-wrap">
                        {showActions && <Link to={`/purchase/${o.id}/edit`} className="icon-action po-edit-icon" aria-label="Edit" title="Edit"><EditIcon /></Link>}
                        {showActions && (PO_ACTIONS[o.status] ?? []).map(([target, label]) => {
                          const IconCmp = ACTION_ICONS[target] || EditIcon;
                          const colorClass = ACTION_COLORS[target] || 'icon-view';
                          return (
                            <button key={target} type="button" className={`icon-action ${colorClass}`} onClick={() => act(o, target)} aria-label={label} title={label}>
                              <IconCmp />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                )}
                <td>{o.approverStatus}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={showActions ? 11 : 10} className="empty">No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls like the Domestic list: Prev / Page X of Y / Next */}
      <div className="report-footer">
        <div className="report-count">{totalElements} record(s)</div>
        <div className="pagination">
          <button className="btn blue" onClick={() => goPage(page - 1)} disabled={page <= 0} aria-label="Previous page">«</button>
          <span className="page-info">Page {totalPages === 0 ? 0 : page + 1} of {totalPages}</span>
          <button className="btn blue" onClick={() => goPage(page + 1)} disabled={totalPages === 0 || page >= totalPages - 1} aria-label="Next page">»</button>
        </div>
      </div>
    </div>
  );
}
