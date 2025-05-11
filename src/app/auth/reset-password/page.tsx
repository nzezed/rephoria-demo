import { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your account',
};

interface ResetPasswordPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = searchParams.token;
  const email = searchParams.email;

  if (!token || typeof token !== 'string' || !email || typeof email !== 'string') {
    redirect('/auth/signin');
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Reset your password
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your new password for your Repload account.
          </p>
        </div>
        <ResetPasswordForm token={token} email={email} />
      </div>
    </div>
  );
} 