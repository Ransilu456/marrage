'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, X
} from 'lucide-react';

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

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState<{ jobStatus: string; maritalStatus: string; jobCategory: string }>({
        jobStatus: '',
        maritalStatus: '',
        jobCategory: ''
    });

    const JOB_CATEGORIES = [
        'Doctor', 'Engineer', 'Teacher', 'Lawyer',
        'Business', 'Artist', 'Architect', 'Scientist',
        'Nurse', 'Pilot', 'Police', 'Politician'
    ];

    const fetchFavorites = useCallback(async () => {
        try {
            const response = await fetch('/api/favorites');
            if (response.ok) {
                const data = await response.json();
                setFavoriteIds(data.favoriteIds || []);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    }, []);

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

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.jobStatus) queryParams.append('jobStatus', filters.jobStatus);
            if (filters.maritalStatus) queryParams.append('maritalStatus', filters.maritalStatus);
            if (filters.jobCategory) queryParams.append('jobCategory', filters.jobCategory);
            queryParams.append('page', page.toString());
            queryParams.append('limit', '12');

            const response = await fetch(`/api/profiles?${queryParams.toString()}`);
            if (response.status === 401) {
                router.push('/auth/login');
                return;
            }
            if (!response.ok) throw new Error('Failed to fetch profiles');

            const data = await response.json();
            setProfiles(data.profiles || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, page, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchFavorites();
        }
    }, [status, fetchFavorites]);

    useEffect(() => {
        setPage(1);
    }, [filters]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchProfiles();
        }
    }, [status, fetchProfiles, router]);

    return (
        <div className="bg-slate-50 min-h-screen relative overflow-x-hidden selection:bg-orange-100 selection:text-orange-900 pb-32">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full aurora-blob bg-rose-100/40 mix-blend-multiply filter blur-[100px] opacity-70 animate-blob" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full aurora-blob bg-orange-100/40 mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute top-[40%] left-[20%] w-[500px] h-[500px] rounded-full aurora-blob bg-amber-50/40 mix-blend-multiply filter blur-[100px] opacity-60 animate-blob animation-delay-4000" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 space-y-12 md:space-y-16">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-enter">
                    <div className="space-y-4 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 text-orange-600 font-black text-[11px] uppercase tracking-[0.4em]"
                        >
                            <span className="w-12 h-[2px] bg-orange-200" />
                            Discover Souls
                        </motion.div>
                        <h1 className="text-6xl md:text-8xl font-serif text-slate-900 leading-[0.9]">
                            Find your <br />
                            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 pr-4">Resonance</span>
                        </h1>
                    </div>
                </div>

                {/* Filters Section (Sticky) */}
                <div className="sticky top-6 z-40 animate-enter delay-100 space-y-4">
                    {/* Primary Filters */}
                    <div className="glass-card rounded-[2.5rem] p-2 shadow-2xl shadow-slate-900/5 flex flex-col md:flex-row items-center gap-2 overflow-hidden mx-auto max-w-full md:max-w-fit bg-white/70 backdrop-blur-2xl border border-white/60">
                        <div className="flex items-center gap-2 p-1 overflow-x-auto w-full md:w-auto no-scrollbar">
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, jobStatus: prev.jobStatus === 'EMPLOYED' ? '' : 'EMPLOYED' }))}
                                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filters.jobStatus === 'EMPLOYED'
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                Employed
                            </button>
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, maritalStatus: prev.maritalStatus === 'NEVER_MARRIED' ? '' : 'NEVER_MARRIED' }))}
                                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filters.maritalStatus === 'NEVER_MARRIED'
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                Never Married
                            </button>

                            {/* Clear Filter Icon */}
                            {(filters.jobStatus || filters.maritalStatus || filters.jobCategory) && (
                                <button
                                    onClick={() => setFilters({ jobStatus: '', maritalStatus: '', jobCategory: '' })}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                                    title="Clear all filters"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Job Category Filters (Scrollable) */}
                    <div className="flex gap-2 overflow-x-auto pb-4 px-2 no-scrollbar mask-grad-x justify-start md:justify-center">
                        {JOB_CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilters(prev => ({ ...prev, jobCategory: prev.jobCategory === cat ? '' : cat }))}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${filters.jobCategory === cat
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                                    : 'bg-white border-slate-200 text-slate-400 hover:border-orange-200 hover:text-orange-500'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid Section */}
                <div className="min-h-[600px] animate-enter delay-200">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="glass-card rounded-[2.5rem] overflow-hidden space-y-4 p-3 h-[450px] bg-white/40 border border-white/50">
                                    <div className="w-full h-3/4 bg-slate-200/50 rounded-[2rem] animate-pulse" />
                                    <div className="px-2 space-y-3">
                                        <div className="h-6 w-1/2 bg-slate-200/50 rounded-full animate-pulse" />
                                        <div className="h-4 w-3/4 bg-slate-200/30 rounded-full animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : profiles.length > 0 ? (
                        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
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
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-40 space-y-4"
                        >
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300 shadow-inner">
                                <Search size={32} />
                            </div>
                            <h3 className="text-3xl font-serif text-slate-400">Searching for your aura...</h3>
                            <p className="text-sm text-slate-300">Try adjusting your resonance filters to find more matches.</p>

                            <button
                                onClick={() => setFilters({ jobStatus: '', maritalStatus: '', jobCategory: '' })}
                                className="mt-4 px-6 py-2 bg-white border border-slate-200 rounded-full text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center pt-8 md:pt-16 animate-enter delay-300">
                        <div className="group flex items-center gap-1 p-1.5 bg-white/60 backdrop-blur-xl rounded-full border border-amber-100 shadow-xl shadow-amber-900/5">
                            <button
                                onClick={() => {
                                    setPage(p => Math.max(1, p - 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={page === 1}
                                className="px-6 py-2.5 rounded-full text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <div className="text-xs font-bold text-slate-400 px-2 font-mono">
                                {page} / {totalPages}
                            </div>
                            <button
                                onClick={() => {
                                    setPage(p => Math.min(totalPages, p + 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={page === totalPages}
                                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[0.6rem] font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 transition-all border border-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
