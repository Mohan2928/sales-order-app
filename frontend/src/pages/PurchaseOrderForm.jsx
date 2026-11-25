import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, fmt } from '../api.js';

const today = () => new Date().toISOString().slice(0, 10);

function Field({ label, required, error, children }) {
  return (
    <label className={`field${error ? ' has-error' : ''}`}>
      <span className="label">{label}{required && <b className="req"> *</b>}</span>
      <span className="control">{children}</span>
      {error && <span className="err">{error}</span>}
    </label>
  );
}

function Select({ value, onChange, options, placeholder = 'Select', disabled = false }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
      <option value="">{placeholder}</option>
      {options.map((o) => (typeof o === 'string'
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>))}
    </select>
  );
}

const emptyHeader = (companyName = '') => ({
  poDate: today(),
  vendorGroup: '',
  vendorId: '',
  agent: '',
  soNumber: '',
  fabricType: '',
  consignee: '',
  salesAddress: '',
  paymentTerms: '',
  gstType: 'IGST',
  customerSo: '',
  termsAndCondition: '',
  company: companyName,
});

const emptyItem = () => ({
  quality: '',
  displayQuality: '',
  quantity: '',
  uom: '',
  unitPrice: '',
  gstPercent: '',
  deliveryTerms: '',
  provisionalFreight: '',
  millGstPrice: '',
  finalPrice: '',
  deliveryDate: '',
  remark: '',
  certifications: [],
  certSelect: '',
});

const HEADER_REQUIRED = [
  ['poDate', 'Date'],
  ['vendorGroup', 'Vendor Group'],
  ['vendorId', 'Vendor Name'],
  ['fabricType', 'Fabric Type'],
  ['paymentTerms', 'Payment Terms'],
  ['company', 'Company'],
];

export default function PurchaseOrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const itemIdRef = useRef(1);
  const itemRefs = useRef({});

  const [lookups, setLookups] = useState({});
  const [vendors, setVendors] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [soNumbers, setSoNumbers] = useState([]);
  const [header, setHeader] = useState(emptyHeader(''));
  const [items, setItems] = useState([{ id: 'item-1', values: emptyItem() }]);
  const [headerErrors, setHeaderErrors] = useState({});
  const [itemErrors, setItemErrors] = useState({});
  const [formError, setFormError] = useState('');
const [saving, setSaving] = useState(false);

  const newItem = () => {
    itemIdRef.current += 1;
    return { id: `item-${itemIdRef.current}`, values: emptyItem() };
  };

