'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Loader2, MapPin, Briefcase,
    Image as ImageIcon, Share2, Bookmark,
    BadgeCheck, Users, Sun, BookOpen, Coffee,
    Camera, Save, X, Edit3, User,
    SlidersHorizontal, ShieldCheck, LogOut,
    Eye, ChevronDown, Check, Trash2, UploadCloud,
    Plus
} from 'lucide-react';

interface ProfileData {
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
    const { data: session } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('edit-profile');
    const [isViewMode, setIsViewMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [generalError, setGeneralError] = useState('');

    const [formData, setFormData] = useState({
        age: 25,
        gender: 'MALE',
        bio: '',
        location: '',
        jobStatus: 'EMPLOYED',
        maritalStatus: 'SINGLE',
        photoUrl: '',
        jobCategory: '',
        contactDetails: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/profile');
            const data = await response.json();
            if (data.success && data.profile) {
                setProfile(data.profile);
                // Ensure no null values in formData
                setFormData({
                    age: data.profile.age ?? 25,
                    gender: data.profile.gender ?? 'MALE',
                    bio: data.profile.bio ?? '',
                    location: data.profile.location ?? '',
                    jobStatus: data.profile.jobStatus ?? 'EMPLOYED',
                    maritalStatus: data.profile.maritalStatus ?? 'SINGLE',
                    photoUrl: data.profile.photoUrl ?? '',
                    jobCategory: data.profile.jobCategory ?? '',
                    contactDetails: data.profile.contactDetails ?? '',
                });
                setIsViewMode(true);
            } else if (response.status === 404 || !data.profile) {
                setIsViewMode(false);
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        setErrors({});
        setGeneralError('');

        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.details) {
                    setErrors(data.details);
                    const firstErrorField = Object.keys(data.details)[0];
                    const element = document.getElementsByName(firstErrorField)[0];
                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    setGeneralError(data.error || 'Something went wrong');
                }
                return;
            }

            const isFirstTime = !profile;
            setProfile(data.profile);
            setIsViewMode(true);

            if (isFirstTime) {
                router.push('/discover');
            }
        } catch (error) {
            setGeneralError('Failed to save profile');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
            </div>
        );
    }

    const navItems = [
        { id: 'edit-profile', icon: Edit3, label: 'Edit Profile' },
        { id: 'photos', icon: ImageIcon, label: 'Photos' },
        { id: 'partner-prefs', icon: SlidersHorizontal, label: 'Partner Prefs' },
        { id: 'verification', icon: ShieldCheck, label: 'Verification' },
    ];

