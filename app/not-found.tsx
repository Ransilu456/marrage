'use client';

import { motion } from 'framer-motion';
import { Heart, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#fcf8f7] flex items-center justify-center px-6">
            <div className="max-w-2xl w-full text-center space-y-12">
                {/* Visual */}
                <div className="relative inline-block">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-32 h-32 bg-white rounded-3xl shadow-xl shadow-rose-900/5 flex items-center justify-center relative z-10"
                    >
                        <Heart size={48} className="text-rose-500 fill-rose-500/10" strokeWidth={1.5} />
                    </motion.div>
                    <div className="absolute inset-0 bg-rose-500/10 blur-3xl rounded-full scale-150 -z-0" />
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <h1 className="text-7xl sm:text-9xl font-serif text-slate-900 tracking-tighter opacity-10 absolute left-1/2 -translate-x-1/2 -top-12 select-none -z-0">
                        404
                    </h1>
                    <div className="relative z-10 space-y-4">
                        <h2 className="text-4xl font-serif text-slate-900 tracking-tight">Soul Essence Not Found</h2>
                        <p className="text-slate-500 text-lg font-light max-w-md mx-auto italic">
                            The path you seek has faded into the cosmic tapestry. Let us guide you back to familiar stars.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 relative z-10">
                    <Link
                        href="/"
                        className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-slate-900/10 hover:shadow-rose-500/20"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Return to Home
                    </Link>
                    <Link
                        href="/discover"
                        className="flex items-center gap-3 px-8 py-4 bg-white border border-rose-100 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-all"
                    >
                        <Search size={16} />
                        Discover Matches
                    </Link>
                </div>

                {/* Decorative */}
                <div className="flex justify-center gap-12 pt-12 opacity-20">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-300" />
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-300" />
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-300" />
                </div>
            </div>
        </div>
    );
}
