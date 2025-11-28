import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import PinModal from './PinModal';

const TransferMoney = () => {
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [myAccountId, setMyAccountId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

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
        setIsPinModalOpen(true);
    };

    const handleTransfer = async () => {
        setLoading(true);
        try {
            await api.post('/accounts/transfer', {
                from_account_id: myAccountId,
                to_account_number: toAccount,
                amount: parseFloat(amount)
            });
            alert('Transfer successful!');
            setToAccount('');
            setAmount('');
        } catch (error) {
            alert('Transfer failed: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-900/50 p-4 rounded-xl border border-slate-800/60">
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
                <button
                    onClick={initiateTransfer}
                    disabled={loading}
                    className="btn-primary h-[38px] w-full md:w-auto whitespace-nowrap px-6 shadow-lg shadow-blue-900/20"
                >
                    {loading ? 'Sending...' : 'Send Money'}
                </button>
            </div>

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleTransfer}
                title="Authorize Transfer"
            />
        </>
    );
};

export default TransferMoney;
