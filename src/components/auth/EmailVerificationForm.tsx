import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

export function EmailVerificationForm() {
  const [isVerifying, setIsVerifying] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        toast({
          title: 'Error',
          description: 'Invalid verification link',
          variant: 'destructive',
        });
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error('Failed to verify email');
        }

        toast({
          title: 'Success',
          description: 'Your email has been verified. You can now log in.',
        });

        router.push('/auth/login');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to verify email. The link may have expired.',
          variant: 'destructive',
        });
        router.push('/auth/login');
      } finally {
        setIsVerifying(false);
      }
    }

    verifyEmail();
  }, [token, router]);

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p>Verifying your email...</p>
      </div>
    );
  }

  return null;
} 