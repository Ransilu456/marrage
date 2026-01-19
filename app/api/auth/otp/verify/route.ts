import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function POST(req: NextRequest) {
    const token = await getToken({ req });
    if (!token || !token.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { otp, type } = await req.json(); // otp: string, type: 'EMAIL' | 'PHONE'

        const user = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { verificationOTP: true, otpExpires: true }
        });

        if (!user || user.verificationOTP !== otp) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
        }

        if (user.otpExpires && user.otpExpires < new Date()) {
            return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
        }

        // Update verification status
        const updateData: any = {
            verificationOTP: null,
            otpExpires: null,
        };

        if (type === 'EMAIL') updateData.emailVerified = true;
        if (type === 'PHONE') updateData.phoneVerified = true;

        // Auto-upgrade to VERIFIED if both (or just current depending on policy) are done
        // For this flow, let's say verification makes you "VERIFIED"
        updateData.accountStatus = 'VERIFIED';

        await prisma.user.update({
            where: { id: token.sub },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: `${type} verified successfully. Your account is now verified.`
        });
    } catch (error) {
        console.error('OTP Verify Error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
