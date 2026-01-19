'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Loader2, MapPin, BadgeCheck, Users, Sun,
    MessageCircle, HeartHandshake, ArrowLeft, Share2,
    Briefcase, GraduationCap, Info, Utensils, Cigarette,
    Baby, Home, Search as SearchIcon, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface ProfileData {
    id: string;
    userId: string;
    name: string;
    age: number;
    gender: string;
    religion?: string;
    caste?: string;
    motherTongue?: string;
    height?: number;
    bio: string;
    location: string;
    jobStatus: string;
    maritalStatus: string;
    photoUrl: string;
    education?: string;
    profession?: string;
    incomeRange?: string;
    diet?: string;
    smoking?: string;
    drinking?: string;
    fatherOccupation?: string;
    motherOccupation?: string;
    siblings?: string;
    familyType?: string;
    prefAgeMin?: number;
    prefAgeMax?: number;
    prefHeightMin?: number;
    prefReligion?: string;
    prefEducation?: string;
    prefLifestyle?: string;
}

export default function UserProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const userId = params?.userId as string;

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
    const [interestMessage, setInterestMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [hasInterest, setHasInterest] = useState(false);

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
        const response = await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favoritedId: userId }),
        });
        if (response.ok) {
            const data = await response.json();
            setIsFavorite(data.isFavorited);
        }
    };

    const handleSendInterest = async () => {
        setIsSending(true);
        try {
            const res = await fetch('/api/interests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: userId,
                    message: interestMessage
                })
            });
            if (res.ok) {
                setIsInterestModalOpen(false);
                setInterestMessage("");
                setHasInterest(true);
            }
        } catch (error) {
            console.error('Error sending interest:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-rose-500" /></div>;
    if (!profile) return null;

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Header / Hero Area */}
            <div className="bg-white border-b border-slate-100 pt-24 pb-12">
                <div className="max-w-6xl mx-auto px-6">
                    <Link href="/discover" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-500 transition-all uppercase tracking-widest mb-8">
                        <ArrowLeft size={14} /> Back to Discover
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Profile Image Column */}
                        <div className="lg:col-span-4">
                            <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl shadow-rose-900/10 border-4 border-white relative">
                                <img src={profile.photoUrl || "/placeholder.jpg"} className="w-full h-full object-cover" alt={profile.name} />
                                <div className="absolute top-6 right-6 flex flex-col gap-2">
                                    <button
                                        onClick={toggleFavorite}
                                        className={`p-3 rounded-full backdrop-blur-md transition-all ${isFavorite ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                    >
                                        <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Info Column */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-5xl font-serif text-slate-900 font-bold">{profile.name}, {profile.age}</h1>
                                    <BadgeCheck className="text-blue-500 fill-blue-50" size={32} />
                                </div>
                                <p className="text-slate-500 text-lg italic leading-relaxed max-w-2xl">"{profile.bio}"</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="bg-rose-50/50 p-4 rounded-3xl border border-rose-100/50">
                                    <span className="block text-[10px] uppercase tracking-widest text-rose-400 font-bold mb-1">Religion</span>
                                    <span className="text-slate-900 font-bold">{profile.religion || 'Not specified'}</span>
                                </div>
                                <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100/50">
                                    <span className="block text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1">Height</span>
                                    <span className="text-slate-900 font-bold">{profile.height} cm</span>
                                </div>
                                <div className="bg-amber-50/50 p-4 rounded-3xl border border-amber-100/50">
                                    <span className="block text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1">Status</span>
                                    <span className="text-slate-900 font-bold">{profile.maritalStatus?.toLowerCase() || 'Single'}</span>
                                </div>
                                <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100/50">
                                    <span className="block text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1">Location</span>
                                    <span className="text-slate-900 font-bold">{profile.location}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsInterestModalOpen(true)}
                                    disabled={hasInterest}
                                    className="flex-1 bg-rose-600 text-white px-8 py-5 rounded-[2rem] font-bold shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:grayscale"
                                >
                                    <HeartHandshake /> {hasInterest ? 'Interest Sent' : 'Send Interest'}
                                </button>
                                <Link
                                    href={`/chat/${userId}`}
                                    className="px-8 py-5 rounded-[2rem] bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-3"
                                >
                                    <MessageCircle /> Chat
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Column 1: Life & Career */}
                <div className="space-y-8">
                    <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                        <Briefcase size={14} /> Lifestyle & Career
                    </h3>
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-300 uppercase">Education</label>
                            <p className="text-slate-900 font-medium">{profile.education || 'Not specified'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-300 uppercase">Profession</label>
                            <p className="text-slate-900 font-medium">{profile.profession || 'Not specified'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-300 uppercase">Income Range</label>
                            <p className="text-slate-900 font-medium">{profile.incomeRange || 'Confidential'}</p>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
                                <Utensils size={12} /> {profile.diet || 'Any'}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
                                <Cigarette size={12} /> {profile.smoking || 'Non-Smoker'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Family Background */}
                <div className="space-y-8">
                    <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                        <Home size={14} /> Family Background
                    </h3>
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-300 uppercase">Family Type</label>
                            <p className="text-slate-900 font-medium">{profile.familyType || 'Not specified'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-300 uppercase">Father's Occupation</label>
                            <p className="text-slate-900 font-medium">{profile.fatherOccupation || 'Retired/Independent'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-300 uppercase">Mother's Occupation</label>
                            <p className="text-slate-900 font-medium">{profile.motherOccupation || 'Homemaker'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-300 uppercase">Siblings</label>
                            <p className="text-slate-900 font-medium">{profile.siblings || 'None'}</p>
                        </div>
                    </div>
                </div>

                {/* Column 3: Partner Preferences */}
                <div className="space-y-8">
                    <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                        <SearchIcon size={14} /> Partner Preferences
                    </h3>
                    <div className="bg-gradient-to-br from-rose-50 to-white rounded-[2.5rem] p-8 shadow-sm border border-rose-100 space-y-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-rose-300 uppercase">Age Range</label>
                            <p className="text-slate-900 font-medium">{profile.prefAgeMin} - {profile.prefAgeMax} years</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-rose-300 uppercase">Preferred Religion</label>
                            <p className="text-slate-900 font-medium">{profile.prefReligion || 'Any'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-rose-300 uppercase">Education Level</label>
                            <p className="text-slate-900 font-medium">{profile.prefEducation || 'Highly Qualified'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-rose-300 uppercase">Lifestyle Expectation</label>
                            <p className="text-slate-900 font-medium italic">"{profile.prefLifestyle || 'Looking for traditional values with a modern touch.'}"</p>
                        </div>
                    </div>
                </div>
            </div>

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
                            className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HeartHandshake className="text-rose-600" size={40} />
                                </div>
                                <h3 className="text-3xl font-serif text-slate-900 font-bold">Express Interest</h3>
                                <p className="text-sm text-slate-400">Send an interest request to {profile.name} to see if there's a match.</p>
                            </div>
                            <textarea
                                value={interestMessage}
                                onChange={(e) => setInterestMessage(e.target.value)}
                                className="w-full h-40 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-rose-500 rounded-3xl p-6 text-sm outline-none transition-all resize-none"
                                placeholder="Add a personal touch to your interest..."
                                disabled={isSending}
                            />
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleSendInterest}
                                    disabled={isSending || !interestMessage.trim()}
                                    className="w-full py-5 rounded-2xl bg-rose-600 text-white font-bold shadow-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {isSending ? <Loader2 className="animate-spin" size={20} /> : (
                                        <>Send Sacred Interest <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </button>
                                <button onClick={() => setIsInterestModalOpen(false)} className="py-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
