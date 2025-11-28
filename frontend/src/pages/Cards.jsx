import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import PinModal from '../components/PinModal';

const Cards = () => {
    const { user } = useContext(AuthContext);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [revealedCardId, setRevealedCardId] = useState(null);
    const [pendingRevealId, setPendingRevealId] = useState(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

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

    const handleCardClick = (id) => {
        if (revealedCardId === id) {
            setRevealedCardId(null);
        } else {
            setPendingRevealId(id);
            setIsPinModalOpen(true);
        }
    };

    const handlePinSuccess = () => {
        if (pendingRevealId) {
            setRevealedCardId(pendingRevealId);
            setPendingRevealId(null);
        }
    };

    const generateCard = async (type) => {
        setLoading(true);
        try {
            await api.post(`/cards/generate?card_type=${type}`);
            fetchCards();
        } catch (error) {
            const detail = error.response?.data?.detail;
            const errorMessage = typeof detail === 'object' ? JSON.stringify(detail) : (detail || error.message);
            alert('Failed to generate card: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1221] text-slate-200 pb-20 font-inter">
            <Navbar />
            <main className="container mx-auto px-6 py-10">
                <div className="flex justify-between items-end border-b border-slate-800/60 pb-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">My Cards</h1>
                        <p className="text-slate-400 mt-1 text-sm">Manage your debit and credit cards</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => generateCard('debit')}
                            disabled={loading}
                            className="btn-secondary"
                        >
                            + New Debit Card
                        </button>
                        <button
                            onClick={() => generateCard('credit')}
                            disabled={loading}
                            className="btn-primary"
                        >
                            + New Credit Card
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => handleCardClick(card.id)}
                            className="relative h-56 rounded-xl p-6 text-white shadow-xl overflow-hidden group transition-transform hover:scale-[1.02] duration-300 cursor-pointer"
                        >
                            {/* Card Background */}
                            <div className={`absolute inset-0 ${card.card_type === 'credit' ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-[#005EB8] to-[#003da5]'}`}></div>
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                            {/* Card Content */}
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-xl tracking-wider italic">J.P. Morgan</span>
                                    <span className="text-sm uppercase tracking-widest opacity-80">{card.card_type}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex gap-4 text-2xl font-mono tracking-widest">
                                        {revealedCardId === card.id ? (
                                            <>
                                                <span>{card.card_number.slice(0, 4)}</span>
                                                <span>{card.card_number.slice(4, 8)}</span>
                                                <span>{card.card_number.slice(8, 12)}</span>
                                                <span>{card.card_number.slice(12)}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>****</span>
                                                <span>****</span>
                                                <span>****</span>
                                                <span>{card.card_number.slice(-4)}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] opacity-60 uppercase">Card Holder</p>
                                            <p className="text-base font-medium tracking-wide">{user?.full_name || 'CLIENT NAME'}</p>
                                        </div>
                                        <div className="flex gap-4 items-end">
                                            {revealedCardId === card.id && (
                                                <div className="text-right">
                                                    <p className="text-[10px] opacity-60 uppercase">CVV</p>
                                                    <p className="text-base font-mono">{card.cvv}</p>
                                                </div>
                                            )}
                                            <div className="text-right">
                                                <p className="text-[10px] opacity-60 uppercase">Expires</p>
                                                <p className="text-base font-mono">{card.expiry_date}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Click Hint */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                    {revealedCardId === card.id ? 'Click to hide' : 'Click to reveal'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {cards.length === 0 && (
                        <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-800 rounded-xl">
                            <p className="text-slate-500 text-lg">No cards issued yet.</p>
                            <p className="text-slate-600 mt-2">Generate a new card to get started.</p>
                        </div>
                    )}
                </div>
            </main>
            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handlePinSuccess}
                title="Reveal Card Details"
            />
        </div>
    );
};

export default Cards;
