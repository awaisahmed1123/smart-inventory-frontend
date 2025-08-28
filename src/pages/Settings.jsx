import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiShield, FiBriefcase, FiAlertTriangle } from 'react-icons/fi';

// Helper component for the navigation menu item
const SettingsNavItem = ({ label, icon, activeTab, tabName, setActiveTab }) => (
    <li>
        <a 
            className={activeTab === tabName ? 'active font-semibold' : ''}
            onClick={() => setActiveTab(tabName)}
        >
            {icon}
            {label}
        </a>
    </li>
);

// Helper component for each settings section card
const SettingsCard = ({ title, description, children }) => (
    <div className="card w-full bg-base-100 shadow-md border border-base-300/50 animate-fade-in">
        <div className="card-body">
            <div className="border-b border-base-300 pb-4">
                <h2 className="card-title text-xl font-bold">{title}</h2>
                <p className="text-base-content/70 text-sm">{description}</p>
            </div>
            {children}
        </div>
    </div>
);


function Settings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({ username: '', email: '' });
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [businessData, setBusinessData] = useState({ business_name: '', address: '', phone: '' });
    const [passwordForReset, setPasswordForReset] = useState('');

    useEffect(() => {
        if (user) {
            setProfileData({ username: user.username, email: user.email || '' });
        }
        if (user && user.role === 'admin') {
            const fetchBusinessSettings = async () => {
                try {
                    const response = await api.get('/api/settings/business');
                    if (response.data) {
                        setBusinessData(response.data);
                    }
                } catch (error) { console.error("Could not fetch business settings"); }
            };
            fetchBusinessSettings();
        }
    }, [user]);

    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    const handleBusinessChange = (e) => setBusinessData({ ...businessData, [e.target.name]: e.target.value });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/api/users/profile', profileData);
            toast.success('Profile updated! Please log in again to see changes.');
            logout();
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile.");
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        try {
            await api.put('/api/users/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully!');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password.");
        }
    };
    
    const handleBusinessSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/api/settings/business', businessData);
            toast.success("Business settings updated successfully!");
        } catch (error) {
            toast.error("Failed to update business settings.");
        }
    };

    const handleFactoryReset = async () => {
        try {
            await api.post('/api/settings/factory-reset', { password: passwordForReset });
            toast.success("Factory Reset Successful! Logging out...");
            
            setTimeout(() => {
                document.getElementById('reset_modal').close();
                logout();
                navigate('/login');
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Factory reset failed.");
        } finally {
            setPasswordForReset('');
        }
    };

    return (
        <>
            <main className="space-y-6">
                <header>
                    <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight">Settings</h1>
                    <p className="text-base-content/70 mt-1">Manage your profile, security, and business settings.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Left Side Navigation Menu */}
                    <div className="md:col-span-1">
                        <ul className="menu bg-base-100 rounded-box shadow-md border border-base-300/50 p-2">
                            <SettingsNavItem label="Profile" icon={<FiUser/>} activeTab={activeTab} tabName="profile" setActiveTab={setActiveTab} />
                            <SettingsNavItem label="Security" icon={<FiShield/>} activeTab={activeTab} tabName="security" setActiveTab={setActiveTab} />
                            {user?.role === 'admin' && (
                                <>
                                    <div className="divider my-1"></div>
                                    <SettingsNavItem label="Business" icon={<FiBriefcase/>} activeTab={activeTab} tabName="business" setActiveTab={setActiveTab} />
                                    <SettingsNavItem label="Danger Zone" icon={<FiAlertTriangle/>} activeTab={activeTab} tabName="danger" setActiveTab={setActiveTab} />
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Right Side Content Area */}
                    <div className="md:col-span-3">
                        {activeTab === 'profile' && (
                            <SettingsCard title="Profile Information" description="Update your account's profile information and email address.">
                                <form onSubmit={handleProfileSubmit} className="space-y-6 pt-6">
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="col-span-1 font-semibold">Username</label>
                                        <input type="text" name="username" value={profileData.username} onChange={handleProfileChange} className="input input-bordered col-span-2" required />
                                    </div>
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="col-span-1 font-semibold">Email</label>
                                        <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} className="input input-bordered col-span-2" required />
                                    </div>
                                    <div className="card-actions justify-end mt-4 pt-4 border-t border-base-300"><button type="submit" className="btn btn-primary">Save Profile</button></div>
                                </form>
                            </SettingsCard>
                        )}

                        {activeTab === 'security' && (
                             <SettingsCard title="Change Password" description="Update your password. Make sure to use a strong one.">
                                <form onSubmit={handlePasswordSubmit} className="space-y-6 pt-6">
                                    <div className="grid grid-cols-3 items-center"><label className="col-span-1 font-semibold">Old Password</label><input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} className="input input-bordered col-span-2" required /></div>
                                    <div className="grid grid-cols-3 items-center"><label className="col-span-1 font-semibold">New Password</label><input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="input input-bordered col-span-2" required /></div>
                                    <div className="grid grid-cols-3 items-center"><label className="col-span-1 font-semibold">Confirm New Password</label><input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="input input-bordered col-span-2" required /></div>
                                    <div className="card-actions justify-end mt-4 pt-4 border-t border-base-300"><button type="submit" className="btn btn-primary">Change Password</button></div>
                                </form>
                            </SettingsCard>
                        )}

                        {activeTab === 'business' && user?.role === 'admin' && (
                            <SettingsCard title="Business Details" description="This information will be displayed on your printed receipts.">
                                <form onSubmit={handleBusinessSubmit} className="space-y-6 pt-6">
                                    <div className="grid grid-cols-3 items-center"><label className="col-span-1 font-semibold">Business Name</label><input type="text" name="business_name" value={businessData.business_name || ''} onChange={handleBusinessChange} className="input input-bordered col-span-2" /></div>
                                    <div className="grid grid-cols-3 items-center"><label className="col-span-1 font-semibold">Phone Number</label><input type="text" name="phone" value={businessData.phone || ''} onChange={handleBusinessChange} className="input input-bordered col-span-2" /></div>
                                    <div className="grid grid-cols-3 items-start"><label className="col-span-1 font-semibold pt-3">Address</label><textarea name="address" value={businessData.address || ''} onChange={handleBusinessChange} className="textarea textarea-bordered col-span-2"></textarea></div>
                                    <div className="card-actions justify-end mt-4 pt-4 border-t border-base-300"><button type="submit" className="btn btn-primary">Save Business Info</button></div>
                                </form>
                            </SettingsCard>
                        )}

                        {activeTab === 'danger' && user?.role === 'admin' && (
                            <div className="card w-full bg-base-100 shadow-md border-2 border-error animate-fade-in">
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-bold text-error">Danger Zone</h2>
                                    <p className="text-base-content/70 text-sm">Be careful. These actions are irreversible.</p>
                                    <div className="divider my-4"></div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold">Factory Reset</h3>
                                            <p className="text-sm opacity-70 max-w-md">This will permanently delete all products, sales, customers, and suppliers.</p>
                                        </div>
                                        <button className="btn btn-error" onClick={() => document.getElementById('reset_modal').showModal()}>Reset Everything</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Factory Reset Confirmation Modal */}
            <dialog id="reset_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Confirm Factory Reset</h3>
                    <p className="py-4">This is your final confirmation. To proceed, please enter your current password.</p>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Your Password</span></label>
                        <input type="password" placeholder="Enter password to confirm" className="input input-bordered" value={passwordForReset} onChange={(e) => setPasswordForReset(e.target.value)} />
                    </div>
                    <div className="modal-action">
                        <form method="dialog" className="space-x-2">
                           <button className="btn" onClick={() => setPasswordForReset('')}>Cancel</button>
                           <button type="button" className="btn btn-error" onClick={handleFactoryReset}>I understand, Reset Everything</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    );
}

export default Settings;