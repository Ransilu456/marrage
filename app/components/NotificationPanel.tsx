'use client';

import { motion } from 'framer-motion';
import { MessageCircle, HeartHandshake, Heart, Check, X, Trash2 } from 'lucide-react';
import { useNotificationContext } from './NotificationProvider';
import { useRouter } from 'next/navigation';

interface NotificationPanelProps {
    onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
    const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationContext();
    const router = useRouter();

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'MESSAGE':
                return <MessageCircle size={18} className="text-blue-600" />;
            case 'PROPOSAL':
                return <HeartHandshake size={18} className="text-emerald-600" />;
            case 'PROPOSAL_ACCEPTED':
                return <Check size={18} className="text-emerald-600" />;
            case 'PROPOSAL_REJECTED':
                return <X size={18} className="text-orange-600" />;
            case 'FAVORITE':
                return <Heart size={18} className="text-amber-600" />;
            default:
                return <MessageCircle size={18} className="text-slate-600" />;
        }
    };

    const handleNotificationClick = async (notification: any) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
            onClose();
        }
    };

    const groupNotificationsByDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const groups: { [key: string]: any[] } = {
            Today: [],
            Yesterday: [],
            'This Week': [],
            Older: [],
        };

        notifications.forEach(notification => {
            const notifDate = new Date(notification.createdAt);
            notifDate.setHours(0, 0, 0, 0);

            if (notifDate.getTime() === today.getTime()) {
                groups.Today.push(notification);
            } else if (notifDate.getTime() === yesterday.getTime()) {
                groups.Yesterday.push(notification);
            } else if (notifDate >= weekAgo) {
                groups['This Week'].push(notification);
            } else {
                groups.Older.push(notification);
            }
        });

        return groups;
    };

    const groupedNotifications = groupNotificationsByDate();

    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 max-h-[600px] bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden z-50"
        >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-orange-50 via-blue-50 to-amber-50">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-serif text-slate-900 tracking-tight">Notifications</h3>
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 uppercase tracking-wider"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[500px]">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                            <MessageCircle size={28} className="text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
                        <p className="text-xs text-slate-300">We'll notify you when something happens</p>
                    </div>
                ) : (
                    Object.entries(groupedNotifications).map(([group, items]) =>
                        items.length > 0 ? (
                            <div key={group} className="border-b border-slate-50 last:border-0">
                                <div className="px-6 py-2 bg-slate-50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {group}
                                    </p>
                                </div>
                                {items.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`group relative px-6 py-4 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 transition-all cursor-pointer border-b border-slate-50 last:border-0 ${!notification.read ? 'bg-blue-50/30' : ''
                                            }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex-shrink-0 mt-1.5" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                                    {new Date(notification.createdAt).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null
                    )
                )}
            </div>
        </motion.div>
    );
}
