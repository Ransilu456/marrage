
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Pusher from 'pusher-js';

// Reusing the same Pusher client logic would be better in a Context
// But for MVP this is fine
export function useNotifications() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!session?.user) return;

        // Request notification permission
        if (typeof window !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
            authEndpoint: '/api/pusher/auth',
        });

        // @ts-ignore
        const channel = pusher.subscribe(`user-${session.user.id}`);

        channel.bind('notification', (data: any) => {
            setNotifications(prev => [...prev, data]);

            // Show browser notification
            if (typeof window !== 'undefined' && Notification.permission === 'granted') {
                new Notification(data.title, {
                    body: data.message,
                    icon: '/favicon.ico' // Or a better icon if available
                });
            }
        });

        return () => {
            // @ts-ignore
            pusher.unsubscribe(`user-${session.user.id}`);
        };
    }, [session]);

    return notifications;
}
