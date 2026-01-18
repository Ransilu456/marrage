
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getPusherClient } from '@/src/infrastructure/realtime/pusher';

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.formData();
    const socket_id = body.get('socket_id') as string;
    const channel_name = body.get('channel_name') as string;

    const pusher = getPusherClient();
    if (!pusher) {
        return NextResponse.json(
            { error: 'Real-time service not configured' },
            { status: 503 }
        );
    }

    const authResponse = pusher.authenticate(socket_id, channel_name, {
        user_id: token.sub,
        user_info: {
            name: token.name,
            email: token.email
        }
    });

    return NextResponse.json(authResponse);
}
