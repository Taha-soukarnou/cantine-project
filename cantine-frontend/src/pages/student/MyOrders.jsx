import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const STATUS_CONFIG = {
    en_attente: { label: 'En attente', color: 'bg-indigo-100 text-indigo-700', icon: '⏳' },
    en_preparation: { label: 'En préparation', color: 'bg-violet-100 text-violet-700', icon: '👨‍🍳' },
    prete: { label: 'Prête', color: 'bg-emerald-100 text-emerald-700', icon: '✅' },
    servie: { label: 'Servie', color: 'bg-slate-100 text-slate-600', icon: '🍽️' },
    annulee: { label: 'Annulée', color: 'bg-rose-100 text-rose-600', icon: '❌' },
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/my');
            setOrders(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <Navbar>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4 animate-pulse-slow">📋</div>
                    <p className="text-gray-500">Chargement de vos commandes...</p>
                </div>
            </div>
        </Navbar>
    );

    return (
        <Navbar>
            <div className="min-h-screen bg-gray-50">
                <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white py-10 px-4">
                    <div className="max-w-3xl mx-auto animate-fadeIn">
                        <h1 className="text-3xl font-bold mb-1">Mes Commandes 📋</h1>
                        <p className="text-indigo-100">Suivi en temps réel de vos commandes</p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 py-8">
                    {orders.length === 0 ? (
                        <div className="text-center py-20 animate-fadeIn">
                            <div className="text-6xl mb-4">📭</div>
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucune commande</h2>
                            <p className="text-gray-400 mb-6">Vous n'avez pas encore passé de commande.</p>
                            
                            <Link
                                to="/menus"
                                className="bg-linear-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition inline-block"
                            >
                                Voir les menus
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.slice().reverse().map((order, index) => {
                                const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.en_attente;
                                return (
                                    <div
                                        key={order.id}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn hover:shadow-md transition-all"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">
                                                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                                        day: 'numeric', month: 'long', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </div>
                                                <div className="font-bold text-gray-800">
                                                    Commande #{order.id}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${status.color}`}>
                                                {status.icon} {status.label}
                                            </span>
                                        </div>

                                        {/* Items */}
                                        <div className="space-y-2 mb-4">
                                            {order.orderItems?.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <span>•</span>
                                                        <span>{item.menu?.dishName}</span>
                                                        <span className="text-gray-400">× {item.quantity}</span>
                                                    </div>
                                                    <span className="text-gray-700 font-medium">
                                                        {item.subtotal?.toFixed(2)} DH
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-50 pt-3 flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Total</span>
                                            <span className="font-bold text-indigo-600 text-lg">
                                                {order.totalPrice?.toFixed(2)} DH
                                            </span>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                <span>⏳ Attente</span>
                                                <span>👨‍🍳 Préparation</span>
                                                <span>✅ Prête</span>
                                                <span>🍽️ Servie</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-linear-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: order.status === 'en_attente' ? '10%' :
                                                               order.status === 'en_preparation' ? '40%' :
                                                               order.status === 'prete' ? '75%' :
                                                               order.status === 'servie' ? '100%' : '0%'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Navbar>
    );
};

export default MyOrders;