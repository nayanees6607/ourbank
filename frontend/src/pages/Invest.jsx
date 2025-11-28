import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Invest = () => {
    const { user } = useContext(AuthContext);
    const [investments, setInvestments] = useState([]);
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invRes, marketRes] = await Promise.all([
                api.get('/investments/'),
                api.get('/investments/market')
            ]);
            setInvestments(invRes.data);
            setMarketData(marketRes.data);
        } catch (error) {
            console.error("Failed to fetch investment data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvest = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) < 500) {
            alert("Please enter a valid amount (Minimum ₹500)");
            return;
        }
        if (!selectedSymbol) {
            alert("Please select a stock/fund");
            return;
        }

        setProcessing(true);
        try {
            const selectedItem = marketData.find(m => m.symbol === selectedSymbol);
            const type = selectedItem?.type || 'stock';

            await api.post('/investments/invest', {
                symbol: selectedSymbol,
                amount: parseFloat(amount),
                investment_type: type
            });

            alert('Investment successful!');
            setAmount('');
            fetchData();
        } catch (error) {
            const detail = error.response?.data?.detail;
            const errorMessage = typeof detail === 'object' ? JSON.stringify(detail) : (detail || error.message);
            alert('Investment failed: ' + errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    const totalValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.current_value), 0);

    return (
        <div className="min-h-screen bg-[#0B1221] text-slate-200 pb-20 font-inter">
            <Navbar />
            <main className="container mx-auto px-6 py-10">
                <div className="flex justify-between items-end border-b border-slate-800/60 pb-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Investments</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-slate-400 text-sm">Manage your portfolio and explore markets</p>
                            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                                Client: {user?.full_name || 'Client'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-white tracking-tight">
                            ₹{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-slate-400">Total Portfolio Value</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Market Data & Trade */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Trade Form */}
                        <div className="card-base p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Place Order</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Asset</label>
                                    <select
                                        value={selectedSymbol}
                                        onChange={(e) => setSelectedSymbol(e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="">Select Asset</option>
                                        {marketData.map((m) => (
                                            <option key={m.symbol} value={m.symbol}>
                                                {m.name} ({m.symbol}) - ₹{m.price}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Min 500"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                <button
                                    onClick={handleInvest}
                                    disabled={processing}
                                    className="btn-primary w-full h-[42px]"
                                >
                                    {processing ? 'Processing...' : 'Buy Now'}
                                </button>
                            </div>
                        </div>

                        {/* Market Overview */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Market Overview</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {marketData.map((m) => (
                                    <div key={m.symbol} className="card-base p-4 flex justify-between items-center hover:bg-slate-800/40 transition-colors cursor-pointer" onClick={() => setSelectedSymbol(m.symbol)}>
                                        <div>
                                            <p className="font-bold text-white">{m.name}</p>
                                            <p className="text-xs text-slate-400">{m.symbol}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-medium text-white">₹{m.price}</p>
                                            <p className={`text-xs ${m.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {m.change >= 0 ? '+' : ''}{m.change}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Sidebar */}
                    <div className="space-y-6">
                        <div className="card-base p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Your Portfolio</h3>
                            <div className="space-y-3">
                                {investments.map((inv) => (
                                    <div key={inv.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/60">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-sm text-white">{inv.symbol}</p>
                                                <p className="text-xs text-slate-400 capitalize">{inv.investment_type}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono font-medium text-sm text-white">₹{(inv.quantity * inv.current_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                                <p className="text-[10px] text-emerald-400">+2.4%</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 border-t border-slate-800/50 pt-2 mt-2">
                                            <span>Qty: {inv.quantity.toFixed(4)}</span>
                                            <span>Avg: ₹{inv.purchase_price}</span>
                                        </div>
                                    </div>
                                ))}
                                {investments.length === 0 && (
                                    <div className="text-center py-8 text-slate-500 text-sm italic">
                                        No active investments.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Invest;
