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
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <Title>Welcome to Rephoria</Title>
            <Text>Sign in to your account</Text>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Text>Email</Text>
              <TextInput
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Text>Password</Text>
              <TextInput
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <Text color="red" className="text-center">
                {error}
              </Text>
            )}

            <Flex justifyContent="between" className="space-x-4">
              <Button
                variant="secondary"
                onClick={() => router.push('/auth/signup')}
                type="button"
                className="w-full"
              >
                Create Account
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
              >
                Sign In
              </Button>
            </Flex>

            <div className="text-center">
              <Button
                variant="light"
                onClick={() => router.push('/auth/forgot-password')}
                type="button"
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