import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const StatCard = ({ title, value, subtitle, trend, trendClass, color, icon }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fadeIn">
        <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xs font-bold ${color}`}>
                {icon}
            </div>
        </div>
        <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
        <div className="text-sm font-semibold text-slate-700">{title}</div>
        {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
        {trend && <div className={`${trendClass || 'text-slate-500'} text-sm mt-2`}>{trend}</div>}
    </div>
);

const STATUS_CONFIG = {
    en_attente: { label: 'En attente', color: 'bg-indigo-100 text-indigo-700', bar: 'bg-indigo-400', chartColor: '#4F46E5' },
    en_preparation: { label: 'En préparation', color: 'bg-amber-100 text-amber-700', bar: 'bg-amber-400', chartColor: '#D97706' },
    prete: { label: 'Prête', color: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-400', chartColor: '#10B981' },
    servie: { label: 'Servie', color: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400', chartColor: '#64748B' },
    annulee: { label: 'Annulée', color: 'bg-rose-100 text-rose-600', bar: 'bg-rose-400', chartColor: '#F43F5E' },
};

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ordersRes, menusRes] = await Promise.all([
                api.get('/orders'),
                api.get('/menus'),
            ]);
            setOrders(ordersRes.data);
            setMenus(menusRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Stats calculations
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'en_attente').length;
    const availableMenus = menus.filter(m => m.available).length;

    const statusCounts = orders.reduce((acc, order) => {
        const status = order.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const knownStatusCounts = Object.entries(STATUS_CONFIG).reduce((acc, [status]) => {
        acc[status] = statusCounts[status] || 0;
        return acc;
    }, {});

    const unknownStatusCount = Object.entries(statusCounts)
        .filter(([status]) => !STATUS_CONFIG[status])
        .reduce((sum, [, count]) => sum + count, 0);

    const pieData = [
        ...Object.entries(knownStatusCounts).map(([status, count]) => ({
            label: STATUS_CONFIG[status].label,
            value: count,
            count,
            percent: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
            color: STATUS_CONFIG[status].chartColor,
        })),
        ...(unknownStatusCount > 0 ? [{
            label: 'Autre',
            value: unknownStatusCount,
            count: unknownStatusCount,
            percent: totalOrders > 0 ? Math.round((unknownStatusCount / totalOrders) * 100) : 0,
            color: '#64748B',
        }] : []),
    ];

    const hasStatusData = pieData.some((entry) => entry.value > 0);

    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.createdAt?.startsWith(today));
    const todayTopDish = (() => {
        const counts = {};
        todayOrders.forEach(o => {
            o.orderItems?.forEach(item => {
                const name = item.menu?.dishName || 'Inconnu';
                counts[name] = (counts[name] || 0) + item.quantity;
            });
        });
        return Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || null;
    })();
    const revenueToday = todayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    const filteredRecentOrders = recentOrders.filter((order) => {
        const name = order.user?.name || order.studentName || '';
        return name.toLowerCase().includes(search.toLowerCase());
    });

    const topMenus = menus
        .map(menu => ({
            ...menu,
            orderCount: orders.flatMap(o => o.orderItems || [])
                .filter(item => item.menu?.id === menu.id)
                .reduce((sum, item) => sum + item.quantity, 0)
        }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 4);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const dayOrders = orders.filter(o => o.createdAt?.startsWith(dateStr));
        return {
            date: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
            commandes: dayOrders.length,
            revenu: dayOrders.reduce((s, o) => s + (o.totalPrice || 0), 0),
        };
    });

    const revenueByStatus = Object.entries(STATUS_CONFIG).map(([status, config]) => ({
        status: config.label,
        montant: orders.reduce((acc, order) => acc + ((order.status === status ? order.totalPrice : 0) || 0), 0),
        color: config.bar,
    }));

    if (loading) return (
        <Navbar>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="w-full max-w-3xl rounded-4xl bg-white p-10 shadow-xl animate-pulse-slow">
                    <div className="h-8 rounded-full bg-slate-200 mb-4" />
                    <div className="h-6 rounded-full bg-slate-200 mb-6 w-3/4" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="h-36 rounded-3xl bg-slate-200" />
                        <div className="h-36 rounded-3xl bg-slate-200" />
                        <div className="h-36 rounded-3xl bg-slate-200" />
                        <div className="h-36 rounded-3xl bg-slate-200" />
                    </div>
                </div>
            </div>
        </Navbar>
    );

    return (
        <Navbar>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-4 py-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
                                <p className="text-gray-400 text-sm mt-1">
                                    {new Date().toLocaleDateString('fr-FR', {
                                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 items-center">
                                <button
                                    onClick={fetchData}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
                                >
                                    {loading ? (
                                        <span className="inline-flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                                            Actualiser
                                        </span>
                                    ) : 'Actualiser'}
                                </button>
                                <Link
                                    to="/admin/menus"
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
                                >
                                    Gérer les menus
                                </Link>
                                <Link
                                    to="/admin/orders"
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
                                >
                                    Voir les commandes
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                    <div className="rounded-3xl bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-800 p-6 text-white">
                        <p style={{ fontSize: '12px', fontWeight: '600', opacity: 0.8, textTransform: 'uppercase', marginBottom: '4px' }}>
                            Résumé du jour
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-6">
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {new Date().toLocaleDateString('fr-FR')}
                                </div>
                                <div style={{ fontSize: '12px', opacity: 0.8 }}>Date</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{todayOrders.length}</div>
                                <div style={{ fontSize: '12px', opacity: 0.8 }}>Commandes aujourd'hui</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {revenueToday.toFixed(0)} DH
                                </div>
                                <div style={{ fontSize: '12px', opacity: 0.8 }}>Revenu aujourd'hui</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {todayTopDish || 'Aucun'}
                                </div>
                                <div style={{ fontSize: '12px', opacity: 0.8 }}>Plat le plus commandé</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Commandes totales"
                            value={totalOrders}
                            subtitle="Toutes périodes"
                            trend={totalOrders > 0 ? '+ 3 cette semaine' : 'Aucune variation'}
                            trendClass={totalOrders > 0 ? 'text-emerald-600' : 'text-slate-500'}
                            color="bg-linear-to-br from-indigo-500 to-purple-600"
                            icon="Cmd"
                        />
                        <StatCard
                            title="Revenu total"
                            value={`${totalRevenue.toFixed(0)} DH`}
                            subtitle="Commandes servies incluses"
                            trend={totalRevenue > 0 ? '+ 1 200 DH cette semaine' : 'Aucune variation'}
                            trendClass={totalRevenue > 0 ? 'text-emerald-600' : 'text-slate-500'}
                            color="bg-linear-to-br from-indigo-500 to-purple-600"
                            icon="DH"
                        />
                        <StatCard
                            title="En attente"
                            value={pendingOrders}
                            subtitle="À traiter maintenant"
                            trend={pendingOrders > 0 ? '- 1 cette semaine' : 'Aucune variation'}
                            trendClass={pendingOrders > 0 ? 'text-emerald-600' : 'text-slate-500'}
                            color="bg-linear-to-br from-indigo-500 to-purple-600"
                            icon="Att"
                        />
                        <StatCard
                            title="Menus disponibles"
                            value={availableMenus}
                            subtitle={`Sur ${menus.length} menus au total`}
                            trend={availableMenus > 0 ? '+ 2 cette semaine' : 'Aucune variation'}
                            trendClass={availableMenus > 0 ? 'text-emerald-600' : 'text-slate-500'}
                            color="bg-linear-to-br from-indigo-500 to-purple-600"
                            icon="Men"
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">Commandes et revenu</h2>
                                    <p className="text-sm text-gray-400">Tendance de la semaine</p>
                                </div>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={last7Days} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.35} />
                                                <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tickLine={false} axisLine={false} />
                                        <YAxis tickLine={false} axisLine={false} />
                                        <Tooltip formatter={(value) => `${value} DH`} />
                                        <Area type="monotone" dataKey="revenu" stroke="#7C3AED" fill="url(#revenueGradient)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">Répartition des statuts</h2>
                                    <p className="text-sm text-gray-400">Value par statut</p>
                                </div>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueByStatus} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                                        <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                                        <XAxis dataKey="status" tickLine={false} axisLine={false} />
                                        <YAxis tickLine={false} axisLine={false} />
                                        <Tooltip formatter={(value) => `${value} DH`} />
                                        <Bar dataKey="montant" radius={[12, 12, 0, 0]}>
                                            {revenueByStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#4F46E5', '#8B5CF6', '#10B981', '#94A3B8', '#F43F5E'][index % 5]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">Commandes par statut</h2>
                                    <p className="text-sm text-gray-400">Proportion des commandes</p>
                                </div>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Tooltip formatter={(value) => [`${value} commandes`, 'Total']} />
                                        {hasStatusData ? (
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                nameKey="label"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={0}
                                                startAngle={90}
                                                endAngle={-270}
                                                fill="#8884d8"
                                                stroke="transparent"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`slice-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        ) : (
                                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#64748B" fontSize={14}>
                                                Aucune donnée disponible
                                            </text>
                                        )}
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {pieData.map((entry) => (
                                    <div key={entry.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="block h-3.5 w-3.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className="text-sm font-semibold text-slate-900">{entry.label}</span>
                                        </div>
                                        <div className="mt-1 text-sm text-slate-600">
                                            {entry.count} commande{entry.count > 1 ? 's' : ''} • {entry.percent}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Répartition par statut */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fadeIn">
                            <h2 className="text-base font-bold text-gray-800 mb-5">Répartition des commandes</h2>
                            <div className="space-y-4">
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                                    const count = statusCounts[key] || 0;
                                    const percent = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
                                    return (
                                        <div key={key}>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-gray-600 font-medium">{config.label}</span>
                                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                                                    {count}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${config.bar}`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <div className="mt-1 text-xs text-gray-400">{percent}% du total</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-6 text-sm font-semibold text-gray-600">Total: {totalOrders} commandes</div>
                        </div>

                        {/* Plats les plus commandés */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fadeIn">
                            <h2 className="text-base font-bold text-gray-800 mb-5">Plats les plus commandés</h2>
                            {topMenus.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-8">Aucune donnée disponible</p>
                            ) : (
                                <div className="space-y-4">
                                    {topMenus.map((menu, index) => (
                                        <div key={menu.id} className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-gray-700 truncate">
                                                    {menu.dishName}
                                                </div>
                                                <div className="text-xs text-gray-400">{menu.price} DH</div>
                                            </div>
                                            <div className="text-sm font-bold text-indigo-600">
                                                ×{menu.orderCount}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions rapides */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fadeIn">
                            <h2 className="text-base font-bold text-gray-800 mb-5">Actions rapides</h2>
                            <div className="space-y-3">
                                <Link
                                    to="/admin/menus"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition group"
                                >
                                    <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                                        +
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-700">Ajouter un menu</div>
                                        <div className="text-xs text-gray-400">Créer un nouveau plat</div>
                                    </div>
                                </Link>
                                <Link
                                    to="/admin/orders"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition group"
                                >
                                    <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600 group-hover:bg-violet-500 group-hover:text-white transition">
                                        ↗
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-700">Traiter les commandes</div>
                                        <div className="text-xs text-gray-400">{pendingOrders} en attente</div>
                                    </div>
                                </Link>
                                <Link
                                    to="/admin/menus"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition group"
                                >
                                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition">
                                        ✓
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-700">Gérer la disponibilité</div>
                                        <div className="text-xs text-gray-400">{availableMenus} menus actifs</div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Commandes récentes */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fadeIn">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
                            <h2 className="text-base font-bold text-gray-800">Commandes récentes</h2>
                            <Link
                                to="/admin/orders"
                                className="text-sm text-indigo-600 font-semibold hover:text-indigo-600 transition"
                            >
                                Voir tout →
                            </Link>
                        </div>
                        <div>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher par nom d'étudiant"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 mb-4"
                            />
                        </div>

                        {filteredRecentOrders.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                Aucun résultat
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-50">
                                            <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">#</th>
                                            <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">Étudiant</th>
                                            <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">Plats</th>
                                            <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">Total</th>
                                            <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">Statut</th>
                                            <th className="text-left text-xs font-semibold text-gray-400 pb-3">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredRecentOrders.map((order) => {
                                            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.en_attente;
                                            return (
                                                <tr key={order.id} className="hover:bg-gray-50 transition">
                                                    <td className="py-3 pr-4 text-sm font-semibold text-gray-500">
                                                        #{order.id}
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                {order.user?.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {order.user?.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pr-4 text-sm text-gray-500">
                                                        {order.orderItems?.length || 0} article{(order.orderItems?.length || 0) > 1 ? 's' : ''}
                                                    </td>
                                                    <td className="py-3 pr-4 text-sm font-bold text-indigo-600">
                                                        {order.totalPrice?.toFixed(2)} DH
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-xs text-gray-400">
                                                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Navbar>
    );
};

export default Dashboard;