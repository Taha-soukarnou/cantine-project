import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const links = [
        { path: '/menus', label: '🍽️ Menus', roles: ['student'] },
        { path: '/my-orders', label: '📋 Mes Commandes', roles: ['student'] },
        { path: '/dashboard', label: '📊 Dashboard', roles: ['admin', 'agent'] },
        { path: '/admin/menus', label: '🍕 Menus', roles: ['admin', 'agent'] },
        { path: '/admin/orders', label: '📦 Commandes', roles: ['admin', 'agent'] },
    ];

    const visibleLinks = links.filter(l => l.roles.includes(user?.role));
    const homePath = user?.role === 'student' ? '/menus' : '/dashboard';

    return (
        <div className="min-h-screen flex bg-slate-50">
            <aside className="hidden lg:flex lg:w-80 lg:sticky lg:top-0 lg:self-start lg:h-screen flex-col overflow-hidden border-r border-gray-200 bg-white shadow-sm">
                <div className="px-6 py-6 border-b border-gray-200">
                    <Link to={homePath} className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl">
                            🍽️
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 text-lg">FST Cantine</p>
                            <p className="text-xs text-gray-500">Espace de gestion</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
                    {visibleLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                location.pathname === link.path
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-gray-200 px-6 py-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-11 w-11 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-rose-50 hover:text-red-600 transition"
                    >
                        Déconnexion
                    </button>
                </div>
            </aside>

            <div className="flex-1 min-h-screen">
                <div className="lg:hidden border-b border-gray-200 bg-white px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <Link to={homePath} className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg">
                                🍽️
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">FST Cantine</p>
                                <p className="text-xs text-gray-500">{user?.name}</p>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-semibold text-red-600"
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>

                <div className="lg:hidden border-b border-gray-200 bg-white px-4 py-3">
                    <div className="flex gap-2 overflow-x-auto">
                        {visibleLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`whitespace-nowrap rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                                    location.pathname === link.path
                                        ? 'bg-indigo-600 text-white border-indigo-500'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
};

export default Navbar;