import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import AccountsCard from '../components/AccountsCard';
import MyCards from '../components/MyCards';
import InvestCard from '../components/InvestCard';
import BorrowCard from '../components/BorrowCard';
import InsuranceCard from '../components/InsuranceCard';
import CheckBalance from '../components/CheckBalance';
import TransferMoney from '../components/TransferMoney';
import CreditScore from '../components/CreditScore';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaChartLine, FaWallet, FaArrowUp } from 'react-icons/fa';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Update time every minute
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Connect to WebSocket
        const clientId = Math.floor(Math.random() * 1000);
        const ws = new WebSocket(`ws://localhost:8000/ws/${clientId}`);

        ws.onmessage = (event) => {
            if (event.data === "update") {
                setRefreshTrigger(prev => prev + 1);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="min-h-screen bg-[#0B1221] relative overflow-hidden">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient orbs */}
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#635BFF]/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-[#00D4FF]/15 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cpath%20d%3D%22M60%200H0v60%22%20fill%3D%22none%22%20stroke%3D%22rgba(255,255,255,0.03)%22/%3E%3C/svg%3E')] opacity-50"></div>
            </div>

            <Navbar />

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Welcome Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-10"
                >
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">{getGreeting()}</p>
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#635BFF] via-[#00D4FF] to-[#00D4FF]">{user?.full_name?.split(' ')[0] || 'Client'}</span>
                            </h1>
                            <p className="text-slate-400 mt-2 text-lg">Here's your financial overview for today.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Dashboard Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                    {/* Left Column: Accounts - Takes more space */}
                    <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
                        <section className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
                            <AccountsCard refreshTrigger={refreshTrigger} />
                        </section>
                    </motion.div>

                    {/* Right Column: Quick Actions */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
                        <section className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#00D4FF] flex items-center justify-center">
                                    <FaWallet className="text-white text-lg" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Quick Transfer</h3>
                            </div>
                            <TransferMoney />
                        </section>

                        <section className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                    <FaChartLine className="text-white text-lg" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Credit Score</h3>
                            </div>
                            <CreditScore />
                        </section>
                    </motion.div>
                </motion.div>

                {/* Bottom Row: Feature Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Your Services</h2>
                        <span className="text-sm text-slate-400">Manage your financial products</span>
                    </div>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                    >
                        <motion.div variants={itemVariants} className="group">
                            <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/10 hover:border-[#635BFF]/30 hover:shadow-[#635BFF]/5 transition-all duration-300 group-hover:scale-[1.02]">
                                <MyCards />
                            </div>
                        </motion.div>
                        <motion.div variants={itemVariants} className="group">
                            <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/10 hover:border-[#00D4FF]/30 hover:shadow-[#00D4FF]/5 transition-all duration-300 group-hover:scale-[1.02]">
                                <InvestCard />
                            </div>
                        </motion.div>
                        <motion.div variants={itemVariants} className="group">
                            <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/10 hover:border-emerald-500/30 hover:shadow-emerald-500/5 transition-all duration-300 group-hover:scale-[1.02]">
                                <BorrowCard />
                            </div>
                        </motion.div>
                        <motion.div variants={itemVariants} className="group">
                            <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/10 hover:border-amber-500/30 hover:shadow-amber-500/5 transition-all duration-300 group-hover:scale-[1.02]">
                                <InsuranceCard />
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </main>

            {/* Floating Action Button */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="fixed bottom-8 right-8 z-50"
            >
                <CheckBalance />
            </motion.div>
        </div>
    );
};

export default Dashboard;

