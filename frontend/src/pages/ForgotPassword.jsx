import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUniversity, FaEnvelope, FaLock, FaArrowLeft, FaCheckCircle, FaKey } from 'react-icons/fa';
import api from '../api/axios';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password, 4: success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setMessage('OTP sent to your email address');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to send OTP. Please check your email.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await api.post('/auth/verify-reset-otp', { email, otp });
            setMessage('OTP verified successfully');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition-all shadow-sm"
                                    placeholder="Enter your registered email"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#635BFF] hover:bg-[#5349e0] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(99,91,255,0.39)] hover:shadow-[0_6px_20px_rgba(99,91,255,0.23)] transform active:scale-[0.98] transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                );

            case 2:
                return (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div className="text-center mb-4">
                            <p className="text-slate-600 text-sm">
                                We've sent a 6-digit OTP to <span className="font-semibold text-slate-800">{email}</span>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Enter OTP</label>
                            <div className="relative">
                                <FaKey className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition-all shadow-sm text-center text-2xl tracking-widest font-mono"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full bg-[#635BFF] hover:bg-[#5349e0] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(99,91,255,0.39)] hover:shadow-[0_6px_20px_rgba(99,91,255,0.23)] transform active:scale-[0.98] transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep(1); setOtp(''); }}
                            className="w-full text-slate-500 hover:text-slate-700 font-medium py-2 text-sm"
                        >
                            Didn't receive OTP? Go back
                        </button>
                    </form>
                );

            case 3:
                return (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">New Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition-all shadow-sm"
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Confirm Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition-all shadow-sm"
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#635BFF] hover:bg-[#5349e0] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(99,91,255,0.39)] hover:shadow-[0_6px_20px_rgba(99,91,255,0.23)] transform active:scale-[0.98] transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                );

            case 4:
                return (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                            <FaCheckCircle className="text-4xl text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Password Reset Successful!</h3>
                            <p className="text-slate-600">Your password has been changed successfully. You can now login with your new password.</p>
                        </div>
                        <Link
                            to="/login"
                            className="inline-block w-full bg-[#635BFF] hover:bg-[#5349e0] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(99,91,255,0.39)] hover:shadow-[0_6px_20px_rgba(99,91,255,0.23)] transition-all duration-200 text-lg text-center"
                        >
                            Go to Login
                        </Link>
                    </div>
                );

            default:
                return null;
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Forgot Password';
            case 2: return 'Verify OTP';
            case 3: return 'Create New Password';
            case 4: return 'Success';
            default: return 'Forgot Password';
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 1: return 'Enter your email to receive a password reset OTP.';
            case 2: return 'Enter the 6-digit OTP sent to your email.';
            case 3: return 'Create a strong new password for your account.';
            default: return '';
        }
    };

    return (
        <div className="w-full min-h-screen bg-white font-sans selection:bg-[#635BFF] selection:text-white">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 stripe-mesh-bg"></div>
                <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-white via-white/80 to-transparent"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 w-full py-4 px-6 flex items-center gap-3">
                <div className="bg-[#635BFF] p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                    <FaUniversity className="text-white text-2xl" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                    Vitta <span className="font-light text-slate-500">Bank</span>
                </span>
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-[480px]"
                >
                    <div className="bg-white p-10 relative overflow-hidden rounded-2xl shadow-none border border-slate-200">
                        {/* Decorative top shape */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#635BFF] to-[#00D4FF]"></div>

                        {/* Back Link */}
                        {step < 4 && (
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-slate-500 hover:text-[#635BFF] text-sm font-medium mb-6 transition-colors"
                            >
                                <FaArrowLeft className="text-xs" />
                                Back to Login
                            </Link>
                        )}

                        {/* Step Indicator */}
                        {step < 4 && (
                            <div className="flex items-center justify-center gap-2 mb-8">
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        className={`h-2 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-[#635BFF]' : s < step ? 'w-2 bg-[#635BFF]' : 'w-2 bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{getStepTitle()}</h2>
                            {getStepDescription() && (
                                <p className="text-slate-500 text-base">{getStepDescription()}</p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 border border-red-100">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        {message && step !== 4 && (
                            <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 border border-emerald-100">
                                <FaCheckCircle className="text-emerald-500" />
                                {message}
                            </div>
                        )}

                        {renderStep()}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
