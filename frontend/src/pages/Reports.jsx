import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api, fmt, fmtDate, fmtQtyByUom, STATUS_LABEL, PO_STATUS_LABEL } from '../api.js';

// Domestic order status tabs
const DOMESTIC_TABS = [
  ['', 'All', 'tab-all'],
  ['PENDING', 'Pending', 'tab-pending'],
  ['MOVED_TO_PRODUCTION', 'Moved To Production', 'tab-prod'],
  ['COMPLETED', 'Completed', 'tab-done'],
  ['REJECTED', 'Rejected', 'tab-rej'],
  ['ON_HOLD', 'On Hold', 'tab-hold'],
  ['CANCELLED', 'Cancelled', 'tab-cancel'],
];

// Purchase order status tabs
const PO_STATUS_TABS = [
  ['', 'All', 'tab-all'],
  ['PENDING', 'Pending', 'tab-pending'],
  ['APPROVED', 'Approved', 'tab-approved'],
  ['HOLD', 'On Hold', 'tab-hold'],
  ['REJECTED', 'Rejected', 'tab-rej'],
  ['COMPLETED', 'Completed', 'tab-done'],
  ['CANCELLED', 'Cancelled', 'tab-cancel'],
];

const PAGE_SIZE = 10;

export default function Reports() {
  const location = useLocation();
  const initialType = location.pathname.includes('purchase') ? 'purchase' : 'domestic';
  
  // --- top-level report selector ---
  const [reportType, setReportType] = useState(initialType); // 'domestic' or 'purchase'

  // Sync reportType with URL changes
  useEffect(() => {
    const type = location.pathname.includes('purchase') ? 'purchase' : 'domestic';
    setReportType(type);
  }, [location.pathname]);

  // --- Domestic report state ---
  const [orders, setOrders] = useState({ content: [], page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0 });
  const [buyers, setBuyers] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [filters, setFilters] = useState({ orderNo: '', buyerId: '', qualityId: '', fromDate: '', toDate: '' });
  const [applied, setApplied] = useState({ orderNo: '', buyerId: '', qualityId: '', fromDate: '', toDate: '', status: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const loadDomestic = useCallback(async (f, s, p) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.listOrdersPaged({
        orderNo: f.orderNo,
        buyerId: f.buyerId,
        qualityId: f.qualityId,
        status: s,
        fromDate: f.fromDate,
        toDate: f.toDate,
        page: p,
        size: PAGE_SIZE
      });
      // Guard against null/undefined API response
      setOrders(data && data.content ? data : { content: [], page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0 });
    } catch (e) {
      setError(e.message);
      setOrders({ content: [], page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.buyers().then(setBuyers).catch(() => {});
    api.qualities().then(setQualities).catch(() => {});
    const init = { orderNo: '', buyerId: '', qualityId: '', fromDate: '', toDate: '' };
    setApplied({ ...init, status: '' });
    loadDomestic(init, '', 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setF = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  const applySearch = () => {
    if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate) {
      setError('From Date cannot be after To Date');
      return;
    }
    const next = { ...filters, status };
    setApplied(next);
    setError('');
    loadDomestic(filters, status, 0);
  };

  const clear = () => {
    const empty = { orderNo: '', buyerId: '', qualityId: '', fromDate: '', toDate: '' };
    setFilters(empty);
    setStatus('');
    setApplied({ ...empty, status: '' });
    setError('');
    loadDomestic(empty, '', 0);
  };

  const pickTab = (s) => {
    setStatus(s);
    const next = { ...applied, status: s, orderNo: filters.orderNo, buyerId: filters.buyerId, qualityId: filters.qualityId, fromDate: filters.fromDate, toDate: filters.toDate };
    setApplied(next);
    loadDomestic({ orderNo: filters.orderNo, buyerId: filters.buyerId, qualityId: filters.qualityId, fromDate: filters.fromDate, toDate: filters.toDate }, s, 0);
  };

  const goPage = (p) => {
    setPage(p);
    loadDomestic(applied, status, p);
  };

  const exportCsv = () => {
    // For CSV export, fetch all records
    api.listOrdersAll({
      orderNo: applied.orderNo,
      buyerId: applied.buyerId,
      qualityId: applied.qualityId,
      status: applied.status,
      fromDate: applied.fromDate,
      toDate: applied.toDate
    }).then((data) => {
      const headers = ['SL No','Order Date','Delivery Date','Order No','Buyer Name','Agent/Broker','Sourcing By','Quality','Buyer PO','Rate','Order Qty','Dispatch','Balance','Total Amount','Status'];
      const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const rows = data.map((o, i) => {
        const lines = o.lines || [];
        const delivery = lines.map((l) => fmtDate(l.deliveryDate)).filter(Boolean).join(' | ');
        const rate = lines.map((l) => fmt(l.pricePerUnit, 3)).filter((v) => v !== '').join(' | ');
        const quality = lines.map((l) => l.sortNumber || l.qualityDescription).join(' | ');
        return [i + 1, fmtDate(o.orderDate), delivery, o.orderNo, o.buyerName, o.agent, o.sourcingBy, quality, o.buyerPo, rate, fmtQtyByUom(lines, 'quantity'), fmtQtyByUom(lines, 'dispatch'), fmtQtyByUom(lines, 'balance'), fmt(o.totalAmount), STATUS_LABEL[o.status] || o.status].map(esc).join(',');
      });
      const csv = [headers.map(esc).join(','), ...rows].join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'domestic-order-list-report.csv';
      a.click();
      URL.revokeObjectURL(url);
    }).catch((e) => setError(e.message));
  };

  // --- Purchase report state ---
  const [poData, setPoData] = useState({ content: [], page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0 });
  const [poFilters, setPoFilters] = useState({ fromDate: '', toDate: '', quality: '', poNo: '', vendor: '', agent: '', soNo: '' });
  const [poApplied, setPoApplied] = useState({ fromDate: '', toDate: '', quality: '', poNo: '', vendor: '', agent: '', soNo: '', status: '' });
  const [poStatus, setPoStatus] = useState('');
  const [poError, setPoError] = useState('');
  const [poLoading, setPoLoading] = useState(false);
  const [poPage, setPoPage] = useState(0);
  const [poFilterOptions, setPoFilterOptions] = useState({ vendors: [], agents: [], qualities: [], poNumbers: [], soNumbers: [] });

  const loadPurchase = useCallback(async (f, s, p) => {
    setPoLoading(true);
    setPoError('');
    try {
      const res = await api.listPurchaseOrdersReport({ ...f, status: s, page: p, size: PAGE_SIZE });
      // Guard against null/undefined API response
      setPoData(res && res.content ? res : { content: [], page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0 });
    } catch (e) {
      setPoError(e.message);
      setPoData({ content: [], page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0 });
    } finally {
      setPoLoading(false);
    }
  }, []);

  useEffect(() => {
    api.purchaseOrderFilters()
      .then((opts) => setPoFilterOptions(opts))
      .catch(() => {});
    loadPurchase({ fromDate: '', toDate: '', quality: '', poNo: '', vendor: '', agent: '', soNo: '' }, '', 0);
  }, [loadPurchase]);

  // Reload data when reportType changes (via URL or internal menu)
  useEffect(() => {
    if (reportType === 'domestic') {
      loadDomestic(applied, status, page);
    } else {
      loadPurchase(poApplied, poStatus, poPage);
    }
  }, [reportType, loadDomestic, loadPurchase, applied, status, page, poApplied, poStatus, poPage]);

  const setPoF = (k) => (e) => setPoFilters((f) => ({ ...f, [k]: e.target.value }));

  const applyPoSearch = () => {
    if (poFilters.fromDate && poFilters.toDate && poFilters.fromDate > poFilters.toDate) {
      setPoError('From Date cannot be after To Date');
      return;
    }
    const next = { ...poFilters, status: poStatus };
    setPoApplied(next);
    setPoError('');
    loadPurchase(poFilters, poStatus, 0);
  };

  const clearPo = () => {
    const empty = { fromDate: '', toDate: '', quality: '', poNo: '', vendor: '', agent: '', soNo: '' };
    setPoFilters(empty);
    setPoStatus('');
    setPoApplied({ ...empty, status: '' });
    setPoError('');
    loadPurchase(empty, '', 0);
  };

  const pickPoStatus = (s) => {
    const next = poStatus === s ? '' : s;
    setPoStatus(next);
    setPoPage(0);
    loadPurchase(poApplied, next, 0);
  };

  const goPoPage = (p) => {
    setPoPage(p);
    loadPurchase(poApplied, poStatus, p);
  };

  const exportPoCsv = () => {
    api.listPurchaseOrdersReportAll({
      fromDate: poApplied.fromDate,
      toDate: poApplied.toDate,
      quality: poApplied.quality,
      poNo: poApplied.poNo,
      vendor: poApplied.vendor,
      agent: poApplied.agent,
      soNo: poApplied.soNo,
      status: poApplied.status
    }).then((data) => {
      const headers = ['SL No','PO Date','Delivery Date','PO No','SO No','Vendor','Quality','Rate','PO Qty','Received','Balance','Total Amount','Status'];
      const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const rows = data.map((o, i) => [
        i + 1,
        fmtDate(o.poDate),
        fmtDate(o.deliveryDate),
        o.poNumber,
        o.soNumber || '',
        o.vendorName || '',
        o.quality || '',
        fmt(o.rate, 3),
        fmt(o.poQty, 3),
        fmt(o.receivedQty, 3),
        fmt(o.balanceQty, 3),
        fmt(o.totalAmount),
        PO_STATUS_LABEL[o.status] || o.status
      ].map(esc).join(','));
      const csv = [headers.map(esc).join(','), ...rows].join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'purchase-order-list-report.csv';
      a.click();
      URL.revokeObjectURL(url);
    }).catch((e) => setPoError(e.message));
  };

  // --- Render ---
  return (
    <div>
      {reportType === 'domestic' && (
        <div>
          <div className="report-header">
            <div>
              <h1 className="report-title">Reports</h1>
              <p className="report-subtitle">Domestic Order List Report</p>
            </div>
            <button className="btn blue" onClick={exportCsv} disabled={(orders?.content?.length ?? 0) === 0 && !loading}>EXPORT CSV</button>
          </div>

          <div className="filters report-filters">
            <label>From Date
              <input type="date" value={filters.fromDate} onChange={setF('fromDate')} />
            </label>
            <label>To Date
              <input type="date" value={filters.toDate} onChange={setF('toDate')} />
            </label>
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
              <button className="btn blue" onClick={applySearch}>SEARCH</button>
              <button className="btn blue" onClick={clear}>CLEAR</button>
            </div>
          </div>

          <div className="tabs-row">
            <div className="tabs">
              {DOMESTIC_TABS.map(([value, label, cls]) => (
                <button key={label} className={`tab ${cls}${status === value ? ' active' : ''}`} onClick={() => pickTab(value)}>{label}</button>
              ))}
            </div>
          </div>

          {error && <div className="alert">{error}</div>}

          <div className="table-wrap dark-head">
            <table className="report-table">
              <thead>
                <tr>
                  <th>SL NO.</th>
                  <th>ORDER DATE</th>
                  <th>DELIVERY DATE</th>
                  <th>ORDER NO</th>
                  <th>BUYER NAME</th>
                  <th>AGENT/BROKER</th>
                  <th>SOURCING BY</th>
                  <th>QUALITY</th>
                  <th>BUYER PO</th>
                  <th>RATE</th>
                  <th>ORDER QTY</th>
                  <th>DISPATCH</th>
                  <th>BALANCE</th>
                  <th>TOTAL AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {(orders?.content ?? []).map((o, i) => {
                  const lines = o.lines || [];
                  const firstLine = lines[0];
                  const quality = firstLine ? (firstLine.sortNumber || firstLine.qualityDescription || '') : '';
                  const delivery = firstLine ? fmtDate(firstLine.deliveryDate) : '';
                  const rate = firstLine ? fmt(firstLine.pricePerUnit, 3) : '';
                  return (
                    <tr key={o.id}>
                      <td>{page * PAGE_SIZE + i + 1}</td>
                      <td>{fmtDate(o.orderDate)}</td>
                      <td>{delivery}</td>
                      <td><Link to={`/domestic-orders/${o.id}`}>{o.orderNo}</Link></td>
                      <td>{o.buyerName}</td>
                      <td>{o.agent}</td>
                      <td>{o.sourcingBy}</td>
                      <td>{quality}</td>
                      <td>{o.buyerPo}</td>
                      <td className="num">{rate}</td>
                      <td className="num">{fmtQtyByUom(lines, 'quantity')}</td>
                      <td className="num">{fmtQtyByUom(lines, 'dispatch')}</td>
                      <td className="num">{fmtQtyByUom(lines, 'balance')}</td>
                      <td className="num">{fmt(o.totalAmount)}</td>
                      <td><span className={`status-text s-${o.status}`}>{STATUS_LABEL[o.status] ?? o.status}</span></td>
                    </tr>
                  );
                })}
                {!loading && (orders?.content?.length ?? 0) === 0 && (
                  <tr><td colSpan="15" className="empty">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="report-footer">
            <div className="report-count">{(orders?.totalElements ?? 0)} record(s)</div>
            <div className="pagination">
              <button className="btn blue" onClick={() => goPage(page - 1)} disabled={page <= 0} aria-label="Previous page">«</button>
              <span className="page-info">Page {(orders?.totalPages ?? 0) === 0 ? 0 : page + 1} of {orders?.totalPages ?? 0}</span>
              <button className="btn blue" onClick={() => goPage(page + 1)} disabled={(orders?.totalPages ?? 0) === 0 || page >= (orders?.totalPages ?? 0) - 1} aria-label="Next page">»</button>
            </div>
          </div>
        </div>
      )}

      {reportType === 'purchase' && (
        <div>
          <div className="report-header">
            <div>
              <h1 className="report-title">Reports</h1>
              <p className="report-subtitle">Purchase Order List Report</p>
            </div>
            <button className="btn blue" onClick={exportPoCsv} disabled={(poData?.content?.length ?? 0) === 0 && !poLoading}>EXPORT CSV</button>
          </div>

          <div className="filters po-filters">
            <label>From Date
              <input type="date" value={poFilters.fromDate} onChange={setPoF('fromDate')} />
            </label>
            <label>To Date
              <input type="date" value={poFilters.toDate} onChange={setPoF('toDate')} />
            </label>
            <label>PO No.
              <select value={poFilters.poNo} onChange={setPoF('poNo')}>
                <option value="">Select</option>
                {(poFilterOptions.poNumbers || []).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
            <label>Vendor Name
              <select value={poFilters.vendor} onChange={setPoF('vendor')}>
                <option value="">Select</option>
                {(poFilterOptions.vendors || []).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
            <label>Quality
              <select value={poFilters.quality} onChange={setPoF('quality')}>
                <option value="">Select</option>
                {(poFilterOptions.qualities || []).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
            <label>Agent
              <select value={poFilters.agent} onChange={setPoF('agent')}>
                <option value="">Select</option>
                {(poFilterOptions.agents || []).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
            <label>SO No.
              <select value={poFilters.soNo} onChange={setPoF('soNo')}>
                <option value="">Select</option>
                {(poFilterOptions.soNumbers || []).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
            <div className="filter-buttons">
              <button className="btn blue" onClick={applyPoSearch}>SEARCH</button>
              <button className="btn blue" onClick={clearPo}>CLEAR</button>
            </div>
          </div>

          <div className="tabs-row">
            <div className="tabs">
              {PO_STATUS_TABS.map(([value, label, cls]) => (
                <button key={label} className={`tab ${cls}${poStatus === value ? ' active' : ''}`} onClick={() => pickPoStatus(value)}>{label}</button>
              ))}
            </div>
          </div>

          {poError && <div className="alert">{poError}</div>}

          <div className="table-wrap dark-head">
            <table className="report-table">
              <thead>
                <tr>
                  <th>SL NO.</th>
                  <th>PO DATE</th>
                  <th>DELIVERY DATE</th>
                  <th>PO NO</th>
                  <th>SO NO.</th>
                  <th>VENDOR NAME</th>
                  <th>QUALITY</th>
                  <th className="col-num">RATE</th>
                  <th className="col-num">PO QTY</th>
                  <th className="col-num">RECEIVED</th>
                  <th className="col-num">BALANCE</th>
                  <th className="col-num">TOTAL AMOUNT</th>
                  <th className="col-center">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {(poData?.content ?? []).map((o, i) => (
                  <tr key={o.id}>
                    <td>{poPage * PAGE_SIZE + i + 1}</td>
                    <td>{fmtDate(o.poDate)}</td>
                    <td>{fmtDate(o.deliveryDate)}</td>
                    <td><Link to={`/purchase/${o.id}`} className="link-blue">{o.poNumber}</Link></td>
                    <td>{o.soNumber}</td>
                    <td>{o.vendorName}</td>
                    <td>{o.quality}</td>
                    <td className="num">{fmt(o.rate, 3)}</td>
                    <td className="num">{fmt(o.poQty, 3)}</td>
                    <td className="num">{fmt(o.receivedQty, 3)}</td>
                    <td className="num">{fmt(o.balanceQty, 3)}</td>
                    <td className="num">{fmt(o.totalAmount)}</td>
                    <td className="col-center"><span className={`status-text s-${o.status}`}>{PO_STATUS_LABEL[o.status] || o.status}</span></td>
                  </tr>
                ))}
                {!poLoading && (poData?.content?.length ?? 0) === 0 && (
                  <tr><td colSpan="13" className="empty">No records found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="report-footer">
            <div className="report-count">{(poData?.totalElements ?? 0)} record(s)</div>
            <div className="pagination">
              <button className="btn blue" onClick={() => goPoPage(poPage - 1)} disabled={poPage <= 0} aria-label="Previous page">«</button>
              <span className="page-info">Page {(poData?.totalPages ?? 0) === 0 ? 0 : poPage + 1} of {poData?.totalPages ?? 0}</span>
              <button className="btn blue" onClick={() => goPoPage(poPage + 1)} disabled={(poData?.totalPages ?? 0) === 0 || poPage >= (poData?.totalPages ?? 0) - 1} aria-label="Next page">»</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}