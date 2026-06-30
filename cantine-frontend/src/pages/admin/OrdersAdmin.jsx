import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const STATUS_TABS = [
    { key: 'toutes', label: 'Toutes' },
    { key: 'en_attente', label: 'En attente' },
    { key: 'en_preparation', label: 'En préparation' },
    { key: 'prete', label: 'Prête' },
    { key: 'servie', label: 'Servie' },
    { key: 'annulee', label: 'Annulée' },
];

const STATUS_CONFIG = {
    en_attente: { label: 'En attente', color: 'bg-indigo-100 text-indigo-700' },
    en_preparation: { label: 'En préparation', color: 'bg-violet-100 text-violet-700' },
    prete: { label: 'Prête', color: 'bg-emerald-100 text-emerald-700' },
    servie: { label: 'Servie', color: 'bg-slate-100 text-slate-600' },
    annulee: { label: 'Annulée', color: 'bg-rose-100 text-rose-600' },
};

const OrdersAdmin = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('toutes');
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data || []);
        } catch (err) {
            console.error(err);
            setError('Impossible de charger les commandes.');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        return activeTab === 'toutes'
            ? orders
            : orders.filter((order) => order.status === activeTab);
    }, [orders, activeTab]);

    const updateStatus = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        setError('');
        setSuccess('');
        try {
            const response = await api.put(`/orders/${orderId}/status?status=${newStatus}`);
            setOrders((prev) => prev.map((order) => (order.id === orderId ? response.data : order)));
            setSuccess('Statut mis à jour.');
        } catch (err) {
            console.error(err);
            setError('Impossible de mettre à jour le statut.');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <Navbar>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Chargement des commandes...</p>
                    </div>
                </div>
            </Navbar>
        );
    }

    return (
        <Navbar>
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-100 px-4 py-6">
                    <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Gestion des commandes</h1>
                            <p className="text-gray-400 text-sm mt-1">Mise à jour des statuts en temps réel</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-rose-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm animate-fadeIn">
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                                    activeTab === tab.key
                                        ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm animate-fadeIn sm:p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-500">
                                        <th className="px-3 py-3 font-semibold">Commande</th>
                                        <th className="px-3 py-3 font-semibold">Étudiant</th>
                                        <th className="px-3 py-3 font-semibold">Articles</th>
                                        <th className="px-3 py-3 font-semibold">Total</th>
                                        <th className="px-3 py-3 font-semibold">Statut</th>
                                        <th className="px-3 py-3 font-semibold">Date</th>
                                        <th className="px-3 py-3 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-3 py-10 text-center text-gray-400">
                                                Aucune commande dans cette catégorie.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => {
                                            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.en_attente;
                                            return (
                                                <tr key={order.id} className="border-b border-gray-50 last:border-0">
                                                    <td className="px-3 py-3">
                                                        <div className="font-semibold text-gray-800">#{order.id}</div>
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-600">
                                                        {order.user?.name || order.studentName || order.userName || '-'}
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-600">
                                                        <div className="max-w-xs space-y-1">
                                                            {(order.orderItems || []).map((item) => (
                                                                <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                                                                    <span>{item.menu?.dishName || item.name || 'Plat'}</span>
                                                                    <span className="text-gray-400">× {item.quantity}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-600">{Number(order.totalPrice || 0).toFixed(2)} DH</td>
                                                    <td className="px-3 py-3">
                                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-600">
                                                        {order.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR') : '-'}
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                                            disabled={updatingId === order.id}
                                                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-400"
                                                        >
                                                            <option value="en_attente">En attente</option>
                                                            <option value="en_preparation">En préparation</option>
                                                            <option value="prete">Prête</option>
                                                            <option value="servie">Servie</option>
                                                            <option value="annulee">Annulée</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Navbar>
    );
};

export default OrdersAdmin;
