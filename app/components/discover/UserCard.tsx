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
    religion?: string;
    height?: number;
    location: string;
    photoUrl: string;
    jobCategory?: string;
    jobStatus?: string;
    maritalStatus?: string;
    bio?: string;
    isVerified?: boolean;
}

interface UserCardProps {
    profile: Profile;
    index: number;
    isFavorite: boolean;
    onToggleFavorite: (userId: string) => void;
}

export function UserCard({ profile, index, isFavorite, onToggleFavorite }: UserCardProps) {
    const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
    const [interestMessage, setInterestMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [statusMessage, setStatusMessage] = useState("");

    const compatibilityScore = Math.floor(Math.random() * 20) + 80;

    const handleSendInterest = async () => {
        setIsSending(true);
        setStatus('IDLE');
        try {
            const res = await fetch('/api/interests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: profile.userId,
                    message: interestMessage
                })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('SUCCESS');
                setTimeout(() => {
                    setIsInterestModalOpen(false);
                    setInterestMessage("");
                    setStatus('IDLE');
                }, 2000);
            } else {
                setStatus('ERROR');
                setStatusMessage(data.error || "Failed to send interest");
            }
        } catch (error) {
            setStatus('ERROR');
            setStatusMessage("Internal server error");
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
                transition={{ duration: 0.8, delay: index * 0.05, ease: [0.19, 1, 0.22, 1] }}
                className="group relative"
            >
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-rose-200 transition-all duration-500">
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                            src={profile.photoUrl || "/placeholder-avatar.png"}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt={profile.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />

                        {/* Status Badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                                <MapPin size={10} className="text-rose-500" />
                                {profile.location}
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 bg-rose-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1">
                            <Sparkles size={10} />
                            {compatibilityScore}%
                        </div>

                        {/* Favorite Button */}
                        <button
                            onClick={(e) => { e.preventDefault(); onToggleFavorite(profile.userId); }}
                            className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-rose-600 transition-all"
                            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            <Heart size={18} className={isFavorite ? "fill-rose-500 text-rose-500" : ""} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-serif text-slate-900 font-bold">
                                    {profile.name}, {profile.age}
                                </h3>
                                {profile.isVerified && (
                                    <BadgeCheck size={20} className="text-blue-500 fill-blue-50" />
                                )}
                            </div>
                            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em]">
                                {profile.religion} • {profile.height} cm • {profile.maritalStatus?.toLowerCase()}
                            </p>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic">
                            "{profile.bio || "Searching for a meaningful connection based on values and trust."}"
                        </p>

                        <div className="flex gap-2">
                            {profile.jobCategory && (
                                <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                                    {profile.jobCategory}
                                </span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Link
                                href={`/profile/${profile.userId}`}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 text-slate-600 text-xs font-bold py-3 hover:bg-slate-100 transition-all border border-slate-200"
                            >
                                <Eye size={16} />
                                View
                            </Link>
                            <button
                                onClick={() => setIsInterestModalOpen(true)}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 text-white text-xs font-bold py-3 hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                            >
                                <HeartHandshake size={16} />
                                Interest
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Interest Modal */}
            <AnimatePresence>
                {isInterestModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSending && setIsInterestModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HeartHandshake className="text-rose-600" size={32} />
                                </div>
                                <h3 className="text-2xl font-serif text-slate-900 font-bold">Express Interest</h3>
                                <p className="text-sm text-slate-400">Send a request to start a conversation with {profile.name}.</p>
                            </div>

                            <div className="space-y-4">
                                <textarea
                                    value={interestMessage}
                                    onChange={(e) => setInterestMessage(e.target.value)}
                                    className="w-full h-32 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-rose-500 rounded-3xl p-5 text-sm outline-none transition-all resize-none"
                                    placeholder="Introduce yourself or say why you're interested..."
                                    disabled={isSending || status === 'SUCCESS'}
                                />

                                {status === 'ERROR' && (
                                    <p className="text-xs text-red-500 text-center font-bold uppercase tracking-wider">{statusMessage}</p>
                                )}

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleSendInterest}
                                        disabled={isSending || status === 'SUCCESS'}
                                        className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-600 hover:bg-rose-700'
                                            }`}
                                    >
                                        {isSending ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : status === 'SUCCESS' ? (
                                            "Sent Successfully"
                                        ) : (
                                            <>
                                                <span>Send Interest</span>
                                                <ArrowRight size={14} />
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsInterestModalOpen(false)}
                                        disabled={isSending}
                                        className="py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                                    >
                                        Cancel
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
