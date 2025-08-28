import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { CSVLink } from 'react-csv';
import { FiCalendar, FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingBag, FiPrinter, FiDownload } from 'react-icons/fi';

// === VVIP Helper Component for Report Stats ===
const ReportStatCard = ({ title, value, description, icon, colorClass }) => (
    <div className={`card bg-base-200 shadow-md`}>
        <div className="card-body">
            <div className="flex items-start justify-between">
                <div>
                    <p className="stat-title text-base-content/70">{title}</p>
                    <p className={`stat-value text-2xl font-bold ${colorClass}`}>{value}</p>
                    {description && <p className={`stat-desc text-xs ${colorClass}`}>{description}</p>}
                </div>
                <div className={`p-3 rounded-full bg-opacity-20 ${colorClass?.replace('text-', 'bg-')}`}>
                    {icon}
                </div>
            </div>
        </div>
    </div>
);


function Reports() {
    // Default start date ko is mahine ki pehli tareekh par set karein
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [reportData, setReportData] = useState(null);
    const [detailedSales, setDetailedSales] = useState([]);
    const [loading, setLoading] = useState(true);

    // *** VVIP REFINEMENT: Report ab date change par khud-b-khud generate hogi ***
    useEffect(() => {
        const handleGenerateReport = async () => {
            setLoading(true);
            try {
                const response = await api.get('/api/reports/sales', {
                    params: { startDate, endDate: `${endDate}T23:59:59` }
                });
                setReportData(response.data.summary);
                setDetailedSales(response.data.details);
            } catch (error) {
                toast.error("Failed to generate report.");
                setReportData(null); // Error anay par purana data clear karein
                setDetailedSales([]);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            handleGenerateReport();
        }, 1000); // 1 second ke delay ke baad report generate ho

        return () => clearTimeout(timer); // Cleanup
    }, [startDate, endDate]);

    const handlePrint = () => {
        window.print();
    };

    const csvHeaders = [
        { label: "Sale ID", key: "id" },
        { label: "Customer Name", key: "customer_name" },
        { label: "Total Amount", key: "total_amount" },
        { label: "Date", key: "sale_date" },
        { label: "Sold By", key: "username" }
    ];

    return (
        <div className="space-y-6 print:space-y-0">
            <header>
                <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight">Sales & Profit Report</h1>
                <p className="text-base-content/70 mt-1">Select a date range to generate a detailed report.</p>
            </header>
            
            {/* Control Panel */}
            <div className="card w-full bg-base-100 shadow-md border border-base-300/50 print:hidden">
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Start Date</span></label>
                            <input type="date" className="input input-bordered w-full" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">End Date</span></label>
                            <input type="date" className="input input-bordered w-full" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Report Content */}
            {loading ? (
                <div className="text-center p-16"><span className="loading loading-spinner loading-lg"></span></div>
            ) : reportData ? (
                <div id="report-content" className="card w-full bg-base-100 shadow-md border border-base-300/50">
                    <div className="card-body">
                        <div className="flex justify-between items-center">
                            <h2 className="card-title print:text-black">Report for {startDate} to {endDate}</h2>
                            <div className="space-x-2 print:hidden">
                                <button className="btn btn-ghost btn-sm" onClick={handlePrint}><FiPrinter/> Print</button>
                                <CSVLink data={detailedSales} headers={csvHeaders} filename={`Sales_Report_${startDate}_to_${endDate}.csv`} className="btn btn-ghost btn-sm"><FiDownload/> Download CSV</CSVLink>
                            </div>
                        </div>
                        
                        {/* VVIP Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                            <ReportStatCard title="Total Sales" value={reportData.total_sales} icon={<FiShoppingBag size={24}/>} />
                            <ReportStatCard title="Total Revenue" value={`Rs. ${Number(reportData.total_revenue).toLocaleString()}`} description={`Discount: Rs. ${Number(reportData.total_discount).toLocaleString()}`} icon={<FiDollarSign size={24}/>} colorClass="text-info" />
                            <ReportStatCard title="Total Cost" value={`Rs. ${Number(reportData.total_cost).toLocaleString()}`} icon={<FiTrendingDown size={24}/>} colorClass="text-error" />
                            <ReportStatCard title="Gross Profit" value={`Rs. ${Number(reportData.gross_profit).toLocaleString()}`} icon={<FiTrendingUp size={24}/>} colorClass="text-success" />
                        </div>

                        <div className="divider mt-8">Detailed Transactions</div>
                        
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full text-sm print:text-black">
                                <thead>
                                    <tr>
                                        <th>ID</th><th>Customer</th><th>Total Amount</th><th>Date</th><th>Sold By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailedSales.length > 0 ? detailedSales.map(sale => (
                                        <tr key={sale.id}>
                                            <td>#{sale.id}</td>
                                            <td>{sale.customer_name || 'N/A'}</td>
                                            <td>Rs. {Number(sale.total_amount).toFixed(2)}</td>
                                            <td>{new Date(sale.sale_date).toLocaleString()}</td>
                                            <td>{sale.username}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className='text-center p-4'>No sales in this date range.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default Reports;