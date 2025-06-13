import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './routes/ProtectedRoute';
import NewUserPage from './pages/NewUserPage';
import AdminLayout from './components/layout/AdminLayout';
import UsersPage from './pages/UsersPage';
import OrderCreatePage from './pages/OrderCreatePage';
import OrderListPage from './pages/OrderListPage';
import OrderViewPage from './pages/OrderViewPage';
import DeliveredChalanPage from './pages/DeliveredChalanPage';
import ChallanCreatePage from './pages/ChallanCreatePage';
import ChallanListPage from './pages/ChallanListPage';
import ChallanViewPage from './pages/ChallanViewPage';
import MasterPage from './pages/MasterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import ViewInvoicePage from './pages/ViewInvoicePage';
import PrintLayout from './components/layout/PrintLayout.';
import UpdatePayment from './pages/UpdatePayment';
import InvoiceList from './pages/InvoiceList';
import OrderEditPage from './pages/OrderEditPage';
import ChallanEditPage from './pages/ChallanEditPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<PrintLayout />}>
             <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
              
                <Route path="/view-invoice/:id/" element={<ViewInvoicePage />} />

              </Route>
            </Route>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<DashboardPage />} />
                <Route path="/payment-invoice/:id/" element={<UpdatePayment />} />
              <Route path="/new-user" element={<NewUserPage />} />
                <Route path="/invoices" element={<InvoiceList />} />

              <Route element={<ProtectedRoute allowedRoles={['admin','manager']} />}>
                <Route path="/users" element={<UsersPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                <Route path="/add-challan" element={<ChallanCreatePage />} />
                <Route path="/create-invoice/:orderId/:farmerId" element={<CreateInvoicePage />} />
                <Route path="/view-invoice/:id/" element={<ViewInvoicePage />} />

              </Route>


              <Route path="/add-order" element={<OrderCreatePage />} />
              <Route path="/orders" element={<OrderListPage />} />
              <Route path="/orders/:id" element={<OrderViewPage />} />
              <Route path="/orders/:orderId/edit" element={<OrderEditPage />} />
              <Route path="/challan" element={<DeliveredChalanPage />} />
              <Route path="/challans" element={<ChallanListPage />} />
              <Route path="/challans/:challanId" element={<ChallanViewPage />} />
              <Route path="/challans/:challanId/edit" element={<ChallanEditPage />} />
              <Route path="/master/:tab?" element={<MasterPage />} />
              <Route path="/download" element={<DeliveredChalanPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
