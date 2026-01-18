'use client';
import { useNotifications } from '../hooks/useNotifications';
import { useEffect } from 'react';

export default function NotificationListener() {
    const notifications = useNotifications();

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[notifications.length - 1];
            // Simple alert for now
            alert(`New Notification: ${latest.message}`);
            console.log("New Notification", latest);
        }
    }, [notifications]);

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {notifications.map((n, i) => (
                <div key={i} className="bg-white border rounded shadow p-4 animate-slide-in">
                    <h4 className="font-bold">{n.title}</h4>
                    <p>{n.message}</p>
                </div>
            ))}
        </div>
    );
}
