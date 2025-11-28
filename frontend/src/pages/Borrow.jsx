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

        setLoading(true);
        try {
            await api.post('/loans/apply', {
                amount: parseFloat(amount),
                loan_type: selectedOfferType
            });
            alert('Loan application submitted!');
            setAmount('');
            fetchLoans();
        } catch (error) {
            alert('Loan application failed');
        } finally {
            setLoading(false);
        }
    };

    const totalDebt = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const selectedOffer = loanOffers.find(o => o.type === selectedOfferType);

    return (
        <div className="min-h-screen bg-[#0B1221] text-slate-200 pb-20 font-inter relative">
            <Navbar />
            <main className="container mx-auto px-6 py-10">
                <div className="flex justify-between items-end border-b border-slate-800/60 pb-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Borrow</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-slate-400 text-sm">Manage your loans and credit lines</p>
                            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                                Client: {user?.full_name || 'Client'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-white tracking-tight">
                            ₹{totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-slate-400">Total Outstanding Debt</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Loan Application */}
                    <div className="lg:col-span-1">
                        <div className="card-base p-6 sticky top-24">
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
                                        placeholder={`Max ₹${selectedOffer?.max_amount.toLocaleString()}`}
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
                                            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500/20">
                                                Active
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase">Principal Amount</p>
                                                <p className="text-2xl font-mono font-bold text-white">₹{loan.amount.toLocaleString()}</p>
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
                                <p className="text-3xl font-mono font-bold text-white">₹{selectedLoan.amount.toLocaleString()}</p>
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
                                    <span className="text-sm font-medium text-white">₹{(selectedLoan.amount * 0.1).toLocaleString()}</span>
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
        </div>
    );
};

export default Borrow;
