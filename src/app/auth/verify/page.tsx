'use client';

import { Suspense } from 'react';
import { EmailVerificationForm } from '@/components/auth/EmailVerificationForm';

export default function VerifyEmailPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-sm text-muted-foreground">
            Please wait while we verify your email address...
          </p>
        </div>
        <Suspense fallback={
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p>Loading verification form...</p>
          </div>
        }>
          <EmailVerificationForm />
        </Suspense>
      </div>
    </div>
  );
} 