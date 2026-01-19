'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartHandshake, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getPusherClient } from '@/src/infrastructure/realtime/pusherClient';
import Link from 'next/link';

interface ProposalAcceptedEvent {
    proposalId: string;
    partnerName: string;
    partnerImage: string;
}

export default function ProposalAcceptedModal() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<ProposalAcceptedEvent | null>(null);

    useEffect(() => {
        if (!session?.user?.id) return;

        const pusher = getPusherClient();
        if (!pusher) return;

        const channel = pusher.subscribe(`user-${session.user.id}`);

        channel.bind('proposal-accepted', (eventData: ProposalAcceptedEvent) => {
            setData(eventData);
            setIsOpen(true);

            // Auto close after 10 seconds if not interacted
            setTimeout(() => {
                // Optional: strictly auto-close logic or let user close
            }, 10000);
        });

        return () => {
            channel.unbind('proposal-accepted');
            pusher.unsubscribe(`user-${session.user.id}`);
        };
    }, [session?.user?.id]);

    return (
        <AnimatePresence>
            {isOpen && data && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                        className="relative bg-white w-full max-w-md rounded-[3rem] p-8 md:p-12 shadow-2xl text-center overflow-hidden"
                    >
                        {/* Confetti/Sparkles Background */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50 animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-rose-200 to-pink-200 rounded-full blur-[80px] -ml-32 -mb-32 opacity-50 animate-pulse delay-700"></div>
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center shadow-inner mb-4 relative">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
                                >
                                    <HeartHandshake className="text-orange-600" size={48} />
                                </motion.div>
                                <motion.div
                                    className="absolute -top-2 -right-2 text-amber-500"
                                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Sparkles size={24} />
                                </motion.div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl md:text-4xl font-serif text-slate-900">
                                    A Sacred <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 font-italic">Union</span>
                                </h2>
                                <p className="text-slate-500 font-light">
                                    Destiny has smiled upon you.
                                </p>
                            </div>

                            <div className="py-6 space-y-4">
                                <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                                    <p className="text-lg font-serif text-slate-800">
                                        <span className="font-semibold text-orange-700">{data.partnerName}</span> accepted your proposal!
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/proposals"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    <span>Begin Journey</span>
                                </Link>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600 transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
