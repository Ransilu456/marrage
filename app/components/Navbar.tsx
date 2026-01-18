'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart } from 'lucide-react';

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navItems = [
        { name: 'Discover', href: '/discover' },
        { name: 'Proposals', href: '/proposals' },
    ];

    return (
        <nav className="fixed w-full z-[100] top-0 left-0 border-b border-gray-50 bg-white/80 backdrop-blur-md transition-all duration-500">
            <div className="max-w-7xl mx-auto px-8 sm:px-12">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="text-gray-900"
                        >
                            <Heart className="w-6 h-6 fill-rose-600 stroke-none" />
                        </motion.div>
                        <span className="text-xl font-bold tracking-tighter text-gray-900 uppercase">
                            Marrage
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-12">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative py-2"
                            >
                                <span className={`text-[12px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${pathname === item.href ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'
                                    }`}>
                                    {item.name}
                                </span>
                                {pathname === item.href && (
                                    <motion.span
                                        layoutId="nav-underline"
                                        className="absolute -bottom-1 left-0 w-full h-[1px] bg-gray-900"
                                    />
                                )}
                            </Link>
                        ))}

                        {session ? (
                            <div className="flex items-center gap-8 pl-4 border-l border-gray-100">
                                <Link
                                    href="/profile"
                                    className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    My Profile
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="text-[12px] font-bold uppercase tracking-[0.2em] text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                                >
                                    Log out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-8 pl-4 border-l border-gray-100">
                                <Link
                                    href="/auth/login"
                                    className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="px-6 py-2.5 bg-gray-900 text-white font-bold text-[11px] uppercase tracking-[0.2em] rounded-full hover:bg-black transition-all shadow-sm"
                                >
                                    Join Now
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={toggleMenu} className="text-gray-900">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden bg-white border-t border-gray-50"
                    >
                        <div className="px-8 pt-8 pb-12 space-y-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="pt-8 border-t border-gray-50 mt-8 space-y-6">
                                {session ? (
                                    <>
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsOpen(false)}
                                            className="block text-sm font-bold uppercase tracking-widest text-gray-400"
                                        >
                                            My Profile
                                        </Link>
                                        <button
                                            onClick={() => { signOut(); setIsOpen(false); }}
                                            className="block w-full text-left text-sm font-bold uppercase tracking-widest text-rose-500"
                                        >
                                            Log out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/auth/login"
                                            onClick={() => setIsOpen(false)}
                                            className="block text-sm font-bold uppercase tracking-widest text-gray-400"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/auth/register"
                                            onClick={() => setIsOpen(false)}
                                            className="block text-center px-6 py-4 bg-gray-900 text-white rounded-full font-bold uppercase tracking-widest text-xs"
                                        >
                                            Join Now
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}