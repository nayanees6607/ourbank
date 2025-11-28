import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaTachometerAlt } from 'react-icons/fa';

const CreditScore = () => {
    const [score, setScore] = useState(0);
    const [netWorth, setNetWorth] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateScore();
    }, []);

    const calculateScore = async () => {
        try {
            const [accountsRes, loansRes] = await Promise.all([
                api.get('/accounts/'),
                api.get('/loans/')
            ]);

            const totalBalance = accountsRes.data.reduce((sum, acc) => sum + acc.balance, 0);
            const totalDebt = loansRes.data.reduce((sum, loan) => sum + loan.amount, 0);
            const net = totalBalance - totalDebt;

            setNetWorth(net);

            // Simple Score Logic
            // Base: 500
            // +1 point per $100 net worth
            // Min: 300, Max: 850
            let calculatedScore = 500 + Math.floor(net / 100);
            if (calculatedScore > 850) calculatedScore = 850;
            if (calculatedScore < 300) calculatedScore = 300;

            setScore(calculatedScore);
        } catch (error) {
            console.error("Failed to calculate credit score", error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (s) => {
        if (s >= 800) return 'text-emerald-400';
        if (s >= 740) return 'text-emerald-300';
        if (s >= 670) return 'text-blue-400';
        if (s >= 580) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreLabel = (s) => {
        if (s >= 800) return 'Excellent';
        if (s >= 740) return 'Very Good';
        if (s >= 670) return 'Good';
        if (s >= 580) return 'Fair';
        return 'Poor';
    };

    const percentage = ((score - 300) / (850 - 300)) * 100;

    return (
        <div className="card-base p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white">Credit Score</h3>
                <FaTachometerAlt className="text-slate-600 text-xl" />
            </div>

            <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-48 h-24 overflow-hidden mb-2">
                    {/* Gauge Background */}
                    <div className="absolute top-0 left-0 w-full h-full bg-slate-800 rounded-t-full"></div>
                    {/* Gauge Fill */}
                    <div
                        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-t-full origin-bottom transition-transform duration-1000 ease-out"
                        style={{ transform: `rotate(${percentage * 1.8 - 180}deg)` }}
                    ></div>
                    {/* Gauge Cover (to make it an arc) */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-32 h-32 bg-[#1e293b] rounded-full"></div>
                </div>

                <div className="text-center -mt-8 relative z-10">
                    <h2 className={`text-4xl font-bold ${getScoreColor(score)}`}>
                        {loading ? '...' : score}
                    </h2>
                    <p className="text-sm text-slate-400 font-medium mt-1">{getScoreLabel(score)}</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center text-xs">
                <span className="text-slate-500">Net Liquid Assets</span>
                <span className={`font-mono font-medium ${netWorth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {netWorth >= 0 ? '+' : '-'}₹{Math.abs(netWorth).toLocaleString()}
                </span>
            </div>
        </div>
    );
};

export default CreditScore;
