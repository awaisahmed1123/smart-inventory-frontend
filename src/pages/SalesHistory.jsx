import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { FiPrinter, FiEye } from 'react-icons/fi';

function SalesHistory() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState(null);
    const [businessInfo, setBusinessInfo] = useState({ business_name: 'Smart Inventory', address: '', phone: '' });
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        const fetchSalesAndSettings = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);

                const [salesRes, settingsRes] = await Promise.all([
                    api.get(`/api/sales?${params.toString()}`),
                    api.get('/api/settings/business')
                ]);
                
                setSales(salesRes.data);
                if (settingsRes.data) setBusinessInfo(settingsRes.data);
            } catch (error) {
                toast.error("Failed to fetch sales data.");
            } finally {
                setLoading(false);
            }
        };
        
        const delayDebounceFn = setTimeout(() => { fetchSalesAndSettings(); }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleViewDetails = async (saleFromList) => {
        try {
            setSelectedSale(saleFromList); 
            document.getElementById('sale_details_modal').showModal();
            
            const response = await api.get(`/api/sales/${saleFromList.id}`);
            setSelectedSale(prev => ({ ...prev, items: response.data.items }));
        } catch (error) {
            toast.error("Failed to fetch sale details.");
        }
    };
    
    const handlePrint = () => {
        const printContent = document.getElementById('receipt-content').innerHTML;
        const newWindow = window.open('', '', 'height=600, width=400');
        
        newWindow.document.write('<html><head><title>Print Receipt</title>');
        newWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        newWindow.document.write(`
            <style>
                body { font-family: monospace; font-size: 12px; }
                @media print { body { -webkit-print-color-adjust: exact; } }
            </style>
        `);
        newWindow.document.write('<body class="p-2 bg-white text-black">');
        newWindow.document.write(printContent);
        newWindow.document.write('</body></html>');
        newWindow.document.close();
        
        newWindow.onload = () => {
            newWindow.print();
            newWindow.close();
        };
    };

    const renderContent = () => {
        if (loading) {
            return (
                <tr>
                    <td colSpan="6" className="text-center p-8">
                        <span className="loading loading-spinner loading-lg"></span>
                    </td>
                </tr>
            );
        }
        if (sales.length === 0) {
            return (
                <tr>
                    <td colSpan="6" className="text-center p-8 text-base-content/60">
                        No sales found.
                    </td>
                </tr>
            );
        }
        return sales.map(sale => (
            <tr key={sale.id} className="hover">
                <td className="font-bold">#{sale.id}</td>
                <td>{sale.customer_name || 'N/A'}</td>
                <td className='font-mono font-semibold'>Rs. {Number(sale.total_amount).toFixed(2)}</td>
                <td>{new Date(sale.sale_date).toLocaleString()}</td>
                <td>{sale.username}</td>
                <td>
                    <div className="tooltip" data-tip="View Receipt">
                        <button onClick={() => handleViewDetails(sale)} className="btn btn-sm btn-ghost btn-square">
                            <FiEye size={16}/>
                        </button>
                    </div>
                </td>
            </tr>
        ));
    };

    return (
        <>
            <main className="space-y-6">
                <header>
                    <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight">Sales History</h1>
                    <p className="text-base-content/70 mt-1">Review and search all past transactions.</p>
                </header>
                <div className="card w-full bg-base-100 shadow-md border border-base-300/50">
                    <div className="card-body">
                        <div className="form-control w-full max-w-sm">
                            <label className="label"><span className="label-text">Search by Customer Name or Sale ID</span></label>
                            <input 
                                type="text"
                                placeholder="e.g. John Doe or #12"
                                className="input input-bordered"
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="divider"></div>
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Sale ID</th><th>Customer</th><th>Total Amount</th><th>Date</th><th>Sold By</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>{renderContent()}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Sale Details Modal */}
            <dialog id="sale_details_modal" className="modal">
                <div className="modal-box w-11/12 max-w-sm">
                    <div id="receipt-content" className="p-2 bg-base-100 text-base-content font-mono text-xs">
                        <div className="text-center mb-2">
                            <h2 className="font-bold text-lg uppercase">{businessInfo.business_name}</h2>
                            <p className="text-xs">{businessInfo.address}</p>
                            <p className="text-xs">Phone: {businessInfo.phone}</p>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="grid grid-cols-2 gap-x-2">
                            <span><strong>Receipt#:</strong> {selectedSale?.id}</span>
                            <span className="text-right"><strong>Date:</strong> {selectedSale && new Date(selectedSale.sale_date).toLocaleDateString()}</span>
                            <span><strong>Customer:</strong> {selectedSale?.customer_name || 'N/A'}</span>
                            <span className="text-right"><strong>Time:</strong> {selectedSale && new Date(selectedSale.sale_date).toLocaleTimeString()}</span>
                            <span><strong>Sold By:</strong> {selectedSale?.username}</span>
                        </div>
                        <div className="divider my-1"></div>
                        <table className="w-full">
                            <thead>
                                <tr className='border-b border-dashed border-base-content/50'>
                                    <th className='text-left font-bold'>Item</th>
                                    <th className='text-center font-bold'>Qty</th>
                                    <th className='text-right font-bold'>Price</th>
                                    <th className='text-right font-bold'>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedSale?.items?.map((item, index) => {
                                    const subtotal = item.quantity_sold * item.price_per_unit;
                                    return (
                                    <tr key={index}>
                                        <td>{item.product_name}</td>
                                        <td className='text-center'>{item.quantity_sold}</td>
                                        <td className='text-right'>{Number(item.price_per_unit).toFixed(2)}</td>
                                        <td className='text-right'>{subtotal.toFixed(2)}</td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                        <div className="divider my-1"></div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>Rs. {selectedSale?.items?.reduce((acc, i) => acc + (i.price_per_unit * i.quantity_sold), 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Discount:</span>
                                <span>- Rs. {selectedSale?.items?.reduce((acc, i) => acc + parseFloat(i.discount || 0), 0).toFixed(2)}</span>
                            </div>
                            <p className="text-right font-bold text-lg mt-2 border-t-2 border-dashed border-base-content/50 pt-1">
                                TOTAL: Rs. {selectedSale && Number(selectedSale.total_amount).toFixed(2)}
                            </p>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="text-center text-[10px] space-y-2">
                           <p className="border border-dashed border-base-content/50 p-1">
                                NOTE: Goods can be returned or exchanged within 7 days with this original receipt.
                           </p>
                           <p>Thank you for shopping with us!</p>
                        </div>
                    </div>
                    <div className="modal-action">
                        <button className="btn btn-primary" onClick={handlePrint}><FiPrinter/> Print</button>
                        <form method="dialog"><button className="btn">Close</button></form>
                    </div>
                </div>
            </dialog>
        </>
    );
}

export default SalesHistory;