import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { FiShield } from 'react-icons/fi';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // *** YAHAN TABDEELI KI GAYI HAI: Nayi state modal ke liye ***
    const [userToUpdate, setUserToUpdate] = useState(null); // Jis user ka role change karna hai
    const [newRole, setNewRole] = useState(''); // Naya role (admin ya user)

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/api/users');
            setUsers(data);
        } catch (error) {
            toast.error("Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // *** YAHAN TABDEELI KI GAYI HAI: Naya function modal kholne ke liye ***
    const openConfirmationModal = (user, role) => {
        setUserToUpdate(user);
        setNewRole(role);
    };

    const closeConfirmationModal = () => {
        setUserToUpdate(null);
        setNewRole('');
    };

    // *** YAHAN TABDEELI KI GAYI HAI: API call ab naye function mein hai ***
    const confirmRoleChange = async () => {
        if (!userToUpdate || !newRole) return;

        try {
            await api.put(`/api/users/${userToUpdate.id}/role`, { role: newRole });
            toast.success(`'${userToUpdate.username}' is now an ${newRole}.`);
            fetchUsers(); // List ko refresh karein
        } catch (error) {
            toast.error("Failed to update user role.");
        } finally {
            closeConfirmationModal(); // Modal ko band karein
        }
    };

    if (loading) return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <>
            <main className="space-y-6">
                <header>
                    <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight">User Management</h1>
                    <p className="text-base-content/70 mt-1">Manage user roles and permissions across the application.</p>
                </header>
                <div className="card w-full bg-base-100 shadow-md border border-base-300/50">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Current Role</th>
                                        <th className='text-center'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td className="font-bold">{user.username}</td>
                                            <td>{user.email}</td>
                                            <td><span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>{user.role}</span></td>
                                            <td className='text-center'>
                                                {/* *** YAHAN TABDEELI KI GAYI HAI: Purane window.confirm ko isse replace kiya hai *** */}
                                                {user.role === 'admin' ? (
                                                    <button onClick={() => openConfirmationModal(user, 'user')} className="btn btn-sm btn-outline">Set as User</button>
                                                ) : (
                                                    <button onClick={() => openConfirmationModal(user, 'admin')} className="btn btn-sm btn-outline btn-primary">Set as Admin</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* VVIP Confirmation Modal */}
            <dialog className={`modal ${userToUpdate ? 'modal-open' : ''}`}>
                <div className="modal-box">
                    <FiShield className="mx-auto h-16 w-16 text-primary mb-4"/>
                    <h3 className="font-bold text-lg text-center">Confirm Role Change</h3>
                    <p className="py-4 text-center">
                        Are you sure you want to set <strong className="text-primary">{userToUpdate?.username}</strong> as an <strong className="text-primary">{newRole}</strong>?
                    </p>
                    <div className="modal-action justify-center">
                        <button className="btn btn-ghost" onClick={closeConfirmationModal}>Cancel</button>
                        <button className="btn btn-primary" onClick={confirmRoleChange}>Yes, I'm Sure</button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeConfirmationModal}>close</button>
                </form>
            </dialog>
        </>
    );
}

export default UserManagement;