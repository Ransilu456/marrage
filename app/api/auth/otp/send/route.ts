import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { type } = await req.json(); // 'EMAIL' or 'PHONE'

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
            where: { id: token.sub },
            data: {
                verificationOTP: otp,
                otpExpires: expires
            }
        });

        // Simulate sending
        console.log(`[SECURE] OTP for ${token.email} (${type}): ${otp}`);

        return NextResponse.json({
            success: true,
            message: `Verification code sent to your ${type.toLowerCase()}. (Simulated: ${otp})`
        });
    } catch (error) {
        console.error('OTP Send Error:', error);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
