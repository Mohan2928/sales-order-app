import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, fmt, fmtDate, STATUS_LABEL } from '../api.js';

const today = () => new Date().toISOString().slice(0, 10);

export default function Dispatch() {
  const { id } = useParams();
  const [o, setO] = useState(null);
  const [dispatches, setDispatches] = useState([]);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ lineId: '', dispatchDate: today(), quantity: '', vehicleNo: '', challanNo: '', remarks: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [order, hist] = await Promise.all([api.getOrder(id), api.listDispatches(id)]);
      setO(order);
      const list = Array.isArray(hist) ? hist : (hist?.dispatches || []);
      setDispatches(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const allowed = o?.status === 'MOVED_TO_PRODUCTION';
  const setF = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    setFieldErrors((fe) => { if (!fe[k]) return fe; const n = { ...fe }; delete n[k]; return n; });
  };

  const selectedLine = useMemo(() => (o?.lines || []).find((l) => String(l.id) === String(form.lineId)), [o, form.lineId]);
  const lineBalance = selectedLine ? (Number(selectedLine.quantity) || 0) - (Number(selectedLine.dispatchQty) || 0) : null;

  const qtyErr = (() => {
    if (fieldErrors.quantity) return fieldErrors.quantity;
    const q = Number(form.quantity);
    if (form.quantity !== '' && selectedLine && q > 0 && q > lineBalance) return `Exceeds balance (${fmt(lineBalance, 3)})`;
    return '';
  })();

  const save = async (e) => {
    e.preventDefault();
    setFormError('');
    const errs = {};
    if (!form.lineId) errs.lineId = 'Required';
    if (!form.dispatchDate) errs.dispatchDate = 'Required';
    if (form.quantity === '' || form.quantity == null) errs.quantity = 'Required';
    else if (Number(form.quantity) <= 0) errs.quantity = 'Must be > 0';
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;
    const q = Number(form.quantity);
    if (selectedLine && q > lineBalance) {
      setFormError(`Exceeds balance (${fmt(lineBalance, 3)})`);
      return;
    }
    setSaving(true);
    try {
      await api.createDispatch(id, {
        lineId: Number(form.lineId),
        dispatchDate: form.dispatchDate,
        quantity: Number(form.quantity),
        vehicleNo: form.vehicleNo || null,
        challanNo: form.challanNo || null,
        remarks: form.remarks || null,
      });
      setForm({ lineId: '', dispatchDate: today(), quantity: '', vehicleNo: '', challanNo: '', remarks: '' });
      setFieldErrors({});
      await load();
    } catch (e2) {
      setFormError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  const history = useMemo(() => {
    const list = Array.isArray(dispatches) ? [...dispatches] : [];
    return list.sort((a, b) => String(b.dispatchDate || '').localeCompare(String(a.dispatchDate || '')) || (Number(b.id || 0) - Number(a.id || 0)));
  }, [dispatches]);

  const lineLabel = (lineId) => {
    const l = (o?.lines || []).find((x) => String(x.id) === String(lineId));
    if (!l) return lineId ?? '—';
    return `${l.sortNumber || l.qualityDescription || ('Line ' + l.id)}`;
  };
  const lineUom = (lineId) => (o?.lines || []).find((x) => String(x.id) === String(lineId))?.uom || '';

  if (error) return <div className="alert">{error}</div>;
  if (loading || !o) return <p>Loading…</p>;

  return (
    <div>
      <div className="title-row">
        <h1>DISPATCH</h1>
        <h2>{o.orderNo} — {o.buyerName} — <span className={`status-text s-${o.status}`}>{STATUS_LABEL[o.status]}</span></h2>
        <Link to="/orders" className="btn secondary" style={{ justifySelf: 'end' }}>Back</Link>
      </div>

      {formError && <div className="alert">{formError}</div>}

      <h3 className="section-title">Order Lines</h3>
      <div className="table-wrap dark-head" style={{ marginBottom: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Line #</th><th>Sort</th><th>Quality</th><th>UOM</th>
              <th className="col-num">Ordered</th><th className="col-num">Dispatched</th><th className="col-num">Balance</th>
            </tr>
          </thead>
          <tbody>
            {(o.lines || []).map((l, i) => {
              const bal = (Number(l.quantity) || 0) - (Number(l.dispatchQty) || 0);
              return (
                <tr key={l.id}>
                  <td>{i + 1}</td>
                  <td>{l.sortNumber}</td>
                  <td>{l.qualityDescription}</td>
                  <td>{l.uom}</td>
                  <td className="num">{fmt(l.quantity, 3)}</td>
                  <td className="num">{fmt(l.dispatchQty, 3)}</td>
                  <td className="num">{fmt(bal, 3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!allowed && <div className="alert">Dispatch is allowed only for orders that are Moved To Production</div>}

      <section className="card form-section">
        <h3 className="form-section-title">Dispatch</h3>
        <form onSubmit={save}>
          <fieldset disabled={!allowed} style={{ border: 0, padding: 0, margin: 0 }}>
            <div className="grid3">
              <label className={`field${fieldErrors.lineId ? ' has-error' : ''}`}>
                <span className="label">Line<b className="req"> *</b></span>
                <span className="control">
                  <select value={form.lineId} onChange={setF('lineId')}>
                    <option value="">Select Line</option>
                    {(o.lines || []).map((l, i) => {
                      const bal = (Number(l.quantity) || 0) - (Number(l.dispatchQty) || 0);
                      return <option key={l.id} value={l.id}>{i + 1} - {l.sortNumber || l.qualityDescription} (Balance {fmt(bal, 3)} {l.uom || ''})</option>;
                    })}
                  </select>
                </span>
                {fieldErrors.lineId && <span className="err">{fieldErrors.lineId}</span>}
              </label>

              <label className={`field${fieldErrors.dispatchDate ? ' has-error' : ''}`}>
                <span className="label">Dispatch Date<b className="req"> *</b></span>
                <span className="control"><input type="date" value={form.dispatchDate} onChange={setF('dispatchDate')} /></span>
                {fieldErrors.dispatchDate && <span className="err">{fieldErrors.dispatchDate}</span>}
              </label>

              <label className={`field${qtyErr ? ' has-error' : ''}`}>
                <span className="label">Quantity<b className="req"> *</b></span>
                <span className="control"><input type="number" min="0" step="0.001" value={form.quantity} onChange={setF('quantity')} /></span>
                {qtyErr && <span className="err">{qtyErr}</span>}
              </label>

              <label className="field">
                <span className="label">Vehicle No</span>
                <span className="control"><input value={form.vehicleNo} onChange={setF('vehicleNo')} /></span>
              </label>

              <label className="field">
                <span className="label">Challan No</span>
                <span className="control"><input value={form.challanNo} onChange={setF('challanNo')} /></span>
              </label>

              <label className="field">
                <span className="label">Remarks</span>
                <span className="control"><input value={form.remarks} onChange={setF('remarks')} /></span>
              </label>
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn green" disabled={!allowed || saving}>{saving ? 'SAVING…' : 'SAVE DISPATCH'}</button>
            </div>
          </fieldset>
        </form>
      </section>

      <h3 className="section-title">Dispatch History</h3>
      <div className="table-wrap dark-head">
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Line/Sort</th><th className="col-num">Quantity</th><th>Vehicle No</th><th>Challan No</th><th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {history.map((d, i) => (
              <tr key={d.id ?? i}>
                <td>{fmtDate(d.dispatchDate)}</td>
                <td>{lineLabel(d.lineId)}</td>
                <td className="num">{fmt(d.quantity, 3)} {d.uom || lineUom(d.lineId)}</td>
                <td>{d.vehicleNo}</td>
                <td>{d.challanNo}</td>
                <td>{d.remarks}</td>
              </tr>
            ))}
            {history.length === 0 && <tr><td colSpan="6" className="empty">No dispatches found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
