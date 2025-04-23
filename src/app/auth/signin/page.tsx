'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Title,
  Text,
  TextInput,
  Button,
  Flex,
} from '@tremor/react';

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        ...formData,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="max-w-md w-full bg-gray-800 text-white">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <Title className="text-white">Welcome to Rephoria</Title>
            <Text className="text-gray-300">Sign in to your account</Text>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Text className="text-gray-300">Email</Text>
              <TextInput
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <Text className="text-gray-300">Password</Text>
              <TextInput
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            {error && (
              <Text color="red" className="text-center">
                {error}
              </Text>
            )}

            <Button
              type="submit"
              loading={isLoading}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Sign In
            </Button>

            <div className="space-y-4 text-center">
              <div>
                <Text className="text-gray-400">
                  Don't have an account?{' '}
                  <Button
                    variant="light"
                    onClick={() => router.push('/auth/signup')}
                    type="button"
                    className="text-indigo-400 hover:text-indigo-300 p-0"
                  >
                    Create one
                  </Button>
                </Text>
              </div>

              <Button
                variant="light"
                onClick={() => router.push('/auth/forgot-password')}
                type="button"
                className="text-gray-400 hover:text-gray-300"
              >
                Forgot password?
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </main>
  );
} 