'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Check, User, Loader2, ArrowRight } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuthFormProps {
    mode: 'login' | 'register';
    onSuccess?: () => void;
}

export default function AuthForm({ mode: initialMode, onSuccess }: AuthFormProps) {
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (mode === 'login') {
            const result = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (result?.error) {
                setError('Invalid email or password');
                setLoading(false);
            } else {
                if (onSuccess) onSuccess();
                // Check for profile existence and redirect
                const profileRes = await fetch('/api/profile');
                const profileData = await profileRes.json();

                if (profileData.success && profileData.profile) {
                    router.push('/discover');
                } else {
                    router.push('/profile');
                }
                router.refresh();
            }
        } else {
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (res.ok) {
                    // Auto login after registration
                    const loginResult = await signIn('credentials', {
                        redirect: false,
                        email: formData.email,
                        password: formData.password,
                    });

                    if (!loginResult?.error) {
                        router.push('/profile');
                        router.refresh();
                    } else {
                        setMode('login');
                        setError('Registration successful! Please sign in.');
                        setLoading(false);
                    }
                } else {
                    const data = await res.json();
                    setError(data.error || 'Registration failed');
                    setLoading(false);
                }
            } catch (err) {
                setError('An error occurred during registration');
                setLoading(false);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-rose-900/5 border border-white relative z-10 w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h2 className="font-serif text-2xl text-slate-900">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                    {mode === 'login'
                        ? 'Please enter your details to continue'
                        : 'Join our community of meaningful connections'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                    {mode === 'register' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-1.5 overflow-hidden"
                        >
                            <label className="text-xs font-medium text-slate-700 ml-1">Full Name</label>
                            <div className="relative group">
                                <input
                                    name="name"
                                    type="text"
                                    required={mode === 'register'}
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full minimal-input rounded-xl block p-3 pl-10 h-12 outline-none border border-slate-100 focus:border-rose-400 transition-colors"
                                />
                                <User className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 ml-1">Email Address</label>
                    <div className="relative group">
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full minimal-input rounded-xl block p-3 pl-10 h-12 outline-none border border-slate-100 focus:border-rose-400 transition-colors"
                        />
                        <Mail className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 ml-1">Password</label>
                    <div className="relative group">
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full minimal-input rounded-xl block p-3 pl-10 h-12 outline-none border border-slate-100 focus:border-rose-400 transition-colors"
                        />
                        <Lock className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                    </div>
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-rose-500 font-medium ml-1"
                    >
                        {error}
                    </motion.p>
                )}

                {mode === 'login' && (
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="w-4 h-4 border border-slate-300 rounded flex items-center justify-center transition-colors bg-white group-hover:border-rose-400">
                                <Check className="text-rose-600 hidden group-hover:block" size={10} strokeWidth={4} />
                            </div>
                            <span className="text-xs text-slate-500 select-none">Remember me</span>
                        </label>
                        <Link href="#" className="text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors">Forgot password?</Link>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-rose-600 text-white font-medium rounded-xl text-sm px-5 py-3 text-center transition-all shadow-lg hover:shadow-rose-500/25 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <>
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">
                    {mode === 'login' ? (
                        <>
                            Don't have an account?{' '}
                            <button
                                onClick={() => setMode('register')}
                                className="text-rose-600 font-medium hover:underline"
                            >
                                Sign Up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button
                                onClick={() => setMode('login')}
                                className="text-rose-600 font-medium hover:underline"
                            >
                                Sign In
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
