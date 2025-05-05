'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCookie } from 'cookies-next';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [verificationLink, setVerificationLink] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for CSRF token when component mounts
    const token = getCookie('csrf_token');
    if (token) {
      setCsrfToken(token as string);
    }
  }, []);

  const handleResendVerification = async () => {
    try {
      console.log('Attempting to resend verification for:', email);
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      if (!data.verifyLink) {
        console.error('No verification link in response:', data);
        throw new Error('No verification link received');
      }

      setVerificationLink(data.verifyLink);
      setError('Verification link generated. Click the link below to verify your email.');
      setShowResendVerification(false);
    } catch (err: any) {
      console.error('Error in handleResendVerification:', err);
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
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
        <p className="text-gray-400">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-900/50 rounded-md">
            {error}
            {showResendVerification && (
              <button
                type="button"
                onClick={handleResendVerification}
                className="ml-2 text-blue-400 hover:text-blue-300 underline"
              >
                Resend verification email
              </button>
            )}
            {verificationLink && (
              <div className="mt-2">
                <a
                  href={verificationLink}
                  className="text-blue-400 hover:text-blue-300 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Click here to verify your email
                </a>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-sm">
        <span className="text-gray-400">Don't have an account?</span>{' '}
        <Link
          href="/auth/register"
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Sign up
        </Link>
      </div>

      <div className="text-center">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Forgot password?
        </Link>
      </div>
    </div>
  );
} 