import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import NavigationHeader from './components/NavigationHeader.jsx';
import OrderList from './pages/OrderList.jsx';
import OrderForm from './pages/OrderForm.jsx';
import OrderView from './pages/OrderView.jsx';
import Dispatch from './pages/Dispatch.jsx';
import Reports from './pages/Reports.jsx';
import PurchaseOrderList from './pages/PurchaseOrderList.jsx';
import PurchaseOrderForm from './pages/PurchaseOrderForm.jsx';
import PurchaseOrderView from './pages/PurchaseOrderView.jsx';
import Login from './pages/Login.jsx';
import { isAuthenticated } from './auth.js';

function ProtectedApp() {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
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
          <Route path="*" element={<Navigate to="/domestic-orders/list" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  );
}