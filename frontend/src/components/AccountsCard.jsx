import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const AccountsCard = ({ refreshTrigger }) => {
    const { user } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [account, setAccount] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [fdAmount, setFdAmount] = useState('');
    const [showFd, setShowFd] = useState(false);

    const [limit, setLimit] = useState(5);

    useEffect(() => {
        fetchData();
    }, [startDate, endDate, refreshTrigger, limit]);

    const fetchData = async () => {
        try {
            const accountsRes = await api.get('/accounts/');
            if (accountsRes.data.length > 0) {
                const acc = accountsRes.data[0];
                setAccount(acc);

                let url = `/accounts/${acc.id}/transactions?limit=${limit}`;
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
        }
    };

    // ... (rest of the code)


    const handleCreateFD = async () => {
        try {
            await api.post('/accounts/fixed-deposit', {
                account_id: account.id,
                amount: parseFloat(fdAmount)
            });
            alert('Fixed Deposit created!');
            setFdAmount('');
            setShowFd(false);
            fetchData(); // Refresh balance and txns
        } catch (error) {
            alert('Failed to create FD: ' + (error.response?.data?.detail || error.message));
        }
    };

    return (
        <div className="card-base p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white capitalize">
                        {account ? `${account.account_type} Account` : 'Loading...'}
                    </h3>
                    <p className="text-sm text-slate-400 font-mono mt-1">
                        {account ? `****${account.account_number.slice(-4)}` : 'Loading...'}
                    </p>
                </div>
                <div className="text-right">
                    <div className="mt-4 space-y-2">
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400">Account Holder</p>
                            <p className="text-sm font-medium text-white">{user?.full_name || 'Client'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400">Account Number</p>
                            <p className="text-sm font-medium text-white">{account ? `****${account.account_number.slice(-4)}` : 'Loading...'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => setShowFd(!showFd)}
                        className="text-xs font-medium text-[#005EB8] hover:text-white border border-[#005EB8] hover:bg-[#005EB8] px-3 py-1.5 rounded transition-colors mr-2"
                    >
                        {showFd ? 'Cancel FD' : 'Open Fixed Deposit'}
                    </button>

                    <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-800 rounded px-2 py-1">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">From</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-xs text-slate-300 focus:outline-none w-24"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-800 rounded px-2 py-1">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">To</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-xs text-slate-300 focus:outline-none w-24"
                        />
                    </div>
                </div>
            </div>

            {/* FD Form */}
            {showFd && (
                <div className="mb-6 p-4 bg-slate-950/50 border border-slate-800 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-medium mb-3 text-sm text-slate-300">Create Fixed Deposit</h4>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Amount (Min 500)"
                            value={fdAmount}
                            onChange={(e) => setFdAmount(e.target.value)}
                            className="input-field"
                        />
                        <button onClick={handleCreateFD} className="btn-primary whitespace-nowrap">
                            Confirm
                        </button>
                    </div>
                </div>
            )}

            {/* Transactions Table */}
            <div className="flex-1 overflow-hidden flex flex-col mt-4">
                <div className="flex justify-between items-center mb-3 px-1">
                    <h4 className="font-semibold text-sm text-slate-300">Recent Activity</h4>
                    <span
                        onClick={() => setLimit(limit === 5 ? 10 : 5)}
                        className="text-xs text-slate-500 cursor-pointer hover:text-slate-300 transition-colors"
                    >
                        {limit === 5 ? 'View All' : 'Show Less'}
                    </span>
                </div>

                <div className="overflow-y-auto flex-1 -mx-6 px-6 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[#0f172a] z-10 shadow-sm">
                            <tr>
                                <th className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Date</th>
                                <th className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                            {transactions.map((txn) => (
                                <tr key={txn.id} className="group hover:bg-slate-800/20 transition-colors">
                                    <td className="py-3 text-xs text-slate-400 font-mono whitespace-nowrap">
                                        {new Date(txn.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                    </td>
                                    <td className="py-3 text-sm text-slate-300 group-hover:text-white transition-colors font-medium">
                                        {txn.description}
                                    </td>
                                    <td className={`py-3 text-sm font-mono font-medium text-right whitespace-nowrap ${txn.amount > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                        {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {transactions.length === 0 && (
                        <div className="text-center py-12 text-slate-500 text-sm italic">
                            No transactions found for this period.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountsCard;