useEffect(() => {
    Promise.all([api.lookups(), api.vendors(), api.qualities(), api.listOrdersAll(), api.companyName()]).then(async ([l, v, q, orders, comp]) => {
      setLookups(l || {});
      setVendors(v || []);
      setQualities(q || []);
      const normalized = Array.isArray(orders) ? orders : (orders?.content ?? []);
      const soNos = Array.from(new Set((normalized || []).map((o) => o.orderNo).filter(Boolean))).sort();
      setSoNumbers(soNos);
      const companyName = comp && comp.name ? comp.name : 'TOTALA TEXTILES PRIVATE LIMITED';

      if (isEdit) {
        const po = await api.getPurchaseOrder(id);
        setHeader({
          poDate: po.poDate || today(),
          vendorGroup: po.vendorGroup || '',
          vendorId: po.vendorId != null ? String(po.vendorId) : '',
          agent: po.agent || '',
          soNumber: po.soNumber || '',
          fabricType: po.fabricType || '',
          consignee: po.consignee || '',
          salesAddress: po.salesAddress || '',
          paymentTerms: po.paymentTerms || '',
          gstType: po.gstType || 'IGST',
          customerSo: po.customerSo || '',
          termsAndCondition: po.termsAndCondition || '',
          company: po.company || companyName,
        });
        const loaded = (po.items || []).map((it, idx) => ({
          id: `item-${idx + 1}`,
          values: {
            quality: it.quality || '',
            displayQuality: it.displayQuality || '',
            quantity: it.quantity ?? '',
            uom: it.uom || '',
            unitPrice: it.unitPrice ?? '',
            gstPercent: it.gstPercent != null ? String(it.gstPercent) : '',
            deliveryTerms: it.deliveryTerms || '',
            provisionalFreight: it.provisionalFreight ?? '',
            millGstPrice: it.millGstPrice ?? '',
            finalPrice: it.finalPrice ?? '',
            deliveryDate: it.deliveryDate || '',
            remark: it.remark || '',
            certifications: Array.isArray(it.certifications) ? it.certifications : [],
            certSelect: '',
          },
        }));
        itemIdRef.current = loaded.length || 1;
        setItems(loaded.length ? loaded : [newItem()]);
        setItemErrors({});
      } else {
        setHeader(emptyHeader(companyName));
      }
    }).catch((e) => setFormError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const L = (k) => lookups[k] ?? [];
  const gstPercentOptions = () => {
    const opts = L('GST_PERCENT');
    return opts.length ? opts : ['0', '5', '12', '18'];
  };

  const setH = (k) => (v) => {
    setHeader((h) => ({ ...h, [k]: v }));
    setHeaderErrors((he) => { if (!he[k]) return he; const n = { ...he }; delete n[k]; return n; });
  };

  const isUntouchedItem = (values) => {
    const e = emptyItem();
    return Object.keys(e).every((k) => {
      if (k === 'certifications') return !values.certifications || values.certifications.length === 0;
      return String(values[k] ?? '') === String(e[k] ?? '');
    });
  };

  const validateItem = (values) => {
    const errs = {};
    if (!values.quality) errs.quality = 'Required';
    if (values.quantity === '' || values.quantity == null) errs.quantity = 'Required';
    else if (Number(values.quantity) <= 0) errs.quantity = 'Required';
    if (!values.uom) errs.uom = 'Required';
    if (values.unitPrice === '' || values.unitPrice == null) errs.unitPrice = 'Required';
    else if (Number(values.unitPrice) <= 0) errs.unitPrice = 'Required';
    if (values.gstPercent === '' || values.gstPercent == null) errs.gstPercent = 'Required';
    return errs;
  };

  const setItemValue = (itemId, key, value) => {
    setItems((cards) => cards.map((c) => c.id === itemId ? { ...c, values: { ...c.values, [key]: value } } : c));
    setItemErrors((prev) => {
      if (!prev[itemId] || !prev[itemId][key]) return prev;
      const nextCard = { ...prev[itemId] };
      delete nextCard[key];
      return { ...prev, [itemId]: nextCard };
    });
  };

  const addItem = () => {
    setFormError('');
    const nc = newItem();
    setItems((cards) => [...cards, nc]);
    setTimeout(() => itemRefs.current[nc.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const removeItem = (itemId) => {
    setItems((cards) => cards.length <= 1 ? cards : cards.filter((c) => c.id !== itemId));
    setItemErrors((prev) => {
      if (!prev[itemId]) return prev;
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const calc = (values) => {
    const basic = (Number(values.quantity) || 0) * (Number(values.unitPrice) || 0);
    const gstAmount = basic * ((Number(values.gstPercent) || 0) / 100);
    const total = basic + gstAmount;
    return { basic, gstAmount, total };
  };

  const addCertification = (itemId) => {
    setItems((cards) => cards.map((c) => {
      if (c.id !== itemId) return c;
      const sel = c.values.certSelect;
      if (!sel) return c;
      if ((c.values.certifications || []).includes(sel)) return c;
      return { ...c, values: { ...c.values, certifications: [...(c.values.certifications || []), sel], certSelect: '' } };
    }));
  };

  const removeCertification = (itemId, cert) => {
    setItems((cards) => cards.map((c) => {
      if (c.id !== itemId) return c;
      return { ...c, values: { ...c.values, certifications: (c.values.certifications || []).filter((x) => x !== cert) } };
    }));
  };

  const gstLabel = header.gstType === 'CGST_SGST' ? 'GST' : 'IGST';
  const canRemove = items.length > 1;

  const save = async () => {
    setFormError('');
    const hErrs = {};
    HEADER_REQUIRED.forEach(([k, label]) => {
      const v = header[k];
      if (v === '' || v == null) hErrs[k] = `${label} is required`;
    });

    const itemsToSend = items.filter((c) => !isUntouchedItem(c.values));
    const iErrs = {};
    let firstItemErrId = null;
    if (itemsToSend.length === 0) {
      const first = items[0];
      if (first) { iErrs[first.id] = validateItem(first.values); firstItemErrId = first.id; }
    } else {
      itemsToSend.forEach((c) => {
        const e = validateItem(c.values);
        if (Object.keys(e).length) { iErrs[c.id] = e; if (!firstItemErrId) firstItemErrId = c.id; }
      });
    }

    setHeaderErrors(hErrs);
    setItemErrors(iErrs);

    const hasHeaderErr = Object.keys(hErrs).length > 0;
    const hasItemErr = Object.keys(iErrs).length > 0;
    if (hasHeaderErr || hasItemErr) {
      setFormError('Please fill the mandatory fields highlighted below.');
      if (hasHeaderErr) window.scrollTo(0, 0);
      else if (firstItemErrId && itemRefs.current[firstItemErrId]) itemRefs.current[firstItemErrId].scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo(0, 0);
      return;
    }

    const num = (v) => (v === '' || v == null ? null : Number(v));
    const payload = {
      poDate: header.poDate,
      vendorGroup: header.vendorGroup,
      vendorId: Number(header.vendorId),
      agent: header.agent || null,
      soNumber: header.soNumber || null,
      fabricType: header.fabricType,
      consignee: header.consignee || null,
      salesAddress: header.salesAddress || null,
      paymentTerms: header.paymentTerms,
      termsAndCondition: header.termsAndCondition || null,
      customerSo: header.customerSo || null,
      company: header.company,
      gstType: header.gstType || 'IGST',
      items: itemsToSend.map((c) => {
        const v = c.values;
        return {
          quality: v.quality,
          displayQuality: v.displayQuality || null,
          quantity: num(v.quantity),
          uom: v.uom,
          unitPrice: num(v.unitPrice),
          gstPercent: num(v.gstPercent),
          deliveryTerms: v.deliveryTerms || null,
          provisionalFreight: num(v.provisionalFreight),
          millGstPrice: num(v.millGstPrice),
          finalPrice: num(v.finalPrice),
          deliveryDate: v.deliveryDate || null,
          remark: v.remark || null,
          certifications: v.certifications || [],
        };
      }),
    };

    setSaving(true);
    try {
      const saved = isEdit ? await api.updatePurchaseOrder(id, payload) : await api.createPurchaseOrder(payload);
      navigate('/purchase-orders', { state: { message: `Purchase Order ${saved.poNumber} saved` } });
    } catch (e) {
      const fields = e && e.fields ? e.fields : {};
      setFormError(e.message + (Object.keys(fields).length ? ': ' + Object.entries(fields).map(([k, v]) => `${k} ${v}`).join(', ') : ''));
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="po-form-page">
      <div className="po-form-header">
        <div className="po-sub-label">TRADING</div>
        <h2 className="po-list-title">FABRIC PURCHASE ORDER</h2>
        <button type="button" className="btn secondary" onClick={() => navigate('/purchase-orders')}>BACK</button>
      </div>
      <div className="po-breadcrumb"><Link to="/">Home</Link> &gt; <Link to="/purchase-orders">Fabric Po List</Link></div>

      {formError && <div className="alert">{formError}</div>}

      <section className="card form-section">
        <div className="po-header-grid">
          <div className="po-header-col">
            <Field label="Date" required error={headerErrors.poDate}>
              <input type="date" value={header.poDate} onChange={(e) => setH('poDate')(e.target.value)} />
            </Field>
            <Field label="Vendor Name" required error={headerErrors.vendorId}>
              <Select value={header.vendorId} onChange={setH('vendorId')} options={vendors.map((v) => ({ value: String(v.id), label: v.name }))} placeholder="Select Vendor" />
            </Field>
            <Field label="Agent Name">
              <Select value={header.agent} onChange={setH('agent')} options={L('AGENT')} placeholder="Select Agent" />
            </Field>
            <Field label="So No">
              <Select value={header.soNumber} onChange={setH('soNumber')} options={soNumbers} placeholder="Select SO No" />
            </Field>
            <Field label="Fabric Type" required error={headerErrors.fabricType}>
              <Select value={header.fabricType} onChange={setH('fabricType')} options={L('FABRIC_TYPE')} placeholder="Select Fabric Type" />
            </Field>
            <Field label="Consignee">
              <Select value={header.consignee} onChange={setH('consignee')} options={L('CONSIGNEE')} placeholder="Select Consignee" />
            </Field>
            <Field label="Sales Address">
              <textarea rows={2} value={header.salesAddress} onChange={(e) => setH('salesAddress')(e.target.value)} />
            </Field>
            <Field label="Payment Terms" required error={headerErrors.paymentTerms}>
              <Select value={header.paymentTerms} onChange={setH('paymentTerms')} options={L('PAYMENT_TERMS')} placeholder="Select Payment Terms" />
            </Field>
          </div>
          <div className="po-header-col">
            <Field label="Vendor Group" required error={headerErrors.vendorGroup}>
              <Select value={header.vendorGroup} onChange={setH('vendorGroup')} options={L('VENDOR_GROUP')} placeholder="Select Vendor Group" />
            </Field>
            <div className="field">
              <span className="label">GST Type</span>
              <span className="control po-radio-group">
                <label className="po-radio"><input type="radio" name="gstType" checked={header.gstType === 'IGST'} onChange={() => setH('gstType')('IGST')} /> IGST</label>
                <label className="po-radio"><input type="radio" name="gstType" checked={header.gstType === 'CGST_SGST'} onChange={() => setH('gstType')('CGST_SGST')} /> CGST/SGST</label>
              </span>
            </div>
            <Field label="Customer SO">
              <input value={header.customerSo} onChange={(e) => setH('customerSo')(e.target.value)} />
            </Field>
            <Field label="Terms And Condition">
              <Select value={header.termsAndCondition} onChange={setH('termsAndCondition')} options={L('TERMS_AND_CONDITION')} placeholder="Select Terms And Condition" />
            </Field>
            <Field label="Company" required error={headerErrors.company}>
              <input value={header.company} readOnly />
            </Field>
          </div>
        </div>
      </section>

<div style={{ margin: '10px 0', textAlign: 'right' }}>
        <button type="button" className="btn gold" onClick={addItem}>ADD ITEM</button>
      </div>

      <div className="line-cards">
        {items.map((card, index) => {
          const v = card.values;
          const ie = itemErrors[card.id] || {};
          const { basic, gstAmount, total } = calc(v);
          const certOpts = (L('CERTIFICATION_TYPE').length ? L('CERTIFICATION_TYPE') : ['GOTS', 'OCS', 'GRS', 'BCI', 'Oeko-Tex']);
          return (
            <div className="line-card" key={card.id} ref={(el) => { itemRefs.current[card.id] = el; }}>
              <div className="line-card-header">
                <h4>Item {index + 1}</h4>
                {canRemove && <button type="button" className="btn-remove" onClick={() => removeItem(card.id)}>Remove</button>}
              </div>
              <div className="po-item-grid">
                <div className="po-item-col">
                  <Field label="Quality" required error={ie.quality}>
                    <Select value={v.quality} onChange={(val) => setItemValue(card.id, 'quality', val)} options={qualities.map((q) => ({ value: q.sortNumber, label: `${q.sortNumber}${q.description ? ' - ' + q.description : ''}` }))} placeholder="Select Quality" />
                  </Field>
                  <div className="po-two-col">
                    <Field label="Quantity" required error={ie.quantity}>
                      <input type="number" min="0" step="0.001" value={v.quantity} onChange={(e) => setItemValue(card.id, 'quantity', e.target.value)} />
                    </Field>
                    <Field label="Unit" required error={ie.uom}>
                      <Select value={v.uom} onChange={(val) => setItemValue(card.id, 'uom', val)} options={L('UOM')} placeholder="Select UOM" />
                    </Field>
                  </div>
                  <Field label="Basic Amount">
                    <input readOnly value={basic ? `${fmt(basic, 2)} Rs` : ''} />
                  </Field>
                  <Field label={`${gstLabel} %`} required error={ie.gstPercent}>
                    <Select value={v.gstPercent} onChange={(val) => setItemValue(card.id, 'gstPercent', val)} options={gstPercentOptions()} placeholder="Select GST %" />
                  </Field>
                  <Field label="Total Amount">
                    <input readOnly value={total ? `${fmt(total, 2)} Rs` : ''} />
                  </Field>
                  <Field label="Delivery Terms">
                    <Select value={v.deliveryTerms} onChange={(val) => setItemValue(card.id, 'deliveryTerms', val)} options={L('DELIVERY_TERMS')} placeholder="Select Delivery Terms" />
                  </Field>
                  <Field label="Mill GST Price">
                    <input type="number" min="0" step="0.01" value={v.millGstPrice} onChange={(e) => setItemValue(card.id, 'millGstPrice', e.target.value)} placeholder="Rs" />
                  </Field>
                  <Field label="Delivery Date">
                    <input type="date" value={v.deliveryDate} onChange={(e) => setItemValue(card.id, 'deliveryDate', e.target.value)} />
                  </Field>
                </div>
                <div className="po-item-col">
                  <Field label="Display Quality">
                    <input value={v.displayQuality} onChange={(e) => setItemValue(card.id, 'displayQuality', e.target.value)} />
                  </Field>
                  <Field label="Unit Price" required error={ie.unitPrice}>
                    <input type="number" min="0" step="0.001" value={v.unitPrice} onChange={(e) => setItemValue(card.id, 'unitPrice', e.target.value)} placeholder="Rs" />
                  </Field>
                  <Field label={`${gstLabel} Amount`}>
                    <input readOnly value={gstAmount ? `${fmt(gstAmount, 2)} Rs` : ''} />
                  </Field>
                  <Field label="Provisional Freight">
                    <input type="number" min="0" step="0.01" value={v.provisionalFreight} onChange={(e) => setItemValue(card.id, 'provisionalFreight', e.target.value)} placeholder="Rs" />
                  </Field>
                  <Field label="Final Price">
                    <input type="number" min="0" step="0.01" value={v.finalPrice} onChange={(e) => setItemValue(card.id, 'finalPrice', e.target.value)} placeholder="Rs" />
                  </Field>
                  <Field label="Remark">
                    <input value={v.remark} onChange={(e) => setItemValue(card.id, 'remark', e.target.value)} />
                  </Field>
                </div>
              </div>

              <div className="po-cert-section">
                <table className="po-cert-table">
                  <thead>
                    <tr>
                      <th>YARN CERTIFICATION TYPE</th>
                      <th style={{ width: 80, textAlign: 'center' }}>ADD</th>
                      <th style={{ width: 80, textAlign: 'center' }}>REMOVE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <select value={v.certSelect || ''} onChange={(e) => setItemValue(card.id, 'certSelect', e.target.value)}>
                          <option value="">Select Certification</option>
                          {certOpts.map((copt) => <option key={copt} value={copt}>{copt}</option>)}
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" className="po-cert-add" onClick={() => addCertification(card.id)}>+</button>
                      </td>
                      <td></td>
                    </tr>
                    {(v.certifications || []).map((cert) => (
                      <tr key={cert}>
                        <td>{cert}</td>
                        <td></td>
                        <td style={{ textAlign: 'center' }}>
                          <button type="button" className="po-cert-remove" onClick={() => removeCertification(card.id, cert)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <div className="po-bottom-actions">
        <button type="button" className="btn blue" onClick={save} disabled={saving}>{saving ? 'SAVING…' : 'SAVE'}</button>
        <button type="button" className="btn gold" onClick={() => navigate('/purchase-orders')}>CANCEL</button>
      </div>
    </div>
  );
}
