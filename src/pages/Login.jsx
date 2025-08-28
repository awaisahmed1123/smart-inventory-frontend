import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff, FiBox } from 'react-icons/fi';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            login(response.data.token, response.data.user);
            navigate('/');
        } catch (err) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Naya VVIP Background ab CSS se aa raha hai
        <div className="min-h-screen flex items-center justify-center p-4">
            
            <motion.div 
                className="w-full max-w-md"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
                {/* VVIP Solid Card with Shadow */}
                <div className="card bg-base-100 shadow-xl border border-base-300/50">
                    <form className="card-body" onSubmit={handleSubmit}>
                        
                        <div className="text-center mb-6">
                            <FiBox size={50} className="mx-auto text-primary"/>
                            <h1 className="text-3xl font-extrabold font-display mt-4">Smart Inventory</h1>
                            <p className="text-base-content/70 mt-2">Welcome Back! Please log in.</p>
                        </div>
                        
                        <div className="form-control">
                            <label className="label"><span className="label-text">Email</span></label>
                            <div className="relative">
                                <FiMail className="absolute top-1/2 left-4 -translate-y-1/2 text-base-content/40" />
                                <input type="email" placeholder="you@example.com" className="input input-bordered w-full pl-12" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>
                        
                        <div className="form-control">
                            <label className="label"><span className="label-text">Password</span></label>
                            <div className="relative">
                                <FiLock className="absolute top-1/2 left-4 -translate-y-1/2 text-base-content/40" />
                                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="input input-bordered w-full pl-12" required value={password} onChange={(e) => setPassword(e.target.value)} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="btn btn-ghost btn-sm absolute right-1 top-1/2 -translate-y-1/2">
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                        
                        {error && <p className="text-error text-sm mt-2 text-center">{error}</p>}
                        
                        <div className="form-control mt-6">
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {loading ? <span className="loading loading-spinner"></span> : <><FiLogIn className="mr-2"/> Login</>}
                            </button>
                        </div>

                        <p className="text-center text-sm mt-4">
                            Don't have an account? 
                            <Link to="/register" className="link link-primary font-semibold ml-1">Sign Up Now</Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;