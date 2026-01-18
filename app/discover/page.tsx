'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MapPin, Heart, ChevronLeft,
    ChevronRight, BadgeCheck, LayoutGrid,
    List, Briefcase, Filter, X, ChevronDown, Sun
} from 'lucide-react';
import Link from 'next/link';

import { UserCard } from '@/app/components/discover/UserCard';

interface Profile {
    id: string;
    userId: string;
    name: string;
    age: number;
    gender: string;
    bio: string;
    location: string;
    photoUrl: string;
    jobCategory: string;
    jobStatus: string;
    maritalStatus: string;
}

export default function DiscoverPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        jobStatus: '',
        maritalStatus: '',
    });

    const jobStatusOptions = [
        { label: 'All Careers', value: '' },
        { label: 'Employed', value: 'EMPLOYED' },
        { label: 'Self-Employed', value: 'SELF_EMPLOYED' },
        { label: 'Student', value: 'STUDENT' },
        { label: 'Retired', value: 'RETIRED' },
    ];

    const maritalStatusOptions = [
        { label: 'All Stories', value: '' },
        { label: 'Single', value: 'SINGLE' },
        { label: 'Divorced', value: 'DIVORCED' },
        { label: 'Widowed', value: 'WIDOWED' },
    ];

    const fetchFavorites = async () => {
        try {
            const response = await fetch('/api/favorites');
            if (response.ok) {
                const data = await response.json();
                setFavoriteIds(data.favoriteIds || []);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const toggleFavorite = async (favoritedId: string) => {
        try {
            const response = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favoritedId }),
            });
            if (response.ok) {
                const data = await response.json();
                if (data.isFavorited) {
                    setFavoriteIds(prev => [...prev, favoritedId]);
                } else {
                    setFavoriteIds(prev => prev.filter(id => id !== favoritedId));
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.jobStatus) params.append('jobStatus', filters.jobStatus);
            if (filters.maritalStatus) params.append('maritalStatus', filters.maritalStatus);

            const response = await fetch(`/api/profiles?${params.toString()}`);

            if (response.status === 401) {
                router.push('/auth/login');
                return;
            }

            const data = await response.json();
            setProfiles(data.profiles || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchProfiles();
            fetchFavorites();
        }
    }, [filters, status]);

    return (
        <div className="bg-slate-50 min-h-screen pb-32 overflow-hidden relative">
            {/* Premium Aurora Background */}
            <div className="aurora-bg">
                <div className="aurora-blob bg-rose-200 w-[600px] h-[600px] -top-[20%] -left-[10%]" />
                <div className="aurora-blob bg-orange-100 w-[500px] h-[500px] top-[10%] -right-[5%] [animation-delay:-5s]" />
                <div className="aurora-blob bg-rose-50 w-[400px] h-[400px] bottom-[10%] left-[20%] [animation-delay:-10s]" />
                <div className="absolute inset-0 grid-pattern opacity-40" />
            </div>

            <main className="relative max-w-7xl mx-auto px-6 pt-32 space-y-16">
                {/* Advanced Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-6 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 text-rose-600 font-black text-[11px] uppercase tracking-[0.4em]"
                        >
                            <span className="w-10 h-[2px] bg-rose-500 rounded-full" />
                            Aura Resonance
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                            className="text-6xl md:text-8xl font-serif text-slate-900 tracking-tight leading-[0.9]"
                        >
                            Discover Your <br />
                            <span className="italic text-rose-500 relative">
                                Soul's
                                <motion.div
                                    className="absolute -bottom-2 left-0 h-1 bg-rose-200/50 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ delay: 0.8, duration: 1 }}
                                />
                            </span> Match
                        </motion.h1>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="hidden lg:block bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-[2.5rem] shadow-xl shadow-slate-900/5"
                    >
                        <div className="flex items-center gap-6">
                            <div className="h-12 w-12 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                                <Search size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Aura Matches</p>
                                <p className="text-2xl font-serif text-slate-900">{profiles.length}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Refined Custom Filters */}
                <div className="sticky top-8 z-50">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-3 shadow-2xl shadow-slate-900/10 flex flex-col md:flex-row items-center gap-3 overflow-hidden"
                    >
                        <div className="flex flex-wrap items-center justify-center gap-2 p-1">
                            {jobStatusOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFilters({ ...filters, jobStatus: opt.value })}
                                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all ${filters.jobStatus === opt.value
                                            ? 'bg-slate-900 text-white shadow-lg'
                                            : 'text-slate-500 hover:bg-white/80 hover:text-slate-900'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <div className="hidden md:block w-px h-8 bg-slate-200/50" />
                        <div className="flex flex-wrap items-center justify-center gap-2 p-1">
                            {maritalStatusOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFilters({ ...filters, maritalStatus: opt.value })}
                                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all ${filters.maritalStatus === opt.value
                                            ? 'bg-rose-600 text-white shadow-lg'
                                            : 'text-slate-500 hover:bg-white/80 hover:text-rose-600'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {(filters.jobStatus || filters.maritalStatus) && (
                            <button
                                onClick={() => setFilters({ jobStatus: '', maritalStatus: '' })}
                                className="p-3 text-slate-400 hover:text-rose-600 transition-colors ml-auto"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </motion.div>
                </div>

                {/* Match Grid - Ultra Responsive */}
                <div className="min-h-[600px]">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="space-y-6">
                                    <div className="aspect-[4/5] rounded-[2.5rem] bg-slate-200/50 animate-pulse" />
                                    <div className="h-6 w-1/2 bg-slate-200/50 rounded-full animate-pulse" />
                                    <div className="h-4 w-3/4 bg-slate-200/50 rounded-full animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : profiles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-20 md:gap-y-24">
                            <AnimatePresence mode="popLayout">
                                {profiles.map((profile, index) => (
                                    <UserCard
                                        key={profile.id}
                                        profile={profile}
                                        index={index}
                                        isFavorite={favoriteIds.includes(profile.userId)}
                                        onToggleFavorite={toggleFavorite}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-40 space-y-4"
                        >
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <Search size={32} />
                            </div>
                            <h3 className="text-3xl font-serif text-slate-400">Searching for your aura...</h3>
                            <p className="text-sm text-slate-300">Try adjusting your resonance filters to find more matches.</p>
                        </motion.div>
                    )}
                </div>

                {/* Elite Pagination */}
                {profiles.length > 0 && (
                    <div className="flex items-center justify-center pt-20">
                        <div className="group flex items-center gap-1 p-2 bg-white/40 backdrop-blur-xl rounded-full border border-white/50 shadow-lg">
                            <button className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all">Previous</button>
                            <div className="w-12 h-[2px] bg-slate-100 group-hover:bg-rose-100 transition-colors" />
                            <button className="px-8 py-3 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-rose-600 transition-all transform hover:scale-105 active:scale-95">Next Resonance</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
