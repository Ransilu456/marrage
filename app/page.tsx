'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ChevronRight, ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#111111]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-48 px-8 sm:px-16 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-12"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              The Art of Connection
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-[8rem] font-bold leading-[0.9] tracking-tighter mb-12"
          >
            MODERN <br />
            <span className="text-gray-200">MATCHING.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl text-lg font-medium text-gray-500 leading-relaxed mb-16"
          >
            A curated space for those ready for something real.
            Verified profiles, intelligent matching, and a design
            that respects your time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <Link
              href="/auth/register"
              className="px-12 py-5 bg-gray-900 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-black transition-all flex items-center gap-3"
            >
              Start Journey <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/discover"
              className="px-12 py-5 border border-gray-100 font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-gray-50 transition-all"
            >
              Explore Profiles
            </Link>
          </motion.div>
        </div>

        {/* Floating Accents */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -z-10 opacity-30 select-none pointer-events-none">
          <span className="text-[20rem] font-black text-gray-50 tracking-tighter -rotate-12 block">M</span>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 bg-gray-50/50 border-y border-gray-50">
        <div className="max-w-7xl mx-auto px-8 sm:px-16 grid md:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-rose-600 mb-8">Our Philosophy</h2>
            <p className="text-4xl font-bold tracking-tight leading-tight mb-8">
              Relationships are built on shared values, not just shared interests.
            </p>
            <p className="text-gray-500 font-medium leading-relaxed">
              We believe in quality over quantity. Our platform is designed to minimize noise and maximize
              genuine interaction between like-minded individuals.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[4/5] bg-white rounded-3xl border border-gray-100 flex flex-col justify-end p-8">
              <Heart className="w-8 h-8 text-rose-100 fill-rose-100 mb-4" />
              <h4 className="font-bold text-lg mb-2">Intentional</h4>
              <p className="text-sm text-gray-400 font-medium">Built for those looking for a life partner.</p>
            </div>
            <div className="aspect-[4/5] bg-gray-900 rounded-3xl flex flex-col justify-end p-8 text-white mt-12">
              <div className="w-12 h-1 bg-rose-600 mb-4" />
              <h4 className="font-bold text-lg mb-2">Private</h4>
              <p className="text-gray-400 text-sm font-medium">Your data and presence are always controlled by you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-48 text-center px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-5xl md:text-7xl font-bold tracking-tighter mb-12">FIND YOUR <br /> OTHER HALF.</h3>
          <Link
            href="/auth/register"
            className="inline-block px-16 py-6 bg-rose-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-full hover:bg-rose-700 transition-all shadow-xl shadow-rose-200"
          >
            Join the Collective
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-gray-50 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <span className="text-xl font-black uppercase tracking-tighter">Marrage</span>
            <p className="text-gray-400 text-sm mt-4 font-medium max-w-xs">
              Redefining the modern search for companionship through design and technology.
            </p>
          </div>
          <div className="flex gap-16">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Platform</span>
              <Link href="/discover" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Discover</Link>
              <Link href="/stories" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Stories</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Legal</span>
              <Link href="/privacy" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-12 border-t border-gray-50 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-300 uppercase letter-widest tracking-[0.2em]">© 2026 Collective</span>
          <div className="flex gap-6">
            <div className="w-5 h-5 bg-gray-100 rounded-full" />
            <div className="w-5 h-5 bg-gray-100 rounded-full" />
          </div>
        </div>
      </footer>
    </div>
  );
}
