import React from 'react';

function TopProductsCard({ topProducts }) {
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">Top Selling Products</h2>
                <div className="overflow-x-auto">
                    <table className="table table-xs">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th className='text-right'>Units Sold</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.map((product, index) => (
                                <tr key={index}>
                                    <td>{product.name}</td>
                                    <td className='text-right'>{product.total_sold}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TopProductsCard;