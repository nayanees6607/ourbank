import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { FaUniversity, FaSignOutAlt, FaUserCircle, FaKey, FaLock, FaBell, FaCreditCard, FaExchangeAlt, FaHandHoldingUsd, FaExclamationCircle, FaBan, FaTrashAlt, FaTimes } from 'react-icons/fa';
import ChangePasswordModal from './ChangePasswordModal';
import PinModal from './PinModal';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [readNotifications, setReadNotifications] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('readNotifications') || '[]');
        } catch {
            return [];
        }
    });
    const notificationRef = useRef(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    // Fetch notifications on mount
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const notifs = [];

                // Fetch cards (rejected/revoked)
                const cardsRes = await api.get('/cards/');
                cardsRes.data.forEach(card => {
                    if (card.status === 'rejected' || card.status === 'revoked') {
                        notifs.push({
                            id: `card-${card.id}`,
                            type: 'card',
                            status: card.status,
                            title: card.status === 'rejected' ? 'Card Application Rejected' : 'Card Revoked',
                            description: `Your ${card.card_type} card ending in ${card.card_number.slice(-4)} was ${card.status}`,
                            date: card.created_at,
                            icon: card.status === 'rejected' ? 'rejected' : 'revoked'
                        });
                    }
                });

                // Fetch loans (approved/rejected)
                const loansRes = await api.get('/loans/');
                loansRes.data.forEach(loan => {
                    if (loan.status === 'approved' || loan.status === 'rejected') {
                        notifs.push({
                            id: `loan-${loan.id}`,
                            type: 'loan',
                            status: loan.status,
                            title: loan.status === 'approved' ? 'Loan Approved!' : 'Loan Rejected',
                            description: `Your ${loan.loan_type?.replace('_', ' ')} loan of ₹${loan.amount?.toLocaleString('en-IN')} was ${loan.status}`,
                            date: loan.created_at,
                            icon: loan.status === 'approved' ? 'approved' : 'rejected'
                        });
                    }
                });

                // Fetch recent transactions (last 5)
                const accountsRes = await api.get('/accounts/');
                if (accountsRes.data.length > 0) {
                    const accId = accountsRes.data[0].id;
                    const txRes = await api.get(`/accounts/${accId}/transactions`);
                    txRes.data.slice(0, 5).forEach(tx => {
                        notifs.push({
                            id: `tx-${tx.id}`,
                            type: 'transaction',
                            status: tx.transaction_type,
                            title: tx.transaction_type === 'deposit' ? 'Money Received' : tx.transaction_type === 'withdrawal' ? 'Withdrawal' : 'Transfer',
                            description: tx.description || `${tx.transaction_type} of ₹${tx.amount?.toLocaleString('en-IN')}`,
                            date: tx.created_at,
                            icon: tx.transaction_type
                        });
                    });
                }

                // Sort by date (most recent first)
                notifs.sort((a, b) => new Date(b.date) - new Date(a.date));
                setNotifications(notifs.slice(0, 10)); // Limit to 10 most recent
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        if (user) {
            fetchNotifications();
        }
    }, [user]);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteRequest = async () => {
        setDeleteError('');
        setDeleteLoading(true);
        try {
            await api.post('/auth/deletion-request', { reason: deleteReason });
            setDeleteSuccess(true);
        } catch (err) {
            setDeleteError(err.response?.data?.detail || 'Failed to submit request');
        } finally {
            setDeleteLoading(false);
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeleteReason('');
        setDeleteError('');
        setDeleteSuccess(false);
    };

    const getNotifIcon = (notif) => {
        if (notif.type === 'card') {
            return notif.icon === 'rejected' ? <FaExclamationCircle className="text-xs" /> : <FaBan className="text-xs" />;
        } else if (notif.type === 'loan') {
            return <FaHandHoldingUsd className="text-xs" />;
        } else {
            return <FaExchangeAlt className="text-xs" />;
        }
    };

    const getNotifColor = (notif) => {
        if (notif.type === 'card') {
            return notif.icon === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400';
        } else if (notif.type === 'loan') {
            return notif.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400';
        } else {
            return notif.status === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400';
        }
    };

    const alertCount = notifications.filter(n =>
        !readNotifications.includes(n.id) &&
        (n.type === 'card' || (n.type === 'loan' && n.status === 'rejected'))
    ).length;

    const unreadCount = notifications.filter(n => !readNotifications.includes(n.id)).length;

    const markAllAsRead = () => {
        const allIds = notifications.map(n => n.id);
        setReadNotifications(allIds);
        localStorage.setItem('readNotifications', JSON.stringify(allIds));
    };

    return (
        <>
            <nav className="fixed w-full z-50 transition-all duration-300 bg-[#0A2540]/80 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-6 h-16 flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3 group">
                        <div className="bg-[#635BFF] p-2 rounded-lg group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-indigo-500/20">
                            <FaUniversity className="text-white text-xl" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            Vitta <span className="font-light text-slate-400">Bank</span>
                        </span>
                    </Link>

                    {/* Navigation Links (Center) */}
                    <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
                        {['Dashboard', 'Accounts', 'Cards', 'Invest', 'Borrow'].map((item) => (
                            <Link
                                key={item}
                                to={`/${item.toLowerCase()}`}
                                className="relative py-5 hover:text-white transition-colors group"
                            >
                                {item}
                                <span className="absolute bottom-4 left-0 w-0 h-0.5 bg-[#00D4FF] group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        ))}
                        {user?.is_admin && (
                            <Link to="/admin" className="relative py-5 hover:text-white transition-colors group">
                                Admin
                                <span className="absolute bottom-4 left-0 w-0 h-0.5 bg-[#00D4FF] group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        )}
                    </div>

                    {/* Right Section: Notifications + User Profile */}
                    <div className="flex items-center gap-4">
                        {/* Notifications Bell */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="text-slate-400 hover:text-white transition-colors relative p-2"
                            >
                                <FaBell className="text-xl" />
                                {alertCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A2540]"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-96 bg-[#132F4C] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                                    <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-400 font-medium">{unreadCount} Unread</span>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-xs text-[#00D4FF] hover:text-white font-medium transition-colors"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${readNotifications.includes(notif.id) ? 'opacity-50' : ''}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${getNotifColor(notif)}`}>
                                                            {getNotifIcon(notif)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-white font-medium leading-tight">{notif.title}</p>
                                                            <p className="text-xs text-slate-400 mt-1 truncate">{notif.description}</p>
                                                            <p className="text-[10px] text-slate-500 mt-1">
                                                                {notif.date ? new Date(notif.date).toLocaleString('en-IN') : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-slate-500 text-sm">
                                                No notifications yet
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile & Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 text-right hover:bg-white/5 p-2 rounded-xl transition-all duration-200 border border-transparent hover:border-white/10"
                            >
                                <div className="hidden sm:block">
                                    <p className="text-sm font-semibold text-white">{user?.full_name || 'Client'}</p>
                                    <p className="text-xs text-[#00D4FF]">Premium Member</p>
                                </div>
                                <div className="bg-slate-800 p-2 rounded-full border border-white/10">
                                    <FaUserCircle className="text-slate-300 text-xl" />
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-[#0A2540] border border-white/10 rounded-xl shadow-2xl py-2 animate-fade-in z-50 backdrop-blur-xl">
                                    <div className="px-4 py-3 border-b border-white/5 mb-2 sm:hidden">
                                        <p className="text-sm font-bold text-white">{user?.full_name || 'Client'}</p>
                                        <p className="text-xs text-[#00D4FF]">Premium Member</p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setIsPasswordModalOpen(true);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3"
                                    >
                                        <FaKey className="text-[#635BFF]" />
                                        Change Password
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsPinModalOpen(true);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3"
                                    >
                                        <FaLock className="text-[#00D4FF]" />
                                        Change PIN
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsDeleteModalOpen(true);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 transition-colors flex items-center gap-3"
                                    >
                                        <FaTrashAlt />
                                        Delete Account
                                    </button>

                                    <div className="border-t border-white/5 my-2"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3"
                                    >
                                        <FaSignOutAlt />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ChangePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                />
                <PinModal
                    isOpen={isPinModalOpen}
                    onClose={() => setIsPinModalOpen(false)}
                    onSuccess={() => { }}
                    title="Change PIN"
                    flow="change"
                />
            </nav>

            {/* Delete Account Modal - Outside nav for proper centering */}
            {
                isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                            <button
                                onClick={closeDeleteModal}
                                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                            >
                                <FaTimes />
                            </button>

                            {!deleteSuccess ? (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FaTrashAlt className="text-2xl text-red-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Delete Account</h3>
                                        <p className="text-slate-400 text-sm">This will send a request to an admin to delete your account and all associated data.</p>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Reason (optional)</label>
                                        <textarea
                                            value={deleteReason}
                                            onChange={(e) => setDeleteReason(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all resize-none"
                                            placeholder="Tell us why you're leaving..."
                                            rows={3}
                                        />
                                    </div>

                                    {deleteError && (
                                        <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded border border-red-500/20 mb-4">
                                            {deleteError}
                                        </p>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={closeDeleteModal}
                                            className="flex-1 py-3 text-slate-300 hover:text-white border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteRequest}
                                            disabled={deleteLoading}
                                            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                                        >
                                            {deleteLoading ? 'Submitting...' : 'Request Deletion'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaExclamationCircle className="text-2xl text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Request Submitted</h3>
                                    <p className="text-slate-400 text-sm mb-6">Your account deletion request has been sent to an admin for review. You will be notified once it's processed.</p>
                                    <button
                                        onClick={closeDeleteModal}
                                        className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default Navbar;

