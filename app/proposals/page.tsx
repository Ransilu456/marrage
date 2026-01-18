'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2, ArrowUpRight, X, Inbox, ChevronRight, Check } from 'lucide-react';

type ProposalAnswer = 'YES' | 'NO' | 'PENDING';

interface ProposalData {
    id: string;
    answer: ProposalAnswer;
    message?: string;
    createdAt: string;
    updatedAt?: string;
    proposer?: {
        name: string;
        photoUrl: string;
    };
}

export default function ProposalPage() {
    const [proposals, setProposals] = useState<ProposalData[]>([]);
    const [selectedProposal, setSelectedProposal] = useState<ProposalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answer, setAnswer] = useState<'YES' | 'NO' | null>(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        try {
            const response = await fetch('/api/proposals');
            if (response.ok) {
                const data = await response.json();
                setProposals(data.proposals || []);
            }
        } catch (err) {
            console.error('Error fetching proposals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProposal || !answer) return;

        setSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/proposal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId: selectedProposal.id,
                    answer,
                    message: message.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit answer');
            }

            // Update local state
            setProposals(prev => prev.map(p => p.id === selectedProposal.id ? { ...p, answer, message } : p));
            setSelectedProposal(null);
            setAnswer(null);
            setMessage('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
                <Loader2 className="w-8 h-8 text-rose-200 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfdfd] py-20 px-6 sm:px-12">
            <div className="max-w-6xl mx-auto space-y-16">

                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-6xl sm:text-8xl font-serif text-slate-900 tracking-tight leading-none">
                        Received <br /><span className="text-rose-600">Expressions</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">Inquiries of the Soul</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Proposals List */}
                    <div className="lg:col-span-12">
                        {proposals.length === 0 ? (
                            <div className="py-32 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                                <Inbox className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                                <p className="text-slate-400 font-serif italic text-2xl">The silence is peaceful...</p>
                                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-4">No active proposals waiting for your expression.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {proposals.map((p) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => p.answer === 'PENDING' && setSelectedProposal(p)}
                                        className={`group relative p-8 rounded-[2.5rem] border transition-all cursor-pointer ${p.answer === 'PENDING'
                                                ? 'bg-white hover:bg-rose-50/20 border-slate-100 hover:border-rose-100 shadow-sm hover:shadow-xl hover:shadow-rose-500/5'
                                                : 'bg-slate-50/50 border-slate-100 opacity-60'
                                            }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm bg-slate-100">
                                                    <img
                                                        src={p.proposer?.photoUrl || "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200"}
                                                        className="w-full h-full object-cover"
                                                        alt="Proposer"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-serif text-slate-900 leading-tight">Identity Expression</h3>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${p.answer === 'PENDING' ? 'bg-orange-50 text-orange-600' :
                                                                p.answer === 'YES' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            {p.answer}
                                                        </span>
                                                        <span className="text-slate-300">/</span>
                                                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                            Received {new Date(p.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {p.answer === 'PENDING' && (
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Engage Soul</span>
                                                    <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-200 transition-transform group-hover:scale-110">
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Selection Modal (Answering) */}
            <AnimatePresence>
                {selectedProposal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProposal(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
                        >
                            <div className="p-12 space-y-10">
                                <div className="text-center space-y-4">
                                    <div className="text-rose-600 inline-block p-4 bg-rose-50 rounded-full mb-4">
                                        <Heart size={32} />
                                    </div>
                                    <h2 className="text-4xl font-serif text-slate-900">Soul Connection Request</h2>
                                    <p className="text-slate-500 italic max-w-sm mx-auto">
                                        "{selectedProposal.message || "I am drawn toward your presence and would love to explore a connection."}"
                                    </p>
                                </div>

                                <form onSubmit={handleSubmitAnswer} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <button
                                            type="button"
                                            onClick={() => setAnswer('YES')}
                                            className={`p-10 rounded-3xl text-3xl font-serif transition-all border-2 ${answer === 'YES'
                                                    ? 'bg-rose-600 border-rose-600 text-white shadow-xl shadow-rose-200'
                                                    : 'bg-white border-slate-100 text-slate-300 hover:border-rose-200 hover:text-rose-400'
                                                }`}
                                        >
                                            YES.
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAnswer('NO')}
                                            className={`p-10 rounded-3xl text-3xl font-serif transition-all border-2 ${answer === 'NO'
                                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                                                    : 'bg-white border-slate-100 text-slate-300 hover:border-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            NO.
                                        </button>
                                    </div>

                                    {answer && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-3"
                                        >
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Final Expression (Optional)</label>
                                            <textarea
                                                rows={4}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Tell them your reason..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 outline-none focus:border-rose-500 resize-none font-medium italic"
                                            />
                                        </motion.div>
                                    )}

                                    {error && (
                                        <p className="text-center text-xs font-bold text-rose-500 uppercase tracking-widest">{error}</p>
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedProposal(null)}
                                            className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors"
                                        >
                                            Reconsider Later
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!answer || submitting}
                                            className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-rose-500/20 disabled:opacity-30 flex items-center justify-center gap-3"
                                        >
                                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                            Finalize Expression
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
