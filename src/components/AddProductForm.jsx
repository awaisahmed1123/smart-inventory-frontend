import { useState, useEffect } from 'react';

// IMPORTANT: Prop list ko update kiya gaya hai. Ab 'onCancel' istemal hoga.
function AddProductForm({ onFormSubmit, editingProduct, onCancel }) {
  const initialState = { name: '', sku: '', quantity: '', price: '', cost_price: '', description: '' };
  const [product, setProduct] = useState(initialState);
  // Submission ke waqt loading state add ki hai for better UX
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Agar editingProduct hai (yaani edit mode), to form ko uske data se bharen
    // Agar nahi (yaani add mode), to form ko khali karden
    if (editingProduct && editingProduct.id) {
      setProduct({
          name: editingProduct.name || '',
          sku: editingProduct.sku || '',
          quantity: editingProduct.quantity || '',
          price: editingProduct.price || '',
          cost_price: editingProduct.cost_price || '',
          description: editingProduct.description || ''
      });
    } else {
      setProduct(initialState);
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setProduct(prevProduct => ({ ...prevProduct, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onFormSubmit(product);
    setIsSubmitting(false);
  };

  // Outer card div hata diya gaya hai kyunki yeh ab modal ke andar hai.
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 2-Column Grid for inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product Name */}
        <div className="form-control">
          <label htmlFor="name" className="label">
            <span className="label-text">Product Name</span>
          </label>
          <input type="text" id="name" value={product.name} onChange={handleChange} required className="input input-bordered w-full"/>
        </div>
        
        {/* SKU */}
        <div className="form-control">
          <label htmlFor="sku" className="label">
            <span className="label-text">SKU (Barcode)</span>
          </label>
          <input type="text" id="sku" value={product.sku} onChange={handleChange} required className="input input-bordered w-full"/>
        </div>

        {/* Quantity */}
        <div className="form-control">
          <label htmlFor="quantity" className="label">
            <span className="label-text">Quantity</span>
          </label>
          <input type="number" id="quantity" value={product.quantity} onChange={handleChange} required className="input input-bordered w-full" min="0"/>
        </div>

        {/* Cost Price */}
        <div className="form-control">
          <label htmlFor="cost_price" className="label">
            <span className="label-text">Cost Price (Rs.)</span>
          </label>
          <input type="number" step="0.01" id="cost_price" value={product.cost_price} onChange={handleChange} required className="input input-bordered w-full" min="0"/>
        </div>

        {/* Sale Price */}
        <div className="form-control sm:col-span-2">
          <label htmlFor="price" className="label">
            <span className="label-text">Sale Price (Rs.)</span>
          </label>
          <input type="number" step="0.01" id="price" value={product.price} onChange={handleChange} required className="input input-bordered w-full" min="0"/>
        </div>

        {/* Description */}
        <div className="form-control sm:col-span-2">
          <label htmlFor="description" className="label">
            <span className="label-text">Description (Optional)</span>
          </label>
          <textarea id="description" value={product.description} onChange={handleChange} rows="3" className="textarea textarea-bordered w-full"></textarea>
        </div>
      </div>

      {/* Form Actions/Buttons */}
      <div className="modal-action mt-6">
        {/* onCancel prop ko call karega jo modal band kar dega */}
        <button type="button" onClick={onCancel} className="btn btn-ghost" disabled={isSubmitting}>
            Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting && <span className="loading loading-spinner"></span>}
            {editingProduct?.id ? 'Update Product' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}

export default AddProductForm;