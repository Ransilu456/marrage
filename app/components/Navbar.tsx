'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, HeartHandshake } from 'lucide-react';

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navItems = session ? [
        { name: 'Discover', href: '/discover' },
        { name: 'Proposals', href: '/proposals' },
        { name: 'Messages', href: '/messages' },
    ] : [];

    return (
        <nav className="fixed w-full z-[100] top-0 left-0 bg-white/80 backdrop-blur-md border-b border-rose-100/50 transition-all duration-500">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-orange-400 rounded-lg flex items-center justify-center text-white shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
                        <HeartHandshake size={18} strokeWidth={1.5} />
                    </div>
                    <span className="font-serif text-xl tracking-tight text-slate-900 font-medium">
                        Eternity
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex items-center gap-8 text-sm font-medium text-slate-500">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`transition-colors hover:text-rose-600 ${pathname === item.href ? 'text-slate-900' : ''
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="h-4 w-[1px] bg-slate-200 mx-2" />

                    {session ? (
                        <div className="flex items-center gap-6">
                            <Link
                                href="/profile"
                                className={`text-sm font-medium transition-colors hover:text-rose-600 ${pathname === '/profile' ? 'text-slate-900' : 'text-slate-500'
                                    }`}
                            >
                                Profile
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors"
                            >
                                Log out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/auth/login"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/auth/register"
                                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium py-2 px-5 rounded-full transition-all shadow-md shadow-rose-500/20 tracking-wide"
                            >
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                    <button onClick={toggleMenu} className="text-slate-600">
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-rose-50 overflow-hidden"
                    >
                        <div className="px-6 py-8 flex flex-col gap-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`text-base font-medium transition-colors ${pathname === item.href ? 'text-rose-600' : 'text-slate-600'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {session ? (
                                <>
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="text-base font-medium text-slate-600"
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => { signOut(); setIsOpen(false); }}
                                        className="text-left text-base font-medium text-rose-600"
                                    >
                                        Log out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        onClick={() => setIsOpen(false)}
                                        className="text-base font-medium text-slate-600"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        onClick={() => setIsOpen(false)}
                                        className="bg-rose-600 text-white text-center font-medium py-3 rounded-xl"
                                    >
                                        Join Eternity
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}