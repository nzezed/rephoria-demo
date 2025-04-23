'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Title,
  Text,
  TextInput,
  Button,
  Flex,
} from '@tremor/react';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  subdomain: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    subdomain: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Redirect to sign in page after successful registration
      router.push('/auth/signin?registered=true');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubdomainChange = (value: string) => {
    // Remove spaces and special characters, convert to lowercase
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, subdomain: sanitized });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="max-w-md w-full bg-gray-800 text-white">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <Title className="text-white">Create your account</Title>
            <Text className="text-gray-300">Get started with Rephoria</Text>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Text className="text-gray-300">Full Name</Text>
              <TextInput
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

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
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <Text className="text-gray-300">Organization Name</Text>
              <TextInput
                placeholder="Enter your organization name"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <Text className="text-gray-300">Subdomain</Text>
              <TextInput
                placeholder="your-organization"
                value={formData.subdomain}
                onChange={(e) => handleSubdomainChange(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              <Text className="text-xs text-gray-400 mt-1">
                Your dashboard will be available at {formData.subdomain || 'your-organization'}.rephoria.com
              </Text>
            </div>

            {error && (
              <Text color="red" className="text-center">
                {error}
              </Text>
            )}

            <Flex justifyContent="between" className="space-x-4">
              <Button
                variant="secondary"
                onClick={() => router.push('/auth/signin')}
                type="button"
                className="w-full bg-gray-700 text-white hover:bg-gray-600"
              >
                Sign In Instead
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Create Account
              </Button>
            </Flex>
          </form>
        </div>
      </Card>
    </main>
  );
} 