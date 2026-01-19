'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import Pusher from 'pusher-js';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [permissionRequested, setPermissionRequested] = useState(false);

    // Request notification permission
    useEffect(() => {
        if (typeof window !== 'undefined' && !permissionRequested) {
            if (Notification.permission === 'default') {
                // Request permission after a short delay to not be intrusive
                setTimeout(() => {
                    Notification.requestPermission().then(permission => {
                        console.log('Notification permission:', permission);
                    });
                }, 3000);
            }
            setPermissionRequested(true);
        }
    }, [permissionRequested]);

    // Fetch initial notifications
    const refreshNotifications = async () => {
        if (!session?.user) return;

        try {
            const response = await fetch('/api/notifications?limit=20');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (session?.user) {
            refreshNotifications();
        }
    }, [session]);

    // Subscribe to Pusher for real-time notifications
    useEffect(() => {
        if (!session?.user) return;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
            authEndpoint: '/api/pusher/auth',
        });

        // @ts-ignore
        const channel = pusher.subscribe(`user-${session.user.id}`);

        channel.bind('notification', (data: any) => {
            // Add to notifications list
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show browser notification
            if (typeof window !== 'undefined' && Notification.permission === 'granted') {
                const notification = new Notification(data.title, {
                    body: data.message,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: data.id,
                });

                // Play notification sound
                try {
                    const audio = new Audio('/notification.mp3');
                    audio.volume = 0.5;
                    audio.play().catch(err => console.log('Audio play failed:', err));
                } catch (error) {
                    console.log('Audio not available');
                }

                // Navigate on click
                notification.onclick = () => {
                    window.focus();
                    if (data.link) {
                        window.location.href = data.link;
                    }
                    notification.close();
                };

                // Auto-close after 5 seconds
                setTimeout(() => notification.close(), 5000);
            }
        });

        return () => {
            // @ts-ignore
            pusher.unsubscribe(`user-${session.user.id}`);
        };
    }, [session]);

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId }),
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllAsRead: true }),
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId }),
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
                const wasUnread = notifications.find(n => n.id === notificationId && !n.read);
                if (wasUnread) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                refreshNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within NotificationProvider');
    }
    return context;
}
