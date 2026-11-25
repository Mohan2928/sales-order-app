import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, fmt } from '../api.js';

const today = () => new Date().toISOString().slice(0, 10);

const emptyHeader = () => ({
  invoiceType: '', contractType: '', contractOrderRoute: '', orderDate: today(),
  buyerId: '', buyerAddress: '', agent: '', deliveryAddress: '', confirmationDate: today(),
  shipmentMode: '', deliveryTerms: '', paymentTerms: '', gstType: '', salesCoordinator: '',
  bank: '', soType: '', sourcingBy: '', buyerPo: '', termsAndCondition: '', remarks: '',
});

const emptyLine = () => ({
  fabricType: '', qualityId: '', buyerProduct: '', fabricWidth: '', inspectionType: '',
  quantity: '', uom: '', pricePerUnit: '', gstPercent: '5', weaveType: '', packingType: '',
  deliveryDate: '', variationPercent: '', weavingQty: '', purchaseQty: '', costingNumber: '',
});

const HEADER_FIELDS = [
  { key: 'invoiceType', label: 'Invoice Type', required: true },
  { key: 'contractType', label: 'Contract Type', required: true },
  { key: 'contractOrderRoute', label: 'Contract Order Route', required: true },
  { key: 'orderDate', label: 'Order Date', required: true },
  { key: 'confirmationDate', label: 'Confirmation Date', required: true },
  { key: 'soType', label: 'SO Type', required: true },
  { key: 'agent', label: 'Agent / Broker', required: true },
  { key: 'salesCoordinator', label: 'Sales Co-Ordinator', required: true },
  { key: 'sourcingBy', label: 'Sourcing By', required: true },
  { key: 'buyerId', label: 'Buyer Name', required: true },
  { key: 'buyerAddress', label: 'Buyer Address', required: true },
  { key: 'deliveryAddress', label: 'Delivery Address', required: true },
  { key: 'gstType', label: 'GST Type', required: true },
  { key: 'shipmentMode', label: 'Mode Of Shipment', required: true },
  { key: 'deliveryTerms', label: 'Delivery Terms', required: true },
  { key: 'paymentTerms', label: 'Terms Of Payment', required: true },
  { key: 'bank', label: 'Bank', required: true },
  { key: 'buyerPo', label: 'Buyer PO', required: false },
  { key: 'termsAndCondition', label: 'Terms And Condition', required: true },
  { key: 'remarks', label: 'Remarks', required: false },
];
const HEADER_REQUIRED = HEADER_FIELDS.filter((f) => f.required).map((f) => f.key);
const HEADER_LABEL = Object.fromEntries(HEADER_FIELDS.map((f) => [f.key, f.label]));

const LINE_REQUIRED = ['fabricType', 'qualityId', 'buyerProduct', 'fabricWidth', 'inspectionType',
  'quantity', 'uom', 'pricePerUnit', 'weaveType', 'packingType', 'deliveryDate', 'variationPercent',
  'purchaseQty', 'costingNumber'];

function Field({ label, required, error, children }) {
  return (
    <label className={`field${error ? ' has-error' : ''}`}>
      <span className="label">{label}{required && <b className="req"> *</b>}</span>
      <span className="control">{children}</span>
      {error && <span className="err">{error}</span>}
    </label>
  );
}

function Select({ value, onChange, options, placeholder = 'Select' }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => (typeof o === 'string'
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>))}
    </select>
  );
}

export default function OrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const cardIdRef = useRef(1);
  const cardRefs = useRef({});
  const [lookups, setLookups] = useState({});
  const [buyers, setBuyers] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [header, setHeader] = useState(emptyHeader);
  const [lineCards, setLineCards] = useState([{ id: 'line-1', values: emptyLine() }]);
  const [lineCardErrors, setLineCardErrors] = useState({});
  const [headerErrors, setHeaderErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const newCard = () => {
    cardIdRef.current += 1;
    return { id: `line-${cardIdRef.current}`, values: emptyLine() };
  };

  useEffect(() => {
    Promise.all([api.lookups(), api.buyers(), api.qualities()]).then(async ([l, b, q]) => {
      setLookups(l);
      setBuyers(b);
      setQualities(q);
      if (isEdit) {
        const o = await api.getOrder(id);
        setHeader({
          invoiceType: o.invoiceType || '', contractType: o.contractType || '', contractOrderRoute: o.contractOrderRoute || '',
          orderDate: o.orderDate || today(), buyerId: String(o.buyerId ?? ''), buyerAddress: o.buyerAddress || '',
          agent: o.agent || '', deliveryAddress: o.deliveryAddress || '', confirmationDate: o.confirmationDate || today(),
          shipmentMode: o.shipmentMode || '', deliveryTerms: o.deliveryTerms || '', paymentTerms: o.paymentTerms || '',
          gstType: o.gstType || '', salesCoordinator: o.salesCoordinator || '', bank: o.bank || '', soType: o.soType || '',
          sourcingBy: o.sourcingBy || '', buyerPo: o.buyerPo || '', termsAndCondition: o.termsAndCondition || '', remarks: o.remarks || '',
        });
        const loaded = (o.lines || []).map((line, idx) => ({
          id: `line-${idx + 1}`,
          values: {
            fabricType: line.fabricType ?? '', qualityId: String(line.qualityId ?? ''), buyerProduct: line.buyerProduct ?? '',
            fabricWidth: line.fabricWidth ?? '', inspectionType: line.inspectionType ?? '', quantity: line.quantity ?? '',
            uom: line.uom ?? '', pricePerUnit: line.pricePerUnit ?? '', gstPercent: line.gstPercent ?? '5',
            weaveType: line.weaveType ?? '', packingType: line.packingType ?? '', deliveryDate: line.deliveryDate ?? '',
            variationPercent: line.variationPercent ?? '', weavingQty: line.weavingQty ?? '', purchaseQty: line.purchaseQty ?? '',
            costingNumber: line.costingNumber ?? '',
          },
        }));
        cardIdRef.current = loaded.length || 1;
        setLineCards(loaded.length ? loaded : [newCard()]);
        setLineCardErrors({});
      } else {
        setHeader((h) => ({
          ...h,
          invoiceType: l.INVOICE_TYPE?.[0] ?? '',
          shipmentMode: l.SHIPMENT_MODE?.includes('BY ROAD') ? 'BY ROAD' : '',
          bank: l.BANK?.includes('HDFC BANK') ? 'HDFC BANK' : '',
        }));
      }
    }).catch((e) => setFormError(e.message));
  }, [id, isEdit]);

  const L = (k) => lookups[k] ?? [];
  const setH = (k) => (v) => setHeader((h) => ({ ...h, [k]: v }));

  const buyer = useMemo(() => buyers.find((b) => String(b.id) === String(header.buyerId)), [buyers, header.buyerId]);

  const onBuyer = (id) => {
    const b = buyers.find((x) => String(x.id) === String(id));
    setHeader((h) => ({
      ...h,
      buyerId: id,
      buyerAddress: b?.address ?? '',
      deliveryAddress: b?.deliveryAddresses?.[0] ?? '',
    }));
  };

  const isUntouchedCard = (values) => {
    const e = emptyLine();
    return Object.keys(e).every((k) => String(values[k] ?? '') === String(e[k] ?? ''));
  };

  const validateCard = (values) => {
    const errs = {};
    LINE_REQUIRED.forEach((k) => { if (values[k] === '' || values[k] == null) errs[k] = 'Required'; });
    if (Number(values.quantity) <= 0 && !errs.quantity) errs.quantity = 'Must be > 0';
    return errs;
  };

  const setCardValue = (cardId, key, value) => {
    setLineCards((cards) => cards.map((c) => c.id === cardId ? { ...c, values: { ...c.values, [key]: value } } : c));
    setLineCardErrors((prev) => {
      if (!prev[cardId] || !prev[cardId][key]) return prev;
      const nextCard = { ...prev[cardId] };
      delete nextCard[key];
      return { ...prev, [cardId]: nextCard };
    });
  };

  const onQuality = (cardId, qualityId) => {
    const q = qualities.find((x) => String(x.id) === String(qualityId));
    setLineCards((cards) => cards.map((c) => {
      if (c.id !== cardId) return c;
      return {
        ...c,
        values: {
          ...c.values,
          qualityId,
          buyerProduct: c.values.buyerProduct || q?.description || '',
          fabricWidth: c.values.fabricWidth || q?.defaultWidth || '',
        },
      };
    }));
    setLineCardErrors((prev) => {
      if (!prev[cardId]) return prev;
      const nextCard = { ...prev[cardId] };
      delete nextCard.qualityId;
      return { ...prev, [cardId]: nextCard };
    });
  };

  const addLine = () => {
    setFormError('');
    const nc = newCard();
    setLineCards((cards) => [...cards, nc]);
    setTimeout(() => cardRefs.current[nc.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const removeCard = (cardId) => {
    setLineCards((cards) => {
      if (cards.length <= 1) return cards;
      return cards.filter((c) => c.id !== cardId);
    });
    setLineCardErrors((prev) => {
      if (!prev[cardId]) return prev;
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  };

  const cardCalc = (values) => {
    const basic = (Number(values.quantity) || 0) * (Number(values.pricePerUnit) || 0);
    const total = basic * (1 + (Number(values.gstPercent) || 0) / 100);
    return { basic, total };
  };

  const save = async () => {
    setFormError('');
    const headerErrs = {};
    HEADER_REQUIRED.forEach((k) => {
      const v = header[k];
      if (v === '' || v == null) headerErrs[k] = `${HEADER_LABEL[k] || k} is required`;
    });

    const cardsToSend = lineCards.filter((c) => !isUntouchedCard(c.values));
    const cardErrs = {};
    let firstCardErrId = null;
    if (cardsToSend.length === 0) {
      const first = lineCards[0];
      if (first) {
        cardErrs[first.id] = validateCard(first.values);
        firstCardErrId = first.id;
      }
    } else {
      cardsToSend.forEach((c) => {
        const e = validateCard(c.values);
        if (Object.keys(e).length) {
          cardErrs[c.id] = e;
          if (!firstCardErrId) firstCardErrId = c.id;
        }
      });
    }

    setHeaderErrors(headerErrs);
    setLineCardErrors(cardErrs);

    const hasHeaderErr = Object.keys(headerErrs).length > 0;
    const hasCardErr = Object.keys(cardErrs).length > 0;
    if (hasHeaderErr || hasCardErr) {
      setFormError('Please fill the mandatory fields highlighted below.');
      if (hasHeaderErr) {
        window.scrollTo(0, 0);
      } else if (firstCardErrId && cardRefs.current[firstCardErrId]) {
        cardRefs.current[firstCardErrId].scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo(0, 0);
      }
      return;
    }

    const num = (v) => (v === '' ? null : Number(v));
    const payload = {
      ...header,
      buyerId: Number(header.buyerId),
      lines: cardsToSend.map((c) => {
        const l = c.values;
        return {
          ...l,
          qualityId: Number(l.qualityId),
          fabricWidth: num(l.fabricWidth), quantity: num(l.quantity), pricePerUnit: num(l.pricePerUnit),
          gstPercent: num(l.gstPercent), variationPercent: num(l.variationPercent),
          weavingQty: num(l.weavingQty), purchaseQty: num(l.purchaseQty),
        };
      }),
    };

    setSaving(true);
    try {
      const saved = isEdit ? await api.updateOrder(id, payload) : await api.createOrder(payload);
      navigate(`/orders/${saved.id}`);
    } catch (e) {
      const fields = e && e.fields ? e.fields : {};
      setFormError(e.message + (Object.keys(fields).length ? ': ' + Object.entries(fields).map(([k, v]) => `${k} ${v}`).join(', ') : ''));
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  const qLabel = (id) => qualities.find((q) => String(q.id) === String(id))?.sortNumber ?? id;
  const he = headerErrors;
  const canRemove = lineCards.length > 1;

return (
    <div className="order-form-page">
      <div className="po-form-header">
        <div className="po-sub-label">TRADING</div>
        <h2 className="po-list-title">DOMESTIC ORDER</h2>
        <button type="button" className="btn secondary" onClick={() => navigate('/domestic-orders/list')}>BACK</button>
      </div>
      <div className="po-breadcrumb"><Link to="/">Home</Link> {'>'} <Link to="/domestic-orders/list">Domestic Order List</Link></div>

      {formError && <div className="alert">{formError}</div>}

      <section className="card form-section">
        <h3 className="form-section-title">Order Details</h3>
        <div className="grid3">
          <Field label="Invoice Type" required error={he.invoiceType}>
            <Select value={header.invoiceType} onChange={setH('invoiceType')} options={L('INVOICE_TYPE')} />
          </Field>
          <Field label="Order Date" required error={he.orderDate}>
            <input type="date" value={header.orderDate} onChange={(e) => setH('orderDate')(e.target.value)} />
          </Field>
          <Field label="SO Type" required error={he.soType}>
            <Select value={header.soType} onChange={setH('soType')} options={L('SO_TYPE')} placeholder="Select SO Type" />
          </Field>

          <Field label="Agent / Broker" required error={he.agent}>
            <Select value={header.agent} onChange={setH('agent')} options={L('AGENT')} placeholder="Select Agent / Broker" />
          </Field>
          <Field label="Contract Type" required error={he.contractType}>
            <Select value={header.contractType} onChange={setH('contractType')} options={L('CONTRACT_TYPE')} placeholder="Select Contract Name" />
          </Field>
          <Field label="Contract Order Route" required error={he.contractOrderRoute}>
            <Select value={header.contractOrderRoute} onChange={setH('contractOrderRoute')} options={L('CONTRACT_ROUTE')} />
          </Field>

          <Field label="Confirmation Date" required error={he.confirmationDate}>
            <input type="date" value={header.confirmationDate} onChange={(e) => setH('confirmationDate')(e.target.value)} />
          </Field>
          <Field label="Sales Co-Ordinator" required error={he.salesCoordinator}>
            <Select value={header.salesCoordinator} onChange={setH('salesCoordinator')} options={L('SALES_COORDINATOR')} />
          </Field>
          <Field label="Sourcing By" required error={he.sourcingBy}>
            <Select value={header.sourcingBy} onChange={setH('sourcingBy')} options={L('SOURCING_BY')} placeholder="Select Sourcing By" />
          </Field>
        </div>
      </section>

      <section className="card form-section">
        <h3 className="form-section-title">Buyer Details</h3>
        <div className="grid3">
          <Field label="Buyer Name" required error={he.buyerId}>
            <Select value={header.buyerId} onChange={onBuyer} placeholder="Select Buyer"
              options={buyers.map((b) => ({ value: b.id, label: b.name }))} />
          </Field>
          <Field label="Buyer Address" required error={he.buyerAddress}>
            <input value={header.buyerAddress} onChange={(e) => setH('buyerAddress')(e.target.value)} />
          </Field>
          <Field label="Delivery Address" required error={he.deliveryAddress}>
            <Select value={header.deliveryAddress} onChange={setH('deliveryAddress')}
              options={buyer?.deliveryAddresses ?? []} placeholder="Delivery Address" />
          </Field>
          <Field label="GST Type" required error={he.gstType}>
            <Select value={header.gstType} onChange={setH('gstType')} options={L('GST_TYPE')} placeholder="Select Type" />
          </Field>
        </div>
      </section>

      <section className="card form-section">
        <h3 className="form-section-title">Logistics &amp; Terms</h3>
        <div className="grid3">
          <Field label="Mode Of Shipment" required error={he.shipmentMode}>
            <Select value={header.shipmentMode} onChange={setH('shipmentMode')} options={L('SHIPMENT_MODE')} />
          </Field>
          <Field label="Delivery Terms" required error={he.deliveryTerms}>
            <Select value={header.deliveryTerms} onChange={setH('deliveryTerms')} options={L('DELIVERY_TERMS')} placeholder="Select Delivery Terms" />
          </Field>
          <Field label="Terms Of Payment" required error={he.paymentTerms}>
            <Select value={header.paymentTerms} onChange={setH('paymentTerms')} options={L('PAYMENT_TERMS')} placeholder="Select Terms Of Payment" />
          </Field>

          <Field label="Bank" required error={he.bank}>
            <Select value={header.bank} onChange={setH('bank')} options={L('BANK')} />
          </Field>
          <Field label="Buyer PO">
            <input value={header.buyerPo} onChange={(e) => setH('buyerPo')(e.target.value)} />
          </Field>
          <Field label="Terms And Condition" required error={he.termsAndCondition}>
            <Select value={header.termsAndCondition} onChange={setH('termsAndCondition')} options={L('TERMS_AND_CONDITION')} placeholder="Select Terms And Condition" />
          </Field>

          <Field label="Remarks">
            <input value={header.remarks} onChange={(e) => setH('remarks')(e.target.value)} />
          </Field>
        </div>
      </section>

      <h3 className="section-title">Order Line Details</h3>
      <section className="card">
        <div className="card-actions">
          <button className="btn gold" type="button" onClick={addLine}>ADD DETAILS</button>
        </div>
        <div className="line-cards">
          {lineCards.map((card, index) => {
            const values = card.values;
            const le = lineCardErrors[card.id] || {};
            const { basic, total } = cardCalc(values);
            return (
              <div className="line-card" key={card.id} ref={(el) => { cardRefs.current[card.id] = el; }}>
                <div className="line-card-header">
                  <h4>Line {index + 1}</h4>
                  {canRemove && <button type="button" className="btn-remove" onClick={() => removeCard(card.id)}>Remove</button>}
                </div>
                <div className="grid3">
                  <Field label="Fabric Type" required error={le.fabricType}>
                    <Select value={values.fabricType} onChange={(v) => setCardValue(card.id, 'fabricType', v)} options={L('FABRIC_TYPE')} />
                  </Field>
                  <span /><span />

                  <Field label="Quality" required error={le.qualityId}>
                    <Select value={values.qualityId} onChange={(v) => onQuality(card.id, v)} placeholder="Select Sort Number"
                      options={qualities.map((q) => ({ value: q.id, label: q.sortNumber }))} />
                  </Field>
                  <Field label="Buyer Product" required error={le.buyerProduct}>
                    <input value={values.buyerProduct} onChange={(e) => setCardValue(card.id, 'buyerProduct', e.target.value)} />
                  </Field>
                  <Field label="Fabric Width" required error={le.fabricWidth}>
                    <input type="number" min="1" value={values.fabricWidth} onChange={(e) => setCardValue(card.id, 'fabricWidth', e.target.value)} />
                  </Field>

                  <Field label="Inspection Type" required error={le.inspectionType}>
                    <Select value={values.inspectionType} onChange={(v) => setCardValue(card.id, 'inspectionType', v)} options={L('INSPECTION_TYPE')} placeholder="Select Inspection Type" />
                  </Field>
                  <Field label="Quantity" required error={le.quantity}>
                    <input type="number" min="0" step="0.001" value={values.quantity} onChange={(e) => setCardValue(card.id, 'quantity', e.target.value)} />
                  </Field>
                  <Field label="UOM" required error={le.uom}>
                    <Select value={values.uom} onChange={(v) => setCardValue(card.id, 'uom', v)} options={L('UOM')} placeholder="Select UOM" />
                  </Field>

                  <Field label="Price Per Unit (Excl. GST)" required error={le.pricePerUnit}>
                    <input type="number" min="0" step="0.001" value={values.pricePerUnit} onChange={(e) => setCardValue(card.id, 'pricePerUnit', e.target.value)} />
                  </Field>
                  <Field label="Basic Amount">
                    <input readOnly value={fmt(basic)} />
                  </Field>
                  <Field label="Weave Type" required error={le.weaveType}>
                    <Select value={values.weaveType} onChange={(v) => setCardValue(card.id, 'weaveType', v)} options={L('WEAVE_TYPE')} placeholder="Select WeaveType" />
                  </Field>

                  <Field label="Packing Type" required error={le.packingType}>
                    <Select value={values.packingType} onChange={(v) => setCardValue(card.id, 'packingType', v)} options={L('PACKING_TYPE')} placeholder="Select Packing Type" />
                  </Field>
                  <Field label={`Total Amount (incl. ${values.gstPercent || 0}% GST)`}>
                    <input readOnly value={fmt(total)} />
                  </Field>
                  <Field label="Delivery Date (As per PO)" required error={le.deliveryDate}>
                    <input type="date" value={values.deliveryDate} onChange={(e) => setCardValue(card.id, 'deliveryDate', e.target.value)} />
                  </Field>

                  <Field label="Variation %" required error={le.variationPercent}>
                    <input type="number" min="0" step="0.01" value={values.variationPercent} onChange={(e) => setCardValue(card.id, 'variationPercent', e.target.value)} />
                  </Field>
                  <Field label="Weaving Qty">
                    <input type="number" min="0" step="0.001" value={values.weavingQty} onChange={(e) => setCardValue(card.id, 'weavingQty', e.target.value)} />
                  </Field>
                  <Field label="Purchase Qty" required error={le.purchaseQty}>
                    <input type="number" min="0" step="0.001" value={values.purchaseQty} onChange={(e) => setCardValue(card.id, 'purchaseQty', e.target.value)} />
                  </Field>

                  <Field label="Costing Number" required error={le.costingNumber}>
                    <input value={values.costingNumber} onChange={(e) => setCardValue(card.id, 'costingNumber', e.target.value)} />
                  </Field>
                  <Field label="GST %">
                    <input type="number" min="0" step="0.01" value={values.gstPercent} onChange={(e) => setCardValue(card.id, 'gstPercent', e.target.value)} />
                  </Field>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="form-action-bar">
        <button type="button" className="btn blue" onClick={save} disabled={saving}>{saving ? 'SAVING…' : 'SAVE'}</button>
        <button type="button" className="btn gold" onClick={() => navigate('/domestic-orders/list')}>CANCEL</button>
      </div>
    </div>
  );
}
