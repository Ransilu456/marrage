'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Heart, Loader2, MapPin, BadgeCheck, Users, Sun,
    MessageCircle, HeartHandshake, ArrowLeft, Share2
} from 'lucide-react';
import Link from 'next/link';

interface ProfileData {
    id: string;
    userId: string;
    name: string;
    age: number;
    dateOfBirth: string;
    gender: string;
    bio: string;
    location: string;
    jobStatus: string;
    maritalStatus: string;
    photoUrl: string;
    coverUrl?: string;
    photoGallery?: string;
    jobCategory: string;
    contactDetails: string;
}

export default function UserProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const userId = params?.userId as string;

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
    const [proposalMessage, setProposalMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (userId && status === 'authenticated') {
            fetchProfile();
            checkFavoriteStatus();
        }
    }, [userId, status]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`/api/profiles/${userId}`);

            if (response.status === 404) {
                router.push('/discover');
                return;
            }

            const data = await response.json();
            if (data.success && data.profile) {
                setProfile(data.profile);
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    const checkFavoriteStatus = async () => {
        try {
            const response = await fetch('/api/favorites');
            if (response.ok) {
                const data = await response.json();
                setIsFavorite(data.favoriteIds?.includes(userId) || false);
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const toggleFavorite = async () => {
        try {
            const response = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favoritedId: userId }),
            });
            if (response.ok) {
                const data = await response.json();
                setIsFavorite(data.isFavorited);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleSendProposal = async () => {
        setIsSending(true);
        try {
            const res = await fetch('/api/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: userId,
                    message: proposalMessage
                })
            });

            if (res.ok) {
                setIsProposalModalOpen(false);
                setProposalMessage("");
                // Show success message
            }
        } catch (error) {
            console.error('Error sending proposal:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-serif text-slate-900">Profile not found</h2>
                    <Link href="/discover" className="text-orange-600 hover:underline">
                        Return to Discover
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-orange-50 via-blue-50 to-amber-50 min-h-screen">
            {/* Aurora Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-orange-200 to-amber-200 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse" />
                <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-blue-200 to-blue-100 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 lotus-pattern opacity-10" />
            </div>

            <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
                {/* Back Button */}
                <Link
                    href="/discover"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Discover
                </Link>

                {/* Profile Card */}
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-5">
                        {/* Left Side - Image */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-slate-50 to-slate-100 p-8 lg:p-12 border-r border-slate-100 flex flex-col gap-8">
                            {profile.coverUrl && (
                                <div className="h-32 rounded-3xl overflow-hidden relative shadow-lg">
                                    <img src={profile.coverUrl} className="w-full h-full object-cover" alt="Cover" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                                </div>
                            )}
                            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                                <img
                                    src={profile.photoUrl || "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&w=800&q=80"}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    alt={profile.name}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-8 left-8 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-3xl font-serif tracking-tight">{profile.name}</h3>
                                        <BadgeCheck className="text-amber-400" size={24} />
                                    </div>
                                    <p className="text-white/80 text-sm font-medium tracking-wide flex items-center gap-1.5">
                                        <MapPin size={14} className="text-white/60" /> {profile.location}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Info */}
                        <div className="lg:col-span-3 p-10 lg:p-16 space-y-10 flex flex-col justify-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 text-orange-700 text-xs font-black uppercase tracking-wider">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                    </span>
                                    Verified Member
                                </div>
                                <h3 className="text-5xl font-serif text-slate-900 tracking-tighter leading-tight italic">
                                    {profile.jobCategory}
                                </h3>
                                <div className="flex items-center gap-6 text-sm flex-wrap">
                                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                                        <Users size={16} className="text-orange-500" /> {profile.maritalStatus}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                                        <Sun size={16} className="text-orange-500" /> {profile.age} Years • {profile.gender}
                                    </span>
                                </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-amber-200 via-orange-200 to-transparent w-32" />

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Their Story</h4>
                                    <p className="text-xl text-slate-600 leading-relaxed font-light italic">
                                        "{profile.bio}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <span className="block text-[10px] uppercase tracking-[0.2em] text-orange-500 font-black">Profession</span>
                                        <span className="text-slate-800 font-serif text-lg tracking-tight">{profile.jobStatus}</span>
                                    </div>
                                    {profile.contactDetails && (
                                        <div className="space-y-2">
                                            <span className="block text-[10px] uppercase tracking-[0.2em] text-orange-500 font-black">Connect</span>
                                            <span className="text-slate-800 font-serif text-lg tracking-tight">{profile.contactDetails}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Photo Gallery */}
                            {profile.photoGallery && profile.photoGallery.split(',').filter(url => url).length > 0 && (
                                <div className="space-y-4 pt-8 border-t border-slate-100">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Moments Captured</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {profile.photoGallery.split(',').filter(url => url).map((url, idx) => (
                                            <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                                                <img src={url} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-8">
                                <Link
                                    href={`/chat/${userId}`}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 border border-blue-400/50"
                                >
                                    <MessageCircle size={16} />
                                    Start Chat
                                </Link>
                                <button
                                    onClick={() => setIsProposalModalOpen(true)}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-500/30 border border-emerald-400/50"
                                >
                                    <HeartHandshake size={16} />
                                    Send Proposal
                                </button>
                                <button
                                    onClick={toggleFavorite}
                                    className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all shadow-lg ${isFavorite
                                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-orange-500/30 border border-amber-400/50'
                                            : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-amber-300 hover:text-amber-600'
                                        }`}
                                >
                                    <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Proposal Modal */}
            {isProposalModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
                    <div
                        onClick={() => !isSending && setIsProposalModalOpen(false)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 relative shadow-2xl space-y-8 z-10"
                    >
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HeartHandshake className="text-orange-600" size={32} />
                            </div>
                            <h3 className="text-4xl font-serif text-slate-900">
                                Sacred <span className="italic bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Proposal</span>
                            </h3>
                            <p className="text-sm text-slate-400 font-light">Share your heart's intention with {profile.name}</p>
                        </div>

                        <textarea
                            value={proposalMessage}
                            onChange={(e) => setProposalMessage(e.target.value)}
                            placeholder="Write something that reflects your soul..."
                            disabled={isSending}
                            className="w-full h-44 bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-200/50 rounded-[2.5rem] p-8 text-sm font-light text-slate-900 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-300 transition-all resize-none"
                        />

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleSendProposal}
                                disabled={!proposalMessage.trim() || isSending}
                                className="w-full py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-amber-600 hover:to-orange-600 transition-all shadow-xl disabled:opacity-20"
                            >
                                {isSending ? 'Sending...' : 'Send Proposal'}
                            </button>
                            <button
                                onClick={() => setIsProposalModalOpen(false)}
                                disabled={isSending}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-orange-600 transition-all"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
