'use client';

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, Paperclip, ChevronLeft, Loader2, MoreHorizontal, Check, Sun } from "lucide-react";
// Pusher removed as requested


interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
}

interface RecipientProfile {
    id: string;
    name: string;
    age: number;
    location: string;
    photoUrl: string;
    bio: string;
    jobCategory: string;
    maritalStatus: string;
}

export default function ChatPage() {
    const { data: session } = useSession();
    const { userId } = useParams();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [recipient, setRecipient] = useState<RecipientProfile | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
    const [proposalMessage, setProposalMessage] = useState("");
    const [proposalStatus, setProposalStatus] = useState<'PENDING' | 'YES' | 'NO' | 'NONE'>('NONE');
    const [isSendingProposal, setIsSendingProposal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (session?.user && userId && userId !== 'undefined') {
            fetchMessages();
            fetchRecipientProfile();
            fetchProposalStatus();

            // Poll for new messages every 3 seconds
            const interval = setInterval(() => {
                fetchMessages();
            }, 3000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [session, userId]);


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchProposalStatus = async () => {
        try {
            const res = await fetch(`/api/proposals`);
            if (res.ok) {
                const data = await res.json();
                // Check if there is a proposal involving this user
                const p = [...(data.received || []), ...(data.sent || [])].find(
                    item => item.proposerId === userId || item.recipientId === userId
                );
                if (p) setProposalStatus(p.answer);
            }
        } catch (error) {
            console.error('Error fetching proposal status:', error);
        }
    };

    const fetchRecipientProfile = async () => {
        try {
            const res = await fetch(`/api/profiles`);
            if (res.ok) {
                const data = await res.json();
                const profile = data.profiles?.find((p: any) => p.userId === userId);
                if (profile) setRecipient(profile);
            }
        } catch (error) {
            console.error('Error fetching recipient profile:', error);
        }
    };

    const fetchMessages = async () => {
        if (!userId || userId === 'undefined') return;
        try {
            const res = await fetch(`/api/chat/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendProposal = async () => {
        if (!userId || isSendingProposal) return;
        setIsSendingProposal(true);
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
                setProposalStatus('PENDING');
                setIsProposalModalOpen(false);
                setProposalMessage("");
            }
        } catch (error) {
            console.error('Error sending proposal:', error);
        } finally {
            setIsSendingProposal(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !session?.user?.id) return;

        const optimisticMessage: Message = {
            id: Date.now().toString(),
            content: newMessage,
            senderId: session.user.id as string,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMessage]);
        const msg = newMessage;
        setNewMessage("");

        try {
            await fetch(`/api/chat/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: msg }),
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Heart size={20} className="text-rose-600 animate-pulse" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen flex h-screen overflow-hidden pt-20">
            {/* Elite Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-[60] bg-white/70 backdrop-blur-2xl border-b border-slate-100/50 h-20">
                <div className="max-w-[1600px] mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.back()}
                            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-slate-100/50 group"
                        >
                            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="relative group cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 ring-4 ring-white shadow-sm">
                                    <img
                                        src={recipient?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120"}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        alt="Recipient"
                                    />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-lg font-serif text-slate-900 leading-none tracking-tight">{recipient?.name || "Aura Match"}</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/80">Synchronized Now</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-3 text-slate-300 hover:text-rose-500 transition-all hover:bg-rose-50 rounded-2xl border border-transparent hover:border-rose-100/50">
                            <Heart size={20} />
                        </button>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`p-3 transition-all rounded-2xl border ${isSidebarOpen ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-300 hover:text-slate-900 hover:bg-slate-100 border-transparent hover:border-slate-100'}`}
                        >
                            <Sun size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-10 space-y-12 scrollbar-hide">
                        <div className="max-w-3xl mx-auto w-full space-y-10">
                            <AnimatePresence initial={false}>
                                {messages.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-40 space-y-4"
                                    >
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                                            <Sun size={24} className="text-rose-200 animate-spin-slow" />
                                        </div>
                                        <p className="text-sm font-light italic text-slate-400">Wait for the resonance to begin...</p>
                                    </motion.div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.senderId === session?.user?.id;
                                        const showTime = idx === 0 ||
                                            new Date(msg.createdAt).getTime() - new Date(messages[idx - 1].createdAt).getTime() > 1000 * 60 * 10;

                                        return (
                                            <div key={msg.id} className="space-y-4">
                                                {showTime && (
                                                    <div className="text-center py-4">
                                                        <span className="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-sm">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                )}
                                                <motion.div
                                                    initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[80%] md:max-w-[70%] group`}>
                                                        <div className={`relative px-6 py-4 transition-all duration-300 shadow-sm ${isMe
                                                            ? 'bg-slate-900 text-white rounded-[2rem] rounded-tr-md'
                                                            : 'bg-white text-slate-900 rounded-[2rem] rounded-tl-md border border-slate-100'
                                                            }`}>
                                                            <p className="text-[15px] font-light leading-relaxed tracking-tight select-text">{msg.content}</p>

                                                            {/* Bubble Decoration */}
                                                            <div className={`absolute top-2 ${isMe ? '-right-1' : '-left-1'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                                <div className={`w-2 h-2 rounded-full ${isMe ? 'bg-rose-500' : 'bg-slate-200'}`} />
                                                            </div>
                                                        </div>
                                                        <div className={`mt-1.5 flex items-center gap-2 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                            {isMe && <Check size={12} className="text-rose-500/60" />}
                                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                            <div ref={messagesEndRef} className="h-20" />
                        </div>
                    </div>

                    {/* Integrated Input Section */}
                    <footer className="bg-white/70 backdrop-blur-2xl border-t border-slate-100/50 py-8 px-6">
                        <div className="max-w-3xl mx-auto">
                            <form
                                onSubmit={handleSend}
                                className="relative flex items-center gap-3 bg-slate-50 border border-slate-100 p-2 rounded-[2rem] focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-500/5 focus-within:border-rose-200 transition-all duration-300"
                            >
                                <button type="button" className="p-3.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
                                    <Paperclip size={20} strokeWidth={1.5} />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Type your resonance..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 bg-transparent px-2 py-3 outline-none text-[15px] font-light text-slate-900 placeholder:text-slate-300"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="w-12 h-12 bg-slate-900 text-white rounded-full hover:bg-rose-600 transition-all disabled:opacity-20 flex items-center justify-center shadow-lg shadow-slate-900/10 active:scale-95 translate-x-0 group"
                                >
                                    <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </footer>
                </div>

                {/* Recipient Profile Sidebar */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.aside
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="hidden lg:flex flex-col w-[380px] bg-white border-l border-slate-100 h-full overflow-y-auto"
                        >
                            <div className="p-8 space-y-10">
                                {/* Profile Card */}
                                <div className="space-y-6">
                                    <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-xl shadow-slate-900/5 group">
                                        <img
                                            src={recipient?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800"}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            alt={recipient?.name}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                                        <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                                            <h3 className="text-3xl font-serif leading-none">{recipient?.name}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{recipient?.age} years • {recipient?.location}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 px-2">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Resonance Bio</p>
                                            <p className="text-sm text-slate-500 leading-relaxed font-light italic">
                                                "{recipient?.bio || 'Waiting for this aura to share their story...'}"
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Path</p>
                                                <p className="text-xs font-bold text-slate-900">{recipient?.jobCategory || 'Expert'}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Current</p>
                                                <p className="text-xs font-bold text-slate-900">{recipient?.maritalStatus || 'Single'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                {/* Action Matrix */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 px-2">Aura Controls</p>
                                    <div className="space-y-2">
                                        {proposalStatus === 'NONE' ? (
                                            <button
                                                onClick={() => setIsProposalModalOpen(true)}
                                                className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100/50"
                                            >
                                                Send Proposal
                                            </button>
                                        ) : (
                                            <div className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border ${proposalStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                proposalStatus === 'YES' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                Proposal {proposalStatus}
                                            </div>
                                        )}
                                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-slate-900/10">
                                            Deep Connect
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* Proposal Modal */}
            <AnimatePresence>
                {isProposalModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsProposalModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[3rem] p-10 relative shadow-2xl space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h3 className="text-3xl font-serif text-slate-900">Send Your <span className="italic text-rose-500">Proposal</span></h3>
                                <p className="text-sm text-slate-400 font-light">Share your heart's intention with {recipient?.name}</p>
                            </div>

                            <div className="space-y-4">
                                <textarea
                                    value={proposalMessage}
                                    onChange={(e) => setProposalMessage(e.target.value)}
                                    placeholder="Write a message that resonates..."
                                    className="w-full h-40 bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-sm font-light text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-200 transition-all resize-none"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsProposalModalOpen(false)}
                                        className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                                    >
                                        Maybe Later
                                    </button>
                                    <button
                                        onClick={handleSendProposal}
                                        disabled={!proposalMessage.trim() || isSendingProposal}
                                        className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 disabled:opacity-20 transition-all shadow-xl shadow-slate-900/10"
                                    >
                                        {isSendingProposal ? 'Seeking Resonance...' : 'Ignite Heart'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
