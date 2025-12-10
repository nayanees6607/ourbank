import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import PinModal from '../components/PinModal';
import { FaTimes, FaCheck, FaCreditCard } from 'react-icons/fa';

const Cards = () => {
    const { user } = useContext(AuthContext);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [revealedCardId, setRevealedCardId] = useState(null);
    const [pendingRevealId, setPendingRevealId] = useState(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    // Credit card selection modal state
    const [showCreditCardModal, setShowCreditCardModal] = useState(false);
    const [creditCardOptions, setCreditCardOptions] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);

    useEffect(() => {
        fetchCards();
        fetchCreditCardOptions();
        const interval = setInterval(fetchCards, 20000); // Refresh every 20 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchCards = async () => {
        try {
            const res = await api.get('/cards/');
            setCards(res.data);
        } catch (error) {
            console.error("Failed to fetch cards", error);
        }
    };

    const fetchCreditCardOptions = async () => {
        try {
            const res = await api.get('/cards/credit-card-options');
            setCreditCardOptions(res.data);
        } catch (error) {
            console.error("Failed to fetch credit card options", error);
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

    const hasDebitCard = cards.some(c => c.card_type === 'debit' && ['active', 'pending'].includes(c.status));
    const activeCreditCards = cards.filter(c => c.card_type === 'credit' && ['active', 'pending'].includes(c.status));
    const canApplyForCreditCard = activeCreditCards.length < 4;

    // Filter cards for display - show active and pending only, with active first
    const displayCards = cards
        .filter(c => c.status === 'active' || c.status === 'pending')
        .sort((a, b) => (a.status === 'active' ? -1 : 1) - (b.status === 'active' ? -1 : 1));

    // Notifications for rejected/revoked cards
    const notifications = cards.filter(c => c.status === 'rejected' || c.status === 'revoked');

    const generateCard = async (type, cardName = '') => {
        setLoading(true);
        try {
            await api.post(`/cards/generate?card_type=${type}&card_name=${encodeURIComponent(cardName)}`);
            fetchCards();
            setShowCreditCardModal(false);
            setSelectedCard(null);
            alert('Card application submitted for approval.');
        } catch (error) {
            const detail = error.response?.data?.detail;
            const errorMessage = typeof detail === 'object' ? JSON.stringify(detail) : (detail || error.message);
            alert('Failed to submit application: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyCreditCard = () => {
        if (selectedCard) {
            generateCard('credit', selectedCard.name);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1221] text-slate-200 relative overflow-hidden">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#635BFF]/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-[#00D4FF]/15 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cpath%20d%3D%22M60%200H0v60%22%20fill%3D%22none%22%20stroke%3D%22rgba(255,255,255,0.03)%22/%3E%3C/svg%3E')] opacity-50"></div>
            </div>

            <Navbar />

            <main className="relative z-10 container mx-auto px-6 pt-24 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                    <div>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Card Management</p>
                        <h1 className="text-4xl font-bold text-white tracking-tight">My Cards</h1>
                        <p className="text-slate-400 mt-2">Manage your debit and credit cards</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <button
                            onClick={() => generateCard('debit')}
                            disabled={loading || hasDebitCard}
                            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 border ${hasDebitCard
                                ? 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed opacity-50'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white'
                                }`}
                            title={hasDebitCard ? "You can only have one Debit Card" : "Apply for Debit Card"}
                        >
                            + New Debit Card
                        </button>

                        {/* Credit Card Dropdown */}
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedCard?.id || ''}
                                onChange={(e) => {
                                    const card = creditCardOptions.find(c => c.id === e.target.value);
                                    setSelectedCard(card || null);
                                }}
                                disabled={!canApplyForCreditCard}
                                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-[#635BFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                            >
                                <option value="" className="bg-[#132F4C]">Select Credit Card</option>
                                {creditCardOptions.map((option) => (
                                    <option key={option.id} value={option.id} className="bg-[#132F4C]">
                                        {option.name} - ₹{option.annual_fee}/yr
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => selectedCard && generateCard('credit', selectedCard.name)}
                                disabled={loading || !canApplyForCreditCard || !selectedCard}
                                className="px-5 py-2.5 rounded-xl font-medium bg-gradient-to-r from-[#635BFF] to-[#00D4FF] text-white hover:shadow-lg hover:shadow-[#635BFF]/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={!canApplyForCreditCard ? "Maximum 4 credit cards reached" : !selectedCard ? "Select a card first" : "Apply for Credit Card"}
                            >
                                {loading ? 'Applying...' : '+ Apply'}
                            </button>
                            {!canApplyForCreditCard && (
                                <span className="text-xs text-amber-400">(Max 4)</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayCards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => card.status === 'active' && handleCardClick(card.id)}
                            className={`relative h-56 rounded-2xl p-6 text-white shadow-2xl overflow-hidden group transition-all duration-300 ${card.status === 'active' ? 'hover:scale-[1.03] hover:shadow-[#635BFF]/20 cursor-pointer' : 'opacity-80'}`}
                        >
                            {/* Card Background */}
                            <div className={`absolute inset-0 ${card.card_type === 'credit' ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-[#005EB8] to-[#003da5]'}`}></div>
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                            {/* Status Overlay for Pending only */}
                            {card.status === 'pending' && (
                                <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500 text-black">
                                        Pending Approval
                                    </span>
                                </div>
                            )}

                            {/* Card Content */}
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-xl tracking-wider italic">J.P. Morgan</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm uppercase tracking-widest opacity-80">{card.card_type}</span>
                                        {card.status === 'active' && <span className="text-[10px] text-emerald-400 font-bold uppercase">Active</span>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex gap-4 text-2xl font-mono tracking-widest opacity-90">
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
                            {card.status === 'active' && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                                    <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                        {revealedCardId === card.id ? 'Click to hide' : 'Click to reveal'}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                    {displayCards.length === 0 && (
                        <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-800 rounded-xl">
                            <p className="text-slate-500 text-lg">No cards issued yet.</p>
                            <p className="text-slate-600 mt-2">Generate a new card to get started.</p>
                        </div>
                    )}
                </div>
            </main >
            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handlePinSuccess}
                title="Reveal Card Details"
            />

            {/* Credit Card Selection Modal */}
            {showCreditCardModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#132F4C] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Choose Your Credit Card</h2>
                                <p className="text-slate-400 text-sm mt-1">Select from our premium credit card collection ({activeCreditCards.length}/4 cards)</p>
                            </div>
                            <button
                                onClick={() => { setShowCreditCardModal(false); setSelectedCard(null); }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <FaTimes className="text-slate-400 text-xl" />
                            </button>
                        </div>

                        {/* Card Options Grid */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {creditCardOptions.map((option) => (
                                    <div
                                        key={option.id}
                                        onClick={() => setSelectedCard(option)}
                                        className={`relative p-5 rounded-xl cursor-pointer transition-all duration-200 border-2 ${selectedCard?.id === option.id
                                            ? 'border-[#635BFF] bg-[#635BFF]/10'
                                            : 'border-white/10 hover:border-white/20 bg-white/5'
                                            }`}
                                    >
                                        {selectedCard?.id === option.id && (
                                            <div className="absolute top-3 right-3 w-6 h-6 bg-[#635BFF] rounded-full flex items-center justify-center">
                                                <FaCheck className="text-white text-xs" />
                                            </div>
                                        )}

                                        {/* Mini Card Preview */}
                                        <div className={`h-20 rounded-lg bg-gradient-to-br ${option.color} mb-4 p-3 flex flex-col justify-between`}>
                                            <div className="flex justify-between items-start">
                                                <FaCreditCard className="text-white/80 text-lg" />
                                                <span className="text-white/60 text-[10px] uppercase">Credit</span>
                                            </div>
                                            <p className="text-white text-xs font-medium truncate">{option.name}</p>
                                        </div>

                                        <h3 className="font-bold text-white mb-1">{option.name}</h3>
                                        <p className="text-slate-400 text-xs mb-3">{option.description}</p>

                                        <div className="flex justify-between items-center text-xs">
                                            <div>
                                                <span className="text-slate-500">Annual Fee</span>
                                                <p className="text-white font-medium">₹{option.annual_fee.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-slate-500">Cashback</span>
                                                <p className="text-emerald-400 font-medium">{option.cashback}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-between items-center p-6 border-t border-white/10 bg-white/5">
                            <p className="text-slate-400 text-sm">
                                {selectedCard ? `Selected: ${selectedCard.name}` : 'Select a card to continue'}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowCreditCardModal(false); setSelectedCard(null); }}
                                    className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApplyCreditCard}
                                    disabled={!selectedCard || loading}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#635BFF] to-[#00D4FF] text-white font-medium hover:shadow-lg hover:shadow-[#635BFF]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Applying...' : 'Apply for Card'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Cards;

