'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
 const [mobileOpen, setMobileOpen] = useState(false);

 return (
 <nav className="fixed inset-x-0 top-0 z-50 bg-[#0D1B3E] border-b border-white/20">
 <div className="max-w-7xl mx-auto px-6 py-4">
 <div className="flex items-center justify-between">
 <Link href="/" className="flex items-center gap-3">
 <div 
 className="w-8 h-8 rounded-xl flex items-center justify-center"
 style={{ background: 'linear-gradient(135deg, #C9973A, #E8B86D)' }}
 >
 <span className="text-sm font-extrabold text-[#0D1B3E]">C</span>
 </div>
 <span className="text-sm font-extrabold text-white tracking-tight">
 Careified
 </span>
 </Link>

 <div className="hidden lg:flex items-center gap-1">
 <Link href="/for-agencies" className="text-[13px] font-medium text-white/55 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all">
 For Agencies
 </Link>
 <Link href="/for-caregivers" className="text-[13px] font-medium text-white/55 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all">
 For Caregivers
 </Link>
 <Link href="/for-families" className="text-[13px] font-medium text-white/55 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all">
 For Families
 </Link>
 <Link href="/about" className="text-[13px] font-medium text-white/55 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all">
 About
 </Link>
 <Link href="/contact" className="text-[13px] font-medium text-white/55 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all">
 Contact
 </Link>
 </div>

 <div className="hidden lg:flex items-center gap-3">
 <Link href="/sign-in" className="text-[12px] font-medium px-4 py-2 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all">
 Sign in
 </Link>
 <Link href="/sign-up" className="text-[12px] font-bold px-4 py-2 rounded-lg text-[#0D1B3E] hover:opacity-90 transition-all" style={{ background: 'linear-gradient(135deg, #C9973A, #E8B86D)' }}>
 Get started free
 </Link>
 </div>

 <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white/70 hover:text-white rounded-lg">
 {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
 </button>
 </div>
 </div>
 </nav>
 );
}
