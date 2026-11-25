import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtDate, fmtQtyList, STATUS_LABEL } from '../api.js';

const Icon = ({ children }) => (
  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {children}
  </svg>
);
const EyeIcon = () => (<Icon><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></Icon>);
const FactoryIcon = () => (<Icon><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M17 18h1" /><path d="M12 18h1" /><path d="M7 18h1" /></Icon>);
const PauseIcon = () => (<Icon><rect x="14" y="4" width="4" height="16" rx="1" /><rect x="6" y="4" width="4" height="16" rx="1" /></Icon>);
const XCircleIcon = () => (<Icon><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></Icon>);
const BanIcon = () => (<Icon><circle cx="12" cy="12" r="10" /><path d="M4.929 4.929 19.07 19.071" /></Icon>);
const PlayIcon = () => (<Icon><polygon points="6 3 20 12 6 21 6 3" /></Icon>);
const CheckCircleIcon = () => (<Icon><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></Icon>);
const EditIcon = () => (<Icon><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" /></Icon>);
const TruckIcon = () => (<Icon><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></Icon>);

const TABS = [
  ['', 'All', 'tab-all'],
  ['PENDING', 'Pending', 'tab-pending'],
  ['MOVED_TO_PRODUCTION', 'In Progress', 'tab-prod'],
  ['COMPLETED', 'Completed', 'tab-done'],
  ['REJECTED', 'Rejected', 'tab-rej'],
  ['ON_HOLD', 'On Hold', 'tab-hold'],
  ['CANCELLED', 'Cancelled', 'tab-cancel'],
];

const PAGE_SIZE = 20;

// which actions are offered for each status (mirrors the backend transition rules)
const ACTIONS = {
  PENDING: [['EDIT', 'Edit'], ['MOVED_TO_PRODUCTION', 'Move to Production'], ['ON_HOLD', 'Hold'], ['REJECTED', 'Reject'], ['CANCELLED', 'Cancel']],
  ON_HOLD: [['PENDING', 'Resume'], ['EDIT', 'Edit'], ['MOVED_TO_PRODUCTION', 'Move to Production'], ['CANCELLED', 'Cancel']],
  MOVED_TO_PRODUCTION: [['DISPATCH', 'Dispatch'], ['COMPLETED', 'Mark completed'], ['ON_HOLD', 'Hold'], ['CANCELLED', 'Cancel']],
};

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [filters, setFilters] = useState({ orderNo: '', buyerId: '', qualityId: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const load = useCallback(async (f = filters, s = status, p = 0) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.listOrdersPaged({ ...f, status: s, page: p, size: PAGE_SIZE });
      const normalized = data?.content ?? [];
      setOrders(normalized);
      setTotalPages(data?.totalPages ?? 0);
      setTotalElements(data?.totalElements ?? 0);
      setPage(p);
    } catch (e) {
      setError(e.message);
      setOrders([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [filters, status]);

  useEffect(() => {
    api.buyers().then(setBuyers).catch(() => {});
    api.qualities().then(setQualities).catch(() => {});
    load({ orderNo: '', buyerId: '', qualityId: '' }, '', 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setF = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  const clear = () => {
    const empty = { orderNo: '', buyerId: '', qualityId: '' };
    setFilters(empty);
    setStatus('');
    load(empty, '', 0);
  };

  const pickTab = (s) => {
    setStatus(s);
    load(filters, s, 0);
  };

  const act = async (order, target) => {
    try {
      await api.changeStatus(order.id, target);
      load(filters, status, page);
    } catch (e) {
      setError(e.message);
    }
  };

  const goPage = (p) => load(filters, status, p);

  return (
    <div>
      <div className="title-row">
        <h1>Sales Order</h1>
        <h2>DOMESTIC SALES ORDER LIST</h2>
      </div>

      <div className="filters list-filters">
        <label>Order Number
          <input placeholder="Enter Order Number" value={filters.orderNo} onChange={setF('orderNo')} />
        </label>
        <label>Buyer Name
          <select value={filters.buyerId} onChange={setF('buyerId')}>
            <option value="">Select Buyer Name</option>
            {buyers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
        <label>Quality
          <select value={filters.qualityId} onChange={setF('qualityId')}>
            <option value="">Select Quality</option>
            {qualities.map((q) => <option key={q.id} value={q.id}>{q.sortNumber}</option>)}
          </select>
        </label>
        <div className="filter-buttons">
          <button className="btn blue" onClick={() => load()}>SEARCH</button>
          <button className="btn blue" onClick={clear}>CLEAR SEARCH</button>
        </div>
      </div>

      <div className="tabs-row">
        <div className="tabs">
          {TABS.map(([value, label, cls]) => (
            <button key={label} className={`tab ${cls}${status === value ? ' active' : ''}`} onClick={() => pickTab(value)}>
              {label}
            </button>
          ))}
        </div>
        <Link to="/domestic-orders/new" className="btn blue add">ADD DOMESTIC ORDER</Link>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="table-wrap dark-head order-table-wrap">
        <table className="order-table">
          <thead>
            <tr>
              <th className="col-center">SL NO.</th><th className="col-nowrap">ORDER DATE</th><th className="col-nowrap">ORDER NO</th><th>BUYER NAME</th><th>AGENT/BROKER</th>
              <th>BUYER PRODUCT</th><th>QUALITY</th><th>BUYER PO</th><th className="col-num">ORDER QUANTITY</th><th className="col-num">DISPATCH</th>
              <th className="col-num">BALANCE QUANTITY</th><th className="col-center">STATUS</th><th className="col-center col-action">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => {
              const products = (o.lines || []).map((l) => l.buyerProduct);
              const productText = products.join(' | ');
              const qualities = (o.lines || []).map((l) => l.qualityDescription);
              const qualityText = qualities.join(' | ');
              return (
                <tr key={o.id}>
                  <td className="col-center">{page * PAGE_SIZE + i + 1}</td>
                  <td className="col-nowrap">{fmtDate(o.orderDate)}</td>
                  <td className="col-nowrap"><Link to={`/domestic-orders/${o.id}`} className="link-blue">{o.orderNo}</Link></td>
                  <td className="cell-buyer-name" title={o.buyerName || ''}>{o.buyerName}</td>                  <td className="cell-ellipsis" title={o.agent || ''}>{o.agent}</td>
                  <td className="cell-buyer-product" title={productText}>{products.map((p, idx) => <div key={idx}>{p}</div>)}</td>
                  <td className="cell-quality" title={qualityText}>{qualities.map((q, idx) => <div key={idx}>{q}</div>)}</td>
                  <td className="cell-ellipsis" title={o.buyerPo || ''}>{o.buyerPo}</td>
                  <td className="num col-num"><span className="qty-num">{fmtQtyList(o.lines, 'quantity')}</span></td>
                  <td className="num col-num"><span className="qty-num">{fmtQtyList(o.lines, 'dispatch')}</span></td>
                  <td className="num col-num"><span className="qty-num">{fmtQtyList(o.lines, 'balance')}</span></td>
                  <td className="col-center"><span className={`status-text s-${o.status}`}>{STATUS_LABEL[o.status]}</span></td>
                  <td className="actions">
                    <div className="actions-wrap">
                      <Link to={`/domestic-orders/${o.id}`} className="icon-action icon-view" aria-label="View" title="View"><EyeIcon /></Link>
                      {(ACTIONS[o.status] ?? []).map(([target, label]) => {
                        const cfg = {
                          EDIT: { cls: 'icon-move-production', IconCmp: EditIcon },
                          DISPATCH: { cls: 'icon-dispatch', IconCmp: TruckIcon },
                          MOVED_TO_PRODUCTION: { cls: 'icon-move-production', IconCmp: FactoryIcon },
                          COMPLETED: { cls: 'icon-completed', IconCmp: CheckCircleIcon },
                          PENDING: { cls: 'icon-pending', IconCmp: PlayIcon },
                          ON_HOLD: { cls: 'icon-hold', IconCmp: PauseIcon },
                          REJECTED: { cls: 'icon-rejected', IconCmp: XCircleIcon },
                          CANCELLED: { cls: 'icon-cancelled', IconCmp: BanIcon },
                        }[target] || { cls: 'icon-view', IconCmp: EyeIcon };
                        const ActionIcon = cfg.IconCmp;
                        if (target === 'EDIT' || label === 'Edit') {
                          return (
                            <Link key={target} to={`/orders/${o.id}/edit`} className={`icon-action ${cfg.cls}`} aria-label="Edit" title="Edit">
                              <ActionIcon />
                            </Link>
                          );
                        }
                        if (label === 'Dispatch') {
                          return (
                            <Link key={target} to={`/orders/${o.id}/dispatch`} className={`icon-action ${cfg.cls}`} aria-label="Dispatch" title="Dispatch">
                              <ActionIcon />
                            </Link>
                          );
                        }
                        return (
                          <button key={target} type="button" className={`icon-action ${cfg.cls}`} onClick={() => act(o, target)} aria-label={label} title={label}>
                            <ActionIcon />
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && orders.length === 0 && (
              <tr><td colSpan="13" className="empty">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

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
