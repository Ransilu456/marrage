'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2, ArrowUpRight, X } from 'lucide-react';

type ProposalAnswer = 'YES' | 'NO' | 'PENDING';

interface ProposalData {
    id: string;
    answer: ProposalAnswer;
    message?: string;
    createdAt: string;
    updatedAt?: string;
}

export default function ProposalPage() {
    const [proposal, setProposal] = useState<ProposalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answer, setAnswer] = useState<'YES' | 'NO' | null>(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchProposalStatus();
    }, []);

    const fetchProposalStatus = async () => {
        try {
            const response = await fetch('/api/proposal');
            if (response.ok) {
                const data = await response.json();
                setProposal(data.proposal);
            }
        } catch (err) {
            console.error('Error fetching proposal:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer) return;

        setSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/proposal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-proposal-token': process.env.NEXT_PUBLIC_PROPOSAL_TOKEN || '',
                },
                body: JSON.stringify({
                    answer,
                    message: message.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit answer');
            }

            setProposal(data.proposal);
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
                <Loader2 className="w-8 h-8 text-gray-200 animate-spin" />
            </div>
        );
    }

    if (proposal && proposal.answer !== 'PENDING') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd] p-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl w-full text-center"
                >
                    <div className="mb-12">
                        {proposal.answer === 'YES' ? (
                            <>
                                <div className="text-[12rem] leading-none select-none mb-8 opacity-10">💍</div>
                                <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter uppercase mb-6">
                                    Affirmative.
                                </h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                                    Established {new Date(proposal.updatedAt || proposal.createdAt).toLocaleDateString()}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-[12rem] leading-none select-none mb-8 opacity-10 font-black">X</div>
                                <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase mb-6">
                                    Processed.
                                </h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                                    Response has been recorded.
                                </p>
                            </>
                        )}
                    </div>

                    {proposal.message && (
                        <div className="max-w-md mx-auto p-10 bg-gray-50 rounded-[2rem] border border-gray-100 italic font-medium text-gray-500 leading-relaxed">
                            "{proposal.message}"
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#fdfdfd] p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl w-full"
            >
                <div className="mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 mb-8"
                    >
                        Priority Inquiry
                    </motion.div>
                    <h1 className="text-6xl md:text-9xl font-black text-gray-900 tracking-tighter uppercase leading-[0.8] mb-12">
                        WILL YOU <br />
                        <span className="text-gray-100">JOIN LIFE?</span>
                    </h1>
                </div>

                <AnimatePresence mode="wait">
                    {!success ? (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit}
                            className="space-y-12"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <button
                                    type="button"
                                    onClick={() => setAnswer('YES')}
                                    className={`p-12 rounded-[2.5rem] text-4xl font-black uppercase tracking-tighter transition-all ${answer === 'YES'
                                            ? 'bg-rose-600 text-white shadow-2xl shadow-rose-200 scale-105'
                                            : 'bg-gray-50 text-gray-200 hover:text-gray-900'
                                        }`}
                                >
                                    YES.
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setAnswer('NO')}
                                    className={`p-12 rounded-[2.5rem] text-4xl font-black uppercase tracking-tighter transition-all ${answer === 'NO'
                                            ? 'bg-gray-900 text-white shadow-2xl shadow-gray-200 scale-105'
                                            : 'bg-gray-50 text-gray-200 hover:text-gray-900'
                                        }`}
                                >
                                    NO.
                                </button>
                            </div>

                            <AnimatePresence>
                                {answer && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                                            Final Expression
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="..."
                                            rows={4}
                                            className="w-full minimal-input rounded-[2rem] p-8 outline-none resize-none font-medium"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {error && (
                                <div className="text-center text-[10px] font-black uppercase tracking-widest text-rose-500">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!answer || submitting}
                                className="w-full py-6 bg-gray-900 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-black transition-all disabled:opacity-30 disabled:grayscale"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Selection'}
                            </button>
                        </form>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4">Recorded.</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">The collective has been updated.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
