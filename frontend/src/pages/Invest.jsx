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

    // PIN verification states
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [pendingAction, setPendingAction] = useState(null); // 'buy' or 'sell'



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
        setPendingAction('buy');
        setPin('');
        setShowPinModal(true);
    };

    const confirmInvest = async () => {
        if (pin.length !== 4) {
            alert("Please enter a 4-digit PIN");
            return;
        }

        setProcessing(true);
        try {
            const selectedItem = marketData.find(m => m.symbol === selectedSymbol);
            const type = selectedItem?.type || 'stock';

            await api.post('/investments/invest', {
                symbol: selectedSymbol,
                amount: parseFloat(amount),
                investment_type: type,
                pin: pin
            });

            alert('Investment successful!');
            setAmount('');
            setShowPinModal(false);
            setPin('');
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
        setPendingAction('sell');
        setPin('');
        setShowPinModal(true);
    };

    const confirmSell = async () => {
        if (pin.length !== 4) {
            alert("Please enter a 4-digit PIN");
            return;
        }

        setProcessing(true);
        try {
            await api.post('/investments/sell', {
                symbol: sellSymbol,
                quantity: parseFloat(sellQuantity),
                pin: pin
            });

            alert('Sale successful!');
            setSellModalOpen(false);
            setShowPinModal(false);
            setPin('');
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
        <div className="min-h-screen bg-[#0B1221] text-slate-200 relative overflow-hidden">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#00D4FF]/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-[#635BFF]/15 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cpath%20d%3D%22M60%200H0v60%22%20fill%3D%22none%22%20stroke%3D%22rgba(255,255,255,0.03)%22/%3E%3C/svg%3E')] opacity-50"></div>
            </div>

            <Navbar />

            <main className="relative z-10 container mx-auto px-6 pt-24 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                    <div>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Portfolio Management</p>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Investments</h1>
                        <p className="text-slate-400 mt-2">Manage your portfolio and explore markets</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-[1px] rounded-2xl">
                        <div className="bg-[#0B1221] rounded-2xl px-6 py-4">
                            <p className="text-sm text-slate-400 mb-1">Total Portfolio Value</p>
                            <p className="text-3xl font-bold text-white tracking-tight">
                                ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Market Data & Trade */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Trade Form */}
                        <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
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
                                                    <p className="font-mono font-medium text-sm text-white">₹{currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
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

            {/* PIN Verification Modal */}
            {showPinModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => { setShowPinModal(false); setPin(''); }}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        >
                            ✕
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🔐</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Enter PIN to Confirm</h3>
                            <p className="text-slate-400 text-sm">
                                {pendingAction === 'buy'
                                    ? `Confirm investment of ₹${parseFloat(amount).toLocaleString('en-IN')} in ${selectedSymbol}`
                                    : `Confirm sale of ${parseFloat(sellQuantity).toFixed(4)} ${sellSymbol}`}
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-medium text-amber-400 mb-2 text-center">🔐 Enter 4-digit PIN</label>
                            <input
                                type="password"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                onKeyDown={(e) => e.key === 'Enter' && (pendingAction === 'buy' ? confirmInvest() : confirmSell())}
                                className="input-field text-center text-xl tracking-[0.5em] font-mono"
                                placeholder="••••"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowPinModal(false); setPin(''); }}
                                className="flex-1 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={pendingAction === 'buy' ? confirmInvest : confirmSell}
                                disabled={processing || pin.length !== 4}
                                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Invest;
