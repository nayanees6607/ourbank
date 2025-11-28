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

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

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
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-transparent">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{user?.full_name?.split(' ')[0] || 'Client'}</span>
                    </h1>
                    <p className="text-slate-400 mt-1">Here's your financial overview for today.</p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                    {/* Left Column: Accounts */}
                    <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
                        <section>
                            <AccountsCard refreshTrigger={refreshTrigger} />
                        </section>
                    </motion.div>

                    {/* Right Column: Transfer & Credit Score */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
                        <section>
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Transfer</h3>
                            <TransferMoney />
                        </section>
                        <section>
                            <CreditScore />
                        </section>
                    </motion.div>
                </motion.div>

                {/* Bottom Row: Summary Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"
                >
                    <motion.div variants={itemVariants}>
                        <MyCards />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <InvestCard />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <BorrowCard />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <InsuranceCard />
                    </motion.div>
                </motion.div>
            </main>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8 z-50">
                <CheckBalance />
            </div>
        </div>
    );
};

export default Dashboard;
