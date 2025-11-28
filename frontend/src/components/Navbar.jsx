import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUniversity, FaSignOutAlt, FaUserCircle, FaKey, FaLock } from 'react-icons/fa';
import ChangePasswordModal from './ChangePasswordModal';
import PinModal from './PinModal';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-[#0B1221] border-b border-slate-800 sticky top-0 z-50">
            <div className="container mx-auto px-6 h-16 flex justify-between items-center">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-3 group">
                    <div className="bg-[#005EB8] p-2 rounded-md group-hover:bg-[#004c94] transition-colors">
                        <FaUniversity className="text-white text-xl" />
                    </div>
                    <span className="text-xl font-semibold tracking-tight text-white">
                        J.P. Morgan <span className="font-light text-slate-400">Private Bank</span>
                    </span>
                </Link>

                {/* Navigation Links (Center - Mock) */}
                <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
                    <Link to="/dashboard" className="hover:text-white transition-colors border-b-2 border-transparent hover:border-[#005EB8] py-5">Dashboard</Link>
                    <Link to="/accounts" className="hover:text-white transition-colors border-b-2 border-transparent hover:border-[#005EB8] py-5">Accounts</Link>
                    <Link to="/cards" className="hover:text-white transition-colors border-b-2 border-transparent hover:border-[#005EB8] py-5">Cards</Link>
                    <Link to="/invest" className="hover:text-white transition-colors border-b-2 border-transparent hover:border-[#005EB8] py-5">Investments</Link>
                    <Link to="/borrow" className="hover:text-white transition-colors border-b-2 border-transparent hover:border-[#005EB8] py-5">Borrow</Link>
                </div>

                {/* User Profile & Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 text-right hover:bg-slate-800/50 p-2 rounded-lg transition-colors focus:outline-none"
                    >
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-white">{user?.full_name || 'Client'}</p>
                            <p className="text-xs text-slate-400">Private Client</p>
                        </div>
                        <FaUserCircle className="text-slate-400 text-2xl" />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#0B1221] border border-slate-700 rounded-lg shadow-xl py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                            <div className="px-4 py-2 border-b border-slate-800 mb-2 sm:hidden">
                                <p className="text-sm font-medium text-white">{user?.full_name || 'Client'}</p>
                                <p className="text-xs text-slate-400">Private Client</p>
                            </div>

                            <button
                                onClick={() => {
                                    setIsPasswordModalOpen(true);
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <FaKey className="text-slate-500" />
                                Change Password
                            </button>
                            <button
                                onClick={() => {
                                    setIsPinModalOpen(true);
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <FaLock className="text-slate-500" />
                                Change PIN
                            </button>

                            <div className="border-t border-slate-800 my-1"></div>

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors flex items-center gap-2"
                            >
                                <FaSignOutAlt />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={() => { }} // No specific action needed on success, modal handles alert
                title="Change PIN"
                flow="change"
            />
        </nav>
    );
};

export default Navbar;
