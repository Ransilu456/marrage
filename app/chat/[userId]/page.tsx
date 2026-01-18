'use client';

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, Paperclip, ChevronLeft, Loader2, MoreHorizontal } from "lucide-react";
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
        <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col pt-4">
            {/* Header */}
            <header className="px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-900" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">{recipientName}</h2>
                        <div className="flex items-center gap-1.5 pt-0.5">
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500">Available Now</span>
                        </div>
                    </div>
                </div>

                <button className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </button>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-8 py-10 space-y-6">
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === session?.user?.id;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[75%] px-6 py-4 rounded-[1.5rem] ${isMe
                                    ? 'bg-gray-900 text-white rounded-tr-none'
                                    : 'bg-gray-50 text-gray-900 rounded-tl-none border border-gray-100'
                                    }`}>
                                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                    <div className={`text-[9px] uppercase font-black tracking-widest mt-2 ${isMe ? 'text-gray-400' : 'text-gray-300'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <footer className="p-8">
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-4 bg-gray-50 p-3 rounded-[2rem] border border-gray-100 focus-within:bg-white focus-within:border-gray-200 focus-within:shadow-sm transition-all"
                >
                    <button type="button" className="p-3 text-gray-300 hover:text-gray-900 transition-colors">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        placeholder="Expression..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-transparent px-2 outline-none text-sm font-medium text-gray-900 placeholder:text-gray-300"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-3 bg-gray-900 text-white rounded-full hover:bg-black transition-all disabled:opacity-20 disabled:grayscale"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </footer>
        </div>
    );
}
