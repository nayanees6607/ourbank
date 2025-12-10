import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { FaWallet, FaHistory, FaArrowUp, FaArrowDown, FaExchangeAlt, FaUniversity, FaDownload } from 'react-icons/fa';

const Accounts = () => {
    const [transactions, setTransactions] = useState([]);
    const [account, setAccount] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        try {
            const accountsRes = await api.get('/accounts/');
            if (accountsRes.data.length > 0) {
                const acc = accountsRes.data[0];
                setAccount(acc);

                let url = `/accounts/${acc.id}/transactions?limit=50`;
                if (startDate) url += `&start_date=${startDate}`;
                if (endDate) url += `&end_date=${endDate}`;
                const txnsRes = await api.get(url);
                setTransactions(txnsRes.data);
            }
        } catch (error) {
            console.error("Failed to fetch account data", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadStatement = async () => {
        if (!account) return;
        setDownloading(true);
        try {
            let url = `/accounts/${account.id}/statement`;
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await api.get(url, { responseType: 'blob' });

            // Create download link
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `Vitta_Bank_Statement.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            alert('Failed to download statement: ' + (error.response?.data?.detail || error.message));
        } finally {
            setDownloading(false);
        }
    };

    const getTransactionIcon = (type, amount) => {
        if (type === 'deposit' || amount > 0) return <FaArrowDown className="text-emerald-400" />;
        if (type === 'withdrawal') return <FaArrowUp className="text-red-400" />;
        return <FaExchangeAlt className="text-blue-400" />;
    };

    return (
        <div className="min-h-screen bg-[#0B1221] text-slate-200 relative overflow-hidden">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#635BFF]/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-[#00D4FF]/15 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cpath%20d%3D%22M60%200H0v60%22%20fill%3D%22none%22%20stroke%3D%22rgba(255,255,255,0.03)%22/%3E%3C/svg%3E')] opacity-50"></div>
            </div>

            <Navbar />

            <main className="relative z-10 container mx-auto px-6 pt-24 pb-20">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10"
                >
                    <div>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Financial Overview</p>
                        <h1 className="text-4xl font-bold text-white tracking-tight">My Accounts</h1>
                        <p className="text-slate-400 mt-2">Detailed transaction history and account overview</p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-[#635BFF] to-[#00D4FF] p-[1px] rounded-2xl"
                    >
                        <div className="bg-[#0B1221] rounded-2xl px-6 py-4">
                            <p className="text-sm text-slate-400 mb-1">Available Balance</p>
                            <p className="text-3xl font-bold text-white tracking-tight">
                                ₹{account ? account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Transaction History */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Filter Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#00D4FF] flex items-center justify-center">
                                    <FaHistory className="text-white text-lg" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Transaction History</h3>
                            </div>
                            <div className="flex gap-3 items-center">
                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                                    <span className="text-xs text-slate-400 uppercase font-semibold">From</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-transparent text-sm text-white focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                                    <span className="text-xs text-slate-400 uppercase font-semibold">To</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-transparent text-sm text-white focus:outline-none"
                                    />
                                </div>
                                <button
                                    onClick={downloadStatement}
                                    disabled={downloading}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#635BFF] to-[#00D4FF] rounded-xl text-white font-medium hover:shadow-lg hover:shadow-[#635BFF]/25 transition-all duration-200 disabled:opacity-50"
                                    title="Download PDF Statement"
                                >
                                    <FaDownload className="text-sm" />
                                    {downloading ? 'Downloading...' : 'Download PDF'}
                                </button>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider w-12"></th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider w-32">Date</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {transactions.map((txn, index) => (
                                        <motion.tr
                                            key={txn.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="group hover:bg-white/5 transition-all duration-200"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                    {getTransactionIcon(txn.transaction_type, txn.amount)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-400 font-mono whitespace-nowrap">
                                                {new Date(txn.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-300 group-hover:text-white transition-colors font-medium">
                                                {txn.description}
                                            </td>
                                            <td className={`py-4 px-6 text-sm font-mono font-bold text-right whitespace-nowrap ${txn.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                                                {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-16 text-slate-500">
                                                <FaExchangeAlt className="mx-auto mb-3 text-3xl opacity-50" />
                                                <p className="text-sm">No transactions found for this period.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Account Details Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                    <FaUniversity className="text-white text-lg" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Account Details</h3>
                            </div>
                            <div className="space-y-5">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Account Number</p>
                                    <p className="text-lg font-mono text-white font-medium">{account?.account_number}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Account Type</p>
                                    <p className="text-base text-white capitalize font-medium">{account?.account_type}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Bank Routing</p>
                                    <p className="text-base font-mono text-white font-medium">021000021</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Total Income</span>
                                    <span className="text-emerald-400 font-mono font-bold">
                                        +₹{transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Total Expenses</span>
                                    <span className="text-red-400 font-mono font-bold">
                                        -₹{Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white font-medium">Total Transactions</span>
                                        <span className="text-white font-bold">{transactions.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Accounts;

