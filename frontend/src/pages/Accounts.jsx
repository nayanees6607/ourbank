import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const Accounts = () => {
    const [transactions, setTransactions] = useState([]);
    const [account, setAccount] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        try {
            const accountsRes = await api.get('/accounts/');
            if (accountsRes.data.length > 0) {
                const acc = accountsRes.data[0];
                setAccount(acc);

                let url = `/accounts/${acc.id}/transactions?limit=50`; // Fetch more for full page
                if (startDate) {
                    url += `&start_date=${startDate}`;
                }
                if (endDate) {
                    url += `&end_date=${endDate}`;
                }
                const txnsRes = await api.get(url);
                setTransactions(txnsRes.data);
            }
        } catch (error) {
            console.error("Failed to fetch account data", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1221] text-slate-200 pb-20 font-inter">
            <Navbar />
            <main className="container mx-auto px-6 py-10">
                <div className="flex justify-between items-end border-b border-slate-800/60 pb-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Accounts</h1>
                        <p className="text-slate-400 mt-1 text-sm">Detailed transaction history and account overview</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-white tracking-tight">
                            ₹{account ? account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                        </p>
                        <p className="text-sm text-slate-400">Available Balance</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Transaction History */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">Transaction History</h3>
                            <div className="flex gap-2 items-center">
                                <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded px-3 py-1.5">
                                    <span className="text-xs text-slate-500 uppercase font-semibold">From</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-transparent text-sm text-slate-300 focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded px-3 py-1.5">
                                    <span className="text-xs text-slate-500 uppercase font-semibold">To</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-transparent text-sm text-slate-300 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/30 rounded-xl border border-slate-800/60 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-900/80 border-b border-slate-800">
                                    <tr>
                                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Date</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/30">
                                    {transactions.map((txn) => (
                                        <tr key={txn.id} className="group hover:bg-slate-800/20 transition-colors">
                                            <td className="py-4 px-6 text-sm text-slate-400 font-mono whitespace-nowrap">
                                                {new Date(txn.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-300 group-hover:text-white transition-colors font-medium">
                                                {txn.description}
                                            </td>
                                            <td className={`py-4 px-6 text-sm font-mono font-medium text-right whitespace-nowrap ${txn.amount > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-12 text-slate-500 text-sm italic">
                                                No transactions found for this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Account Details Sidebar */}
                    <div className="space-y-6">
                        <div className="card-base p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase">Account Number</p>
                                    <p className="text-lg font-mono text-slate-200">{account?.account_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase">Account Type</p>
                                    <p className="text-base text-slate-200 capitalize">{account?.account_type}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase">Routing Number</p>
                                    <p className="text-base font-mono text-slate-200">021000021</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Accounts;
