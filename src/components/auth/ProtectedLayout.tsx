'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for auth token
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          // Store the current path for redirect after login
          if (pathname !== '/auth/login') {
            sessionStorage.setItem('redirectPath', pathname);
          }
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  return <>{children}</>;
} 