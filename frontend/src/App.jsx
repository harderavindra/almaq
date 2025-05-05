import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './routes/ProtectedRoute';
import NewUserPage from './pages/NewUserPage';
import AdminLayout from './components/layout/AdminLayout';
import FileUpload from './pages/FileUpload';
import UsersPage from './pages/UsersPage';
import OrderCreatePage from './pages/OrderCreatePage';
import OrderListPage from './pages/OrderListPage';
import OrderViewPage from './pages/OrderViewPage';

import DeliveredChalanPage from './pages/DeliveredChalanPage';
function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/new-user" element={<NewUserPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/order" element={<OrderCreatePage />} />
              <Route path="/orders" element={<OrderListPage />} />
              <Route path="/orders/:id" element={<OrderViewPage />} />
              <Route path="/chalan" element={<DeliveredChalanPage />} />

              {/* <Route path="/users/:userId" element={<ProfilePage />} /> */}
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
