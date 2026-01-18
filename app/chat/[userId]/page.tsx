'use client';

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, Paperclip, ChevronLeft, Loader2, MoreHorizontal, Check, Sun } from "lucide-react";
import Pusher from "pusher-js";

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
}

export default function ChatPage() {
    const { data: session } = useSession();
    const { userId } = useParams();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [recipientName, setRecipientName] = useState("Loading...");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (session?.user) {
            fetchMessages();
            fetchRecipientProfile();

            if (process.env.NEXT_PUBLIC_PUSHER_KEY) {
                const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
                    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
                });

                const channelId = [session.user.id, userId as string].sort().join('-');
                const channel = pusher.subscribe(`chat-${channelId}`);

                channel.bind('new-message', (data: Message) => {
                    setMessages(prev => {
                        if (prev.find(m => m.id === data.id)) return prev;
                        return [...prev, data];
                    });
                });

                return () => {
                    pusher.unsubscribe(`chat-${channelId}`);
                };
            }
        }
    }, [session, userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchRecipientProfile = async () => {
        try {
            // Assuming an endpoint exists or using plural search
            const res = await fetch(`/api/profiles`);
            if (res.ok) {
                const data = await res.json();
                const recipient = data.profiles?.find((p: any) => p.id === userId);
                if (recipient) setRecipientName(recipient.gender === 'Male' ? `Mr. ${recipient.age}` : `Ms. ${recipient.age}`);
                else setRecipientName("User");
            }
        } catch (error) {
            setRecipientName("User");
        }
    };

    const fetchMessages = async () => {
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
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-6 h-6 text-gray-200 animate-spin" />
        </div>
    );

    return (
        <div className="bg-[#fcf8f7] min-h-screen flex flex-col">
            {/* Header - Fixed and Glassmorphic */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-rose-100/50 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                                    <img
                                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120"
                                        className="w-full h-full object-cover"
                                        alt="Recipient"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full ring-4 ring-emerald-500/10" />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-lg font-serif text-slate-900 tracking-tight leading-none">{recipientName}</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                                    Active Presence
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-3 text-slate-400 hover:text-rose-600 transition-colors">
                            <Heart size={20} className="fill-transparent hover:fill-rose-500" />
                        </button>
                        <button className="p-3 text-slate-400 hover:text-slate-900 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 max-w-4xl w-full mx-auto px-6 pt-32 pb-32 space-y-8 overflow-y-auto scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.length === 0 && !loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 space-y-6"
                        >
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                                <Heart size={24} className="text-rose-500 fill-rose-500/10" />
                            </div>
                            <p className="text-slate-400 font-serif italic text-lg">Send a message to ignite the spark...</p>
                        </motion.div>
                    )}
                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === session?.user?.id;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, scale: 0.95, y: 10, x: isMe ? 10 : -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`group relative max-w-[80%] md:max-w-[65%] space-y-2`}>
                                    <div className={`px-6 py-4 rounded-[2.5rem] shadow-sm transition-all duration-300 ${isMe
                                        ? 'bg-slate-900 text-white rounded-tr-none shadow-slate-900/10'
                                        : 'bg-white text-slate-900 border border-rose-100 rounded-tl-none shadow-rose-900/5'
                                        }`}>
                                        <p className="text-sm font-medium leading-relaxed tracking-tight">{msg.content}</p>
                                    </div>
                                    <div className={`flex items-center gap-3 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <span className="text-[9px] uppercase font-black tracking-widest text-slate-300">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMe && <Check size={10} className="text-rose-500" />}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar - Floating */}
            <footer className="fixed bottom-8 left-6 right-6 z-50">
                <div className="max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSend}
                        className="flex items-center gap-3 bg-white/80 backdrop-blur-xl p-3 pl-5 rounded-[2.5rem] border border-rose-100 shadow-2xl shadow-rose-900/5 focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-500/5 transition-all"
                    >
                        <button type="button" className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                            <Paperclip size={20} />
                        </button>
                        <input
                            type="text"
                            placeholder="Type your heart's expression..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 bg-transparent px-2 outline-none text-sm font-medium text-slate-900 placeholder:text-slate-300"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="p-4 bg-slate-900 text-white rounded-full hover:bg-rose-600 transition-all disabled:opacity-20 flex items-center justify-center shadow-lg shadow-slate-900/10"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </footer>
        </div>
    );
}
