import Pusher from 'pusher-js';

let pusherClient: Pusher | null = null;

export const getPusherClient = () => {
    if (typeof window === 'undefined') return null;

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    if (!key) {
        if (!process.env.PUSHER_KEY_MISSING_LOGGED) {
            console.warn('Pusher key is missing. Real-time features will be disabled.');
            process.env.PUSHER_KEY_MISSING_LOGGED = 'true';
        }
        return null;
    }

    if (!pusherClient) {
        pusherClient = new Pusher(key, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
            authEndpoint: '/api/pusher/auth',
        });
    }

    return pusherClient;
};
