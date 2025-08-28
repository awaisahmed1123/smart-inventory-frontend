import React from 'react';
import { Link } from 'react-router-dom';

function RecentSalesCard({ recentSales }) {
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex justify-between items-center">
                    <h2 className="card-title">Recent Sales</h2>
                    <Link to="/sales-history" className="btn btn-ghost btn-sm">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="table table-xs">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th className='text-right'>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSales.map(sale => (
                                <tr key={sale.id}>
                                    <td>#{sale.id}</td>
                                    <td>{sale.customer_name || 'N/A'}</td>
                                    <td className='text-right'>Rs. {Number(sale.total_amount).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default RecentSalesCard;