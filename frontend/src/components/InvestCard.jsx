import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FaChartLine, FaArrowRight } from 'react-icons/fa';

const InvestCard = () => {
    const [investments, setInvestments] = useState([]);

    useEffect(() => {
        fetchInvestments();
        const interval = setInterval(fetchInvestments, 20000); // Refresh every 20 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchInvestments = async () => {
        try {
            const res = await api.get('/investments/');
            setInvestments(res.data);
        } catch (error) {
            console.error("Failed to fetch investments", error);
        }
    };

    const totalValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.current_value), 0);

    return (
        <Link
            to="/invest"
            target="_blank"
            rel="noopener noreferrer"
            className="block card-base p-6 cursor-pointer group hover:border-slate-600 transition-all"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                    <FaChartLine className="text-emerald-400 text-xl" />
                </div>
                <div className="bg-slate-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaArrowRight className="text-white text-sm" />
                </div>
            </div>

            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Investments</h3>
            <p className="text-2xl font-bold text-white mb-4">
                ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit">
                <span>+2.4%</span>
                <span className="text-slate-500">this month</span>
            </div>
        </Link>
    );
};

export default InvestCard;
