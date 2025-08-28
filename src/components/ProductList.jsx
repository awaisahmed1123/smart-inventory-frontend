import { FiEdit, FiTrash2 } from 'react-icons/fi';

// Props ko update kiya gaya hai. Ab 'isAdmin' prop istemal hoga.
function ProductList({ products, onDelete, onEdit, isAdmin }) {

  // Agar products nahi hain ya loading ho rahi hai, to ek message dikhayen
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-base-content/70">No Products Found</h3>
        <p className="text-base-content/50 mt-2">
          {isAdmin ? "Click 'Add Product' to get started." : "The product inventory is currently empty."}
        </p>
      </div>
    );
  }

  return (
    // Outer card hata diya gaya hai. Ab yeh div root element hai.
    <div className="overflow-x-auto w-full">
      <table className="table table-zebra w-full">
        {/* Table Head */}
        <thead className="text-base-content/80">
          <tr>
            <th className="font-semibold">Product Name</th>
            <th className="font-semibold">SKU</th>
            <th className="font-semibold text-center">Quantity</th>
            <th className="font-semibold text-right">Cost Price</th>
            <th className="font-semibold text-right">Sale Price</th>
            {/* Actions ka column sirf admin ke liye */}
            {isAdmin && <th className="font-semibold text-center">Actions</th>}
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody>
          {products.map(product => (
            <tr key={product.id} className="hover">
              <td>
                <div className="font-bold">{product.name}</div>
                <div className="text-xs opacity-60">{product.description?.substring(0, 30)}...</div>
              </td>
              <td>{product.sku}</td>
              <td className="text-center">
                <span className={`badge ${product.quantity <= 10 ? 'badge-warning' : 'badge-ghost'} badge-md`}>
                  {product.quantity}
                </span>
              </td>
              <td className="text-right">Rs. {Number(product.cost_price || 0).toLocaleString()}</td>
              <td className="text-right font-semibold">Rs. {Number(product.price || 0).toLocaleString()}</td>
              
              {/* VVIP Icon Buttons sirf admin ke liye */}
              {isAdmin && (
                <td className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* Edit Button */}
                    <div className="tooltip" data-tip="Edit">
                      <button 
                        onClick={() => onEdit(product)} 
                        className="btn btn-ghost btn-square btn-sm text-info"
                      >
                        <FiEdit size={16} />
                      </button>
                    </div>
                    {/* Delete Button */}
                    <div className="tooltip" data-tip="Delete">
                      <button 
                        onClick={() => onDelete(product.id)} 
                        className="btn btn-ghost btn-square btn-sm text-error"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductList;