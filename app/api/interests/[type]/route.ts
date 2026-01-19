import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const type = url.pathname.split('/').pop(); // 'received' or 'sent'

    try {
        const interests = await prisma.interest.findMany({
            where: type === 'received' ? { receiverId: token.sub } : { senderId: token.sub },
            include: {
                sender: {
                    include: {
                        profile: {
                            select: {
                                photoUrl: true,
                            }
                        }
                    }
                },
                receiver: {
                    include: {
                        profile: {
                            select: {
                                photoUrl: true,
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = interests.map(i => ({
            id: i.id,
            senderId: i.senderId,
            receiverId: i.receiverId,
            status: i.status as 'PENDING' | 'ACCEPTED' | 'DECLINED',
            message: i.message,
            createdAt: i.createdAt.toISOString(),
            senderName: i.sender.name,
            senderPhoto: i.sender.profile?.photoUrl,
            receiverName: i.receiver.name,
            receiverPhoto: i.receiver.profile?.photoUrl,
        }));

        return NextResponse.json({ success: true, interests: formatted });
    } catch (error) {
        console.error('Interest list error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
