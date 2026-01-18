'use client';

import AuthForm from '@/app/components/AuthForm';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-200/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-200/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md relative">
                <AuthForm mode="register" />
                <div className="absolute -right-4 -bottom-4 w-full h-full border border-orange-200/50 rounded-3xl -z-10"></div>
            </div>
        </div>
    );
}
