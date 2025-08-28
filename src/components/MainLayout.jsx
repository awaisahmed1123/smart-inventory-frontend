import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { 
    FiGrid, FiPackage, FiUsers, FiUserCheck, 
    FiBarChart2, FiFileText, FiSettings, FiLogOut, FiBox, FiShield
} from 'react-icons/fi';

// Helper Component for Navigation Links
const NavLink = ({ to, icon, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <li>
            <Link to={to} className={`${isActive ? 'active font-semibold' : ''} flex items-center py-2.5`}>
                {icon}
                <span className="ml-3">{children}</span>
            </Link>
        </li>
    );
};

function MainLayout() {
    const { user, businessSettings } = useAuth();
    const location = useLocation();
    
    const handleLogout = () => {
        document.getElementById('logout_modal').showModal();
    };

    const getPageTitle = () => {
        const path = location.pathname.replace('/', '');
        if (path === '') return 'Dashboard';
        const title = path.split('/')[0].replace(/-/g, ' ');
        return title.charAt(0).toUpperCase() + title.slice(1);
    };

    const displayName = businessSettings?.business_name || user?.username;

    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            
            <aside className="drawer-side z-20 lg:w-56">
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu p-4 min-h-full bg-base-200 text-base-content flex flex-col gap-1">
                    <li className="py-2 mb-2">
                        <Link to="/" className="flex items-center gap-3">
                             <FiBox className="w-8 h-8 text-primary flex-shrink-0"/>
                             <span className="text-xl font-extrabold font-display leading-tight">Smart Inventory</span>
                        </Link>
                    </li>
                    
                    {/* === YAHAN TABDEELI KI GAYI HAI: Links ko role ke hisab se manage kiya gaya hai === */}

                    {/* --- User ke liye aam links --- */}
                    <NavLink to="/" icon={<FiGrid size={20} />}>Dashboard</NavLink>
                    <NavLink to="/products" icon={<FiPackage size={20} />}>Products</NavLink>
                    <NavLink to="/sales-history" icon={<FiBarChart2 size={20} />}>Sales History</NavLink>
                    
                    {/* --- Sirf Admin ke liye links --- */}
                    {user?.role === 'admin' && (
                        <>
                            <div className="divider my-1"></div>
                            <NavLink to="/reports" icon={<FiFileText size={20} />}>Reports</NavLink>
                            <NavLink to="/customers" icon={<FiUsers size={20} />}>Customers</NavLink>
                            <NavLink to="/suppliers" icon={<FiUserCheck size={20} />}>Suppliers</NavLink>
                            <NavLink to="/user-management" icon={<FiShield size={20} />}>User Management</NavLink>
                        </>
                    )}

                    <div className="flex-grow"></div>

                    <li className="mt-auto">
                        <div className="dropdown dropdown-top w-full">
                            <label tabIndex={0} className="btn btn-ghost btn-block flex justify-start items-center p-2 h-auto text-left">
                                <div className="flex-grow">
                                    <p className="font-bold text-sm truncate">{displayName}</p>
                                    <p className="text-xs opacity-60">{user?.role}</p>
                                </div>
                            </label>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mb-2">
                                <li><Link to="/settings"><FiSettings /> Settings</Link></li>
                                <li><a onClick={handleLogout}><FiLogOut /> Logout</a></li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </aside>

            {/* Main Content Area */}
            <main className="drawer-content flex flex-col bg-base-100">
                <header className="navbar bg-base-100/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
                    <div className="flex-1 items-center">
                        <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost drawer-button lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </label>
                        <h1 className="text-2xl font-bold ml-2 hidden sm:block">{getPageTitle()}</h1>
                    </div>
                    <div className="flex-none gap-4">
                        <ThemeToggle />
                    </div>
                </header>
                <div className="flex-grow p-4 sm:p-6 w-full max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default MainLayout;