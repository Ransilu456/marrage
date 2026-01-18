'use client';

import { motion } from 'framer-motion';
import { Mail, Lock, Check, HeartHandshake, BadgeCheck, MapPin, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import AuthForm from './components/AuthForm';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <div className="bg-slate-50 min-h-screen">
      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-24">

        {/* SECTION 1: HERO & LOGIN UI */}
        <section className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center min-h-[80vh]">
          {/* Left: Hero Content */}
          <div className="space-y-8 relative">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl mix-blend-multiply filter"></div>
            <div className="absolute top-20 left-20 w-72 h-72 bg-orange-100/40 rounded-full blur-3xl mix-blend-multiply filter"></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                #1 Trusted Matrimony Platform
              </span>
              <h1 className="text-5xl lg:text-7xl font-serif text-slate-900 leading-[1.1] tracking-tight">
                {session ? (
                  <>Ready for your <span className="custom-gradient-text italic pr-2">next chapter?</span></>
                ) : (
                  <>Stories begin with a simple <span className="custom-gradient-text italic pr-2">hello.</span></>
                )}
              </h1>
              <p className="text-lg text-slate-500 max-w-md leading-relaxed mt-6">
                {session
                  ? `Welcome back, ${session.user?.name?.split(' ')[0] || 'User'}. Your perfect match could be just one expression away.`
                  : "Discover meaningful connections with verified profiles. We curate matches based on values, personality, and life goals."
                }
              </p>

              {session && (
                <div className="flex flex-wrap gap-4 mt-8">
                  <Link
                    href="/discover"
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-medium hover:bg-rose-600 transition-all shadow-lg shadow-slate-200 flex items-center gap-2 group"
                  >
                    Explore Matches
                    <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                  <Link
                    href="/profile"
                    className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-medium hover:border-slate-300 transition-all"
                  >
                    My Profile
                  </Link>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64",
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64",
                  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64"
                ].map((url, i) => (
                  <img key={i} src={url} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="" />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">+2k</div>
              </div>
              <span className="text-sm text-slate-500">Happy couples this month</span>
            </motion.div>
          </div>

          {/* Right: Login Card or Feature Showcase */}
          {!session ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative w-full max-w-md mx-auto lg:ml-auto"
            >
              <AuthForm mode="login" />
              <div className="absolute -right-4 -bottom-4 w-full h-full border border-rose-200 rounded-3xl -z-10"></div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                  <HeartHandshake size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-serif">Verified Matches</h4>
                  <p className="text-xs text-slate-500">Every profile is manually screened for authenticity.</p>
                </div>
              </div>
              <div className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 translate-y-8">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <BadgeCheck size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-serif">Secure Privacy</h4>
                  <p className="text-xs text-slate-500">Your data is encrypted and invisible to outsiders.</p>
                </div>
              </div>
              <div className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-serif">Local Discovery</h4>
                  <p className="text-xs text-slate-500">Find meaningful connections right in your city.</p>
                </div>
              </div>
              <div className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 translate-y-8">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                  <Check size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-serif">Easy Chat</h4>
                  <p className="text-xs text-slate-500">Start conversations with our seamless messenger.</p>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* Additional Sections could go here if needed, matching the resource */}
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-white">
              <HeartHandshake size={14} />
            </div>
            <span className="font-serif text-lg text-slate-900 font-medium">Eternity</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 Eternity Matrimony. Crafted with love.</p>
        </div>
      </footer>
    </div>
  );
}
