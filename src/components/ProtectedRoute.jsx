import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');

    if (!token) {
        // Agar token nahi hai, to login page par bhej do
        return <Navigate to="/login" />;
    }

    // Agar token hai, to jo page user dekhna chahta hai, woh dikha do
    return children;
}

export default ProtectedRoute;