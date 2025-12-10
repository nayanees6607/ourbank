import React, { useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { FaLock, FaTimes, FaKey, FaCheckCircle, FaEnvelope } from 'react-icons/fa';

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useContext(AuthContext);
    const [step, setStep] = useState(1); // 1: request OTP, 2: enter OTP & new password, 3: success
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState({
        new_password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRequestOTP = async () => {
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/request-password-change-otp');
            setMessage('OTP sent to your registered email');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.new_password !== formData.confirm_password) {
            setError("New passwords don't match");
            return;
        }

        if (formData.new_password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/change-password-with-otp', {
                otp: otp,
                new_password: formData.new_password
            });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setOtp('');
        setFormData({ new_password: '', confirm_password: '' });
        setError('');
        setMessage('');
        onClose();
    };

    const handleSuccess = () => {
        onSuccess && onSuccess();
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <FaTimes />
                </button>

                {step === 1 && (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaLock className="text-2xl text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Change Password</h3>
                            <p className="text-slate-400 text-sm">We'll send an OTP to your registered email to verify your identity.</p>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <FaEnvelope className="text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">OTP will be sent to</p>
                                    <p className="text-white font-medium">{user?.email || 'your registered email'}</p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded border border-red-500/20 mb-4">
                                {error}
                            </p>
                        )}

                        <button
                            onClick={handleRequestOTP}
                            disabled={loading}
                            className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaKey className="text-2xl text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Enter OTP & New Password</h3>
                            <p className="text-slate-400 text-sm">Enter the 6-digit OTP sent to your email and your new password.</p>
                        </div>

                        {message && (
                            <div className="bg-emerald-500/10 text-emerald-400 text-sm text-center py-2 rounded border border-emerald-500/20 mb-4 flex items-center justify-center gap-2">
                                <FaCheckCircle />
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">OTP Code</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center text-2xl tracking-widest font-mono"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="new_password"
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded border border-red-500/20">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setStep(1); setOtp(''); setError(''); setMessage(''); }}
                                className="w-full text-slate-500 hover:text-slate-300 text-sm py-2"
                            >
                                ← Go back
                            </button>
                        </form>
                    </>
                )}

                {step === 3 && (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCheckCircle className="text-4xl text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Password Changed!</h3>
                        <p className="text-slate-400 text-sm mb-6">Your password has been updated successfully.</p>
                        <button
                            onClick={handleSuccess}
                            className="w-full btn-primary py-3 text-base font-semibold"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChangePasswordModal;
