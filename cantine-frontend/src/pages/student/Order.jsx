import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const Order = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const cart = location.state?.cart || [];

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleConfirm = async () => {
        setLoading(true);
        setError('');

        if (!user) {
            setError('Utilisateur non authentifié. Veuillez vous reconnecter.');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                userId: user.id ?? user.userId ?? user._id ?? null,
                items: cart.map(item => ({
                    menuId: item.id,
                    quantity: item.quantity,
                })),
            };

            if (!payload.userId) {
                throw new Error('Identifiant utilisateur introuvable.');
            }

            await api.post('/orders', payload);
            setSuccess(true);
            setTimeout(() => navigate('/my-orders'), 2000);
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Erreur lors de la commande. Réessayez.';
            setError(message);
            console.error('Order submit error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <Navbar>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center animate-fadeIn">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Votre panier est vide</h2>
                        <button
                            onClick={() => navigate('/menus')}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition"
                        >
                            Voir les menus
                        </button>
                    </div>
                </div>
            </Navbar>
        );
    }

    if (success) {
        return (
            <Navbar>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center animate-fadeIn">
                        <div className="text-7xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Commande confirmée !</h2>
                        <p className="text-gray-500">Redirection vers vos commandes...</p>
                    </div>
                </div>
            </Navbar>
        );
    }

    return (
        <Navbar>
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-lg mx-auto animate-fadeIn">
                    <button
                        onClick={() => navigate('/menus')}
                        className="text-indigo-600 hover:text-indigo-600 text-sm font-medium mb-6 flex items-center gap-1"
                    >
                        ← Retour aux menus
                    </button>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">🛒 Récapitulatif</h2>

                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl">
                                            {item.dishName.toLowerCase().includes('pizza') ? '🍕' :
                                             item.dishName.toLowerCase().includes('burger') ? '🍔' :
                                             item.dishName.toLowerCase().includes('shawarma') ? '🌯' : '🍽️'}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800 text-sm">{item.dishName}</div>
                                            <div className="text-xs text-gray-400">{item.price.toFixed(2)} DH × {item.quantity}</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-indigo-600">
                                        {(item.price * item.quantity).toFixed(2)} DH
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-bold text-gray-800 text-lg">Total</span>
                            <span className="font-bold text-indigo-600 text-2xl">{total.toFixed(2)} DH</span>
                        </div>
                    </div>

                    {/* Info commande */}
                    <div className="bg-indigo-50 border border-orange-100 rounded-2xl p-4 mb-6">
                        <div className="flex items-center gap-2 text-orange-700 text-sm">
                            <span>ℹ️</span>
                            <span>Votre commande sera prête dans <strong>15-20 minutes</strong></span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Confirmation...
                            </>
                        ) : (
                            '✅ Confirmer la commande'
                        )}
                    </button>
                </div>
            </div>
        </Navbar>
    );
};

export default Order;