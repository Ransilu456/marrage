'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Loader2,
    Save,
    ArrowLeft,
    Camera,
    MapPin,
    Briefcase,
    Shield,
    Heart,
    User as UserIcon,
    ChevronDown
} from 'lucide-react';

interface ChargeProfile {
    id: string;
    name: string;
    email: string;
    profile: any;
}

export default function ManageChargeProfile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { chargeId } = useParams();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [chargeData, setChargeData] = useState<ChargeProfile | null>(null);
    const [formData, setFormData] = useState({
        dateOfBirth: '',
        gender: 'MALE',
        bio: '',
        location: '',
        jobStatus: 'EMPLOYED',
        maritalStatus: 'SINGLE',
        photoUrl: '',
        jobCategory: '',
        contactDetails: ''
    });
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchChargeProfile();
        }
    }, [status, chargeId]);

    const fetchChargeProfile = async () => {
        try {
            // Need to fetch individual user profile
            const res = await fetch(`/api/profile/${chargeId}`);
            const result = await res.json();

            // Note: The /api/profile/[userId] route might not exist or might need moderation/family checks
            // For now, let's assume we can fetch it if we are the guardian
            if (result.success && result.profile) {
                setChargeData({
                    id: chargeId as string,
                    name: 'Family Member', // Should ideally fetch from a user detail API
                    email: '',
                    profile: result.profile
                });

                setFormData({
                    dateOfBirth: result.profile.dateOfBirth ? new Date(result.profile.dateOfBirth).toISOString().split('T')[0] : '2000-01-01',
                    gender: result.profile.gender ?? 'MALE',
                    bio: result.profile.bio ?? '',
                    location: result.profile.location ?? '',
                    jobStatus: result.profile.jobStatus ?? 'EMPLOYED',
                    maritalStatus: result.profile.maritalStatus ?? 'SINGLE',
                    photoUrl: result.profile.photoUrl ?? '',
                    jobCategory: result.profile.jobCategory ?? '',
                    contactDetails: result.profile.contactDetails ?? '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch charge profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        setMessage(null);

        try {
            const res = await fetch('/api/family/charge/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chargeId,
                    profileData: formData
                })
            });

            const result = await res.json();
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
                if (result.details) setErrors(result.details);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error saving profile' });
        } finally {
            setSubmitting(false);
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
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Back Link */}
                <button
                    onClick={() => router.push('/family')}
                    className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-bold text-xs uppercase tracking-widest transition-colors mb-4 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-600/10">
                            <Shield size={24} />
                        </div>
                        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Guardian Oversight</h1>
                    </div>
                    <p className="text-slate-500 text-lg font-light tracking-tight">
                        You are managing the profile for <span className="font-medium text-slate-900 italic">User {chargeId?.slice(0, 8)}</span>
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-10">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-xl shadow-rose-900/5 space-y-10">
                        {/* 1. Identity */}
                        <div className="space-y-8">
                            <h2 className="text-xl font-serif text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                                <UserIcon className="text-rose-500" size={20} />
                                Profile Identity
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Photo URL</label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={formData.photoUrl}
                                            onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl p-4 pl-12 outline-none focus:border-rose-500 transition-all"
                                        />
                                        <Camera className="absolute left-4 top-4 text-slate-400" size={18} />
                                    </div>
                                    {errors.photoUrl && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-wider">{errors.photoUrl[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Location</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl p-4 pl-12 outline-none focus:border-rose-500 transition-all"
                                        />
                                        <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                                    </div>
                                    {errors.location && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-wider">{errors.location[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl p-4 outline-none focus:border-rose-500 transition-all"
                                    />
                                    {errors.dateOfBirth && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-wider">{errors.dateOfBirth[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Gender</label>
                                    <div className="relative">
                                        <select
                                            value={formData.gender}
                                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl p-4 outline-none focus:border-rose-500 transition-all"
                                        >
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-4 text-slate-400" size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Professional & Persona */}
                        <div className="space-y-8">
                            <h2 className="text-xl font-serif text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                                <Briefcase className="text-rose-500" size={20} />
                                Professional Persona
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Job Category / Headline</label>
                                    <input
                                        type="text"
                                        value={formData.jobCategory}
                                        onChange={e => setFormData({ ...formData, jobCategory: e.target.value })}
                                        placeholder="e.g., Software Engineer with a passion for art"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl p-4 outline-none focus:border-rose-500 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Marital Status</label>
                                    <div className="relative">
                                        <select
                                            value={formData.maritalStatus}
                                            onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })}
                                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl p-4 outline-none focus:border-rose-500 transition-all"
                                        >
                                            <option value="SINGLE">Never Married</option>
                                            <option value="DIVORCED">Divorced</option>
                                            <option value="WIDOWED">Widowed</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-4 text-slate-400" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Detailed Bio</label>
                                <textarea
                                    rows={5}
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Draft a compelling narrative..."
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl p-4 outline-none focus:border-rose-500 transition-all resize-none"
                                />
                                {errors.bio && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-wider">{errors.bio[0]}</p>}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-6">
                            <button
                                disabled={submitting}
                                className="px-12 py-4 bg-slate-900 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save Oversight
                            </button>

                            {message && (
                                <div className={`flex items-center gap-2 px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {message.text}
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
