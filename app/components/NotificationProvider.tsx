'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
// Pusher removed as requested
// Pusher removed as requested


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

    // Real-time notifications via SSE
    useEffect(() => {
        if (!session?.user) return;

        const eventSource = new EventSource('/api/notifications/stream');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'CONNECTED') {
                console.log('Real-time notifications connected');
                return;
            }

            // New notification received
            setNotifications(prev => [data, ...prev].slice(0, 50));
            setUnreadCount(prev => prev + 1);

            // Trigger browser notification if supported
            if (Notification.permission === 'granted') {
                new Notification(data.title, {
                    body: data.message,
                    icon: '/favicon.ico' // Ensure valid icon path
                });
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
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
