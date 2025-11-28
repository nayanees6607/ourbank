import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FaShieldAlt, FaArrowRight } from 'react-icons/fa';

const InsuranceCard = () => {
    const [myPolicies, setMyPolicies] = useState([]);

    useEffect(() => {
        fetchMyPolicies();
    }, []);

    const fetchMyPolicies = async () => {
        try {
            const res = await api.get('/insurance/');
            setMyPolicies(res.data);
        } catch (error) {
            console.error("Failed to fetch my policies", error);
        }
    };

    const totalCoverage = myPolicies.reduce((sum, p) => sum + p.coverage, 0);

    return (
        <Link
            to="/insurance"
            target="_blank"
            rel="noopener noreferrer"
            className="block card-base p-6 cursor-pointer group hover:border-slate-600 transition-all"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-rose-500/10 rounded-lg group-hover:bg-rose-500/20 transition-colors">
                    <FaShieldAlt className="text-rose-400 text-xl" />
                </div>
                <div className="bg-slate-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaArrowRight className="text-white text-sm" />
                </div>
            </div>

            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Coverage</h3>
            <p className="text-2xl font-bold text-white mb-4">
                ₹{totalCoverage.toLocaleString('en-US')}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded w-fit">
                <span>{myPolicies.length} Active Polic{myPolicies.length !== 1 ? 'ies' : 'y'}</span>
            </div>
        </Link>
    );
};

export default InsuranceCard;
