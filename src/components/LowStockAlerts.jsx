import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiChevronsRight } from 'react-icons/fi';

function LowStockAlerts() {
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                const response = await api.get('/api/products/low-stock');
                setLowStockProducts(response.data);
            } catch (error) {
                console.error("Could not fetch low stock alerts.");
            } finally {
                setLoading(false);
            }
        };
        fetchLowStock();
    }, []);

    // Jab tak data load ho raha hai, ek chota sa skeleton dikhayen
    if (loading) {
        return (
            <div className="card bg-base-100 shadow-md border border-base-300/50">
                <div className="card-body">
                    <div className="skeleton h-6 w-1/2 mb-4"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-3/4"></div>
                </div>
            </div>
        );
    }
    
    // Agar koi low stock product nahi hai, to kuch bhi render na karen
    if (lowStockProducts.length === 0) {
        return null; 
    }

    return (
        // VVIP Card design with a top border for emphasis
        <div className="card bg-base-100 shadow-md border border-base-300/50 border-t-4 border-warning">
            <div className="card-body p-4">
                {/* Card Title */}
                <div className="card-title text-base font-bold flex items-center gap-2">
                    <FiAlertTriangle className="text-warning" size={20}/>
                    <span>Low Stock Alerts</span>
                </div>

                {/* Scrollable List of Products */}
                <ul className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-2">
                    {lowStockProducts.map(p => (
                        <li key={p.id} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-base-200">
                            <span className="truncate font-medium">{p.name}</span>
                            <span className="badge badge-warning font-bold">{p.quantity} left</span>
                        </li>
                    ))}
                </ul>

                {/* Card Actions */}
                <div className="card-actions justify-end mt-2">
                    <Link to="/products" className="btn btn-ghost btn-sm text-primary">
                        Manage Stock
                        <FiChevronsRight/>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LowStockAlerts;