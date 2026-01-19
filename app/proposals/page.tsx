'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Check, X, Clock, MessageCircle, Trash2, Ban, HeartHandshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMatch } from "@/app/components/providers/MatchProvider";

interface Interest {
    id: string;
    senderId: string;
    receiverId: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    message?: string;
    createdAt: string;
    senderName?: string;
    senderPhoto?: string;
    receiverName?: string;
    receiverPhoto?: string;
}

export default function InterestsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { showMatch } = useMatch();
    const [received, setReceived] = useState<Interest[]>([]);
    const [sent, setSent] = useState<Interest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchInterests();
        }
    }, [status]);

    const fetchInterests = async () => {
        try {
            const res = await fetch('/api/interests/list'); // Assuming a list endpoint exists or using query params
            // If the endpoint doesn't exist yet, I'll need to create it or fix this
            // For now, let's assume /api/interests returns both or we use a separate fetch
            const [receivedRes, sentRes] = await Promise.all([
                fetch('/api/interests/received'),
                fetch('/api/interests/sent')
            ]);

            if (receivedRes.ok && sentRes.ok) {
                const receivedData = await receivedRes.json();
                const sentData = await sentRes.json();
                setReceived(receivedData.interests || []);
                setSent(sentData.interests || []);
            }
        } catch (error) {
            console.error('Error fetching interests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (interestId: string, status: 'ACCEPTED' | 'DECLINED') => {
        try {
            const res = await fetch('/api/interests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interestId, status })
            });

            if (res.ok) {
                if (status === 'ACCEPTED') {
                    const int = received.find(i => i.id === interestId);
                    showMatch({
                        partnerName: int?.senderName || 'Your Match',
                        partnerImage: int?.senderPhoto,
                        proposalId: interestId // Using interestId as match trigger
                    });
                }
                fetchInterests();
            }
        } catch (error) {
            console.error('Action error:', error);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" /></div>;

    const currentList = activeTab === 'received' ? received : sent;

    return (
        <div className="bg-slate-50 min-h-screen pb-32 pt-32">
            <main className="max-w-4xl mx-auto px-6 space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-serif text-slate-900 font-bold">Connections</h1>
                    <p className="text-slate-400">Manage your interests and potential matches</p>
                </div>

                <div className="flex justify-center">
                    <div className="bg-white p-1 rounded-3xl shadow-lg border border-slate-100 flex">
                        <button onClick={() => setActiveTab('received')} className={`px-8 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'received' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>
                            Received ({received.filter(i => i.status === 'PENDING').length})
                        </button>
                        <button onClick={() => setActiveTab('sent')} className={`px-8 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'sent' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>
                            Sent ({sent.filter(i => i.status === 'PENDING').length})
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {currentList.map((interest, idx) => (
                            <motion.div
                                key={interest.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center gap-6"
                            >
                                <img
                                    src={(activeTab === 'received' ? interest.senderPhoto : interest.receiverPhoto) || "/placeholder.jpg"}
                                    className="w-16 h-16 rounded-full object-cover"
                                    alt="User"
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {activeTab === 'received' ? interest.senderName : interest.receiverName}
                                    </h3>
                                    <p className="text-xs text-slate-400 mb-2">{new Date(interest.createdAt).toLocaleDateString()}</p>
                                    <p className="text-sm text-slate-600 italic">"{interest.message || 'Expressed interest in your profile.'}"</p>
                                </div>
                                <div className="flex gap-2">
                                    {activeTab === 'received' && interest.status === 'PENDING' ? (
                                        <>
                                            <button onClick={() => handleAction(interest.id, 'ACCEPTED')} className="p-3 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all"><Check size={20} /></button>
                                            <button onClick={() => handleAction(interest.id, 'DECLINED')} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all"><X size={20} /></button>
                                        </>
                                    ) : (
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${interest.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600' : interest.status === 'DECLINED' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {interest.status}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
