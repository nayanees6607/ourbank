import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaExchangeAlt, FaSignOutAlt, FaSearch, FaUniversity, FaCog, FaBell, FaArrowRight, FaCreditCard } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user, logout, loading: authLoading } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total_users: 0, total_transactions: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const [loans, setLoans] = useState([]);
    const [cards, setCards] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [promoteUserId, setPromoteUserId] = useState(null);
    const [promoteUserName, setPromoteUserName] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [promoteLoading, setPromoteLoading] = useState(false);
    const [showDemoteModal, setShowDemoteModal] = useState(false);
    const [demoteUserId, setDemoteUserId] = useState(null);
    const [demoteUserName, setDemoteUserName] = useState('');
    const [demotePassword, setDemotePassword] = useState('');
    const [demoteLoading, setDemoteLoading] = useState(false);

    useEffect(() => {
        if (authLoading) return; // Wait for auth to complete
        if (!user?.is_admin) {
            navigate('/dashboard');
            return;
        }

        const fetchData = async () => {
            try {
                const [usersRes, statsRes, loansRes, cardsRes] = await Promise.all([
                    api.get('/auth/users'),
                    api.get('/auth/stats'),
                    api.get('/loans/admin/all'),
                    api.get('/cards/admin/all')
                ]);
                setUsers(usersRes.data);
                setStats(statsRes.data);
                setLoans(loansRes.data);
                setCards(cardsRes.data);
            } catch (error) {
                console.error("Failed to fetch admin data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 20000); // Refresh every 20 seconds
        return () => clearInterval(interval);
    }, [user, navigate, authLoading]);

    const openPromoteModal = (userId, userName) => {
        setPromoteUserId(userId);
        setPromoteUserName(userName);
        setAdminPassword('');
        setShowPromoteModal(true);
    };

    const handlePromoteUser = async () => {
        if (!adminPassword) {
            alert('Please enter your password');
            return;
        }
        setPromoteLoading(true);
        try {
            const res = await api.post('/auth/promote-user', {
                user_id: promoteUserId,
                admin_password: adminPassword
            });
            alert(res.data.message);
            setShowPromoteModal(false);
            // Refresh users list
            const usersRes = await api.get('/auth/users');
            setUsers(usersRes.data);
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to promote user');
        } finally {
            setPromoteLoading(false);
        }
    };

    const openDemoteModal = (userId, userName) => {
        setDemoteUserId(userId);
        setDemoteUserName(userName);
        setDemotePassword('');
        setShowDemoteModal(true);
    };

    const handleDemoteUser = async () => {
        if (!demotePassword) {
            alert('Please enter your password');
            return;
        }
        setDemoteLoading(true);
        try {
            const res = await api.post('/auth/demote-user', {
                user_id: demoteUserId,
                admin_password: demotePassword
            });
            alert(res.data.message);
            setShowDemoteModal(false);
            // Refresh users list
            const usersRes = await api.get('/auth/users');
            setUsers(usersRes.data);
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to demote user');
        } finally {
            setDemoteLoading(false);
        }
    };

    const handleLoanAction = async (loanId, action) => {
        if (!confirm(`Are you sure you want to ${action} this loan?`)) return;
        setActionLoading(loanId);
        try {
            await api.post(`/loans/${loanId}/${action}`);
            // Refresh loans
            const res = await api.get('/loans/admin/all');
            setLoans(res.data);
            // Refresh stats effectively
            const statsRes = await api.get('/auth/stats');
            setStats(statsRes.data);
        } catch (error) {
            alert(`Failed to ${action} loan`);
        } finally {
            setActionLoading(null);
        }
    };

    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = React.useRef(null);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/admin-login');
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingLoans = loans.filter(l => l.status === 'pending');


    if (loading) return (
        <div className="min-h-screen bg-[#0A2540] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0A2540] text-white font-sans selection:bg-[#00D4FF] selection:text-[#0A2540] relative overflow-hidden">

            {/* Background Texture & Gradients */}
            <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00D4FF]/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#635BFF]/10 rounded-full blur-[120px]"></div>

            <div className="relative z-10 flex flex-col min-h-screen">

                {/* Top Navigation */}
                <header className="px-6 py-4 border-b border-white/10 bg-[#0A2540]/80 backdrop-blur-md sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#00D4FF] to-[#0066FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#00D4FF]/20">
                                <FaUniversity className="text-white text-lg" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight">Vitta<span className="text-[#00D4FF]">Admin</span></h1>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="relative hidden md:block">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00D4FF] transition-colors w-64 placeholder-slate-500"
                                />
                            </div>

                            {/* Notifications Dropdown */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="text-slate-400 hover:text-white transition-colors relative p-2"
                                >
                                    <FaBell className="text-xl" />
                                    {pendingLoans.length > 0 && (
                                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#00D4FF] rounded-full border-2 border-[#0A2540]"></span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-[#132F4C] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                                        <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                            <h3 className="text-sm font-bold text-white">Notifications</h3>
                                            <span className="text-xs text-[#00D4FF] font-medium">{pendingLoans.length} New</span>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {pendingLoans.length > 0 ? (
                                                pendingLoans.map(loan => (
                                                    <div key={loan.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 text-[#00D4FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <FaExchangeAlt className="text-xs" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-white font-medium leading-tight">New Loan Application</p>
                                                                <p className="text-xs text-slate-400 mt-1">
                                                                    <span className="text-white">{loan.user_name}</span> requested <span className="text-[#00D4FF]">₹{loan.amount.toLocaleString('en-IN')}</span> for {loan.loan_type?.replace('_', ' ')}.
                                                                </p>
                                                                <p className="text-[10px] text-slate-500 mt-2">{new Date(loan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-slate-500 text-sm">
                                                    No new notifications
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-8 w-px bg-white/10"></div>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-bold text-white leading-tight">{user?.full_name || 'Admin'}</p>
                                    <p className="text-xs text-[#00D4FF] font-medium">Super Admin</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                    title="Logout"
                                >
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#F43F5E]/30 transition-all duration-300"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FaUsers className="text-6xl text-[#F43F5E]" />
                            </div>
                            <h3 className="text-slate-400 font-medium mb-1">Total Users</h3>
                            <p className="text-4xl font-bold text-white tracking-tight">{users.length}</p>
                            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 w-fit px-2 py-1 rounded-md">
                                <span className="font-bold">+{users.length * 4}%</span>
                                <span className="text-slate-500">from last month</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#F43F5E]/30 transition-all duration-300"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FaExchangeAlt className="text-6xl text-[#F43F5E]" />
                            </div>
                            <h3 className="text-slate-400 font-medium mb-1">Total Transactions</h3>
                            <p className="text-4xl font-bold text-white tracking-tight">842</p>
                            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 w-fit px-2 py-1 rounded-md">
                                <span className="font-bold">+8%</span>
                                <span className="text-slate-500">activity increase</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            onClick={() => navigate('/admin/loans')}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#F43F5E]/30 transition-all duration-300 cursor-pointer"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FaUniversity className="text-6xl text-[#F43F5E]" />
                            </div>
                            <h3 className="text-slate-400 font-medium mb-1">Total Loans</h3>
                            <p className="text-4xl font-bold text-white tracking-tight">{loans.length}</p>
                            {loans.filter(l => l.status === 'pending').length > 0 ? (
                                <div className="mt-4 flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 w-fit px-2 py-1 rounded-md animate-pulse">
                                    <span className="font-bold">{loans.filter(l => l.status === 'pending').length}</span>
                                    <span className="text-amber-200/70">pending approval</span>
                                </div>
                            ) : (
                                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 w-fit px-2 py-1 rounded-md">
                                    <span>{loans.filter(l => l.status === 'active').length}</span>
                                    <span className="text-slate-500">active now</span>
                                </div>
                            )}
                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-[#F43F5E] text-xs font-bold uppercase flex items-center gap-1">
                                Manage <FaArrowRight />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={() => navigate('/admin/cards')}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#F43F5E]/30 transition-all duration-300 cursor-pointer"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FaCreditCard className="text-6xl text-[#F43F5E]" />
                            </div>
                            <h3 className="text-slate-400 font-medium mb-1">Total Cards</h3>
                            <p className="text-4xl font-bold text-white tracking-tight">{cards.length}</p>
                            {cards.filter(c => c.status === 'pending').length > 0 ? (
                                <div className="mt-4 flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 w-fit px-2 py-1 rounded-md animate-pulse">
                                    <span className="font-bold">{cards.filter(c => c.status === 'pending').length}</span>
                                    <span className="text-amber-200/70">pending approval</span>
                                </div>
                            ) : (
                                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 w-fit px-2 py-1 rounded-md">
                                    <span>{cards.filter(c => c.status === 'active').length}</span>
                                    <span className="text-slate-500">active now</span>
                                </div>
                            )}
                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-[#F43F5E] text-xs font-bold uppercase flex items-center gap-1">
                                Manage <FaArrowRight />
                            </div>
                        </motion.div>
                    </div>

                    {/* User Management Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#132F4C]/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl"
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">User Management</h2>
                            <button className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/10 flex items-center gap-2">
                                <FaCog /> Settings
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#635BFF] to-[#00D4FF] flex items-center justify-center text-xs font-bold text-white">
                                                        {u.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <span className="font-medium text-white">{u.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-slate-400 text-sm font-mono">{u.email}</td>
                                            <td className="p-5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.is_admin
                                                    ? 'bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20'
                                                    : 'bg-slate-700/30 text-slate-400 border-slate-600/30'
                                                    }`}>
                                                    {u.is_admin ? 'Admin' : 'Customer'}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.is_active
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                                    {u.is_active ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right flex gap-3 justify-end">
                                                {!u.is_admin && (
                                                    <button
                                                        onClick={() => openPromoteModal(u.id, u.full_name)}
                                                        className="text-[#635BFF] hover:text-[#00D4FF] transition-colors text-sm font-medium"
                                                    >
                                                        Promote
                                                    </button>
                                                )}
                                                {u.is_admin && u.id !== user?.id && (
                                                    <button
                                                        onClick={() => openDemoteModal(u.id, u.full_name)}
                                                        className="text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium"
                                                    >
                                                        Demote
                                                    </button>
                                                )}
                                                <button className="text-slate-500 hover:text-white transition-colors text-sm font-medium">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colspan="5" className="p-8 text-center text-slate-500">
                                                No users found matching "{searchTerm}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </main>
            </div>

            {/* Promote User Modal */}
            {showPromoteModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#132F4C] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">Promote to Admin</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            You are about to promote <span className="text-white font-medium">{promoteUserName}</span> to admin status.
                            <br />Enter your password to confirm.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Your Password</label>
                            <input
                                type="password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#635BFF] transition-colors"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPromoteModal(false)}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePromoteUser}
                                disabled={promoteLoading}
                                className="flex-1 px-4 py-3 bg-[#635BFF] rounded-lg text-white font-medium hover:bg-[#5147f9] transition-colors disabled:opacity-50"
                            >
                                {promoteLoading ? 'Promoting...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Demote User Modal */}
            {showDemoteModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#132F4C] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">Demote Admin</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            You are about to demote <span className="text-white font-medium">{demoteUserName}</span> from admin to regular user.
                            <br />Enter your password to confirm.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Your Password</label>
                            <input
                                type="password"
                                value={demotePassword}
                                onChange={(e) => setDemotePassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDemoteModal(false)}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDemoteUser}
                                disabled={demoteLoading}
                                className="flex-1 px-4 py-3 bg-amber-500 rounded-lg text-black font-medium hover:bg-amber-400 transition-colors disabled:opacity-50"
                            >
                                {demoteLoading ? 'Demoting...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;