'use client';

import { useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { generateToken } from '@/lib/token';
import { setCookie } from 'cookies-next';

export default function LoginPage() {
  useEffect(() => {
    // Generate and set CSRF token when page loads
    const csrfToken = generateToken();
    setCookie('csrf_token', csrfToken, {
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });
  }, []);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 