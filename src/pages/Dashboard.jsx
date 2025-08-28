import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Components
import LowStockAlerts from '../components/LowStockAlerts';
import TopProductsCard from '../components/TopProductsCard';
import RecentSalesCard from '../components/RecentSalesCard';
import SalesChart from '../components/SalesChart';

// Icons
import { FiBox, FiArchive, FiDollarSign, FiShoppingCart, FiCamera } from 'react-icons/fi';

// A reusable component for individual stat cards
const StatCard = ({ icon, title, value, colorClass }) => (
  <div className="card bg-base-200/50 hover:bg-base-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
    <div className="card-body flex-row items-center p-4 sm:p-6">
      <div className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-opacity-20 ${colorClass}`}>
        {icon}
      </div>
      <div className="ml-4">
        <h2 className="text-sm sm:text-base font-medium text-base-content/70">{title}</h2>
        <p className="text-xl sm:text-3xl font-bold font-sans">{value}</p>
      </div>
    </div>
  </div>
);

// A reusable component for Quick Action buttons
const ActionCard = ({ icon, title, description, onClick, colorClass }) => (
    <div 
        className={`card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out hover:-translate-y-1 cursor-pointer border-l-4 ${colorClass}`}
        onClick={onClick}
    >
        <div className="card-body flex-row items-center gap-4">
            <div>{icon}</div>
            <div>
                <h2 className="card-title text-xl font-bold">{title}</h2>
                <p className="text-base-content/70 text-sm">{description}</p>
            </div>
        </div>
    </div>
);


function Dashboard() {
  const { user, businessSettings } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalProducts: 0, totalStock: 0, totalValue: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, chartRes] = await Promise.all([
          api.get('/api/dashboard'),
          api.get('/api/reports/sales-over-time'),
        ]);
        
        if(dashRes.data.stats) setStats(dashRes.data.stats);
        if(dashRes.data.topProducts) setTopProducts(dashRes.data.topProducts);
        if(dashRes.data.recentSales) setRecentSales(dashRes.data.recentSales);
        if(chartRes.data) setChartData(chartRes.data);

      } catch (error) {
        console.error("Dashboard data fetch karne mein masla:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const displayName = businessSettings?.business_name || user?.username;

  return (
    <main className="p-4 sm:p-6 space-y-6">
      {/* VVIP Page Header */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight">
            Welcome back, {user.username}!
          </h1>
          <p className="text-base-content/70 mt-1">
            Here's the summary for <span className='font-semibold text-primary'>{displayName}</span>.
          </p>
        </div>
      </header>

      {/* VVIP Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
            icon={<FiShoppingCart size={40} className="text-primary"/>}
            title="Start New Sale"
            description="Go to the POS screen to create bills."
            onClick={() => navigate('/new-sale')}
            colorClass="border-primary"
        />
        <ActionCard
            icon={<FiCamera size={40} className="text-secondary"/>}
            title="Scan Product"
            description="Use the camera to quickly find products."
            onClick={() => navigate('/scanner')}
            colorClass="border-secondary"
        />
      </section>
      
      {/* VVIP Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={<FiBox className="text-4xl text-primary" />}
          title="Total Products"
          value={stats.totalProducts || 0}
          colorClass="bg-primary"
        />
        <StatCard 
          icon={<FiArchive className="text-4xl text-secondary" />}
          title="Total Stock (Units)"
          value={stats.totalStock || 0}
          colorClass="bg-secondary"
        />
        <StatCard 
          icon={<FiDollarSign className="text-4xl text-accent" />}
          title="Total Stock Value"
          value={`Rs. ${Number(stats.totalValue || 0).toLocaleString()}`}
          colorClass="bg-accent"
        />
      </section>

      {/* VVIP Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <div className="card bg-base-100 shadow-md border border-base-300/50">
                <div className="card-body">
                    <h2 className="card-title text-xl font-semibold">Sales Trend</h2>
                    <div className="w-full h-72 mx-auto">
                        {chartData.length > 0 ? ( <SalesChart chartData={chartData} /> ) : 
                        ( <div className="flex items-center justify-center h-full"><p>No sales data available.</p></div> )}
                    </div>
                </div>
            </div>
            <TopProductsCard topProducts={topProducts} />
        </div>
        <div className="space-y-6">
          <LowStockAlerts />
          <RecentSalesCard recentSales={recentSales} />
        </div>
      </section>
    </main>
  );
}

export default Dashboard;