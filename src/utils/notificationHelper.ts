import { prisma } from '@/src/infrastructure/db/prismaClient';
import { notificationBus } from '@/src/infrastructure/events/NotificationBus';

export interface NotificationData {
    userId: string;
    type: 'MESSAGE' | 'PROPOSAL' | 'PROPOSAL_ACCEPTED' | 'PROPOSAL_REJECTED' | 'FAVORITE' | 'INTEREST' | 'SYSTEM';
    title: string;
    message: string;
    link?: string;
}

/**
 * Create a notification and trigger real-time update via internal NotificationBus (SSE)
 */
export async function createNotification(data: NotificationData) {
    try {
        // 1. Save to database
        const notification = await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                link: data.link,
            },
        });

        // 2. Trigger real-time event via internal bus
        notificationBus.emitNotification(data.userId, {
            ...notification,
            id: notification.id,
            createdAt: notification.createdAt
        });

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

/**
 * Mark notification(s) as read
 */
export async function markNotificationAsRead(notificationId: string) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
    try {
        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
    try {
        await prisma.notification.delete({
            where: { id: notificationId },
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, limit: number = 20, unreadOnly: boolean = false) {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId,
                ...(unreadOnly ? { read: false } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        const unreadCount = await prisma.notification.count({
            where: { userId, read: false },
        });

        return { notifications, unreadCount };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
}
