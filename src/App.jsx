import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout & Components
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';

// Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import SalesHistory from './pages/SalesHistory';
import Reports from './pages/Reports';
import Scanner from './pages/Scanner';
import NewSale from './pages/NewSale';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import UserManagement from './pages/UserManagement'; // Naya page import karein

function App() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const confirmLogout = () => {
    logout();
    navigate('/login');
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <dialog id="logout_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Logout</h3>
          <p className="py-4">Are you sure you want to logout?</p>
          <div className="modal-action">
            <form method="dialog" className='space-x-2'>
              <button className="btn">Cancel</button>
              <button className="btn btn-error" onClick={confirmLogout}>Logout</button>
            </form>
          </div>
        </div>
      </dialog>

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/sales-history" element={<SalesHistory />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/new-sale" element={<NewSale />} />
                <Route path="/settings" element={<Settings />} />
                {/* Naya page ka route add karein */}
                <Route path="/user-management" element={<UserManagement />} /> 
              </Route>
            </Routes>
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default App;