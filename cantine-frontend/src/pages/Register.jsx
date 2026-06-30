import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const ROLES = [
    { value: 'student', label: 'Etudiant', desc: 'Consulter les menus et commander' },
    { value: 'agent', label: 'Agent de cantine', desc: 'Gérer les commandes' },
    { value: 'admin', label: 'Administrateur', desc: 'Accès complet au système' },
];

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (error) {
            console.error('Register error:', error);
            setError(error.response?.data?.message || error.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-indigo-100 to-white flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-4xl rounded-[36px] bg-white shadow-[0_40px_120px_rgba(99,102,241,0.18)] ring-1 ring-indigo-100 overflow-hidden">
                <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="relative hidden lg:flex items-center justify-center bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-800 px-12 py-14 text-white">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_35%)]" />
                        <div className="relative z-10 max-w-md text-center">
                            <div className="mx-auto mb-8 w-20 h-20 rounded-[28px] bg-white/15 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-11 h-11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold mb-4">Rejoignez FST Cantine</h1>
                            <p className="text-indigo-100 text-lg leading-relaxed mb-8">
                                Inscrivez-vous pour accéder aux menus, passer vos commandes et suivre votre activité de manière fluide.
                            </p>
                            <div className="space-y-4 text-left">
                                {['Menus variés', 'Commande rapide', 'Interface moderne', 'Suivi sécurisé'].map((item, i) => (
                                    <div key={i} className="rounded-3xl border border-white/20 bg-white/10 px-5 py-4 text-sm font-semibold backdrop-blur-sm">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 shadow-2xl shadow-slate-200">
                        <div className="mb-8 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm uppercase tracking-[0.18em] text-indigo-600 font-semibold">Inscription</p>
                                <h2 className="mt-3 text-3xl font-bold text-slate-900">Créer un compte</h2>
                                <p className="mt-2 text-sm text-slate-500">Rejoignez la communauté FST Cantine.</p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 rounded-3xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                                <span className="inline-flex h-2 w-2 rounded-full bg-indigo-600" />
                                FST Cantine
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-3xl border border-red-200 bg-rose-50 px-4 py-3 text-sm text-red-700 mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nom complet</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nom complet"
                                    required
                                    className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="votre@email.com"
                                    required
                                    className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 hover:text-slate-700"
                                    >
                                        {showPassword ? 'Cacher' : 'Voir'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">Rôle</label>
                                <div className="space-y-3">
                                    {ROLES.map((role) => (
                                        <label
                                            key={role.value}
                                            className={`flex items-start gap-3 rounded-3xl border p-4 transition ${
                                                formData.role === role.value
                                                    ? 'border-indigo-400 bg-indigo-50'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="role"
                                                value={role.value}
                                                checked={formData.role === role.value}
                                                onChange={handleChange}
                                                className="mt-1 accent-indigo-500"
                                            />
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">{role.label}</div>
                                                <div className="text-sm text-slate-500">{role.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-3xl bg-linear-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {loading ? 'Inscription...' : 'Créer mon compte →'}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-slate-500">
                            Déjà un compte ?{' '}
                            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-600">
                                Se connecter
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;