import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaCreditCard, FaArrowRight } from 'react-icons/fa';

const MyCards = () => {
    const [cards, setCards] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const res = await api.get('/cards/');
            setCards(res.data);
        } catch (error) {
            console.error("Failed to fetch cards", error);
        }
    };

    return (
        <div
            onClick={() => navigate('/cards')}
            className="card-base p-6 cursor-pointer group hover:border-slate-600 transition-all"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <FaCreditCard className="text-blue-400 text-xl" />
                </div>
                <div className="bg-slate-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaArrowRight className="text-white text-sm" />
                </div>
            </div>

            <h3 className="text-slate-400 text-sm font-medium mb-1">My Cards</h3>
            <p className="text-2xl font-bold text-white mb-4">
                {cards.length} <span className="text-sm font-normal text-slate-400">Active</span>
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded w-fit">
                <span>Manage Cards</span>
            </div>
        </div>
    );
};

export default MyCards;
