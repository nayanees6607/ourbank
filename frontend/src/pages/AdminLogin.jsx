import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaUniversity, FaServer, FaDatabase, FaShieldAlt, FaTerminal } from 'react-icons/fa';

const AdminLogin = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password, true); // true for isAdminLogin
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.detail || 'Admin login failed. Access denied.');
        }
    };

    return (
        <div className="w-full min-h-screen font-sans bg-[#0A2540] text-white selection:bg-[#00D4FF] selection:text-[#0A2540] flex flex-col">

            {/* Background Texture */}
            <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

            {/* Navbar Placeholder */}
            <div className="relative z-10 container mx-auto px-6 py-6 font-bold text-2xl flex items-center gap-2">
                <FaUniversity className="text-[#00D4FF]" />
                <span>Vitta<span className="text-[#00D4FF]">Admin</span></span>
            </div>

            <div className="flex-1 flex items-center justify-center relative z-10 px-6">
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Side: Admin Context */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="hidden lg:block space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] text-xs font-bold tracking-wider uppercase mb-2 border border-[#00D4FF]/20">
                            <FaShieldAlt /> Restricted Area
                        </div>
                        <h1 className="text-6xl font-extrabold tracking-tight leading-tight text-white">
                            Internal <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#0066FF]">Control Center</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                            Authorized personnel only. Monitor transactions, manage user accounts, and oversee system integrity from a centralized dashboard.
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <FaServer className="text-2xl text-[#00D4FF] mb-3" />
                                <h4 className="font-bold text-white">System Status</h4>
                                <p className="text-xs text-slate-400 mt-1">All systems operational</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <FaDatabase className="text-2xl text-[#00D4FF] mb-3" />
                                <h4 className="font-bold text-white">Database</h4>
                                <p className="text-xs text-slate-400 mt-1">Encrypted & Secure</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side: Login Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full max-w-md mx-auto"
                    >
                        <div className="bg-[#132F4C] p-8 md:p-10 rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"></div>

                            <div className="mb-8 text-center">
                                <div className="w-16 h-16 bg-[#00D4FF]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#00D4FF]/20">
                                    <FaLock className="text-3xl text-[#00D4FF]" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Authenticate</h2>
                                <p className="text-slate-400 text-sm mt-2">Enter your administrative credentials</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 border border-red-500/20">
                                    <FaTerminal className="text-red-400" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#0A2540] border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent transition-all"
                                        placeholder="admin@vitta.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#0A2540] border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent transition-all"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#00D4FF] hover:bg-[#0099CC] text-[#0A2540] font-bold py-3.5 rounded-xl shadow-lg hover:shadow-[#00D4FF]/25 transform active:scale-[0.98] transition-all duration-200 text-lg mt-4"
                                >
                                    Access Dashboard
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link to="/login" className="text-slate-500 text-sm hover:text-white transition-colors">
                                    Return to User Login
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <footer className="relative z-10 py-6 text-center text-slate-600 text-sm">
                &copy; Vitta Bank Internal Systems. Confidential.
            </footer>
        </div>
    );
};

export default AdminLogin;
