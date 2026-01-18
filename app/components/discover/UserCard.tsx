'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BadgeCheck, MessageCircle, MapPin, HeartHandshake, X, Send } from 'lucide-react';
import Link from 'next/link';

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

interface UserCardProps {
    profile: Profile;
    index: number;
    isFavorite: boolean;
    onToggleFavorite: (userId: string) => void;
}

export function UserCard({ profile, index, isFavorite, onToggleFavorite }: UserCardProps) {
    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
    const [proposalMessage, setProposalMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

    const handleSendProposal = async () => {
        setIsSending(true);
        setStatus('IDLE');
        try {
            const res = await fetch('/api/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: profile.userId,
                    message: proposalMessage
                })
            });

            if (res.ok) {
                setStatus('SUCCESS');
                setTimeout(() => {
                    setIsProposalModalOpen(false);
                    setProposalMessage("");
                    setStatus('IDLE');
                }, 2000);
            } else {
                setStatus('ERROR');
            }
        } catch (error) {
            setStatus('ERROR');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                    duration: 0.8,
                    delay: index * 0.05,
                    ease: [0.19, 1, 0.22, 1]
                }}
                className="group relative"
            >
                <div className="relative space-y-5">
                    {/* Image Container with Premium Effects */}
                    <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-sm transition-all duration-700 group-hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] group-hover:-translate-y-3">
                        <img
                            src={profile.photoUrl || "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80"}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            alt={profile.name}
                        />

                        {/* Glassmorphic Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />

                        {/* Quick Action Badge */}
                        <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-4 group-hover:translate-x-0">
                            <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white">
                                {profile.maritalStatus || 'Single'}
                            </span>
                        </div>

                        {/* Main Action Buttons */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                            <Link
                                href={`/chat/${profile.userId}`}
                                className="group/btn relative px-8 py-4 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:bg-slate-900 hover:text-white transform hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <MessageCircle size={14} className="transition-transform group-hover/btn:-rotate-12" />
                                Connect Aura
                            </Link>

                            <button
                                onClick={() => setIsProposalModalOpen(true)}
                                className="group/prop relative px-8 py-4 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:bg-rose-700 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <HeartHandshake size={14} className="transition-transform group-hover/prop:scale-110" />
                                Send Proposal
                            </button>
                        </div>

                        {/* Favorite Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onToggleFavorite(profile.userId);
                            }}
                            className={`absolute top-6 right-6 w-11 h-11 rounded-full backdrop-blur-xl border transition-all duration-500 flex items-center justify-center group/heart ${isFavorite
                                ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-500/30'
                                : 'bg-white/10 border-white/20 text-white opacity-0 group-hover:opacity-100 hover:bg-white/20'
                                }`}
                        >
                            <Heart
                                size={20}
                                className={`transition-all duration-300 ${isFavorite ? 'fill-current scale-110' : 'group-hover/heart:scale-125'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="px-3 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-2xl font-serif text-slate-900 tracking-tight">{profile.name}</h3>
                                    <BadgeCheck size={18} className="text-blue-500/80 mt-0.5" />
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                                    <MapPin size={10} className="text-rose-400" />
                                    <span>{profile.age} • {profile.location}</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-light italic opacity-80 group-hover:opacity-100 transition-opacity">
                            "{profile.bio || 'Seeking a meaningful connection that resonates with the soul.'}"
                        </p>

                        <div className="flex items-center gap-3 pt-1">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 transition-colors group-hover:bg-rose-50 group-hover:border-rose-100 group-hover:text-rose-600">
                                    {profile.jobCategory || 'Professional'}
                                </span>
                                <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">
                                    {profile.jobStatus?.replace('_', ' ') || 'Full Time'}
                                </span>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-slate-100 to-transparent" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Premium Proposal Modal */}
            <AnimatePresence>
                {isProposalModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSending && setIsProposalModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 relative shadow-2xl space-y-10 overflow-hidden"
                        >
                            {/* Decorative background for modal */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-50 rounded-full blur-[80px] -mr-20 -mt-20 opacity-50" />

                            <div className="relative text-center space-y-3">
                                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <HeartHandshake className="text-rose-500" size={32} />
                                </div>
                                <h3 className="text-4xl font-serif text-slate-900">Soul <span className="italic text-rose-500">Proposal</span></h3>
                                <p className="text-sm text-slate-400 font-light max-w-[280px] mx-auto">Share your heart's resonance with {profile.name}</p>
                            </div>

                            <div className="relative space-y-6">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-6">Intention Message</p>
                                    <textarea
                                        value={proposalMessage}
                                        onChange={(e) => setProposalMessage(e.target.value)}
                                        placeholder="Write something that reflects your soul..."
                                        disabled={isSending || status === 'SUCCESS'}
                                        className="w-full h-44 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 text-sm font-light text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-200 transition-all resize-none shadow-inner"
                                    />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={handleSendProposal}
                                        disabled={!proposalMessage.trim() || isSending || status === 'SUCCESS'}
                                        className={`w-full py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${status === 'SUCCESS' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                                                status === 'ERROR' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                                                    'bg-slate-900 text-white shadow-slate-900/20 hover:bg-rose-600 hover:shadow-rose-500/20'
                                            } disabled:opacity-20 active:scale-95`}
                                    >
                                        {isSending ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : status === 'SUCCESS' ? (
                                            <>Transmitted</>
                                        ) : status === 'ERROR' ? (
                                            <>Retry Resonance</>
                                        ) : (
                                            <>Ignite Heart</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsProposalModalOpen(false)}
                                        disabled={isSending}
                                        className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all underline underline-offset-8 decoration-slate-100 hover:decoration-rose-200"
                                    >
                                        Maybe Later
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
