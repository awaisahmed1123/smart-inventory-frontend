import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiSearch, FiEdit, FiTrash2 } from 'react-icons/fi';

function Customers() {
    const { user } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [editingCustomer, setEditingCustomer] = useState(null); // null = modal band
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/customers');
            setCustomers(response.data);
        } catch (error) {
            toast.error("Failed to fetch customers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleOpenModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData(customer);
        } else {
            setEditingCustomer({}); // Add mode ke liye empty object
            setFormData({ name: '', email: '', phone: '', address: '' });
        }
    };

    const handleCloseModal = () => {
        setEditingCustomer(null);
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCustomer && editingCustomer.id) {
                await api.put(`/api/customers/${editingCustomer.id}`, formData);
                toast.success("Customer updated successfully!");
            } else {
                await api.post('/api/customers', formData);
                toast.success("Customer added successfully!");
            }
            fetchCustomers();
            handleCloseModal();
        } catch (error) {
            toast.error("Failed to save customer. Email might already exist.");
        }
    };

    const handleDelete = async (customerId) => {
        if (window.confirm("Are you sure you want to delete this customer?")) {
            try {
                await api.delete(`/api/customers/${customerId}`);
                toast.success("Customer deleted successfully!");
                fetchCustomers();
            } catch (error) {
                toast.error("Failed to delete customer.");
            }
        }
    };

    const filteredCustomers = customers.filter(cust =>
        cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cust.email && cust.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
                            <th>Name</th><th>Email</th><th>Phone</th>
                            {user.role === 'admin' && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(cust => (
                            <tr key={cust.id} className="hover">
                                <td>{cust.name}</td>
                                <td>{cust.email || 'N/A'}</td>
                                <td>{cust.phone || 'N/A'}</td>
                                {user.role === 'admin' && (
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="tooltip" data-tip="Edit"><button onClick={() => handleOpenModal(cust)} className="btn btn-ghost btn-square btn-sm text-info"><FiEdit size={16} /></button></div>
                                            <div className="tooltip" data-tip="Delete"><button onClick={() => handleDelete(cust.id)} className="btn btn-ghost btn-square btn-sm text-error"><FiTrash2 size={16} /></button></div>
                                        </div>
                                    </td>
                                )}
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
                        <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight">Customers</h1>
                        <p className="text-base-content/70 mt-1">Manage your list of customers.</p>
                    </div>
                    {user.role === 'admin' && (
                        <button className="btn btn-primary shadow-lg" onClick={() => handleOpenModal()}>
                            <FiPlus size={20} /> Add Customer
                        </button>
                    )}
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
            <dialog className={`modal ${editingCustomer ? 'modal-open' : ''}`}>
                <div className="modal-box w-11/12 max-w-2xl">
                    <button onClick={handleCloseModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg">{editingCustomer?.id ? 'Edit Customer' : 'Add New Customer'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="form-control">
                            <label htmlFor="name" className="label"><span className="label-text">Customer Name*</span></label>
                            <input type="text" id="name" value={formData.name} onChange={handleChange} required className="input input-bordered w-full"/>
                        </div>
                        <div className="form-control">
                            <label htmlFor="email" className="label"><span className="label-text">Email</span></label>
                            <input type="email" id="email" value={formData.email} onChange={handleChange} className="input input-bordered w-full"/>
                        </div>
                        <div className="sm:col-span-2 form-control">
                            <label htmlFor="phone" className="label"><span className="label-text">Phone</span></label>
                            <input type="tel" id="phone" value={formData.phone} onChange={handleChange} className="input input-bordered w-full"/>
                        </div>
                        <div className="sm:col-span-2 form-control">
                            <label htmlFor="address" className="label"><span className="label-text">Address</span></label>
                            <textarea id="address" value={formData.address} onChange={handleChange} className="textarea textarea-bordered w-full"></textarea>
                        </div>
                        <div className="sm:col-span-2 modal-action justify-end mt-4">
                            <button type="button" className="btn btn-ghost" onClick={handleCloseModal}>Cancel</button>
                            <button type="submit" className="btn btn-primary">{editingCustomer?.id ? 'Update Customer' : 'Add Customer'}</button>
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

export default Customers;