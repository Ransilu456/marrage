'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BadgeCheck, MessageCircle, MapPin, HeartHandshake, Eye, Sparkles, ArrowRight } from 'lucide-react';
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

    // Mock data for new features (can be replaced with real data if available)
    const isOnline = Math.random() > 0.5;
    const compatibilityScore = Math.floor(Math.random() * 20) + 80; // 80-100%

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
                <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-lg shadow-slate-900/5 hover:shadow-2xl hover:shadow-orange-900/10 transition-all duration-500 border border-slate-100 hover:border-amber-200/50">

                    {/* Image Container */}
                    <div className="relative aspect-[4/5] overflow-hidden">
                        <img
                            src={profile.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter group-hover:contrast-105"
                            alt={profile.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                        {/* Top Badges */}
                        {isOnline && (
                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-[pulse-soft_2s_infinite]"></div>
                                <span className="text-[0.6rem] text-white font-bold uppercase tracking-wider">Online</span>
                            </div>
                        )}

                        <div className="absolute top-4 right-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-[0.65rem] font-black shadow-lg shadow-orange-500/20 border border-amber-300/30 flex items-center gap-1">
                            <Sparkles size={10} />
                            {compatibilityScore}% Match
                        </div>

                        {/* Bottom Badge - Marital Status */}
                        <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md border border-white/50 rounded-full text-[0.6rem] font-black uppercase tracking-[0.15em] text-slate-800 shadow-sm">
                                {profile.maritalStatus ? profile.maritalStatus.toLowerCase() : 'Single'}
                            </span>
                        </div>

                        {/* Favorite Button (Overlay) - Added to keep functionality */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onToggleFavorite(profile.userId);
                            }}
                            className="absolute bottom-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-rose-600 transition-all active:scale-95"
                        >
                            <Heart size={16} className={isFavorite ? "fill-rose-500 text-rose-500" : ""} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-serif text-slate-900 tracking-tight font-medium">
                                    {profile.name}, {profile.age}
                                </h3>
                                <BadgeCheck size={16} className="text-amber-500 fill-amber-100" />
                            </div>
                            <div className="flex items-center gap-2 text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.15em]">
                                <MapPin size={10} className="text-orange-500" />
                                <span>{profile.location || 'Sri Lanka'}</span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-light italic opacity-90">
                            "{profile.bio || 'Passionate about traditional values and modern dreams.'}"
                        </p>

                        <div className="flex items-center gap-2 flex-wrap min-h-[1.5rem]">
                            {profile.jobCategory && (
                                <span className="px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-lg text-[0.6rem] font-black uppercase tracking-widest text-orange-800/80">
                                    {profile.jobCategory}
                                </span>
                            )}
                            {profile.jobStatus && (
                                <span className="px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[0.6rem] font-black uppercase tracking-widest text-blue-800/80">
                                    {profile.jobStatus?.replace('_', ' ')}
                                </span>
                            )}
                        </div>

                        {/* Buttons Grid */}
                        <div className="grid grid-cols-4 gap-2 pt-2">
                            <Link
                                href={`/profile/${profile.userId}`}
                                className="col-span-1 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-colors py-3"
                            >
                                <Eye size={16} />
                            </Link>
                            <Link
                                href={`/chat/${profile.userId}`}
                                className="col-span-1 flex items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors py-3"
                            >
                                <MessageCircle size={16} />
                            </Link>
                            <button
                                onClick={() => setIsProposalModalOpen(true)}
                                className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[0.65rem] font-black uppercase tracking-wider hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] transition-all border border-amber-400/50 py-3"
                            >
                                <HeartHandshake size={14} />
                                Propose
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Premium Proposal Modal */}
            <AnimatePresence>
                {isProposalModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSending && setIsProposalModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative bg-white w-full max-w-md rounded-[3rem] p-8 md:p-10 shadow-2xl space-y-8 overflow-hidden"
                        >
                            {/* Modal Decor */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full blur-[60px] -mr-16 -mt-16 opacity-60"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-blue-50 rounded-full blur-[50px] -ml-12 -mb-12 opacity-50"></div>

                            <div className="relative text-center space-y-2">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-amber-100">
                                    <HeartHandshake className="text-orange-600" size={24} />
                                </div>
                                <h3 className="text-3xl font-serif text-slate-900">Sacred <span className="italic bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Proposal</span></h3>
                                <p className="text-sm text-slate-400 font-light max-w-[280px] mx-auto">Share your heart&apos;s intention with {profile.name}</p>
                            </div>

                            <div className="relative space-y-4">
                                <div className="space-y-2">
                                    <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 ml-4">Intention Message</p>
                                    <textarea
                                        value={proposalMessage}
                                        onChange={(e) => setProposalMessage(e.target.value)}
                                        className="w-full h-32 bg-slate-50 border border-slate-200 focus:border-amber-300 rounded-[2rem] p-6 text-sm font-light text-slate-900 outline-none focus:ring-4 focus:ring-amber-500/5 transition-all resize-none placeholder:text-slate-300"
                                        placeholder="Write something that reflects your soul..."
                                        disabled={isSending || status === 'SUCCESS'}
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleSendProposal}
                                        disabled={!proposalMessage.trim() || isSending || status === 'SUCCESS'}
                                        className={`w-full py-4 rounded-[1.5rem] text-[0.7rem] font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group ${status === 'SUCCESS' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/30' :
                                            status === 'ERROR' ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30' :
                                                'bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-600/20 hover:from-amber-600 hover:to-orange-600 hover:shadow-amber-500/30'
                                            }`}
                                    >
                                        {isSending ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : status === 'SUCCESS' ? (
                                            <span>Transmitted</span>
                                        ) : (
                                            <>
                                                <span>Ignite Heart</span>
                                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsProposalModalOpen(false)}
                                        disabled={isSending}
                                        className="py-2 text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-orange-600 transition-all"
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
