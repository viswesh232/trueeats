import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import Signup        from './pages/Signup';
import Login         from './pages/Login';
import Home          from './pages/Home';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Orders        from './pages/Orders';

import AdminDashboard  from './pages/AdminDashboard';
import PermissionChange from './pages/PermissionChange';
import EditMenu        from './pages/EditMenu';
import LiveOrders      from './pages/LiveOrders';
import RevenueStats    from './pages/RevenueStats';
import DeliveryInfo    from './pages/DeliveryInfo';
import BillGenerator   from './pages/BillGenerator';
import CustomerSearch  from './pages/CustomerSearch';
import CustomerProfile from './pages/CustomerProfile';
import OrderDetail     from './pages/OrderDetails';
import SystemSettings  from './pages/AdminSettings';
import PaymentsPage from './pages/PaymentsPage';
import VerifyEmail from './pages/VerifyEmail';
import MyProfile from './pages/MyProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
const AdminRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (!user)              return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/"     replace />;
    return children;
};

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public */}
                <Route path="/"        element={<Home />} />
                <Route path="/login"   element={<Login />} />
                <Route path="/signup"  element={<Signup />} />

                {/* Customer — protected */}
                <Route path="/cart"     element={<Cart />} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />

                {/* Admin */}
                <Route path="/dashboard"              element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/permissions"      element={<AdminRoute><PermissionChange /></AdminRoute>} />
                <Route path="/admin/edit-menu"        element={<AdminRoute><EditMenu /></AdminRoute>} />
                <Route path="/admin/orders"           element={<AdminRoute><LiveOrders /></AdminRoute>} />
                <Route path="/admin/revenue"          element={<AdminRoute><RevenueStats /></AdminRoute>} />
                <Route path="/admin/delivery"         element={<AdminRoute><DeliveryInfo /></AdminRoute>} />
                <Route path="/admin/bills"            element={<AdminRoute><BillGenerator /></AdminRoute>} />
                <Route path="/admin/customer-search"  element={<AdminRoute><CustomerSearch /></AdminRoute>} />
                <Route path="/admin/customer/:id"     element={<AdminRoute><CustomerProfile /></AdminRoute>} />
                <Route path="/admin/order/view/:id"   element={<AdminRoute><OrderDetail /></AdminRoute>} />
                <Route path="/admin/settings"         element={<AdminRoute><SystemSettings /></AdminRoute>} />
                <Route path="/admin/payments"         element={<AdminRoute><PaymentsPage /></AdminRoute>} />
                <Route path="/auth/verify-email"      element={<VerifyEmail />} />
                <Route path="/profile"                element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
                <Route path="/forgot-password"        element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;