'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, X, Filter, MapPin, Users, Heart
} from 'lucide-react';

import { UserCard } from '@/app/components/discover/UserCard';

interface Profile {
    id: string;
    userId: string;
    gender: string;
    age: number;
    religion: string;
    location: string;
    photoUrl: string;
    jobCategory: string;
    jobStatus: string;
    maritalStatus: string;
    education: string;
    profession: string;
}

export default function DiscoverPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [filters, setFilters] = useState({
        religion: '',
        gender: '',
        ageMin: '',
        ageMax: '',
        location: '',
        jobStatus: '',
        maritalStatus: ''
    });

    const RELIGIONS = ['Hindu', 'Muslim', 'Sikh', 'Christian', 'Jain', 'Parsi', 'Buddhist', 'Jewish'];
    const GENDERS = ['Male', 'Female'];

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });
            queryParams.append('page', page.toString());
            queryParams.append('limit', '12');

            const response = await fetch(`/api/profiles?${queryParams.toString()}`);
            if (response.status === 401) {
                router.push('/auth/login');
                return;
            }
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
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchProfiles();
        }
    }, [status, fetchProfiles, router]);

    return (
        <div className="bg-slate-50 min-h-screen pb-32 pt-24">
            <main className="max-w-7xl mx-auto px-6 space-y-8">
                {/* Search Header */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-serif text-slate-900 leading-tight">
                        Find your <span className="italic text-rose-600">Perfect Match</span>
                    </h1>
                    <p className="text-slate-500 max-w-lg">Advanced filters to help you find precisely what you're looking for.</p>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-1 block">Religion</label>
                            <select
                                value={filters.religion}
                                onChange={e => setFilters({ ...filters, religion: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-rose-500 transition-all appearance-none"
                            >
                                <option value="">Any Religion</option>
                                {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-1 block">Gender</label>
                            <select
                                value={filters.gender}
                                onChange={e => setFilters({ ...filters, gender: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-rose-500 transition-all appearance-none"
                            >
                                <option value="">Any Gender</option>
                                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-1 block">Age Range</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.ageMin}
                                    onChange={e => setFilters({ ...filters, ageMin: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-rose-500"
                                />
                                <span className="text-slate-300">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.ageMax}
                                    onChange={e => setFilters({ ...filters, ageMax: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-rose-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center justify-center gap-2 w-full bg-rose-50 text-rose-600 rounded-2xl py-3 px-4 text-sm font-semibold hover:bg-rose-100 transition-all"
                            >
                                <Filter size={16} />
                                {showAdvanced ? 'Simple' : 'Advanced'}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100"
                            >
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-1 block">Location</label>
                                    <input
                                        type="text"
                                        placeholder="City or State"
                                        value={filters.location}
                                        onChange={e => setFilters({ ...filters, location: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-1 block">Marital Status</label>
                                    <select
                                        value={filters.maritalStatus}
                                        onChange={e => setFilters({ ...filters, maritalStatus: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-rose-500 transition-all appearance-none"
                                    >
                                        <option value="">Any</option>
                                        <option value="SINGLE">Single</option>
                                        <option value="DIVORCED">Divorced</option>
                                        <option value="WIDOWED">Widowed</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => setFilters({ religion: '', gender: '', ageMin: '', ageMax: '', location: '', jobStatus: '', maritalStatus: '' })}
                                        className="w-full bg-slate-100 text-slate-500 rounded-2xl py-3 px-4 text-sm font-semibold hover:bg-slate-200 transition-all"
                                    >
                                        Reset All
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Results Grid */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="h-[400px] bg-white rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : profiles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {profiles.map((profile, idx) => (
                                <UserCard key={profile.id} profile={profile as any} index={idx} isFavorite={false} onToggleFavorite={() => { }} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 space-y-4">
                            <Search size={48} className="mx-auto text-slate-200" />
                            <h3 className="text-2xl font-serif text-slate-400">No matches found</h3>
                            <p className="text-slate-300">Try broadening your search criteria.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 pt-8">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-6 py-2 bg-white rounded-full text-sm font-semibold shadow-md disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="flex items-center text-slate-400 font-mono text-sm px-4">{page} / {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-6 py-2 bg-rose-600 text-white rounded-full text-sm font-semibold shadow-md shadow-rose-200 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
