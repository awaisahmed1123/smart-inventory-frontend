import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import BarcodeScanner from '../components/BarcodeScanner';
import { FiSearch, FiCamera, FiX, FiPlus, FiMinus, FiShoppingCart, FiCheckCircle } from 'react-icons/fi';

// === FINAL VVIP Cart Item Row ===
const CartItemRow = ({ item, onUpdate, onRemove }) => {
    const pricePerUnit = Number(item.price_per_unit ?? 0);
    const quantitySold = Number(item.quantity_sold ?? 0);
    const discount = Number(item.discount ?? 0);
    const itemSubtotal = (pricePerUnit * quantitySold) - discount;

    return (
        <div className="flex items-center gap-4 p-3 border-b border-base-300">
            {/* Product Name */}
            <div className="flex-1">
                <p className="font-bold text-base">{item.name}</p>
                <p className="text-xs opacity-70">@ Rs. {pricePerUnit.toFixed(2)}</p>
            </div>

            {/* Discount */}
            <div className="w-32">
                {/* *** FINAL FIX: "Rs." span hata diya gaya hai alignment theek karne ke liye *** */}
                <input 
                    type="number" 
                    className="input input-bordered input-sm w-full text-center" 
                    value={discount} 
                    onChange={e => onUpdate(item.product_id, 'discount', e.target.value)}
                    placeholder="Discount"
                />
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-2">
                <button onClick={() => onUpdate(item.product_id, 'quantity_sold', quantitySold - 1)} className="btn btn-square btn-sm"><FiMinus size={14}/></button>
                <input 
                    type="number"
                    className="input input-bordered input-sm w-16 text-center font-bold"
                    value={quantitySold}
                    onChange={e => onUpdate(item.product_id, 'quantity_sold', e.target.value)}
                />
                <button onClick={() => onUpdate(item.product_id, 'quantity_sold', quantitySold + 1)} className="btn btn-square btn-sm"><FiPlus size={14}/></button>
            </div>

            {/* Subtotal */}
            <div className="w-28 text-right">
                <p className="font-semibold text-base">Rs. {itemSubtotal.toFixed(2)}</p>
            </div>
            
            {/* Remove Button */}
            <div className="w-12 text-right">
                 <button onClick={() => onRemove(item.product_id)} className="btn btn-ghost btn-square btn-sm text-error"><FiX size={18}/></button>
            </div>
        </div>
    );
};

// === VVIP Helper for Empty Cart State ===
const EmptyCart = () => (
    <div className="flex flex-col justify-center items-center h-full text-base-content/60 py-16">
        <FiShoppingCart size={50} className="mb-4"/>
        <h3 className="text-lg font-semibold">The Cart is Empty</h3>
        <p className="text-sm">Start by searching or scanning a product above.</p>
    </div>
);


