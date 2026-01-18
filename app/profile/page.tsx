'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, User, MapPin, Briefcase, Calendar, Info, Camera, Save, Edit3, Loader2, AlertCircle } from 'lucide-react';

interface Profile {
    id: string;
    age: number;
    gender: string;
    bio: string;
    location: string;
    jobStatus: string;
    maritalStatus: string;
    photoUrl: string;
    jobCategory: string;
    contactDetails: string;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [globalError, setGlobalError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        age: 25,
        gender: '',
        bio: '',
        location: '',
        jobStatus: 'EMPLOYED',
        maritalStatus: 'SINGLE',
        photoUrl: '',
        jobCategory: '',
        contactDetails: ''
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchProfile();
        }
    }, [status]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            if (data.success && data.profile) {
                setProfile(data.profile);
                setFormData(data.profile);
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        setGlobalError(null);

        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.success) {
                setProfile(data.profile);
                setIsEditing(false);
                if (!profile) {
                    router.push('/discover');
                }
            } else {
                if (data.details) {
                    setErrors(data.details);
                } else {
                    setGlobalError(data.error || 'Failed to save profile');
                }
            }
        } catch (error) {
            console.error(error);
            setGlobalError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
        );
    }

    const showForm = !profile || isEditing;

    return (
        <div className="max-w-4xl mx-auto px-8 py-12 md:py-24">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8"
            >
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase mb-4">
                        {profile ? 'Personal' : 'Setup'} <br />
                        <span className="text-gray-200">Profile.</span>
                    </h1>
                </div>
                {profile && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <Edit3 className="w-4 h-4" />
                        Edit Details
                    </button>
                )}
            </motion.div>

            {globalError && (
                <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium">
                    <AlertCircle className="w-5 h-5" />
                    {globalError}
                </div>
            )}

            <AnimatePresence mode="wait">
                {showForm ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                {/* Age */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Age</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                                        className={`w-full minimal-input rounded-2xl px-6 py-4 outline-none ${errors.age ? 'border-rose-300' : ''}`}
                                    />
                                    {errors.age && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.age[0]}</p>}
                                </div>

                                {/* Gender */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gender</label>
                                    <select
                                        required
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full minimal-input rounded-2xl px-6 py-4 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.gender[0]}</p>}
                                </div>

                                {/* Work Status */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Professional Status</label>
                                    <select
                                        value={formData.jobStatus}
                                        onChange={e => setFormData({ ...formData, jobStatus: e.target.value })}
                                        className="w-full minimal-input rounded-2xl px-6 py-4 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="EMPLOYED">Employed</option>
                                        <option value="SELF_EMPLOYED">Self Employed</option>
                                        <option value="STUDENT">Student</option>
                                        <option value="UNEMPLOYED">Looking</option>
                                        <option value="RETIRED">Retired</option>
                                    </select>
                                </div>

                                {/* Marital Status */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Marital Status</label>
                                    <select
                                        value={formData.maritalStatus}
                                        onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })}
                                        className="w-full minimal-input rounded-2xl px-6 py-4 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="SINGLE">Single</option>
                                        <option value="DIVORCED">Divorced</option>
                                        <option value="WIDOWED">Widowed</option>
                                    </select>
                                </div>

                                {/* Photo URL */}
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Image URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://"
                                        value={formData.photoUrl}
                                        onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                                        className={`w-full minimal-input rounded-2xl px-6 py-4 outline-none ${errors.photoUrl ? 'border-rose-300' : ''}`}
                                    />
                                    {errors.photoUrl && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.photoUrl[0]}</p>}
                                </div>

                                {/* Location */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Location</label>
                                    <input
                                        type="text"
                                        placeholder="City, Country"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className={`w-full minimal-input rounded-2xl px-6 py-4 outline-none ${errors.location ? 'border-rose-300' : ''}`}
                                    />
                                    {errors.location && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.location[0]}</p>}
                                </div>

                                {/* Job Category */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Specific Occupation</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Design"
                                        value={formData.jobCategory}
                                        onChange={e => setFormData({ ...formData, jobCategory: e.target.value })}
                                        className={`w-full minimal-input rounded-2xl px-6 py-4 outline-none ${errors.jobCategory ? 'border-rose-300' : ''}`}
                                    />
                                    {errors.jobCategory && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.jobCategory[0]}</p>}
                                </div>

                                {/* Bio */}
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Biography</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Write something minimal..."
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        className={`w-full minimal-input rounded-2xl px-6 py-4 outline-none resize-none ${errors.bio ? 'border-rose-300' : ''}`}
                                    />
                                    {errors.bio && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.bio[0]}</p>}
                                </div>

                                {/* Contact */}
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Contact Identity</label>
                                    <input
                                        type="text"
                                        placeholder="Email or Phone"
                                        value={formData.contactDetails}
                                        onChange={e => setFormData({ ...formData, contactDetails: e.target.value })}
                                        className={`w-full minimal-input rounded-2xl px-6 py-4 outline-none ${errors.contactDetails ? 'border-rose-300' : ''}`}
                                    />
                                    {errors.contactDetails && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.contactDetails[0]}</p>}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-12">
                                {profile && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-8 py-5 border border-gray-100 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] bg-gray-900 text-white rounded-2xl py-5 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="display"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-24"
                    >
                        <div className="grid md:grid-cols-2 gap-16 items-start">
                            <div className="aspect-[4/5] bg-gray-50 rounded-[2.5rem] overflow-hidden">
                                {profile.photoUrl ? (
                                    <img src={profile.photoUrl} alt="Portrait" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-200 uppercase font-black tracking-tighter text-4xl">No Image</div>
                                )}
                            </div>

                            <div className="space-y-12">
                                <div>
                                    <h2 className="text-4xl font-bold tracking-tighter mb-2">{session?.user?.name}, {profile.age}</h2>
                                    <p className="text-rose-600 font-bold text-xs uppercase tracking-widest">{profile.jobCategory || profile.jobStatus}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Gender</p>
                                        <p className="font-bold text-gray-900">{profile.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                                        <p className="font-bold text-gray-900">{profile.maritalStatus}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Local</p>
                                        <p className="font-bold text-gray-900">{profile.location || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Work</p>
                                        <p className="font-bold text-gray-900 capitalize">{profile.jobStatus.toLowerCase()}</p>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-gray-100">
                                    <p className="text-gray-500 font-medium leading-relaxed italic text-lg">
                                        "{profile.bio || "Searching for a meaningful connection."}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact section */}
                        <div className="bg-gray-900 rounded-[2.5rem] p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-2">Secure Information</h3>
                                <p className="text-gray-400 font-medium text-sm">Visible only to confirmed matches.</p>
                            </div>
                            <div className="text-lg font-bold tracking-tight">
                                {profile.contactDetails || '—'}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
