
import Pusher from 'pusher';

// Singleton instance
let pusherInstance: Pusher | null = null;
let pusherConfigured = false;

export function getPusherClient(): Pusher | null {
    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1';

    if (!appId || !key || !secret) {
        if (!pusherConfigured) {
            console.warn('Pusher credentials missing. Real-time features will be disabled.');
            pusherConfigured = true;
        }
        return null;
    }

    if (!pusherInstance) {
        pusherInstance = new Pusher({
            appId,
            key,
            secret,
            cluster,
            useTLS: true,
        });
    }
    return pusherInstance;
}

export async function triggerMessage(channel: string, event: string, data: any) {
    const pusher = getPusherClient();
    if (!pusher) return;

    try {
        await pusher.trigger(channel, event, data);
    } catch (error) {
        console.error('Pusher trigger error:', error);
    }
}
