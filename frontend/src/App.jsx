import { Navigate, Route, Routes } from 'react-router-dom';
import NavigationHeader from './components/NavigationHeader.jsx';
import OrderList from './pages/OrderList.jsx';
import OrderForm from './pages/OrderForm.jsx';
import OrderView from './pages/OrderView.jsx';
import Dispatch from './pages/Dispatch.jsx';
import Reports from './pages/Reports.jsx';
import PurchaseOrderList from './pages/PurchaseOrderList.jsx';
import PurchaseOrderForm from './pages/PurchaseOrderForm.jsx';
import PurchaseOrderView from './pages/PurchaseOrderView.jsx';

export default function App() {
  return (
    <>
      <NavigationHeader />
      <main className="page">
        <Routes>
          <Route path="/" element={<Navigate to="/domestic-orders/list" replace />} />
          <Route path="/domestic-orders/list" element={<OrderList />} />
          <Route path="/domestic-orders/new" element={<OrderForm />} />
          <Route path="/domestic-orders/:id/edit" element={<OrderForm />} />
          <Route path="/domestic-orders/:id/dispatch" element={<Dispatch />} />
          <Route path="/domestic-orders/:id" element={<OrderView />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/domestic" element={<Reports />} />
          <Route path="/reports/purchase" element={<Reports />} />
          <Route path="/purchase/orders" element={<PurchaseOrderList />} />
          <Route path="/purchase/new" element={<PurchaseOrderForm />} />
          <Route path="/purchase/:id/edit" element={<PurchaseOrderForm />} />
          <Route path="/purchase/:id" element={<PurchaseOrderView />} />
        </Routes>
      </main>
    </>
  );
}
