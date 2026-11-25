import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, fmt, fmtDate, PO_STATUS_LABEL } from '../api.js';

const Item = ({ label, value }) => (
  <div className="item"><span>{label}</span><strong>{value || '—'}</strong></div>
);

export default function PurchaseOrderView() {
  const { id } = useParams();
  const [o, setO] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPurchaseOrder(id)
      .then((data) => {
        console.log('PurchaseOrderView data:', data);
        setO(data);
      })
      .catch((e) => {
        console.error('PurchaseOrderView error:', e);
        setError(e.message);
      });
  }, [id]);

  if (error) return <div className="alert">{error}</div>;
  if (!o) return <p>Loading…</p>;

  return (
    <div>
      <div className="title-row">
        <h1>Purchase Order</h1>
        <h2>{o.poNumber}</h2>
        <div style={{ justifySelf: 'end', display: 'flex', gap: 8 }}>
          <Link to="/purchase/orders" className="btn secondary">Back</Link>
        </div>
      </div>

      <section className="card">
        <div className="grid3 view">
          <Item label="Status" value={<span className={`status-text s-${o.status}`}>{PO_STATUS_LABEL[o.status]}</span>} />
          <Item label="PO Date" value={fmtDate(o.poDate)} />
          <Item label="PO Number" value={o.poNumber} />
          <Item label="SO Number" value={o.soNumber} />
          <Item label="Vendor" value={o.vendorName} />
          <Item label="Agent" value={o.agent} />
          <Item label="Quality" value={o.quality} />
          <Item label="Sales Address" value={o.salesAddress} />
          <Item label="Total Quantity" value={fmt(o.totalQuantity, 2)} />
          <Item label="Approver Status" value={o.approverStatus} />
        </div>
      </section>

      <section className="card">
        <h3 className="form-section-title">Items</h3>
        <div className="table-wrap dark-head">
          <table className="order-table po-table">
            <thead>
              <tr>
                <th className="col-center">SL NO.</th>
                <th>QUALITY</th>
                <th className="col-num">QUANTITY</th>
                <th>UOM</th>
                <th className="col-num">UNIT PRICE</th>
                <th className="col-num">GST %</th>
                <th className="col-num">BASIC AMOUNT</th>
                <th className="col-num">GST AMOUNT</th>
                <th className="col-num">TOTAL AMOUNT</th>
                <th>DELIVERY TERMS</th>
                <th>DELIVERY DATE</th>
                <th>CERTIFICATIONS</th>
              </tr>
            </thead>
            <tbody>
              {(o.items || []).map((item, idx) => (
                <tr key={item.id}>
                  <td className="col-center">{idx + 1}</td>
                  <td>{item.quality}</td>
                  <td className="col-num">{fmt(item.quantity, 2)}</td>
                  <td>{item.uom}</td>
                  <td className="col-num">{fmt(item.unitPrice, 2)}</td>
                  <td className="col-num">{fmt(item.gstPercent, 2)}</td>
                  <td className="col-num">{fmt(item.basicAmount, 2)}</td>
                  <td className="col-num">{fmt(item.gstAmount, 2)}</td>
                  <td className="col-num">{fmt(item.totalAmount, 2)}</td>
                  <td>{item.deliveryTerms}</td>
                  <td>{fmtDate(item.deliveryDate)}</td>
                  <td>{(item.certifications || []).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}