    const renderEditContent = () => (
        <div className="space-y-8 pb-32">
            {/* 1. Profile Photo & Cover */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-rose-100 to-orange-100 relative">
                    <button className="absolute top-4 right-4 bg-white/50 backdrop-blur-md hover:bg-white text-slate-600 p-2 rounded-lg text-xs font-medium border border-white/20 transition-all flex items-center gap-2">
                        <Camera size={14} /> Edit Cover
                    </button>
                </div>
                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col sm:flex-row items-end gap-6 -mt-12">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-slate-100">
                                <img
                                    src={formData.photoUrl || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300"}
                                    className="w-full h-full object-cover"
                                    alt="User"
                                />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-2xl cursor-pointer backdrop-blur-[2px]">
                                <Camera className="text-white" size={24} />
                            </div>
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 mb-2">
                            <h3 className="font-serif text-2xl text-slate-900 leading-none">{session?.user?.name || 'User'}</h3>
                            <p className="text-slate-500 text-sm mt-1">Member since 2026</p>
                        </div>
                        <div className="mb-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-100">
                                <BadgeCheck size={14} /> Verified Profile
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Basic Information */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-serif text-xl text-slate-900 tracking-tight">Basic Information</h3>
                    <button onClick={() => handleSubmit()} className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors">
                        Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">Age</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 block p-3.5 outline-none transition-all"
                        />
                        {errors.age && <p className="text-[10px] font-bold text-rose-500 uppercase mt-1">{errors.age[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">Gender Identity</label>
                        <div className="relative">
                            <select
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                            >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">Personal Headline</label>
                        <input
                            type="text"
                            name="jobCategory"
                            placeholder="Architect with a love for travel"
                            value={formData.jobCategory}
                            onChange={e => setFormData({ ...formData, jobCategory: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 block p-3.5 outline-none transition-all"
                        />
                        <div className="flex justify-between mt-1 px-1">
                            {errors.jobCategory ? (
                                <p className="text-[10px] font-bold text-rose-500 uppercase">{errors.jobCategory[0]}</p>
                            ) : (
                                <div></div>
                            )}
                            <p className="text-[10px] text-slate-400 font-medium">{(formData.jobCategory ?? '').length}/60 characters</p>
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">About Me</label>
                        <textarea
                            rows={5}
                            name="bio"
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 block p-4 outline-none transition-all resize-none shadow-sm placeholder:text-slate-400"
                            placeholder="Tell your unique story..."
                        />
                        {errors.bio && <p className="text-[10px] font-bold text-rose-500 uppercase mt-1">{errors.bio[0]}</p>}
                    </div>
                </div>
            </div>

            {/* 3. Personal Details */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h3 className="font-serif text-xl text-slate-900 tracking-tight mb-8">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">Marital Status</label>
                        <div className="relative">
                            <select
                                value={formData.maritalStatus}
                                onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                            >
                                <option value="SINGLE">Never Married</option>
                                <option value="DIVORCED">Divorced</option>
                                <option value="WIDOWED">Widowed</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">Current Profession</label>
                        <div className="relative">
                            <select
                                value={formData.jobStatus}
                                onChange={e => setFormData({ ...formData, jobStatus: e.target.value })}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                            >
                                <option value="EMPLOYED">Employed</option>
                                <option value="SELF_EMPLOYED">Self Employed</option>
                                <option value="STUDENT">Student</option>
                                <option value="RETIRED">Retired</option>
                                <option value="UNEMPLOYED">Other</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">Location</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="location"
                                placeholder="London, United Kingdom"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 block p-3.5 pl-11 outline-none transition-all"
                            />
                            <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                        </div>
                        {errors.location && <p className="text-[10px] font-bold text-rose-500 uppercase mt-1">{errors.location[0]}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">Connect Choice</label>
                        <input
                            type="text"
                            name="contactDetails"
                            placeholder="Email, LinkedIn, or Instagram handle"
                            value={formData.contactDetails}
                            onChange={e => setFormData({ ...formData, contactDetails: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 block p-3.5 outline-none transition-all"
                        />
                        {errors.contactDetails && <p className="text-[10px] font-bold text-rose-500 uppercase mt-1">{errors.contactDetails[0]}</p>}
                    </div>
                </div>
            </div>

            {/* 4. Photo Gallery */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-serif text-xl text-slate-900 tracking-tight">Photo Gallery</h3>
                    <button className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 hover:underline">
                        <Plus size={16} /> Add Photo
                    </button>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">Primary Photo URL</label>
                        <div className="relative">
                            <input
                                type="url"
                                name="photoUrl"
                                placeholder="https://images.unsplash.com/..."
                                value={formData.photoUrl}
                                onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 block p-3.5 pl-11 outline-none transition-all"
                            />
                            <Camera className="absolute left-4 top-4 text-slate-400" size={18} />
                        </div>
                        {errors.photoUrl && <p className="text-[10px] font-bold text-rose-500 uppercase mt-1">{errors.photoUrl[0]}</p>}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {formData.photoUrl && (
                            <div className="aspect-square rounded-2xl overflow-hidden relative group border-2 border-slate-100 shadow-md">
                                <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Primary" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[1px]">
                                    <button className="p-2.5 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                        <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-rose-500 bg-slate-50/50">
                            <UploadCloud size={32} strokeWidth={1} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Upload Photo</span>
                            <input type="file" className="hidden" />
                        </label>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium italic mt-4">Upload high-resolution photos to attract 3x more meaningful connections.</p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-5xl bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200 shadow-2xl flex items-center justify-between z-40 ring-1 ring-slate-900/5">
                <div className="hidden sm:block">
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 ml-4">
                        {submitting ? 'Weaving your destiny...' : `Soul Strength: ${(formData.bio ?? '').length > 50 ? 'Radiant' : 'Emerging'}`}
                    </span>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => setIsViewMode(true)}
                        className="flex-1 sm:flex-none px-8 py-3.5 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={() => handleSubmit()}
                        disabled={submitting}
                        className="flex-1 sm:flex-none px-10 py-3.5 bg-slate-900 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl hover:shadow-rose-500/30 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin text-white" /> : <Save size={16} />}
                        Save Eternity
                    </button>
                </div>
            </div>
        </div>
    );

    const renderViewContent = () => (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden min-h-[600px]">
            {profile && (
                <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
                    <div className="lg:col-span-2 bg-slate-50 p-8 lg:p-10 border-r border-slate-100">
                        <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative group">
                            <img
                                src={profile.photoUrl || "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&w=800&q=80"}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                alt="Profile"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                            <div className="absolute bottom-8 left-8 text-white">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-3xl font-serif tracking-tight">{session?.user?.name || 'User'}</h3>
                                    <BadgeCheck className="text-blue-400" size={24} />
                                </div>
                                <p className="text-white/80 text-sm font-medium tracking-wide items-center flex gap-1.5 leading-none">
                                    <MapPin size={14} className="text-white/60" /> {profile.location}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-3 p-10 lg:p-16 space-y-12 flex flex-col justify-center">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wider">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                                Verified Member
                            </div>
                            <h3 className="text-5xl font-serif text-slate-900 tracking-tighter leading-tight italic">
                                {profile.jobCategory}
                            </h3>
                            <div className="flex items-center gap-6 text-sm">
                                <span className="flex items-center gap-2 text-slate-600 font-medium tracking-tight">
                                    <Users size={16} className="text-rose-500" /> {profile.maritalStatus}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                <span className="flex items-center gap-2 text-slate-600 font-medium tracking-tight">
                                    <Sun size={16} className="text-rose-500" /> {profile.age} Years Old
                                </span>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 w-24" />

                        <div className="space-y-8" >
                            <div className="space-y-4" >
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400" >Her/His Story</h4 >
                                <p className="text-xl text-slate-600 leading-relaxed font-light italic" >
                                    "{profile.bio}"
                                </p >
                            </div >

                            <div className="grid grid-cols-2 gap-8" >
                                <div className="space-y-2" >
                                    <span className="block text-[10px] uppercase tracking-[0.2em] text-rose-400 font-black" >Profession</span >
                                    <span className="text-slate-800 font-serif text-lg tracking-tight" > {profile.jobStatus} </span >
                                </div >
                                <div className="space-y-2" >
                                    <span className="block text-[10px] uppercase tracking-[0.2em] text-rose-400 font-black" >Communication</span >
                                    <span className="text-slate-800 font-serif text-lg tracking-tight" > {profile.contactDetails} </span >
                                </div >
                            </div >
                        </div >

                        <div className="pt-8" >
                            <button className="px-10 py-4 bg-slate-900 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl transition-all shadow-2xl hover:shadow-rose-500/30 flex items-center gap-4 group" >
                                <Share2 size={16} className="group-hover:rotate-12 transition-transform" />
                                Share Journey
                            </button >
                        </div >
                    </div >
                </div >
            )}
        </div >
    );

    return (
        <div className="bg-[#fcf8f7] min-h-screen Selection:bg-rose-200 Selection:text-rose-900" >
            <main className="max-w-7xl mx-auto px-6 py-20 space-y-16" >

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-rose-100/50" >
                    <div className="space-y-4" >
                        <div className="flex items-center gap-3" >
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg" >
                                <Heart size={20} className="fill-rose-500 text-rose-500" />
                            </div >
                            <h1 className="text-2xl font-serif text-slate-900 tracking-tight" > Eternity Profile </h1 >
                        </div >
                        <div className="space-y-1" >
                            <h2 className="text-5xl font-serif text-slate-900 tracking-tighter" >
                                {!profile ? 'Begin Your Story' : (isViewMode ? 'Public Presence' : 'Soul Identity')}
                            </h2 >
                            <p className="text-slate-500 text-lg font-light tracking-tight max-w-xl" >
                                {!profile
                                    ? 'Step into a world of meaningful connections and lifetime stories.'
                                    : (isViewMode ? 'This is how your radiance is reflected to the community.' : 'Refine your essence to attract your perfect cosmic match.')
                                }
                            </p >
                        </div >
                    </div >
                    <button
                        onClick={() => setIsViewMode(!isViewMode)}
                        className="group flex items-center gap-3 px-6 py-3.5 bg-white border border-rose-100 rounded-2xl text-rose-600 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm hover:shadow-md"
                    >
                        {isViewMode ? <Edit3 size={16} className="group-hover:scale-110 transition-transform" /> : <Eye size={16} className="group-hover:scale-110 transition-transform" />}
                        {isViewMode ? 'Edit Soul Identity' : 'View Public Presence'}
                    </button >
                </div >

                <div className="flex flex-col lg:flex-row gap-12" >

                    {/* Settings Sidebar */}
                    <AnimatePresence>
                        {!isViewMode && (
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                className="w-full lg:w-72 flex-shrink-0"
                            >
                                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl shadow-rose-900/5 p-3 sticky top-28 ring-1 ring-slate-900/5" >
                                    <nav className="space-y-1.5" >
                                        {navItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === item.id
                                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                                    : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                                                    }`}
                                            >
                                                <item.icon size={18} strokeWidth={item.id === activeTab ? 2.5 : 2} />
                                                {item.label}
                                            </button >
                                        ))}
                                        <div className="my-4 h-px bg-slate-100 mx-4" />
                                        <button
                                            onClick={() => signOut()}
                                            className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 hover:bg-red-50 hover:text-red-600 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
                                        >
                                            <LogOut size={18} strokeWidth={2.5} />
                                            Sign Out
                                        </button >
                                    </nav >
                                </div >
                            </motion.div >
                        )}
                    </AnimatePresence>

                    {/* Main Content Area */}
                    <div className="flex-1" >
                        <AnimatePresence mode="wait" >
                            {isViewMode ? (
                                <motion.div
                                    key="view-mode"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                >
                                    {renderViewContent()}
                                </motion.div >
                            ) : (
                                <motion.div
                                    key="edit-mode"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 30 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                >
                                    <AnimatePresence mode="wait" >
                                        {activeTab === 'edit-profile' ? (
                                            <motion.div
                                                key="edit-tab"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                            >
                                                {renderEditContent()}
                                            </motion.div >
                                        ) : (
                                            <motion.div
                                                key="other-tab"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="bg-white rounded-[2rem] border border-slate-200 p-20 text-center space-y-6"
                                            >
                                                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto" >
                                                    <Sun size={40} className="text-rose-400 animate-pulse" />
                                                </div >
                                                <div className="space-y-2" >
                                                    <h3 className="text-2xl font-serif text-slate-900" > Feature Illuminating Soon </h3 >
                                                    <p className="text-slate-400 font-light" > We are refining this essence to provide the most premium experience. </p >
                                                </div >
                                                <button
                                                    onClick={() => setActiveTab('edit-profile')}
                                                    className="inline-flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-[0.2em] hover:text-rose-700 underline underline-offset-8"
                                                >
                                                    Return to Soul Identity
                                                </button >
                                            </motion.div >
                                        )}
                                    </AnimatePresence>
                                </motion.div >
                            )}
                        </AnimatePresence>
                    </div >
                </div >
            </main >
        </div>
    );
}
