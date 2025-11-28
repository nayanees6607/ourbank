import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Insurance = () => {
    const { user } = useContext(AuthContext);
    const [policies, setPolicies] = useState([]);
    const [myPolicies, setMyPolicies] = useState([]);
    const [selectedPolicy, setSelectedPolicy] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPolicies();
        fetchMyPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const res = await api.get('/insurance/policies');
            setPolicies(res.data);
            if (res.data.length > 0) setSelectedPolicy(res.data[0].id);
        } catch (error) {
            console.error("Failed to fetch policies", error);
        }
    };

    const fetchMyPolicies = async () => {
        try {
            const res = await api.get('/insurance/');
            setMyPolicies(res.data);
        } catch (error) {
            console.error("Failed to fetch my policies", error);
        }
    };

    const handleBuy = async () => {
        setLoading(true);
        try {
            await api.post('/insurance/buy', { policy_id: parseInt(selectedPolicy) });
            alert('Policy purchased!');
            fetchMyPolicies();
        } catch (error) {
            alert('Purchase failed');
        } finally {
            setLoading(false);
        }
    };

    const totalCoverage = myPolicies.reduce((sum, p) => sum + p.coverage, 0);

    return (
        <div className="min-h-screen bg-[#0B1221] text-slate-200 pb-20 font-inter">
            <Navbar />
            <main className="container mx-auto px-6 py-10">
                <div className="flex justify-between items-end border-b border-slate-800/60 pb-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Insurance</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-slate-400 text-sm">Protect your future with our premium plans</p>
                            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                                Client: {user?.full_name || 'Client'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-white tracking-tight">
                            ₹{totalCoverage.toLocaleString('en-US')}
                        </p>
                        <p className="text-sm text-slate-400">Total Coverage Value</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Get Insured Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="card-base p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Get Insured</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Select Policy</label>
                                    <select
                                        value={selectedPolicy}
                                        onChange={(e) => setSelectedPolicy(e.target.value)}
                                        className="input-field"
                                    >
                                        {policies.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name} (Premium: ₹{p.premium}) - Coverage: ₹{p.coverage.toLocaleString()}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleBuy}
                                    disabled={loading}
                                    className="btn-primary w-full md:w-auto px-8 bg-rose-700 hover:bg-rose-800 focus:border-rose-500"
                                >
                                    {loading ? 'Processing...' : 'Buy Policy'}
                                </button>
                            </div>
                        </div>

                        {/* Available Policies Info */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Available Plans</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {policies.map((p) => (
                                    <div key={p.id} className="card-base p-4 border border-slate-800/60 hover:border-slate-700 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white">{p.name}</h4>
                                            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 capitalize">{p.type}</span>
                                        </div>
                                        <p className="text-sm text-slate-400 mb-4">Comprehensive coverage for your peace of mind.</p>
                                        <div className="flex justify-between items-center text-sm">
                                            <div>
                                                <p className="text-xs text-slate-500">Premium</p>
                                                <p className="font-medium text-white">₹{p.premium}/yr</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">Coverage</p>
                                                <p className="font-medium text-white">₹{p.coverage.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* My Policies Sidebar */}
                    <div className="space-y-6">
                        <div className="card-base p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">My Policies</h3>
                            <div className="space-y-3">
                                {myPolicies.map((p) => (
                                    <div key={p.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/60">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-sm text-white">{p.policy_name}</p>
                                                <p className="text-xs text-slate-400">Coverage: ₹{p.coverage.toLocaleString()}</p>
                                            </div>
                                            <span className="text-[10px] bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">Active</span>
                                        </div>
                                    </div>
                                ))}
                                {myPolicies.length === 0 && (
                                    <div className="text-center py-8 text-slate-500 text-sm italic">
                                        No active policies.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Insurance;
