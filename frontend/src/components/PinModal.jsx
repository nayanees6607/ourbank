import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaLock, FaTimes } from 'react-icons/fa';

const PinModal = ({ isOpen, onClose, onSuccess, title = "Security Verification", flow = "verify" }) => {
    const [pin, setPin] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('verify'); // 'verify' or 'setup'

    const inputRefs = React.useRef([]);

    useEffect(() => {
        if (isOpen) {
            setPin(['', '', '', '']);
            setError('');
            setLoading(false);
            // If flow is 'setup', start in setup mode. Otherwise start in verify.
            setMode(flow === 'setup' ? 'setup' : 'verify');

            // Focus first input after a short delay to ensure modal is rendered
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [isOpen, flow]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newPin = [...pin];
        newPin[index] = element.value;
        setPin(newPin);

        // Focus next input
        if (element.value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            const newPin = [...pin];
            newPin[index - 1] = '';
            setPin(newPin);
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        const pinValue = pin.join('');
        if (pinValue.length !== 4) {
            setError('Please enter a 4-digit PIN');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (mode === 'verify') {
                try {
                    await api.post('/auth/verify-pin', { pin: pinValue });

                    if (flow === 'change') {
                        // If changing PIN, switch to setup mode after verification
                        setMode('setup');
                        setPin(['', '', '', '']);
                        inputRefs.current[0]?.focus();
                    } else {
                        onSuccess();
                        onClose();
                    }
                } catch (err) {
                    if (err.response?.data?.detail === "PIN not set") {
                        setMode('setup');
                        setError('Please create a new PIN');
                        setPin(['', '', '', '']);
                        inputRefs.current[0]?.focus();
                    } else {
                        setError('Incorrect PIN');
                    }
                }
            } else {
                // Setup mode
                await api.post('/auth/set-pin', { pin: pinValue });
                alert('PIN set successfully!');
                onSuccess();
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <FaTimes />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaLock className="text-2xl text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {mode === 'setup' ? (flow === 'change' ? 'Enter New PIN' : 'Set Your PIN') : title}
                    </h3>
                    <p className="text-slate-400 text-sm">
                        {mode === 'setup'
                            ? 'Create a 4-digit PIN for secure transactions.'
                            : 'Enter your 4-digit security PIN to continue.'}
                    </p>
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    {pin.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="password"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-12 h-14 text-center text-2xl font-bold bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white"
                        />
                    ))}
                </div>

                {error && (
                    <p className="text-red-400 text-sm text-center mb-6 bg-red-500/10 py-2 rounded border border-red-500/20">
                        {error}
                    </p>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading || pin.join('').length !== 4}
                    className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Verifying...' : (mode === 'setup' ? 'Set PIN' : 'Verify PIN')}
                </button>
            </div>
        </div>
    );
};

export default PinModal;
