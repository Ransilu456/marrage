'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MapPin, Heart, ChevronLeft,
    ChevronRight, BadgeCheck, LayoutGrid,
    List, Briefcase, Filter, X, ChevronDown
} from 'lucide-react';
import Link from 'next/link';

interface Profile {
    id: string;
    userId: string;
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
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        jobStatus: '',
        maritalStatus: '',
    });

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
        }
    }, [filters, status]);

    return (
        <div className="bg-slate-50 min-h-screen pt-12">
            <main className="max-w-7xl mx-auto px-6 pb-20">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h2 className="text-4xl font-serif text-slate-900 tracking-tight">Discover Matches</h2>
                        <p className="text-slate-500 text-sm mt-3">Curated recommendations based on your unique essence</p>
                    </div>

                    <div className="flex bg-white border border-slate-200 rounded-lg p-1 gap-1 shadow-sm">
                        <button className="p-2 rounded-md bg-slate-100 text-slate-900 shadow-sm">
                            <LayoutGrid size={16} strokeWidth={1.5} />
                        </button>
                        <button className="p-2 rounded-md hover:bg-slate-50 text-slate-400 hover:text-slate-600">
                            <List size={16} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-4 gap-12">
                    {/* Sidebar Filters */}
                    <aside className="lg:col-span-1 space-y-10">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Employment</h3>
                            <div className="relative">
                                <select
                                    value={filters.jobStatus}
                                    onChange={(e) => setFilters({ ...filters, jobStatus: e.target.value })}
                                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-xl p-3 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/10"
                                >
                                    <option value="">Any Status</option>
                                    <option value="EMPLOYED">Employed</option>
                                    <option value="SELF_EMPLOYED">Self Employed</option>
                                    <option value="STUDENT">Student</option>
                                    <option value="RETIRED">Retired</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Marital Identity</h3>
                            <div className="relative">
                                <select
                                    value={filters.maritalStatus}
                                    onChange={(e) => setFilters({ ...filters, maritalStatus: e.target.value })}
                                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-xl p-3 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/10"
                                >
                                    <option value="">Any History</option>
                                    <option value="SINGLE">Never Married</option>
                                    <option value="DIVORCED">Divorced</option>
                                    <option value="WIDOWED">Widowed</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>

                        <button
                            onClick={() => setFilters({ jobStatus: '', maritalStatus: '' })}
                            className="w-full py-2.5 bg-slate-100 hover:bg-white border border-slate-100 hover:border-rose-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 transition-all rounded-xl"
                        >
                            Reset Essence
                        </button>
                    </aside>

                    {/* Profiles Grid */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
                            </div>
                        ) : profiles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                <AnimatePresence>
                                    {profiles.map((profile, index) => (
                                        <motion.div
                                            key={profile.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-rose-900/10 transition-all duration-500 overflow-hidden flex flex-col"
                                        >
                                            <div className="relative aspect-[4/5] overflow-hidden">
                                                <img
                                                    src={profile.photoUrl || "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80"}
                                                    alt={profile.bio}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80" />

                                                <div className="absolute top-4 right-4">
                                                    <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-rose-500 hover:text-white text-white transition-all border border-white/30">
                                                        <Heart size={18} strokeWidth={1.5} />
                                                    </button>
                                                </div>

                                                <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <h3 className="font-serif text-2xl tracking-tight">{profile.gender === 'FEMALE' ? 'Sophia' : 'Liam'}, {profile.age}</h3>
                                                        <BadgeCheck className="text-rose-400" size={18} />
                                                    </div>
                                                    <p className="text-[10px] text-white/70 uppercase tracking-[0.3em] font-black mt-2 flex items-center justify-center gap-1">
                                                        <MapPin size={10} /> {profile.location}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="p-6 flex flex-col gap-4 text-center">
                                                <div className="flex justify-center flex-wrap gap-2">
                                                    <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                                        {profile.jobCategory}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 line-clamp-2 italic leading-relaxed">
                                                    "{profile.bio}"
                                                </p>
                                                <Link
                                                    href={`/chat/${profile.userId}`}
                                                    className="mt-2 w-full py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-900/5"
                                                >
                                                    Connect Heart
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <p className="text-slate-400 font-serif text-lg">No souls found matching this essence...</p>
                            </div>
                        )}

                        {profiles.length > 0 && (
                            <div className="mt-16 flex items-center justify-center gap-3">
                                <button className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 text-slate-400 hover:border-rose-200 hover:text-rose-600 transition-all bg-white">
                                    <ChevronLeft size={20} />
                                </button>
                                <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-600 text-white shadow-lg shadow-rose-500/20 text-sm font-black tracking-widest">1</button>
                                <button className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 text-slate-400 hover:border-rose-200 hover:text-rose-600 transition-all bg-white text-sm font-black tracking-widest">2</button>
                                <button className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 text-slate-400 hover:border-rose-200 hover:text-rose-600 transition-all bg-white">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
