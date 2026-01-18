
'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Search, Check, X, Clock, Send, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Proposal {
    id: string;
    proposerId: string;
    recipientId: string;
    answer: 'YES' | 'NO' | 'PENDING';
    message?: string;
    createdAt: string;
    senderName?: string;
    senderPhoto?: string;
    recipientName?: string;
    recipientPhoto?: string;
}

export default function ProposalsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [received, setReceived] = useState<Proposal[]>([]);
    const [sent, setSent] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchProposals();
        }
    }, [status]);

    const fetchProposals = async () => {
        try {
            const res = await fetch('/api/proposals');
            if (res.ok) {
                const data = await res.json();
                setReceived(data.received || []);
                setSent(data.sent || []);
            }
        } catch (error) {
            console.error('Error fetching proposals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, answer: 'YES' | 'NO') => {
        try {
            const res = await fetch(`/api/proposals/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer })
            });

            if (res.ok) {
                // Refresh list
                fetchProposals();
            }
        } catch (error) {
            console.error('Action error:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    const currentProposals = activeTab === 'received' ? received : sent;

    return (
        <div className="bg-slate-50 min-h-screen pb-32 pt-32">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-50 rounded-full blur-[120px] opacity-60" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-60" />
            </div>

            <main className="relative max-w-5xl mx-auto px-6 space-y-12">
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-4 text-rose-600 font-black text-[11px] uppercase tracking-[0.4em]"
                    >
                        <span className="w-10 h-[2px] bg-rose-200" />
                        Heart Manifestation
                        <span className="w-10 h-[2px] bg-rose-200" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-7xl font-serif text-slate-900 leading-tight"
                    >
                        Your <span className="italic text-rose-500">Proposals</span>
                    </motion.h1>
                </div>

                {/* Tabs */}
                <div className="flex justify-center">
                    <div className="bg-white/70 backdrop-blur-xl border border-white p-1.5 rounded-[2rem] shadow-xl shadow-slate-900/5 flex gap-2">
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`px-10 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'received'
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-900'
                                }`}
                        >
                            Received ({received.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={`px-10 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'sent'
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-900'
                                }`}
                        >
                            Sent ({sent.length})
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence mode="popLayout">
                        {currentProposals.length > 0 ? (
                            currentProposals.map((prop, idx) => (
                                <motion.div
                                    key={prop.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row items-center gap-10">
                                        {/* Avatar */}
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-slate-50 shadow-inner">
                                                <img
                                                    src={activeTab === 'received' ? prop.senderPhoto : prop.recipientPhoto}
                                                    alt="User"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-50">
                                                {prop.answer === 'PENDING' ? <Clock size={16} className="text-amber-500" /> :
                                                    prop.answer === 'YES' ? <Check size={16} className="text-emerald-500" /> :
                                                        <X size={16} className="text-rose-500" />}
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 text-center md:text-left space-y-4">
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-serif text-slate-900">
                                                    {activeTab === 'received' ? prop.senderName : prop.recipientName}
                                                </h3>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                    {new Date(prop.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                            {prop.message && (
                                                <div className="relative py-4 px-6 bg-slate-50 rounded-[1.5rem] border border-slate-100/50">
                                                    <p className="text-sm text-slate-500 italic font-light leading-relaxed">
                                                        "{prop.message}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-3 min-w-[200px]">
                                            {activeTab === 'received' && prop.answer === 'PENDING' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(prop.id, 'YES')}
                                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/10"
                                                    >
                                                        Accept Heart
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(prop.id, 'NO')}
                                                        className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-rose-600 hover:border-rose-100 transition-all"
                                                    >
                                                        Decline Resonance
                                                    </button>
                                                </>
                                            ) : (
                                                <div className={`px-8 py-4 rounded-2xl text-center border ${prop.answer === 'YES' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                                    prop.answer === 'NO' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                                        'bg-slate-50 border-slate-100 text-slate-400'
                                                    }`}>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                                                        {prop.answer === 'PENDING' ? 'Awaiting Resonance' :
                                                            prop.answer === 'YES' ? 'Synchronized' : 'Faded'}
                                                    </p>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => router.push(`/chat/${activeTab === 'received' ? prop.proposerId : prop.recipientId}`)}
                                                className="flex items-center justify-center gap-2 py-3 text-slate-400 hover:text-slate-900 transition-all group"
                                            >
                                                <MessageCircle size={16} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Open Session</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-40 space-y-6"
                            >
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                    <Heart size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-serif text-slate-400">No resonance yet</h3>
                                    <p className="text-sm text-slate-300">The hearts are still finding their way...</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
