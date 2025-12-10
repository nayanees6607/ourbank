import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaSearch, FaSignOutAlt, FaArrowLeft, FaCheckCircle, FaTimesCircle, FaClipboardList } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AdminCards = () => {
    const { user, logout, loading: authLoading } = useContext(AuthContext);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;
        if (!user?.is_admin) {
            navigate('/dashboard');
            return;
        }

        const fetchCards = async () => {
            try {
                const res = await api.get('/cards/admin/all');
                setCards(res.data);
            } catch (error) {
                console.error("Failed to fetch cards", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCards();
    }, [user, navigate, authLoading]);

    const handleCardAction = async (cardId, action) => {
        if (!confirm(`Are you sure you want to ${action} this card application?`)) return;
        setActionLoading(cardId);
        try {
            await api.post(`/cards/${cardId}/${action}`);
            const res = await api.get('/cards/admin/all');
            setCards(res.data);
        } catch (error) {
            alert(`Failed to ${action} card`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin-login');
    };

    // Filter Logic
    const filteredCards = cards.filter(c => {
        const matchesSearch = c.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.card_type?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const statsPending = cards.filter(c => c.status === 'pending').length;
    const statsActive = cards.filter(c => c.status === 'active').length;
    const statsTotal = cards.length;

    // Action Section Logic
    const showActionSection = (filterStatus === 'all' || filterStatus === 'pending') && cards.filter(c => c.status === 'pending').length > 0;
    const pendingCardsForAction = cards.filter(c => c.status === 'pending');

    if (loading) return (
        <div className="min-h-screen bg-[#0A2540] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0A2540] text-white font-sans selection:bg-[#00D4FF] selection:text-[#0A2540] relative overflow-hidden">

            {/* Background Texture & Gradients */}
            <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#F43F5E]/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#635BFF]/10 rounded-full blur-[120px]"></div>

            <div className="relative z-10 flex flex-col min-h-screen">

                {/* Header */}
                <header className="px-6 py-4 border-b border-white/10 bg-[#0A2540]/80 backdrop-blur-md sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-white transition-colors">
                                <FaArrowLeft />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#F43F5E] to-[#635BFF] rounded-xl flex items-center justify-center shadow-lg shadow-[#F43F5E]/20">
                                    <FaCreditCard className="text-white text-lg" />
                                </div>
                                <h1 className="text-xl font-bold tracking-tight">Card<span className="text-[#F43F5E]">Manager</span></h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="relative hidden md:block">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search cards..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#F43F5E] transition-colors w-64 placeholder-slate-500"
                                />
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
                </header>

                <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <p className="text-slate-400 text-sm font-medium mb-1">Pending Checks</p>
                            <p className="text-3xl font-bold text-amber-400">{statsPending}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <p className="text-slate-400 text-sm font-medium mb-1">Active Cards</p>
                            <p className="text-3xl font-bold text-emerald-400">{statsActive}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <p className="text-slate-400 text-sm font-medium mb-1">Total Issued</p>
                            <p className="text-3xl font-bold text-white">{statsTotal}</p>
                        </div>
                    </div>

                    {/* Pending Requests */}
                    {showActionSection && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#132F4C]/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl"
                        >
                            <div className="p-6 border-b border-white/10 bg-amber-500/5">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                    Pending Card Applications
                                </h2>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase">User</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase">Type</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase">Date</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase text-right">Decision</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pendingCardsForAction.map(card => (
                                        <tr key={card.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-5 font-medium">{card.user_name}</td>
                                            <td className="p-5 text-sm text-slate-300 capitalize">
                                                <span className={`px-2 py-0.5 rounded text-xs border uppercase font-medium ${card.card_type === 'credit' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                                    }`}>
                                                    {card.card_type}
                                                </span>
                                            </td>
                                            <td className="p-5 text-sm text-slate-400">{card.created_at ? new Date(card.created_at).toLocaleDateString() : 'N/A'}</td>
                                            <td className="p-5 text-right flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleCardAction(card.id, 'approve')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all font-bold text-xs uppercase disabled:opacity-50"
                                                    disabled={actionLoading === card.id}
                                                >
                                                    <FaCheckCircle /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleCardAction(card.id, 'reject')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-bold text-xs uppercase disabled:opacity-50"
                                                    disabled={actionLoading === card.id}
                                                >
                                                    <FaTimesCircle /> Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}

                    {/* All Cards Registry */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#132F4C]/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl"
                    >
                        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-xl font-bold text-white">Card Registry</h2>

                            {/* Filter Buttons */}
                            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                                {['all', 'active', 'pending', 'rejected'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${filterStatus === status
                                            ? 'bg-[#00D4FF] text-[#0A2540] shadow-lg shadow-[#00D4FF]/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase">Card ID</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase">User</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase">Type</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase">Exp</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase">Status</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase">Date</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredCards.map((card) => (
                                        <tr key={card.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-5 text-xs font-mono text-slate-500">#{String(card.id).slice(-6)}</td>
                                            <td className="p-5 font-medium">{card.user_name}</td>
                                            <td className="p-5 text-slate-300 capitalize">{card.card_type}</td>
                                            <td className="p-5 font-mono text-white">{card.expiry_date}</td>
                                            <td className="p-5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${card.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    card.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        card.status === 'revoked' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>
                                                    {card.status}
                                                </span>
                                            </td>
                                            <td className="p-5 text-slate-400 text-sm">{card.created_at ? new Date(card.created_at).toLocaleDateString() : 'N/A'}</td>
                                            <td className="p-5 text-right">
                                                {card.status === 'active' && (
                                                    <button
                                                        onClick={() => handleCardAction(card.id, 'revoke')}
                                                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-bold text-xs uppercase disabled:opacity-50"
                                                        disabled={actionLoading === card.id}
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCards.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="p-8 text-center text-slate-500">No matching cards found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                </main>
            </div>
        </div>
    );
};

export default AdminCards;
