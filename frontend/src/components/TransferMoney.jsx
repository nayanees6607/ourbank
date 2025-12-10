import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const TransferMoney = () => {
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    const [myAccountId, setMyAccountId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPinInput, setShowPinInput] = useState(false);

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await api.get('/accounts/');
                if (res.data.length > 0) setMyAccountId(res.data[0].id);
            } catch (error) {
                console.error("Failed to fetch account", error);
            }
        };
        fetchAccount();
    }, []);

    const initiateTransfer = () => {
        if (!myAccountId) {
            alert("Account information not loaded. Please refresh the page or try logging in again.");
            return;
        }
        if (!toAccount || !amount) {
            alert("Please enter both account number and amount");
            return;
        }
        setShowPinInput(true);
    };

    const handleTransfer = async () => {
        if (pin.length !== 4) {
            alert("Please enter a 4-digit PIN");
            return;
        }

        setLoading(true);
        try {
            await api.post('/accounts/transfer', {
                from_account_id: myAccountId,
                to_account_number: toAccount,
                amount: parseFloat(amount),
                pin: pin
            });
            alert('Transfer successful!');
            setToAccount('');
            setAmount('');
            setPin('');
            setShowPinInput(false);
        } catch (error) {
            alert('Transfer failed: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/60">
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">To Account Number</label>
                    <input
                        type="text"
                        value={toAccount}
                        onChange={(e) => setToAccount(e.target.value)}
                        className="input-field bg-slate-950/80"
                        placeholder="Enter account number"
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Amount (₹)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input-field bg-slate-950/80"
                        placeholder="0.00"
                    />
                </div>
                {!showPinInput && (
                    <button
                        onClick={initiateTransfer}
                        disabled={loading}
                        className="btn-primary h-[38px] w-full md:w-auto whitespace-nowrap px-6 shadow-lg shadow-blue-900/20"
                    >
                        Send Money
                    </button>
                )}
            </div>

            {showPinInput && (
                <div className="flex flex-col md:flex-row gap-4 items-end border-t border-slate-700 pt-4 mt-2">
                    <div className="flex-1 w-full md:w-auto">
                        <label className="block text-xs font-medium text-amber-400 mb-1.5 ml-1">🔐 Enter 4-digit PIN to authorize</label>
                        <input
                            type="password"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            className="input-field bg-slate-950/80 text-center text-xl tracking-[0.5em] font-mono"
                            placeholder="••••"
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={handleTransfer}
                        disabled={loading || pin.length !== 4}
                        className="btn-primary h-[38px] w-full md:w-auto whitespace-nowrap px-6 shadow-lg shadow-blue-900/20 bg-gradient-to-r from-emerald-500 to-emerald-600 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : '✓ Confirm Transfer'}
                    </button>
                    <button
                        onClick={() => { setShowPinInput(false); setPin(''); }}
                        className="h-[38px] px-4 text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default TransferMoney;
