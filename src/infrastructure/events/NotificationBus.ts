
import { EventEmitter } from 'events';

class NotificationBus extends EventEmitter {
    private static instance: NotificationBus;

    private constructor() {
        super();
        this.setMaxListeners(100); // Allow many concurrent SSE clients
    }

    public static getInstance(): NotificationBus {
        if (!NotificationBus.instance) {
            NotificationBus.instance = new NotificationBus();
        }
        return NotificationBus.instance;
    }

    public emitNotification(userId: string, data: any) {
        this.emit(`notification:${userId}`, data);
    }
}

export const notificationBus = NotificationBus.getInstance();
