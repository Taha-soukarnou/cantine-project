import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const emptyForm = {
    dishName: '',
    price: '',
    menuDate: '',
    available: true,
    image: '',
};

const MenusAdmin = () => {
    const { user } = useAuth();
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [togglingId, setTogglingId] = useState(null);

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const response = await api.get('/menus');
            setMenus(response.data || []);
        } catch (err) {
            console.error(err);
            setError('Impossible de charger les menus.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = (clearMessages = true) => {
        setFormData(emptyForm);
        setEditingMenu(null);
        setError('');
        if (clearMessages) setSuccess('');
    };

    const openCreateModal = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEditModal = (menu) => {
        setEditingMenu(menu);
        setFormData({
            dishName: menu.dishName || '',
            price: menu.price ?? '',
            menuDate: menu.menuDate ? menu.menuDate.split('T')[0] : '',
            available: Boolean(menu.available),
            image: menu.image || '',
        });
        setError('');
        setSuccess('');
        setModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                dishName: formData.dishName.trim(),
                price: Number(formData.price),
                menuDate: formData.menuDate,
                available: formData.available,
                ...(formData.image ? { image: formData.image.trim() } : {}),
            };

            if (editingMenu) {
                await api.put(`/menus/${editingMenu.id}`, payload);
                setSuccess('Menu mis à jour avec succès.');
            } else {
                await api.post('/menus', payload);
                setSuccess('Menu ajouté avec succès.');
            }

            await fetchMenus();
            setModalOpen(false);
            resetForm(false);
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Une erreur est survenue lors de l’enregistrement du menu.';
            setError(message);
            console.error('Menu save error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (menuId) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce menu ?')) return;

        try {
            await api.delete(`/menus/${menuId}`);
            setMenus((prev) => prev.filter((menu) => menu.id !== menuId));
            setSuccess('Menu supprimé avec succès.');
        } catch (err) {
            console.error(err);
            setError('Impossible de supprimer ce menu.');
        }
    };

    const handleToggleAvailability = async (menuId) => {
        setTogglingId(menuId);
        try {
            const response = await api.patch(`/menus/${menuId}/toggle`);
            setMenus((prev) => prev.map((menu) => menu.id === menuId ? response.data : menu));
            setSuccess('Disponibilité mise à jour.');
        } catch (err) {
            console.error(err);
            setError('Impossible de modifier la disponibilité.');
        } finally {
            setTogglingId(null);
        }
    };

    if (loading) {
        return (
            <Navbar>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Chargement des menus...</p>
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
                            <h1 className="text-2xl font-bold text-gray-800">Gestion des menus</h1>
                            <p className="text-gray-400 text-sm mt-1">Bienvenue, {user?.name || 'administrateur'}</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-600 hover:to-purple-700"
                        >
                            Ajouter un menu
                        </button>
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

                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm animate-fadeIn sm:p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-500">
                                        <th className="px-3 py-3 font-semibold">Plat</th>
                                        <th className="px-3 py-3 font-semibold">Prix</th>
                                        <th className="px-3 py-3 font-semibold">Date</th>
                                        <th className="px-3 py-3 font-semibold">Statut</th>
                                        <th className="px-3 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {menus.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-3 py-10 text-center text-gray-400">
                                                Aucun menu enregistré pour le moment.
                                            </td>
                                        </tr>
                                    ) : (
                                        menus.map((menu) => (
                                            <tr key={menu.id} className="border-b border-gray-50 last:border-0">
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {menu.image ? (
                                                            <img
                                                                src={menu.image}
                                                                alt={menu.dishName}
                                                                className="h-10 w-10 rounded-xl object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-600">
                                                                {menu.dishName?.charAt(0)?.toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="font-semibold text-gray-800">{menu.dishName}</div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-gray-600">{Number(menu.price).toFixed(2)} DH</td>
                                                <td className="px-3 py-3 text-gray-600">
                                                    {menu.menuDate ? new Date(menu.menuDate).toLocaleDateString('fr-FR') : '-'}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${menu.available ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                                                        {menu.available ? 'Disponible' : 'Indisponible'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-right">
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        <button
                                                            onClick={() => handleToggleAvailability(menu.id)}
                                                            disabled={togglingId === menu.id}
                                                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            {togglingId === menu.id ? '...' : menu.available ? 'Marquer indisponible' : 'Marquer disponible'}
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(menu)}
                                                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                                                        >
                                                            Modifier
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(menu.id)}
                                                            className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-rose-50"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
                        <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl animate-fadeIn">
                            <div className="mb-5 flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{editingMenu ? 'Modifier le menu' : 'Ajouter un menu'}</h2>
                                    <p className="text-sm text-gray-400">Renseignez les informations du plat.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setModalOpen(false);
                                        resetForm();
                                    }}
                                    className="text-sm font-semibold text-gray-500"
                                >
                                    Fermer
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">Nom du plat</label>
                                    <input
                                        type="text"
                                        name="dishName"
                                        value={formData.dishName}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-gray-700">Prix</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-gray-700">Date du menu</label>
                                        <input
                                            type="date"
                                            name="menuDate"
                                            value={formData.menuDate}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        URL de l'image (optionnel)
                                    </label>
                                    <input
                                        type="text"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                                    />
                                    {formData.image && (
                                        <img
                                            src={formData.image}
                                            alt="preview"
                                            className="mt-2 w-full h-32 object-cover rounded-xl border border-gray-200"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    )}
                                </div>

                                <label className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        name="available"
                                        checked={formData.available}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-400"
                                    />
                                    Disponible à la commande
                                </label>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModalOpen(false);
                                            resetForm();
                                        }}
                                        className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60"
                                    >
                                        {submitting ? 'Enregistrement...' : editingMenu ? 'Enregistrer' : 'Créer le menu'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Navbar>
    );
};

export default MenusAdmin;
