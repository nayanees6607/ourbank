import React from 'react';
import { FaArrowUp, FaArrowDown, FaGlobeAmericas } from 'react-icons/fa';

const CurrencyRates = () => {
    const rates = [
        { pair: 'USD/INR', value: '83.45', change: '+0.12%', up: true },
        { pair: 'EUR/INR', value: '90.21', change: '-0.05%', up: false },
        { pair: 'GBP/INR', value: '105.67', change: '+0.23%', up: true },
        { pair: 'JPY/INR', value: '0.55', change: '-0.10%', up: false },
    ];

    return (
        <div className="card-base p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FaGlobeAmericas className="text-blue-400" />
                    Currency Rates
                </h3>
                <span className="text-xs text-slate-500">Live Updates</span>
            </div>

            <div className="space-y-4">
                {rates.map((rate, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800/50 hover:border-slate-700 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                                {rate.pair.split('/')[0]}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{rate.pair}</p>
                                <p className="text-xs text-slate-500">Forex Market</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-white">₹{rate.value}</p>
                            <p className={`text-xs flex items-center justify-end gap-1 ${rate.up ? 'text-emerald-400' : 'text-red-400'}`}>
                                {rate.up ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                                {rate.change}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors border border-dashed border-slate-700 rounded-lg hover:bg-slate-800/50">
                View All Rates
            </button>
        </div>
    );
};

export default CurrencyRates;
