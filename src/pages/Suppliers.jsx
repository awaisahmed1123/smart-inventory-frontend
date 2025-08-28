import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiEdit, FiTrash2 } from 'react-icons/fi';

function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal ko control karne ke liye Products page jaisi logic
    const [editingSupplier, setEditingSupplier] = useState(null); // null = modal band
    const [formData, setFormData] = useState({ name: '', contact_person: '', email: '', phone: '', address: '' });

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            toast.error("Failed to fetch suppliers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleOpenModal = (supplier = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData(supplier);
        } else {
            setEditingSupplier({}); // Add mode ke liye empty object
            setFormData({ name: '', contact_person: '', email: '', phone: '', address: '' });
        }
    };

    const handleCloseModal = () => {
        setEditingSupplier(null);
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier && editingSupplier.id) {
                await api.put(`/api/suppliers/${editingSupplier.id}`, formData);
                toast.success("Supplier updated successfully!");
            } else {
                await api.post('/api/suppliers', formData);
                toast.success("Supplier added successfully!");
            }
            fetchSuppliers();
            handleCloseModal();
        } catch (error) {
            toast.error("Failed to save supplier. Email might already exist.");
        }
    };

    const handleDelete = async (supplierId) => {
        if (window.confirm("Are you sure you want to delete this supplier?")) {
            try {
                await api.delete(`/api/suppliers/${supplierId}`);
                toast.success("Supplier deleted successfully!");
                fetchSuppliers();
            } catch (error) {
                toast.error("Failed to delete supplier.");
            }
        }
    };

    const filteredSuppliers = suppliers.filter(sup =>
        sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            );
        }
        return (
            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th>Name</th><th>Contact Person</th><th>Email</th><th>Phone</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSuppliers.map(sup => (
                            <tr key={sup.id} className="hover">
                                <td>{sup.name}</td>
                                <td>{sup.contact_person || 'N/A'}</td>
                                <td>{sup.email}</td>
                                <td>{sup.phone || 'N/A'}</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div className="tooltip" data-tip="Edit"><button onClick={() => handleOpenModal(sup)} className="btn btn-ghost btn-square btn-sm text-info"><FiEdit size={16} /></button></div>
                                        <div className="tooltip" data-tip="Delete"><button onClick={() => handleDelete(sup.id)} className="btn btn-ghost btn-square btn-sm text-error"><FiTrash2 size={16} /></button></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <>
            <main className="space-y-6">
                <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight">Suppliers</h1>
                        <p className="text-base-content/70 mt-1">Manage your list of suppliers.</p>
                    </div>
                    <button className="btn btn-primary shadow-lg" onClick={() => handleOpenModal()}>
                        <FiPlus size={20} /> Add Supplier
                    </button>
                </header>

                <div className="card w-full bg-base-100 shadow-md border border-base-300/50">
                    <div className="card-body">
                        <div className="relative w-full max-w-xs mb-4">
                            <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-base-content/50" />
                            <input 
                                type="text"
                                placeholder="Search by name or email..."
                                className="input input-bordered w-full pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {renderContent()}
                    </div>
                </div>
            </main>

            {/* VVIP Add/Edit Modal */}
            <dialog className={`modal ${editingSupplier ? 'modal-open' : ''}`}>
                <div className="modal-box w-11/12 max-w-2xl">
                    <button onClick={handleCloseModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg">{editingSupplier?.id ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="form-control">
                            <label htmlFor="name" className="label"><span className="label-text">Supplier Name*</span></label>
                            <input type="text" id="name" value={formData.name} onChange={handleChange} required className="input input-bordered w-full"/>
                        </div>
                        <div className="form-control">
                            <label htmlFor="contact_person" className="label"><span className="label-text">Contact Person</span></label>
                            <input type="text" id="contact_person" value={formData.contact_person} onChange={handleChange} className="input input-bordered w-full"/>
                        </div>
                        <div className="form-control">
                            <label htmlFor="email" className="label"><span className="label-text">Email*</span></label>
                            <input type="email" id="email" value={formData.email} onChange={handleChange} required className="input input-bordered w-full"/>
                        </div>
                        <div className="form-control">
                            <label htmlFor="phone" className="label"><span className="label-text">Phone</span></label>
                            <input type="tel" id="phone" value={formData.phone} onChange={handleChange} className="input input-bordered w-full"/>
                        </div>
                        <div className="sm:col-span-2 form-control">
                            <label htmlFor="address" className="label"><span className="label-text">Address</span></label>
                            <textarea id="address" value={formData.address} onChange={handleChange} className="textarea textarea-bordered w-full"></textarea>
                        </div>
                        <div className="sm:col-span-2 modal-action justify-end mt-4">
                            <button type="button" className="btn btn-ghost" onClick={handleCloseModal}>Cancel</button>
                            <button type="submit" className="btn btn-primary">{editingSupplier?.id ? 'Update Supplier' : 'Add Supplier'}</button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={handleCloseModal}>close</button>
                </form>
            </dialog>
        </>
    );
}

export default Suppliers;