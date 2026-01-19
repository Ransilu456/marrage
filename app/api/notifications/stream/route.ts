
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { notificationBus } from '@/src/infrastructure/events/NotificationBus';

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) {
        return new Response('Unauthorized', { status: 401 });
    }

    const userId = token.sub;

    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            const sendEvent = (data: any) => {
                const chunk = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
                controller.enqueue(chunk);
            };

            // Listener for this user's notifications
            const listener = (data: any) => {
                sendEvent(data);
            };

            notificationBus.on(`notification:${userId}`, listener);

            // Send initial connection message
            sendEvent({ type: 'CONNECTED', timestamp: new Date() });

            // Cleanup when connection closes
            req.signal.addEventListener('abort', () => {
                notificationBus.off(`notification:${userId}`, listener);
                controller.close();
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
