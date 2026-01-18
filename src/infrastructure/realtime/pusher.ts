
import Pusher from 'pusher';

// Singleton instance
let pusherInstance: Pusher | null = null;

export function getPusherClient(): Pusher {
    if (!pusherInstance) {
        pusherInstance = new Pusher({
            appId: process.env.PUSHER_APP_ID || '',
            key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
            secret: process.env.PUSHER_SECRET || '',
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
            useTLS: true,
        });
    }
    return pusherInstance;
}

export async function triggerMessage(channel: string, event: string, data: any) {
    const pusher = getPusherClient();
    try {
        await pusher.trigger(channel, event, data);
    } catch (error) {
        console.error('Pusher trigger error:', error);
    }
}
