import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FaHandHoldingUsd, FaArrowRight } from 'react-icons/fa';

const BorrowCard = () => {
    const [loans, setLoans] = useState([]);

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const res = await api.get('/loans/');
            setLoans(res.data);
        } catch (error) {
            console.error("Failed to fetch loans", error);
        }
    };

    const totalDebt = loans.reduce((sum, loan) => sum + loan.amount, 0);

    return (
        <Link
            to="/borrow"
            target="_blank"
            rel="noopener noreferrer"
            className="block card-base p-6 cursor-pointer group hover:border-slate-600 transition-all"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <FaHandHoldingUsd className="text-blue-400 text-xl" />
                </div>
                <div className="bg-slate-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaArrowRight className="text-white text-sm" />
                </div>
            </div>

            <h3 className="text-slate-400 text-sm font-medium mb-1">Outstanding Debt</h3>
            <p className="text-2xl font-bold text-white mb-4">
                ₹{totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded w-fit">
                <span>{loans.length} Active Loan{loans.length !== 1 ? 's' : ''}</span>
            </div>
        </Link>
    );
};

export default BorrowCard;
