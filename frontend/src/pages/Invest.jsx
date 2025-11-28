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

    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [sellSymbol, setSellSymbol] = useState('');
    const [sellQuantity, setSellQuantity] = useState('');
    const [maxSellQuantity, setMaxSellQuantity] = useState(0);



    const sellInputRef = React.useRef(null);

    useEffect(() => {
        if (sellModalOpen && sellInputRef.current) {
            sellInputRef.current.focus();
        }
    }, [sellModalOpen]);

    useEffect(() => {
        fetchData();
    }, []);

    // ... (rest of the component)

    // In the return statement, inside the modal:
    <input
        ref={sellInputRef}
        type="number"
        value={sellQuantity}
        onChange={(e) => setSellQuantity(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSell()}
        className="input-field"
        placeholder="Enter quantity to sell"
    />

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

    const openSellModal = (inv) => {
        setSellSymbol(inv.symbol);
        setMaxSellQuantity(inv.quantity);
        setSellQuantity('');
        setSellModalOpen(true);
    };

    const handleSell = async () => {
        if (!sellQuantity || isNaN(sellQuantity) || parseFloat(sellQuantity) <= 0) {
            alert("Please enter a valid quantity");
            return;
        }
        if (parseFloat(sellQuantity) > maxSellQuantity) {
            alert("Insufficient quantity");
            return;
        }

        setProcessing(true);
        try {
            await api.post('/investments/sell', {
                symbol: sellSymbol,
                quantity: parseFloat(sellQuantity)
            });

            alert('Sale successful!');
            setSellModalOpen(false);
            fetchData();
        } catch (error) {
            const detail = error.response?.data?.detail;
            const errorMessage = typeof detail === 'object' ? JSON.stringify(detail) : (detail || error.message);
            alert('Sale failed: ' + errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    const totalValue = investments.reduce((sum, inv) => {
        const marketItem = marketData.find(m => m.symbol === inv.symbol);
        const currentPrice = marketItem ? marketItem.price : inv.current_value;
        return sum + (inv.quantity * currentPrice);
    }, 0);

    return (
        <div className="min-h-screen bg-[#0B1221] text-slate-200 pb-20 font-inter relative">
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
                                        onKeyDown={(e) => e.key === 'Enter' && handleInvest()}
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
                                {investments.map((inv) => {
                                    const marketItem = marketData.find(m => m.symbol === inv.symbol);
                                    const currentPrice = marketItem ? marketItem.price : inv.current_value;
                                    const currentValue = inv.quantity * currentPrice;
                                    const gainLoss = ((currentPrice - inv.purchase_price) / inv.purchase_price) * 100;
                                    const isPositive = gainLoss >= 0;

                                    return (
                                        <div key={inv.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/60">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-sm text-white">{inv.symbol}</p>
                                                    <p className="text-xs text-slate-400 capitalize">{inv.investment_type}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-mono font-medium text-sm text-white">₹{currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                                    <p className={`text-[10px] ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {isPositive ? '+' : ''}{gainLoss.toFixed(2)}%
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 border-t border-slate-800/50 pt-2 mt-2 items-center">
                                                <span>Qty: {inv.quantity.toFixed(4)}</span>
                                                <button
                                                    onClick={() => openSellModal(inv)}
                                                    className="text-xs bg-red-500/10 text-red-400 border border-red-500/50 px-2 py-0.5 rounded hover:bg-red-500/20 transition-colors"
                                                >
                                                    Sell
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
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

            {/* Sell Modal */}
            {sellModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#0f172a] border border-slate-700 p-6 rounded-xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-white mb-4">Sell {sellSymbol}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Quantity (Max: {maxSellQuantity.toFixed(4)})</label>
                                <input
                                    ref={sellInputRef}
                                    type="number"
                                    value={sellQuantity}
                                    onChange={(e) => setSellQuantity(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSell()}
                                    className="input-field"
                                    placeholder="Enter quantity to sell"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setSellModalOpen(false)}
                                    className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSell}
                                    disabled={processing}
                                    className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                    {processing ? 'Processing...' : 'Confirm Sell'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Invest;
