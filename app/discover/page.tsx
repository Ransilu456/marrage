'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Search, MapPin, Loader2 } from 'lucide-react';

interface ProfileDTO {
    id: string;
    age: number;
    gender: string;
    bio: string;
    jobStatus: string;
    maritalStatus: string;
    location: string;
    photoUrl?: string;
}

export default function DiscoverPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profiles, setProfiles] = useState<ProfileDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        } else if (status === "authenticated") {
            fetchProfiles();
        }
    }, [status, router]);

    const fetchProfiles = async () => {
        try {
            const res = await fetch('/api/profiles');
            if (res.ok) {
                const data = await res.json();
                setProfiles(data.profiles || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-gray-200 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-8 py-12 md:py-24">
            <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase mb-4">
                        Discover <br />
                        <span className="text-gray-200">Personalities.</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                        {profiles.length} Curated Connections Found
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-gray-50 rounded-full border border-gray-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all">
                        <Search className="w-3.5 h-3.5" />
                        Search
                    </button>
                    <Link href="/profile" className="px-6 py-3 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                        My Office
                    </Link>
                </div>
            </header>

            {profiles.length === 0 ? (
                <div className="text-center py-24">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-200">Silence in the collective.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                    {profiles.map((profile, i) => (
                        <motion.div
                            key={profile.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group"
                        >
                            <Link href={`/chat/${profile.id}`}>
                                <div className="aspect-[4/5] bg-gray-50 rounded-[2.5rem] overflow-hidden mb-8 relative">
                                    {profile.photoUrl ? (
                                        <img src={profile.photoUrl} alt="Portrait" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-200 uppercase font-black tracking-tighter text-4xl">No Image</div>
                                    )}
                                    <div className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Heart className="w-4 h-4 fill-white" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                                                {profile.gender === 'Male' ? 'M' : 'F'}, {profile.age}
                                            </h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mt-1">
                                                {profile.jobStatus}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <MapPin className="w-3 h-3" />
                                            {profile.location || 'Local'}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed">
                                        {profile.bio || "Searching for a meaningful connection."}
                                    </p>
                                    <div className="pt-4 flex items-center gap-4">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 border border-gray-100 px-3 py-1 rounded-full">
                                            {profile.maritalStatus}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
