'use client';

import { motion } from 'framer-motion';
import { Heart, Search, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-orange-50 via-blue-50 to-amber-50 flex items-center justify-center px-6 py-20">
            {/* Sri Lankan Aurora Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-orange-200 to-amber-200 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse" />
                <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-blue-200 to-blue-100 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 lotus-pattern opacity-10" />
            </div>

            <div className="max-w-2xl w-full text-center space-y-12 relative z-10">
                {/* Visual */}
                <div className="relative inline-block">
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 3, -3, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-32 h-32 bg-white rounded-3xl shadow-xl shadow-orange-500/10 flex items-center justify-center relative z-10 border-2 border-amber-200/50"
                    >
                        <Heart size={48} className="text-orange-600 fill-orange-500/20" strokeWidth={1.5} />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-400/20 blur-3xl rounded-full scale-150 -z-0" />
                </div>

                {/* Content */}
                <div className="space-y-6 relative">
                    <h1 className="text-7xl sm:text-9xl font-serif bg-gradient-to-r from-orange-200 to-blue-200 bg-clip-text text-transparent tracking-tighter opacity-30 absolute left-1/2 -translate-x-1/2 -top-12 select-none -z-0 pointer-events-none">
                        404
                    </h1>
                    <div className="relative z-10 space-y-4 pt-8">
                        <h2 className="text-4xl sm:text-5xl font-serif text-slate-900 tracking-tight">
                            Soul Essence <span className="italic bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Not Found</span>
                        </h2>
                        <p className="text-slate-500 text-lg font-light max-w-md mx-auto italic">
                            The path you seek has faded into the cosmic tapestry. Let us guide you back to familiar stars.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 relative z-10">
                    <Link
                        href="/"
                        className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-500/20 border-2 border-blue-400/50"
                    >
                        <Home size={16} className="group-hover:scale-110 transition-transform" />
                        Return Home
                    </Link>
                    <Link
                        href="/discover"
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:from-amber-600 hover:to-orange-700 transition-all shadow-xl shadow-orange-500/20 border-2 border-amber-400/50"
                    >
                        <Search size={16} />
                        Discover Souls
                    </Link>
                </div>

                {/* Decorative */}
                <div className="flex justify-center gap-12 pt-12 opacity-30">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
                </div>
            </div>
        </div>
    );
}
