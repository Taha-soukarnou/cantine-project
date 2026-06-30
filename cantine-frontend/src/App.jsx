import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Menus from './pages/student/Menus';
import Order from './pages/student/Order';
import MyOrders from './pages/student/MyOrders';
import Dashboard from './pages/admin/Dashboard';
import MenusAdmin from './pages/admin/MenusAdmin';
import OrdersAdmin from './pages/admin/OrdersAdmin';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Routes Student */}
                    <Route path="/menus" element={
                        <PrivateRoute roles={['student']}>
                            <Menus />
                        </PrivateRoute>
                    } />
                    <Route path="/order" element={
                        <PrivateRoute roles={['student']}>
                            <Order />
                        </PrivateRoute>
                    } />
                    <Route path="/my-orders" element={
                        <PrivateRoute roles={['student']}>
                            <MyOrders />
                        </PrivateRoute>
                    } />

                    {/* Routes Admin */}
                    <Route path="/dashboard" element={
                        <PrivateRoute roles={['admin', 'agent']}>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/admin/menus" element={
                        <PrivateRoute roles={['admin', 'agent']}>
                            <MenusAdmin />
                        </PrivateRoute>
                    } />
                    <Route path="/admin/orders" element={
                        <PrivateRoute roles={['admin', 'agent']}>
                            <OrdersAdmin />
                        </PrivateRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;