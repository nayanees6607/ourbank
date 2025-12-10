import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Borrow = () => {
    const { user } = useContext(AuthContext);
    const [loans, setLoans] = useState([]);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const [selectedLoan, setSelectedLoan] = useState(null);
    const [loanOffers, setLoanOffers] = useState([]);
    const [selectedOfferType, setSelectedOfferType] = useState('personal');

    // PIN verification states
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');

    useEffect(() => {
        fetchLoans();
        fetchOffers();
    }, []);

    const fetchLoans = async () => {
        try {
            const res = await api.get('/loans/');
            setLoans(res.data);
        } catch (error) {
            console.error("Failed to fetch loans", error);
        }
    };

    const fetchOffers = async () => {
        try {
            const res = await api.get('/loans/offers');
            setLoanOffers(res.data);
        } catch (error) {
            console.error("Failed to fetch loan offers", error);
        }
    };

    const handleApplyLoan = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        setPin('');
        setShowPinModal(true);
    };

    const confirmApplyLoan = async () => {
        if (pin.length !== 4) {
            alert("Please enter a 4-digit PIN");
            return;
        }

        setLoading(true);
        try {
            await api.post('/loans/apply', {
                amount: parseFloat(amount),
                loan_type: selectedOfferType,
                pin: pin
            });
            alert('Loan application submitted for approval!');
            setAmount('');
            setShowPinModal(false);
            setPin('');
            fetchLoans();
        } catch (error) {
            alert('Loan application failed: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    const totalDebt = loans.filter(loan => loan.status === 'active').reduce((sum, loan) => sum + loan.amount, 0);
    const selectedOffer = loanOffers.find(o => o.type === selectedOfferType);

    return (
        <div className="min-h-screen bg-[#0B1221] text-slate-200 relative overflow-hidden">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#635BFF]/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-500/15 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-[#00D4FF]/10 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cpath%20d%3D%22M60%200H0v60%22%20fill%3D%22none%22%20stroke%3D%22rgba(255,255,255,0.03)%22/%3E%3C/svg%3E')] opacity-50"></div>
            </div>

            <Navbar />

            <main className="relative z-10 container mx-auto px-6 pt-24 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                    <div>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Loan Management</p>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Borrow</h1>
                        <p className="text-slate-400 mt-2">Manage your loans and credit lines</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-[1px] rounded-2xl">
                        <div className="bg-[#0B1221] rounded-2xl px-6 py-4">
                            <p className="text-sm text-slate-400 mb-1">Total Outstanding</p>
                            <p className="text-3xl font-bold text-white tracking-tight">
                                ₹{totalDebt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Loan Application */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl sticky top-24">
                            <h3 className="text-lg font-semibold text-white mb-4">Apply for a Loan</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Loan Type</label>
                                    <select
                                        value={selectedOfferType}
                                        onChange={(e) => setSelectedOfferType(e.target.value)}
                                        className="input-field"
                                    >
                                        {loanOffers.map((offer) => (
                                            <option key={offer.type} value={offer.type}>
                                                {offer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Loan Amount (₹)</label>
                                    <input
                                        type="number"
                                        placeholder={`Max ₹${selectedOffer?.max_amount.toLocaleString('en-IN')}`}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800/60">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">Interest Rate</span>
                                        <span className="text-white font-medium">{selectedOffer?.rate}% APR</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Term</span>
                                        <span className="text-white font-medium">12 Months</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleApplyLoan}
                                    disabled={loading}
                                    className="btn-primary w-full"
                                >
                                    {loading ? 'Submitting...' : 'Apply Now'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Loans */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-lg font-semibold text-white">Active Loans</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loans.map((loan) => (
                                <div key={loan.id} className="card-base p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-xl font-bold text-white capitalize">{loan.loan_type.replace('_', ' ')} Loan</h4>
                                                <p className="text-xs text-slate-400 mt-1">ID: #{loan.id}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded border ${loan.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                loan.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                {loan.status}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase">Principal Amount</p>
                                                <p className="text-2xl font-mono font-bold text-white">₹{loan.amount.toLocaleString('en-IN')}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase">Interest Rate</p>
                                                    <p className="text-sm font-medium text-slate-200">{loan.interest_rate}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase">Next Payment</p>
                                                    <p className="text-sm font-medium text-slate-200">Oct 24, 2025</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedLoan(loan)}
                                            className="w-full mt-6 btn-secondary text-xs"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {loans.length === 0 && (
                                <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                                    <p className="text-slate-500 text-sm">No active loans.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Loan Details Modal */}
            {selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                        <button
                            onClick={() => setSelectedLoan(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-2xl font-bold text-white mb-1">Loan Details</h3>
                        <p className="text-slate-400 text-sm mb-6">ID: #{selectedLoan.id}</p>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <p className="text-xs text-slate-500 uppercase mb-1">Principal Amount</p>
                                <p className="text-3xl font-mono font-bold text-white">₹{selectedLoan.amount.toLocaleString('en-IN')}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-800/30 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Type</p>
                                    <p className="text-sm font-medium text-white capitalize">{selectedLoan.loan_type.replace('_', ' ')}</p>
                                </div>
                                <div className="p-3 bg-slate-800/30 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Status</p>
                                    <p className="text-sm font-medium text-emerald-400 capitalize">{selectedLoan.status}</p>
                                </div>
                                <div className="p-3 bg-slate-800/30 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Interest Rate</p>
                                    <p className="text-sm font-medium text-white">{selectedLoan.interest_rate}% APR</p>
                                </div>
                                <div className="p-3 bg-slate-800/30 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Term</p>
                                    <p className="text-sm font-medium text-white">12 Months</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-400">Next Payment Date</span>
                                    <span className="text-sm font-medium text-white">Oct 24, 2025</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400">Next Payment Amount</span>
                                    <span className="text-sm font-medium text-white">₹{(selectedLoan.amount * 0.1).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedLoan(null)}
                                className="w-full btn-primary mt-4"
                            >
                                Close
                            </button>
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
                            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🔐</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Enter PIN to Confirm</h3>
                            <p className="text-slate-400 text-sm">
                                Confirm loan application for ₹{parseFloat(amount || 0).toLocaleString('en-IN')}
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-medium text-amber-400 mb-2 text-center">🔐 Enter 4-digit PIN</label>
                            <input
                                type="password"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                onKeyDown={(e) => e.key === 'Enter' && confirmApplyLoan()}
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
                                onClick={confirmApplyLoan}
                                disabled={loading || pin.length !== 4}
                                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Apply Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Borrow;
