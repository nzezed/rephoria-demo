'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              Rephoria
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/auth/login" 
              className="text-white hover:text-gray-300 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="bg-[#ff4f58] hover:bg-[#ff4f58]/90 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 