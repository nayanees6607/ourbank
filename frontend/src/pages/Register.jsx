import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        opening_balance: 500,
        account_type: 'savings'
    });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.opening_balance < 500) {
            setError('Opening balance must be at least 500');
            return;
        }
        try {
            await register(formData);
            navigate('/set-pin');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Email might be taken.');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-white text-slate-900 font-sans">
            {/* Diagonal Gradient Background */}
            <div className="absolute top-0 left-0 w-full h-[100%] z-0">
                <div className="absolute inset-0 stripe-mesh-bg transform -skew-y-6 origin-top-left scale-110 -translate-y-20"></div>
                <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-white via-white/80 to-transparent z-1"></div>
            </div>

            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full min-h-screen py-10 relative z-10">
                {/* Left Column: Hero Text */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="hidden lg:block space-y-8"
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                        <span className="text-gradient">Create your <br />
                            account</span> in <br />
                        minutes
                    </h1>

                    <p className="text-lg text-slate-600 max-w-lg leading-relaxed font-medium">
                        Get access to world-class financial tools, instant transfers, and detailed analytics. No hidden fees, ever.
                    </p>

                    <div className="flex gap-4 pt-4">
                        <div className="flex -space-x-4">
                            {[
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64",
                                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64",
                                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64",
                                "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=64&h=64"
                            ].map((src, i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                                    <img src={src} alt="User" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <div className="text-slate-600 text-sm flex items-center">
                            <span className="font-bold mr-1 text-slate-900">2M+</span> Users trust us
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Register Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="w-full max-w-[480px] mx-auto lg:ml-auto"
                >
                    <div className="bg-white p-8 lg:p-10 relative overflow-hidden rounded-2xl shadow-none border border-slate-200">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00D4FF] to-[#635BFF]"></div>

                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Create an account</h2>
                            <p className="text-slate-500 text-base">Join Vitta Bank today.</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 border border-red-100">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition-all shadow-sm"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition-all shadow-sm"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition-all shadow-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Balance</label>
                                    <input
                                        type="number"
                                        name="opening_balance"
                                        value={formData.opening_balance}
                                        onChange={handleChange}
                                        min="500"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition-all shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Type</label>
                                    <select
                                        name="account_type"
                                        value={formData.account_type}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition-all shadow-sm"
                                    >
                                        <option value="savings">Savings</option>
                                        <option value="current">Current</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#635BFF] hover:bg-[#5349e0] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(99,91,255,0.39)] hover:shadow-[0_6px_20px_rgba(99,91,255,0.23)] transform active:scale-[0.98] transition-all duration-200 mt-4 text-lg"
                            >
                                Create Account
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-slate-500 text-base">
                                Already have an account? <Link to="/login" className="text-[#635BFF] font-bold hover:underline">Sign in</Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
