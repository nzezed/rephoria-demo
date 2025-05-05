'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCookie, setCookie } from 'cookies-next';
import { generateToken } from '@/lib/token';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [verificationLink, setVerificationLink] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Generate and set CSRF token when page loads
    const token = generateToken();
    setCookie('csrf_token', token, {
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });
    setCsrfToken(token);
  }, []);

  const handleResendVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      if (!data.verifyLink) {
        throw new Error('No verification link received');
      }

      setVerificationLink(data.verifyLink);
      setError('Verification link generated. Click the link below to verify your email.');
      setShowResendVerification(false);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!csrfToken) {
        throw new Error('Please refresh the page and try again');
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ 
          email, 
          password,
          csrfToken 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error === 'Please verify your email before logging in') {
          setShowResendVerification(true);
        }
        throw new Error(data.error);
      }
      
      // Redirect to dashboard on success
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/5 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#ff4f58]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#ff4f58]"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {showResendVerification && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-[#ff4f58] hover:text-[#ff4f58]/80 text-sm"
              >
                Resend verification email
              </button>
            </div>
          )}

          {verificationLink && (
            <div className="text-center">
              <a
                href={verificationLink}
                className="text-[#ff4f58] hover:text-[#ff4f58]/80 text-sm"
              >
                Click here to verify your email
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#ff4f58] hover:bg-[#ff4f58]/90 text-white px-4 py-2 rounded-lg font-semibold transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400">
          <Link href="/auth/forgot-password" className="hover:text-[#ff4f58]">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
} 