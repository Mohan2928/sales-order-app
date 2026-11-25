import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, fmt, fmtDate, fmtQtyByUom, STATUS_LABEL } from '../api.js';

const Item = ({ label, value }) => (
  <div className="item"><span>{label}</span><strong>{value || '—'}</strong></div>
);

export default function OrderView() {
  const { id } = useParams();
  const [o, setO] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getOrder(id).then(setO).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="alert">{error}</div>;
  if (!o) return <p>Loading…</p>;

  return (
    <div>
      <div className="title-row">
        <h1>Sales Order</h1>
        <h2>{o.orderNo}</h2>
        <div style={{ justifySelf: 'end', display: 'flex', gap: 8 }}>
          {o.status === 'MOVED_TO_PRODUCTION' && <Link to={`/orders/${o.id}/dispatch`} className="btn green">Dispatch</Link>}
          <Link to="/orders" className="btn secondary">Back</Link>
        </div>
      </div>

      <section className="card">
        <div className="grid3 view">
          <Item label="Status" value={<span className={`status-text s-${o.status}`}>{STATUS_LABEL[o.status]}</span>} />
          <Item label="Order Date" value={fmtDate(o.orderDate)} />
          <Item label="Confirmation Date" value={fmtDate(o.confirmationDate)} />
          <Item label="Invoice Type" value={o.invoiceType} />
          <Item label="Contract Type" value={o.contractType} />
          <Item label="Contract Order Route" value={o.contractOrderRoute} />
          <Item label="Buyer" value={o.buyerName} />
          <Item label="Buyer Address" value={o.buyerAddress} />
          <Item label="Delivery Address" value={o.deliveryAddress} />
          <Item label="Agent / Broker" value={o.agent} />
          <Item label="Mode Of Shipment" value={o.shipmentMode} />
          <Item label="Delivery Terms" value={o.deliveryTerms} />
          <Item label="Terms Of Payment" value={o.paymentTerms} />
          <Item label="GST Type" value={o.gstType} />
          <Item label="Sales Co-Ordinator" value={o.salesCoordinator} />
          <Item label="Bank" value={o.bank} />
          <Item label="SO Type" value={o.soType} />
          <Item label="Sourcing By" value={o.sourcingBy} />
          <Item label="Buyer PO" value={o.buyerPo} />
          <Item label="Terms And Condition" value={o.termsAndCondition} />
          <Item label="Remarks" value={o.remarks} />
        </div>
      </section>

      <h3 className="section-title">Order Details</h3>
      <div className="table-wrap dark-head">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Sort</th><th>Quality</th><th>Buyer Product</th><th>Width</th><th>Qty</th><th>Rate</th>
              <th>Basic</th><th>GST %</th><th>Total</th><th>Weave</th><th>Packing</th><th>Delivery</th><th>Costing No</th>
            </tr>
          </thead>
          <tbody>
            {o.lines.map((l, i) => (
              <tr key={l.id}>
                <td>{i + 1}</td>
                <td>{l.sortNumber}</td>
                <td>{l.qualityDescription}</td>
                <td>{l.buyerProduct}</td>
                <td>{l.fabricWidth}</td>
                <td className="num">{fmt(l.quantity, 3)} {l.uom}</td>
                <td className="num">{fmt(l.pricePerUnit, 3)}</td>
                <td className="num">{fmt(l.basicAmount)}</td>
                <td className="num">{fmt(l.gstPercent)}</td>
                <td className="num">{fmt(l.totalAmount)}</td>
                <td>{l.weaveType}</td>
                <td>{l.packingType}</td>
                <td>{fmtDate(l.deliveryDate)}</td>
                <td>{l.costingNumber}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="5">Total</td>
              <td className="num">{fmtQtyByUom(o.lines, 'quantity')}</td>
              <td colSpan="3" />
              <td className="num">{fmt(o.totalAmount)}</td>
              <td colSpan="4" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