function NewSale() {
    const [allProducts, setAllProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await api.get('/api/products');
                setAllProducts(response.data);
            } catch (error) { toast.error("Could not fetch products."); }
        };
        fetchAllProducts();
    }, []);

    const filteredProducts = searchTerm.length < 1 ? [] : allProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const handleScanSuccess = (sku) => {
        setIsScannerOpen(false);
        const product = allProducts.find(p => p.sku === sku);
        if (product) {
            handleAddToCart(product);
            toast.success(`${product.name} added to cart!`);
        } else {
            toast.error(`Product with SKU "${sku}" not found.`);
        }
    };

    const handleAddToCart = (product) => {
        const existingItem = cart.find(item => item.product_id === product.id);
        if (existingItem) {
            if (existingItem.quantity_sold < product.quantity) {
                 setCart(cart.map(item => 
                     item.product_id === product.id ? { ...item, quantity_sold: item.quantity_sold + 1 } : item
                 ));
            } else {
                toast.warn("Maximum stock quantity reached for this item.");
            }
        } else {
            if(product.quantity > 0) {
                setCart([...cart, { 
                    product_id: product.id, name: product.name, quantity_sold: 1, 
                    price_per_unit: product.price, cost_per_unit: product.cost_price,
                    stock: product.quantity, discount: 0
                }]);
            } else {
                toast.warn("Product is out of stock!");
            }
        }
        setSearchTerm('');
    };
    
    const handleUpdateCartItem = (productId, field, value) => {
        const itemInCart = cart.find(item => item.product_id === productId);
        const numericValue = parseFloat(value) || 0;
        if (field === 'quantity_sold') {
            if (numericValue > itemInCart.stock) {
                toast.warn(`Only ${itemInCart.stock} units available.`);
                return;
            }
            if (numericValue <= 0) {
                handleRemoveFromCart(productId);
                return;
            }
        }
        const itemSubtotal = Number(itemInCart.price_per_unit ?? 0) * Number(itemInCart.quantity_sold ?? 0);
        if (field === 'discount' && numericValue > itemSubtotal) {
            toast.warn(`Discount cannot be greater than item's subtotal of Rs. ${itemSubtotal.toFixed(2)}`);
            return;
        }
        setCart(cart.map(item => 
            item.product_id === productId ? { ...item, [field]: numericValue } : item
        ));
    };

    const handleRemoveFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const subTotal = cart.reduce((total, item) => total + (Number(item.price_per_unit ?? 0) * Number(item.quantity_sold ?? 0)), 0);
    const totalDiscount = cart.reduce((total, item) => total + Number(item.discount ?? 0), 0);
    const grandTotal = subTotal - totalDiscount;

    const handleCompleteSale = async () => {
        if (cart.length === 0) {
            toast.warn("Cart is empty.");
            return;
        }
        const saleData = {
            customer_name: customerName,
            total_amount: grandTotal,
            items: cart.map(({ product_id, quantity_sold, price_per_unit, discount, cost_per_unit }) => ({
                product_id, quantity_sold, price_per_unit, discount, cost_per_unit
            }))
        };
        try {
            await api.post('/api/sales', saleData);
            toast.success("Sale completed successfully!");
            setCart([]);
            setCustomerName('');
        } catch (error) {
            toast.error("Failed to complete sale.");
        }
    };

    return (
        <>
            <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
                
                {/* === TOP SEARCH/SCANNER SECTION === */}
                <div className="card bg-base-100 shadow-md border border-base-300/50 flex-shrink-0">
                    <div className="card-body p-4">
                        <div className="form-control relative">
                            <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-base-content/50" />
                            <input 
                                type="text"
                                placeholder="Start typing to Search by Name or SKU..."
                                className="input input-bordered w-full pl-12"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <button onClick={() => setIsScannerOpen(true)} className="btn btn-square btn-ghost absolute top-1/2 right-2 -translate-y-1/2">
                                <FiCamera size={22}/>
                            </button>
                        </div>
                        {searchTerm.length > 0 && (
                            <ul className="menu bg-base-200 w-full rounded-box mt-2 max-h-60 overflow-y-auto z-10 shadow-lg">
                                {filteredProducts.length > 0 ? filteredProducts.map(p => (
                                    <li key={p.id} onClick={() => handleAddToCart(p)}><a>{p.name} <span className="badge badge-sm">Stock: {p.quantity}</span></a></li>
                                )) : <li className="menu-title px-4"><span>No products found.</span></li>}
                            </ul>
                        )}
                    </div>
                </div>

                {/* === MAIN CART & BILLING SECTION === */}
                <div className="card bg-base-100 shadow-md border border-base-300/50 flex-grow flex flex-col">
                    <div className="p-4 border-b border-base-300 flex justify-between items-center">
                         <h2 className="card-title text-lg">Current Bill</h2>
                        <input 
                            type="text"
                            placeholder="Customer Name (Optional)"
                            className="input input-bordered w-full max-w-xs"
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                        />
                    </div>
                    
                    {/* Cart Items List */}
                    <div className="flex-grow overflow-y-auto">
                        {cart.length > 0 ? (
                            <div className="w-full">
                                <div className="flex items-center gap-4 p-3 border-b-2 border-base-300 text-sm font-bold text-base-content/70 sticky top-0 bg-base-100 z-10">
                                    <div className="flex-1">PRODUCT</div>
                                    <div className="w-32">DISCOUNT</div>
                                    <div className="w-40 text-center pl-8">QUANTITY</div>
                                    <div className="w-28 text-right">SUBTOTAL</div>
                                    <div className="w-12 text-right"></div>
                                </div>
                                {cart.map(item => (
                                    <CartItemRow key={item.product_id} item={item} onUpdate={handleUpdateCartItem} onRemove={handleRemoveFromCart} />
                                ))}
                            </div>
                        ) : (
                            <EmptyCart />
                        )}
                    </div>

                    {/* Billing Footer */}
                    <div className="card-body p-4 bg-base-200 rounded-b-box">
                        <div className="space-y-2 text-base">
                            <div className="flex justify-between"><span>Subtotal</span><span>Rs. {subTotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-error"><span>Discount</span><span>- Rs. {totalDiscount.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center font-bold text-xl mt-2 border-t-2 border-base-content/20 pt-2">
                                <span>Grand Total</span>
                                <span>Rs. {grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="card-actions mt-4">
                            <button className="btn btn-primary btn-block" onClick={handleCompleteSale} disabled={cart.length === 0}>
                                <FiCheckCircle/> Complete Sale
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scanner Modal */}
            {isScannerOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Scan Barcode</h3>
                        <BarcodeScanner onScanSuccess={handleScanSuccess} />
                        <div className="modal-action">
                            <form method="dialog"><button className="btn" onClick={() => setIsScannerOpen(false)}>Close</button></form>
                        </div>
                    </div>
                </dialog>
            )}
        </>
    );
}

export default NewSale;