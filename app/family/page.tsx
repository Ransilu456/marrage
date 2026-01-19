'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Users,
    UserPlus,
    Shield,
    Settings,
    ExternalLink,
    Loader2,
    Mail,
    User as UserIcon,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

interface FamilyData {
    managedBy: { id: string; name: string; email: string } | null;
    manages: Array<{ id: string; name: string; email: string }>;
}

export default function FamilyDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [data, setData] = useState<FamilyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [guardianEmail, setGuardianEmail] = useState('');
    const [linking, setLinking] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchFamilyData();
        }
    }, [status]);

    const fetchFamilyData = async () => {
        try {
            const res = await fetch('/api/family/guardian');
            const result = await res.json();
            if (result.success) {
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch family data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkGuardian = async (e: React.FormEvent) => {
        e.preventDefault();
        setLinking(true);
        setMessage(null);
        try {
            const res = await fetch('/api/family/guardian', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guardianEmail })
            });
            const result = await res.json();
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                fetchFamilyData();
                setGuardianEmail('');
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to link guardian' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error linking guardian' });
        } finally {
            setLinking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-[#fcf8f7] min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                            <Users size={24} />
                        </div>
                        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Family Sanctuary</h1>
                    </div>
                    <p className="text-slate-500 text-lg font-light tracking-tight max-w-2xl">
                        Manage your family trust network and profile responsibilities.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Guardian Section */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-xl shadow-rose-900/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>

                            <h2 className="text-xl font-serif text-slate-900 mb-8 flex items-center gap-2">
                                <Shield className="text-rose-500" size={20} />
                                Your Guardian
                            </h2>

                            {data?.managedBy ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400">
                                            <UserIcon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-lg text-slate-900 leading-none mb-1">{data.managedBy.name}</h3>
                                            <p className="text-slate-500 text-sm flex items-center gap-1.5 leading-none">
                                                <Mail size={12} /> {data.managedBy.email}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium italic">
                                        This user has permission to manage your profile and view interests on your behalf.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Designate a trusted family member or mentor to help manage your profile and vetting process.
                                    </p>

                                    <form onSubmit={handleLinkGuardian} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Guardian Email</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    required
                                                    value={guardianEmail}
                                                    onChange={e => setGuardianEmail(e.target.value)}
                                                    placeholder="guardian@example.com"
                                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl p-4 pl-12 outline-none focus:border-rose-500 transition-all"
                                                />
                                                <Mail className="absolute left-4 top-4 text-slate-400" size={18} />
                                            </div>
                                        </div>

                                        <button
                                            disabled={linking}
                                            className="w-full py-4 bg-slate-900 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {linking ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                            Link Guardian
                                        </button>
                                    </form>

                                    {message && (
                                        <div className={`flex items-center gap-2 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                            {message.text}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Managed Users Section */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-xl shadow-rose-900/5 min-h-[400px]">
                            <h2 className="text-xl font-serif text-slate-900 mb-8 flex items-center gap-2">
                                <Settings className="text-rose-500" size={20} />
                                Profiles You Manage
                            </h2>

                            {data?.manages && data.manages.length > 0 ? (
                                <div className="space-y-4">
                                    {data.manages.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:border-rose-200 hover:bg-rose-50/50 group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors">
                                                    <UserIcon size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-serif text-slate-900 font-medium leading-none mb-1">{user.name}</h3>
                                                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{user.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/family/manage/${user.id}`)}
                                                className="p-3 bg-white text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl border border-slate-100 shadow-sm transition-all hover:scale-110 active:scale-95"
                                                title="Manage Profile"
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                                        <Users size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-slate-900 font-serif text-lg">No charges yet</p>
                                        <p className="text-slate-400 text-sm max-w-xs font-light">
                                            When a family member links you as their guardian, their profile will appear here.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
