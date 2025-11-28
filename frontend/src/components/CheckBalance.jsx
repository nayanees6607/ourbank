import React, { useState } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash, FaWallet } from 'react-icons/fa';
import PinModal from './PinModal';

const CheckBalance = () => {
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [isBalanceVisible, setIsBalanceVisible] = useState(false);
    const [balance, setBalance] = useState(null);

    const handlePinSuccess = async () => {
        try {
            const res = await api.get('/accounts/');
            if (res.data.length > 0) {
                setBalance(res.data[0].balance);
                setIsBalanceVisible(true);
            } else {
                alert('No account found');
            }
        } catch (error) {
            console.error("Failed to fetch balance", error);
        }
    };

    const closeBalance = () => {
        setIsBalanceVisible(false);
        setBalance(null);
    };

    return (
        <>
            <button
                onClick={() => setIsPinModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center space-x-2 transition-transform hover:scale-110"
            >
                <FaWallet />
                <span>Check Balance</span>
            </button>

            {/* Reusable PIN Modal */}
            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handlePinSuccess}
                title="View Balance"
            />

            {/* Balance Display Modal */}
            <AnimatePresence>
                {isBalanceVisible && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
                        onClick={closeBalance}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-80 border border-slate-700 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-bold mb-6 text-white">Check Balance</h3>

                            <div className="mb-6">
                                <p className="text-slate-400 text-sm mb-1">Available Balance</p>
                                <p className="text-4xl font-bold text-emerald-400">₹{balance?.toLocaleString()}</p>
                            </div>

                            <button onClick={closeBalance} className="text-slate-500 hover:text-slate-300 text-sm">Close</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CheckBalance;
