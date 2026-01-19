'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNotificationContext } from './NotificationProvider';
import { NotificationPanel } from './NotificationPanel';

export function NotificationBell() {
    const { unreadCount } = useNotificationContext();
    const [isOpen, setIsOpen] = useState(false);
    const [shake, setShake] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);
    const prevUnreadCount = useRef(unreadCount);

    // Shake animation when new notification arrives
    useEffect(() => {
        if (unreadCount > prevUnreadCount.current) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
        prevUnreadCount.current = unreadCount;
    }, [unreadCount]);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-xl hover:bg-slate-100 transition-all ${shake ? 'animate-bounce' : ''
                    }`}
            >
                <Bell size={20} className="text-slate-600" />
                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 border-2 border-white"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.div>
                )}
            </button>

            <AnimatePresence>
                {isOpen && <NotificationPanel onClose={() => setIsOpen(false)} />}
            </AnimatePresence>
        </div>
    );
}
