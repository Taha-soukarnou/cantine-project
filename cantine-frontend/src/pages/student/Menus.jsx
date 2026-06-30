import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const Menus = () => {
    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState({});

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const response = await api.get('/menus/today');
            setMenus(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (menu) => {
        setCart(prev => ({
            ...prev,
            [menu.id]: {
                ...menu,
                quantity: (prev[menu.id]?.quantity || 0) + 1
            }
        }));
    };

    const removeFromCart = (menuId) => {
        setCart(prev => {
            const updated = { ...prev };
            if (updated[menuId]?.quantity > 1) {
                updated[menuId] = { ...updated[menuId], quantity: updated[menuId].quantity - 1 };
            } else {
                delete updated[menuId];
            }
            return updated;
        });
    };

    const cartItems = Object.values(cart);
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleOrder = () => {
        if (cartItems.length === 0) return;
        navigate('/order', { state: { cart: cartItems } });
    };

    if (loading) return (
        <Navbar>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4 animate-pulse-slow">🍽️</div>
                    <p className="text-gray-500">Chargement des menus...</p>
                </div>
            </div>
        </Navbar>
    );

    return (
        <Navbar>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white py-10 px-4">
                    <div className="max-w-6xl mx-auto animate-fadeIn">
                        <h1 className="text-3xl font-bold mb-1">Menu du jour 🌟</h1>
                        <p className="text-indigo-100">
                            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-8">
                    {menus.length === 0 ? (
                        <div className="text-center py-20 animate-fadeIn">
                            <div className="text-6xl mb-4"></div>
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucun menu aujourd'hui</h2>
                            <p className="text-gray-400">Revenez demain pour découvrir les plats disponibles.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {menus.map((menu, index) => (
                                <div
                                    key={menu.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 animate-fadeIn"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="h-40 bg-linear-to-br from-indigo-100 to-purple-100">
                                        {menu.image ? (
                                            <>
                                                <img
                                                    src={menu.image}
                                                    className="w-full h-40 object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                    alt={menu.dishName}
                                                />
                                                <div className="hidden w-full h-40 items-center justify-center bg-indigo-100 text-indigo-600 text-4xl font-bold">
                                                    {menu.dishName?.charAt(0)?.toUpperCase()}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-40 flex items-center justify-center bg-indigo-100 text-indigo-600 text-4xl font-bold">
                                                {menu.dishName?.charAt(0)?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-gray-800 text-lg">{menu.dishName}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                menu.available
                                                    ? 'bg-emerald-100 text-emerald-600'
                                                    : 'bg-rose-100 text-rose-500'
                                            }`}>
                                                {menu.available ? '✅ Dispo' : '❌ Indispo'}
                                            </span>
                                        </div>

                                        <div className="text-indigo-600 font-bold text-xl mb-4">
                                            {menu.price.toFixed(2)} DH
                                        </div>

                                        {menu.available ? (
                                            <div className="flex items-center gap-3">
                                                {cart[menu.id] ? (
                                                    <div className="flex items-center gap-3 w-full">
                                                        <button
                                                            onClick={() => removeFromCart(menu.id)}
                                                            className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 font-bold text-lg hover:bg-indigo-200 transition flex items-center justify-center"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="font-bold text-gray-800 text-lg flex-1 text-center">
                                                            {cart[menu.id].quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => addToCart(menu)}
                                                            className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart(menu)}
                                                        className="w-full bg-linear-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all"
                                                    >
                                                        + Ajouter au panier
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded-xl text-sm font-semibold cursor-not-allowed">
                                                Non disponible
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart floating button */}
                {cartCount > 0 && (
                    <div className="fixed bottom-6 right-6 animate-fadeIn">
                        <button
                            onClick={handleOrder}
                            className="bg-linear-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 font-semibold"
                        >
                            <span className="text-lg">🛒</span>
                            <span>{cartCount} article{cartCount > 1 ? 's' : ''}</span>
                            <span className="bg-black bg-opacity-20 px-3 py-1 rounded-xl">
                                {cartTotal.toFixed(2)} DH
                            </span>
                            <span>→</span>
                        </button>
                    </div>
                )}
            </div>
        </Navbar>
    );
};

export default Menus;