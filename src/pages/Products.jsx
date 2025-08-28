import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import ProductList from '../components/ProductList';
import AddProductForm from '../components/AddProductForm';
import ImportCsvModal from '../components/ImportCsvModal';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiUpload, FiSearch } from 'react-icons/fi';

function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  // editingProduct state ab Add/Edit Modal ko control karega
  // null = modal band, {} = Add mode, {product} = Edit mode
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchProducts = async () => {
    // Prevent refetching when modal opens/closes
    if (!loading) setLoading(true); 
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      toast.error("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFormSubmit = async (productData) => {
    try {
      if (editingProduct && editingProduct.id) {
        await api.put(`/api/products/${editingProduct.id}`, productData);
        toast.success("Product updated successfully!");
      } else {
        await api.post('/api/products', productData);
        toast.success("Product added successfully!");
      }
      fetchProducts();
      setEditingProduct(null); // Modal ko band karen
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to save product.";
      toast.error(errorMessage);
    }
  };
  
  const handleEdit = (product) => {
    setEditingProduct(product); // Form ko edit mode mein modal mein kholen
  };

  const handleDelete = async (productId) => {
    // Using a custom modal for confirmation would be a VVIP upgrade later
    if (window.confirm("Are you sure you want to delete this product?")) {
        try {
            await api.delete(`/api/products/${productId}`);
            toast.success("Product deleted successfully!");
            fetchProducts();
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to delete product.";
            toast.error(errorMessage);
        }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Conditionally render main content based on loading state
  const renderContent = () => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-18rem)]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }
    return (
        <ProductList 
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAdmin={user?.role === 'admin'}
        />
    );
  }

  return (
    <>
      <main className="p-4 sm:p-6 space-y-6">
        {/* VVIP Page Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight">Products</h1>
                <p className="text-base-content/70 mt-1">Manage your complete inventory and stock here.</p>
            </div>
            {user?.role === 'admin' && (
                <div className="flex items-center gap-2">
                    <button className="btn btn-ghost" onClick={() => setIsImportModalOpen(true)}>
                        <FiUpload size={18} /> Import CSV
                    </button>
                    <button className="btn btn-primary shadow-lg" onClick={() => setEditingProduct({})}>
                        <FiPlus size={20} /> Add Product
                    </button>
                </div>
            )}
        </header>

        {/* VVIP Products Table Card */}
        <div className="card w-full bg-base-100 shadow-md border border-base-300/50">
          <div className="card-body">
            {/* Card Header with Search and Stats */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <div className="relative w-full max-w-xs">
                    <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-base-content/50" />
                    <input 
                        type="text"
                        placeholder="Search by name or SKU..."
                        className="input input-bordered w-full pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-base-content/70">
                    Showing <span className="font-bold text-base-content">{filteredProducts.length}</span> of <span className="font-bold text-base-content">{products.length}</span> products
                </div>
            </div>
            
            {/* Product List or Loader */}
            {renderContent()}

          </div>
        </div>
      </main>

      {/* VVIP Add/Edit Product Modal */}
      {/* DaisyUI Modal: controlled by 'editingProduct' state */}
      <dialog id="product_modal" className={`modal ${editingProduct ? 'modal-open' : ''}`}>
        <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-2xl mb-4">
                {editingProduct?.id ? 'Edit Product' : 'Add New Product'}
            </h3>
            <AddProductForm 
                onFormSubmit={handleFormSubmit} 
                editingProduct={editingProduct}
                // Pass a function to close the modal from the form
                onCancel={() => setEditingProduct(null)}
            />
        </div>
        {/* This is a backdrop that closes the modal on click */}
        <form method="dialog" className="modal-backdrop">
            <button onClick={() => setEditingProduct(null)}>close</button>
        </form>
      </dialog>

      {/* Import CSV Modal (unchanged) */}
      <ImportCsvModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
            fetchProducts();
            setIsImportModalOpen(false);
        }}
      />
    </>
  );
}

export default Products;