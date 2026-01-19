'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface MatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    partnerName: string;
    partnerImage?: string;
    myImage?: string;
}

export function MatchModal({ isOpen, onClose, partnerName, partnerImage, myImage }: MatchModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="relative w-full max-w-md bg-transparent text-center"
                >
                    {/* Celebration Emojis Background */}
                    <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.5, rotate: 360, opacity: [0, 1, 0] }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="text-9xl absolute top-0 -left-10"
                        >
                            🎉
                        </motion.div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.5, rotate: -360, opacity: [0, 1, 0] }}
                            transition={{ duration: 2, delay: 0.2, ease: "easeOut" }}
                            className="text-9xl absolute bottom-0 -right-10"
                        >
                            ✨
                        </motion.div>
                    </div>

                    <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 font-serif mb-8 drop-shadow-2xl italic tracking-tighter">
                        It's a Match!
                    </h2>

                    <div className="flex justify-center items-center gap-4 mb-10">
                        <motion.div
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="relative"
                        >
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-slate-200">
                                {myImage ? (
                                    <img src={myImage} alt="Me" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl">🫵</div>
                                )}
                            </div>
                        </motion.div>

                        <div className="text-4xl animate-pulse">❤️</div>

                        <motion.div
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="relative"
                        >
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-slate-200">
                                {partnerImage ? (
                                    <img src={partnerImage} alt={partnerName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <p className="text-white text-lg font-medium mb-8">
                        You and <span className="text-orange-300 font-bold">{partnerName}</span> have liked each other.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                onClose();
                                router.push('/chat');
                            }}
                            className="w-full py-4 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full text-white font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                        >
                            Send a Message
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-white/10 rounded-full text-white font-bold uppercase tracking-widest hover:bg-white/20 transition-colors"
                        >
                            Keep Swiping
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
