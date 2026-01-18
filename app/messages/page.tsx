'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Heart, ChevronRight, Filter, Users, ShieldCheck, Sun, Clock } from 'lucide-react';
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
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        // Mocking conversations for now since the real backend might not have them yet
        const mockConversations: Conversation[] = [
            {
                id: '1',
                participant: {
                    id: 'usr_1',
                    name: 'Sarah Anderson',
                    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150',
                    location: 'New York, USA'
                },
                lastMessage: {
                    text: 'I really enjoyed your story about the trip! would love to hear more.',
                    createdAt: new Date().toISOString(),
                    isRead: false
                }
            },
            {
                id: '2',
                participant: {
                    id: 'usr_2',
                    name: 'Michael Chen',
                    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150',
                    location: 'San Francisco, USA'
                },
                lastMessage: {
                    text: 'That sounds like a wonderful plan for our soul connection meeting.',
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                    isRead: true
                }
            }
        ];

        setTimeout(() => {
            setConversations(mockConversations);
            setLoading(false);
        }, 800);
    }, []);

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
                                <MessageSquare size={20} className="fill-rose-500 text-rose-500" />
                            </div>
                            <h1 className="text-2xl font-serif text-slate-900 tracking-tight">Vibrations</h1>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-5xl font-serif text-slate-900 tracking-tighter">Messages & Soul <span className="text-rose-600">Sync</span></h2>
                            <p className="text-slate-500 text-lg font-light tracking-tight">Continue your journey with the souls you have connected with.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar / Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-8">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Seek a conversation..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-rose-500 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Connection Insights</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
                                                <Heart size={16} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">Active Soulties</span>
                                        </div>
                                        <span className="text-lg font-serif text-rose-600">12</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600">
                                                <Clock size={16} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">Awaiting Response</span>
                                        </div>
                                        <span className="text-lg font-serif text-slate-900">3</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-4 shadow-2xl shadow-slate-900/20">
                            <ShieldCheck className="text-rose-400" size={32} />
                            <h3 className="text-xl font-serif">Trust & Safety</h3>
                            <p className="text-white/60 text-sm leading-relaxed font-light">
                                Your conversations are protected with soul-to-soul encryption. We ensure a safe space for every expression.
                            </p>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                                Safety Guidelines
                            </button>
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="lg:col-span-8">
                        {filteredConversations.length === 0 ? (
                            <div className="bg-white rounded-[3rem] border border-dashed border-slate-200 py-32 text-center space-y-6">
                                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-300">
                                    <MessageSquare size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-serif text-slate-900">Quiet for Now</h3>
                                    <p className="text-slate-400 font-light italic">No conversations have harmonized matching your search.</p>
                                </div>
                                <Link
                                    href="/discover"
                                    className="inline-flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-widest hover:text-rose-700"
                                >
                                    Explore Discover Matches <ChevronRight size={14} />
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {filteredConversations.map((conv, idx) => (
                                        <motion.div
                                            key={conv.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <Link
                                                href={`/chat/${conv.participant.id}`}
                                                className="block group bg-white hover:bg-rose-50/10 border border-slate-100 hover:border-rose-100 rounded-[2.5rem] p-6 transition-all shadow-sm hover:shadow-xl hover:shadow-rose-500/5"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="relative">
                                                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm bg-slate-100 group-hover:scale-105 transition-transform duration-500">
                                                            <img
                                                                src={conv.participant.photoUrl}
                                                                className="w-full h-full object-cover"
                                                                alt={conv.participant.name}
                                                            />
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
                                                    </div>

                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-xl font-serif text-slate-900 group-hover:text-rose-600 transition-colors">
                                                                    {conv.participant.name}
                                                                </h3>
                                                                <ShieldCheck size={14} className="text-blue-400" />
                                                            </div>
                                                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                                                {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-500 text-sm italic line-clamp-1 pr-12 pb-2">
                                                            "{conv.lastMessage.text}"
                                                        </p>
                                                        <div className="flex items-center gap-4 pt-1">
                                                            {!conv.lastMessage.isRead && (
                                                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                                            )}
                                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest flex items-center gap-1.5">
                                                                <Sun size={12} className="text-orange-400" /> {conv.participant.location}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-rose-600 text-slate-300 group-hover:text-white transition-all">
                                                        <ChevronRight size={20} />
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
