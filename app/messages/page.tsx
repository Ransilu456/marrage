'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Heart, ChevronRight, Filter, Users, ShieldCheck, Sun, Clock, MapPin, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

interface Conversation {
    id: string;
    participant: {
        id: string;
        name: string;
        photoUrl: string;
        location: string;
    };
    lastMessage: {
        text: string;
        createdAt: string;
        isRead: boolean;
    };
}

export default function MessagesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [msgRes, matchRes] = await Promise.all([
                fetch('/api/messages'),
                fetch('/api/matches')
            ]);

            if (msgRes.ok) {
                const data = await msgRes.json();
                setConversations(data.conversations || []);
            }
            if (matchRes.ok) {
                const data = await matchRes.json();
                setMatches(data.matches || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const filteredConversations = conversations.filter(c =>
        c.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fcf8f7]">
                <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-[#fcf8f7] min-h-screen pt-28">
            <main className="max-w-6xl mx-auto px-6 pb-20 space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/10">
                                <MessageSquare size={20} className="text-rose-500 fill-rose-500" />
                            </div>
                            <h1 className="text-2xl font-serif text-slate-900 tracking-tight">Vibrations</h1>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-5xl font-serif text-slate-900 tracking-tighter">Messages & Soul <span className="text-rose-600">Sync</span></h2>
                            <p className="text-slate-500 text-lg font-light tracking-tight">Continue your journey with the souls you have harmonized with.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar / Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-8">
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Seek a conversation..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 pl-14 pr-6 text-sm outline-none focus:border-rose-500 focus:bg-white transition-all font-medium placeholder:text-slate-300"
                                />
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Connection Insights</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-5 bg-rose-50/50 rounded-2xl border border-rose-100/50 group hover:bg-rose-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm group-hover:scale-110 transition-transform">
                                                <Heart size={18} className="fill-rose-500/10" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">Active Soulties</span>
                                        </div>
                                        <span className="text-xl font-serif text-rose-600">{matches.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm group-hover:scale-110 transition-transform">
                                                <Clock size={18} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">Awaiting Response</span>
                                        </div>
                                        <span className="text-xl font-serif text-slate-900">3</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-5 shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                            <ShieldCheck className="text-rose-400 relative z-10" size={32} />
                            <h3 className="text-xl font-serif relative z-10">Trust & Safety</h3>
                            <p className="text-white/60 text-sm leading-relaxed font-light relative z-10">
                                Your conversations are protected with soul-to-soul encryption. We ensure a safe space for every expression.
                            </p>
                            <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10">
                                Safety Guidelines
                            </button>
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="lg:col-span-8">
                        {filteredConversations.length === 0 ? (
                            <div className="bg-white rounded-[3rem] border border-dashed border-slate-200 py-32 text-center space-y-6">
                                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-400 shadow-inner">
                                    <MessageSquare size={44} className="opacity-40" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-serif text-slate-900">Quiet for Now</h3>
                                    <p className="text-slate-400 font-light italic max-w-sm mx-auto">None of your connections have harmonized yet. Perhaps start a new vibration?</p>
                                </div>
                                <Link
                                    href="/discover"
                                    className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-lg shadow-slate-900/10"
                                >
                                    Seek New Souls <ChevronRight size={14} />
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {filteredConversations.map((conv, idx) => (
                                        <motion.div
                                            key={conv.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <Link
                                                href={`/chat/${conv.participant.id}`}
                                                className="block group bg-white hover:bg-rose-50/5 border border-slate-100 hover:border-rose-100 rounded-[2.5rem] p-6 transition-all shadow-sm hover:shadow-2xl hover:shadow-rose-900/5"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="relative flex-shrink-0">
                                                        <div className="w-24 h-24 rounded-[1.75rem] overflow-hidden shadow-inner bg-slate-100 group-hover:scale-105 transition-transform duration-700">
                                                            <img
                                                                src={conv.participant.photoUrl}
                                                                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                                                                alt={conv.participant.name}
                                                            />
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full ring-4 ring-emerald-500/5 group-hover:scale-110 transition-transform" />
                                                    </div>

                                                    <div className="flex-1 min-w-0 py-2">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-2xl font-serif text-slate-900 group-hover:text-rose-600 transition-colors tracking-tight">
                                                                    {conv.participant.name}
                                                                </h3>
                                                                <BadgeCheck size={18} className="text-blue-500" />
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-rose-400 transition-colors">
                                                                {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-1 pr-12 pb-3 font-light italic">
                                                            "{conv.lastMessage.text}"
                                                        </p>
                                                        <div className="flex items-center gap-6">
                                                            {!conv.lastMessage.isRead && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                                                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">New Vibration</span>
                                                                </div>
                                                            )}
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                                <MapPin size={12} className="text-rose-500/50" /> {conv.participant.location}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                                                        <ChevronRight size={24} strokeWidth={1.5} />
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
