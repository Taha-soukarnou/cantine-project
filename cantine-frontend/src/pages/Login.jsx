import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
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
            const response = await api.post('/auth/login', formData);
            const { token, user } = response.data;
            login(user, token);
            if (user.role === 'admin' || user.role === 'agent') {
                navigate('/dashboard');
            } else {
                navigate('/menus');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || error.message || 'Email ou mot de passe incorrect');
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
                            <h1 className="text-4xl font-bold mb-4">FST Cantine</h1>
                            <p className="text-indigo-100 text-lg leading-relaxed mb-8">
                                Accédez aux menus, passez vos commandes et suivez votre activité en toute simplicité.
                            </p>
                            <div className="space-y-4 text-left">
                                {['Menus du jour', 'Commande express', 'Suivi instantané'].map((text, i) => (
                                    <div key={i} className="rounded-3xl border border-white/20 bg-white/10 px-5 py-4 text-sm font-semibold backdrop-blur-sm">
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 shadow-2xl shadow-slate-200">
                        <div className="mb-8 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm uppercase tracking-[0.18em] text-indigo-600 font-semibold">Connexion</p>
                                <h2 className="mt-3 text-3xl font-bold text-slate-900">Bon retour !</h2>
                                <p className="mt-2 text-sm text-slate-500">Connectez-vous à votre espace.</p>
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-3xl bg-linear-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {loading ? 'Connexion...' : 'Se connecter →'}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-slate-500">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-600">
                                S'inscrire
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;